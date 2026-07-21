import type { EmbedTokenClaims } from "../types";

function base64UrlDecode(input: string): string {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);

  if (typeof atob === "function") {
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  return Buffer.from(padded, "base64").toString("utf8");
}

export function decodeEmbedToken(token: string): EmbedTokenClaims | null {
  const parts = token.split(".");

  if (parts.length !== 3) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(parts[1]!)) as Record<
      string,
      unknown
    >;

    if (
      typeof payload.sub !== "string" ||
      typeof payload.workspace_id !== "string"
    ) {
      return null;
    }

    return {
      sub: payload.sub,
      workspace_id: payload.workspace_id,
      resource_id:
        typeof payload.resource_id === "string" ? payload.resource_id : null,
      exp: typeof payload.exp === "number" ? payload.exp : undefined,
    };
  } catch {
    return null;
  }
}
