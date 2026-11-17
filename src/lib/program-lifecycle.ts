export type CrmPhase = "challenge" | "verification" | "phase_3" | "funded";
export type TerminalPhase = "challenge" | "funded";
export type TerminalStatus = "active" | "funded";

export interface ProgramLifecycleRow {
  key?: string | null;
  label?: string | null;
  short_label?: string | null;
  phases?: number | string | null;
  phase_1_rule_id?: string | null;
  phase_2_rule_id?: string | null;
  phase_3_rule_id?: string | null;
  funded_rule_id?: string | null;
  /** Access: the funded account is only issued once the fee is paid. */
  pay_after_pass?: boolean | null;
  upfront_fee?: number | string | null;
  profit_split?: number | string | null;
}

export interface AccountLifecycleConfig {
  phase: CrmPhase;
  phaseIndex: number;
  label: string;
  terminalPhase: TerminalPhase;
  terminalStatus: TerminalStatus;
  ruleId: string | null;
}

export const PHASE_INDEX: Record<CrmPhase, number> = {
  challenge: 1,
  verification: 2,
  phase_3: 3,
  funded: 99,
};

export const PHASE_LABEL: Record<CrmPhase, string> = {
  challenge: "Phase 1",
  verification: "Phase 2",
  phase_3: "Phase 3",
  funded: "Funded",
};

const PHASE_BY_INDEX: Record<number, CrmPhase> = { 1: "challenge", 2: "verification", 3: "phase_3", 99: "funded" };

export function normalizePhase(value: unknown): CrmPhase {
  return value === "verification" || value === "phase_3" || value === "funded" ? value : "challenge";
}

/**
 * The phase an account is in. phase_index is written once when the account is
 * created and never touched again, so it wins over the `phase` text column.
 */
export function phaseOfAccount(account: { phase?: unknown; phase_index?: unknown }): CrmPhase {
  const byIndex = PHASE_BY_INDEX[Number(account.phase_index)];
  return byIndex ?? normalizePhase(account.phase);
}

/** A program with no evaluation phases issues a funded account straight away (Instant). */
export function isRiskOnlyProgram(program: ProgramLifecycleRow | null | undefined) {
  if (!program || program.phases == null || program.phases === "") return false;
  return Number(program.phases) === 0;
}

export function terminalLifecycleForPhase(phase: CrmPhase) {
  const funded = phase === "funded";
  return {
    terminalPhase: funded ? "funded" : "challenge",
    terminalStatus: funded ? "funded" : "active",
  } satisfies Pick<AccountLifecycleConfig, "terminalPhase" | "terminalStatus">;
}

export function ruleIdForPhase(phase: CrmPhase, program: ProgramLifecycleRow, fallbackRuleId: string | null = null) {
  if (phase === "challenge") return program.phase_1_rule_id || fallbackRuleId;
  if (phase === "verification") return program.phase_2_rule_id || fallbackRuleId;
  if (phase === "phase_3") return program.phase_3_rule_id || program.phase_2_rule_id || fallbackRuleId;
  return program.funded_rule_id || fallbackRuleId;
}

export function lifecycleForPhase(program: ProgramLifecycleRow, phase: CrmPhase, fallbackRuleId: string | null = null): AccountLifecycleConfig {
  return {
    phase,
    phaseIndex: PHASE_INDEX[phase],
    label: PHASE_LABEL[phase],
    ...terminalLifecycleForPhase(phase),
    ruleId: ruleIdForPhase(phase, program, fallbackRuleId),
  };
}

export function getInitialAccountLifecycle(program: ProgramLifecycleRow): AccountLifecycleConfig {
  if (isRiskOnlyProgram(program)) {
    return { ...lifecycleForPhase(program, "funded"), ruleId: program.funded_rule_id || program.phase_1_rule_id || null };
  }
  return lifecycleForPhase(program, "challenge");
}

export function getNextAccountLifecycle(
  program: ProgramLifecycleRow,
  currentPhase: CrmPhase,
  fallbackRuleId: string | null = null,
): AccountLifecycleConfig | null {
  if (isRiskOnlyProgram(program) || currentPhase === "funded") return null;

  const totalPhases = Math.max(1, Number(program.phases) || 1);
  let phase: CrmPhase | null = null;
  if (currentPhase === "challenge") phase = totalPhases <= 1 ? "funded" : "verification";
  else if (currentPhase === "verification") phase = totalPhases <= 2 ? "funded" : "phase_3";
  else if (currentPhase === "phase_3") phase = "funded";
  if (!phase) return null;

  return lifecycleForPhase(program, phase, fallbackRuleId);
}
