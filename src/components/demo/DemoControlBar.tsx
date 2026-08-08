"use client";

import { BURST_SIZE } from "@/config/env";
import { ActiveHeaders } from "@/components/demo/ActiveHeaders";
import { AuthStatus } from "@/components/demo/AuthStatus";
import { PolicyToggle } from "@/components/demo/PolicyToggle";
import { ScenarioSelect } from "@/components/demo/ScenarioSelect";
import { useDemoStore } from "@/lib/store/demoStore";

export function DemoControlBar() {
  const busy = useDemoStore((s) => s.busy);
  const statusMessage = useDemoStore((s) => s.statusMessage);
  const errorMessage = useDemoStore((s) => s.errorMessage);
  const burstProgress = useDemoStore((s) => s.burstProgress);
  const resetServerStats = useDemoStore((s) => s.resetServerStats);
  const runOneCheckout = useDemoStore((s) => s.runOneCheckout);
  const runBurst = useDemoStore((s) => s.runBurst);

  return (
    <div className="demo-control-bar">
      <div className="demo-control-bar-inner">
        <PolicyToggle />
        <ScenarioSelect />
        <div className="demo-control-group demo-actions">
          <span className="demo-control-label">Actions</span>
          <div className="action-row">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={busy}
              onClick={() => void resetServerStats()}
            >
              Reset stats
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={busy}
              onClick={() => void runOneCheckout()}
            >
              Run one checkout
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={busy}
              onClick={() => void runBurst()}
            >
              {burstProgress
                ? `Burst ${burstProgress.current}/${burstProgress.total}`
                : `Run burst ×${BURST_SIZE}`}
            </button>
          </div>
        </div>
        <ActiveHeaders />
        <AuthStatus />
      </div>
      {(statusMessage || errorMessage) && (
        <div className="demo-control-messages" aria-live="polite">
          {errorMessage ? (
            <p className="msg msg-error">{errorMessage}</p>
          ) : null}
          {statusMessage ? (
            <p className="msg msg-status">{statusMessage}</p>
          ) : null}
        </div>
      )}
    </div>
  );
}
