import { forwardRef, type CSSProperties, type ReactNode } from "react";

import type { ArtifactOpenEvent } from "../types";
import { Frame, type EmbedChatHandle } from "./Frame";

export interface ChatProps {
  inquiryId: string;
  title?: string;
  className?: string;
  style?: CSSProperties;
  onArtifactOpen?: (event: ArtifactOpenEvent) => void;
  onReady?: () => void;
  onLoad?: () => void;
  onError?: (error: string) => void;
  renderLoading?: () => ReactNode;
  renderError?: (error: string) => ReactNode;
}

export const Chat = forwardRef<EmbedChatHandle, ChatProps>(function Chat(
  {
    inquiryId,
    title,
    className,
    style,
    onArtifactOpen,
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
      tool="explore"
      resourceId={inquiryId}
      title={title}
      className={className}
      style={style}
      onArtifactOpen={onArtifactOpen}
      onReady={onReady}
      onLoad={onLoad}
      onError={onError}
      renderLoading={renderLoading}
      renderError={renderError}
    />
  );
});
