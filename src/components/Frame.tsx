import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import { useEmbedFrame } from "../hooks/useEmbedFrame";
import { useEmbedNavigator } from "../hooks/useEmbedNavigator";
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
  params?: Record<string, string | number | undefined>;
  title?: string;
  className?: string;
  style?: CSSProperties;
  navigationMode?: "push" | "replace";
  onLoad?: () => void;
  onError?: (error: string) => void;
  renderLoading?: () => ReactNode;
  renderError?: (error: string) => ReactNode;
}

function toEmbedPath(url: string): string | null {
  try {
    const parsed = new URL(url);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return null;
  }
}

export function Frame({
  tool,
  resourceId,
  params,
  title,
  className,
  style,
  navigationMode = "replace",
  onLoad,
  onError,
  renderLoading,
  renderError,
}: FrameProps) {
  const { embedUrl, frameReady, setFrameReady, error } = useEmbedFrame({
    tool,
    resourceId,
    params,
  });

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);
  const lastPathRef = useRef<string | null>(null);
  const hasSentInitialRef = useRef(false);

  if (embedUrl && !iframeSrc) {
    setIframeSrc(embedUrl);
  }

  const embedOrigin = useMemo(() => {
    if (!iframeSrc) return null;
    try {
      return new URL(iframeSrc).origin;
    } catch {
      return null;
    }
  }, [iframeSrc]);

  const { isReady, navigate, reset } = useEmbedNavigator(
    iframeRef,
    embedOrigin,
  );

  useEffect(() => {
    if (error) onError?.(error);
  }, [error, onError]);

  useEffect(() => {
    if (!embedUrl) return;

    const path = toEmbedPath(embedUrl);
    if (!path) return;

    if (!hasSentInitialRef.current) {
      hasSentInitialRef.current = true;
      lastPathRef.current = path;
      return;
    }

    if (path === lastPathRef.current) return;
    lastPathRef.current = path;

    if (isReady) {
      navigate(path, { replace: navigationMode === "replace" });
      return;
    }

    reset();
    setIframeSrc(embedUrl);
  }, [embedUrl, isReady, navigate, navigationMode, reset]);

  if (error) {
    return renderError ? renderError(error) : error;
  }

  if (!iframeSrc) {
    return renderLoading ? renderLoading() : null;
  }

  return (
    <>
      {!frameReady && renderLoading ? renderLoading() : null}
      <iframe
        ref={iframeRef}
        src={iframeSrc}
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
