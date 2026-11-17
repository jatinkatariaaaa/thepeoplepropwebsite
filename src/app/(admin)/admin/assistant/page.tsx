import { supabaseAdmin } from "@/lib/supabase";
import { Chip, Empty, PageTitle, Panel, PanelHead, Stat, table } from "@/components/dashboard/glass";
import { MessagesSquare, Sparkles } from "lucide-react";

export const revalidate = 0;

type Row = { id: string; question: string; answer: string | null; source: string; program_key: string | null; created_at: string };

/** What visitors ask the assistant. Questions it could not answer from the rulebook are the ones to add to the FAQ. */
export default async function AdminAssistantPage() {
  const { data } = await supabaseAdmin.from("assistant_logs").select("id, question, answer, source, program_key, created_at").order("created_at", { ascending: false }).limit(300);
  const rows = (data ?? []) as Row[];
  const unanswered = rows.filter((r) => /could not find|do not have that information|don't have that information|can't help with that/i.test(r.answer ?? ""));
  const since = Date.now() - 7 * 86_400_000;

  return (
    <div className="mx-auto max-w-7xl">
      <PageTitle lead="Assistant" fade="log" lede="Every question asked in the chat widget, newest first. The assistant answers only from the published rulebook, so a question it had to pass on is a gap in the FAQ." />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Questions (last 300)" value={String(rows.length)} icon={MessagesSquare} highlight />
        <Stat label="In the last 7 days" value={String(rows.filter((r) => new Date(r.created_at).getTime() > since).length)} />
        <Stat label="Passed to support" value={String(unanswered.length)} />
        <Stat label="Answered by AI" value={String(rows.filter((r) => r.source === "ai").length)} icon={Sparkles} />
      </div>

      <Panel>
        <PanelHead title="Conversations" sub="Source shows whether Claude answered (AI) or the built-in rulebook search did (KB)." />
        {rows.length === 0 ? (
          <Empty icon={MessagesSquare} title="No questions yet">
            Questions appear here as soon as visitors use the assistant.
          </Empty>
        ) : (
          <div className={table.scroll}>
            <table className="w-full min-w-[760px] border-collapse">
              <thead>
                <tr className={table.headRow}>
                  {["When", "Question", "Answer", "Page", "Source"].map((h) => (
                    <th key={h} className={table.th}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className={table.row}>
                    <td className={`${table.td} align-top text-[12.5px] whitespace-nowrap text-[var(--g-muted-ink)]`}>{new Date(r.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
                    <td className={`${table.td} max-w-[280px] align-top text-[13.5px] font-medium text-[var(--g-ink)]`}>{r.question}</td>
                    <td className={`${table.td} max-w-[420px] align-top text-[13px] leading-relaxed text-[var(--g-muted-ink)]`}>
                      <span className="line-clamp-4 whitespace-pre-wrap">{r.answer}</span>
                    </td>
                    <td className={`${table.td} align-top text-[12.5px] text-[var(--g-muted-ink)]`}>{r.program_key ?? "—"}</td>
                    <td className={`${table.td} align-top`}>
                      <Chip tone={r.source === "ai" ? "lime" : r.source === "kb" ? "emerald" : "amber"} className="uppercase">
                        {r.source}
                      </Chip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
