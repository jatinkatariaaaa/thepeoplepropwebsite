"use client";

import { Filter, Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const mockEvents = [
  { time: "2:00 PM", currency: "EUR", flag: "🇪🇺", event: "Sentix Investor Confidence", previous: "-16.4", forecast: "-13.8", impact: "High" },
  { time: "4:15 AM", currency: "NZD", flag: "🇳🇿", event: "Manufacturing Sales q/q", previous: "0.6%", forecast: "—", impact: "Medium" },
  { time: "4:31 AM", currency: "GBP", flag: "🇬🇧", event: "BRC Retail Sales Monitor y/y", previous: "-3.4%", forecast: "0.6%", impact: "High" },
  { time: "5:20 AM", currency: "JPY", flag: "🇯🇵", event: "M2 Money Stock y/y", previous: "2.3%", forecast: "2.4%", impact: "Low" },
  { time: "6:00 AM", currency: "AUD", flag: "🇦🇺", event: "Westpac Consumer Sentiment", previous: "3.5%", forecast: "—", impact: "Medium" },
  { time: "7:00 AM", currency: "AUD", flag: "🇦🇺", event: "NAB Business Confidence", previous: "-24", forecast: "—", impact: "High" },
  { time: "8:30 AM", currency: "USD", flag: "🇺🇸", event: "Core CPI m/m", previous: "0.3%", forecast: "0.3%", impact: "High" },
  { time: "8:30 AM", currency: "USD", flag: "🇺🇸", event: "CPI m/m", previous: "0.4%", forecast: "0.3%", impact: "High" },
  { time: "10:00 AM", currency: "USD", flag: "🇺🇸", event: "Consumer Sentiment", previous: "79.4", forecast: "80.0", impact: "Medium" },
];

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function EconomicCalendar() {
  const [activeDay, setActiveDay] = useState("Mon");
  const [showPassed, setShowPassed] = useState(false);

  return (
    <div className="bg-white rounded-[24px] border border-[var(--border)] shadow-sm overflow-hidden">
      
      {/* Filters Header */}
      <div className="p-6 border-b border-[var(--border)] bg-[var(--paper-2)]/30">
        <div className="flex items-center gap-2 text-[var(--ink-950)] font-bold mb-4">
          <Filter className="w-4 h-4 text-[var(--ink-500)]" />
          Filters
        </div>

        <div className="flex flex-wrap items-center gap-4 lg:gap-6">
          {/* Currency Select */}
          <div className="relative">
            <select className="appearance-none bg-white border border-[var(--border)] rounded-full h-9 pl-4 pr-10 text-[13px] font-medium text-[var(--ink-700)] focus:outline-none focus:border-[var(--ink-300)] shadow-sm w-[160px]">
              <option>Select currency...</option>
              <option>USD</option>
              <option>EUR</option>
              <option>GBP</option>
              <option>JPY</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-400)] pointer-events-none" />
          </div>

          {/* Days Toggle */}
          <div className="flex bg-[var(--paper-2)] border border-[var(--border)] rounded-full p-1 shadow-inner">
            {days.map(d => (
              <button 
                key={d}
                onClick={() => setActiveDay(d)}
                className={cn(
                  "px-3 py-1 rounded-full text-[12px] font-bold transition-colors",
                  activeDay === d ? "bg-white text-[var(--ink-950)] shadow-sm" : "text-[var(--ink-500)] hover:text-[var(--ink-950)]"
                )}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Impact Toggles */}
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-[12px] font-bold text-rose-700 hover:bg-rose-100 transition-colors">High Impact</button>
            <button className="px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-[12px] font-bold text-amber-700 hover:bg-amber-100 transition-colors">Medium Impact</button>
            <button className="px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[12px] font-bold text-emerald-700 hover:bg-emerald-100 transition-colors">Low Impact</button>
            <button className="px-3 py-1.5 rounded-full bg-[var(--paper-2)] border border-[var(--border)] text-[12px] font-bold text-[var(--ink-500)] hover:bg-[var(--border)] transition-colors">No Impact</button>
          </div>

          {/* Passed Events Switch */}
          <div className="flex items-center gap-2 ml-auto">
            <button 
              onClick={() => setShowPassed(!showPassed)}
              className={cn(
                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors",
                showPassed ? "bg-[var(--accent)]" : "bg-[var(--ink-200)]"
              )}
            >
              <span className={cn(
                "pointer-events-none absolute left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
                showPassed ? "translate-x-4" : "translate-x-0"
              )} />
            </button>
            <span className="text-[13px] font-bold text-[var(--ink-950)]">Show Passed Events</span>
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap min-w-[800px]">
          <thead>
            <tr className="text-[12px] font-bold text-[var(--ink-400)] border-b border-[var(--border)]">
              <th className="px-6 py-4 font-medium w-32">Time</th>
              <th className="px-6 py-4 font-medium w-32">Currency</th>
              <th className="px-6 py-4 font-medium">Event Type</th>
              <th className="px-6 py-4 font-medium w-32">Previous</th>
              <th className="px-6 py-4 font-medium w-32">Forecast</th>
              <th className="px-6 py-4 font-medium w-40 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)] text-[13px]">
            {mockEvents.map((event, idx) => (
              <tr key={idx} className="hover:bg-[var(--paper-2)]/30 transition-colors group">
                <td className="px-6 py-4 font-medium text-[var(--ink-600)]">{event.time}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 font-bold text-[var(--ink-950)]">
                    <span className="text-[16px] leading-none">{event.flag}</span>
                    {event.currency}
                  </div>
                </td>
                <td className="px-6 py-4 font-bold text-[var(--ink-950)]">{event.event}</td>
                <td className="px-6 py-4 font-medium text-[var(--ink-600)]">{event.previous}</td>
                <td className="px-6 py-4 font-medium text-[var(--ink-600)]">{event.forecast}</td>
                <td className="px-6 py-4 text-right">
                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-white text-[12px] font-bold text-[var(--ink-600)] hover:bg-[var(--paper-2)] transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    Add to Calendar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
    </div>
  );
}
