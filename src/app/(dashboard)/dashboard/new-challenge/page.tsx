import { Suspense } from "react";
import { NewChallengeForm } from "@/components/dashboard/NewChallengeForm";
import { PageTitle } from "@/components/dashboard/glass";

export default function NewChallengePage() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageTitle lead="New" fade="account" lede="Choose a route, a size and any add-ons. The price is confirmed on our server before you pay." />
      <Suspense fallback={null}>
        <NewChallengeForm />
      </Suspense>
    </div>
  );
}
