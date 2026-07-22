import { useEffect, useMemo, useState } from "react";

import type { AiqlTool } from "../types";
import { decodeEmbedToken } from "../utils/decodeEmbedToken";
import { withTheme } from "../utils/withTheme";
import { useAiql } from "./useAiql";

export interface UseEmbedFrameOptions {
  tool: AiqlTool;
  resourceId: string;
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

function buildEmbedUrl(
  token: string,
  tool: AiqlTool,
  resourceId: string,
  baseUrl: string,
): string | null {
  if (isEmbedUrl(token)) {
    return token;
  }

  const claims = decodeEmbedToken(token);
  if (!claims?.workspace_id) {
    return null;
  }

  return `${baseUrl}/embed/${claims.workspace_id}/${tool}/${resourceId}?token=${encodeURIComponent(token)}`;
}

export function useEmbedFrame({
  tool,
  resourceId,
}: UseEmbedFrameOptions): UseEmbedFrameResult {
  const { token, theme, baseUrl } = useAiql();
  const [frameReady, setFrameReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const embedUrl = useMemo(() => {
    if (!token || !resourceId) return null;
    const url = buildEmbedUrl(token, tool, resourceId, baseUrl);
    if (!url) return null;
    return withTheme(url, theme);
  }, [token, tool, resourceId, theme, baseUrl]);

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
