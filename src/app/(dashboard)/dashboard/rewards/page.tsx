import { Award } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function RewardsPage() {
  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out pb-20">
      
      <div className="mb-8 flex items-center gap-3">
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-[var(--ink-950)] tracking-tight">
          Rewards
        </h1>
      </div>

      {/* Top Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* Certificate Card */}
        <div className="bg-white rounded-2xl border border-[var(--border)] shadow-sm flex flex-col items-center justify-center text-center p-10 min-h-[240px]">
          <div className="w-12 h-12 rounded-full bg-[var(--paper-2)] flex items-center justify-center mb-4">
            <Award className="w-6 h-6 text-[var(--ink-400)]" strokeWidth={1.5} />
          </div>
          <h3 className="text-[18px] font-bold text-[var(--ink-950)] mb-2">No Certificate Available</h3>
          <p className="text-[14px] text-[var(--ink-500)] max-w-[300px]">
            You'll earn your reward certificate once you start receiving rewards.
            <br />
            <span className="text-[var(--ink-400)] mt-1 inline-block">Keep trading to unlock your achievements!</span>
          </p>
        </div>

        {/* Request Reward Card */}
        <div className="bg-white rounded-2xl border border-[var(--border)] shadow-sm flex flex-col justify-center p-10 min-h-[240px]">
          <h3 className="text-[20px] font-bold text-[var(--ink-950)] mb-3">Ready to request your reward?</h3>
          <p className="text-[14px] text-[var(--ink-500)] mb-8 leading-relaxed">
            Please click on the request button then proceed to fill out the required information, our team will reach out to you for further advancements.
          </p>
          <div>
            <Button className="h-11 px-6 rounded-xl bg-[var(--ink-950)] hover:bg-[var(--ink-800)] text-white font-medium text-[14px]">
              Request Reward
            </Button>
          </div>
        </div>

      </div>

      {/* Rewards Table */}
      <div className="bg-white rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border)]">
          <h4 className="text-[12px] font-bold text-[var(--ink-500)] uppercase tracking-wider">Rewards</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap min-h-[100px]">
            <thead>
              <tr className="bg-[var(--paper-2)]/50 text-[12px] font-medium text-[var(--ink-500)] border-b border-[var(--border)]">
                <th className="px-6 py-4">Reference ID</th>
                <th className="px-6 py-4">Reward Type</th>
                <th className="px-6 py-4">Requested On</th>
                <th className="px-6 py-4">Method</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Certificate</th>
                <th className="px-6 py-4">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {/* Empty state can just be an empty body or a simple message */}
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-[13px] text-[var(--ink-400)]">
                  No rewards found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
