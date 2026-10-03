import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

import { EMBED_MESSAGE } from "../constants";
import type { AiqlArtifactType, ArtifactOpenEvent } from "../types";

export interface NavigateOptions {
  replace?: boolean;
}

export interface EmbedNavigator {
  isReady: boolean;
  navigate: (path: string, options?: NavigateOptions) => void;
  prefetch: (path: string) => void;
  sendMessage: (text: string) => void;
  reset: () => void;
}

type EmbedOutboundMessage =
  | { type: typeof EMBED_MESSAGE.NAVIGATE; path: string; replace: boolean }
  | { type: typeof EMBED_MESSAGE.PREFETCH; path: string }
  | { type: typeof EMBED_MESSAGE.SEND_MESSAGE; text: string };

const ARTIFACT_TYPES = new Set<AiqlArtifactType>([
  "canvas",
  "dashboard",
  "presentation",
  "inquiry",
  "document",
  "written-document",
]);

function parseArtifactOpen(data: unknown): ArtifactOpenEvent | null {
  if (!data || typeof data !== "object") return null;

  const msg = data as {
    type?: unknown;
    artifact?: { type?: unknown; id?: unknown };
    path?: unknown;
  };

  if (msg.type !== EMBED_MESSAGE.ARTIFACT_OPEN) return null;
  if (typeof msg.path !== "string" || !msg.path.startsWith("/")) return null;
  if (!msg.artifact || typeof msg.artifact !== "object") return null;
  if (typeof msg.artifact.id !== "string" || !msg.artifact.id) return null;
  if (
    typeof msg.artifact.type !== "string" ||
    !ARTIFACT_TYPES.has(msg.artifact.type as AiqlArtifactType)
  ) {
    return null;
  }

  return {
    type: msg.artifact.type as AiqlArtifactType,
    id: msg.artifact.id,
    path: msg.path,
  };
}

export function useEmbedNavigator(
  iframeRef: RefObject<HTMLIFrameElement | null>,
  origin: string | null,
  onArtifactOpen?: (event: ArtifactOpenEvent) => void,
): EmbedNavigator {
  const [isReady, setIsReady] = useState(false);
  const readyRef = useRef(false);
  const queueRef = useRef<EmbedOutboundMessage[]>([]);
  const originRef = useRef(origin);
  originRef.current = origin;
  const onArtifactOpenRef = useRef(onArtifactOpen);
  onArtifactOpenRef.current = onArtifactOpen;

  const send = useCallback(
    (msg: EmbedOutboundMessage) => {
      const targetOrigin = originRef.current;
      const contentWindow = iframeRef.current?.contentWindow;
      if (!targetOrigin || !contentWindow) {
        queueRef.current.push(msg);
        return;
      }
      if (readyRef.current) {
        contentWindow.postMessage(msg, targetOrigin);
      } else {
        queueRef.current.push(msg);
      }
    },
    [iframeRef],
  );

  useEffect(() => {
    if (!origin) return;

    function onMessage(e: MessageEvent) {
      if (e.origin !== origin) return;
      if (e.source !== iframeRef.current?.contentWindow) return;

      if (e.data?.type === EMBED_MESSAGE.EMBED_READY) {
        readyRef.current = true;
        setIsReady(true);
        const queued = queueRef.current.splice(0);
        const contentWindow = iframeRef.current?.contentWindow;
        if (!contentWindow) return;
        for (const msg of queued) {
          contentWindow.postMessage(msg, origin);
        }
        return;
      }

      const artifactEvent = parseArtifactOpen(e.data);
      if (artifactEvent) {
        onArtifactOpenRef.current?.(artifactEvent);
      }
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [iframeRef, origin]);

  const navigate = useCallback(
    (path: string, options: NavigateOptions = {}) => {
      send({
        type: EMBED_MESSAGE.NAVIGATE,
        path,
        replace: options.replace ?? false,
      });
    },
    [send],
  );

  const prefetch = useCallback(
    (path: string) => {
      send({ type: EMBED_MESSAGE.PREFETCH, path });
    },
    [send],
  );

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      send({ type: EMBED_MESSAGE.SEND_MESSAGE, text: trimmed });
    },
    [send],
  );

  const reset = useCallback(() => {
    readyRef.current = false;
    setIsReady(false);
    queueRef.current = [];
  }, []);

  return { isReady, navigate, prefetch, sendMessage, reset };
}
