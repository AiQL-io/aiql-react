import type { CSSProperties, ReactNode } from "react";

import { Frame } from "./Frame";

export interface ChatProps {
  inquiryId: string;
  title?: string;
  className?: string;
  style?: CSSProperties;
  onLoad?: () => void;
  onError?: (error: string) => void;
  renderLoading?: () => ReactNode;
  renderError?: (error: string) => ReactNode;
}

export function Chat({
  inquiryId,
  title,
  className,
  style,
  onLoad,
  onError,
  renderLoading,
  renderError,
}: ChatProps) {
  return (
    <Frame
      tool="explore"
      resourceId={inquiryId}
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
