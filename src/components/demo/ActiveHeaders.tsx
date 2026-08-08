"use client";

import { useDemoStore } from "@/lib/store/demoStore";

export function ActiveHeaders() {
  const policy = useDemoStore((s) => s.policy);
  const scenario = useDemoStore((s) => s.scenario);

  return (
    <div className="demo-control-group active-headers" aria-live="polite">
      <span className="demo-control-label">Headers</span>
      <div className="header-chips">
        <code className="header-chip">
          X-Demo-Policy: <strong>{policy}</strong>
        </code>
        <code className="header-chip">
          X-Demo-Scenario: <strong>{scenario}</strong>
        </code>
      </div>
    </div>
  );
}
