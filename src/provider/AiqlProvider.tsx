import type { ReactNode } from "react";

import { AIQL_BASE_URL } from "../constants";
import type { AiqlTheme } from "../types";
import { AiqlContext } from "./context";

export interface AiqlProviderProps {
  token: string;
  theme?: AiqlTheme;
  baseUrl?: string;
  children: ReactNode;
}

export function AiqlProvider({
  token,
  theme = "auto",
  baseUrl = AIQL_BASE_URL,
  children,
}: AiqlProviderProps) {
  return (
    <AiqlContext.Provider
      value={{ token, theme, baseUrl: baseUrl.replace(/\/$/, "") }}
    >
      {children}
    </AiqlContext.Provider>
  );
}
