import { apiUrl } from "@/config/env";
import {
  ApiError,
  type PolicyMode,
  type DemoScenario,
  type RawHttpExchange,
} from "@/lib/api/types";

export interface DemoHeadersInput {
  policy?: PolicyMode;
  scenario?: DemoScenario;
}

export interface RequestOptions {
  method?: string;
  token?: string | null;
  body?: unknown;
  demoHeaders?: DemoHeadersInput;
  /** When true, do not record into lastRawExchange callback. */
  quiet?: boolean;
  onExchange?: (exchange: RawHttpExchange) => void;
}

function buildHeaders(options: RequestOptions): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  if (options.demoHeaders?.policy) {
    headers["X-Demo-Policy"] = options.demoHeaders.policy;
  }

  if (options.demoHeaders?.scenario) {
    headers["X-Demo-Scenario"] = options.demoHeaders.scenario;
  }

  return headers;
}

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const method = options.method ?? (options.body !== undefined ? "POST" : "GET");
  const url = apiUrl(path);
  const headers = buildHeaders(options);

  const response = await fetch(url, {
    method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  const responseBody = await parseBody(response);

  const exchange: RawHttpExchange = {
    method,
    url,
    requestHeaders: headers,
    requestBody: options.body,
    status: response.status,
    responseBody,
    at: new Date().toISOString(),
  };

  if (!options.quiet && options.onExchange) {
    options.onExchange(exchange);
  }

  if (!response.ok) {
    const problem = (responseBody ?? {}) as {
      title?: string;
      detail?: string;
      status?: number;
    };
    throw new ApiError({
      status: response.status,
      title: problem.title,
      detail: problem.detail,
      raw: responseBody,
    });
  }

  return responseBody as T;
}
