import type { CSSProperties, ReactNode } from "react";

import { Frame } from "./Frame";

export interface CanvasProps {
  canvasId: string;
  title?: string;
  className?: string;
  style?: CSSProperties;
  onLoad?: () => void;
  onError?: (error: string) => void;
  renderLoading?: () => ReactNode;
  renderError?: (error: string) => ReactNode;
}

export function Canvas({
  canvasId,
  title,
  className,
  style,
  onLoad,
  onError,
  renderLoading,
  renderError,
}: CanvasProps) {
  return (
    <Frame
      tool="brainstorm"
      resourceId={canvasId}
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
