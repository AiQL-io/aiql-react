import { useContext } from "react";

import { AiqlContext, type AiqlContextValue } from "../provider/context";

export function useAiql(): AiqlContextValue {
  const value = useContext(AiqlContext);

  if (!value) {
    throw new Error(
      "useAiql must be used within an AiqlProvider. Wrap your tree with <AiqlProvider token={token}>.",
    );
  }

  return value;
}
