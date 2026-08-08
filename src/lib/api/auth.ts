import { apiRequest, type RequestOptions } from "@/lib/api/client";
import type {
  LoginRequest,
  MeResponse,
  RegisterRequest,
  TokenResponse,
} from "@/lib/api/types";

type Opts = Pick<RequestOptions, "onExchange" | "quiet">;

export function register(
  body: RegisterRequest,
  opts: Opts = {},
): Promise<TokenResponse> {
  return apiRequest<TokenResponse>("/api/auth/register", {
    method: "POST",
    body,
    ...opts,
  });
}

export function login(
  body: LoginRequest,
  opts: Opts = {},
): Promise<TokenResponse> {
  return apiRequest<TokenResponse>("/api/auth/login", {
    method: "POST",
    body,
    ...opts,
  });
}

export function me(token: string, opts: Opts = {}): Promise<MeResponse> {
  return apiRequest<MeResponse>("/api/auth/me", {
    method: "GET",
    token,
    ...opts,
  });
}
