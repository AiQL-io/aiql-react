import type { CSSProperties, ReactNode } from "react";

import { Frame } from "./Frame";

export interface CommonKnowledgeProps {
  title?: string;
  className?: string;
  style?: CSSProperties;
  onLoad?: () => void;
  onError?: (error: string) => void;
  renderLoading?: () => ReactNode;
  renderError?: (error: string) => ReactNode;
}

export function CommonKnowledge({
  title,
  className,
  style,
  onLoad,
  onError,
  renderLoading,
  renderError,
}: CommonKnowledgeProps) {
  return (
    <Frame
      tool="common-knowledge"
      title={title}
      className={className}
      style={style}
      onLoad={onLoad}
      onError={onError}
      renderLoading={renderLoading}
      renderError={renderError}
    />
  );
}
