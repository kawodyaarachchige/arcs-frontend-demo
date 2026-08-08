"use client";

import {
  customerFeltForRun,
  findPeerRun,
  runTakeaway,
} from "@/lib/demo/runTakeaway";
import { useDemoStore } from "@/lib/store/demoStore";

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function RunHistoryTable() {
  const recentRuns = useDemoStore((s) => s.recentRuns);

  return (
    <div className="panel">
      <h2 className="panel-title">Run log</h2>
      <p className="panel-hint">
        Each checkout adds a row. Takeaways use measured retries and duration;
        when STATIC and ARIS both ran the same scenario, the row compares the
        pair. Newest first (clears on refresh).
      </p>

      {recentRuns.length === 0 ? (
        <p className="panel-hint">Run a checkout to fill this log.</p>
      ) : (
        <div className="run-log-scroll">
          <table className="run-log-table">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Time</th>
                <th scope="col">Policy</th>
                <th scope="col">Scenario</th>
                <th scope="col">Result</th>
                <th scope="col">Path</th>
                <th scope="col">Retries</th>
                <th scope="col">Duration</th>
                <th scope="col">Customer felt</th>
                <th scope="col">Takeaway</th>
              </tr>
            </thead>
            <tbody>
              {recentRuns.map((run, index) => {
                const peer = findPeerRun(run, recentRuns);
                const takeaway = runTakeaway(run, peer);
                const path =
                  run.failureLocation && run.failureLocation !== "NONE"
                    ? String(run.failureLocation)
                    : "—";
                const rowNum = recentRuns.length - index;
                return (
                  <tr key={run.id}>
                    <td>{rowNum}</td>
                    <td className="mono small">{formatTime(run.timestamp)}</td>
                    <td>
                      <strong>{run.policy}</strong>
                    </td>
                    <td className="mono small">{run.scenario}</td>
                    <td>
                      <span
                        className={
                          run.success ? "run-log-ok" : "run-log-fail"
                        }
                      >
                        {run.success ? "Success" : "Failed"}
                      </span>
                    </td>
                    <td>{path}</td>
                    <td>{run.retriesObserved}</td>
                    <td>{run.durationMs} ms</td>
                    <td className="run-log-felt">{customerFeltForRun(run)}</td>
                    <td>
                      <span
                        className={`run-log-takeaway run-log-takeaway-${takeaway.tone}`}
                      >
                        {takeaway.text}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
