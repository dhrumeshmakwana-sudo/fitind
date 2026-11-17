// Vendored standalone replacement for `@hatch/space-sdk` (server entry).
//
// The Muse runtime provides the real SDK; this shim provides the exact
// same surface FITIND's `server/src/actions.ts` compiles against —
// `defineAction`, the `z` re-export, and the `Ctx` / `ActionsModule` types —
// so the identical action module runs under a plain Bun server
// (`server/standalone.ts`). The wire protocol and type shapes mirror
// `dist/server-contract.d.ts` + `dist/index.d.ts` of SDK 0.15.1.

import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { z } from "zod";

export { z };

/** A loose JSON value (parity with the real SDK). */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

/**
 * Portable typed drizzle-orm DB surface. The schema TYPE flows from the
 * call site (`ctx.db<typeof schema>()`) into Drizzle's query types; at
 * runtime the standalone server hands back its `drizzle-orm/libsql`
 * database (local file: URL or remote Turso), whose query builders
 * expose the same methods.
 */
export type SpaceDb<
  TSchema extends Record<string, unknown> = Record<string, never>,
> = Pick<
  LibSQLDatabase<TSchema>,
  "select" | "insert" | "update" | "delete" | "run" | "all" | "get" | "batch"
>;

/** Per-invocation typed DB accessor. */
export type SpaceDbAccessor = <
  TSchema extends Record<string, unknown> = Record<string, never>,
>() => SpaceDb<TSchema>;

/**
 * Per-invocation context passed to every action handler. FITIND's actions
 * use exactly two members — `db` and `invalidateQueries` — so the shim's
 * Ctx carries only those (the real runtime's Ctx adds agent/inference/
 * tool/blob surfaces that FITIND never touches).
 */
export interface Ctx {
  readonly db: SpaceDbAccessor;
  /**
   * Signal that this mutation changed durable data, so open clients
   * should refetch. The standalone server turns a call into an
   * `invalidateAll: true` flag on the action response, and the vendored
   * client answers it by invalidating its shared QueryClient.
   */
  invalidateQueries(invalidation?: unknown): void;
}

/** Versioned brand identifying a value as an action definition. */
export const ACTION_BRAND = "@hatch/space-sdk/action/v1" as const;

export interface ActionDefinition<
  TCtx = Ctx,
  Req extends z.ZodType = z.ZodType,
  Res extends z.ZodType = z.ZodType,
> {
  readonly __brand: typeof ACTION_BRAND;
  readonly request: Req;
  readonly response: Res;
  readonly description?: string;
  readonly handler: (
    ctx: TCtx,
    args: z.infer<Req>,
  ) => Promise<z.infer<Res>>;
}

export type ActionFactoryInput<
  TCtx,
  Req extends z.ZodType,
  Res extends z.ZodType,
> = {
  request: Req;
  response: Res;
  /** One sentence telling the user's agent what the action does. */
  description?: string;
  handler: (ctx: TCtx, args: z.infer<Req>) => Promise<z.infer<Res>>;
};

/**
 * Define a single action. The schemas drive both runtime validation (in
 * the standalone server) and static typing (on the client via
 * `createActionClient`). At runtime this simply returns the spec object
 * with its brand; dispatch lives in `server/standalone.ts`.
 */
export function defineAction<
  Req extends z.ZodType,
  Res extends z.ZodType,
>(spec: ActionFactoryInput<Ctx, Req, Res>): ActionDefinition<Ctx, Req, Res> {
  return { __brand: ACTION_BRAND, ...spec };
}

/** Runtime check used by dispatchers to recognize action definitions. */
export function isAction(value: unknown): value is ActionDefinition {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as { __brand?: unknown }).__brand === ACTION_BRAND &&
    typeof (value as { handler?: unknown }).handler === "function"
  );
}

/**
 * The shape every space's `actions.ts` must satisfy (`} satisfies
 * ActionsModule`). Same variance dodge as the real SDK: `Omit` collapses
 * the invariant generics, and a loose-but-required `handler` is
 * re-attached so stray non-action exports are still rejected.
 */
export type ActionsModuleFor<TCtx> = Record<
  string,
  Omit<ActionDefinition<TCtx>, "handler"> & {
    handler: (ctx: TCtx, args: any) => Promise<any>;
  }
>;

export type ActionsModule = ActionsModuleFor<Ctx>;

/** Extract the request payload type for a given action. */
export type ActionRequest<A extends { request: z.ZodType }> = z.infer<
  A["request"]
>;

/** Extract the response payload type for a given action. */
export type ActionResponse<A extends { response: z.ZodType }> = z.infer<
  A["response"]
>;
