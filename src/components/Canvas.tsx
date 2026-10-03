import { forwardRef, type CSSProperties, type ReactNode } from "react";

import { Frame, type EmbedChatHandle } from "./Frame";

export interface CanvasProps {
  canvasId: string;
  title?: string;
  className?: string;
  style?: CSSProperties;
  onReady?: () => void;
  onLoad?: () => void;
  onError?: (error: string) => void;
  renderLoading?: () => ReactNode;
  renderError?: (error: string) => ReactNode;
}

export const Canvas = forwardRef<EmbedChatHandle, CanvasProps>(function Canvas(
  {
    canvasId,
    title,
    className,
    style,
    onReady,
    onLoad,
    onError,
    renderLoading,
    renderError,
  },
  ref,
) {
  return (
    <Frame
      ref={ref}
      tool="brainstorm"
      resourceId={canvasId}
      title={title}
      className={className}
      style={style}
      onReady={onReady}
      onLoad={onLoad}
      onError={onError}
      renderLoading={renderLoading}
      renderError={renderError}
    />
  );
});
