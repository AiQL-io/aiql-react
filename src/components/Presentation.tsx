import type { CSSProperties, ReactNode } from "react";

import { Frame } from "./Frame";

export interface PresentationProps {
  presentationId: string;
  title?: string;
  className?: string;
  style?: CSSProperties;
  onLoad?: () => void;
  onError?: (error: string) => void;
  renderLoading?: () => ReactNode;
  renderError?: (error: string) => ReactNode;
}

export function Presentation({
  presentationId,
  title,
  className,
  style,
  onLoad,
  onError,
  renderLoading,
  renderError,
}: PresentationProps) {
  return (
    <Frame
      tool="present"
      resourceId={presentationId}
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
