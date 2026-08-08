"use client";

import { useDemoStore } from "@/lib/store/demoStore";
import type { PolicyMode } from "@/lib/api/types";

const OPTIONS: { value: PolicyMode; label: string; hint: string }[] = [
  { value: "STATIC", label: "STATIC", hint: "Fixed retry rules" },
  { value: "ARIS", label: "ARIS", hint: "Adaptive decisions" },
];

export function PolicyToggle() {
  const policy = useDemoStore((s) => s.policy);
  const setPolicy = useDemoStore((s) => s.setPolicy);
  const busy = useDemoStore((s) => s.busy);

  return (
    <div className="demo-control-group" role="group" aria-label="Policy mode">
      <span className="demo-control-label">Policy</span>
      <div className="policy-toggle">
        {OPTIONS.map((opt) => {
          const active = policy === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              disabled={busy}
              title={opt.hint}
              className={active ? "policy-btn policy-btn-active" : "policy-btn"}
              onClick={() => setPolicy(opt.value)}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
