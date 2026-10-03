import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import { useAiql } from "../hooks/useAiql";
import { useEmbedFrame } from "../hooks/useEmbedFrame";
import { useEmbedNavigator } from "../hooks/useEmbedNavigator";
import type { AiqlTool, ArtifactOpenEvent } from "../types";

const iframeResetStyle: CSSProperties = {
  border: 0,
  display: "block",
  width: "100%",
  height: "100%",
};

const DEFAULT_ALLOW = "clipboard-write; fullscreen; microphone; autoplay";

export interface EmbedChatHandle {
  sendMessage: (text: string) => void;
}

export interface FrameProps {
  tool: AiqlTool;
  resourceId?: string;
  params?: Record<string, string | number | undefined>;
  title?: string;
  className?: string;
  style?: CSSProperties;
  allow?: string;
  navigationMode?: "push" | "replace";
  onArtifactOpen?: (event: ArtifactOpenEvent) => void;
  onReady?: () => void;
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

export const Frame = forwardRef<EmbedChatHandle, FrameProps>(function Frame(
  {
    tool,
    resourceId,
    params,
    title,
    className,
    style,
    allow = DEFAULT_ALLOW,
    navigationMode = "replace",
    onArtifactOpen,
    onReady,
    onLoad,
    onError,
    renderLoading,
    renderError,
  },
  ref,
) {
  const { onArtifactOpen: providerOnArtifactOpen } = useAiql();
  const handleArtifactOpen = onArtifactOpen ?? providerOnArtifactOpen;

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

  const { isReady, navigate, reset, sendMessage } = useEmbedNavigator(
    iframeRef,
    embedOrigin,
    handleArtifactOpen,
  );

  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;
  const announcedReadyRef = useRef(false);

  useImperativeHandle(ref, () => ({ sendMessage }), [sendMessage]);

  useEffect(() => {
    if (!isReady) {
      announcedReadyRef.current = false;
      return;
    }
    if (announcedReadyRef.current) return;
    announcedReadyRef.current = true;
    onReadyRef.current?.();
  }, [isReady]);

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
        allow={allow}
        style={{ ...iframeResetStyle, ...style }}
        onLoad={() => {
          setFrameReady(true);
          onLoad?.();
        }}
      />
    </>
  );
});
