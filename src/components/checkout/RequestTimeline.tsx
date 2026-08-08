"use client";

import { useDemoStore } from "@/lib/store/demoStore";

export function RequestTimeline() {
  const steps = useDemoStore((s) => s.lastTimeline);
  const busy = useDemoStore((s) => s.busy);

  if (!steps.length) {
    return (
      <div className="panel">
        <h2 className="panel-title">Request timeline</h2>
        <p className="panel-hint">
          After a checkout, steps are reconstructed from the response and demo
          stats (not live distributed tracing).
        </p>
      </div>
    );
  }

  return (
    <div className="panel">
      <h2 className="panel-title">Request timeline</h2>
      <p className="panel-hint">
        Demo reconstruction from response + retry stats
        {busy ? " (updating…)" : ""}.
      </p>
      <ol className="timeline">
        {steps.map((step, index) => (
          <li
            key={`${step.kind}-${index}`}
            className={`timeline-step timeline-${step.status}`}
          >
            <span className="timeline-dot" aria-hidden />
            <div>
              <strong>{step.label}</strong>
              {step.detail ? <p>{step.detail}</p> : null}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
