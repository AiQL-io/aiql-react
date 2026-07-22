import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

import { EMBED_MESSAGE } from "../constants";

export interface NavigateOptions {
  replace?: boolean;
}

export interface EmbedNavigator {
  isReady: boolean;
  navigate: (path: string, options?: NavigateOptions) => void;
  prefetch: (path: string) => void;
  reset: () => void;
}

type EmbedOutboundMessage =
  | { type: typeof EMBED_MESSAGE.NAVIGATE; path: string; replace: boolean }
  | { type: typeof EMBED_MESSAGE.PREFETCH; path: string };

export function useEmbedNavigator(
  iframeRef: RefObject<HTMLIFrameElement | null>,
  origin: string | null,
): EmbedNavigator {
  const [isReady, setIsReady] = useState(false);
  const readyRef = useRef(false);
  const queueRef = useRef<EmbedOutboundMessage[]>([]);
  const originRef = useRef(origin);
  originRef.current = origin;

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
      if (e.data?.type !== EMBED_MESSAGE.EMBED_READY) return;

      readyRef.current = true;
      setIsReady(true);
      const queued = queueRef.current.splice(0);
      const contentWindow = iframeRef.current?.contentWindow;
      if (!contentWindow) return;
      for (const msg of queued) {
        contentWindow.postMessage(msg, origin);
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

  const reset = useCallback(() => {
    readyRef.current = false;
    setIsReady(false);
    queueRef.current = [];
  }, []);

  return { isReady, navigate, prefetch, reset };
}
