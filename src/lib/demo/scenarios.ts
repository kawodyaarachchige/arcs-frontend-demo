import type { DemoScenario } from "@/lib/api/types";

export type ScenarioGroupId = "healthy" | "payment" | "order";

export interface ScenarioMeta {
  id: DemoScenario;
  label: string;
  group: ScenarioGroupId;
  caption?: string;
}

export const SCENARIO_GROUPS: {
  id: ScenarioGroupId;
  label: string;
}[] = [
  { id: "healthy", label: "Healthy" },
  { id: "payment", label: "Payment path" },
  { id: "order", label: "Order path" },
];

export const SCENARIOS: ScenarioMeta[] = [
  {
    id: "NORMAL",
    label: "NORMAL",
    group: "healthy",
    caption: "Healthy path (Shop and payment both fine)",
  },
  {
    id: "BUSY_SPIKE",
    label: "BUSY_SPIKE",
    group: "payment",
    caption: "Sudden rush (Fixed retries can stampede)",
  },
  {
    id: "PAYMENT_SLOW",
    label: "PAYMENT_SLOW",
    group: "payment",
    caption: "Payment desk is crawling.",
  },
  {
    id: "PAYMENT_DOWN",
    label: "PAYMENT_DOWN",
    group: "payment",
    caption: "Payment desk is locked (Retries won’t help)",
  },
  {
    id: "PARTNER_TIMEOUT",
    label: "PARTNER_TIMEOUT",
    group: "payment",
    caption: "Outside bank partner didn’t answer in time.",
  },
  {
    id: "ORDER_SLOW",
    label: "ORDER_SLOW",
    group: "order",
    caption: "Shop is slow preparing the order.",
  },
  {
    id: "ORDER_DOWN",
    label: "ORDER_DOWN",
    group: "order",
    caption: "Shop is closed (Don’t even try payment)",
  },
  {
    id: "ORDER_DB_DOWN",
    label: "ORDER_DB_DOWN",
    group: "order",
    caption: "Shop’s database is down (Order can’t be saved)",
  },
];

export function scenariosInGroup(group: ScenarioGroupId): ScenarioMeta[] {
  return SCENARIOS.filter((s) => s.group === group);
}

export function getScenarioMeta(id: DemoScenario): ScenarioMeta | undefined {
  return SCENARIOS.find((s) => s.id === id);
}

export function isPaymentPathScenario(id: DemoScenario): boolean {
  return getScenarioMeta(id)?.group === "payment";
}

export function isOrderPathScenario(id: DemoScenario): boolean {
  return getScenarioMeta(id)?.group === "order";
}
