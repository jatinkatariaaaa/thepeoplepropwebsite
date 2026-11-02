"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AccountMetrics, DailyPnlPoint } from "@/lib/account-metrics";
import { Panel, SectionTitle } from "../glass";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

function parseDateKey(value?: string) {
  const date = value ? new Date(`${value}T00:00:00.000Z`) : new Date();
  if (Number.isNaN(date.getTime())) return new Date();
  return date;
}

function monthStart(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function addMonths(date: Date, months: number) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
}

function monthDistance(from: Date, to: Date) {
  return (to.getUTCFullYear() - from.getUTCFullYear()) * 12 + (to.getUTCMonth() - from.getUTCMonth());
}

function dateKey(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month, day)).toISOString().slice(0, 10);
}

function formatMonth(date: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(date);
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(parseDateKey(value));
}

function buildCalendarCells(visibleMonth: Date, pnlByDate: Map<string, DailyPnlPoint>) {
  const year = visibleMonth.getUTCFullYear();
  const month = visibleMonth.getUTCMonth();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const leadingBlanks = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const cells: Array<{ key: string; day: number | null; data?: DailyPnlPoint }> = [];

  for (let i = 0; i < leadingBlanks; i++) {
    cells.push({ key: `blank-start-${i}`, day: null });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const key = dateKey(year, month, day);
    cells.push({ key, day, data: pnlByDate.get(key) });
  }

  while (cells.length % 7 !== 0 || cells.length < 35) {
    cells.push({ key: `blank-end-${cells.length}`, day: null });
  }

  return cells;
}

export function DailySummary({ metrics }: { metrics?: AccountMetrics | null }) {
  const [monthOffset, setMonthOffset] = useState(0);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const latestActivity = metrics?.dailyPnL?.[metrics.dailyPnL.length - 1]?.date;
  const anchorMonth = monthStart(parseDateKey(latestActivity));
  const visibleMonth = addMonths(anchorMonth, monthOffset);
  const pnlByDate = new Map((metrics?.dailyPnL ?? []).map((day) => [day.date, day]));
  const calendarCells = buildCalendarCells(visibleMonth, pnlByDate);
  const weeklyRows = (metrics?.weeklyPnL ?? []).slice(-5).reverse();
  const todayOffset = monthDistance(anchorMonth, monthStart(new Date()));

  return (
    <div className="mb-8">
      <SectionTitle as="h3" title="Daily Summary" />

      <div className="flex flex-col lg:flex-row gap-6">

        {/* Calendar Box */}
        <Panel className="flex-1 min-w-0 p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <button
                className="grid h-9 w-9 cursor-pointer place-items-center rounded-full bg-white/65 text-[var(--g-muted-ink)] ring-1 ring-black/[0.08] transition-colors hover:bg-white hover:text-[var(--g-ink)]"
                onClick={() => setMonthOffset((value) => value - 1)}
                aria-label="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="px-2 text-[15px] font-semibold tracking-[-0.01em] text-[var(--g-ink)] sm:px-3">{formatMonth(visibleMonth)}</div>
              <button
                className="grid h-9 w-9 cursor-pointer place-items-center rounded-full bg-white/65 text-[var(--g-muted-ink)] ring-1 ring-black/[0.08] transition-colors hover:bg-white hover:text-[var(--g-ink)]"
                onClick={() => setMonthOffset((value) => value + 1)}
                aria-label="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                className="ml-1 flex h-9 cursor-pointer items-center gap-2 rounded-full bg-white/65 px-3.5 text-[13px] font-medium text-[var(--g-ink)] ring-1 ring-black/[0.08] transition-colors hover:bg-white"
                onClick={() => setMonthOffset(todayOffset)}
              >
                <CalendarIcon className="w-4 h-4" /> Today
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] font-semibold">
              <span className="text-[var(--g-muted-ink)]">Total PnL: <span className="g-num text-[var(--g-ink)]">{money.format(metrics?.totalPnL || 0)}</span></span>
              <span className="text-[var(--g-muted-ink)]">Active Days: <span className="g-num text-[var(--g-ink)]">{metrics?.dailyPnL?.length || 0}</span></span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {days.map(d => (
              <div key={d} className="text-center text-[11px] sm:text-[12px] font-semibold text-black/40 mb-2">
                {d}
              </div>
            ))}
            {calendarCells.map((cell) => {
              const pnl = cell.data?.pnl ?? 0;
              const hasActivity = Boolean(cell.data);
              return (
              <div
                key={cell.key}
                className={cn(
                  "aspect-square min-w-0 rounded-[10px] sm:rounded-[12px] p-1 sm:p-2 text-[11px] sm:text-[12px] font-medium ring-1 transition-colors",
                  !cell.day && "bg-transparent ring-transparent text-black/20",
                  cell.day && !hasActivity && "bg-white/55 ring-black/[0.05] text-black/40",
                  pnl > 0 && "bg-[var(--g-lime)]/30 ring-[#8fc21d]/40 text-[#3b5410]",
                  pnl < 0 && "bg-red-500/10 ring-red-500/25 text-red-700",
                  pnl === 0 && hasActivity && "bg-black/[0.04] ring-black/[0.08] text-[var(--g-ink)]"
                )}
              >
                {cell.day && (
                  <div className="flex h-full flex-col justify-between">
                    <span>{cell.day}</span>
                    {hasActivity && (
                      <span className="g-num truncate text-[9px] sm:text-[10px] font-semibold">
                        {pnl >= 0 ? "+" : ""}{money.format(pnl)}
                      </span>
                    )}
                  </div>
                )}
              </div>
              );
            })}
          </div>
        </Panel>

        {/* Weekly Summary */}
        <div className="w-full lg:w-[320px] shrink-0">
          <h4 className="text-[14px] font-medium text-[var(--g-muted-ink)] mb-4">Weekly Summary</h4>
          <div className="space-y-3">
            {weeklyRows.length > 0 ? weeklyRows.map((week) => (
              <Panel key={week.weekStart} className="rounded-[20px] p-4">
                <div className="flex justify-between items-center gap-3 mb-2">
                  <span className={cn("g-num font-semibold text-[14px]", week.pnl < 0 ? "text-red-700" : "text-[var(--g-ink)]")}>
                    {money.format(week.pnl)}
                  </span>
                  <span className="text-[12px] text-[var(--g-muted-ink)]">
                    {formatShortDate(week.weekStart)} - {formatShortDate(week.weekEnd)}
                  </span>
                </div>
                <div className="text-[13px] text-[var(--g-muted-ink)]">
                  {week.trades} trades / {week.wins} wins / {week.losses} losses
                </div>
              </Panel>
            )) : (
              <Panel className="rounded-[20px] p-4">
                <div className="text-[13px] text-[var(--g-muted-ink)]">No closed trades</div>
              </Panel>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
