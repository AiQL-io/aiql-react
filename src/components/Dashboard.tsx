import type { CSSProperties, ReactNode } from "react";

import { Frame } from "./Frame";

export interface DashboardProps {
  dashboardId: string;
  title?: string;
  className?: string;
  style?: CSSProperties;
  onLoad?: () => void;
  onError?: (error: string) => void;
  renderLoading?: () => ReactNode;
  renderError?: (error: string) => ReactNode;
}

export function Dashboard({
  dashboardId,
  title,
  className,
  style,
  onLoad,
  onError,
  renderLoading,
  renderError,
}: DashboardProps) {
  return (
    <Frame
      tool="analyze"
      resourceId={dashboardId}
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
