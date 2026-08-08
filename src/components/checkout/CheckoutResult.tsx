"use client";

import { useDemoStore } from "@/lib/store/demoStore";

export function CheckoutResult() {
  const busy = useDemoStore((s) => s.busy);
  const lastOrder = useDemoStore((s) => s.lastOrder);
  const recentRuns = useDemoStore((s) => s.recentRuns);
  const lastCustomerFelt = useDemoStore((s) => s.lastCustomerFelt);
  const last = recentRuns[0] ?? null;

  if (busy && !last) {
    return (
      <div className="result-banner result-waiting" role="status">
        <div className="spinner" aria-hidden />
        <div>
          <h2>Waiting…</h2>
          <p>Checkout in progress against the live gateway.</p>
        </div>
      </div>
    );
  }

  if (!last) {
    return (
      <div className="result-banner result-idle">
        <h2>No run yet</h2>
        <p>Place an order or use Run one checkout in the sticky bar.</p>
      </div>
    );
  }

  if (busy) {
    return (
      <div className="result-banner result-waiting" role="status">
        <div className="spinner" aria-hidden />
        <div>
          <h2>Waiting…</h2>
          <p>
            {last.policy} / {last.scenario} - updating…
          </p>
        </div>
      </div>
    );
  }

  if (last.success) {
    return (
      <div className="result-banner result-ok">
        <h2>Success</h2>
        <p>
          Order <code>{lastOrder?.id ?? last.orderId}</code> paid in{" "}
          {last.durationMs}ms under <strong>{last.policy}</strong> /{" "}
          <strong>{last.scenario}</strong>
          {last.retriesObserved > 0
            ? ` after ${last.retriesObserved} retry attempt(s)`
            : ""}
          .
        </p>
        {lastCustomerFelt ? (
          <p className="customer-felt">{lastCustomerFelt}</p>
        ) : null}
      </div>
    );
  }

  const where =
    last.failureLocation && last.failureLocation !== "NONE"
      ? String(last.failureLocation)
      : "unknown path";

  return (
    <div className="result-banner result-fail">
      <h2>Failed</h2>
      <p className="fail-reason">{last.detail || "Checkout did not complete."}</p>
      <p>
        Failure looked like <strong>{where}</strong> · {last.durationMs}ms ·{" "}
        {last.retriesObserved} retry attempt(s) · {last.policy} / {last.scenario}
      </p>
      {lastCustomerFelt ? (
        <p className="customer-felt">{lastCustomerFelt}</p>
      ) : null}
    </div>
  );
}
