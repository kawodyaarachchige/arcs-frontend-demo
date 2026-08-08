import type { CostConstants, DemoRunSummary, DemoStatsResponse } from "@/lib/api/types";

export const DEFAULT_COST_CONSTANTS: CostConstants = {
  costPerApiCall: 0.0001,
  costPerFailedOrder: 2.0,
};

export interface CostBreakdown {
  totalRequests: number;
  successCount: number;
  failCount: number;
  retryAttemptsTotal: number;
  estimatedExtraCalls: number;
  infraWaste: number;
  businessLoss: number;
  totalDemoCost: number;
  successRate: number;
  orderFails: number;
  paymentFails: number;
  source: "session";
}

/** Fixed demo-money format — never use locale currency (avoids SSR hydration mismatch). */
export function formatDemoMoney(n: number, digits = 4): string {
  const value = Number.isFinite(n) ? n : 0;
  return `$${value.toFixed(digits)}`;
}

export function parseNonNegativeNumber(raw: string): number {
  const v = Number(raw);
  if (!Number.isFinite(v) || v < 0) return 0;
  return v;
}

/** Aggregate counters from this browser’s recentRuns (same source as charts). */
export function aggregateSessionStats(
  recentRuns: DemoRunSummary[],
): Pick<
  DemoStatsResponse,
  | "totalRequests"
  | "successCount"
  | "failCount"
  | "retryAttemptsTotal"
  | "estimatedExtraCalls"
> {
  const successCount = recentRuns.filter((r) => r.success).length;
  const failCount = recentRuns.filter((r) => !r.success).length;
  const retryAttemptsTotal = recentRuns.reduce(
    (sum, r) => sum + (Number(r.retriesObserved) || 0),
    0,
  );
  return {
    totalRequests: recentRuns.length,
    successCount,
    failCount,
    retryAttemptsTotal,
    estimatedExtraCalls: retryAttemptsTotal,
  };
}

/** Coerce gateway JSON into numeric DemoStatsResponse fields. */
export function normalizeDemoStats(raw: unknown): DemoStatsResponse {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >;
  const num = (...keys: string[]): number => {
    for (const key of keys) {
      const v = o[key];
      if (typeof v === "number" && Number.isFinite(v)) return v;
      if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v))) {
        return Number(v);
      }
    }
    return 0;
  };
  const str = (...keys: string[]): string => {
    for (const key of keys) {
      const v = o[key];
      if (typeof v === "string") return v;
    }
    return "NONE";
  };
  const decision = o.lastArisDecision ?? o.last_aris_decision ?? {};

  return {
    totalRequests: num("totalRequests", "total_requests"),
    successCount: num("successCount", "success_count"),
    failCount: num("failCount", "fail_count"),
    retryAttemptsTotal: num("retryAttemptsTotal", "retry_attempts_total"),
    estimatedExtraCalls: num("estimatedExtraCalls", "estimated_extra_calls"),
    lastPolicyMode: str("lastPolicyMode", "last_policy_mode"),
    lastScenario: str("lastScenario", "last_scenario"),
    lastFailureLocation: str("lastFailureLocation", "last_failure_location"),
    lastArisDecision:
      decision && typeof decision === "object"
        ? (decision as DemoStatsResponse["lastArisDecision"])
        : {},
    lastRetriesObserved: num("lastRetriesObserved", "last_retries_observed"),
  };
}

/**
 * Cost cards follow this browser session (same as charts).
 * Browser refresh clears them when recentRuns are not persisted.
 */
export function computeCostBreakdown(
  _stats: DemoStatsResponse | null,
  recentRuns: DemoRunSummary[],
  constants: CostConstants,
): CostBreakdown {
  const session = aggregateSessionStats(recentRuns);
  const costPerApiCall = Number(constants.costPerApiCall) || 0;
  const costPerFailedOrder = Number(constants.costPerFailedOrder) || 0;

  const infraWaste = session.estimatedExtraCalls * costPerApiCall;
  const businessLoss = session.failCount * costPerFailedOrder;

  return {
    ...session,
    infraWaste,
    businessLoss,
    totalDemoCost: infraWaste + businessLoss,
    successRate: session.successCount / Math.max(session.totalRequests, 1),
    orderFails: recentRuns.filter((r) => r.failureLocation === "ORDER").length,
    paymentFails: recentRuns.filter((r) => r.failureLocation === "PAYMENT")
      .length,
    source: "session",
  };
}

export function computeSessionCost(
  recentRuns: DemoRunSummary[],
  constants: CostConstants,
): Pick<CostBreakdown, "infraWaste" | "businessLoss" | "totalDemoCost"> {
  return computeCostBreakdown(null, recentRuns, constants);
}
