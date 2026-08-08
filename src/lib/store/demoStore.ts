"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BURST_SIZE } from "@/config/env";
import * as authApi from "@/lib/api/auth";
import { resetDemoStats, getDemoStats } from "@/lib/api/demoStats";
import { DEFAULT_COST_CONSTANTS } from "@/lib/demo/cost";
import {
  DEFAULT_CHECKOUT_DRAFT,
  executeCheckout,
  sleep,
  type CheckoutDraft,
} from "@/lib/demo/runCheckout";
import type { TimelineStep } from "@/lib/demo/timeline";
import type {
  CostConstants,
  DemoRunSummary,
  DemoScenario,
  DemoStatsResponse,
  MeResponse,
  OrderResponse,
  PolicyMode,
  RawHttpExchange,
} from "@/lib/api/types";

const MAX_RECENT_RUNS = 100;

export interface BurstProgress {
  current: number;
  total: number;
}

export interface DemoStoreState {
  policy: PolicyMode;
  scenario: DemoScenario;
  token: string | null;
  user: MeResponse | null;
  recentRuns: DemoRunSummary[];
  lastStaticRun: DemoRunSummary | null;
  lastArisRun: DemoRunSummary | null;
  costConstants: CostConstants;
  lastStats: DemoStatsResponse | null;
  lastRawExchange: RawHttpExchange | null;
  checkoutDraft: CheckoutDraft;
  lastOrder: OrderResponse | null;
  lastTimeline: TimelineStep[];
  lastCustomerFelt: string | null;
  burstProgress: BurstProgress | null;
  busy: boolean;
  statusMessage: string | null;
  errorMessage: string | null;
  hydrated: boolean;

  setPolicy: (policy: PolicyMode) => void;
  setScenario: (scenario: DemoScenario) => void;
  setCostConstants: (partial: Partial<CostConstants>) => void;
  setCheckoutDraft: (partial: Partial<CheckoutDraft>) => void;
  setHydrated: (value: boolean) => void;
  recordExchange: (exchange: RawHttpExchange) => void;
  recordRun: (run: DemoRunSummary) => void;
  clearClientRuns: () => void;
  setBusy: (busy: boolean) => void;
  setStatusMessage: (message: string | null) => void;
  setErrorMessage: (message: string | null) => void;
  setLastStats: (stats: DemoStatsResponse | null) => void;

  loginWithPassword: (email: string, password: string) => Promise<void>;
  registerAccount: (
    email: string,
    password: string,
    name: string,
  ) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
  refreshStats: () => Promise<void>;
  resetServerStats: () => Promise<void>;

  runOneCheckout: () => Promise<void>;
  runBurst: (count?: number) => Promise<void>;
}

function applyAuthToken(
  set: (partial: Partial<DemoStoreState>) => void,
  token: string,
  user: MeResponse,
) {
  set({
    token,
    user,
    errorMessage: null,
    statusMessage: `Signed in as ${user.email}`,
  });
}

