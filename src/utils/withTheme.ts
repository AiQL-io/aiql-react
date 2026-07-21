import type { AiqlTheme } from "../types";

export function resolveTheme(theme: AiqlTheme = "auto"): "light" | "dark" {
  if (theme === "light" || theme === "dark") return theme;

  if (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }

  return "light";
}

export function withTheme(url: string, theme: AiqlTheme = "auto"): string {
  try {
    const u = new URL(url);
    u.searchParams.set("theme", resolveTheme(theme));
    return u.toString();
  } catch {
    return url;
  }
}
