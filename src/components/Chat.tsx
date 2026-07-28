import type { CSSProperties, ReactNode } from "react";

import type { ArtifactOpenEvent } from "../types";
import { Frame } from "./Frame";

export interface ChatProps {
  inquiryId: string;
  title?: string;
  className?: string;
  style?: CSSProperties;
  onArtifactOpen?: (event: ArtifactOpenEvent) => void;
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
  onArtifactOpen,
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
      onArtifactOpen={onArtifactOpen}
      onLoad={onLoad}
      onError={onError}
      renderLoading={renderLoading}
      renderError={renderError}
    />
  );
}
