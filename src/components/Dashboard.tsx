import { forwardRef, type CSSProperties, type ReactNode } from "react";

import { Frame, type EmbedChatHandle } from "./Frame";

export interface DashboardProps {
  dashboardId: string;
  title?: string;
  className?: string;
  style?: CSSProperties;
  onReady?: () => void;
  onLoad?: () => void;
  onError?: (error: string) => void;
  renderLoading?: () => ReactNode;
  renderError?: (error: string) => ReactNode;
}

export const Dashboard = forwardRef<EmbedChatHandle, DashboardProps>(
  function Dashboard(
    {
      dashboardId,
      title,
      className,
      style,
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
        tool="analyze"
        resourceId={dashboardId}
        title={title}
        className={className}
        style={style}
        onReady={onReady}
        onLoad={onLoad}
        onError={onError}
        renderLoading={renderLoading}
        renderError={renderError}
      />
    );
  },
);
