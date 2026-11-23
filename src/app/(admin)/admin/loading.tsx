export default function AdminLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto max-w-7xl space-y-6"
    >
      <span className="sr-only">Loading admin page</span>
      <div aria-hidden="true" className="space-y-3 motion-safe:animate-pulse">
        <div className="h-7 w-44 rounded-lg bg-black/10" />
        <div className="h-4 w-60 max-w-full rounded bg-black/5" />
      </div>
      <div
        aria-hidden="true"
        className="h-56 rounded-2xl border border-[var(--border)] bg-white/50 motion-safe:animate-pulse"
      />
    </div>
  );
}
