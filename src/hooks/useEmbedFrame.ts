import { useEffect, useMemo, useState } from "react";

import type { AiqlTool } from "../types";
import { decodeEmbedToken } from "../utils/decodeEmbedToken";
import { withTheme } from "../utils/withTheme";
import { useAiql } from "./useAiql";

export interface UseEmbedFrameOptions {
  tool: AiqlTool;
  resourceId: string;
  params?: Record<string, string | number | undefined>;
}

export interface UseEmbedFrameResult {
  embedUrl: string | null;
  frameReady: boolean;
  setFrameReady: (ready: boolean) => void;
  error: string | null;
}

function isEmbedUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.pathname.includes("/embed/");
  } catch {
    return false;
  }
}

function appendParams(
  url: string,
  params?: Record<string, string | number | undefined>,
): string {
  if (!params) return url;

  const parsed = new URL(url);
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    parsed.searchParams.set(key, String(value));
  }
  return parsed.toString();
}

function buildEmbedUrl(
  token: string,
  tool: AiqlTool,
  resourceId: string,
  baseUrl: string,
  params?: Record<string, string | number | undefined>,
): string | null {
  if (isEmbedUrl(token)) {
    return appendParams(token, params);
  }

  const claims = decodeEmbedToken(token);
  if (!claims?.workspace_id) {
    return null;
  }

  const url = `${baseUrl}/embed/${claims.workspace_id}/${tool}/${resourceId}?token=${encodeURIComponent(token)}`;
  return appendParams(url, params);
}

export function useEmbedFrame({
  tool,
  resourceId,
  params,
}: UseEmbedFrameOptions): UseEmbedFrameResult {
  const { token, theme, baseUrl } = useAiql();
  const [frameReady, setFrameReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const paramsKey = useMemo(() => {
    if (!params) return "";
    return Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== "")
      .map(([key, value]) => `${key}=${value}`)
      .sort()
      .join("&");
  }, [params]);

  const embedUrl = useMemo(() => {
    if (!token || !resourceId) return null;
    const url = buildEmbedUrl(token, tool, resourceId, baseUrl, params);
    if (!url) return null;
    return withTheme(url, theme);
  }, [token, tool, resourceId, theme, baseUrl, paramsKey]);

  useEffect(() => {
    if (!token) {
      setFrameReady(false);
      setError("Missing AiQL embed token.");
      return;
    }
    if (!resourceId) {
      setFrameReady(false);
      setError("Missing resource id.");
      return;
    }
    if (!embedUrl) {
      setFrameReady(false);
      setError("Could not build embed URL from token.");
      return;
    }
    setError(null);
  }, [token, resourceId, embedUrl]);

  return {
    embedUrl,
    frameReady,
    setFrameReady,
    error,
  };
}
