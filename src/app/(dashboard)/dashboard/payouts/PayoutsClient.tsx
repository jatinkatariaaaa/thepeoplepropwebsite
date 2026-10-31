"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DollarSign, CircleAlert as AlertCircle, Clock, CircleCheck as CheckCircle, Circle as XCircle, Wallet } from "lucide-react";
import { Button } from "@/components/ui/Button";

const PAYMENT_METHODS = [
  { value: "usdt_trc20", label: "USDT (TRC20)", type: "crypto", placeholder: "TRC20 wallet address" },
  { value: "usdt_erc20", label: "USDT (ERC20)", type: "crypto", placeholder: "ERC20 wallet address" },
  { value: "usdt_bep20", label: "USDT (BEP20 / BSC)", type: "crypto", placeholder: "BEP20 wallet address" },
  { value: "btc", label: "Bitcoin (BTC)", type: "crypto", placeholder: "BTC wallet address" },
  { value: "eth", label: "Ethereum (ETH)", type: "crypto", placeholder: "ETH wallet address" },
  { value: "bank_transfer", label: "Bank Transfer", type: "bank", placeholder: "Bank account details (Name, Account #, IFSC/SWIFT, Bank)" },
] as const;

export function PayoutsClient({ fundedAccounts, initialPayouts }: { fundedAccounts: any[], initialPayouts: any[] }) {
  const router = useRouter();
  const [payouts, setPayouts] = useState(initialPayouts);
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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const methodLabel = (value: string) => PAYMENT_METHODS.find(m => m.value === value)?.label || value;

  return (
    <div className="space-y-6">
      {/* Request Form */}
      <div className="p-6 bg-white rounded-2xl border border-[var(--border)] shadow-sm">
        <h2 className="text-lg font-medium text-[var(--ink-950)] mb-4">Request New Payout</h2>
        
        {fundedAccounts.length === 0 ? (
          <div className="flex items-center gap-3 p-4 bg-orange-50 text-orange-700 rounded-xl border border-orange-100">
            <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
            <p className="text-sm font-medium">You need an active funded account to request a payout.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[var(--ink-700)] mb-1">Select Funded Account</label>
              <select 
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full px-4 py-2 bg-[var(--paper-2)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--brand-500)] text-[var(--ink-950)]"
              >
                <option value="">-- Choose Account --</option>
                {fundedAccounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    ${Number(acc.starting_balance).toLocaleString()} Funded ({acc.id.substring(0,8)}) - Profit: ${Math.max(0, acc.balance - acc.starting_balance).toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--ink-700)] mb-1">Amount (USD)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="w-5 h-5 text-[var(--ink-400)]" />
                  </div>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    max={maxProfit}
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-2 bg-[var(--paper-2)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--brand-500)] text-[var(--ink-950)]"
                  />
                </div>
                {selectedAccountId && (
                  <p className="text-xs text-[var(--ink-500)] mt-1">
                    Max available: ${maxProfit.toLocaleString()}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--ink-700)] mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => { setPaymentMethod(e.target.value); setPaymentDetails(""); }}
                  className="w-full px-4 py-2 bg-[var(--paper-2)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--brand-500)] text-[var(--ink-950)]"
                >
                  {PAYMENT_METHODS.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--ink-700)] mb-1">
                {isCrypto ? `${selectedMethod?.label} Address` : "Bank Account Details"}
              </label>
              {isCrypto ? (
                <input 
                  type="text" 
                  value={paymentDetails}
                  onChange={(e) => setPaymentDetails(e.target.value)}
                  placeholder={selectedMethod?.placeholder}
                  className="w-full px-4 py-2 bg-[var(--paper-2)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--brand-500)] text-[var(--ink-950)] font-mono text-sm"
                />
              ) : (
                <textarea
                  value={paymentDetails}
                  onChange={(e) => setPaymentDetails(e.target.value)}
                  placeholder={selectedMethod?.placeholder}
                  rows={3}
                  className="w-full px-4 py-2 bg-[var(--paper-2)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--brand-500)] text-[var(--ink-950)] text-sm"
                />
              )}
            </div>

            <Button type="submit" disabled={loading || !selectedAccountId} className="w-full">
              {loading ? "Processing..." : "Submit Payout Request"}
            </Button>
          </form>
        )}
      </div>

      {/* History */}
      <div className="p-6 bg-white rounded-2xl border border-[var(--border)] shadow-sm">
        <h2 className="text-lg font-medium text-[var(--ink-950)] mb-4">Payout History</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-[var(--ink-500)] uppercase bg-[var(--paper-2)]">
              <tr>
                <th className="px-6 py-3 rounded-l-lg">ID</th>
                <th className="px-6 py-3">Account</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Method</th>
                <th className="px-6 py-3">Details</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 rounded-r-lg">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {payouts.map((payout) => (
                <tr key={payout.id} className="hover:bg-[var(--paper-2)] transition-colors">
                  <td className="px-6 py-4 font-mono text-xs">{payout.id.substring(0, 8)}</td>
                  <td className="px-6 py-4 font-mono text-xs">{payout.account_id.substring(0, 8)}</td>
                  <td className="px-6 py-4 font-medium text-[var(--ink-950)]">${Number(payout.amount).toLocaleString()}</td>
                  <td className="px-6 py-4 text-xs">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--paper-2)] border border-[var(--border)]">
                      <Wallet className="w-3 h-3 text-[var(--ink-400)]" />
                      {methodLabel(payout.payment_method || (payout.crypto_address ? "usdt_trc20" : "bank_transfer"))}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs truncate max-w-[150px]" title={payout.payment_details || payout.crypto_address}>
                    {payout.payment_details || payout.crypto_address}
                  </td>
                  <td className="px-6 py-4">
                    {payout.status === "pending" && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800"><Clock className="w-3 h-3" /> Pending</span>}
                    {payout.status === "paid" && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3" /> Paid</span>}
                    {payout.status === "rejected" && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3" /> Rejected</span>}
                  </td>
                  <td className="px-6 py-4 text-[var(--ink-500)] whitespace-nowrap">
                    {new Date(payout.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {payouts.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-[var(--ink-500)]">
                    No payouts requested yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
