"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AccountMetrics, DailyPnlPoint } from "@/lib/account-metrics";

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
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-[16px] text-[var(--ink-950)]">Daily Summary</h3>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Calendar Box */}
        <div className="flex-1 bg-white border border-[var(--border)] rounded-[24px] shadow-sm p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <button
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-[var(--border)] text-[var(--ink-500)] hover:bg-[var(--paper-2)]"
                onClick={() => setMonthOffset((value) => value - 1)}
                aria-label="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="px-4 text-[15px] font-bold text-[var(--ink-950)]">{formatMonth(visibleMonth)}</div>
              <button
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-[var(--border)] text-[var(--ink-500)] hover:bg-[var(--paper-2)]"
                onClick={() => setMonthOffset((value) => value + 1)}
                aria-label="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                className="flex items-center gap-2 ml-2 px-3 py-1.5 border border-[var(--border)] rounded-lg text-[13px] font-medium text-[var(--ink-700)] hover:bg-[var(--paper-2)]"
                onClick={() => setMonthOffset(todayOffset)}
              >
                <CalendarIcon className="w-4 h-4" /> Today
              </button>
            </div>
            <div className="flex items-center gap-4 text-[13px] font-bold">
              <span className="text-[var(--ink-500)]">Total PnL: <span className="text-[var(--ink-950)]">{money.format(metrics?.totalPnL || 0)}</span></span>
              <span className="text-[var(--ink-500)]">Active Days: <span className="text-[var(--ink-950)]">{metrics?.dailyPnL?.length || 0}</span></span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map(d => (
              <div key={d} className="text-center text-[12px] font-bold text-[var(--ink-400)] mb-2">
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
                  "aspect-square rounded-xl border border-[var(--border)] p-2 text-[12px] font-medium transition-colors",
                  !cell.day && "border-dashed bg-[var(--paper-2)] border-transparent text-[var(--ink-300)]",
                  cell.day && !hasActivity && "text-[var(--ink-400)] bg-white",
                  pnl > 0 && "border-emerald-200 bg-emerald-50 text-emerald-700",
                  pnl < 0 && "border-red-200 bg-red-50 text-red-700",
                  pnl === 0 && hasActivity && "border-[var(--border)] bg-[var(--paper-2)] text-[var(--ink-700)]"
                )}
              >
                {cell.day && (
                  <div className="flex h-full flex-col justify-between">
                    <span>{cell.day}</span>
                    {hasActivity && (
                      <span className="truncate text-[10px] font-bold">
                        {pnl >= 0 ? "+" : ""}{money.format(pnl)}
                      </span>
                    )}
                  </div>
                )}
              </div>
              );
            })}
          </div>
        </div>

        {/* Weekly Summary */}
        <div className="w-full lg:w-[320px] shrink-0">
          <h4 className="text-[14px] font-medium text-[var(--ink-500)] mb-4">Weekly Summary</h4>
          <div className="space-y-3">
            {weeklyRows.length > 0 ? weeklyRows.map((week) => (
              <div key={week.weekStart} className="bg-white border border-[var(--border)] rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-[14px] text-[var(--ink-950)]">
                    {money.format(week.pnl)}
                  </span>
                  <span className="text-[12px] text-[var(--ink-500)]">
                    {formatShortDate(week.weekStart)} - {formatShortDate(week.weekEnd)}
                  </span>
                </div>
                <div className="text-[13px] text-[var(--ink-500)]">
                  {week.trades} trades / {week.wins} wins / {week.losses} losses
                </div>
              </div>
            )) : (
              <div className="bg-white border border-[var(--border)] rounded-xl p-4 shadow-sm">
                <div className="text-[13px] text-[var(--ink-500)]">No closed trades</div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
