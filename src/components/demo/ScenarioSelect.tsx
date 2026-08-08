"use client";

import {
  SCENARIO_GROUPS,
  scenariosInGroup,
  getScenarioMeta,
} from "@/lib/demo/scenarios";
import { useDemoStore } from "@/lib/store/demoStore";
import type { DemoScenario } from "@/lib/api/types";

export function ScenarioSelect() {
  const scenario = useDemoStore((s) => s.scenario);
  const setScenario = useDemoStore((s) => s.setScenario);
  const busy = useDemoStore((s) => s.busy);
  const meta = getScenarioMeta(scenario);

  return (
    <div className="demo-control-group scenario-select">
      <label className="demo-control-label" htmlFor="demo-scenario">
        Scenario
      </label>
      <select
        id="demo-scenario"
        className="scenario-select-input"
        disabled={busy}
        value={scenario}
        onChange={(e) => setScenario(e.target.value as DemoScenario)}
      >
        {SCENARIO_GROUPS.map((group) => (
          <optgroup key={group.id} label={group.label}>
            {scenariosInGroup(group.id).map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      {meta?.caption ? (
        <p className="scenario-caption">{meta.caption}</p>
      ) : null}
    </div>
  );
}
