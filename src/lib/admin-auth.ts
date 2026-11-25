import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import type { AdminRole } from '@/lib/admin-context';

/**
 * The one admin rule for the site. The admin panel, its API routes and the dashboard's "Admin panel"
 * button all ask this, so whoever can open /admin also gets the button.
 *
 * Access lives in admin_roles. profiles.is_admin mirrors it: database triggers keep the two in step
 * (supabase/migrations/20261123130916_unify_admin_access.sql), so there is one kind of admin and a bare
 * is_admin counts as super_admin. Returns null for everyone else. Throws when the lookup itself fails,
 * so a database error never reads as "not an admin" or the other way round.
 */
export async function getAdminRole(userId: string): Promise<AdminRole | null> {
  const [role, profile] = await Promise.all([
    supabaseAdmin.from('admin_roles').select('role').eq('user_id', userId).maybeSingle(),
    supabaseAdmin.from('profiles').select('is_admin').eq('id', userId).maybeSingle(),
  ]);
  if (role.error || profile.error) throw new Error('Unable to verify admin role');
  if (role.data?.role) return role.data.role as AdminRole;
  return profile.data?.is_admin === true ? 'super_admin' : null;
}

export async function getAdminUser(request?: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }

  const role = await getAdminRole(user.id);
  if (!role) throw new Error('Forbidden');
  return { user, role, email: user.email || '' };
}

export async function requireRole(request: Request, allowedRoles: string[]) {
  const admin = await getAdminUser(request);
  if (!allowedRoles.includes(admin.role) && admin.role !== 'super_admin') {
    throw new Error('Forbidden');
  }
  return admin;
}

export async function logAudit(params: {
  adminId: string;
  adminEmail: string;
  action: string;
  entityType: string;
  entityId?: string;
  oldValue?: any;
  newValue?: any;
  request?: Request;
}) {
  let ipAddress = '';
  let userAgent = '';

  if (params.request) {
    ipAddress = params.request.headers.get('x-forwarded-for') || '';
    userAgent = params.request.headers.get('user-agent') || '';
  }

  await supabaseAdmin.from('audit_logs').insert({
    admin_id: params.adminId,
    admin_email: params.adminEmail,
    action: params.action,
    entity_type: params.entityType,
    entity_id: params.entityId,
    old_value: params.oldValue ? JSON.parse(JSON.stringify(params.oldValue)) : null,
    new_value: params.newValue ? JSON.parse(JSON.stringify(params.newValue)) : null,
    ip_address: ipAddress,
    user_agent: userAgent
  });
}
