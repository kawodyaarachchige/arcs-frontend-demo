export type PolicyMode = "STATIC" | "ARIS";

export type DemoScenario =
  | "NORMAL"
  | "BUSY_SPIKE"
  | "PAYMENT_SLOW"
  | "PAYMENT_DOWN"
  | "ORDER_SLOW"
  | "ORDER_DOWN"
  | "ORDER_DB_DOWN"
  | "PARTNER_TIMEOUT";

export type FailureLocation = "ORDER" | "PAYMENT" | "NONE";

export interface TokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface MeResponse {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface PlaceOrderRequest {
  itemName: string;
  amount: number;
  currency?: string;
}

export interface OrderResponse {
  id: string;
  userId: string;
  itemName: string;
  amount: number;
  currency: string;
  status: string;
  paymentId: string | null;
  createdAt: string;
  retriesObserved?: number;
}

/** Snake_case keys as returned inside lastArisDecision. */
export interface ArisDecision {
  retry?: number;
  backoff_multiplier?: number;
  timeout_ms?: number;
  override_reasons?: string[];
  frozen_active?: boolean;
  [key: string]: unknown;
}

export interface DemoStatsResponse {
  totalRequests: number;
  successCount: number;
  failCount: number;
  retryAttemptsTotal: number;
  estimatedExtraCalls: number;
  lastPolicyMode: string;
  lastScenario: string;
  lastFailureLocation: FailureLocation | string;
  lastArisDecision: ArisDecision | Record<string, never>;
  lastRetriesObserved?: number;
}

export interface ProblemDetail {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
}

export interface ApiErrorBody {
  status: number;
  title?: string;
  detail?: string;
  raw: unknown;
}

export class ApiError extends Error {
  readonly status: number;
  readonly title?: string;
  readonly detail?: string;
  readonly raw: unknown;

  constructor(body: ApiErrorBody) {
    super(body.detail || body.title || `Request failed (${body.status})`);
    this.name = "ApiError";
    this.status = body.status;
    this.title = body.title;
    this.detail = body.detail;
    this.raw = body.raw;
  }
}

export interface RawHttpExchange {
  method: string;
  url: string;
  requestHeaders: Record<string, string>;
  requestBody?: unknown;
  status: number;
  responseBody: unknown;
  at: string;
}

export interface DemoRunSummary {
  id: string;
  timestamp: string;
  policy: PolicyMode;
  scenario: DemoScenario;
  success: boolean;
  retriesObserved: number;
  durationMs: number;
  failureLocation?: FailureLocation | string;
  arisDecision?: ArisDecision | Record<string, never>;
  orderId?: string;
  statusCode?: number;
  detail?: string;
  itemName?: string;
  amount?: number;
}

export interface CostConstants {
  costPerApiCall: number;
  costPerFailedOrder: number;
}
