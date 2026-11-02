"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DollarSign, CircleAlert as AlertCircle, Clock, CircleCheck as CheckCircle, Circle as XCircle, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { Chip, Notice, Panel, PanelHead, SelectChevron, btn, field, fieldLabel, selectField, table } from "@/components/dashboard/glass";

const PAYMENT_METHODS = [
  { value: "usdt_trc20", label: "USDT (TRC20)", type: "crypto", placeholder: "TRC20 wallet address" },
  { value: "usdt_erc20", label: "USDT (ERC20)", type: "crypto", placeholder: "ERC20 wallet address" },
  { value: "usdt_bep20", label: "USDT (BEP20 / BSC)", type: "crypto", placeholder: "BEP20 wallet address" },
  { value: "btc", label: "Bitcoin (BTC)", type: "crypto", placeholder: "BTC wallet address" },
  { value: "eth", label: "Ethereum (ETH)", type: "crypto", placeholder: "ETH wallet address" },
  { value: "bank_transfer", label: "Bank Transfer", type: "bank", placeholder: "Bank account details (Name, Account #, IFSC/SWIFT, Bank)" },
] as const;

type FundedAccount = {
  id: string;
  balance: number;
  starting_balance: number;
};

type PayoutRow = {
  id: string;
  account_id: string;
  amount: number | string;
  payment_method?: string | null;
  payment_details?: string | null;
  crypto_address?: string | null;
  status?: string | null;
  created_at: string;
};

