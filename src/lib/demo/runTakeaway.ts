import type { DemoRunSummary } from "@/lib/api/types";
import { customerFeltCaption } from "@/lib/demo/runCheckout";

export type TakeawayTone = "good" | "bad" | "neutral";

export interface RunTakeaway {
  tone: TakeawayTone;
  text: string;
}

function pathLabel(run: DemoRunSummary): string {
  const loc = run.failureLocation;
  if (!loc || loc === "NONE") return "none";
  return String(loc);
}

function soloTakeaway(run: DemoRunSummary): RunTakeaway {
  const retries = Math.max(0, Number(run.retriesObserved) || 0);
  const ms = Math.max(0, Number(run.durationMs) || 0);
  const path = pathLabel(run);
  const orderPathFail = !run.success && path === "ORDER";

  if (orderPathFail && retries === 0) {
    return {
      tone: "neutral",
      text: `Neutral: failed on ORDER before payment. 0 extra knocks, ${ms}ms.`,
    };
  }

  if (!run.success && retries >= 2) {
    return {
      tone: "bad",
      text: `Waste: failed on ${path} after ${retries} retry attempt(s) and ${ms}ms. Extra knocks did not save the order.`,
    };
  }

  if (!run.success && retries === 1) {
    return {
      tone: "bad",
      text: `Waste: failed on ${path} after 1 retry (${ms}ms). Still paid for an extra knock.`,
    };
  }

  if (!run.success && retries === 0) {
    return {
      tone: "neutral",
      text: `Neutral: failed on ${path} with 0 retries in ${ms}ms. Stopped without extra knocks.`,
    };
  }

  if (run.success && retries === 0 && ms < 1500) {
    return {
      tone: "good",
      text: `Efficient: succeeded with 0 retries in ${ms}ms.`,
    };
  }

  if (run.success && retries === 0) {
    return {
      tone: "neutral",
      text: `Neutral: succeeded with 0 retries but took ${ms}ms (slow path, no extra knocks).`,
    };
  }

  if (run.success && retries >= 2) {
    return {
      tone: "bad",
      text: `Costly success: paid after ${retries} retry attempt(s) in ${ms}ms worked, but burned extra calls.`,
    };
  }

  if (run.success && retries === 1) {
    return {
      tone: "neutral",
      text: `Neutral: succeeded after 1 retry in ${ms}ms, one extra knock before payment cleared.`,
    };
  }

  return {
    tone: "neutral",
    text: `Neutral: ${run.success ? "success" : "fail"} · retries=${retries} · ${ms}ms · path=${path}.`,
  };
}

/**
 * When the opposite policy has a same-scenario run, compare measured retries + duration.
 */
function compareTakeaway(
  run: DemoRunSummary,
  peer: DemoRunSummary,
): RunTakeaway | null {
  if (peer.scenario !== run.scenario || peer.policy === run.policy) {
    return null;
  }

  const retries = Math.max(0, Number(run.retriesObserved) || 0);
  const peerRetries = Math.max(0, Number(peer.retriesObserved) || 0);
  const ms = Math.max(0, Number(run.durationMs) || 0);
  const peerMs = Math.max(0, Number(peer.durationMs) || 0);
  const peerLabel = peer.policy;
  const retryDelta = peerRetries - retries;
  const msDelta = peerMs - ms;

  if (run.policy === "ARIS") {
    if (retryDelta > 0 && msDelta > 200) {
      return {
        tone: "good",
        text: `Better than ${peerLabel}: ${retries} retries vs ${peerRetries}, and ${ms}ms vs ${peerMs}ms. Fewer knocks and faster fail.`,
      };
    }
    if (retryDelta > 0) {
      return {
        tone: "good",
        text: `Better than ${peerLabel}: ${retries} retries vs ${peerRetries}. Fewer wasted knocks on the same scenario.`,
      };
    }
    if (msDelta > 200 && retryDelta === 0) {
      return {
        tone: "good",
        text: `Faster than ${peerLabel}: same retries (${retries}) but ${ms}ms vs ${peerMs}ms.`,
      };
    }
    if (retryDelta < 0 || msDelta < -200) {
      return {
        tone: "neutral",
        text: `Vs ${peerLabel}: retries ${retries} vs ${peerRetries}, ${ms}ms vs ${peerMs}ms. Compare dials on Developers.`,
      };
    }
    return {
      tone: "neutral",
      text: `Same as ${peerLabel} this run (retries ${retries}, ~${ms}ms). Look at lastArisDecision for dials.`,
    };
  }

  // STATIC vs ARIS peer
  if (retryDelta < 0 && msDelta < -200) {
    return {
      tone: "bad",
      text: `Heavier than ${peerLabel}: ${retries} retries vs ${peerRetries}, and ${ms}ms vs ${peerMs}ms. Fixed rules burned more.`,
    };
  }
  if (retryDelta < 0) {
    return {
      tone: "bad",
      text: `Heavier than ${peerLabel}: ${retries} retries vs ${peerRetries}. Fixed script kept knocking.`,
    };
  }
  if (msDelta < -200 && retryDelta === 0) {
    return {
      tone: "bad",
      text: `Slower than ${peerLabel}: same retries (${retries}) but ${ms}ms vs ${peerMs}ms.`,
    };
  }
  if (retryDelta > 0 || msDelta > 200) {
    return {
      tone: "neutral",
      text: `Vs ${peerLabel}: retries ${retries} vs ${peerRetries}, ${ms}ms vs ${peerMs}ms.`,
    };
  }
  return {
    tone: "neutral",
    text: `Same as ${peerLabel} this run (retries ${retries}, ~${ms}ms). Wait for ARIS to lower retries under load.`,
  };
}

/**
 * Measured takeaway; when a same-scenario opposite-policy peer exists, compare the pair.
 */
export function runTakeaway(
  run: DemoRunSummary,
  peer?: DemoRunSummary | null,
): RunTakeaway {
  if (peer) {
    const compared = compareTakeaway(run, peer);
    if (compared) return compared;
  }
  return soloTakeaway(run);
}

/** Newest opposite-policy run with the same scenario (for pair commentary). */
export function findPeerRun(
  run: DemoRunSummary,
  recentRuns: DemoRunSummary[],
): DemoRunSummary | null {
  return (
    recentRuns.find(
      (r) =>
        r.id !== run.id &&
        r.scenario === run.scenario &&
        r.policy !== run.policy,
    ) ?? null
  );
}

export function customerFeltForRun(run: DemoRunSummary): string {
  return customerFeltCaption(run).replace(/^What the customer felt:\s*/i, "");
}
