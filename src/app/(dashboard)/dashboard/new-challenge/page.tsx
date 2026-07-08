import { NewChallengeForm } from "@/components/dashboard/NewChallengeForm";

export default function NewChallengePage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out">
      <div className="mb-6">
        <p className="dash-overline mb-1.5">Evaluation</p>
        <h1 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
          New Challenge
        </h1>
        <p className="mt-1 text-sm text-ink-500">Configure and purchase a new evaluation challenge.</p>
      </div>

      <NewChallengeForm />

    </div>
  );
}
