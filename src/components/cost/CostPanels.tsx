"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  computeCostBreakdown,
  formatDemoMoney,
  parseNonNegativeNumber,
} from "@/lib/demo/cost";
import { useDemoStore } from "@/lib/store/demoStore";

export function StatsCards() {
  const hydrated = useDemoStore((s) => s.hydrated);
  const lastStats = useDemoStore((s) => s.lastStats);
  const recentRuns = useDemoStore((s) => s.recentRuns);
  const costConstants = useDemoStore((s) => s.costConstants);
  const burstProgress = useDemoStore((s) => s.burstProgress);

  const breakdown = useMemo(
    () => computeCostBreakdown(lastStats, recentRuns, costConstants),
    [lastStats, recentRuns, costConstants],
  );

  if (!hydrated) {
    return (
      <div>
        <div className="stat-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="stat-card">
              <p className="stat-label">…</p>
              <p className="stat-value">$0.0000</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const cards = [
    {
      label: "Customer actions",
      value: String(breakdown.totalRequests),
    },
    {
      label: "Success / fail",
      value: `${breakdown.successCount} / ${breakdown.failCount}`,
    },
    {
      label: "Retry attempts",
      value: String(breakdown.retryAttemptsTotal),
    },
    {
      label: "Extra calls (est.)",
      value: String(breakdown.estimatedExtraCalls),
    },
    {
      label: "ORDER fails (session)",
      value: String(breakdown.orderFails),
    },
    {
      label: "PAYMENT fails (session)",
      value: String(breakdown.paymentFails),
    },
    {
      label: "Infra waste (est.)",
      value: formatDemoMoney(breakdown.infraWaste),
      hint: `${breakdown.estimatedExtraCalls} × ${costConstants.costPerApiCall} (costPerApiCall)`,
    },
    {
      label: "Business loss (est.)",
      value: formatDemoMoney(breakdown.businessLoss, 2),
      hint: `${breakdown.failCount} × ${costConstants.costPerFailedOrder} (costPerFailedOrder)`,
    },
  ];

  return (
    <div>
      {burstProgress ? (
        <p className="live-burst" role="status">
          Burst live: {burstProgress.current}/{burstProgress.total}
        </p>
      ) : null}
      <div className="stat-grid">
        {cards.map((c) => (
          <div key={c.label} className="stat-card">
            <p className="stat-label">{c.label}</p>
            <p className="stat-value">{c.value}</p>
            {"hint" in c && c.hint ? (
              <p className="stat-hint">{c.hint}</p>
            ) : null}
          </div>
        ))}
      </div>
      <p className="cost-total">
        Estimated total demo cost:{" "}
        <strong>{formatDemoMoney(breakdown.totalDemoCost)}</strong>
        <span className="cost-total-split">
          {" "}
          (infra {formatDemoMoney(breakdown.infraWaste)} + business{" "}
          {formatDemoMoney(breakdown.businessLoss, 2)})
        </span>
      </p>
      <p className="panel-hint">
        These amounts follow this browser session (same log as the charts). Use{" "}
        <strong>Reset stats</strong> or log out to clear. Page refresh also
        clears the session log.
      </p>
      {lastStats ? (
        <p className="panel-hint">
          Server snapshot: {lastStats.totalRequests} actions,{" "}
          {lastStats.successCount}/{lastStats.failCount} ok/fail,{" "}
          {lastStats.retryAttemptsTotal} retries (cleared only by Reset stats /
          logout).
        </p>
      ) : null}
      <p className="disclaimer">
        Demo estimate for presentation, not production billing.
      </p>
    </div>
  );
}

export function CostModelControls() {
  const costConstants = useDemoStore((s) => s.costConstants);
  const setCostConstants = useDemoStore((s) => s.setCostConstants);
  const busy = useDemoStore((s) => s.busy);

  return (
    <div className="panel">
      <h2 className="panel-title">Cost model (editable)</h2>
      <div className="form-row">
        <label>
          costPerApiCall
          <input
            type="number"
            step="0.0001"
            min={0}
            disabled={busy}
            value={costConstants.costPerApiCall}
            onChange={(e) =>
              setCostConstants({
                costPerApiCall: parseNonNegativeNumber(e.target.value),
              })
            }
          />
        </label>
        <label>
          costPerFailedOrder
          <input
            type="number"
            step="0.01"
            min={0}
            disabled={busy}
            value={costConstants.costPerFailedOrder}
            onChange={(e) =>
              setCostConstants({
                costPerFailedOrder: parseNonNegativeNumber(e.target.value),
              })
            }
          />
        </label>
      </div>
      <p className="panel-hint">
        infraWaste = extraCalls × costPerApiCall · businessLoss = fails ×
        costPerFailedOrder. Default api call cost is 0.0001 (four decimals) —
        failed-order penalty is a separate dial (default 2.00) and often
        dominates the total.
      </p>
    </div>
  );
}

export function RunsCharts() {
  const hydrated = useDemoStore((s) => s.hydrated);
  const recentRuns = useDemoStore((s) => s.recentRuns);
  const scenario = useDemoStore((s) => s.scenario);
  const runs = hydrated ? recentRuns : [];

  const lastN = useMemo(() => {
    const slice = [...runs].slice(0, 20).reverse();
    return slice.map((r, i) => ({
      i: i + 1,
      success: r.success ? 1 : 0,
      fail: r.success ? 0 : 1,
      retries: r.retriesObserved,
      policy: r.policy,
      scenario: r.scenario,
    }));
  }, [runs]);

  const compareBars = useMemo(() => {
    const same = runs.filter((r) => r.scenario === scenario);
    const staticRuns = same.filter((r) => r.policy === "STATIC");
    const arisRuns = same.filter((r) => r.policy === "ARIS");
    const avg = (arr: typeof same, key: "retriesObserved") =>
      arr.length ? arr.reduce((s, r) => s + r[key], 0) / arr.length : 0;
    const successRate = (arr: typeof same) =>
      arr.length ? arr.filter((r) => r.success).length / arr.length : 0;

    return [
      {
        name: "Avg retries",
        STATIC: Number(avg(staticRuns, "retriesObserved").toFixed(2)),
        ARIS: Number(avg(arisRuns, "retriesObserved").toFixed(2)),
      },
      {
        name: "Success rate",
        STATIC: Number(successRate(staticRuns).toFixed(2)),
        ARIS: Number(successRate(arisRuns).toFixed(2)),
      },
    ];
  }, [runs, scenario]);

  if (!lastN.length) {
    return (
      <div className="panel">
        <h2 className="panel-title">Charts</h2>
        <p className="panel-hint">Run checkouts to populate charts.</p>
      </div>
    );
  }

  return (
    <div className="charts-stack">
      <div className="panel chart-panel">
        <h2 className="panel-title">Success / fail (last {lastN.length})</h2>
        <div className="chart-box">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={lastN}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d5dee5" />
              <XAxis dataKey="i" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="success"
                stroke="#1f7a3f"
                name="Success"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="fail"
                stroke="#b42318"
                name="Fail"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="panel chart-panel">
        <h2 className="panel-title">Retries (last {lastN.length})</h2>
        <div className="chart-box">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={lastN}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d5dee5" />
              <XAxis dataKey="i" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="retries" fill="#0f7a6c" name="Retries" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="panel chart-panel">
        <h2 className="panel-title">STATIC vs ARIS (scenario {scenario})</h2>
        <div className="chart-box">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={compareBars}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d5dee5" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="STATIC" fill="#243642" />
              <Bar dataKey="ARIS" fill="#0f7a6c" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
