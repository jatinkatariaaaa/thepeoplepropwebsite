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
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out">
      <div className="mb-8">
        <h1 className="mb-1 text-xl font-semibold tracking-tight text-ink sm:text-2xl">Payment Gateway Settings</h1>
        <p className="text-[var(--ink-500)]">Configure API keys, webhooks, and payment methods for each gateway.</p>
      </div>

      <PaymentGatewaysClient initialGateways={gateways || []} />
    </div>
  );
}
