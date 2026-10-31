import { NewChallengeForm } from "@/components/dashboard/NewChallengeForm";

export default function NewChallengePage() {
  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">

      <div className="mb-8 flex items-center gap-3">
        <div aria-hidden className="h-9 w-1.5 rounded-full bg-[var(--teal-900)]" />
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-[var(--ink-950)] tracking-tight">
            New Challenge
          </h1>
          <p className="text-[13px] text-[var(--ink-500)] mt-1">Configure and purchase a new evaluation challenge</p>
        </div>
      </div>

      <NewChallengeForm />

    </div>
  );
}
