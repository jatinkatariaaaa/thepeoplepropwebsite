import { supabaseAdmin } from "@/lib/supabase";
import { AdminFaqsClient } from "./AdminFaqsClient";

export const revalidate = 0;

export default async function AdminFaqsPage() {
  const { data: faqs, error } = await supabaseAdmin
    .from("tpp_faqs")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold text-[var(--ink-950)] mb-2">FAQ Management</h1>
          <p className="text-[var(--ink-500)]">Manage the Frequently Asked Questions shown on your website.</p>
        </div>
      </div>

      <AdminFaqsClient initialFaqs={faqs || []} />
    </div>
  );
}
