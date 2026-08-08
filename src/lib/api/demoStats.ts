import { apiRequest, type RequestOptions } from "@/lib/api/client";
import type { DemoStatsResponse } from "@/lib/api/types";
import { normalizeDemoStats } from "@/lib/demo/cost";

type Opts = Pick<RequestOptions, "onExchange" | "quiet"> & {
  token: string;
};

export async function getDemoStats(opts: Opts): Promise<DemoStatsResponse> {
  const raw = await apiRequest<unknown>("/api/demo/stats", {
    method: "GET",
    token: opts.token,
    onExchange: opts.onExchange,
    quiet: opts.quiet,
  });
  return normalizeDemoStats(raw);
}

export async function resetDemoStats(opts: Opts): Promise<DemoStatsResponse> {
  const raw = await apiRequest<unknown>("/api/demo/stats/reset", {
    method: "POST",
    token: opts.token,
    onExchange: opts.onExchange,
    quiet: opts.quiet,
  });
  return normalizeDemoStats(raw);
}
