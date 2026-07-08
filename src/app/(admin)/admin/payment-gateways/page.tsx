import { supabaseAdmin } from "@/lib/supabase";
import { PaymentGatewaysClient } from "./PaymentGatewaysClient";

export const revalidate = 0;

export default async function AdminPaymentGatewaysPage() {
  const { data: gateways, error } = await supabaseAdmin
    .from("payment_gateway_settings")
    .select("*")
    .order("gateway", { ascending: true });

  if (error) {
    console.error("Error fetching gateways:", error);
  }

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-[var(--ink-950)] mb-2">Payment Gateway Settings</h1>
        <p className="text-[var(--ink-500)]">Configure API keys, webhooks, and payment methods for each gateway.</p>
      </div>

      <PaymentGatewaysClient initialGateways={gateways || []} />
    </div>
  );
}
