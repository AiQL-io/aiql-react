import type { MintOptions } from "../types";
import { mintWorkspaceToken } from "./mintWorkspaceToken";

export type TokenHandlerOptions = MintOptions;

export interface TokenJsonResponse {
  status: number;
  body: Record<string, unknown>;
}

export async function handleTokenRequest(
  options: TokenHandlerOptions = {},
): Promise<TokenJsonResponse> {
  try {
    const result = await mintWorkspaceToken(options);
    return {
      status: 200,
      body: {
        ok: true,
        token: result.token,
        expiresIn: result.expiresIn,
        expiresAt: result.expiresAt,
      },
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to mint AiQL embed token.";
    const status =
      message.includes("AIQL_API_KEY") || message.includes("AIQL_WORKSPACE_ID")
        ? 503
        : 502;
    return {
      status,
      body: {
        ok: false,
        error: message,
      },
    };
  }
}

export function createNextHandler(options: TokenHandlerOptions = {}) {
  return async function GET() {
    const result = await handleTokenRequest(options);
    return Response.json(result.body, { status: result.status });
  };
}

export interface ExpressLikeRequest {
  method?: string;
}

export interface ExpressLikeResponse {
  status: (code: number) => ExpressLikeResponse;
  json: (body: unknown) => unknown;
}

export function createExpressHandler(options: TokenHandlerOptions = {}) {
  return async function handler(
    _req: ExpressLikeRequest,
    res: ExpressLikeResponse,
  ) {
    const result = await handleTokenRequest(options);
    return res.status(result.status).json(result.body);
  };
}
