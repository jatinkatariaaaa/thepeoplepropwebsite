"use client";

import { useEffect, useState } from "react";
import { Activity, MessagesSquare, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Container, Eyebrow, Lede, Section, Title } from "../ui";
import { Reveal } from "../motion";
import { PageHero } from "../page-hero";
import { Cta } from "../cta";
import { SupportChannels } from "./channels";

type State = "operational" | "degraded" | "down" | "unknown";
type Service = { key: string; name: string; detail: string; state: State; latency: number | null };
type Report = { checkedAt: string; services: Service[] };

const LABEL: Record<State, string> = { operational: "Operational", degraded: "Slow", down: "Not responding", unknown: "Not checked" };
const DOT: Record<State, string> = { operational: "bg-[var(--g-lime)]", degraded: "bg-amber-300", down: "bg-red-400", unknown: "bg-white/30" };

/** Polls /api/status once a minute; `refresh` checks again now. */
function useStatus() {
  const [report, setReport] = useState<Report | null>(null);
  const [failed, setFailed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let alive = true;
    fetch("/api/status", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: Report) => {
        if (!alive) return;
        setReport(d);
        setFailed(false);
      })
      .catch(() => alive && setFailed(true))
      .finally(() => alive && setRefreshing(false));
    const next = setTimeout(() => setTick((n) => n + 1), 60_000);
    return () => {
      alive = false;
      clearTimeout(next);
    };
  }, [tick]);
  const refresh = () => {
    setRefreshing(true);
    setTick((n) => n + 1);
  };
  return { report, failed, refreshing, refresh };
}

function overall(report: Report | null, failed: boolean): { state: State; text: string } {
  if (failed) return { state: "down", text: "Status check unavailable" };
  if (!report) return { state: "unknown", text: "Checking services…" };
  const checked = report.services.filter((s) => s.state !== "unknown");
  if (checked.some((s) => s.state === "down")) return { state: "down", text: "Some services are not responding" };
  if (checked.some((s) => s.state === "degraded")) return { state: "degraded", text: "Some services are slow" };
  return { state: "operational", text: "All checked services operational" };
}

function Dot({ state, pulse }: { state: State; pulse?: boolean }) {
  return (
    <span className="relative grid h-2.5 w-2.5 place-items-center">
      {pulse && state === "operational" ? <span className={cn("absolute inset-0 animate-ping rounded-full opacity-60", DOT[state])} /> : null}
      <span className={cn("relative h-2.5 w-2.5 rounded-full", DOT[state])} />
    </span>
  );
}

export function StatusPage() {
  const { report, failed, refreshing, refresh } = useStatus();
  const summary = overall(report, failed);
  const time = report ? new Date(report.checkedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : null;

  return (
    <>
      <PageHero
        art="/art/page-status.webp"
        crumb="Status"
        eyebrow="System status"
        icon={Activity}
        lead="Live service"
        fade="status."
        lede="Checks of the services you use with The People Prop, run from our servers and refreshed every minute."
        mobileFocus="70%"
      >
        <p className="g-glass g-hair inline-flex items-center gap-3 rounded-full py-3 pr-5 pl-4 text-[14.5px] font-semibold text-white" aria-live="polite">
          <Dot state={summary.state} pulse />
          {summary.text}
        </p>
      </PageHero>

      <Section shell={false} className="pt-6 pb-24">
        <Container>
          <Reveal>
            <div className="g-glass-ink g-hair overflow-hidden rounded-[32px]">
              <ul className="divide-y divide-white/[0.07]">
                {(report?.services ?? []).map((s) => (
                  <li key={s.key} className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-6">
                    <div className="min-w-0">
                      <p className="text-[16.5px] font-semibold tracking-[-0.02em] text-white">{s.name}</p>
                      <p className="mt-1 text-[13.5px] text-white/50">{s.detail}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      {s.latency != null ? <span className="g-num text-[13px] text-white/45">{s.latency} ms</span> : null}
                      <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] py-1.5 pr-3.5 pl-3 text-[13px] font-semibold text-white/85 ring-1 ring-white/10">
                        <Dot state={s.state} />
                        {LABEL[s.state]}
                      </span>
                    </div>
                  </li>
                ))}
                {!report ? (
                  <li className="px-6 py-10 text-center text-[14px] text-white/50 sm:px-8">
                    {failed ? "We couldn't reach the status check. Try again in a moment." : "Running checks…"}
                  </li>
                ) : null}
              </ul>
              <div className="flex flex-col items-start justify-between gap-3 border-t border-white/[0.07] bg-white/[0.02] px-6 py-4 text-[13px] text-white/45 sm:flex-row sm:items-center sm:px-8">
                <span>{time ? `Last checked at ${time} · refreshes every minute` : "Refreshes every minute"}</span>
                <button type="button" onClick={refresh} disabled={refreshing} className="inline-flex items-center gap-2 font-semibold text-white/70 transition-colors hover:text-white disabled:opacity-50">
                  <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} /> Check now
                </button>
              </div>
            </div>
          </Reveal>
          <p className="mt-5 max-w-2xl text-[13px] leading-relaxed text-white/40">
            These checks cover the services this website runs on. Trading platforms are run by their providers and aren&apos;t monitored here.
          </p>
        </Container>
      </Section>

      <Section shell={false} className="pt-16 pb-40 sm:pb-48">
        <Container>
          <div className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-16">
            <Reveal>
              <Eyebrow icon={MessagesSquare}>Something wrong?</Eyebrow>
              <Title className="mt-6 text-[clamp(2rem,3.6vw,3.2rem)]" lead="Tell us" fade="what you see." />
              <Lede className="mt-5">If something isn&apos;t working and it isn&apos;t shown here, message the team with what you were doing and when.</Lede>
            </Reveal>
            <Reveal delay={0.08} className="min-w-0">
              <div className="flex flex-col gap-3">
                <SupportChannels />
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      <Cta />
    </>
  );
}
