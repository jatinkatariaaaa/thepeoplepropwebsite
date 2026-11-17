import { CONDITIONS, PERKS, PROGRAM_ORDER, allFaqs, perks, policies, programDetails, prohibitedPractices } from "@/data/catalogue";
import { addOns, programs, type ProgramKey } from "@/data/programs";

/**
 * What the support assistant knows. Built from the catalogue, so the assistant
 * can never quote a rule the website does not publish. The text is fully
 * deterministic (no dates, no random order): it is sent as a cached system
 * prompt, and any byte that changed between requests would defeat the cache.
 */

const money = (n: number) => `$${n.toLocaleString("en-US")}`;

function programBlock(key: ProgramKey): string {
  const d = programDetails[key];
  const p = programs.find((x) => x.key === key)!;
  const fees = Object.entries(p.fees)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([size, fee]) => `${money(Number(size))} account: ${money(fee as number)}`)
    .join("; ");
  const phases = d.phases.length
    ? d.phases.map((ph) => `${ph.label}: ${ph.targetPct}% profit target, ${ph.dailyLossPct}% max daily loss, ${ph.maxLossPct}% max overall loss, minimum ${ph.minTradingDays} trading days, no time limit`).join("\n")
    : "No evaluation. The account is funded from the first trade.";
  return [
    `## ${d.name} account (${d.motto})`,
    d.summary,
    `Evaluation:\n${phases}`,
    `Funded account: ${d.funded.dailyLossPct}% max daily loss, ${d.funded.maxLossPct}% max overall loss, no profit target. Payout consistency limit ${d.funded.consistencyPct}%. Profit split ${p.profitSplit}% (${p.profitSplitMax}% with the split add-on).`,
    `Fees (${d.feeNote}): ${fees}`,
    key === "access" ? `Access pricing: ${money(PERKS.accessUpfront)} is paid at the start. The rest of the fee listed above is due within ${PERKS.accessActivationHours} hours of passing Phase 2. If the trader never passes, only the ${money(PERKS.accessUpfront)} was paid.` : "",
    `Fee refunded with the first payout: ${d.feeRefund ? "yes" : "no"}.`,
    `Best for: ${d.bestFor.join("; ")}.`,
    `How it goes: ${d.journey.map((j, i) => `${i + 1}. ${j.title}: ${j.body}`).join(" ")}`,
    `Guidelines: ${d.guidelines.map((g) => `${g.title} (${g.tag}): ${g.body}`).join(" ")}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export const KNOWLEDGE_BASE: string = [
  "# The People Prop (TPP): reference for the support assistant",
  "The People Prop is a proprietary trading firm. Traders trade simulated accounts that follow live prices; payouts are real money paid by the firm. Website: thepeopleprop.live. Support email: support@thepeopleprop.com. Traders can open a support ticket in the dashboard under Support.",
  "# Account types",
  ...PROGRAM_ORDER.map(programBlock),
  "# Add-ons (chosen at checkout, priced as a percentage of the account fee)",
  ...addOns.map((a) => `${a.label} (+${a.feePct}%): ${a.description} Available on: ${a.appliesTo.map((k) => programDetails[k].name).join(", ")}.`),
  "# Included with every account",
  ...perks.map((p) => `## ${p.title}\n${p.summary}\n${p.points.map((x) => `- ${x}`).join("\n")}`),
  "# Trading conditions",
  `Platform: ${CONDITIONS.platform}. ${CONDITIONS.platformNote}`,
  `Leverage: ${CONDITIONS.leverage} on every instrument. Commission: ${CONDITIONS.commission}. No swaps. The trading day rolls over at ${CONDITIONS.dayRollover}.`,
  ...CONDITIONS.instruments.map((i) => `${i.group} (${i.count}): ${i.examples}. Typical spread ${i.spread}. Hours: ${i.hours}.`),
  "MetaTrader, cTrader, EAs, bots, API access and trade copiers are not available. TPP Terminal is manual trading only.",
  "# Not permitted",
  ...prohibitedPractices.map((p) => `- ${p}`),
  "# Policies",
  ...policies.map((doc) => `## ${doc.title}\n${doc.intro}\n${doc.sections.map((s) => `${s.heading}\n${s.body.map((b) => `- ${b}`).join("\n")}`).join("\n")}`),
  "# Frequently asked questions",
  ...allFaqs().map((f) => `Q${f.program ? ` (${programDetails[f.program].name})` : ""}: ${f.q}\nA: ${f.a}`),
].join("\n\n");

