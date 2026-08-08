import { apiRequest, type RequestOptions } from "@/lib/api/client";
import type {
  DemoScenario,
  OrderResponse,
  PlaceOrderRequest,
  PolicyMode,
} from "@/lib/api/types";

type Opts = Pick<RequestOptions, "onExchange" | "quiet"> & {
  token: string;
  policy: PolicyMode;
  scenario: DemoScenario;
};

export function placeOrder(
  body: PlaceOrderRequest,
  opts: Opts,
): Promise<OrderResponse> {
  return apiRequest<OrderResponse>("/api/orders", {
    method: "POST",
    token: opts.token,
    body,
    demoHeaders: { policy: opts.policy, scenario: opts.scenario },
    onExchange: opts.onExchange,
    quiet: opts.quiet,
  });
}

export function getOrder(
  orderId: string,
  opts: Opts,
): Promise<OrderResponse> {
  return apiRequest<OrderResponse>(`/api/orders/${orderId}`, {
    method: "GET",
    token: opts.token,
    demoHeaders: { policy: opts.policy, scenario: opts.scenario },
    onExchange: opts.onExchange,
    quiet: opts.quiet,
  });
}
