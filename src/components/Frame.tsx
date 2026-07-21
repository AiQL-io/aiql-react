import { useEffect, type CSSProperties, type ReactNode } from "react";

import { useEmbedFrame } from "../hooks/useEmbedFrame";
import type { AiqlTool } from "../types";

const fillStyle: CSSProperties = {
  width: "100%",
  height: "100%",
};

const iframeResetStyle: CSSProperties = {
  ...fillStyle,
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
    return (
      <div className={className} style={{ ...fillStyle, ...style }}>
        {renderError ? renderError(error) : error}
      </div>
    );
  }

  if (!embedUrl) {
    return (
      <div className={className} style={{ ...fillStyle, ...style }}>
        {renderLoading ? renderLoading() : null}
      </div>
    );
  }

  return (
    <div className={className} style={{ ...fillStyle, ...style }}>
      {!frameReady && renderLoading ? renderLoading() : null}
      <iframe
        key={embedUrl}
        src={embedUrl}
        title={title}
        allow="clipboard-write"
        style={iframeResetStyle}
        onLoad={() => {
          setFrameReady(true);
          onLoad?.();
        }}
      />
    </div>
  );
}