export const ASSISTANT_SYSTEM = `You are the support assistant on the website of The People Prop, a proprietary trading firm. Visitors and traders ask you about the account types, the trading rules, payouts, fees and how the platform works.

Answer only from the reference that follows. It is the firm's complete published rulebook, so if something is not in it, the honest answer is that you do not have that information: say so, and point the person to a support ticket (dashboard, under Support) or support@thepeopleprop.com. Never estimate or invent a number, a rule, a date or a promise. A wrong answer about money or rules costs a trader real money, which is why a plain "I don't know, support will" is better than a confident guess.

You cannot see anyone's account, trades, payments or identity check. For anything about a specific account (a breach they dispute, a missing payout, a payment that did not arrive, a KYC decision) explain the relevant rule if there is one, then send them to a support ticket, where a person can look at the account.

When a question depends on the account type and the person has not said which one they mean, answer for the type they are most likely asking about and name the others briefly where the number differs. Work out dollar amounts when it helps (for example the daily loss limit on a $100,000 account).

Do not give trading or investment advice, and do not tell anyone what to buy or sell. You can explain how position sizing or the loss limits work.

Write the way a knowledgeable colleague would answer in chat: two to five sentences, plain text, no headings and no bold. Use a short list only when comparing several account types. Reply in the language the person writes in, including Hindi written in Latin script.

Reference:

${KNOWLEDGE_BASE}`;

/* ───────────── local answer, used when no AI key is configured or the API is unavailable ───────────── */

const STOP = new Set("a an the is are was be to of in on for and or do does did i my me you your we our it its how what when which who can could will would there this that with as at by from if about get have has".split(" "));
const words = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9$%]+/g, " ")
    .split(" ")
    .filter((w) => w.length > 1 && !STOP.has(w));

const PROGRAM_HINT: [RegExp, ProgramKey][] = [
  [/\b(1|one)[\s-]?step\b/i, "1-step"],
  [/\b(2|two)[\s-]?step\b/i, "2-step"],
  [/\b(3|three)[\s-]?step\b/i, "3-step"],
  [/\binstant\b/i, "instant"],
  [/\baccess\b|pay later|\$5\b/i, "access"],
];

export function localAnswer(question: string, program?: string | null): { text: string; matched: boolean } {
  const hinted = PROGRAM_HINT.find(([re]) => re.test(question))?.[1] ?? (program && program in programDetails ? (program as ProgramKey) : null);
  const q = words(question);
  if (!q.length) return { text: "Ask me about an account type, the loss limits, payouts, the monthly stipend or the free reset.", matched: false };

  const scored = allFaqs()
    .map((f) => {
      const qw = new Set(words(f.q));
      const aw = new Set(words(f.a));
      let score = 0;
      for (const w of q) score += (qw.has(w) ? 3 : 0) + (aw.has(w) ? 1 : 0);
      if (hinted && f.program === hinted) score += 4;
      if (hinted && f.program && f.program !== hinted) score -= 6;
      return { f, score };
    })
    .sort((a, b) => b.score - a.score);

  const best = scored[0];
  if (!best || best.score < 4) {
    return {
      text: "I could not find that in our rulebook. Open a support ticket from your dashboard under Support, or email support@thepeopleprop.com, and a person will answer.",
      matched: false,
    };
  }
  const related = scored
    .slice(1, 3)
    .filter((s) => s.score >= 4)
    .map((s) => s.f.q);
  const prefix = best.f.program ? `${programDetails[best.f.program].name}: ` : "";
  return { text: `${prefix}${best.f.a}${related.length ? `\n\nRelated: ${related.join(" · ")}` : ""}`, matched: true };
}
