"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DollarSign, AlertCircle } from "lucide-react";
import { StatusPill } from "@/components/dashboard/ui/primitives";
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
  const maxProfit = selectedAccount ? Math.max(0, selectedAccount.balance - selectedAccount.size) : 0;

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
      <div className="dash-card p-4 sm:p-5">
        <h2 className="mb-4 text-[15px] font-semibold tracking-tight text-ink">Request New Payout</h2>
        
        {fundedAccounts.length === 0 ? (
          <div className="flex items-center gap-3 rounded-none border bg-amber-50 p-4 text-amber-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <p className="text-sm font-medium">You need an active funded account to request a payout.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-none border bg-rose-50 p-3 text-[13px] text-rose-700">
                {error}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-ink-700">Select Funded Account</label>
              <select 
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="h-10 w-full rounded-none border border-[var(--dash-hairline)] bg-white px-3 text-sm text-ink outline-none transition-colors focus:border-ink-400"
              >
                <option value="">-- Choose Account --</option>
                {fundedAccounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    ${acc.size.toLocaleString()} Funded ({acc.id.substring(0,8)}) - Profit: ${Math.max(0, acc.balance - acc.size).toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-ink-700">Amount (USD)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-4 w-4 text-ink-400" />
                  </div>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    max={maxProfit}
                    placeholder="0.00"
                    className="dash-num h-10 w-full rounded-none border border-[var(--dash-hairline)] bg-white pl-9 pr-3 text-sm text-ink outline-none transition-colors focus:border-ink-400"
                  />
                </div>
                {selectedAccountId && (
                  <p className="dash-num mt-1 text-xs text-ink-500">
                    Max available: ${maxProfit.toLocaleString()}
                  </p>
                )}
              </div>
              
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-ink-700">USDT (TRC20) Address</label>
                <input 
                  type="text" 
                  value={cryptoAddress}
                  onChange={(e) => setCryptoAddress(e.target.value)}
                  placeholder="Enter wallet address..."
                  className="h-10 w-full rounded-none border border-[var(--dash-hairline)] bg-white px-3 font-mono text-[13px] text-ink outline-none transition-colors focus:border-ink-400"
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
      <div className="dash-card p-4 sm:p-5">
        <h2 className="mb-4 text-[15px] font-semibold tracking-tight text-ink">Payout History</h2>
        
        <div className="dash-scroll-x -mx-4 sm:-mx-5">
          <table className="dash-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Account</th>
                <th className="text-right">Amount</th>
                <th>Address</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((payout) => (
                <tr key={payout.id}>
                  <td className="dash-num text-xs">{payout.id.substring(0, 8)}</td>
                  <td className="dash-num text-xs">{payout.account_id.substring(0, 8)}</td>
                  <td className="dash-num text-right font-medium text-ink">${Number(payout.amount).toLocaleString()}</td>
                  <td className="dash-num max-w-[150px] truncate text-xs" title={payout.crypto_address}>{payout.crypto_address}</td>
                  <td>
                    {payout.status === "pending" && <StatusPill tone="pending">Pending</StatusPill>}
                    {payout.status === "paid" && <StatusPill tone="success">Paid</StatusPill>}
                    {payout.status === "rejected" && <StatusPill tone="danger">Rejected</StatusPill>}
                  </td>
                  <td className="whitespace-nowrap text-ink-500">
                    {new Date(payout.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {payouts.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-[13px] text-ink-500">
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
