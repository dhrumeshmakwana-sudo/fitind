// Vendored standalone replacement for `@hatch/space-sdk/client`.
//
// Mirrors the real SDK client's wire protocol and type helpers so
// `client/src/api.ts`, `client/src/main.tsx` and `client/src/App.tsx`
// compile and behave unchanged outside the Muse runtime:
//
//   POST {action, args, actionCallId}  ->  {data} | {error}
//   a success body may also carry `invalidateAll: true`, which the
//   standalone server sets when the handler called
//   `ctx.invalidateQueries()`; the client answers by invalidating the
//   shared QueryClient (the real runtime does the same via host bridge).

import { QueryClient } from "@tanstack/react-query";
import {
  createElement,
  type CSSProperties,
  type HTMLAttributes,
} from "react";
import type { input as ZodInput, ZodType } from "zod";
import type { ActionResponse } from "./index";

// ------------------------------------------------------------ query client

/**
 * Shared TanStack Query client for the app (singleton, as in the real
 * SDK). Defaults per the standalone port: `staleTime: 0` and no
 * refetch-on-window-focus.
 */
export const spaceQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      refetchOnWindowFocus: false,
    },
  },
});

// ------------------------------------------------------------ type helpers

/**
 * Request shape for an action on a typed action client, by name.
 *
 *     import { api, type ApiRequest } from "./api";
 *     type Filter = ApiRequest<typeof api, "searchFoods">;
 */
export type ApiRequest<
  C extends Record<string, (args: never) => Promise<unknown>>,
  K extends keyof C,
> = Parameters<C[K]>[0];

/**
 * Response shape for an action on a typed action client, by name.
 *
 *     import { api, type ApiResponse } from "./api";
 *     type Food = ApiResponse<typeof api, "searchFoods">["foods"][number];
 */
export type ApiResponse<
  C extends Record<string, (args: never) => Promise<unknown>>,
  K extends keyof C,
> = Awaited<ReturnType<C[K]>>;

type ClientActionShape = {
  request: ZodType;
  response: ZodType;
};

export type ActionClient<A extends Record<string, ClientActionShape>> = {
  [K in keyof A]: (
    args: ZodInput<A[K]["request"]>,
  ) => Promise<ActionResponse<A[K]>>;
};

// ------------------------------------------------------------ action client

interface ClientOptions {
  /** Override the action endpoint (defaults to `./actions` resolved against `location.href`). */
  endpoint?: string;
  /** Inject a custom fetch (mostly for tests). */
  fetch?: typeof globalThis.fetch;
}

const DEFAULT_ENDPOINT = "./actions";

function resolveEndpoint(relative: string): string {
  const href = (globalThis as { location?: { href?: unknown } }).location
    ?.href;
  if (typeof href !== "string" || href.length === 0) {
    return relative;
  }
  const base = new URL(href);
  base.hash = "";
  base.search = "";
  return new URL(relative, base).toString();
}

