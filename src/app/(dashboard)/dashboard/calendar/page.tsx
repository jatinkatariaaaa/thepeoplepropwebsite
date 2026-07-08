import { EconomicCalendar } from "@/components/dashboard/EconomicCalendar";

export default function CalendarPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out pb-16">
      <div className="mb-6">
        <p className="dash-overline mb-1.5">Markets</p>
        <h1 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
          Economic Calendar
        </h1>
      </div>

      <EconomicCalendar />

    </div>
  );
}
