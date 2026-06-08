import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function DailySummary() {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  // Generating a simple 35-day grid for placeholder
  const calendarCells = Array.from({ length: 35 }).map((_, i) => {
    // Just a basic visual trick to match screenshot
    if (i < 4) return null; 
    return i - 3;
  });

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-[16px] text-[var(--ink-950)]">Daily Summary</h3>
        <button className="flex items-center gap-2 px-4 py-2 border border-[var(--border)] bg-white rounded-xl text-[13px] font-medium text-[var(--ink-700)] hover:bg-[var(--paper-2)] transition-colors shadow-sm">
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Calendar Box */}
        <div className="flex-1 bg-white border border-[var(--border)] rounded-[24px] shadow-sm p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-[var(--border)] text-[var(--ink-500)] hover:bg-[var(--paper-2)]">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="px-4 text-[15px] font-bold text-[var(--ink-950)]">January 1970</div>
              <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-[var(--border)] text-[var(--ink-500)] hover:bg-[var(--paper-2)]">
                <ChevronRight className="w-4 h-4" />
              </button>
              <button className="flex items-center gap-2 ml-2 px-3 py-1.5 border border-[var(--border)] rounded-lg text-[13px] font-medium text-[var(--ink-700)] hover:bg-[var(--paper-2)]">
                <CalendarIcon className="w-4 h-4" /> Today
              </button>
            </div>
            <div className="flex items-center gap-4 text-[13px] font-bold">
              <span className="text-[var(--ink-500)]">PnL: <span className="text-[var(--ink-950)]">$0.00</span></span>
              <span className="text-[var(--ink-500)]">Days: <span className="text-[var(--ink-950)]">0</span></span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map(d => (
              <div key={d} className="text-center text-[12px] font-bold text-[var(--ink-400)] mb-2">
                {d}
              </div>
            ))}
            {calendarCells.map((day, i) => (
              <div 
                key={i} 
                className={cn(
                  "aspect-square rounded-xl border border-[var(--border)] p-2 text-[12px] font-medium text-[var(--ink-300)]",
                  !day && "border-dashed bg-[var(--paper-2)] border-transparent"
                )}
              >
                {day}
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Summary */}
        <div className="w-full lg:w-[320px] shrink-0">
          <h4 className="text-[14px] font-medium text-[var(--ink-500)] mb-4">Weekly Summary</h4>
          <div className="space-y-3">
            {[
              { w: "Week One", d: "Dec 28 - Jan 3" },
              { w: "Week Two", d: "Jan 4 - Jan 10" },
              { w: "Week Three", d: "Jan 11 - Jan 17" },
              { w: "Week Four", d: "Jan 18 - Jan 24" },
              { w: "Week Five", d: "Jan 25 - Jan 31" }
            ].map((week, idx) => (
              <div key={idx} className="bg-white border border-[var(--border)] rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-[14px] text-[var(--ink-950)]">{week.w}</span>
                  <span className="text-[12px] text-[var(--ink-500)]">{week.d}</span>
                </div>
                <div className="text-[13px] text-[var(--ink-500)]">No trades</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
