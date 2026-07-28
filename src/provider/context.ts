import { createContext } from "react";

import type { AiqlTheme, ArtifactOpenEvent } from "../types";

export interface AiqlContextValue {
  token: string;
  theme: AiqlTheme;
  baseUrl: string;
  onArtifactOpen?: (event: ArtifactOpenEvent) => void;
}

export const AiqlContext = createContext<AiqlContextValue | null>(null);