export const useDemoStore = create<DemoStoreState>()(
  persist(
    (set, get) => ({
      policy: "STATIC",
      scenario: "NORMAL",
      token: null,
      user: null,
      recentRuns: [],
      lastStaticRun: null,
      lastArisRun: null,
      costConstants: { ...DEFAULT_COST_CONSTANTS },
      lastStats: null,
      lastRawExchange: null,
      checkoutDraft: { ...DEFAULT_CHECKOUT_DRAFT },
      lastOrder: null,
      lastTimeline: [],
      lastCustomerFelt: null,
      burstProgress: null,
      busy: false,
      statusMessage: null,
      errorMessage: null,
      hydrated: false,

      setPolicy: (policy) => set({ policy }),
      setScenario: (scenario) => set({ scenario }),
      setCostConstants: (partial) =>
        set({
          costConstants: { ...get().costConstants, ...partial },
        }),
      setCheckoutDraft: (partial) =>
        set({
          checkoutDraft: { ...get().checkoutDraft, ...partial },
        }),
      setHydrated: (value) => set({ hydrated: value }),
      recordExchange: (exchange) => set({ lastRawExchange: exchange }),
      recordRun: (run) => {
        const recentRuns = [run, ...get().recentRuns].slice(0, MAX_RECENT_RUNS);
        set({
          recentRuns,
          lastStaticRun: run.policy === "STATIC" ? run : get().lastStaticRun,
          lastArisRun: run.policy === "ARIS" ? run : get().lastArisRun,
        });
      },
      clearClientRuns: () =>
        set({
          recentRuns: [],
          lastStaticRun: null,
          lastArisRun: null,
          lastOrder: null,
          lastTimeline: [],
          lastCustomerFelt: null,
        }),
      setBusy: (busy) => set({ busy }),
      setStatusMessage: (statusMessage) => set({ statusMessage }),
      setErrorMessage: (errorMessage) => set({ errorMessage }),
      setLastStats: (lastStats) => set({ lastStats }),

      loginWithPassword: async (email, password) => {
        set({ busy: true, errorMessage: null });
        try {
          const tokens = await authApi.login(
            { email, password },
            { onExchange: get().recordExchange },
          );
          const user = await authApi.me(tokens.accessToken, {
            onExchange: get().recordExchange,
          });
          applyAuthToken(set, tokens.accessToken, user);
        } catch (err) {
          set({
            errorMessage: err instanceof Error ? err.message : "Login failed",
          });
          throw err;
        } finally {
          set({ busy: false });
        }
      },

      registerAccount: async (email, password, name) => {
        set({ busy: true, errorMessage: null });
        try {
          const tokens = await authApi.register(
            { email, password, name },
            { onExchange: get().recordExchange },
          );
          const user = await authApi.me(tokens.accessToken, {
            onExchange: get().recordExchange,
          });
          applyAuthToken(set, tokens.accessToken, user);
        } catch (err) {
          set({
            errorMessage:
              err instanceof Error ? err.message : "Register failed",
          });
          throw err;
        } finally {
          set({ busy: false });
        }
      },

      logout: () => {
        const { token } = get();
        // Clear server in-memory demo counters while JWT is still valid.
        if (token) {
          void resetDemoStats({ token, quiet: true }).catch(() => {
            /* ignore — client session still clears below */
          });
        }
        set({
          token: null,
          user: null,
          recentRuns: [],
          lastStaticRun: null,
          lastArisRun: null,
          lastStats: null,
          lastOrder: null,
          lastTimeline: [],
          lastCustomerFelt: null,
          burstProgress: null,
          statusMessage: "Signed out. Demo amounts cleared",
          errorMessage: null,
        });
      },

      refreshMe: async () => {
        const { token } = get();
        if (!token) return;
        try {
          const user = await authApi.me(token, {
            onExchange: get().recordExchange,
          });
          set({ user, errorMessage: null });
        } catch {
          set({
            token: null,
            user: null,
            errorMessage: "Session expired. Please sign in again",
          });
        }
      },

      refreshStats: async () => {
        const { token } = get();
        if (!token) {
          set({ errorMessage: "Sign in to load demo stats" });
          return;
        }
        try {
          const stats = await getDemoStats({
            token,
            onExchange: get().recordExchange,
          });
          set({ lastStats: stats, errorMessage: null });
        } catch (err) {
          set({
            errorMessage:
              err instanceof Error ? err.message : "Failed to load stats",
          });
        }
      },

      resetServerStats: async () => {
        const { token } = get();
        if (!token) {
          set({ errorMessage: "Sign in to reset demo stats" });
          return;
        }
        set({ busy: true, errorMessage: null });
        try {
          const stats = await resetDemoStats({
            token,
            onExchange: get().recordExchange,
          });
          set({
            lastStats: stats,
            recentRuns: [],
            lastStaticRun: null,
            lastArisRun: null,
            lastOrder: null,
            lastTimeline: [],
            lastCustomerFelt: null,
            statusMessage: "Demo stats reset",
          });
        } catch (err) {
          set({
            errorMessage: err instanceof Error ? err.message : "Reset failed",
          });
        } finally {
          set({ busy: false });
        }
      },

      runOneCheckout: async () => {
        const { token, policy, scenario, checkoutDraft } = get();
        if (!token) {
          set({ errorMessage: "Sign in before running a checkout" });
          return;
        }
        set({
          busy: true,
          errorMessage: null,
          statusMessage: `Checkout… ${policy} / ${scenario}`,
        });
        try {
          const result = await executeCheckout({
            token,
            policy,
            scenario,
            draft: checkoutDraft,
            onExchange: get().recordExchange,
          });
          const recentRuns = [result.run, ...get().recentRuns].slice(
            0,
            MAX_RECENT_RUNS,
          );
          // One atomic update so cost cards + charts see the same snapshot.
          set({
            recentRuns,
            lastStaticRun:
              result.run.policy === "STATIC"
                ? result.run
                : get().lastStaticRun,
            lastArisRun:
              result.run.policy === "ARIS" ? result.run : get().lastArisRun,
            lastStats: { ...result.afterStats },
            lastOrder: result.order,
            lastTimeline: result.timeline,
            lastCustomerFelt: result.customerFelt,
            statusMessage: result.run.success
              ? `Paid in ${result.run.durationMs}ms (${policy})`
              : `Failed in ${result.run.durationMs}ms — ${result.run.failureLocation}`,
            errorMessage: result.run.success
              ? null
              : result.run.detail || "Checkout failed",
          });
        } catch (err) {
          set({
            errorMessage:
              err instanceof Error ? err.message : "Checkout failed",
            statusMessage: null,
          });
        } finally {
          set({ busy: false, burstProgress: null });
        }
      },

      runBurst: async (count = BURST_SIZE) => {
        const { token, policy, scenario, checkoutDraft } = get();
        if (!token) {
          set({ errorMessage: "Sign in before running a burst" });
          return;
        }
        const total = Math.max(1, Math.floor(count));
        set({
          busy: true,
          errorMessage: null,
          burstProgress: { current: 0, total },
          statusMessage: `Burst 0/${total}…`,
        });

        let ok = 0;
        let fail = 0;

        try {
          for (let i = 1; i <= total; i += 1) {
            set({
              burstProgress: { current: i, total },
              statusMessage: `Burst ${i}/${total}… ${policy} / ${scenario}`,
            });
            const result = await executeCheckout({
              token,
              policy,
              scenario,
              draft: checkoutDraft,
              onExchange: get().recordExchange,
            });
            const recentRuns = [result.run, ...get().recentRuns].slice(
              0,
              MAX_RECENT_RUNS,
            );
            set({
              recentRuns,
              lastStaticRun:
                result.run.policy === "STATIC"
                  ? result.run
                  : get().lastStaticRun,
              lastArisRun:
                result.run.policy === "ARIS" ? result.run : get().lastArisRun,
              lastStats: { ...result.afterStats },
              lastOrder: result.order,
              lastTimeline: result.timeline,
              lastCustomerFelt: result.customerFelt,
            });
            if (result.run.success) ok += 1;
            else fail += 1;
            if (i < total) await sleep(120);
          }
          set({
            statusMessage: `Burst done: ${ok} ok, ${fail} fail (${policy} / ${scenario})`,
            errorMessage: null,
          });
        } catch (err) {
          set({
            errorMessage:
              err instanceof Error ? err.message : "Burst stopped early",
          });
        } finally {
          set({ busy: false, burstProgress: null });
        }
      },
    }),
    {
      name: "aris-demo-store",
      version: 2,
      migrate: (persisted) => {
        const state = (persisted ?? {}) as Partial<{
          policy: DemoStoreState["policy"];
          scenario: DemoStoreState["scenario"];
          token: DemoStoreState["token"];
          user: DemoStoreState["user"];
          costConstants: DemoStoreState["costConstants"];
          checkoutDraft: DemoStoreState["checkoutDraft"];
        }>;
        // Drop legacy run-history keys from older persisted payloads.
        return {
          policy: state.policy ?? "STATIC",
          scenario: state.scenario ?? "NORMAL",
          token: state.token ?? null,
          user: state.user ?? null,
          costConstants: state.costConstants ?? { ...DEFAULT_COST_CONSTANTS },
          checkoutDraft: state.checkoutDraft ?? { ...DEFAULT_CHECKOUT_DRAFT },
        };
      },
      partialize: (state) => ({
        // Do NOT persist recentRuns / compare snapshots - page refresh zeros
        // the cost session.
        policy: state.policy,
        scenario: state.scenario,
        token: state.token,
        user: state.user,
        costConstants: state.costConstants,
        checkoutDraft: state.checkoutDraft,
      }),
      onRehydrateStorage: () => (state) => {
        // Drop legacy persisted run history from older store versions.
        useDemoStore.setState({
          recentRuns: [],
          lastStaticRun: null,
          lastArisRun: null,
        });
        state?.setHydrated(true);
      },
    },
  ),
);
