import { EconomicCalendar } from "@/components/dashboard/EconomicCalendar";

export default function CalendarPage() {
  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out pb-20">
      
      <div className="mb-8 flex items-center gap-3">
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-[var(--ink-950)] tracking-tight">
          Economic Calendar
        </h1>
      </div>

      <EconomicCalendar />

    </div>
  );
}
