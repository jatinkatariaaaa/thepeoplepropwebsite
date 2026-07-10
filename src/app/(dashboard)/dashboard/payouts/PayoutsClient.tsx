"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DollarSign, AlertCircle, Clock, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function PayoutsClient({ fundedAccounts, initialPayouts }: { fundedAccounts: any[], initialPayouts: any[] }) {
  const router = useRouter();
  const [payouts, setPayouts] = useState(initialPayouts);
  const [amount, setAmount] = useState("");
  const [cryptoAddress, setCryptoAddress] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedAccount = fundedAccounts.find(a => a.id === selectedAccountId);
  // Calculate max withdrawable profit (balance - original size)
  const maxProfit = selectedAccount ? Math.max(0, selectedAccount.balance - selectedAccount.starting_balance) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedAccountId) return setError("Please select an account.");
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return setError("Please enter a valid amount.");
    if (Number(amount) > maxProfit) return setError(`Amount exceeds maximum withdrawable profit ($${maxProfit.toLocaleString()}).`);
    if (!cryptoAddress) return setError("Please enter a crypto wallet address.");

    setLoading(true);
    try {
      const res = await fetch("/api/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: selectedAccountId,
          amount: Number(amount),
          cryptoAddress,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to request payout");
      }

      setAmount("");
      setCryptoAddress("");
      setSelectedAccountId("");
      router.refresh(); // refresh the page data
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
                <label className="block text-sm font-medium text-[var(--ink-700)] mb-1">USDT (TRC20) Address</label>
                <input 
                  type="text" 
                  value={cryptoAddress}
                  onChange={(e) => setCryptoAddress(e.target.value)}
                  placeholder="Enter wallet address..."
                  className="w-full px-4 py-2 bg-[var(--paper-2)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--brand-500)] text-[var(--ink-950)] font-mono text-sm"
                />
              </div>
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
                <th className="px-6 py-3">Address</th>
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
                  <td className="px-6 py-4 font-mono text-xs truncate max-w-[150px]" title={payout.crypto_address}>{payout.crypto_address}</td>
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
                  <td colSpan={6} className="px-6 py-8 text-center text-[var(--ink-500)]">
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
