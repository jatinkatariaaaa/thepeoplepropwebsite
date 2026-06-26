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

export const RISK_ONLY_PROGRAM_KEYS = new Set(["instant", "access"]);

export function normalizePhase(value: unknown): CrmPhase {
  return value === "verification" || value === "phase_3" || value === "funded" ? value : "challenge";
}

export function isRiskOnlyProgram(program: ProgramLifecycleRow | null | undefined) {
  const key = String(program?.key || "").toLowerCase();
  return RISK_ONLY_PROGRAM_KEYS.has(key) || Number(program?.phases) === 0;
}

export function terminalLifecycleForPhase(phase: CrmPhase) {
  const funded = phase === "funded";
  return {
    terminalPhase: funded ? "funded" : "challenge",
    terminalStatus: funded ? "funded" : "active",
  } satisfies Pick<AccountLifecycleConfig, "terminalPhase" | "terminalStatus">;
}

export function ruleIdForPhase(
  phase: CrmPhase,
  program: ProgramLifecycleRow,
  fallbackRuleId: string | null = null,
) {
  if (phase === "challenge") return program.phase_1_rule_id || fallbackRuleId;
  if (phase === "verification") return program.phase_2_rule_id || fallbackRuleId;
  if (phase === "phase_3") return program.phase_3_rule_id || program.phase_2_rule_id || fallbackRuleId;
  return program.funded_rule_id || fallbackRuleId;
}

export function getInitialAccountLifecycle(program: ProgramLifecycleRow): AccountLifecycleConfig {
  const phase: CrmPhase = isRiskOnlyProgram(program) ? "funded" : "challenge";
  const terminal = terminalLifecycleForPhase(phase);
  const ruleId = isRiskOnlyProgram(program)
    ? program.funded_rule_id || program.phase_1_rule_id || null
    : program.phase_1_rule_id || null;

  return {
    phase,
    phaseIndex: PHASE_INDEX[phase],
    label: PHASE_LABEL[phase],
    ...terminal,
    ruleId,
  };
}

export function getNextAccountLifecycle(
  program: ProgramLifecycleRow,
  currentPhase: CrmPhase,
  fallbackRuleId: string | null = null,
): AccountLifecycleConfig | null {
  if (isRiskOnlyProgram(program) || currentPhase === "funded") {
    return null;
  }

  const totalPhases = Math.max(1, Number(program.phases) || 1);
  let phase: CrmPhase | null = null;

  if (currentPhase === "challenge") {
    phase = totalPhases <= 1 ? "funded" : "verification";
  } else if (currentPhase === "verification") {
    phase = totalPhases <= 2 ? "funded" : "phase_3";
  } else if (currentPhase === "phase_3") {
    phase = "funded";
  }

  if (!phase) return null;

  const terminal = terminalLifecycleForPhase(phase);
  return {
    phase,
    phaseIndex: PHASE_INDEX[phase],
    label: PHASE_LABEL[phase],
    ...terminal,
    ruleId: ruleIdForPhase(phase, program, fallbackRuleId),
  };
}
