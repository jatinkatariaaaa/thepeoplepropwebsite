import { EconomicCalendar } from "@/components/dashboard/EconomicCalendar";
import { PageTitle } from "@/components/dashboard/glass";

export default function CalendarPage() {
  return (
    <div className="mx-auto max-w-7xl pb-20">
      <PageTitle lead="Economic" fade="Calendar" />

      <EconomicCalendar />
    </div>
  );
}
