import { supabaseAdmin } from "@/lib/supabase";
import { AdminFaqsClient } from "./AdminFaqsClient";

export const revalidate = 0;

export default async function AdminFaqsPage() {
  const { data: faqs, error } = await supabaseAdmin
    .from("tpp_faqs")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="mb-1 text-xl font-semibold tracking-tight text-ink sm:text-2xl">FAQ Management</h1>
          <p className="text-[var(--ink-500)]">Manage the Frequently Asked Questions shown on your website.</p>
        </div>
      </div>

      <AdminFaqsClient initialFaqs={faqs || []} />
    </div>
  );
}
