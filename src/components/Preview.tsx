import { useMemo, type CSSProperties, type ReactNode } from "react";

import { Frame } from "./Frame";

export interface PreviewProps {
  documentId: string;
  page?: number;
  chunkId?: string;
  title?: string;
  className?: string;
  style?: CSSProperties;
  onLoad?: () => void;
  onError?: (error: string) => void;
  renderLoading?: () => ReactNode;
  renderError?: (error: string) => ReactNode;
}

export function Preview({
  documentId,
  page,
  chunkId,
  title,
  className,
  style,
  onLoad,
  onError,
  renderLoading,
  renderError,
}: PreviewProps) {
  const params = useMemo(
    () => ({
      page,
      chunkId,
    }),
    [page, chunkId],
  );

  return (
    <Frame
      tool="preview"
      resourceId={documentId}
      params={params}
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
