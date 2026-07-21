import { useCallback, useEffect, useRef, useState } from "react";

import {
  DEFAULT_TOKEN_URL,
  MIN_REFRESH_MS,
  REFRESH_BUFFER_MS,
} from "../constants";
import type { TokenResult, TokenStatus } from "../types";
import { decodeEmbedToken } from "../utils/decodeEmbedToken";

interface TokenResponse {
  ok?: boolean;
  token?: string;
  embedUrl?: string;
  expiresAt?: string;
  expiresIn?: number;
  error?: string | { en?: string; message?: string };
}

function extractToken(data: TokenResponse): string | null {
  if (typeof data.token === "string" && data.token.trim() !== "") {
    return data.token.trim();
  }

  if (typeof data.embedUrl === "string" && data.embedUrl.trim() !== "") {
    try {
      const url = new URL(data.embedUrl);
      const token = url.searchParams.get("token");
      if (token) return token;
    } catch {
      return data.embedUrl.trim();
    }
    return data.embedUrl.trim();
  }

  return null;
}

function extractError(data: TokenResponse, fallback: string): string {
  if (typeof data.error === "string") return data.error;
  if (data.error && typeof data.error === "object") {
    return data.error.en || data.error.message || fallback;
  }
  return fallback;
}

function resolveExpiresAt(
  token: string,
  expiresAt?: string,
  expiresIn?: number,
): string | null {
  if (expiresAt) return expiresAt;

  if (typeof expiresIn === "number" && expiresIn > 0) {
    return new Date(Date.now() + expiresIn * 1000).toISOString();
  }

  const claims = decodeEmbedToken(token);
  if (claims?.exp) {
    return new Date(claims.exp * 1000).toISOString();
  }

  return null;
}

export function useToken(url: string = DEFAULT_TOKEN_URL): TokenResult {
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<TokenStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const load = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus((prev) => (prev === "ready" ? "ready" : "loading"));
    setError(null);

    try {
      const res = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: controller.signal,
        cache: "no-store",
      });

      let data: TokenResponse = {};
      try {
        data = (await res.json()) as TokenResponse;
      } catch {
        data = {};
      }

      if (controller.signal.aborted) return;

      const nextToken = extractToken(data);

      if (!res.ok || !nextToken || data.ok === false) {
        setToken(null);
        setExpiresAt(null);
        setStatus("error");
        setError(
          extractError(
            data,
            res.ok
              ? "Could not load AiQL embed token."
              : `Token request failed (${res.status}).`,
          ),
        );
        return;
      }

      const nextExpiresAt = resolveExpiresAt(
        nextToken,
        data.expiresAt,
        data.expiresIn,
      );

      setToken(nextToken);
      setExpiresAt(nextExpiresAt);
      setStatus("ready");
      setError(null);

      clearTimer();
      if (nextExpiresAt) {
        const delay = Math.max(
          new Date(nextExpiresAt).getTime() - Date.now() - REFRESH_BUFFER_MS,
          MIN_REFRESH_MS,
        );
        timerRef.current = setTimeout(() => {
          void load();
        }, delay);
      }
    } catch (err) {
      if (controller.signal.aborted) return;
      setToken(null);
      setExpiresAt(null);
      setStatus("error");
      setError(
        err instanceof Error ? err.message : "Could not load AiQL embed token.",
      );
    }
  }, [url, clearTimer]);

  useEffect(() => {
    void load();
    return () => {
      clearTimer();
      abortRef.current?.abort();
    };
  }, [load, clearTimer]);

  return {
    token,
    status,
    error,
    reload: () => {
      void load();
    },
    expiresAt,
  };
}
