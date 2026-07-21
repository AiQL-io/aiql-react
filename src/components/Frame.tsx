import {
  useEffect,
  type CSSProperties,
  type ReactNode,
} from "react";

import type { AiqlTool } from "../types";
import { useEmbedFrame } from "../hooks/useEmbedFrame";

const SPINNER_STYLE_ID = "aiql-react-spinner-style";

function ensureSpinnerStyle() {
  if (typeof document === "undefined") return;
  if (document.getElementById(SPINNER_STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = SPINNER_STYLE_ID;
  style.textContent = `
@keyframes aiql-spin {
  to { transform: rotate(360deg); }
}
`;
  document.head.appendChild(style);
}

const wrapStyle: CSSProperties = {
  position: "relative",
  display: "flex",
  minHeight: 640,
  width: "100%",
  overflow: "hidden",
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  background: "#fff",
};

const iframeStyle: CSSProperties = {
  flex: 1,
  width: "100%",
  height: "100%",
  minHeight: 640,
  border: 0,
  background: "transparent",
};

const overlayStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#fff",
  zIndex: 1,
};

const messageStyle: CSSProperties = {
  margin: "auto",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 10,
  padding: 40,
  color: "#6b7280",
  fontSize: 14,
  textAlign: "center",
};

const spinnerStyle: CSSProperties = {
  width: 14,
  height: 14,
  borderRadius: "50%",
  border: "2px solid #e5e7eb",
  borderTopColor: "#111827",
  animation: "aiql-spin 0.7s linear infinite",
  display: "inline-block",
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
    ensureSpinnerStyle();
  }, []);

  useEffect(() => {
    if (error) onError?.(error);
  }, [error, onError]);

  if (error) {
    return (
      <div className={className} style={{ ...wrapStyle, ...style }}>
        {renderError ? (
          renderError(error)
        ) : (
          <div style={messageStyle}>
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }

  if (!embedUrl) {
    return (
      <div className={className} style={{ ...wrapStyle, ...style }}>
        {renderLoading ? (
          renderLoading()
        ) : (
          <div style={messageStyle}>
            <span style={spinnerStyle} />
            <span>Loading…</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={className} style={{ ...wrapStyle, ...style }}>
      {!frameReady
        ? renderLoading
          ? renderLoading()
          : (
            <div style={overlayStyle}>
              <span style={spinnerStyle} />
            </div>
          )
        : null}
      <iframe
        key={embedUrl}
        src={embedUrl}
        title={title}
        allow="clipboard-write"
        style={iframeStyle}
        onLoad={() => {
          setFrameReady(true);
          onLoad?.();
        }}
      />
    </div>
  );
}
