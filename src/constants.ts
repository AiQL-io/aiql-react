export const AIQL_BASE_URL = "https://app.aiql.io";

export const DEFAULT_TOKEN_URL = "/api/aiql";

export const REFRESH_BUFFER_MS = 30_000;

export const MIN_REFRESH_MS = 5_000;

export const EMBED_MESSAGE = {
  NAVIGATE: "NAVIGATE",
  PREFETCH: "PREFETCH",
  EMBED_READY: "EMBED_READY",
  ROUTE_CHANGED: "ROUTE_CHANGED",
  ARTIFACT_OPEN: "ARTIFACT_OPEN",
  SEND_MESSAGE: "SEND_MESSAGE",
} as const;
