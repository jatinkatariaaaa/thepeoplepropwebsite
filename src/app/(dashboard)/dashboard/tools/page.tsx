import type { Metadata } from "next";
import { PageTitle, SectionTitle } from "@/components/dashboard/glass";
import { PositionCalculator } from "@/components/tools/position-calculator";
import { LossLimitLab } from "@/components/tools/loss-limit-lab";

export const metadata: Metadata = { title: "Tools" };

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageTitle lead="Trading" fade="tools" lede="Size a position from the risk you accept, and see where today's loss limit sits before you place it." />
      <SectionTitle title="Position calculator" sub="Uses the contract sizes and leverage of TPP Terminal. Size is rounded down, so the risk never exceeds what you set." />
      <PositionCalculator tone="light" />
      <SectionTitle className="mt-10" title="Loss-limit planner" sub="The daily limit moves with your balance at the 5pm New York rollover. The maximum limit never moves." />
      <LossLimitLab />
    </div>
  );
}