export function PayoutsClient({ fundedAccounts, initialPayouts }: { fundedAccounts: FundedAccount[], initialPayouts: PayoutRow[] }) {
  const router = useRouter();
  const [payouts] = useState(initialPayouts);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("usdt_trc20");
  const [paymentDetails, setPaymentDetails] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedAccount = fundedAccounts.find(a => a.id === selectedAccountId);
  const maxProfit = selectedAccount ? Math.max(0, selectedAccount.balance - selectedAccount.starting_balance) : 0;

  const selectedMethod = PAYMENT_METHODS.find(m => m.value === paymentMethod);
  const isCrypto = selectedMethod?.type === "crypto";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedAccountId) return setError("Please select an account.");
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return setError("Please enter a valid amount.");
    if (Number(amount) > maxProfit) return setError(`Amount exceeds maximum withdrawable profit ($${maxProfit.toLocaleString()}).`);
    if (!paymentMethod) return setError("Please select a payment method.");
    if (!paymentDetails) return setError(isCrypto ? "Please enter your wallet address." : "Please enter your bank account details.");

    setLoading(true);
    try {
      const res = await fetch("/api/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: selectedAccountId,
          amount: Number(amount),
          paymentMethod,
          paymentDetails,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to request payout");
      }

      setAmount("");
      setPaymentDetails("");
      setPaymentMethod("usdt_trc20");
      setSelectedAccountId("");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const methodLabel = (value: string) => PAYMENT_METHODS.find(m => m.value === value)?.label || value;

  return (
    <div className="space-y-6">
      {/* Request Form */}
      <Panel>
        <PanelHead title="Request New Payout" />

        <div className="p-5 sm:p-6">
          {fundedAccounts.length === 0 ? (
            <Notice tone="amber" icon={AlertCircle}>
              <p className="font-medium">You need an active funded account to request a payout.</p>
            </Notice>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Notice tone="red">
                  {error}
                </Notice>
              )}

              <div>
                <label className={fieldLabel}>Select Funded Account</label>
                <div className="relative">
                  <select
                    value={selectedAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    className={cn(field(), selectField)}
                  >
                    <option value="">-- Choose Account --</option>
                    {fundedAccounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        ${Number(acc.starting_balance).toLocaleString()} Funded ({acc.id.substring(0,8)}) - Profit: ${Math.max(0, acc.balance - acc.starting_balance).toLocaleString()}
                      </option>
                    ))}
                  </select>
                  <SelectChevron />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className={fieldLabel}>Amount (USD)</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <DollarSign className="h-4 w-4 text-black/40" />
                    </div>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      max={maxProfit}
                      placeholder="0.00"
                      className={cn(field(), "g-num pl-10")}
                    />
                  </div>
                  {selectedAccountId && (
                    <p className="mt-1.5 text-xs text-[var(--g-muted-ink)]">
                      Max available: ${maxProfit.toLocaleString()}
                    </p>
                  )}
                </div>

                <div>
                  <label className={fieldLabel}>Payment Method</label>
                  <div className="relative">
                    <select
                      value={paymentMethod}
                      onChange={(e) => { setPaymentMethod(e.target.value); setPaymentDetails(""); }}
                      className={cn(field(), selectField)}
                    >
                      {PAYMENT_METHODS.map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                    <SelectChevron />
                  </div>
                </div>
              </div>

              <div>
                <label className={fieldLabel}>
                  {isCrypto ? `${selectedMethod?.label} Address` : "Bank Account Details"}
                </label>
                {isCrypto ? (
                  <input
                    type="text"
                    value={paymentDetails}
                    onChange={(e) => setPaymentDetails(e.target.value)}
                    placeholder={selectedMethod?.placeholder}
                    className={cn(field(), "font-mono text-sm")}
                  />
                ) : (
                  <textarea
                    value={paymentDetails}
                    onChange={(e) => setPaymentDetails(e.target.value)}
                    placeholder={selectedMethod?.placeholder}
                    rows={3}
                    className={cn(field(), "h-auto py-3 text-sm")}
                  />
                )}
              </div>

              <button type="submit" disabled={loading || !selectedAccountId} className={cn(btn.lime, "w-full")}>
                {loading ? "Processing..." : "Submit Payout Request"}
              </button>
            </form>
          )}
        </div>
      </Panel>

      {/* History */}
      <Panel className="overflow-hidden">
        <PanelHead title="Payout History" />

        <div className={table.scroll}>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className={table.headRow}>
                <th className={table.th}>ID</th>
                <th className={table.th}>Account</th>
                <th className={table.th}>Amount</th>
                <th className={table.th}>Method</th>
                <th className={table.th}>Details</th>
                <th className={table.th}>Status</th>
                <th className={table.th}>Date</th>
              </tr>
            </thead>
            <tbody className="text-[var(--g-ink)]">
              {payouts.map((payout) => (
                <tr key={payout.id} className={table.row}>
                  <td className={cn(table.td, "font-mono text-xs")}>{payout.id.substring(0, 8)}</td>
                  <td className={cn(table.td, "font-mono text-xs")}>{payout.account_id.substring(0, 8)}</td>
                  <td className={cn(table.td, "g-num font-semibold")}>${Number(payout.amount).toLocaleString()}</td>
                  <td className={cn(table.td, "text-xs")}>
                    <span className="inline-flex items-center gap-1 rounded-full bg-black/[0.04] px-2 py-0.5 whitespace-nowrap ring-1 ring-black/[0.06]">
                      <Wallet className="h-3 w-3 text-black/40" />
                      {methodLabel(payout.payment_method || (payout.crypto_address ? "usdt_trc20" : "bank_transfer"))}
                    </span>
                  </td>
                  <td className={cn(table.td, "max-w-[150px] truncate font-mono text-xs")} title={payout.payment_details || payout.crypto_address || undefined}>
                    {payout.payment_details || payout.crypto_address}
                  </td>
                  <td className={table.td}>
                    {payout.status === "pending" && <Chip tone="amber"><Clock className="h-3 w-3" /> Pending</Chip>}
                    {payout.status === "paid" && <Chip tone="emerald"><CheckCircle className="h-3 w-3" /> Paid</Chip>}
                    {payout.status === "rejected" && <Chip tone="red"><XCircle className="h-3 w-3" /> Rejected</Chip>}
                  </td>
                  <td className={cn(table.td, "whitespace-nowrap text-[var(--g-muted-ink)]")}>
                    {new Date(payout.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {payouts.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-[var(--g-muted-ink)]">
                    No payouts requested yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
