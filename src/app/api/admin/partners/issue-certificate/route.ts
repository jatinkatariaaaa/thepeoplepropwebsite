import { getAdminUser, logAudit } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      user_id,
      trader_name,
      kind,
      program_key,
      account_size,
      phase_index,
      amount,
      title,
      statement,
      highlight_label,
      highlight_value,
      period_label,
      note,
    } = body;

    // Validate required fields
    if (!user_id || !trader_name || !kind) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, trader_name, and kind are required' },
        { status: 400 }
      );
    }

    const validKinds = ['phase_pass', 'funded', 'payout', 'highest_payout', 'award'];
    if (!validKinds.includes(kind)) {
      return NextResponse.json(
        { error: `Invalid kind. Must be one of: ${validKinds.join(', ')}` },
        { status: 400 }
      );
    }

    // Generate certificate number
    const number = 'TPP-' + crypto.randomUUID().substring(0, 8).toUpperCase();

    const { data: cert, error: insertError } = await supabaseAdmin
      .from('certificates')
      .insert({
        number,
        kind,
        user_id,
        trader_name,
        source: 'admin',
        issued_by: admin.user.id,
        program_key: program_key || null,
        account_size: account_size || null,
        phase_index: phase_index || null,
        amount: amount || null,
        title: title || null,
        statement: statement || null,
        highlight_label: highlight_label || null,
        highlight_value: highlight_value || null,
        period_label: period_label || null,
        note: note || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error issuing certificate:', insertError);
      return NextResponse.json(
        { error: 'Failed to issue certificate', details: insertError.message },
        { status: 500 }
      );
    }

    await logAudit({
      admin_id: admin.user.id,
      action: 'issue_certificate',
      target_type: 'certificate',
      target_id: cert.id,
      metadata: {
        number: cert.number,
        kind: cert.kind,
        user_id: cert.user_id,
        trader_name: cert.trader_name,
      },
    });

    return NextResponse.json({ certificate: cert }, { status: 201 });
  } catch (error: any) {
    console.error('Issue certificate error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: certificates, error: certsError } = await supabaseAdmin
      .from('certificates')
      .select('*')
      .order('issued_at', { ascending: false });

    if (certsError) {
      console.error('Error fetching certificates:', certsError);
      return NextResponse.json(
        { error: 'Failed to fetch certificates' },
        { status: 500 }
      );
    }

    // Fetch profiles for user lookup
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, display_name');

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return NextResponse.json(
        { error: 'Failed to fetch profiles' },
        { status: 500 }
      );
    }

    const profilesMap: Record<string, { email: string; display_name: string | null }> = {};
    for (const p of profiles || []) {
      profilesMap[p.id] = { email: p.email, display_name: p.display_name };
    }

    const enrichedCertificates = (certificates || []).map((cert) => ({
      ...cert,
      user_email: profilesMap[cert.user_id]?.email || null,
      user_display_name: profilesMap[cert.user_id]?.display_name || null,
    }));

    return NextResponse.json({ certificates: enrichedCertificates });
  } catch (error: any) {
    console.error('Get certificates error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
