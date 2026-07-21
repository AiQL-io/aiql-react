import type { ReactNode } from "react";

import type { AiqlTheme } from "../types";
import { AiqlContext } from "./context";

export interface AiqlProviderProps {
  token: string;
  theme?: AiqlTheme;
  children: ReactNode;
}

export function AiqlProvider({
  token,
  theme = "auto",
  children,
}: AiqlProviderProps) {
  return (
    <AiqlContext.Provider value={{ token, theme }}>
      {children}
    </AiqlContext.Provider>
  );
}
