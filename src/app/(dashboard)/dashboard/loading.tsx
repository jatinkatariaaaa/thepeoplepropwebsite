export default function DashboardLoading() {
  return (
    <div role="status" aria-label="Loading dashboard" className="mx-auto w-full max-w-7xl">
      <div aria-hidden="true" className="motion-safe:animate-pulse">
        <div className="mb-5 h-8 w-40 rounded-lg bg-black/10 dark:bg-white/10" />
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-24 rounded-[22px] bg-black/5 dark:bg-white/5" />
          ))}
        </div>
        <div className="h-56 rounded-[22px] bg-black/5 dark:bg-white/5" />
      </div>
    </div>
  );
}
