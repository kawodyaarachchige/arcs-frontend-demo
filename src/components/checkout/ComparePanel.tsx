"use client";

import type { DemoRunSummary } from "@/lib/api/types";
import { useDemoStore } from "@/lib/store/demoStore";

function RunSummaryCard({
  title,
  run,
  emptyHint,
}: {
  title: string;
  run: DemoRunSummary | null;
  emptyHint: string;
}) {
  if (!run) {
    return (
      <div className="compare-card">
        <h3>{title}</h3>
        <p className="panel-hint">{emptyHint}</p>
      </div>
    );
  }

  return (
    <div
      className={
        run.success ? "compare-card compare-ok" : "compare-card compare-fail"
      }
    >
      <h3>{title}</h3>
      <dl className="compare-dl">
        <div>
          <dt>Scenario</dt>
          <dd>{run.scenario}</dd>
        </div>
        <div>
          <dt>Result</dt>
          <dd>{run.success ? "Success" : "Failed"}</dd>
        </div>
        <div>
          <dt>Retries</dt>
          <dd>{run.retriesObserved}</dd>
        </div>
        <div>
          <dt>Duration</dt>
          <dd>{run.durationMs} ms</dd>
        </div>
        <div>
          <dt>Failure path</dt>
          <dd>{run.failureLocation ?? "—"}</dd>
        </div>
        {run.arisDecision && Object.keys(run.arisDecision).length > 0 ? (
          <div>
            <dt>ARIS decision</dt>
            <dd className="mono small">
              retry={String(run.arisDecision.retry ?? "—")}, backoff=
              {String(run.arisDecision.backoff_multiplier ?? "—")}, timeout_ms=
              {String(run.arisDecision.timeout_ms ?? "—")}
            </dd>
          </div>
        ) : null}
      </dl>
      {run.detail ? <p className="compare-detail">{run.detail}</p> : null}
    </div>
  );
}

export function ComparePanel() {
  const lastStaticRun = useDemoStore((s) => s.lastStaticRun);
  const lastArisRun = useDemoStore((s) => s.lastArisRun);
  const scenario = useDemoStore((s) => s.scenario);

  const sameScenario =
    lastStaticRun &&
    lastArisRun &&
    lastStaticRun.scenario === lastArisRun.scenario;

  const mismatch =
    lastStaticRun &&
    lastArisRun &&
    lastStaticRun.scenario !== lastArisRun.scenario;

  return (
    <div className="panel">
      <h2 className="panel-title">Side-by-side compare</h2>
      <p className="panel-hint">
        Run the same scenario once under STATIC, then under ARIS. Fair
        side-by-side. Current scenario: <strong>{scenario}</strong>
        {sameScenario
          ? ` — last pair both used ${lastStaticRun.scenario}.`
          : "."}
      </p>
      {mismatch ? (
        <p className="panel-hint warn">
          Last STATIC run used {lastStaticRun.scenario}; last ARIS run used{" "}
          {lastArisRun.scenario}. Re-run both on the same scenario for a fair
          compare.
        </p>
      ) : null}
      <div className="compare-grid">
        <RunSummaryCard
          title="Last STATIC run"
          run={lastStaticRun}
          emptyHint="No STATIC run recorded yet."
        />
        <RunSummaryCard
          title="Last ARIS run"
          run={lastArisRun}
          emptyHint="No ARIS run recorded yet."
        />
      </div>
    </div>
  );
}
