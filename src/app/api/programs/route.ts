import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createSupabaseServiceClient();
    
    // Fetch active programs and their fees
    const { data: programs, error } = await supabase
      .from("tpp_programs")
      .select("*, tpp_program_fees(account_size, fee)")
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching programs:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ programs });
  } catch (error: any) {
    console.error("Programs API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
