import { createContext } from "react";

import type { AiqlTheme } from "../types";

export interface AiqlContextValue {
  token: string;
  theme: AiqlTheme;
}

export const AiqlContext = createContext<AiqlContextValue | null>(null);
