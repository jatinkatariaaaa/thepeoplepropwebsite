import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { programs } from "@/data/programs";

export async function GET() {
  try {
    for (const prog of programs) {
      // Insert program
      const { data: programData, error: progError } = await supabaseAdmin
        .from("tpp_programs")
        .upsert({
          key: prog.key,
          label: prog.label,
          short_label: prog.shortLabel,
          tagline: prog.tagline,
          badge: prog.badge || null,
          phases: prog.phases,
          profit_split: prog.profitSplit,
          profit_split_max: prog.profitSplitMax,
          payout_cycle: prog.payoutCycle,
          profit_target: prog.profitTarget,
          daily_drawdown: prog.dailyDrawdown,
          max_drawdown: prog.maxDrawdown,
          min_trading_days: prog.minTradingDays,
          consistency_rule: prog.consistencyRule,
          highlights: prog.highlights,
          is_active: true
        }, { onConflict: "key" })
        .select()
        .single();

      if (progError) {
        console.error("Error inserting program:", prog.key, progError);
        continue;
      }

      // Insert fees
      if (prog.fees) {
        for (const [sizeStr, fee] of Object.entries(prog.fees)) {
          const size = parseInt(sizeStr);
          await supabaseAdmin
            .from("tpp_program_fees")
            .upsert({
              program_key: prog.key,
              account_size: size,
              fee: fee
            }, { onConflict: "program_key,account_size" });
        }
      }
    }

    return NextResponse.json({ success: true, message: "Programs seeded to Supabase" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
