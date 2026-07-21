export type AiqlTool = "brainstorm" | "analyze";

export type AiqlPermission = "view" | "edit";

export type AiqlTheme = "light" | "dark" | "auto";

export type TokenStatus = "idle" | "loading" | "ready" | "error";

export interface EmbedTokenClaims {
  sub: string;
  workspace_id: string;
  tool?: AiqlTool | null;
  resource_id?: string | null;
  permission: AiqlPermission;
  exp?: number;
}

export interface UseTokenOptions {
  url?: string;
}

export interface TokenResult {
  token: string | null;
  status: TokenStatus;
  error: string | null;
  reload: () => void;
  expiresAt: string | null;
}

export interface MintOptions {
  apiKey?: string;
  workspaceId?: string;
  permission?: AiqlPermission;
  ttlSeconds?: number;
  baseUrl?: string;
}

export interface MintResult {
  token: string;
  expiresIn: number;
  expiresAt: string;
}
