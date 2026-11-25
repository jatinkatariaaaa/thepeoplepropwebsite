import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProgramPage } from "@/components/v2/glass/pages/program-page";
import { PROGRAM_ORDER, isProgramKey, programDetails } from "@/data/catalogue";

export function generateStaticParams() {
  return PROGRAM_ORDER.map((program) => ({ program }));
}

export async function generateMetadata({ params }: { params: Promise<{ program: string }> }): Promise<Metadata> {
  const { program } = await params;
  if (!isProgramKey(program)) return {};
  const d = programDetails[program];
  const targets = d.phases.length ? `${d.phases.map((p) => `${p.targetPct}%`).join(" + ")} target` : "no evaluation";
  return {
    title: `${d.name} account`,
    description: `${d.name}: ${targets}, ${d.funded.dailyLossPct}% daily and ${d.funded.maxLossPct}% overall loss limit. Objectives, payouts, program terms and FAQ.`,
  };
}

export default async function Page({ params }: { params: Promise<{ program: string }> }) {
  const { program } = await params;
  if (!isProgramKey(program)) notFound();
  return <ProgramPage programKey={program} />;
}
