import { NewChallengeForm } from "@/components/dashboard/NewChallengeForm";

export default function NewChallengePage() {
  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-[var(--ink-950)] tracking-tight">
          New Challenge
        </h1>
        <p className="text-[14px] text-[var(--ink-500)] mt-2">Configure and purchase a new evaluation challenge</p>
      </div>

      <NewChallengeForm />

    </div>
  );
}
