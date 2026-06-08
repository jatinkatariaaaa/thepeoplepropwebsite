import { Clock, Info } from "lucide-react";

export function TradingObjectives() {
  return (
    <div className="mb-8">
      <h3 className="font-bold text-[16px] text-[var(--ink-950)] mb-4">Trading Objectives</h3>
      
      <div className="bg-white border border-[var(--border)] rounded-[24px] shadow-sm divide-y divide-[var(--border)] overflow-hidden">
        
        {/* Daily Loss */}
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <h4 className="font-bold text-[15px] text-[var(--ink-950)] flex items-center gap-2">
                Maximum Daily Loss <Info className="w-4 h-4 text-[var(--ink-400)]" />
              </h4>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--ink-950)] text-white text-[12px] font-bold">
                <Clock className="w-3.5 h-3.5" />
                Resets In: 13:01:32
              </div>
            </div>
            <div className="text-[13px] font-medium text-[var(--ink-950)]">
              Remaining: $5,000.00
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-6 text-[13px] text-[var(--ink-500)] mb-4 font-medium">
            <span>Maximum Allowed Daily Loss: $5,000.00</span>
            <span>Todays Starting Equity: $100,000.00</span>
            <span>Balance Threshold: $95,000.00</span>
          </div>

          <div className="h-2 w-full bg-[var(--paper-2)] rounded-full overflow-hidden">
            {/* 0% progress visually */}
            <div className="h-full bg-[var(--accent)] w-0" />
          </div>
        </div>

        {/* Max Loss */}
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h4 className="font-bold text-[15px] text-[var(--ink-950)] flex items-center gap-2">
              Maximum Loss <Info className="w-4 h-4 text-[var(--ink-400)]" />
            </h4>
            <div className="text-[13px] font-medium text-[var(--ink-950)]">
              Remaining: $10,000.00
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-6 text-[13px] text-[var(--ink-500)] mb-4 font-medium">
            <span>Maximum Allowed Loss: $10,000.00</span>
            <span>Balance Threshold: $90,000.00</span>
          </div>

          <div className="h-2 w-full bg-[var(--paper-2)] rounded-full overflow-hidden">
            {/* 0% progress visually */}
            <div className="h-full bg-[var(--accent)] w-0" />
          </div>
        </div>

      </div>
    </div>
  );
}
