import { MessagesSquare } from "lucide-react";
import { Button } from "../ui";
import { PageHero } from "../page-hero";

export function ReviewsPage() {
  return (
    <PageHero
      art="/art/page-reviews.webp"
      crumb="Reviews"
      eyebrow="Trader feedback"
      icon={MessagesSquare}
      lead="Share your"
      fade="experience."
      lede="Tell our team what worked for you and what we can improve. If you need help with an account, we can look into it with you."
    >
      <div className="flex flex-wrap gap-3">
        <Button href="/contact">Contact our team</Button>
        <Button href="/payout-policy" kind="glass" arrow={false}>Read the payout policy</Button>
      </div>
    </PageHero>
  );
}
