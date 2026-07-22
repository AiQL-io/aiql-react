import { useEffect, type CSSProperties, type ReactNode } from "react";

import { useEmbedFrame } from "../hooks/useEmbedFrame";
import type { AiqlTool } from "../types";

const iframeResetStyle: CSSProperties = {
  border: 0,
  display: "block",
  width: "100%",
  height: "100%",
};

export interface FrameProps {
  tool: AiqlTool;
  resourceId: string;
  title?: string;
  className?: string;
  style?: CSSProperties;
  onLoad?: () => void;
  onError?: (error: string) => void;
  renderLoading?: () => ReactNode;
  renderError?: (error: string) => ReactNode;
}

export function Frame({
  tool,
  resourceId,
  title,
  className,
  style,
  onLoad,
  onError,
  renderLoading,
  renderError,
}: FrameProps) {
  const { embedUrl, frameReady, setFrameReady, error } = useEmbedFrame({
    tool,
    resourceId,
  });

  useEffect(() => {
    if (error) onError?.(error);
  }, [error, onError]);

  if (error) {
    return renderError ? renderError(error) : error;
  }

  if (!embedUrl) {
    return renderLoading ? renderLoading() : null;
  }

  return (
    <>
      {!frameReady && renderLoading ? renderLoading() : null}
      <iframe
        src={embedUrl}
        title={title}
        className={className}
        width="100%"
        height="100%"
        allow="clipboard-write"
        style={{ ...iframeResetStyle, ...style }}
        onLoad={() => {
          setFrameReady(true);
          onLoad?.();
        }}
      />
    </>
  );
}
