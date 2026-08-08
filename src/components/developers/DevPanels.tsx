"use client";

import { useDemoStore } from "@/lib/store/demoStore";

export function LastArisDecision() {
  const policy = useDemoStore((s) => s.policy);
  const lastStats = useDemoStore((s) => s.lastStats);
  const lastArisRun = useDemoStore((s) => s.lastArisRun);

  const decision =
    lastArisRun?.arisDecision &&
    Object.keys(lastArisRun.arisDecision).length > 0
      ? lastArisRun.arisDecision
      : lastStats?.lastPolicyMode === "ARIS"
        ? lastStats.lastArisDecision
        : null;

  const empty =
    !decision ||
    (typeof decision === "object" && Object.keys(decision).length === 0);

  return (
    <div className="panel">
      <h2 className="panel-title">Last ARIS decision</h2>
      {policy !== "ARIS" && empty ? (
        <p className="panel-hint">
          Switch policy to <strong>ARIS</strong> and run a checkout. These
          fields come from <code>GET /api/demo/stats</code> (
          <code>lastArisDecision</code>).
        </p>
      ) : empty ? (
        <p className="panel-hint">No ARIS decision stored yet.</p>
      ) : (
        <dl className="decision-dl">
          <div>
            <dt>retry</dt>
            <dd>{String(decision.retry ?? "—")}</dd>
          </div>
          <div>
            <dt>backoff_multiplier</dt>
            <dd>{String(decision.backoff_multiplier ?? "—")}</dd>
          </div>
          <div>
            <dt>timeout_ms</dt>
            <dd>{String(decision.timeout_ms ?? "—")}</dd>
          </div>
          <div>
            <dt>override_reasons</dt>
            <dd className="mono small">
              {Array.isArray(decision.override_reasons)
                ? decision.override_reasons.join(", ") || "(none)"
                : "—"}
            </dd>
          </div>
          <div>
            <dt>frozen_active</dt>
            <dd>{String(decision.frozen_active ?? "—")}</dd>
          </div>
        </dl>
      )}
      <p className="panel-hint" style={{ marginTop: "0.75rem" }}>
        Rule of thumb in this demo: <code>maxAttempts = retry + 1</code> (STATIC
        default retry=3 → up to 4 tries).
      </p>
    </div>
  );
}

export function IntegrationExplainer() {
  return (
    <div className="panel">
      <h2 className="panel-title">How integration works</h2>
      <p>
        Business code stays simple: Java asks <strong>ARIS</strong> for retry /
        wait / timeout, then applies those dials on the outbound call (here:
        order → payment).
      </p>
      <pre className="code-block">{`// One helper — not a copy-pasted retry loop per service
ArisDecision d = arisPolicyClient.decide(signals);
paymentClient.charge(request, d.retry, d.backoff, d.timeoutMs);`}</pre>
      <h3 className="subhead">STATIC vs ARIS (developer view)</h3>
      <ul className="plain-list">
        <li>
          <strong>STATIC:</strong> fixed defaults every time (retry=3,
          backoff≈1.5, timeout≈2000ms), no decision object stored.
        </li>
        <li>
          <strong>ARIS:</strong> one decide call → live dials appear in{" "}
          <code>lastArisDecision</code>; business code path stays the same
          helper.
        </li>
      </ul>
      <h3 className="subhead">What developers no longer maintain per service</h3>
      <ul className="plain-list">
        <li>Hand-tuned retry counts that drift between teams</li>
        <li>Ad-hoc sleep/wait loops duplicated in every client</li>
        <li>Guessing timeouts without a shared policy view</li>
        <li>Blind extra knocks with no approved upper bounds</li>
      </ul>
    </div>
  );
}

export function DeveloperTalkTrack() {
  return (
    <div className="panel">
      <h2 className="panel-title">Viva line (developers)</h2>
      <p>
        “We did not put ML in the browser. The Spring service asks ARIS for
        dials, clamps them, then Resilience4j applies them. STATIC is the fixed
        baseline so we can prove the same checkout burns fewer wasted retries
        when ARIS adapts.”
      </p>
    </div>
  );
}