function createActionCallId(): string {
  const cryptoObj = (globalThis as { crypto?: Crypto }).crypto;
  if (cryptoObj && typeof cryptoObj.randomUUID === "function") {
    return cryptoObj.randomUUID();
  }
  return `call-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Typed RPC client: a proxy whose properties are the action names.
 * Calling one POSTs `{action, args, actionCallId}` to `./actions`;
 * a `{error}` body throws `new Error(error)`, a success body returns
 * `data` (after honoring the `invalidateAll` flag).
 */
export function createActionClient<A extends Record<string, ClientActionShape>>(
  options: ClientOptions = {},
): ActionClient<A> {
  const endpoint = options.endpoint ?? resolveEndpoint(DEFAULT_ENDPOINT);
  const fetchImpl = options.fetch ?? globalThis.fetch;
  return new Proxy(
    {},
    {
      get(_target, name) {
        // Symbol keys and promise-protocol names must NOT resolve to a
        // phantom action (same guard as the real SDK client).
        if (typeof name !== "string") {
          return undefined;
        }
        if (name === "then" || name === "catch" || name === "finally") {
          return undefined;
        }
        return async (args?: unknown) => {
          const actionCallId = createActionCallId();
          const response = await fetchImpl(endpoint, {
            method: "POST",
            headers: {
              "content-type": "application/json",
              "x-request-id": actionCallId,
            },
            body: JSON.stringify({
              action: name,
              args: args ?? {},
              actionCallId,
            }),
          });
          const body = (await response.json().catch(() => null)) as {
            data?: unknown;
            error?: unknown;
            invalidateAll?: unknown;
          } | null;
          if (body && typeof body === "object" && body.error) {
            throw new Error(String(body.error));
          }
          if (!response.ok) {
            throw new Error(
              `action ${name} failed: HTTP ${response.status}`,
            );
          }
          if (body && body.invalidateAll === true) {
            void spaceQueryClient.invalidateQueries();
          }
          return body?.data;
        };
      },
    },
  ) as ActionClient<A>;
}

// ------------------------------------------------------------ safe-area scrim

export type SafeAreaTopScrimVariant = "gradient" | "blur" | "solid";

export interface SafeAreaTopScrimProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Visual treatment for the protected top inset. */
  variant?: SafeAreaTopScrimVariant;
  /** Background used to keep status-bar text readable. Defaults to `var(--bg)`. */
  backgroundColor?: CSSProperties["backgroundColor"];
  /** Stacking layer for the fixed scrim. Defaults to 40. */
  zIndex?: CSSProperties["zIndex"];
}

const TOP_SAFE_AREA_SCRIM_HEIGHT =
  "calc(var(--twsa-safe-area-inset-top, env(safe-area-inset-top, 0px)) + min(2rem, var(--twsa-safe-area-inset-top, env(safe-area-inset-top, 0px))))";
const TOP_SAFE_AREA_INSET_HEIGHT =
  "var(--twsa-safe-area-inset-top, env(safe-area-inset-top, 0px))";
const TOP_SAFE_AREA_GRADIENT_MASK =
  "linear-gradient(to bottom, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.99) 10%, rgba(0, 0, 0, 0.96) 20%, rgba(0, 0, 0, 0.90) 30%, rgba(0, 0, 0, 0.80) 40%, rgba(0, 0, 0, 0.67) 50%, rgba(0, 0, 0, 0.52) 60%, rgba(0, 0, 0, 0.36) 70%, rgba(0, 0, 0, 0.20) 80%, rgba(0, 0, 0, 0.08) 90%, rgba(0, 0, 0, 0) 100%)";

/**
 * Fixed top safe-area protection: covers the device status-bar inset
 * (collapsing to zero height where there is no inset, e.g. desktop),
 * with an optional small gradient fade. Behavior mirrors the real SDK
 * component; the component owns positioning, z-index, pointer-events
 * and height.
 */
export function SafeAreaTopScrim({
  variant = "gradient",
  backgroundColor,
  zIndex = 40,
  className,
  style,
  ...props
}: SafeAreaTopScrimProps) {
  const resolvedBackgroundColor =
    backgroundColor ?? style?.backgroundColor ?? "var(--bg)";
  const managedStyle: CSSProperties = {
    ...style,
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex,
    pointerEvents: "none",
    height:
      variant === "gradient"
        ? TOP_SAFE_AREA_SCRIM_HEIGHT
        : TOP_SAFE_AREA_INSET_HEIGHT,
    backgroundColor: resolvedBackgroundColor,
  };
  if (variant === "gradient") {
    managedStyle.maskImage = TOP_SAFE_AREA_GRADIENT_MASK;
    managedStyle.WebkitMaskImage = TOP_SAFE_AREA_GRADIENT_MASK;
  } else if (variant === "blur") {
    managedStyle.backdropFilter = style?.backdropFilter ?? "blur(12px)";
    managedStyle.WebkitBackdropFilter =
      style?.WebkitBackdropFilter ?? "blur(12px)";
  }
  return createElement("div", {
    ...props,
    "aria-hidden": props["aria-hidden"] ?? true,
    className,
    style: managedStyle,
  });
}
