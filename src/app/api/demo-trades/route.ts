import { getAdminUser, logAudit } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      trading_account_id,
      symbol,
      direction,
      volume,
      open_price,
      close_price,
      open_time,
      close_time,
      stop_loss,
      take_profit,
      reason,
      gross_pnl,
    } = body;

    // Validate required fields
    if (
      !trading_account_id ||
      !symbol ||
      !direction ||
      !volume ||
      open_price === undefined ||
      open_price === null ||
      close_price === undefined ||
      close_price === null ||
      !open_time ||
      !reason ||
      gross_pnl === undefined ||
      gross_pnl === null
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate direction
    if (!['buy', 'sell'].includes(direction)) {
      return NextResponse.json(
        { error: 'Direction must be "buy" or "sell"' },
        { status: 400 }
      );
    }

    // Validate reason
    if (!['tp', 'sl', 'manual', 'breach', 'manual_partial'].includes(reason)) {
      return NextResponse.json(
        { error: 'Invalid close reason' },
        { status: 400 }
      );
    }

    // Validate volume > 0
    if (Number(volume) <= 0) {
      return NextResponse.json(
        { error: 'Volume must be greater than 0' },
        { status: 400 }
      );
    }

    // Look up trading_accounts to get terminal_account_id
    const { data: tradingAccount, error: taError } = await supabaseAdmin
      .from('trading_accounts')
      .select('terminal_account_id')
      .eq('id', trading_account_id)
      .single();

    if (taError || !tradingAccount) {
      return NextResponse.json(
        { error: 'Trading account not found' },
        { status: 404 }
      );
    }

    const terminalAccountId = tradingAccount.terminal_account_id;

    // Verify terminal_account_id exists in accounts table
    const { data: account, error: accError } = await supabaseAdmin
      .from('accounts')
      .select('id')
      .eq('id', terminalAccountId)
      .single();

    if (accError || !account) {
      return NextResponse.json(
        { error: 'Terminal account not found. The trading account has no valid linked terminal account.' },
        { status: 404 }
      );
    }

    // Calculate commission and net P/L
    const commission = Number(volume) * 6;
    const net_pnl = Number(gross_pnl) - commission;

    // Insert trade record
    const { data: trade, error: insertError } = await supabaseAdmin
      .from('trades')
      .insert({
        account_id: terminalAccountId,
        symbol: symbol.toUpperCase(),
        direction,
        volume: Number(volume),
        open_price: Number(open_price),
        close_price: Number(close_price),
        open_time,
        close_time: close_time || new Date().toISOString(),
        gross_pnl: Number(gross_pnl),
        commission,
        swap: 0,
        net_pnl,
        reason,
        is_demo: true,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting demo trade:', insertError);
      return NextResponse.json(
        { error: 'Failed to create trade record', details: insertError.message },
        { status: 500 }
      );
    }

    // Log audit
    await logAudit(
      admin.id,
      'demo_trade_created',
      'trades',
      trade.id,
      null,
      {
        trading_account_id,
        terminal_account_id: terminalAccountId,
        symbol: symbol.toUpperCase(),
        direction,
        volume: Number(volume),
        open_price: Number(open_price),
        close_price: Number(close_price),
        gross_pnl: Number(gross_pnl),
        commission,
        net_pnl,
        reason,
        is_demo: true,
      }
    );

    return NextResponse.json({ success: true, trade });
  } catch (error: any) {
    console.error('Demo trade creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
