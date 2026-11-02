import { NewChallengeForm } from "@/components/dashboard/NewChallengeForm";
import { PageTitle } from "@/components/dashboard/glass";

export default function NewChallengePage() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageTitle lead="New" fade="Challenge" lede="Configure and purchase a new evaluation challenge" />

      <NewChallengeForm />
    </div>
  );
}
