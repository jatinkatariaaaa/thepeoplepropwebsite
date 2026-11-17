import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { logAudit, requireRole } from "@/lib/admin-auth";
import { PROGRAM_ORDER, generalFaqs, programDetails } from "@/data/catalogue";

/**
 * Replaces tpp_faqs with the catalogue's questions: the general ones, then one
 * set per account type. Run it once after a deploy that changes the catalogue;
 * after that the rows can be edited freely in Admin → FAQs.
 */
export async function POST(request: Request) {
  try {
    const admin = await requireRole(request, ["super_admin", "marketing"]);

    let order = 0;
    const rows = [
      ...generalFaqs.map((f) => ({ question: f.q, answer: f.a, category: f.category ?? "General", program_key: null as string | null, sort_order: ++order, is_active: true })),
      ...PROGRAM_ORDER.flatMap((key) => programDetails[key].faqs.map((f) => ({ question: f.q, answer: f.a, category: programDetails[key].name, program_key: key as string | null, sort_order: ++order, is_active: true }))),
    ];

    const { error: deleteError } = await supabaseAdmin.from("tpp_faqs").delete().not("id", "is", null);
    if (deleteError) throw deleteError;
    const { error } = await supabaseAdmin.from("tpp_faqs").insert(rows);
    if (error) throw error;

    await logAudit({ adminId: admin.user.id, adminEmail: admin.email, action: "faqs_synced", entityType: "faq", newValue: { count: rows.length }, request });
    return NextResponse.json({ success: true, count: rows.length });
  } catch (error) {
    const message = (error as Error).message || "Internal server error";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500 });
  }
}
