import type { CSSProperties, ReactNode } from "react";

import { Frame } from "./Frame";

export interface KnowledgeGraphProps {
  documentId: string;
  title?: string;
  className?: string;
  style?: CSSProperties;
  onLoad?: () => void;
  onError?: (error: string) => void;
  renderLoading?: () => ReactNode;
  renderError?: (error: string) => ReactNode;
}

export function KnowledgeGraph({
  documentId,
  title,
  className,
  style,
  onLoad,
  onError,
  renderLoading,
  renderError,
}: KnowledgeGraphProps) {
  return (
    <Frame
      tool="knowledge"
      resourceId={documentId}
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
