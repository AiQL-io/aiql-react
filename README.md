# @aiql.io/react

React SDK for embedding AiQL **Canvas** (Brainstorm) and **Dashboard** (Analyze) tools via iframe.

The API key never reaches the browser. Your backend mints a short-lived workspace-scoped embed token; the SDK fetches it, shares it through a provider, and renders the iframe.

## Install

```bash
npm install @aiql.io/react
```

Peer dependencies: `react` and `react-dom` ≥ 18.

## Quick start

### 1. Create the token endpoint (one line)

Set env vars on your server:

```bash
AIQL_API_KEY=...
AIQL_WORKSPACE_ID=...
```

**Next.js App Router** — `app/api/aiql/route.ts`:

```ts
import { createNextHandler } from "@aiql.io/react/server";

export const GET = createNextHandler();
```

**Express**:

```ts
import { createExpressHandler } from "@aiql.io/react/server";

app.get("/api/aiql", createExpressHandler());
```

**Any framework**:

```ts
import { mintWorkspaceToken, handleTokenRequest } from "@aiql.io/react/server";

const { token, expiresAt } = await mintWorkspaceToken();
// or
const { status, body } = await handleTokenRequest();
```

Optional overrides for the helper factories:

```ts
createNextHandler({
  apiKey: "...",
  workspaceId: "...",
  permission: "edit", // default
  ttlSeconds: 1800,
});
```

### 2. Fetch the token and render

```tsx
import { AiqlProvider, Canvas, Dashboard, useToken } from "@aiql.io/react";

function App() {
  const { token, status, error, reload } = useToken(); // GET /api/aiql

  if (status === "loading" || status === "idle") return <p>Loading…</p>;
  if (status === "error" || !token) {
    return (
      <div>
        <p>{error ?? "Failed to load token"}</p>
        <button type="button" onClick={reload}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <AiqlProvider token={token} theme="auto">
      <Canvas canvasId="your-canvas-id" title="My canvas" />
      <Dashboard dashboardId="your-dashboard-id" title="My dashboard" />
    </AiqlProvider>
  );
}
```

`useToken` accepts an optional URL (default `/api/aiql`) and auto-refreshes the token ~30 seconds before expiry.

You can also mint the token some other way and pass it straight into `AiqlProvider` without using `useToken`.

## Components

| Component | Props |
|-----------|--------|
| `Canvas` | `canvasId`, `title?`, `className?`, `style?`, `onLoad?`, `onError?`, `renderLoading?`, `renderError?` |
| `Dashboard` | `dashboardId`, `title?`, `className?`, `style?`, `onLoad?`, `onError?`, `renderLoading?`, `renderError?` |
| `Frame` | `tool`, `resourceId`, plus the same presentation props as above |

`token` and `theme` always come from `AiqlProvider` context.

## Provider

```tsx
<AiqlProvider token={token} theme="auto">
  {children}
</AiqlProvider>
```

- `token` (required) — raw JWT (or a full embed URL)
- `theme` (optional) — `"light"` | `"dark"` | `"auto"` (default `"auto"`)

## How it works

1. Your server calls `app.aiql.io/api/embed/tokens` with `Authorization: Bearer <AIQL_API_KEY>` and mints a **workspace-scoped** embed token.
2. `useToken()` `GET`s `/api/aiql` and returns the token (with auto-refresh).
3. `AiqlProvider` holds the token (and theme) for the subtree.
4. `Canvas` / `Dashboard` build `https://app.aiql.io/embed/{workspaceId}/{tool}/{resourceId}?token=...&theme=...` and render an iframe.

## Important: aiql-ui dependency

This SDK expects **workspace-scoped (tool-agnostic)** embed tokens: one token authorizes any Canvas/Dashboard in the workspace. Current `app.aiql.io` still requires a `tool` (and optionally `resourceId`) at mint time and validates the tool claim on embed pages.

Until `aiql-ui` accepts tool-agnostic tokens, end-to-end embedding against production may fail even though this package builds and runs correctly against that contract.

Also ensure your host origin is listed in `EMBED_ALLOWED_ORIGINS` on the AiQL app so the iframe is allowed by CSP `frame-ancestors`.

## Package exports

| Import | Contents |
|--------|----------|
| `@aiql.io/react` | `AiqlProvider`, `useToken`, `useAiql`, `Canvas`, `Dashboard`, `Frame`, types |
| `@aiql.io/react/server` | `createNextHandler`, `createExpressHandler`, `handleTokenRequest`, `mintWorkspaceToken` |

The `./server` entry is React-free and safe to use in Node/Next route handlers.
