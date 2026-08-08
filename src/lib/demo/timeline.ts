export type TimelineStepKind =
  | "started"
  | "order"
  | "payment"
  | "retry_wait"
  | "final";

export interface TimelineStep {
  kind: TimelineStepKind;
  label: string;
  detail?: string;
  status: "pending" | "active" | "done" | "failed" | "skipped";
}

export interface BuildTimelineInput {
  success: boolean;
  retriesObserved: number;
  failureLocation?: string;
  scenarioGroup?: "healthy" | "payment" | "order";
}

export function buildTimelineSteps(input: BuildTimelineInput): TimelineStep[] {
  const attempts = Math.max(1, input.retriesObserved + 1);
  const failedAt = input.failureLocation?.toUpperCase();

  const steps: TimelineStep[] = [
    {
      kind: "started",
      label: "Request started",
      status: "done",
    },
    {
      kind: "order",
      label: "Order handling",
      status:
        failedAt === "ORDER"
          ? "failed"
          : input.success || failedAt === "PAYMENT"
            ? "done"
            : "done",
      detail: failedAt === "ORDER" ? "Failure looked like ORDER path" : undefined,
    },
  ];

  if (failedAt === "ORDER") {
    steps.push({
      kind: "payment",
      label: "Payment attempt",
      status: "skipped",
      detail: "Not reached after order failure",
    });
  } else {
    for (let i = 1; i <= attempts; i += 1) {
      const isLast = i === attempts;
      steps.push({
        kind: "payment",
        label: `Payment attempt #${i}`,
        status: input.success
          ? "done"
          : isLast && failedAt === "PAYMENT"
            ? "failed"
            : "done",
      });
      if (!isLast) {
        steps.push({
          kind: "retry_wait",
          label: "Retry wait",
          status: "done",
        });
      }
    }
  }

  steps.push({
    kind: "final",
    label: input.success ? "Final success" : "Final fail",
    status: input.success ? "done" : "failed",
  });

  return steps;
}
