import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function getAdminUser(request?: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Supabase not configured (e.g. preview) — treat as unauthenticated.
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Unauthorized');
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }

  // Check admin_roles
  const { data: adminRole } = await supabaseAdmin
    .from('admin_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (adminRole) {
    return { user, role: adminRole.role, email: user.email || '' };
  }

  // Fallback to profiles.is_admin
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (profile?.is_admin) {
    return { user, role: 'super_admin', email: user.email || '' };
  }

  throw new Error('Forbidden');
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
