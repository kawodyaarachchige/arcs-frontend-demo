import { ApiError } from "@/lib/api/types";
import type {
  ArisDecision,
  DemoRunSummary,
  DemoScenario,
  DemoStatsResponse,
  FailureLocation,
  OrderResponse,
  PlaceOrderRequest,
  PolicyMode,
} from "@/lib/api/types";
import { getDemoStats } from "@/lib/api/demoStats";
import { placeOrder } from "@/lib/api/orders";
import {
  buildTimelineSteps,
  type TimelineStep,
} from "@/lib/demo/timeline";
import { getScenarioMeta } from "@/lib/demo/scenarios";

export interface CheckoutDraft {
  itemName: string;
  qty: number;
  unitPrice: number;
  currency: string;
}

export const DEFAULT_CHECKOUT_DRAFT: CheckoutDraft = {
  itemName: "Demo Widget",
  qty: 1,
  unitPrice: 19.99,
  currency: "USD",
};

export function draftToPlaceOrderRequest(draft: CheckoutDraft): PlaceOrderRequest {
  const qty = Math.max(1, Math.floor(draft.qty) || 1);
  const amount = Number((draft.unitPrice * qty).toFixed(2));
  return {
    itemName: draft.itemName.trim() || "Demo Widget",
    amount: amount > 0 ? amount : 0.01,
    currency: draft.currency.trim() || "USD",
  };
}

export interface CheckoutResultBundle {
  run: DemoRunSummary;
  timeline: TimelineStep[];
  order: OrderResponse | null;
  beforeStats: DemoStatsResponse;
  afterStats: DemoStatsResponse;
  customerFelt: string;
}

function inferFailureLocation(
  after: DemoStatsResponse,
  err: unknown,
): FailureLocation | string {
  const fromStats = after.lastFailureLocation;
  if (fromStats && fromStats !== "NONE") return fromStats;

  if (err instanceof ApiError) {
    const detail = (err.detail || err.title || "").toLowerCase();
    if (detail.includes("order") || err.status === 503) return "ORDER";
    if (
      detail.includes("payment") ||
      detail.includes("partner") ||
      err.status === 502
    ) {
      return "PAYMENT";
    }
  }
  return "NONE";
}

function readRetriesFromUnknown(raw: unknown): number | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const nested =
    o.properties && typeof o.properties === "object"
      ? ((o.properties as Record<string, unknown>).retriesObserved ??
        (o.properties as Record<string, unknown>).retries_observed)
      : undefined;
  const v = o.retriesObserved ?? o.retries_observed ?? nested;
  if (typeof v === "number" && Number.isFinite(v)) return Math.max(0, Math.floor(v));
  if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v))) {
    return Math.max(0, Math.floor(Number(v)));
  }
  return null;
}

export function resolveRetriesObserved(params: {
  order: OrderResponse | null;
  error: unknown;
  beforeStats: DemoStatsResponse;
  afterStats: DemoStatsResponse;
}): number {
  const fromOrder = readRetriesFromUnknown(params.order);
  if (fromOrder !== null) return fromOrder;

  if (params.error instanceof ApiError) {
    const fromProblem = readRetriesFromUnknown(params.error.raw);
    if (fromProblem !== null) return fromProblem;
  }

  const fromLast = params.afterStats.lastRetriesObserved;
  if (typeof fromLast === "number" && Number.isFinite(fromLast)) {
    return Math.max(0, Math.floor(fromLast));
  }

  return Math.max(
    0,
    params.afterStats.retryAttemptsTotal - params.beforeStats.retryAttemptsTotal,
  );
}

export function customerFeltCaption(run: DemoRunSummary): string {
  if (run.success) {
    return "What the customer felt: checkout finished — order paid.";
  }
  const where =
    run.failureLocation === "ORDER"
      ? "while the store was preparing the order"
      : run.failureLocation === "PAYMENT"
        ? "while payment was being taken"
        : "during checkout";
  const wait =
    run.retriesObserved > 0
      ? ` They waited through ${run.retriesObserved} retry attempt(s).`
      : "";
  return `What the customer felt: checkout failed ${where}.${wait}`;
}

export async function executeCheckout(params: {
  token: string;
  policy: PolicyMode;
  scenario: DemoScenario;
  draft: CheckoutDraft;
  onExchange: (exchange: import("@/lib/api/types").RawHttpExchange) => void;
}): Promise<CheckoutResultBundle> {
  const body = draftToPlaceOrderRequest(params.draft);
  const started = performance.now();

  const beforeStats = await getDemoStats({
    token: params.token,
    onExchange: params.onExchange,
    quiet: true,
  });

  let order: OrderResponse | null = null;
  let error: unknown = null;
  let statusCode: number | undefined;
  let detail: string | undefined;

  try {
    order = await placeOrder(body, {
      token: params.token,
      policy: params.policy,
      scenario: params.scenario,
      onExchange: params.onExchange,
    });
  } catch (err) {
    error = err;
    if (err instanceof ApiError) {
      statusCode = err.status;
      detail = err.detail || err.message;
    } else if (err instanceof Error) {
      detail = err.message;
    }
  }

  const afterStats = await getDemoStats({
    token: params.token,
    onExchange: params.onExchange,
    quiet: true,
  });

  const durationMs = Math.round(performance.now() - started);
  const retriesObserved = resolveRetriesObserved({
    order,
    error,
    beforeStats,
    afterStats,
  });
  const success = order !== null && !error;
  const failureLocation = success
    ? "NONE"
    : inferFailureLocation(afterStats, error);

  const arisDecision =
    params.policy === "ARIS" && afterStats.lastArisDecision
      ? (afterStats.lastArisDecision as ArisDecision)
      : undefined;

  const run: DemoRunSummary = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    policy: params.policy,
    scenario: params.scenario,
    success,
    retriesObserved,
    durationMs,
    failureLocation,
    arisDecision,
    orderId: order?.id,
    statusCode,
    detail,
    itemName: body.itemName,
    amount: body.amount,
  };

  const meta = getScenarioMeta(params.scenario);
  const timeline = buildTimelineSteps({
    success,
    retriesObserved,
    failureLocation: String(failureLocation),
    scenarioGroup: meta?.group,
  });

  return {
    run,
    timeline,
    order,
    beforeStats,
    afterStats,
    customerFelt: customerFeltCaption(run),
  };
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
