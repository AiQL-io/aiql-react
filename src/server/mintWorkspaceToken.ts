import { AIQL_BASE_URL } from "../constants";
import type { MintOptions, MintResult } from "../types";

interface UpstreamTokenResponse {
  token?: string;
  expiresIn?: number;
  expiresAt?: string;
  embedUrl?: string;
  error?: string;
}

export async function mintWorkspaceToken(
  options: MintOptions = {},
): Promise<MintResult> {
  const apiKey = options.apiKey ?? process.env.AIQL_API_KEY;
  const workspaceId = options.workspaceId ?? process.env.AIQL_WORKSPACE_ID;
  const baseUrl = (options.baseUrl ?? AIQL_BASE_URL).replace(/\/$/, "");

  if (!apiKey) {
    throw new Error(
      "AIQL_API_KEY is required. Set the env var or pass apiKey to mintWorkspaceToken().",
    );
  }

  if (!workspaceId) {
    throw new Error(
      "AIQL_WORKSPACE_ID is required. Set the env var or pass workspaceId to mintWorkspaceToken().",
    );
  }

  const body: Record<string, unknown> = {
    workspaceId,
  };

  if (typeof options.ttlSeconds === "number" && options.ttlSeconds > 0) {
    body.ttlSeconds = options.ttlSeconds;
  }

  const res = await fetch(`${baseUrl}/api/embed/tokens`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    cache: "no-store",
    body: JSON.stringify(body),
  });

  let data: UpstreamTokenResponse = {};
  try {
    data = (await res.json()) as UpstreamTokenResponse;
  } catch {
    data = {};
  }

  if (!res.ok || !data.token) {
    throw new Error(
      data.error ||
        `Failed to mint AiQL embed token (${res.status}).`,
    );
  }

  const expiresIn =
    typeof data.expiresIn === "number" && data.expiresIn > 0
      ? data.expiresIn
      : 1800;
  const expiresAt =
    data.expiresAt ||
    new Date(Date.now() + expiresIn * 1000).toISOString();

  return {
    token: data.token,
    expiresIn,
    expiresAt,
  };
}
