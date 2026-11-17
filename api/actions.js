var __defProp = Object.defineProperty;
var __returnValue = (v) => v;
function __exportSetter(name, newValue) {
  this[name] = __returnValue.bind(null, newValue);
}
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: __exportSetter.bind(all, name)
    });
};

// server/src/schema.ts
var exports_schema = {};
__export(exports_schema, {
  adminAuditLog: () => adminAuditLog,
  adminRoles: () => adminRoles,
  challengeChecks: () => challengeChecks,
  challengeDayNotes: () => challengeDayNotes,
  challengeTasks: () => challengeTasks,
  challenges: () => challenges,
  diaryEntries: () => diaryEntries,
  exercises: () => exercises,
  favouriteFoods: () => favouriteFoods,
  favouriteRecipes: () => favouriteRecipes,
  foods: () => foods,
  mealPlanEntries: () => mealPlanEntries,
  measurements: () => measurements,
  profiles: () => profiles,
  recipeIngredients: () => recipeIngredients,
  recipes: () => recipes,
  routineExercises: () => routineExercises,
  routines: () => routines,
  sessionExercises: () => sessionExercises,
  sessions: () => sessions,
  userGoals: () => userGoals,
  userPreferences: () => userPreferences,
  users: () => users,
  waterEntries: () => waterEntries,
  weightLogs: () => weightLogs,
  workoutSessions: () => workoutSessions,
  workoutSets: () => workoutSets
});

// server/app.ts
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { mkdirSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// node_modules/zod/v4/core/core.js
var _a;
function $constructor(name, initializer, params) {
  function init(inst, def) {
    if (!inst._zod) {
      Object.defineProperty(inst, "_zod", {
        value: {
          def,
          constr: _,
          traits: new Set
        },
        enumerable: false
      });
    }
    if (inst._zod.traits.has(name)) {
      return;
    }
    inst._zod.traits.add(name);
    initializer(inst, def);
    const proto = _.prototype;
    const keys = Object.keys(proto);
    for (let i = 0;i < keys.length; i++) {
      const k = keys[i];
      if (!(k in inst)) {
        inst[k] = proto[k].bind(inst);
      }
    }
  }
  const Parent = params?.Parent ?? Object;

  class Definition extends Parent {
  }
  Object.defineProperty(Definition, "name", { value: name });
  function _(def) {
    var _a;
    const inst = params?.Parent ? new Definition : this;
    init(inst, def);
    (_a = inst._zod).deferred ?? (_a.deferred = []);
    for (const fn of inst._zod.deferred) {
      fn();
    }
    return inst;
  }
  Object.defineProperty(_, "init", { value: init });
  Object.defineProperty(_, Symbol.hasInstance, {
    value: (inst) => {
      if (params?.Parent && inst instanceof params.Parent)
        return true;
      return inst?._zod?.traits?.has(name);
    }
  });
  Object.defineProperty(_, "name", { value: name });
  return _;
}
var $brand = Symbol("zod_brand");

class $ZodAsyncError extends Error {
  constructor() {
    super(`Encountered Promise during synchronous parse. Use .parseAsync() instead.`);
  }
}

class $ZodEncodeError extends Error {
  constructor(name) {
    super(`Encountered unidirectional transform during encode: ${name}`);
    this.name = "ZodEncodeError";
  }
}
(_a = globalThis).__zod_globalConfig ?? (_a.__zod_globalConfig = {});
var globalConfig = globalThis.__zod_globalConfig;
function config(newConfig) {
  if (newConfig)
    Object.assign(globalConfig, newConfig);
  return globalConfig;
}
// node_modules/zod/v4/core/util.js
function getEnumValues(entries) {
  const numericValues = Object.values(entries).filter((v) => typeof v === "number");
  const values = Object.entries(entries).filter(([k, _]) => numericValues.indexOf(+k) === -1).map(([_, v]) => v);
  return values;
}
function jsonStringifyReplacer(_, value) {
  if (typeof value === "bigint")
    return value.toString();
  return value;
}
function cached(getter) {
  const set = false;
  return {
    get value() {
      if (!set) {
        const value = getter();
        Object.defineProperty(this, "value", { value });
        return value;
      }
      throw new Error("cached value already set");
    }
  };
}
function nullish(input) {
  return input === null || input === undefined;
}
function cleanRegex(source) {
  const start = source.startsWith("^") ? 1 : 0;
  const end = source.endsWith("$") ? source.length - 1 : source.length;
  return source.slice(start, end);
}
function floatSafeRemainder(val, step) {
  const ratio = val / step;
  const roundedRatio = Math.round(ratio);
  const tolerance = Number.EPSILON * Math.max(Math.abs(ratio), 1);
  if (Math.abs(ratio - roundedRatio) < tolerance)
    return 0;
  return ratio - roundedRatio;
}
var EVALUATING = /* @__PURE__ */ Symbol("evaluating");
function defineLazy(object, key, getter) {
  let value = undefined;
  Object.defineProperty(object, key, {
    get() {
      if (value === EVALUATING) {
        return;
      }
      if (value === undefined) {
        value = EVALUATING;
        value = getter();
      }
      return value;
    },
    set(v) {
      Object.defineProperty(object, key, {
        value: v
      });
    },
    configurable: true
  });
}
function assignProp(target, prop, value) {
  Object.defineProperty(target, prop, {
    value,
    writable: true,
    enumerable: true,
    configurable: true
  });
}
function mergeDefs(...defs) {
  const mergedDescriptors = {};
  for (const def of defs) {
    const descriptors = Object.getOwnPropertyDescriptors(def);
    Object.assign(mergedDescriptors, descriptors);
  }
  return Object.defineProperties({}, mergedDescriptors);
}
function esc(str) {
  return JSON.stringify(str);
}
function slugify(input) {
  return input.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
var captureStackTrace = "captureStackTrace" in Error ? Error.captureStackTrace : (..._args) => {};
function isObject(data) {
  return typeof data === "object" && data !== null && !Array.isArray(data);
}
var allowsEval = /* @__PURE__ */ cached(() => {
  if (globalConfig.jitless) {
    return false;
  }
  if (typeof navigator !== "undefined" && navigator?.userAgent?.includes("Cloudflare")) {
    return false;
  }
  try {
    const F = Function;
    new F("");
    return true;
  } catch (_) {
    return false;
  }
});
function isPlainObject(o) {
  if (isObject(o) === false)
    return false;
  const ctor = o.constructor;
  if (ctor === undefined)
    return true;
  if (typeof ctor !== "function")
    return true;
  const prot = ctor.prototype;
  if (isObject(prot) === false)
    return false;
  if (Object.prototype.hasOwnProperty.call(prot, "isPrototypeOf") === false) {
    return false;
  }
  return true;
}
function shallowClone(o) {
  if (isPlainObject(o))
    return { ...o };
  if (Array.isArray(o))
    return [...o];
  if (o instanceof Map)
    return new Map(o);
  if (o instanceof Set)
    return new Set(o);
  return o;
}
var propertyKeyTypes = /* @__PURE__ */ new Set(["string", "number", "symbol"]);
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function clone(inst, def, params) {
  const cl = new inst._zod.constr(def ?? inst._zod.def);
  if (!def || params?.parent)
    cl._zod.parent = inst;
  return cl;
}
function normalizeParams(_params) {
  const params = _params;
  if (!params)
    return {};
  if (typeof params === "string")
    return { error: () => params };
  if (params?.message !== undefined) {
    if (params?.error !== undefined)
      throw new Error("Cannot specify both `message` and `error` params");
    params.error = params.message;
  }
  delete params.message;
  if (typeof params.error === "string")
    return { ...params, error: () => params.error };
  return params;
}
function optionalKeys(shape) {
  return Object.keys(shape).filter((k) => {
    return shape[k]._zod.optin === "optional" && shape[k]._zod.optout === "optional";
  });
}
var NUMBER_FORMAT_RANGES = {
  safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
  int32: [-2147483648, 2147483647],
  uint32: [0, 4294967295],
  float32: [-340282346638528860000000000000000000000, 340282346638528860000000000000000000000],
  float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
};
function pick(schema, mask) {
  const currDef = schema._zod.def;
  const checks = currDef.checks;
  const hasChecks = checks && checks.length > 0;
  if (hasChecks) {
    throw new Error(".pick() cannot be used on object schemas containing refinements");
  }
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const newShape = {};
      for (const key in mask) {
        if (!(key in currDef.shape)) {
          throw new Error(`Unrecognized key: "${key}"`);
        }
        if (!mask[key])
          continue;
        newShape[key] = currDef.shape[key];
      }
      assignProp(this, "shape", newShape);
      return newShape;
    },
    checks: []
  });
  return clone(schema, def);
}
function omit(schema, mask) {
  const currDef = schema._zod.def;
  const checks = currDef.checks;
  const hasChecks = checks && checks.length > 0;
  if (hasChecks) {
    throw new Error(".omit() cannot be used on object schemas containing refinements");
  }
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const newShape = { ...schema._zod.def.shape };
      for (const key in mask) {
        if (!(key in currDef.shape)) {
          throw new Error(`Unrecognized key: "${key}"`);
        }
        if (!mask[key])
          continue;
        delete newShape[key];
      }
      assignProp(this, "shape", newShape);
      return newShape;
    },
    checks: []
  });
  return clone(schema, def);
}
function extend(schema, shape) {
  if (!isPlainObject(shape)) {
    throw new Error("Invalid input to extend: expected a plain object");
  }
  const checks = schema._zod.def.checks;
  const hasChecks = checks && checks.length > 0;
  if (hasChecks) {
    const existingShape = schema._zod.def.shape;
    for (const key in shape) {
      if (Object.getOwnPropertyDescriptor(existingShape, key) !== undefined) {
        throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
      }
    }
  }
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const _shape = { ...schema._zod.def.shape, ...shape };
      assignProp(this, "shape", _shape);
      return _shape;
    }
  });
  return clone(schema, def);
}
function safeExtend(schema, shape) {
  if (!isPlainObject(shape)) {
    throw new Error("Invalid input to safeExtend: expected a plain object");
  }
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const _shape = { ...schema._zod.def.shape, ...shape };
      assignProp(this, "shape", _shape);
      return _shape;
    }
  });
  return clone(schema, def);
}
function merge(a, b) {
  if (a._zod.def.checks?.length) {
    throw new Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
  }
  const def = mergeDefs(a._zod.def, {
    get shape() {
      const _shape = { ...a._zod.def.shape, ...b._zod.def.shape };
      assignProp(this, "shape", _shape);
      return _shape;
    },
    get catchall() {
      return b._zod.def.catchall;
    },
    checks: b._zod.def.checks ?? []
  });
  return clone(a, def);
}
function partial(Class, schema, mask) {
  const currDef = schema._zod.def;
  const checks = currDef.checks;
  const hasChecks = checks && checks.length > 0;
  if (hasChecks) {
    throw new Error(".partial() cannot be used on object schemas containing refinements");
  }
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const oldShape = schema._zod.def.shape;
      const shape = { ...oldShape };
      if (mask) {
        for (const key in mask) {
          if (!(key in oldShape)) {
            throw new Error(`Unrecognized key: "${key}"`);
          }
          if (!mask[key])
            continue;
          shape[key] = Class ? new Class({
            type: "optional",
            innerType: oldShape[key]
          }) : oldShape[key];
        }
      } else {
        for (const key in oldShape) {
          shape[key] = Class ? new Class({
            type: "optional",
            innerType: oldShape[key]
          }) : oldShape[key];
        }
      }
      assignProp(this, "shape", shape);
      return shape;
    },
    checks: []
  });
  return clone(schema, def);
}
function required(Class, schema, mask) {
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const oldShape = schema._zod.def.shape;
      const shape = { ...oldShape };
      if (mask) {
        for (const key in mask) {
          if (!(key in shape)) {
            throw new Error(`Unrecognized key: "${key}"`);
          }
          if (!mask[key])
            continue;
          shape[key] = new Class({
            type: "nonoptional",
            innerType: oldShape[key]
          });
        }
      } else {
        for (const key in oldShape) {
          shape[key] = new Class({
            type: "nonoptional",
            innerType: oldShape[key]
          });
        }
      }
      assignProp(this, "shape", shape);
      return shape;
    }
  });
  return clone(schema, def);
}
function aborted(x, startIndex = 0) {
  if (x.aborted === true)
    return true;
  for (let i = startIndex;i < x.issues.length; i++) {
    if (x.issues[i]?.continue !== true) {
      return true;
    }
  }
  return false;
}
function explicitlyAborted(x, startIndex = 0) {
  if (x.aborted === true)
    return true;
  for (let i = startIndex;i < x.issues.length; i++) {
    if (x.issues[i]?.continue === false) {
      return true;
    }
  }
  return false;
}
function prefixIssues(path, issues) {
  return issues.map((iss) => {
    var _a;
    (_a = iss).path ?? (_a.path = []);
    iss.path.unshift(path);
    return iss;
  });
}
function unwrapMessage(message) {
  return typeof message === "string" ? message : message?.message;
}
function finalizeIssue(iss, ctx, config) {
  const message = iss.message ? iss.message : unwrapMessage(iss.inst?._zod.def?.error?.(iss)) ?? unwrapMessage(ctx?.error?.(iss)) ?? unwrapMessage(config.customError?.(iss)) ?? unwrapMessage(config.localeError?.(iss)) ?? "Invalid input";
  const { inst: _inst, continue: _continue, input: _input, ...rest } = iss;
  rest.path ?? (rest.path = []);
  rest.message = message;
  if (ctx?.reportInput) {
    rest.input = _input;
  }
  return rest;
}
function getLengthableOrigin(input) {
  if (Array.isArray(input))
    return "array";
  if (typeof input === "string")
    return "string";
  return "unknown";
}
function issue(...args) {
  const [iss, input, inst] = args;
  if (typeof iss === "string") {
    return {
      message: iss,
      code: "custom",
      input,
      inst
    };
  }
  return { ...iss };
}

// node_modules/zod/v4/core/errors.js
var initializer = (inst, def) => {
  inst.name = "$ZodError";
  Object.defineProperty(inst, "_zod", {
    value: inst._zod,
    enumerable: false
  });
  Object.defineProperty(inst, "issues", {
    value: def,
    enumerable: false
  });
  inst.message = JSON.stringify(def, jsonStringifyReplacer, 2);
  Object.defineProperty(inst, "toString", {
    value: () => inst.message,
    enumerable: false
  });
};
var $ZodError = $constructor("$ZodError", initializer);
var $ZodRealError = $constructor("$ZodError", initializer, { Parent: Error });
function flattenError(error, mapper = (issue) => issue.message) {
  const fieldErrors = {};
  const formErrors = [];
  for (const sub of error.issues) {
    if (sub.path.length > 0) {
      fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
      fieldErrors[sub.path[0]].push(mapper(sub));
    } else {
      formErrors.push(mapper(sub));
    }
  }
  return { formErrors, fieldErrors };
}
function formatError(error, mapper = (issue) => issue.message) {
  const fieldErrors = { _errors: [] };
  const processError = (error, path = []) => {
    for (const issue of error.issues) {
      if (issue.code === "invalid_union" && issue.errors.length) {
        issue.errors.map((issues) => processError({ issues }, [...path, ...issue.path]));
      } else if (issue.code === "invalid_key") {
        processError({ issues: issue.issues }, [...path, ...issue.path]);
      } else if (issue.code === "invalid_element") {
        processError({ issues: issue.issues }, [...path, ...issue.path]);
      } else {
        const fullpath = [...path, ...issue.path];
        if (fullpath.length === 0) {
          fieldErrors._errors.push(mapper(issue));
        } else {
          let curr = fieldErrors;
          let i = 0;
          while (i < fullpath.length) {
            const el = fullpath[i];
            const terminal = i === fullpath.length - 1;
            if (!terminal) {
              curr[el] = curr[el] || { _errors: [] };
            } else {
              curr[el] = curr[el] || { _errors: [] };
              curr[el]._errors.push(mapper(issue));
            }
            curr = curr[el];
            i++;
          }
        }
      }
    }
  };
  processError(error);
  return fieldErrors;
}

// node_modules/zod/v4/core/parse.js
var _parse = (_Err) => (schema, value, _ctx, _params) => {
  const ctx = _ctx ? { ..._ctx, async: false } : { async: false };
  const result = schema._zod.run({ value, issues: [] }, ctx);
  if (result instanceof Promise) {
    throw new $ZodAsyncError;
  }
  if (result.issues.length) {
    const e = new (_params?.Err ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
    captureStackTrace(e, _params?.callee);
    throw e;
  }
  return result.value;
};
var _parseAsync = (_Err) => async (schema, value, _ctx, params) => {
  const ctx = _ctx ? { ..._ctx, async: true } : { async: true };
  let result = schema._zod.run({ value, issues: [] }, ctx);
  if (result instanceof Promise)
    result = await result;
  if (result.issues.length) {
    const e = new (params?.Err ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
    captureStackTrace(e, params?.callee);
    throw e;
  }
  return result.value;
};
var _safeParse = (_Err) => (schema, value, _ctx) => {
  const ctx = _ctx ? { ..._ctx, async: false } : { async: false };
  const result = schema._zod.run({ value, issues: [] }, ctx);
  if (result instanceof Promise) {
    throw new $ZodAsyncError;
  }
  return result.issues.length ? {
    success: false,
    error: new (_Err ?? $ZodError)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
  } : { success: true, data: result.value };
};
var safeParse = /* @__PURE__ */ _safeParse($ZodRealError);
var _safeParseAsync = (_Err) => async (schema, value, _ctx) => {
  const ctx = _ctx ? { ..._ctx, async: true } : { async: true };
  let result = schema._zod.run({ value, issues: [] }, ctx);
  if (result instanceof Promise)
    result = await result;
  return result.issues.length ? {
    success: false,
    error: new _Err(result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
  } : { success: true, data: result.value };
};
var safeParseAsync = /* @__PURE__ */ _safeParseAsync($ZodRealError);
var _encode = (_Err) => (schema, value, _ctx) => {
  const ctx = _ctx ? { ..._ctx, direction: "backward" } : { direction: "backward" };
  return _parse(_Err)(schema, value, ctx);
};
var _decode = (_Err) => (schema, value, _ctx) => {
  return _parse(_Err)(schema, value, _ctx);
};
var _encodeAsync = (_Err) => async (schema, value, _ctx) => {
  const ctx = _ctx ? { ..._ctx, direction: "backward" } : { direction: "backward" };
  return _parseAsync(_Err)(schema, value, ctx);
};
var _decodeAsync = (_Err) => async (schema, value, _ctx) => {
  return _parseAsync(_Err)(schema, value, _ctx);
};
var _safeEncode = (_Err) => (schema, value, _ctx) => {
  const ctx = _ctx ? { ..._ctx, direction: "backward" } : { direction: "backward" };
  return _safeParse(_Err)(schema, value, ctx);
};
var _safeDecode = (_Err) => (schema, value, _ctx) => {
  return _safeParse(_Err)(schema, value, _ctx);
};
var _safeEncodeAsync = (_Err) => async (schema, value, _ctx) => {
  const ctx = _ctx ? { ..._ctx, direction: "backward" } : { direction: "backward" };
  return _safeParseAsync(_Err)(schema, value, ctx);
};
var _safeDecodeAsync = (_Err) => async (schema, value, _ctx) => {
  return _safeParseAsync(_Err)(schema, value, _ctx);
};
// node_modules/zod/v4/core/regexes.js
var cuid = /^[cC][0-9a-z]{6,}$/;
var cuid2 = /^[0-9a-z]+$/;
var ulid = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/;
var xid = /^[0-9a-vA-V]{20}$/;
var ksuid = /^[A-Za-z0-9]{27}$/;
var nanoid = /^[a-zA-Z0-9_-]{21}$/;
var duration = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/;
var guid = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;
var uuid = (version) => {
  if (!version)
    return /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/;
  return new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${version}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`);
};
var email = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;
var _emoji = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
function emoji() {
  return new RegExp(_emoji, "u");
}
var ipv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
var ipv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;
var cidrv4 = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/;
var cidrv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
var base64 = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/;
var base64url = /^[A-Za-z0-9_-]*$/;
var httpProtocol = /^https?$/;
var e164 = /^\+[1-9]\d{6,14}$/;
var dateSource = `(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))`;
var date = /* @__PURE__ */ new RegExp(`^${dateSource}$`);
function timeSource(args) {
  const hhmm = `(?:[01]\\d|2[0-3]):[0-5]\\d`;
  const regex = typeof args.precision === "number" ? args.precision === -1 ? `${hhmm}` : args.precision === 0 ? `${hhmm}:[0-5]\\d` : `${hhmm}:[0-5]\\d\\.\\d{${args.precision}}` : `${hhmm}(?::[0-5]\\d(?:\\.\\d+)?)?`;
  return regex;
}
function time(args) {
  return new RegExp(`^${timeSource(args)}$`);
}
function datetime(args) {
  const time = timeSource({ precision: args.precision });
  const opts = ["Z"];
  if (args.local)
    opts.push("");
  if (args.offset)
    opts.push(`([+-](?:[01]\\d|2[0-3]):[0-5]\\d)`);
  const timeRegex = `${time}(?:${opts.join("|")})`;
  return new RegExp(`^${dateSource}T(?:${timeRegex})$`);
}
var string = (params) => {
  const regex = params ? `[\\s\\S]{${params?.minimum ?? 0},${params?.maximum ?? ""}}` : `[\\s\\S]*`;
  return new RegExp(`^${regex}$`);
};
var integer = /^-?\d+$/;
var number = /^-?\d+(?:\.\d+)?$/;
var boolean = /^(?:true|false)$/i;
var lowercase = /^[^A-Z]*$/;
var uppercase = /^[^a-z]*$/;

// node_modules/zod/v4/core/checks.js
var $ZodCheck = /* @__PURE__ */ $constructor("$ZodCheck", (inst, def) => {
  var _a;
  inst._zod ?? (inst._zod = {});
  inst._zod.def = def;
  (_a = inst._zod).onattach ?? (_a.onattach = []);
});
var numericOriginMap = {
  number: "number",
  bigint: "bigint",
  object: "date"
};
var $ZodCheckLessThan = /* @__PURE__ */ $constructor("$ZodCheckLessThan", (inst, def) => {
  $ZodCheck.init(inst, def);
  const origin = numericOriginMap[typeof def.value];
  inst._zod.onattach.push((inst) => {
    const bag = inst._zod.bag;
    const curr = (def.inclusive ? bag.maximum : bag.exclusiveMaximum) ?? Number.POSITIVE_INFINITY;
    if (def.value < curr) {
      if (def.inclusive)
        bag.maximum = def.value;
      else
        bag.exclusiveMaximum = def.value;
    }
  });
  inst._zod.check = (payload) => {
    if (def.inclusive ? payload.value <= def.value : payload.value < def.value) {
      return;
    }
    payload.issues.push({
      origin,
      code: "too_big",
      maximum: typeof def.value === "object" ? def.value.getTime() : def.value,
      input: payload.value,
      inclusive: def.inclusive,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckGreaterThan = /* @__PURE__ */ $constructor("$ZodCheckGreaterThan", (inst, def) => {
  $ZodCheck.init(inst, def);
  const origin = numericOriginMap[typeof def.value];
  inst._zod.onattach.push((inst) => {
    const bag = inst._zod.bag;
    const curr = (def.inclusive ? bag.minimum : bag.exclusiveMinimum) ?? Number.NEGATIVE_INFINITY;
    if (def.value > curr) {
      if (def.inclusive)
        bag.minimum = def.value;
      else
        bag.exclusiveMinimum = def.value;
    }
  });
  inst._zod.check = (payload) => {
    if (def.inclusive ? payload.value >= def.value : payload.value > def.value) {
      return;
    }
    payload.issues.push({
      origin,
      code: "too_small",
      minimum: typeof def.value === "object" ? def.value.getTime() : def.value,
      input: payload.value,
      inclusive: def.inclusive,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckMultipleOf = /* @__PURE__ */ $constructor("$ZodCheckMultipleOf", (inst, def) => {
  $ZodCheck.init(inst, def);
  inst._zod.onattach.push((inst) => {
    var _a;
    (_a = inst._zod.bag).multipleOf ?? (_a.multipleOf = def.value);
  });
  inst._zod.check = (payload) => {
    if (typeof payload.value !== typeof def.value)
      throw new Error("Cannot mix number and bigint in multiple_of check.");
    const isMultiple = typeof payload.value === "bigint" ? payload.value % def.value === BigInt(0) : floatSafeRemainder(payload.value, def.value) === 0;
    if (isMultiple)
      return;
    payload.issues.push({
      origin: typeof payload.value,
      code: "not_multiple_of",
      divisor: def.value,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckNumberFormat = /* @__PURE__ */ $constructor("$ZodCheckNumberFormat", (inst, def) => {
  $ZodCheck.init(inst, def);
  def.format = def.format || "float64";
  const isInt = def.format?.includes("int");
  const origin = isInt ? "int" : "number";
  const [minimum, maximum] = NUMBER_FORMAT_RANGES[def.format];
  inst._zod.onattach.push((inst) => {
    const bag = inst._zod.bag;
    bag.format = def.format;
    bag.minimum = minimum;
    bag.maximum = maximum;
    if (isInt)
      bag.pattern = integer;
  });
  inst._zod.check = (payload) => {
    const input = payload.value;
    if (isInt) {
      if (!Number.isInteger(input)) {
        payload.issues.push({
          expected: origin,
          format: def.format,
          code: "invalid_type",
          continue: false,
          input,
          inst
        });
        return;
      }
      if (!Number.isSafeInteger(input)) {
        if (input > 0) {
          payload.issues.push({
            input,
            code: "too_big",
            maximum: Number.MAX_SAFE_INTEGER,
            note: "Integers must be within the safe integer range.",
            inst,
            origin,
            inclusive: true,
            continue: !def.abort
          });
        } else {
          payload.issues.push({
            input,
            code: "too_small",
            minimum: Number.MIN_SAFE_INTEGER,
            note: "Integers must be within the safe integer range.",
            inst,
            origin,
            inclusive: true,
            continue: !def.abort
          });
        }
        return;
      }
    }
    if (input < minimum) {
      payload.issues.push({
        origin: "number",
        input,
        code: "too_small",
        minimum,
        inclusive: true,
        inst,
        continue: !def.abort
      });
    }
    if (input > maximum) {
      payload.issues.push({
        origin: "number",
        input,
        code: "too_big",
        maximum,
        inclusive: true,
        inst,
        continue: !def.abort
      });
    }
  };
});
var $ZodCheckMaxLength = /* @__PURE__ */ $constructor("$ZodCheckMaxLength", (inst, def) => {
  var _a;
  $ZodCheck.init(inst, def);
  (_a = inst._zod.def).when ?? (_a.when = (payload) => {
    const val = payload.value;
    return !nullish(val) && val.length !== undefined;
  });
  inst._zod.onattach.push((inst) => {
    const curr = inst._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
    if (def.maximum < curr)
      inst._zod.bag.maximum = def.maximum;
  });
  inst._zod.check = (payload) => {
    const input = payload.value;
    const length = input.length;
    if (length <= def.maximum)
      return;
    const origin = getLengthableOrigin(input);
    payload.issues.push({
      origin,
      code: "too_big",
      maximum: def.maximum,
      inclusive: true,
      input,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckMinLength = /* @__PURE__ */ $constructor("$ZodCheckMinLength", (inst, def) => {
  var _a;
  $ZodCheck.init(inst, def);
  (_a = inst._zod.def).when ?? (_a.when = (payload) => {
    const val = payload.value;
    return !nullish(val) && val.length !== undefined;
  });
  inst._zod.onattach.push((inst) => {
    const curr = inst._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
    if (def.minimum > curr)
      inst._zod.bag.minimum = def.minimum;
  });
  inst._zod.check = (payload) => {
    const input = payload.value;
    const length = input.length;
    if (length >= def.minimum)
      return;
    const origin = getLengthableOrigin(input);
    payload.issues.push({
      origin,
      code: "too_small",
      minimum: def.minimum,
      inclusive: true,
      input,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckLengthEquals = /* @__PURE__ */ $constructor("$ZodCheckLengthEquals", (inst, def) => {
  var _a;
  $ZodCheck.init(inst, def);
  (_a = inst._zod.def).when ?? (_a.when = (payload) => {
    const val = payload.value;
    return !nullish(val) && val.length !== undefined;
  });
  inst._zod.onattach.push((inst) => {
    const bag = inst._zod.bag;
    bag.minimum = def.length;
    bag.maximum = def.length;
    bag.length = def.length;
  });
  inst._zod.check = (payload) => {
    const input = payload.value;
    const length = input.length;
    if (length === def.length)
      return;
    const origin = getLengthableOrigin(input);
    const tooBig = length > def.length;
    payload.issues.push({
      origin,
      ...tooBig ? { code: "too_big", maximum: def.length } : { code: "too_small", minimum: def.length },
      inclusive: true,
      exact: true,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckStringFormat = /* @__PURE__ */ $constructor("$ZodCheckStringFormat", (inst, def) => {
  var _a, _b;
  $ZodCheck.init(inst, def);
  inst._zod.onattach.push((inst) => {
    const bag = inst._zod.bag;
    bag.format = def.format;
    if (def.pattern) {
      bag.patterns ?? (bag.patterns = new Set);
      bag.patterns.add(def.pattern);
    }
  });
  if (def.pattern)
    (_a = inst._zod).check ?? (_a.check = (payload) => {
      def.pattern.lastIndex = 0;
      if (def.pattern.test(payload.value))
        return;
      payload.issues.push({
        origin: "string",
        code: "invalid_format",
        format: def.format,
        input: payload.value,
        ...def.pattern ? { pattern: def.pattern.toString() } : {},
        inst,
        continue: !def.abort
      });
    });
  else
    (_b = inst._zod).check ?? (_b.check = () => {});
});
var $ZodCheckRegex = /* @__PURE__ */ $constructor("$ZodCheckRegex", (inst, def) => {
  $ZodCheckStringFormat.init(inst, def);
  inst._zod.check = (payload) => {
    def.pattern.lastIndex = 0;
    if (def.pattern.test(payload.value))
      return;
    payload.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "regex",
      input: payload.value,
      pattern: def.pattern.toString(),
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckLowerCase = /* @__PURE__ */ $constructor("$ZodCheckLowerCase", (inst, def) => {
  def.pattern ?? (def.pattern = lowercase);
  $ZodCheckStringFormat.init(inst, def);
});
var $ZodCheckUpperCase = /* @__PURE__ */ $constructor("$ZodCheckUpperCase", (inst, def) => {
  def.pattern ?? (def.pattern = uppercase);
  $ZodCheckStringFormat.init(inst, def);
});
var $ZodCheckIncludes = /* @__PURE__ */ $constructor("$ZodCheckIncludes", (inst, def) => {
  $ZodCheck.init(inst, def);
  const escapedRegex = escapeRegex(def.includes);
  const pattern = new RegExp(typeof def.position === "number" ? `^.{${def.position}}${escapedRegex}` : escapedRegex);
  def.pattern = pattern;
  inst._zod.onattach.push((inst) => {
    const bag = inst._zod.bag;
    bag.patterns ?? (bag.patterns = new Set);
    bag.patterns.add(pattern);
  });
  inst._zod.check = (payload) => {
    if (payload.value.includes(def.includes, def.position))
      return;
    payload.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "includes",
      includes: def.includes,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckStartsWith = /* @__PURE__ */ $constructor("$ZodCheckStartsWith", (inst, def) => {
  $ZodCheck.init(inst, def);
  const pattern = new RegExp(`^${escapeRegex(def.prefix)}.*`);
  def.pattern ?? (def.pattern = pattern);
  inst._zod.onattach.push((inst) => {
    const bag = inst._zod.bag;
    bag.patterns ?? (bag.patterns = new Set);
    bag.patterns.add(pattern);
  });
  inst._zod.check = (payload) => {
    if (payload.value.startsWith(def.prefix))
      return;
    payload.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "starts_with",
      prefix: def.prefix,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckEndsWith = /* @__PURE__ */ $constructor("$ZodCheckEndsWith", (inst, def) => {
  $ZodCheck.init(inst, def);
  const pattern = new RegExp(`.*${escapeRegex(def.suffix)}$`);
  def.pattern ?? (def.pattern = pattern);
  inst._zod.onattach.push((inst) => {
    const bag = inst._zod.bag;
    bag.patterns ?? (bag.patterns = new Set);
    bag.patterns.add(pattern);
  });
  inst._zod.check = (payload) => {
    if (payload.value.endsWith(def.suffix))
      return;
    payload.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "ends_with",
      suffix: def.suffix,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckOverwrite = /* @__PURE__ */ $constructor("$ZodCheckOverwrite", (inst, def) => {
  $ZodCheck.init(inst, def);
  inst._zod.check = (payload) => {
    payload.value = def.tx(payload.value);
  };
});

// node_modules/zod/v4/core/doc.js
class Doc {
  constructor(args = []) {
    this.content = [];
    this.indent = 0;
    if (this)
      this.args = args;
  }
  indented(fn) {
    this.indent += 1;
    fn(this);
    this.indent -= 1;
  }
  write(arg) {
    if (typeof arg === "function") {
      arg(this, { execution: "sync" });
      arg(this, { execution: "async" });
      return;
    }
    const content = arg;
    const lines = content.split(`
`).filter((x) => x);
    const minIndent = Math.min(...lines.map((x) => x.length - x.trimStart().length));
    const dedented = lines.map((x) => x.slice(minIndent)).map((x) => " ".repeat(this.indent * 2) + x);
    for (const line of dedented) {
      this.content.push(line);
    }
  }
  compile() {
    const F = Function;
    const args = this?.args;
    const content = this?.content ?? [``];
    const lines = [...content.map((x) => `  ${x}`)];
    return new F(...args, lines.join(`
`));
  }
}

// node_modules/zod/v4/core/versions.js
var version = {
  major: 4,
  minor: 4,
  patch: 3
};

// node_modules/zod/v4/core/schemas.js
var $ZodType = /* @__PURE__ */ $constructor("$ZodType", (inst, def) => {
  var _a;
  inst ?? (inst = {});
  inst._zod.def = def;
  inst._zod.bag = inst._zod.bag || {};
  inst._zod.version = version;
  const checks = [...inst._zod.def.checks ?? []];
  if (inst._zod.traits.has("$ZodCheck")) {
    checks.unshift(inst);
  }
  for (const ch of checks) {
    for (const fn of ch._zod.onattach) {
      fn(inst);
    }
  }
  if (checks.length === 0) {
    (_a = inst._zod).deferred ?? (_a.deferred = []);
    inst._zod.deferred?.push(() => {
      inst._zod.run = inst._zod.parse;
    });
  } else {
    const runChecks = (payload, checks, ctx) => {
      let isAborted = aborted(payload);
      let asyncResult;
      for (const ch of checks) {
        if (ch._zod.def.when) {
          if (explicitlyAborted(payload))
            continue;
          const shouldRun = ch._zod.def.when(payload);
          if (!shouldRun)
            continue;
        } else if (isAborted) {
          continue;
        }
        const currLen = payload.issues.length;
        const _ = ch._zod.check(payload);
        if (_ instanceof Promise && ctx?.async === false) {
          throw new $ZodAsyncError;
        }
        if (asyncResult || _ instanceof Promise) {
          asyncResult = (asyncResult ?? Promise.resolve()).then(async () => {
            await _;
            const nextLen = payload.issues.length;
            if (nextLen === currLen)
              return;
            if (!isAborted)
              isAborted = aborted(payload, currLen);
          });
        } else {
          const nextLen = payload.issues.length;
          if (nextLen === currLen)
            continue;
          if (!isAborted)
            isAborted = aborted(payload, currLen);
        }
      }
      if (asyncResult) {
        return asyncResult.then(() => {
          return payload;
        });
      }
      return payload;
    };
    const handleCanaryResult = (canary, payload, ctx) => {
      if (aborted(canary)) {
        canary.aborted = true;
        return canary;
      }
      const checkResult = runChecks(payload, checks, ctx);
      if (checkResult instanceof Promise) {
        if (ctx.async === false)
          throw new $ZodAsyncError;
        return checkResult.then((checkResult) => inst._zod.parse(checkResult, ctx));
      }
      return inst._zod.parse(checkResult, ctx);
    };
    inst._zod.run = (payload, ctx) => {
      if (ctx.skipChecks) {
        return inst._zod.parse(payload, ctx);
      }
      if (ctx.direction === "backward") {
        const canary = inst._zod.parse({ value: payload.value, issues: [] }, { ...ctx, skipChecks: true });
        if (canary instanceof Promise) {
          return canary.then((canary) => {
            return handleCanaryResult(canary, payload, ctx);
          });
        }
        return handleCanaryResult(canary, payload, ctx);
      }
      const result = inst._zod.parse(payload, ctx);
      if (result instanceof Promise) {
        if (ctx.async === false)
          throw new $ZodAsyncError;
        return result.then((result) => runChecks(result, checks, ctx));
      }
      return runChecks(result, checks, ctx);
    };
  }
  defineLazy(inst, "~standard", () => ({
    validate: (value) => {
      try {
        const r = safeParse(inst, value);
        return r.success ? { value: r.data } : { issues: r.error?.issues };
      } catch (_) {
        return safeParseAsync(inst, value).then((r) => r.success ? { value: r.data } : { issues: r.error?.issues });
      }
    },
    vendor: "zod",
    version: 1
  }));
});
var $ZodString = /* @__PURE__ */ $constructor("$ZodString", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.pattern = [...inst?._zod.bag?.patterns ?? []].pop() ?? string(inst._zod.bag);
  inst._zod.parse = (payload, _) => {
    if (def.coerce)
      try {
        payload.value = String(payload.value);
      } catch (_) {}
    if (typeof payload.value === "string")
      return payload;
    payload.issues.push({
      expected: "string",
      code: "invalid_type",
      input: payload.value,
      inst
    });
    return payload;
  };
});
var $ZodStringFormat = /* @__PURE__ */ $constructor("$ZodStringFormat", (inst, def) => {
  $ZodCheckStringFormat.init(inst, def);
  $ZodString.init(inst, def);
});
var $ZodGUID = /* @__PURE__ */ $constructor("$ZodGUID", (inst, def) => {
  def.pattern ?? (def.pattern = guid);
  $ZodStringFormat.init(inst, def);
});
var $ZodUUID = /* @__PURE__ */ $constructor("$ZodUUID", (inst, def) => {
  if (def.version) {
    const versionMap = {
      v1: 1,
      v2: 2,
      v3: 3,
      v4: 4,
      v5: 5,
      v6: 6,
      v7: 7,
      v8: 8
    };
    const v = versionMap[def.version];
    if (v === undefined)
      throw new Error(`Invalid UUID version: "${def.version}"`);
    def.pattern ?? (def.pattern = uuid(v));
  } else
    def.pattern ?? (def.pattern = uuid());
  $ZodStringFormat.init(inst, def);
});
var $ZodEmail = /* @__PURE__ */ $constructor("$ZodEmail", (inst, def) => {
  def.pattern ?? (def.pattern = email);
  $ZodStringFormat.init(inst, def);
});
var $ZodURL = /* @__PURE__ */ $constructor("$ZodURL", (inst, def) => {
  $ZodStringFormat.init(inst, def);
  inst._zod.check = (payload) => {
    try {
      const trimmed = payload.value.trim();
      if (!def.normalize && def.protocol?.source === httpProtocol.source) {
        if (!/^https?:\/\//i.test(trimmed)) {
          payload.issues.push({
            code: "invalid_format",
            format: "url",
            note: "Invalid URL format",
            input: payload.value,
            inst,
            continue: !def.abort
          });
          return;
        }
      }
      const url = new URL(trimmed);
      if (def.hostname) {
        def.hostname.lastIndex = 0;
        if (!def.hostname.test(url.hostname)) {
          payload.issues.push({
            code: "invalid_format",
            format: "url",
            note: "Invalid hostname",
            pattern: def.hostname.source,
            input: payload.value,
            inst,
            continue: !def.abort
          });
        }
      }
      if (def.protocol) {
        def.protocol.lastIndex = 0;
        if (!def.protocol.test(url.protocol.endsWith(":") ? url.protocol.slice(0, -1) : url.protocol)) {
          payload.issues.push({
            code: "invalid_format",
            format: "url",
            note: "Invalid protocol",
            pattern: def.protocol.source,
            input: payload.value,
            inst,
            continue: !def.abort
          });
        }
      }
      if (def.normalize) {
        payload.value = url.href;
      } else {
        payload.value = trimmed;
      }
      return;
    } catch (_) {
      payload.issues.push({
        code: "invalid_format",
        format: "url",
        input: payload.value,
        inst,
        continue: !def.abort
      });
    }
  };
});
var $ZodEmoji = /* @__PURE__ */ $constructor("$ZodEmoji", (inst, def) => {
  def.pattern ?? (def.pattern = emoji());
  $ZodStringFormat.init(inst, def);
});
var $ZodNanoID = /* @__PURE__ */ $constructor("$ZodNanoID", (inst, def) => {
  def.pattern ?? (def.pattern = nanoid);
  $ZodStringFormat.init(inst, def);
});
var $ZodCUID = /* @__PURE__ */ $constructor("$ZodCUID", (inst, def) => {
  def.pattern ?? (def.pattern = cuid);
  $ZodStringFormat.init(inst, def);
});
var $ZodCUID2 = /* @__PURE__ */ $constructor("$ZodCUID2", (inst, def) => {
  def.pattern ?? (def.pattern = cuid2);
  $ZodStringFormat.init(inst, def);
});
var $ZodULID = /* @__PURE__ */ $constructor("$ZodULID", (inst, def) => {
  def.pattern ?? (def.pattern = ulid);
  $ZodStringFormat.init(inst, def);
});
var $ZodXID = /* @__PURE__ */ $constructor("$ZodXID", (inst, def) => {
  def.pattern ?? (def.pattern = xid);
  $ZodStringFormat.init(inst, def);
});
var $ZodKSUID = /* @__PURE__ */ $constructor("$ZodKSUID", (inst, def) => {
  def.pattern ?? (def.pattern = ksuid);
  $ZodStringFormat.init(inst, def);
});
var $ZodISODateTime = /* @__PURE__ */ $constructor("$ZodISODateTime", (inst, def) => {
  def.pattern ?? (def.pattern = datetime(def));
  $ZodStringFormat.init(inst, def);
});
var $ZodISODate = /* @__PURE__ */ $constructor("$ZodISODate", (inst, def) => {
  def.pattern ?? (def.pattern = date);
  $ZodStringFormat.init(inst, def);
});
var $ZodISOTime = /* @__PURE__ */ $constructor("$ZodISOTime", (inst, def) => {
  def.pattern ?? (def.pattern = time(def));
  $ZodStringFormat.init(inst, def);
});
var $ZodISODuration = /* @__PURE__ */ $constructor("$ZodISODuration", (inst, def) => {
  def.pattern ?? (def.pattern = duration);
  $ZodStringFormat.init(inst, def);
});
var $ZodIPv4 = /* @__PURE__ */ $constructor("$ZodIPv4", (inst, def) => {
  def.pattern ?? (def.pattern = ipv4);
  $ZodStringFormat.init(inst, def);
  inst._zod.bag.format = `ipv4`;
});
var $ZodIPv6 = /* @__PURE__ */ $constructor("$ZodIPv6", (inst, def) => {
  def.pattern ?? (def.pattern = ipv6);
  $ZodStringFormat.init(inst, def);
  inst._zod.bag.format = `ipv6`;
  inst._zod.check = (payload) => {
    try {
      new URL(`http://[${payload.value}]`);
    } catch {
      payload.issues.push({
        code: "invalid_format",
        format: "ipv6",
        input: payload.value,
        inst,
        continue: !def.abort
      });
    }
  };
});
var $ZodCIDRv4 = /* @__PURE__ */ $constructor("$ZodCIDRv4", (inst, def) => {
  def.pattern ?? (def.pattern = cidrv4);
  $ZodStringFormat.init(inst, def);
});
var $ZodCIDRv6 = /* @__PURE__ */ $constructor("$ZodCIDRv6", (inst, def) => {
  def.pattern ?? (def.pattern = cidrv6);
  $ZodStringFormat.init(inst, def);
  inst._zod.check = (payload) => {
    const parts = payload.value.split("/");
    try {
      if (parts.length !== 2)
        throw new Error;
      const [address, prefix] = parts;
      if (!prefix)
        throw new Error;
      const prefixNum = Number(prefix);
      if (`${prefixNum}` !== prefix)
        throw new Error;
      if (prefixNum < 0 || prefixNum > 128)
        throw new Error;
      new URL(`http://[${address}]`);
    } catch {
      payload.issues.push({
        code: "invalid_format",
        format: "cidrv6",
        input: payload.value,
        inst,
        continue: !def.abort
      });
    }
  };
});
function isValidBase64(data) {
  if (data === "")
    return true;
  if (/\s/.test(data))
    return false;
  if (data.length % 4 !== 0)
    return false;
  try {
    atob(data);
    return true;
  } catch {
    return false;
  }
}
var $ZodBase64 = /* @__PURE__ */ $constructor("$ZodBase64", (inst, def) => {
  def.pattern ?? (def.pattern = base64);
  $ZodStringFormat.init(inst, def);
  inst._zod.bag.contentEncoding = "base64";
  inst._zod.check = (payload) => {
    if (isValidBase64(payload.value))
      return;
    payload.issues.push({
      code: "invalid_format",
      format: "base64",
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
function isValidBase64URL(data) {
  if (!base64url.test(data))
    return false;
  const base64 = data.replace(/[-_]/g, (c) => c === "-" ? "+" : "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  return isValidBase64(padded);
}
var $ZodBase64URL = /* @__PURE__ */ $constructor("$ZodBase64URL", (inst, def) => {
  def.pattern ?? (def.pattern = base64url);
  $ZodStringFormat.init(inst, def);
  inst._zod.bag.contentEncoding = "base64url";
  inst._zod.check = (payload) => {
    if (isValidBase64URL(payload.value))
      return;
    payload.issues.push({
      code: "invalid_format",
      format: "base64url",
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodE164 = /* @__PURE__ */ $constructor("$ZodE164", (inst, def) => {
  def.pattern ?? (def.pattern = e164);
  $ZodStringFormat.init(inst, def);
});
function isValidJWT(token, algorithm = null) {
  try {
    const tokensParts = token.split(".");
    if (tokensParts.length !== 3)
      return false;
    const [header] = tokensParts;
    if (!header)
      return false;
    const parsedHeader = JSON.parse(atob(header));
    if ("typ" in parsedHeader && parsedHeader?.typ !== "JWT")
      return false;
    if (!parsedHeader.alg)
      return false;
    if (algorithm && (!("alg" in parsedHeader) || parsedHeader.alg !== algorithm))
      return false;
    return true;
  } catch {
    return false;
  }
}
var $ZodJWT = /* @__PURE__ */ $constructor("$ZodJWT", (inst, def) => {
  $ZodStringFormat.init(inst, def);
  inst._zod.check = (payload) => {
    if (isValidJWT(payload.value, def.alg))
      return;
    payload.issues.push({
      code: "invalid_format",
      format: "jwt",
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodNumber = /* @__PURE__ */ $constructor("$ZodNumber", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.pattern = inst._zod.bag.pattern ?? number;
  inst._zod.parse = (payload, _ctx) => {
    if (def.coerce)
      try {
        payload.value = Number(payload.value);
      } catch (_) {}
    const input = payload.value;
    if (typeof input === "number" && !Number.isNaN(input) && Number.isFinite(input)) {
      return payload;
    }
    const received = typeof input === "number" ? Number.isNaN(input) ? "NaN" : !Number.isFinite(input) ? "Infinity" : undefined : undefined;
    payload.issues.push({
      expected: "number",
      code: "invalid_type",
      input,
      inst,
      ...received ? { received } : {}
    });
    return payload;
  };
});
var $ZodNumberFormat = /* @__PURE__ */ $constructor("$ZodNumberFormat", (inst, def) => {
  $ZodCheckNumberFormat.init(inst, def);
  $ZodNumber.init(inst, def);
});
var $ZodBoolean = /* @__PURE__ */ $constructor("$ZodBoolean", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.pattern = boolean;
  inst._zod.parse = (payload, _ctx) => {
    if (def.coerce)
      try {
        payload.value = Boolean(payload.value);
      } catch (_) {}
    const input = payload.value;
    if (typeof input === "boolean")
      return payload;
    payload.issues.push({
      expected: "boolean",
      code: "invalid_type",
      input,
      inst
    });
    return payload;
  };
});
var $ZodUnknown = /* @__PURE__ */ $constructor("$ZodUnknown", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload) => payload;
});
var $ZodNever = /* @__PURE__ */ $constructor("$ZodNever", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, _ctx) => {
    payload.issues.push({
      expected: "never",
      code: "invalid_type",
      input: payload.value,
      inst
    });
    return payload;
  };
});
function handleArrayResult(result, final, index) {
  if (result.issues.length) {
    final.issues.push(...prefixIssues(index, result.issues));
  }
  final.value[index] = result.value;
}
var $ZodArray = /* @__PURE__ */ $constructor("$ZodArray", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, ctx) => {
    const input = payload.value;
    if (!Array.isArray(input)) {
      payload.issues.push({
        expected: "array",
        code: "invalid_type",
        input,
        inst
      });
      return payload;
    }
    payload.value = Array(input.length);
    const proms = [];
    for (let i = 0;i < input.length; i++) {
      const item = input[i];
      const result = def.element._zod.run({
        value: item,
        issues: []
      }, ctx);
      if (result instanceof Promise) {
        proms.push(result.then((result) => handleArrayResult(result, payload, i)));
      } else {
        handleArrayResult(result, payload, i);
      }
    }
    if (proms.length) {
      return Promise.all(proms).then(() => payload);
    }
    return payload;
  };
});
function handlePropertyResult(result, final, key, input, isOptionalIn, isOptionalOut) {
  const isPresent = key in input;
  if (result.issues.length) {
    if (isOptionalIn && isOptionalOut && !isPresent) {
      return;
    }
    final.issues.push(...prefixIssues(key, result.issues));
  }
  if (!isPresent && !isOptionalIn) {
    if (!result.issues.length) {
      final.issues.push({
        code: "invalid_type",
        expected: "nonoptional",
        input: undefined,
        path: [key]
      });
    }
    return;
  }
  if (result.value === undefined) {
    if (isPresent) {
      final.value[key] = undefined;
    }
  } else {
    final.value[key] = result.value;
  }
}
function normalizeDef(def) {
  const keys = Object.keys(def.shape);
  for (const k of keys) {
    if (!def.shape?.[k]?._zod?.traits?.has("$ZodType")) {
      throw new Error(`Invalid element at key "${k}": expected a Zod schema`);
    }
  }
  const okeys = optionalKeys(def.shape);
  return {
    ...def,
    keys,
    keySet: new Set(keys),
    numKeys: keys.length,
    optionalKeys: new Set(okeys)
  };
}
function handleCatchall(proms, input, payload, ctx, def, inst) {
  const unrecognized = [];
  const keySet = def.keySet;
  const _catchall = def.catchall._zod;
  const t = _catchall.def.type;
  const isOptionalIn = _catchall.optin === "optional";
  const isOptionalOut = _catchall.optout === "optional";
  for (const key in input) {
    if (key === "__proto__")
      continue;
    if (keySet.has(key))
      continue;
    if (t === "never") {
      unrecognized.push(key);
      continue;
    }
    const r = _catchall.run({ value: input[key], issues: [] }, ctx);
    if (r instanceof Promise) {
      proms.push(r.then((r) => handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut)));
    } else {
      handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut);
    }
  }
  if (unrecognized.length) {
    payload.issues.push({
      code: "unrecognized_keys",
      keys: unrecognized,
      input,
      inst
    });
  }
  if (!proms.length)
    return payload;
  return Promise.all(proms).then(() => {
    return payload;
  });
}
var $ZodObject = /* @__PURE__ */ $constructor("$ZodObject", (inst, def) => {
  $ZodType.init(inst, def);
  const desc = Object.getOwnPropertyDescriptor(def, "shape");
  if (!desc?.get) {
    const sh = def.shape;
    Object.defineProperty(def, "shape", {
      get: () => {
        const newSh = { ...sh };
        Object.defineProperty(def, "shape", {
          value: newSh
        });
        return newSh;
      }
    });
  }
  const _normalized = cached(() => normalizeDef(def));
  defineLazy(inst._zod, "propValues", () => {
    const shape = def.shape;
    const propValues = {};
    for (const key in shape) {
      const field = shape[key]._zod;
      if (field.values) {
        propValues[key] ?? (propValues[key] = new Set);
        for (const v of field.values)
          propValues[key].add(v);
      }
    }
    return propValues;
  });
  const isObject2 = isObject;
  const catchall = def.catchall;
  let value;
  inst._zod.parse = (payload, ctx) => {
    value ?? (value = _normalized.value);
    const input = payload.value;
    if (!isObject2(input)) {
      payload.issues.push({
        expected: "object",
        code: "invalid_type",
        input,
        inst
      });
      return payload;
    }
    payload.value = {};
    const proms = [];
    const shape = value.shape;
    for (const key of value.keys) {
      const el = shape[key];
      const isOptionalIn = el._zod.optin === "optional";
      const isOptionalOut = el._zod.optout === "optional";
      const r = el._zod.run({ value: input[key], issues: [] }, ctx);
      if (r instanceof Promise) {
        proms.push(r.then((r) => handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut)));
      } else {
        handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut);
      }
    }
    if (!catchall) {
      return proms.length ? Promise.all(proms).then(() => payload) : payload;
    }
    return handleCatchall(proms, input, payload, ctx, _normalized.value, inst);
  };
});
var $ZodObjectJIT = /* @__PURE__ */ $constructor("$ZodObjectJIT", (inst, def) => {
  $ZodObject.init(inst, def);
  const superParse = inst._zod.parse;
  const _normalized = cached(() => normalizeDef(def));
  const generateFastpass = (shape) => {
    const doc = new Doc(["shape", "payload", "ctx"]);
    const normalized = _normalized.value;
    const parseStr = (key) => {
      const k = esc(key);
      return `shape[${k}]._zod.run({ value: input[${k}], issues: [] }, ctx)`;
    };
    doc.write(`const input = payload.value;`);
    const ids = Object.create(null);
    let counter = 0;
    for (const key of normalized.keys) {
      ids[key] = `key_${counter++}`;
    }
    doc.write(`const newResult = {};`);
    for (const key of normalized.keys) {
      const id = ids[key];
      const k = esc(key);
      const schema = shape[key];
      const isOptionalIn = schema?._zod?.optin === "optional";
      const isOptionalOut = schema?._zod?.optout === "optional";
      doc.write(`const ${id} = ${parseStr(key)};`);
      if (isOptionalIn && isOptionalOut) {
        doc.write(`
        if (${id}.issues.length) {
          if (${k} in input) {
            payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
              ...iss,
              path: iss.path ? [${k}, ...iss.path] : [${k}]
            })));
          }
        }
        
        if (${id}.value === undefined) {
          if (${k} in input) {
            newResult[${k}] = undefined;
          }
        } else {
          newResult[${k}] = ${id}.value;
        }
        
      `);
      } else if (!isOptionalIn) {
        doc.write(`
        const ${id}_present = ${k} in input;
        if (${id}.issues.length) {
          payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${k}, ...iss.path] : [${k}]
          })));
        }
        if (!${id}_present && !${id}.issues.length) {
          payload.issues.push({
            code: "invalid_type",
            expected: "nonoptional",
            input: undefined,
            path: [${k}]
          });
        }

        if (${id}_present) {
          if (${id}.value === undefined) {
            newResult[${k}] = undefined;
          } else {
            newResult[${k}] = ${id}.value;
          }
        }

      `);
      } else {
        doc.write(`
        if (${id}.issues.length) {
          payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${k}, ...iss.path] : [${k}]
          })));
        }
        
        if (${id}.value === undefined) {
          if (${k} in input) {
            newResult[${k}] = undefined;
          }
        } else {
          newResult[${k}] = ${id}.value;
        }
        
      `);
      }
    }
    doc.write(`payload.value = newResult;`);
    doc.write(`return payload;`);
    const fn = doc.compile();
    return (payload, ctx) => fn(shape, payload, ctx);
  };
  let fastpass;
  const isObject2 = isObject;
  const jit = !globalConfig.jitless;
  const allowsEval2 = allowsEval;
  const fastEnabled = jit && allowsEval2.value;
  const catchall = def.catchall;
  let value;
  inst._zod.parse = (payload, ctx) => {
    value ?? (value = _normalized.value);
    const input = payload.value;
    if (!isObject2(input)) {
      payload.issues.push({
        expected: "object",
        code: "invalid_type",
        input,
        inst
      });
      return payload;
    }
    if (jit && fastEnabled && ctx?.async === false && ctx.jitless !== true) {
      if (!fastpass)
        fastpass = generateFastpass(def.shape);
      payload = fastpass(payload, ctx);
      if (!catchall)
        return payload;
      return handleCatchall([], input, payload, ctx, value, inst);
    }
    return superParse(payload, ctx);
  };
});
function handleUnionResults(results, final, inst, ctx) {
  for (const result of results) {
    if (result.issues.length === 0) {
      final.value = result.value;
      return final;
    }
  }
  const nonaborted = results.filter((r) => !aborted(r));
  if (nonaborted.length === 1) {
    final.value = nonaborted[0].value;
    return nonaborted[0];
  }
  final.issues.push({
    code: "invalid_union",
    input: final.value,
    inst,
    errors: results.map((result) => result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
  });
  return final;
}
var $ZodUnion = /* @__PURE__ */ $constructor("$ZodUnion", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazy(inst._zod, "optin", () => def.options.some((o) => o._zod.optin === "optional") ? "optional" : undefined);
  defineLazy(inst._zod, "optout", () => def.options.some((o) => o._zod.optout === "optional") ? "optional" : undefined);
  defineLazy(inst._zod, "values", () => {
    if (def.options.every((o) => o._zod.values)) {
      return new Set(def.options.flatMap((option) => Array.from(option._zod.values)));
    }
    return;
  });
  defineLazy(inst._zod, "pattern", () => {
    if (def.options.every((o) => o._zod.pattern)) {
      const patterns = def.options.map((o) => o._zod.pattern);
      return new RegExp(`^(${patterns.map((p) => cleanRegex(p.source)).join("|")})$`);
    }
    return;
  });
  const first = def.options.length === 1 ? def.options[0]._zod.run : null;
  inst._zod.parse = (payload, ctx) => {
    if (first) {
      return first(payload, ctx);
    }
    let async = false;
    const results = [];
    for (const option of def.options) {
      const result = option._zod.run({
        value: payload.value,
        issues: []
      }, ctx);
      if (result instanceof Promise) {
        results.push(result);
        async = true;
      } else {
        if (result.issues.length === 0)
          return result;
        results.push(result);
      }
    }
    if (!async)
      return handleUnionResults(results, payload, inst, ctx);
    return Promise.all(results).then((results) => {
      return handleUnionResults(results, payload, inst, ctx);
    });
  };
});
var $ZodIntersection = /* @__PURE__ */ $constructor("$ZodIntersection", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, ctx) => {
    const input = payload.value;
    const left = def.left._zod.run({ value: input, issues: [] }, ctx);
    const right = def.right._zod.run({ value: input, issues: [] }, ctx);
    const async = left instanceof Promise || right instanceof Promise;
    if (async) {
      return Promise.all([left, right]).then(([left, right]) => {
        return handleIntersectionResults(payload, left, right);
      });
    }
    return handleIntersectionResults(payload, left, right);
  };
});
function mergeValues(a, b) {
  if (a === b) {
    return { valid: true, data: a };
  }
  if (a instanceof Date && b instanceof Date && +a === +b) {
    return { valid: true, data: a };
  }
  if (isPlainObject(a) && isPlainObject(b)) {
    const bKeys = Object.keys(b);
    const sharedKeys = Object.keys(a).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a, ...b };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return {
          valid: false,
          mergeErrorPath: [key, ...sharedValue.mergeErrorPath]
        };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return { valid: false, mergeErrorPath: [] };
    }
    const newArray = [];
    for (let index = 0;index < a.length; index++) {
      const itemA = a[index];
      const itemB = b[index];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return {
          valid: false,
          mergeErrorPath: [index, ...sharedValue.mergeErrorPath]
        };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  }
  return { valid: false, mergeErrorPath: [] };
}
function handleIntersectionResults(result, left, right) {
  const unrecKeys = new Map;
  let unrecIssue;
  for (const iss of left.issues) {
    if (iss.code === "unrecognized_keys") {
      unrecIssue ?? (unrecIssue = iss);
      for (const k of iss.keys) {
        if (!unrecKeys.has(k))
          unrecKeys.set(k, {});
        unrecKeys.get(k).l = true;
      }
    } else {
      result.issues.push(iss);
    }
  }
  for (const iss of right.issues) {
    if (iss.code === "unrecognized_keys") {
      for (const k of iss.keys) {
        if (!unrecKeys.has(k))
          unrecKeys.set(k, {});
        unrecKeys.get(k).r = true;
      }
    } else {
      result.issues.push(iss);
    }
  }
  const bothKeys = [...unrecKeys].filter(([, f]) => f.l && f.r).map(([k]) => k);
  if (bothKeys.length && unrecIssue) {
    result.issues.push({ ...unrecIssue, keys: bothKeys });
  }
  if (aborted(result))
    return result;
  const merged = mergeValues(left.value, right.value);
  if (!merged.valid) {
    throw new Error(`Unmergable intersection. Error path: ` + `${JSON.stringify(merged.mergeErrorPath)}`);
  }
  result.value = merged.data;
  return result;
}
var $ZodRecord = /* @__PURE__ */ $constructor("$ZodRecord", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, ctx) => {
    const input = payload.value;
    if (!isPlainObject(input)) {
      payload.issues.push({
        expected: "record",
        code: "invalid_type",
        input,
        inst
      });
      return payload;
    }
    const proms = [];
    const values = def.keyType._zod.values;
    if (values) {
      payload.value = {};
      const recordKeys = new Set;
      for (const key of values) {
        if (typeof key === "string" || typeof key === "number" || typeof key === "symbol") {
          recordKeys.add(typeof key === "number" ? key.toString() : key);
          const keyResult = def.keyType._zod.run({ value: key, issues: [] }, ctx);
          if (keyResult instanceof Promise) {
            throw new Error("Async schemas not supported in object keys currently");
          }
          if (keyResult.issues.length) {
            payload.issues.push({
              code: "invalid_key",
              origin: "record",
              issues: keyResult.issues.map((iss) => finalizeIssue(iss, ctx, config())),
              input: key,
              path: [key],
              inst
            });
            continue;
          }
          const outKey = keyResult.value;
          const result = def.valueType._zod.run({ value: input[key], issues: [] }, ctx);
          if (result instanceof Promise) {
            proms.push(result.then((result) => {
              if (result.issues.length) {
                payload.issues.push(...prefixIssues(key, result.issues));
              }
              payload.value[outKey] = result.value;
            }));
          } else {
            if (result.issues.length) {
              payload.issues.push(...prefixIssues(key, result.issues));
            }
            payload.value[outKey] = result.value;
          }
        }
      }
      let unrecognized;
      for (const key in input) {
        if (!recordKeys.has(key)) {
          unrecognized = unrecognized ?? [];
          unrecognized.push(key);
        }
      }
      if (unrecognized && unrecognized.length > 0) {
        payload.issues.push({
          code: "unrecognized_keys",
          input,
          inst,
          keys: unrecognized
        });
      }
    } else {
      payload.value = {};
      for (const key of Reflect.ownKeys(input)) {
        if (key === "__proto__")
          continue;
        if (!Object.prototype.propertyIsEnumerable.call(input, key))
          continue;
        let keyResult = def.keyType._zod.run({ value: key, issues: [] }, ctx);
        if (keyResult instanceof Promise) {
          throw new Error("Async schemas not supported in object keys currently");
        }
        const checkNumericKey = typeof key === "string" && number.test(key) && keyResult.issues.length;
        if (checkNumericKey) {
          const retryResult = def.keyType._zod.run({ value: Number(key), issues: [] }, ctx);
          if (retryResult instanceof Promise) {
            throw new Error("Async schemas not supported in object keys currently");
          }
          if (retryResult.issues.length === 0) {
            keyResult = retryResult;
          }
        }
        if (keyResult.issues.length) {
          if (def.mode === "loose") {
            payload.value[key] = input[key];
          } else {
            payload.issues.push({
              code: "invalid_key",
              origin: "record",
              issues: keyResult.issues.map((iss) => finalizeIssue(iss, ctx, config())),
              input: key,
              path: [key],
              inst
            });
          }
          continue;
        }
        const result = def.valueType._zod.run({ value: input[key], issues: [] }, ctx);
        if (result instanceof Promise) {
          proms.push(result.then((result) => {
            if (result.issues.length) {
              payload.issues.push(...prefixIssues(key, result.issues));
            }
            payload.value[keyResult.value] = result.value;
          }));
        } else {
          if (result.issues.length) {
            payload.issues.push(...prefixIssues(key, result.issues));
          }
          payload.value[keyResult.value] = result.value;
        }
      }
    }
    if (proms.length) {
      return Promise.all(proms).then(() => payload);
    }
    return payload;
  };
});
var $ZodEnum = /* @__PURE__ */ $constructor("$ZodEnum", (inst, def) => {
  $ZodType.init(inst, def);
  const values = getEnumValues(def.entries);
  const valuesSet = new Set(values);
  inst._zod.values = valuesSet;
  inst._zod.pattern = new RegExp(`^(${values.filter((k) => propertyKeyTypes.has(typeof k)).map((o) => typeof o === "string" ? escapeRegex(o) : o.toString()).join("|")})$`);
  inst._zod.parse = (payload, _ctx) => {
    const input = payload.value;
    if (valuesSet.has(input)) {
      return payload;
    }
    payload.issues.push({
      code: "invalid_value",
      values,
      input,
      inst
    });
    return payload;
  };
});
var $ZodTransform = /* @__PURE__ */ $constructor("$ZodTransform", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.optin = "optional";
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      throw new $ZodEncodeError(inst.constructor.name);
    }
    const _out = def.transform(payload.value, payload);
    if (ctx.async) {
      const output = _out instanceof Promise ? _out : Promise.resolve(_out);
      return output.then((output) => {
        payload.value = output;
        payload.fallback = true;
        return payload;
      });
    }
    if (_out instanceof Promise) {
      throw new $ZodAsyncError;
    }
    payload.value = _out;
    payload.fallback = true;
    return payload;
  };
});
function handleOptionalResult(result, input) {
  if (input === undefined && (result.issues.length || result.fallback)) {
    return { issues: [], value: undefined };
  }
  return result;
}
var $ZodOptional = /* @__PURE__ */ $constructor("$ZodOptional", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.optin = "optional";
  inst._zod.optout = "optional";
  defineLazy(inst._zod, "values", () => {
    return def.innerType._zod.values ? new Set([...def.innerType._zod.values, undefined]) : undefined;
  });
  defineLazy(inst._zod, "pattern", () => {
    const pattern = def.innerType._zod.pattern;
    return pattern ? new RegExp(`^(${cleanRegex(pattern.source)})?$`) : undefined;
  });
  inst._zod.parse = (payload, ctx) => {
    if (def.innerType._zod.optin === "optional") {
      const input = payload.value;
      const result = def.innerType._zod.run(payload, ctx);
      if (result instanceof Promise)
        return result.then((r) => handleOptionalResult(r, input));
      return handleOptionalResult(result, input);
    }
    if (payload.value === undefined) {
      return payload;
    }
    return def.innerType._zod.run(payload, ctx);
  };
});
var $ZodExactOptional = /* @__PURE__ */ $constructor("$ZodExactOptional", (inst, def) => {
  $ZodOptional.init(inst, def);
  defineLazy(inst._zod, "values", () => def.innerType._zod.values);
  defineLazy(inst._zod, "pattern", () => def.innerType._zod.pattern);
  inst._zod.parse = (payload, ctx) => {
    return def.innerType._zod.run(payload, ctx);
  };
});
var $ZodNullable = /* @__PURE__ */ $constructor("$ZodNullable", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazy(inst._zod, "optin", () => def.innerType._zod.optin);
  defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
  defineLazy(inst._zod, "pattern", () => {
    const pattern = def.innerType._zod.pattern;
    return pattern ? new RegExp(`^(${cleanRegex(pattern.source)}|null)$`) : undefined;
  });
  defineLazy(inst._zod, "values", () => {
    return def.innerType._zod.values ? new Set([...def.innerType._zod.values, null]) : undefined;
  });
  inst._zod.parse = (payload, ctx) => {
    if (payload.value === null)
      return payload;
    return def.innerType._zod.run(payload, ctx);
  };
});
var $ZodDefault = /* @__PURE__ */ $constructor("$ZodDefault", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.optin = "optional";
  defineLazy(inst._zod, "values", () => def.innerType._zod.values);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      return def.innerType._zod.run(payload, ctx);
    }
    if (payload.value === undefined) {
      payload.value = def.defaultValue;
      return payload;
    }
    const result = def.innerType._zod.run(payload, ctx);
    if (result instanceof Promise) {
      return result.then((result) => handleDefaultResult(result, def));
    }
    return handleDefaultResult(result, def);
  };
});
function handleDefaultResult(payload, def) {
  if (payload.value === undefined) {
    payload.value = def.defaultValue;
  }
  return payload;
}
var $ZodPrefault = /* @__PURE__ */ $constructor("$ZodPrefault", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.optin = "optional";
  defineLazy(inst._zod, "values", () => def.innerType._zod.values);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      return def.innerType._zod.run(payload, ctx);
    }
    if (payload.value === undefined) {
      payload.value = def.defaultValue;
    }
    return def.innerType._zod.run(payload, ctx);
  };
});
var $ZodNonOptional = /* @__PURE__ */ $constructor("$ZodNonOptional", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazy(inst._zod, "values", () => {
    const v = def.innerType._zod.values;
    return v ? new Set([...v].filter((x) => x !== undefined)) : undefined;
  });
  inst._zod.parse = (payload, ctx) => {
    const result = def.innerType._zod.run(payload, ctx);
    if (result instanceof Promise) {
      return result.then((result) => handleNonOptionalResult(result, inst));
    }
    return handleNonOptionalResult(result, inst);
  };
});
function handleNonOptionalResult(payload, inst) {
  if (!payload.issues.length && payload.value === undefined) {
    payload.issues.push({
      code: "invalid_type",
      expected: "nonoptional",
      input: payload.value,
      inst
    });
  }
  return payload;
}
var $ZodCatch = /* @__PURE__ */ $constructor("$ZodCatch", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.optin = "optional";
  defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
  defineLazy(inst._zod, "values", () => def.innerType._zod.values);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      return def.innerType._zod.run(payload, ctx);
    }
    const result = def.innerType._zod.run(payload, ctx);
    if (result instanceof Promise) {
      return result.then((result) => {
        payload.value = result.value;
        if (result.issues.length) {
          payload.value = def.catchValue({
            ...payload,
            error: {
              issues: result.issues.map((iss) => finalizeIssue(iss, ctx, config()))
            },
            input: payload.value
          });
          payload.issues = [];
          payload.fallback = true;
        }
        return payload;
      });
    }
    payload.value = result.value;
    if (result.issues.length) {
      payload.value = def.catchValue({
        ...payload,
        error: {
          issues: result.issues.map((iss) => finalizeIssue(iss, ctx, config()))
        },
        input: payload.value
      });
      payload.issues = [];
      payload.fallback = true;
    }
    return payload;
  };
});
var $ZodPipe = /* @__PURE__ */ $constructor("$ZodPipe", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazy(inst._zod, "values", () => def.in._zod.values);
  defineLazy(inst._zod, "optin", () => def.in._zod.optin);
  defineLazy(inst._zod, "optout", () => def.out._zod.optout);
  defineLazy(inst._zod, "propValues", () => def.in._zod.propValues);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      const right = def.out._zod.run(payload, ctx);
      if (right instanceof Promise) {
        return right.then((right) => handlePipeResult(right, def.in, ctx));
      }
      return handlePipeResult(right, def.in, ctx);
    }
    const left = def.in._zod.run(payload, ctx);
    if (left instanceof Promise) {
      return left.then((left) => handlePipeResult(left, def.out, ctx));
    }
    return handlePipeResult(left, def.out, ctx);
  };
});
function handlePipeResult(left, next, ctx) {
  if (left.issues.length) {
    left.aborted = true;
    return left;
  }
  return next._zod.run({ value: left.value, issues: left.issues, fallback: left.fallback }, ctx);
}
var $ZodReadonly = /* @__PURE__ */ $constructor("$ZodReadonly", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazy(inst._zod, "propValues", () => def.innerType._zod.propValues);
  defineLazy(inst._zod, "values", () => def.innerType._zod.values);
  defineLazy(inst._zod, "optin", () => def.innerType?._zod?.optin);
  defineLazy(inst._zod, "optout", () => def.innerType?._zod?.optout);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      return def.innerType._zod.run(payload, ctx);
    }
    const result = def.innerType._zod.run(payload, ctx);
    if (result instanceof Promise) {
      return result.then(handleReadonlyResult);
    }
    return handleReadonlyResult(result);
  };
});
function handleReadonlyResult(payload) {
  payload.value = Object.freeze(payload.value);
  return payload;
}
var $ZodCustom = /* @__PURE__ */ $constructor("$ZodCustom", (inst, def) => {
  $ZodCheck.init(inst, def);
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, _) => {
    return payload;
  };
  inst._zod.check = (payload) => {
    const input = payload.value;
    const r = def.fn(input);
    if (r instanceof Promise) {
      return r.then((r) => handleRefineResult(r, payload, input, inst));
    }
    handleRefineResult(r, payload, input, inst);
    return;
  };
});
function handleRefineResult(result, payload, input, inst) {
  if (!result) {
    const _iss = {
      code: "custom",
      input,
      inst,
      path: [...inst._zod.def.path ?? []],
      continue: !inst._zod.def.abort
    };
    if (inst._zod.def.params)
      _iss.params = inst._zod.def.params;
    payload.issues.push(issue(_iss));
  }
}
// node_modules/zod/v4/core/registries.js
var _a2;
var $output = Symbol("ZodOutput");
var $input = Symbol("ZodInput");

class $ZodRegistry {
  constructor() {
    this._map = new WeakMap;
    this._idmap = new Map;
  }
  add(schema, ..._meta) {
    const meta = _meta[0];
    this._map.set(schema, meta);
    if (meta && typeof meta === "object" && "id" in meta) {
      this._idmap.set(meta.id, schema);
    }
    return this;
  }
  clear() {
    this._map = new WeakMap;
    this._idmap = new Map;
    return this;
  }
  remove(schema) {
    const meta = this._map.get(schema);
    if (meta && typeof meta === "object" && "id" in meta) {
      this._idmap.delete(meta.id);
    }
    this._map.delete(schema);
    return this;
  }
  get(schema) {
    const p = schema._zod.parent;
    if (p) {
      const pm = { ...this.get(p) ?? {} };
      delete pm.id;
      const f = { ...pm, ...this._map.get(schema) };
      return Object.keys(f).length ? f : undefined;
    }
    return this._map.get(schema);
  }
  has(schema) {
    return this._map.has(schema);
  }
}
function registry() {
  return new $ZodRegistry;
}
(_a2 = globalThis).__zod_globalRegistry ?? (_a2.__zod_globalRegistry = registry());
var globalRegistry = globalThis.__zod_globalRegistry;
// node_modules/zod/v4/core/api.js
function _string(Class, params) {
  return new Class({
    type: "string",
    ...normalizeParams(params)
  });
}
function _email(Class, params) {
  return new Class({
    type: "string",
    format: "email",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _guid(Class, params) {
  return new Class({
    type: "string",
    format: "guid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _uuid(Class, params) {
  return new Class({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _uuidv4(Class, params) {
  return new Class({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    version: "v4",
    ...normalizeParams(params)
  });
}
function _uuidv6(Class, params) {
  return new Class({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    version: "v6",
    ...normalizeParams(params)
  });
}
function _uuidv7(Class, params) {
  return new Class({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    version: "v7",
    ...normalizeParams(params)
  });
}
function _url(Class, params) {
  return new Class({
    type: "string",
    format: "url",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _emoji2(Class, params) {
  return new Class({
    type: "string",
    format: "emoji",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _nanoid(Class, params) {
  return new Class({
    type: "string",
    format: "nanoid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _cuid(Class, params) {
  return new Class({
    type: "string",
    format: "cuid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _cuid2(Class, params) {
  return new Class({
    type: "string",
    format: "cuid2",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _ulid(Class, params) {
  return new Class({
    type: "string",
    format: "ulid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _xid(Class, params) {
  return new Class({
    type: "string",
    format: "xid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _ksuid(Class, params) {
  return new Class({
    type: "string",
    format: "ksuid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _ipv4(Class, params) {
  return new Class({
    type: "string",
    format: "ipv4",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _ipv6(Class, params) {
  return new Class({
    type: "string",
    format: "ipv6",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _cidrv4(Class, params) {
  return new Class({
    type: "string",
    format: "cidrv4",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _cidrv6(Class, params) {
  return new Class({
    type: "string",
    format: "cidrv6",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _base64(Class, params) {
  return new Class({
    type: "string",
    format: "base64",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _base64url(Class, params) {
  return new Class({
    type: "string",
    format: "base64url",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _e164(Class, params) {
  return new Class({
    type: "string",
    format: "e164",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _jwt(Class, params) {
  return new Class({
    type: "string",
    format: "jwt",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _isoDateTime(Class, params) {
  return new Class({
    type: "string",
    format: "datetime",
    check: "string_format",
    offset: false,
    local: false,
    precision: null,
    ...normalizeParams(params)
  });
}
function _isoDate(Class, params) {
  return new Class({
    type: "string",
    format: "date",
    check: "string_format",
    ...normalizeParams(params)
  });
}
function _isoTime(Class, params) {
  return new Class({
    type: "string",
    format: "time",
    check: "string_format",
    precision: null,
    ...normalizeParams(params)
  });
}
function _isoDuration(Class, params) {
  return new Class({
    type: "string",
    format: "duration",
    check: "string_format",
    ...normalizeParams(params)
  });
}
function _number(Class, params) {
  return new Class({
    type: "number",
    checks: [],
    ...normalizeParams(params)
  });
}
function _int(Class, params) {
  return new Class({
    type: "number",
    check: "number_format",
    abort: false,
    format: "safeint",
    ...normalizeParams(params)
  });
}
function _boolean(Class, params) {
  return new Class({
    type: "boolean",
    ...normalizeParams(params)
  });
}
function _unknown(Class) {
  return new Class({
    type: "unknown"
  });
}
function _never(Class, params) {
  return new Class({
    type: "never",
    ...normalizeParams(params)
  });
}
function _lt(value, params) {
  return new $ZodCheckLessThan({
    check: "less_than",
    ...normalizeParams(params),
    value,
    inclusive: false
  });
}
function _lte(value, params) {
  return new $ZodCheckLessThan({
    check: "less_than",
    ...normalizeParams(params),
    value,
    inclusive: true
  });
}
function _gt(value, params) {
  return new $ZodCheckGreaterThan({
    check: "greater_than",
    ...normalizeParams(params),
    value,
    inclusive: false
  });
}
function _gte(value, params) {
  return new $ZodCheckGreaterThan({
    check: "greater_than",
    ...normalizeParams(params),
    value,
    inclusive: true
  });
}
function _multipleOf(value, params) {
  return new $ZodCheckMultipleOf({
    check: "multiple_of",
    ...normalizeParams(params),
    value
  });
}
function _maxLength(maximum, params) {
  const ch = new $ZodCheckMaxLength({
    check: "max_length",
    ...normalizeParams(params),
    maximum
  });
  return ch;
}
function _minLength(minimum, params) {
  return new $ZodCheckMinLength({
    check: "min_length",
    ...normalizeParams(params),
    minimum
  });
}
function _length(length, params) {
  return new $ZodCheckLengthEquals({
    check: "length_equals",
    ...normalizeParams(params),
    length
  });
}
function _regex(pattern, params) {
  return new $ZodCheckRegex({
    check: "string_format",
    format: "regex",
    ...normalizeParams(params),
    pattern
  });
}
function _lowercase(params) {
  return new $ZodCheckLowerCase({
    check: "string_format",
    format: "lowercase",
    ...normalizeParams(params)
  });
}
function _uppercase(params) {
  return new $ZodCheckUpperCase({
    check: "string_format",
    format: "uppercase",
    ...normalizeParams(params)
  });
}
function _includes(includes, params) {
  return new $ZodCheckIncludes({
    check: "string_format",
    format: "includes",
    ...normalizeParams(params),
    includes
  });
}
function _startsWith(prefix, params) {
  return new $ZodCheckStartsWith({
    check: "string_format",
    format: "starts_with",
    ...normalizeParams(params),
    prefix
  });
}
function _endsWith(suffix, params) {
  return new $ZodCheckEndsWith({
    check: "string_format",
    format: "ends_with",
    ...normalizeParams(params),
    suffix
  });
}
function _overwrite(tx) {
  return new $ZodCheckOverwrite({
    check: "overwrite",
    tx
  });
}
function _normalize(form) {
  return _overwrite((input) => input.normalize(form));
}
function _trim() {
  return _overwrite((input) => input.trim());
}
function _toLowerCase() {
  return _overwrite((input) => input.toLowerCase());
}
function _toUpperCase() {
  return _overwrite((input) => input.toUpperCase());
}
function _slugify() {
  return _overwrite((input) => slugify(input));
}
function _array(Class, element, params) {
  return new Class({
    type: "array",
    element,
    ...normalizeParams(params)
  });
}
function _refine(Class, fn, _params) {
  const schema = new Class({
    type: "custom",
    check: "custom",
    fn,
    ...normalizeParams(_params)
  });
  return schema;
}
function _superRefine(fn, params) {
  const ch = _check((payload) => {
    payload.addIssue = (issue2) => {
      if (typeof issue2 === "string") {
        payload.issues.push(issue(issue2, payload.value, ch._zod.def));
      } else {
        const _issue = issue2;
        if (_issue.fatal)
          _issue.continue = false;
        _issue.code ?? (_issue.code = "custom");
        _issue.input ?? (_issue.input = payload.value);
        _issue.inst ?? (_issue.inst = ch);
        _issue.continue ?? (_issue.continue = !ch._zod.def.abort);
        payload.issues.push(issue(_issue));
      }
    };
    return fn(payload.value, payload);
  }, params);
  return ch;
}
function _check(fn, params) {
  const ch = new $ZodCheck({
    check: "custom",
    ...normalizeParams(params)
  });
  ch._zod.check = fn;
  return ch;
}
// node_modules/zod/v4/core/to-json-schema.js
function initializeContext(params) {
  let target = params?.target ?? "draft-2020-12";
  if (target === "draft-4")
    target = "draft-04";
  if (target === "draft-7")
    target = "draft-07";
  return {
    processors: params.processors ?? {},
    metadataRegistry: params?.metadata ?? globalRegistry,
    target,
    unrepresentable: params?.unrepresentable ?? "throw",
    override: params?.override ?? (() => {}),
    io: params?.io ?? "output",
    counter: 0,
    seen: new Map,
    cycles: params?.cycles ?? "ref",
    reused: params?.reused ?? "inline",
    external: params?.external ?? undefined
  };
}
function process2(schema, ctx, _params = { path: [], schemaPath: [] }) {
  var _a;
  const def = schema._zod.def;
  const seen = ctx.seen.get(schema);
  if (seen) {
    seen.count++;
    const isCycle = _params.schemaPath.includes(schema);
    if (isCycle) {
      seen.cycle = _params.path;
    }
    return seen.schema;
  }
  const result = { schema: {}, count: 1, cycle: undefined, path: _params.path };
  ctx.seen.set(schema, result);
  const overrideSchema = schema._zod.toJSONSchema?.();
  if (overrideSchema) {
    result.schema = overrideSchema;
  } else {
    const params = {
      ..._params,
      schemaPath: [..._params.schemaPath, schema],
      path: _params.path
    };
    if (schema._zod.processJSONSchema) {
      schema._zod.processJSONSchema(ctx, result.schema, params);
    } else {
      const _json = result.schema;
      const processor = ctx.processors[def.type];
      if (!processor) {
        throw new Error(`[toJSONSchema]: Non-representable type encountered: ${def.type}`);
      }
      processor(schema, ctx, _json, params);
    }
    const parent = schema._zod.parent;
    if (parent) {
      if (!result.ref)
        result.ref = parent;
      process2(parent, ctx, params);
      ctx.seen.get(parent).isParent = true;
    }
  }
  const meta = ctx.metadataRegistry.get(schema);
  if (meta)
    Object.assign(result.schema, meta);
  if (ctx.io === "input" && isTransforming(schema)) {
    delete result.schema.examples;
    delete result.schema.default;
  }
  if (ctx.io === "input" && "_prefault" in result.schema)
    (_a = result.schema).default ?? (_a.default = result.schema._prefault);
  delete result.schema._prefault;
  const _result = ctx.seen.get(schema);
  return _result.schema;
}
function extractDefs(ctx, schema) {
  const root = ctx.seen.get(schema);
  if (!root)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  const idToSchema = new Map;
  for (const entry of ctx.seen.entries()) {
    const id = ctx.metadataRegistry.get(entry[0])?.id;
    if (id) {
      const existing = idToSchema.get(id);
      if (existing && existing !== entry[0]) {
        throw new Error(`Duplicate schema id "${id}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
      }
      idToSchema.set(id, entry[0]);
    }
  }
  const makeURI = (entry) => {
    const defsSegment = ctx.target === "draft-2020-12" ? "$defs" : "definitions";
    if (ctx.external) {
      const externalId = ctx.external.registry.get(entry[0])?.id;
      const uriGenerator = ctx.external.uri ?? ((id) => id);
      if (externalId) {
        return { ref: uriGenerator(externalId) };
      }
      const id = entry[1].defId ?? entry[1].schema.id ?? `schema${ctx.counter++}`;
      entry[1].defId = id;
      return { defId: id, ref: `${uriGenerator("__shared")}#/${defsSegment}/${id}` };
    }
    if (entry[1] === root) {
      return { ref: "#" };
    }
    const uriPrefix = `#`;
    const defUriPrefix = `${uriPrefix}/${defsSegment}/`;
    const defId = entry[1].schema.id ?? `__schema${ctx.counter++}`;
    return { defId, ref: defUriPrefix + defId };
  };
  const extractToDef = (entry) => {
    if (entry[1].schema.$ref) {
      return;
    }
    const seen = entry[1];
    const { ref, defId } = makeURI(entry);
    seen.def = { ...seen.schema };
    if (defId)
      seen.defId = defId;
    const schema = seen.schema;
    for (const key in schema) {
      delete schema[key];
    }
    schema.$ref = ref;
  };
  if (ctx.cycles === "throw") {
    for (const entry of ctx.seen.entries()) {
      const seen = entry[1];
      if (seen.cycle) {
        throw new Error("Cycle detected: " + `#/${seen.cycle?.join("/")}/<root>` + '\n\nSet the `cycles` parameter to `"ref"` to resolve cyclical schemas with defs.');
      }
    }
  }
  for (const entry of ctx.seen.entries()) {
    const seen = entry[1];
    if (schema === entry[0]) {
      extractToDef(entry);
      continue;
    }
    if (ctx.external) {
      const ext = ctx.external.registry.get(entry[0])?.id;
      if (schema !== entry[0] && ext) {
        extractToDef(entry);
        continue;
      }
    }
    const id = ctx.metadataRegistry.get(entry[0])?.id;
    if (id) {
      extractToDef(entry);
      continue;
    }
    if (seen.cycle) {
      extractToDef(entry);
      continue;
    }
    if (seen.count > 1) {
      if (ctx.reused === "ref") {
        extractToDef(entry);
        continue;
      }
    }
  }
}
function finalize(ctx, schema) {
  const root = ctx.seen.get(schema);
  if (!root)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  const flattenRef = (zodSchema) => {
    const seen = ctx.seen.get(zodSchema);
    if (seen.ref === null)
      return;
    const schema = seen.def ?? seen.schema;
    const _cached = { ...schema };
    const ref = seen.ref;
    seen.ref = null;
    if (ref) {
      flattenRef(ref);
      const refSeen = ctx.seen.get(ref);
      const refSchema = refSeen.schema;
      if (refSchema.$ref && (ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0")) {
        schema.allOf = schema.allOf ?? [];
        schema.allOf.push(refSchema);
      } else {
        Object.assign(schema, refSchema);
      }
      Object.assign(schema, _cached);
      const isParentRef = zodSchema._zod.parent === ref;
      if (isParentRef) {
        for (const key in schema) {
          if (key === "$ref" || key === "allOf")
            continue;
          if (!(key in _cached)) {
            delete schema[key];
          }
        }
      }
      if (refSchema.$ref && refSeen.def) {
        for (const key in schema) {
          if (key === "$ref" || key === "allOf")
            continue;
          if (key in refSeen.def && JSON.stringify(schema[key]) === JSON.stringify(refSeen.def[key])) {
            delete schema[key];
          }
        }
      }
    }
    const parent = zodSchema._zod.parent;
    if (parent && parent !== ref) {
      flattenRef(parent);
      const parentSeen = ctx.seen.get(parent);
      if (parentSeen?.schema.$ref) {
        schema.$ref = parentSeen.schema.$ref;
        if (parentSeen.def) {
          for (const key in schema) {
            if (key === "$ref" || key === "allOf")
              continue;
            if (key in parentSeen.def && JSON.stringify(schema[key]) === JSON.stringify(parentSeen.def[key])) {
              delete schema[key];
            }
          }
        }
      }
    }
    ctx.override({
      zodSchema,
      jsonSchema: schema,
      path: seen.path ?? []
    });
  };
  for (const entry of [...ctx.seen.entries()].reverse()) {
    flattenRef(entry[0]);
  }
  const result = {};
  if (ctx.target === "draft-2020-12") {
    result.$schema = "https://json-schema.org/draft/2020-12/schema";
  } else if (ctx.target === "draft-07") {
    result.$schema = "http://json-schema.org/draft-07/schema#";
  } else if (ctx.target === "draft-04") {
    result.$schema = "http://json-schema.org/draft-04/schema#";
  } else if (ctx.target === "openapi-3.0") {}
  if (ctx.external?.uri) {
    const id = ctx.external.registry.get(schema)?.id;
    if (!id)
      throw new Error("Schema is missing an `id` property");
    result.$id = ctx.external.uri(id);
  }
  Object.assign(result, root.def ?? root.schema);
  const rootMetaId = ctx.metadataRegistry.get(schema)?.id;
  if (rootMetaId !== undefined && result.id === rootMetaId)
    delete result.id;
  const defs = ctx.external?.defs ?? {};
  for (const entry of ctx.seen.entries()) {
    const seen = entry[1];
    if (seen.def && seen.defId) {
      if (seen.def.id === seen.defId)
        delete seen.def.id;
      defs[seen.defId] = seen.def;
    }
  }
  if (ctx.external) {} else {
    if (Object.keys(defs).length > 0) {
      if (ctx.target === "draft-2020-12") {
        result.$defs = defs;
      } else {
        result.definitions = defs;
      }
    }
  }
  try {
    const finalized = JSON.parse(JSON.stringify(result));
    Object.defineProperty(finalized, "~standard", {
      value: {
        ...schema["~standard"],
        jsonSchema: {
          input: createStandardJSONSchemaMethod(schema, "input", ctx.processors),
          output: createStandardJSONSchemaMethod(schema, "output", ctx.processors)
        }
      },
      enumerable: false,
      writable: false
    });
    return finalized;
  } catch (_err) {
    throw new Error("Error converting schema to JSON.");
  }
}
function isTransforming(_schema, _ctx) {
  const ctx = _ctx ?? { seen: new Set };
  if (ctx.seen.has(_schema))
    return false;
  ctx.seen.add(_schema);
  const def = _schema._zod.def;
  if (def.type === "transform")
    return true;
  if (def.type === "array")
    return isTransforming(def.element, ctx);
  if (def.type === "set")
    return isTransforming(def.valueType, ctx);
  if (def.type === "lazy")
    return isTransforming(def.getter(), ctx);
  if (def.type === "promise" || def.type === "optional" || def.type === "nonoptional" || def.type === "nullable" || def.type === "readonly" || def.type === "default" || def.type === "prefault") {
    return isTransforming(def.innerType, ctx);
  }
  if (def.type === "intersection") {
    return isTransforming(def.left, ctx) || isTransforming(def.right, ctx);
  }
  if (def.type === "record" || def.type === "map") {
    return isTransforming(def.keyType, ctx) || isTransforming(def.valueType, ctx);
  }
  if (def.type === "pipe") {
    if (_schema._zod.traits.has("$ZodCodec"))
      return true;
    return isTransforming(def.in, ctx) || isTransforming(def.out, ctx);
  }
  if (def.type === "object") {
    for (const key in def.shape) {
      if (isTransforming(def.shape[key], ctx))
        return true;
    }
    return false;
  }
  if (def.type === "union") {
    for (const option of def.options) {
      if (isTransforming(option, ctx))
        return true;
    }
    return false;
  }
  if (def.type === "tuple") {
    for (const item of def.items) {
      if (isTransforming(item, ctx))
        return true;
    }
    if (def.rest && isTransforming(def.rest, ctx))
      return true;
    return false;
  }
  return false;
}
var createToJSONSchemaMethod = (schema, processors = {}) => (params) => {
  const ctx = initializeContext({ ...params, processors });
  process2(schema, ctx);
  extractDefs(ctx, schema);
  return finalize(ctx, schema);
};
var createStandardJSONSchemaMethod = (schema, io, processors = {}) => (params) => {
  const { libraryOptions, target } = params ?? {};
  const ctx = initializeContext({ ...libraryOptions ?? {}, target, io, processors });
  process2(schema, ctx);
  extractDefs(ctx, schema);
  return finalize(ctx, schema);
};
// node_modules/zod/v4/core/json-schema-processors.js
var formatMap = {
  guid: "uuid",
  url: "uri",
  datetime: "date-time",
  json_string: "json-string",
  regex: ""
};
var stringProcessor = (schema, ctx, _json, _params) => {
  const json = _json;
  json.type = "string";
  const { minimum, maximum, format, patterns, contentEncoding } = schema._zod.bag;
  if (typeof minimum === "number")
    json.minLength = minimum;
  if (typeof maximum === "number")
    json.maxLength = maximum;
  if (format) {
    json.format = formatMap[format] ?? format;
    if (json.format === "")
      delete json.format;
    if (format === "time") {
      delete json.format;
    }
  }
  if (contentEncoding)
    json.contentEncoding = contentEncoding;
  if (patterns && patterns.size > 0) {
    const regexes = [...patterns];
    if (regexes.length === 1)
      json.pattern = regexes[0].source;
    else if (regexes.length > 1) {
      json.allOf = [
        ...regexes.map((regex) => ({
          ...ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0" ? { type: "string" } : {},
          pattern: regex.source
        }))
      ];
    }
  }
};
var numberProcessor = (schema, ctx, _json, _params) => {
  const json = _json;
  const { minimum, maximum, format, multipleOf, exclusiveMaximum, exclusiveMinimum } = schema._zod.bag;
  if (typeof format === "string" && format.includes("int"))
    json.type = "integer";
  else
    json.type = "number";
  const exMin = typeof exclusiveMinimum === "number" && exclusiveMinimum >= (minimum ?? Number.NEGATIVE_INFINITY);
  const exMax = typeof exclusiveMaximum === "number" && exclusiveMaximum <= (maximum ?? Number.POSITIVE_INFINITY);
  const legacy = ctx.target === "draft-04" || ctx.target === "openapi-3.0";
  if (exMin) {
    if (legacy) {
      json.minimum = exclusiveMinimum;
      json.exclusiveMinimum = true;
    } else {
      json.exclusiveMinimum = exclusiveMinimum;
    }
  } else if (typeof minimum === "number") {
    json.minimum = minimum;
  }
  if (exMax) {
    if (legacy) {
      json.maximum = exclusiveMaximum;
      json.exclusiveMaximum = true;
    } else {
      json.exclusiveMaximum = exclusiveMaximum;
    }
  } else if (typeof maximum === "number") {
    json.maximum = maximum;
  }
  if (typeof multipleOf === "number")
    json.multipleOf = multipleOf;
};
var booleanProcessor = (_schema, _ctx, json, _params) => {
  json.type = "boolean";
};
var neverProcessor = (_schema, _ctx, json, _params) => {
  json.not = {};
};
var unknownProcessor = (_schema, _ctx, _json, _params) => {};
var enumProcessor = (schema, _ctx, json, _params) => {
  const def = schema._zod.def;
  const values = getEnumValues(def.entries);
  if (values.every((v) => typeof v === "number"))
    json.type = "number";
  if (values.every((v) => typeof v === "string"))
    json.type = "string";
  json.enum = values;
};
var customProcessor = (_schema, ctx, _json, _params) => {
  if (ctx.unrepresentable === "throw") {
    throw new Error("Custom types cannot be represented in JSON Schema");
  }
};
var transformProcessor = (_schema, ctx, _json, _params) => {
  if (ctx.unrepresentable === "throw") {
    throw new Error("Transforms cannot be represented in JSON Schema");
  }
};
var arrayProcessor = (schema, ctx, _json, params) => {
  const json = _json;
  const def = schema._zod.def;
  const { minimum, maximum } = schema._zod.bag;
  if (typeof minimum === "number")
    json.minItems = minimum;
  if (typeof maximum === "number")
    json.maxItems = maximum;
  json.type = "array";
  json.items = process2(def.element, ctx, {
    ...params,
    path: [...params.path, "items"]
  });
};
var objectProcessor = (schema, ctx, _json, params) => {
  const json = _json;
  const def = schema._zod.def;
  json.type = "object";
  json.properties = {};
  const shape = def.shape;
  for (const key in shape) {
    json.properties[key] = process2(shape[key], ctx, {
      ...params,
      path: [...params.path, "properties", key]
    });
  }
  const allKeys = new Set(Object.keys(shape));
  const requiredKeys = new Set([...allKeys].filter((key) => {
    const v = def.shape[key]._zod;
    if (ctx.io === "input") {
      return v.optin === undefined;
    } else {
      return v.optout === undefined;
    }
  }));
  if (requiredKeys.size > 0) {
    json.required = Array.from(requiredKeys);
  }
  if (def.catchall?._zod.def.type === "never") {
    json.additionalProperties = false;
  } else if (!def.catchall) {
    if (ctx.io === "output")
      json.additionalProperties = false;
  } else if (def.catchall) {
    json.additionalProperties = process2(def.catchall, ctx, {
      ...params,
      path: [...params.path, "additionalProperties"]
    });
  }
};
var unionProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  const isExclusive = def.inclusive === false;
  const options = def.options.map((x, i) => process2(x, ctx, {
    ...params,
    path: [...params.path, isExclusive ? "oneOf" : "anyOf", i]
  }));
  if (isExclusive) {
    json.oneOf = options;
  } else {
    json.anyOf = options;
  }
};
var intersectionProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  const a = process2(def.left, ctx, {
    ...params,
    path: [...params.path, "allOf", 0]
  });
  const b = process2(def.right, ctx, {
    ...params,
    path: [...params.path, "allOf", 1]
  });
  const isSimpleIntersection = (val) => ("allOf" in val) && Object.keys(val).length === 1;
  const allOf = [
    ...isSimpleIntersection(a) ? a.allOf : [a],
    ...isSimpleIntersection(b) ? b.allOf : [b]
  ];
  json.allOf = allOf;
};
var recordProcessor = (schema, ctx, _json, params) => {
  const json = _json;
  const def = schema._zod.def;
  json.type = "object";
  const keyType = def.keyType;
  const keyBag = keyType._zod.bag;
  const patterns = keyBag?.patterns;
  if (def.mode === "loose" && patterns && patterns.size > 0) {
    const valueSchema = process2(def.valueType, ctx, {
      ...params,
      path: [...params.path, "patternProperties", "*"]
    });
    json.patternProperties = {};
    for (const pattern of patterns) {
      json.patternProperties[pattern.source] = valueSchema;
    }
  } else {
    if (ctx.target === "draft-07" || ctx.target === "draft-2020-12") {
      json.propertyNames = process2(def.keyType, ctx, {
        ...params,
        path: [...params.path, "propertyNames"]
      });
    }
    json.additionalProperties = process2(def.valueType, ctx, {
      ...params,
      path: [...params.path, "additionalProperties"]
    });
  }
  const keyValues = keyType._zod.values;
  if (keyValues) {
    const validKeyValues = [...keyValues].filter((v) => typeof v === "string" || typeof v === "number");
    if (validKeyValues.length > 0) {
      json.required = validKeyValues;
    }
  }
};
var nullableProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  const inner = process2(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  if (ctx.target === "openapi-3.0") {
    seen.ref = def.innerType;
    json.nullable = true;
  } else {
    json.anyOf = [inner, { type: "null" }];
  }
};
var nonoptionalProcessor = (schema, ctx, _json, params) => {
  const def = schema._zod.def;
  process2(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
};
var defaultProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  process2(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
  json.default = JSON.parse(JSON.stringify(def.defaultValue));
};
var prefaultProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  process2(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
  if (ctx.io === "input")
    json._prefault = JSON.parse(JSON.stringify(def.defaultValue));
};
var catchProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  process2(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
  let catchValue;
  try {
    catchValue = def.catchValue(undefined);
  } catch {
    throw new Error("Dynamic catch values are not supported in JSON Schema");
  }
  json.default = catchValue;
};
var pipeProcessor = (schema, ctx, _json, params) => {
  const def = schema._zod.def;
  const inIsTransform = def.in._zod.traits.has("$ZodTransform");
  const innerType = ctx.io === "input" ? inIsTransform ? def.out : def.in : def.out;
  process2(innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = innerType;
};
var readonlyProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  process2(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
  json.readOnly = true;
};
var optionalProcessor = (schema, ctx, _json, params) => {
  const def = schema._zod.def;
  process2(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
};
// node_modules/zod/v4/classic/iso.js
var ZodISODateTime = /* @__PURE__ */ $constructor("ZodISODateTime", (inst, def) => {
  $ZodISODateTime.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function datetime2(params) {
  return _isoDateTime(ZodISODateTime, params);
}
var ZodISODate = /* @__PURE__ */ $constructor("ZodISODate", (inst, def) => {
  $ZodISODate.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function date2(params) {
  return _isoDate(ZodISODate, params);
}
var ZodISOTime = /* @__PURE__ */ $constructor("ZodISOTime", (inst, def) => {
  $ZodISOTime.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function time2(params) {
  return _isoTime(ZodISOTime, params);
}
var ZodISODuration = /* @__PURE__ */ $constructor("ZodISODuration", (inst, def) => {
  $ZodISODuration.init(inst, def);
  ZodStringFormat.init(inst, def);
});
function duration2(params) {
  return _isoDuration(ZodISODuration, params);
}

// node_modules/zod/v4/classic/errors.js
var initializer2 = (inst, issues) => {
  $ZodError.init(inst, issues);
  inst.name = "ZodError";
  Object.defineProperties(inst, {
    format: {
      value: (mapper) => formatError(inst, mapper)
    },
    flatten: {
      value: (mapper) => flattenError(inst, mapper)
    },
    addIssue: {
      value: (issue) => {
        inst.issues.push(issue);
        inst.message = JSON.stringify(inst.issues, jsonStringifyReplacer, 2);
      }
    },
    addIssues: {
      value: (issues) => {
        inst.issues.push(...issues);
        inst.message = JSON.stringify(inst.issues, jsonStringifyReplacer, 2);
      }
    },
    isEmpty: {
      get() {
        return inst.issues.length === 0;
      }
    }
  });
};
var ZodRealError = /* @__PURE__ */ $constructor("ZodError", initializer2, {
  Parent: Error
});

// node_modules/zod/v4/classic/parse.js
var parse3 = /* @__PURE__ */ _parse(ZodRealError);
var parseAsync2 = /* @__PURE__ */ _parseAsync(ZodRealError);
var safeParse2 = /* @__PURE__ */ _safeParse(ZodRealError);
var safeParseAsync2 = /* @__PURE__ */ _safeParseAsync(ZodRealError);
var encode = /* @__PURE__ */ _encode(ZodRealError);
var decode = /* @__PURE__ */ _decode(ZodRealError);
var encodeAsync = /* @__PURE__ */ _encodeAsync(ZodRealError);
var decodeAsync = /* @__PURE__ */ _decodeAsync(ZodRealError);
var safeEncode = /* @__PURE__ */ _safeEncode(ZodRealError);
var safeDecode = /* @__PURE__ */ _safeDecode(ZodRealError);
var safeEncodeAsync = /* @__PURE__ */ _safeEncodeAsync(ZodRealError);
var safeDecodeAsync = /* @__PURE__ */ _safeDecodeAsync(ZodRealError);

// node_modules/zod/v4/classic/schemas.js
var _installedGroups = /* @__PURE__ */ new WeakMap;
function _installLazyMethods(inst, group, methods) {
  const proto = Object.getPrototypeOf(inst);
  let installed = _installedGroups.get(proto);
  if (!installed) {
    installed = new Set;
    _installedGroups.set(proto, installed);
  }
  if (installed.has(group))
    return;
  installed.add(group);
  for (const key in methods) {
    const fn = methods[key];
    Object.defineProperty(proto, key, {
      configurable: true,
      enumerable: false,
      get() {
        const bound = fn.bind(this);
        Object.defineProperty(this, key, {
          configurable: true,
          writable: true,
          enumerable: true,
          value: bound
        });
        return bound;
      },
      set(v) {
        Object.defineProperty(this, key, {
          configurable: true,
          writable: true,
          enumerable: true,
          value: v
        });
      }
    });
  }
}
var ZodType = /* @__PURE__ */ $constructor("ZodType", (inst, def) => {
  $ZodType.init(inst, def);
  Object.assign(inst["~standard"], {
    jsonSchema: {
      input: createStandardJSONSchemaMethod(inst, "input"),
      output: createStandardJSONSchemaMethod(inst, "output")
    }
  });
  inst.toJSONSchema = createToJSONSchemaMethod(inst, {});
  inst.def = def;
  inst.type = def.type;
  Object.defineProperty(inst, "_def", { value: def });
  inst.parse = (data, params) => parse3(inst, data, params, { callee: inst.parse });
  inst.safeParse = (data, params) => safeParse2(inst, data, params);
  inst.parseAsync = async (data, params) => parseAsync2(inst, data, params, { callee: inst.parseAsync });
  inst.safeParseAsync = async (data, params) => safeParseAsync2(inst, data, params);
  inst.spa = inst.safeParseAsync;
  inst.encode = (data, params) => encode(inst, data, params);
  inst.decode = (data, params) => decode(inst, data, params);
  inst.encodeAsync = async (data, params) => encodeAsync(inst, data, params);
  inst.decodeAsync = async (data, params) => decodeAsync(inst, data, params);
  inst.safeEncode = (data, params) => safeEncode(inst, data, params);
  inst.safeDecode = (data, params) => safeDecode(inst, data, params);
  inst.safeEncodeAsync = async (data, params) => safeEncodeAsync(inst, data, params);
  inst.safeDecodeAsync = async (data, params) => safeDecodeAsync(inst, data, params);
  _installLazyMethods(inst, "ZodType", {
    check(...chks) {
      const def = this.def;
      return this.clone(mergeDefs(def, {
        checks: [
          ...def.checks ?? [],
          ...chks.map((ch) => typeof ch === "function" ? { _zod: { check: ch, def: { check: "custom" }, onattach: [] } } : ch)
        ]
      }), { parent: true });
    },
    with(...chks) {
      return this.check(...chks);
    },
    clone(def, params) {
      return clone(this, def, params);
    },
    brand() {
      return this;
    },
    register(reg, meta) {
      reg.add(this, meta);
      return this;
    },
    refine(check, params) {
      return this.check(refine(check, params));
    },
    superRefine(refinement, params) {
      return this.check(superRefine(refinement, params));
    },
    overwrite(fn) {
      return this.check(_overwrite(fn));
    },
    optional() {
      return optional(this);
    },
    exactOptional() {
      return exactOptional(this);
    },
    nullable() {
      return nullable(this);
    },
    nullish() {
      return optional(nullable(this));
    },
    nonoptional(params) {
      return nonoptional(this, params);
    },
    array() {
      return array(this);
    },
    or(arg) {
      return union([this, arg]);
    },
    and(arg) {
      return intersection(this, arg);
    },
    transform(tx) {
      return pipe(this, transform(tx));
    },
    default(d) {
      return _default(this, d);
    },
    prefault(d) {
      return prefault(this, d);
    },
    catch(params) {
      return _catch(this, params);
    },
    pipe(target) {
      return pipe(this, target);
    },
    readonly() {
      return readonly(this);
    },
    describe(description) {
      const cl = this.clone();
      globalRegistry.add(cl, { description });
      return cl;
    },
    meta(...args) {
      if (args.length === 0)
        return globalRegistry.get(this);
      const cl = this.clone();
      globalRegistry.add(cl, args[0]);
      return cl;
    },
    isOptional() {
      return this.safeParse(undefined).success;
    },
    isNullable() {
      return this.safeParse(null).success;
    },
    apply(fn) {
      return fn(this);
    }
  });
  Object.defineProperty(inst, "description", {
    get() {
      return globalRegistry.get(inst)?.description;
    },
    configurable: true
  });
  return inst;
});
var _ZodString = /* @__PURE__ */ $constructor("_ZodString", (inst, def) => {
  $ZodString.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => stringProcessor(inst, ctx, json, params);
  const bag = inst._zod.bag;
  inst.format = bag.format ?? null;
  inst.minLength = bag.minimum ?? null;
  inst.maxLength = bag.maximum ?? null;
  _installLazyMethods(inst, "_ZodString", {
    regex(...args) {
      return this.check(_regex(...args));
    },
    includes(...args) {
      return this.check(_includes(...args));
    },
    startsWith(...args) {
      return this.check(_startsWith(...args));
    },
    endsWith(...args) {
      return this.check(_endsWith(...args));
    },
    min(...args) {
      return this.check(_minLength(...args));
    },
    max(...args) {
      return this.check(_maxLength(...args));
    },
    length(...args) {
      return this.check(_length(...args));
    },
    nonempty(...args) {
      return this.check(_minLength(1, ...args));
    },
    lowercase(params) {
      return this.check(_lowercase(params));
    },
    uppercase(params) {
      return this.check(_uppercase(params));
    },
    trim() {
      return this.check(_trim());
    },
    normalize(...args) {
      return this.check(_normalize(...args));
    },
    toLowerCase() {
      return this.check(_toLowerCase());
    },
    toUpperCase() {
      return this.check(_toUpperCase());
    },
    slugify() {
      return this.check(_slugify());
    }
  });
});
var ZodString = /* @__PURE__ */ $constructor("ZodString", (inst, def) => {
  $ZodString.init(inst, def);
  _ZodString.init(inst, def);
  inst.email = (params) => inst.check(_email(ZodEmail, params));
  inst.url = (params) => inst.check(_url(ZodURL, params));
  inst.jwt = (params) => inst.check(_jwt(ZodJWT, params));
  inst.emoji = (params) => inst.check(_emoji2(ZodEmoji, params));
  inst.guid = (params) => inst.check(_guid(ZodGUID, params));
  inst.uuid = (params) => inst.check(_uuid(ZodUUID, params));
  inst.uuidv4 = (params) => inst.check(_uuidv4(ZodUUID, params));
  inst.uuidv6 = (params) => inst.check(_uuidv6(ZodUUID, params));
  inst.uuidv7 = (params) => inst.check(_uuidv7(ZodUUID, params));
  inst.nanoid = (params) => inst.check(_nanoid(ZodNanoID, params));
  inst.guid = (params) => inst.check(_guid(ZodGUID, params));
  inst.cuid = (params) => inst.check(_cuid(ZodCUID, params));
  inst.cuid2 = (params) => inst.check(_cuid2(ZodCUID2, params));
  inst.ulid = (params) => inst.check(_ulid(ZodULID, params));
  inst.base64 = (params) => inst.check(_base64(ZodBase64, params));
  inst.base64url = (params) => inst.check(_base64url(ZodBase64URL, params));
  inst.xid = (params) => inst.check(_xid(ZodXID, params));
  inst.ksuid = (params) => inst.check(_ksuid(ZodKSUID, params));
  inst.ipv4 = (params) => inst.check(_ipv4(ZodIPv4, params));
  inst.ipv6 = (params) => inst.check(_ipv6(ZodIPv6, params));
  inst.cidrv4 = (params) => inst.check(_cidrv4(ZodCIDRv4, params));
  inst.cidrv6 = (params) => inst.check(_cidrv6(ZodCIDRv6, params));
  inst.e164 = (params) => inst.check(_e164(ZodE164, params));
  inst.datetime = (params) => inst.check(datetime2(params));
  inst.date = (params) => inst.check(date2(params));
  inst.time = (params) => inst.check(time2(params));
  inst.duration = (params) => inst.check(duration2(params));
});
function string2(params) {
  return _string(ZodString, params);
}
var ZodStringFormat = /* @__PURE__ */ $constructor("ZodStringFormat", (inst, def) => {
  $ZodStringFormat.init(inst, def);
  _ZodString.init(inst, def);
});
var ZodEmail = /* @__PURE__ */ $constructor("ZodEmail", (inst, def) => {
  $ZodEmail.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodGUID = /* @__PURE__ */ $constructor("ZodGUID", (inst, def) => {
  $ZodGUID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodUUID = /* @__PURE__ */ $constructor("ZodUUID", (inst, def) => {
  $ZodUUID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodURL = /* @__PURE__ */ $constructor("ZodURL", (inst, def) => {
  $ZodURL.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodEmoji = /* @__PURE__ */ $constructor("ZodEmoji", (inst, def) => {
  $ZodEmoji.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodNanoID = /* @__PURE__ */ $constructor("ZodNanoID", (inst, def) => {
  $ZodNanoID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodCUID = /* @__PURE__ */ $constructor("ZodCUID", (inst, def) => {
  $ZodCUID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodCUID2 = /* @__PURE__ */ $constructor("ZodCUID2", (inst, def) => {
  $ZodCUID2.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodULID = /* @__PURE__ */ $constructor("ZodULID", (inst, def) => {
  $ZodULID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodXID = /* @__PURE__ */ $constructor("ZodXID", (inst, def) => {
  $ZodXID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodKSUID = /* @__PURE__ */ $constructor("ZodKSUID", (inst, def) => {
  $ZodKSUID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodIPv4 = /* @__PURE__ */ $constructor("ZodIPv4", (inst, def) => {
  $ZodIPv4.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodIPv6 = /* @__PURE__ */ $constructor("ZodIPv6", (inst, def) => {
  $ZodIPv6.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodCIDRv4 = /* @__PURE__ */ $constructor("ZodCIDRv4", (inst, def) => {
  $ZodCIDRv4.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodCIDRv6 = /* @__PURE__ */ $constructor("ZodCIDRv6", (inst, def) => {
  $ZodCIDRv6.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodBase64 = /* @__PURE__ */ $constructor("ZodBase64", (inst, def) => {
  $ZodBase64.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodBase64URL = /* @__PURE__ */ $constructor("ZodBase64URL", (inst, def) => {
  $ZodBase64URL.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodE164 = /* @__PURE__ */ $constructor("ZodE164", (inst, def) => {
  $ZodE164.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodJWT = /* @__PURE__ */ $constructor("ZodJWT", (inst, def) => {
  $ZodJWT.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodNumber = /* @__PURE__ */ $constructor("ZodNumber", (inst, def) => {
  $ZodNumber.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => numberProcessor(inst, ctx, json, params);
  _installLazyMethods(inst, "ZodNumber", {
    gt(value, params) {
      return this.check(_gt(value, params));
    },
    gte(value, params) {
      return this.check(_gte(value, params));
    },
    min(value, params) {
      return this.check(_gte(value, params));
    },
    lt(value, params) {
      return this.check(_lt(value, params));
    },
    lte(value, params) {
      return this.check(_lte(value, params));
    },
    max(value, params) {
      return this.check(_lte(value, params));
    },
    int(params) {
      return this.check(int(params));
    },
    safe(params) {
      return this.check(int(params));
    },
    positive(params) {
      return this.check(_gt(0, params));
    },
    nonnegative(params) {
      return this.check(_gte(0, params));
    },
    negative(params) {
      return this.check(_lt(0, params));
    },
    nonpositive(params) {
      return this.check(_lte(0, params));
    },
    multipleOf(value, params) {
      return this.check(_multipleOf(value, params));
    },
    step(value, params) {
      return this.check(_multipleOf(value, params));
    },
    finite() {
      return this;
    }
  });
  const bag = inst._zod.bag;
  inst.minValue = Math.max(bag.minimum ?? Number.NEGATIVE_INFINITY, bag.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null;
  inst.maxValue = Math.min(bag.maximum ?? Number.POSITIVE_INFINITY, bag.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null;
  inst.isInt = (bag.format ?? "").includes("int") || Number.isSafeInteger(bag.multipleOf ?? 0.5);
  inst.isFinite = true;
  inst.format = bag.format ?? null;
});
function number2(params) {
  return _number(ZodNumber, params);
}
var ZodNumberFormat = /* @__PURE__ */ $constructor("ZodNumberFormat", (inst, def) => {
  $ZodNumberFormat.init(inst, def);
  ZodNumber.init(inst, def);
});
function int(params) {
  return _int(ZodNumberFormat, params);
}
var ZodBoolean = /* @__PURE__ */ $constructor("ZodBoolean", (inst, def) => {
  $ZodBoolean.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => booleanProcessor(inst, ctx, json, params);
});
function boolean2(params) {
  return _boolean(ZodBoolean, params);
}
var ZodUnknown = /* @__PURE__ */ $constructor("ZodUnknown", (inst, def) => {
  $ZodUnknown.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => unknownProcessor(inst, ctx, json, params);
});
function unknown() {
  return _unknown(ZodUnknown);
}
var ZodNever = /* @__PURE__ */ $constructor("ZodNever", (inst, def) => {
  $ZodNever.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => neverProcessor(inst, ctx, json, params);
});
function never(params) {
  return _never(ZodNever, params);
}
var ZodArray = /* @__PURE__ */ $constructor("ZodArray", (inst, def) => {
  $ZodArray.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => arrayProcessor(inst, ctx, json, params);
  inst.element = def.element;
  _installLazyMethods(inst, "ZodArray", {
    min(n, params) {
      return this.check(_minLength(n, params));
    },
    nonempty(params) {
      return this.check(_minLength(1, params));
    },
    max(n, params) {
      return this.check(_maxLength(n, params));
    },
    length(n, params) {
      return this.check(_length(n, params));
    },
    unwrap() {
      return this.element;
    }
  });
});
function array(element, params) {
  return _array(ZodArray, element, params);
}
var ZodObject = /* @__PURE__ */ $constructor("ZodObject", (inst, def) => {
  $ZodObjectJIT.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => objectProcessor(inst, ctx, json, params);
  defineLazy(inst, "shape", () => {
    return def.shape;
  });
  _installLazyMethods(inst, "ZodObject", {
    keyof() {
      return _enum(Object.keys(this._zod.def.shape));
    },
    catchall(catchall) {
      return this.clone({ ...this._zod.def, catchall });
    },
    passthrough() {
      return this.clone({ ...this._zod.def, catchall: unknown() });
    },
    loose() {
      return this.clone({ ...this._zod.def, catchall: unknown() });
    },
    strict() {
      return this.clone({ ...this._zod.def, catchall: never() });
    },
    strip() {
      return this.clone({ ...this._zod.def, catchall: undefined });
    },
    extend(incoming) {
      return extend(this, incoming);
    },
    safeExtend(incoming) {
      return safeExtend(this, incoming);
    },
    merge(other) {
      return merge(this, other);
    },
    pick(mask) {
      return pick(this, mask);
    },
    omit(mask) {
      return omit(this, mask);
    },
    partial(...args) {
      return partial(ZodOptional, this, args[0]);
    },
    required(...args) {
      return required(ZodNonOptional, this, args[0]);
    }
  });
});
function object(shape, params) {
  const def = {
    type: "object",
    shape: shape ?? {},
    ...normalizeParams(params)
  };
  return new ZodObject(def);
}
var ZodUnion = /* @__PURE__ */ $constructor("ZodUnion", (inst, def) => {
  $ZodUnion.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => unionProcessor(inst, ctx, json, params);
  inst.options = def.options;
});
function union(options, params) {
  return new ZodUnion({
    type: "union",
    options,
    ...normalizeParams(params)
  });
}
var ZodIntersection = /* @__PURE__ */ $constructor("ZodIntersection", (inst, def) => {
  $ZodIntersection.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => intersectionProcessor(inst, ctx, json, params);
});
function intersection(left, right) {
  return new ZodIntersection({
    type: "intersection",
    left,
    right
  });
}
var ZodRecord = /* @__PURE__ */ $constructor("ZodRecord", (inst, def) => {
  $ZodRecord.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => recordProcessor(inst, ctx, json, params);
  inst.keyType = def.keyType;
  inst.valueType = def.valueType;
});
function record(keyType, valueType, params) {
  if (!valueType || !valueType._zod) {
    return new ZodRecord({
      type: "record",
      keyType: string2(),
      valueType: keyType,
      ...normalizeParams(valueType)
    });
  }
  return new ZodRecord({
    type: "record",
    keyType,
    valueType,
    ...normalizeParams(params)
  });
}
var ZodEnum = /* @__PURE__ */ $constructor("ZodEnum", (inst, def) => {
  $ZodEnum.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => enumProcessor(inst, ctx, json, params);
  inst.enum = def.entries;
  inst.options = Object.values(def.entries);
  const keys = new Set(Object.keys(def.entries));
  inst.extract = (values, params) => {
    const newEntries = {};
    for (const value of values) {
      if (keys.has(value)) {
        newEntries[value] = def.entries[value];
      } else
        throw new Error(`Key ${value} not found in enum`);
    }
    return new ZodEnum({
      ...def,
      checks: [],
      ...normalizeParams(params),
      entries: newEntries
    });
  };
  inst.exclude = (values, params) => {
    const newEntries = { ...def.entries };
    for (const value of values) {
      if (keys.has(value)) {
        delete newEntries[value];
      } else
        throw new Error(`Key ${value} not found in enum`);
    }
    return new ZodEnum({
      ...def,
      checks: [],
      ...normalizeParams(params),
      entries: newEntries
    });
  };
});
function _enum(values, params) {
  const entries = Array.isArray(values) ? Object.fromEntries(values.map((v) => [v, v])) : values;
  return new ZodEnum({
    type: "enum",
    entries,
    ...normalizeParams(params)
  });
}
var ZodTransform = /* @__PURE__ */ $constructor("ZodTransform", (inst, def) => {
  $ZodTransform.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => transformProcessor(inst, ctx, json, params);
  inst._zod.parse = (payload, _ctx) => {
    if (_ctx.direction === "backward") {
      throw new $ZodEncodeError(inst.constructor.name);
    }
    payload.addIssue = (issue2) => {
      if (typeof issue2 === "string") {
        payload.issues.push(issue(issue2, payload.value, def));
      } else {
        const _issue = issue2;
        if (_issue.fatal)
          _issue.continue = false;
        _issue.code ?? (_issue.code = "custom");
        _issue.input ?? (_issue.input = payload.value);
        _issue.inst ?? (_issue.inst = inst);
        payload.issues.push(issue(_issue));
      }
    };
    const output = def.transform(payload.value, payload);
    if (output instanceof Promise) {
      return output.then((output) => {
        payload.value = output;
        payload.fallback = true;
        return payload;
      });
    }
    payload.value = output;
    payload.fallback = true;
    return payload;
  };
});
function transform(fn) {
  return new ZodTransform({
    type: "transform",
    transform: fn
  });
}
var ZodOptional = /* @__PURE__ */ $constructor("ZodOptional", (inst, def) => {
  $ZodOptional.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function optional(innerType) {
  return new ZodOptional({
    type: "optional",
    innerType
  });
}
var ZodExactOptional = /* @__PURE__ */ $constructor("ZodExactOptional", (inst, def) => {
  $ZodExactOptional.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function exactOptional(innerType) {
  return new ZodExactOptional({
    type: "optional",
    innerType
  });
}
var ZodNullable = /* @__PURE__ */ $constructor("ZodNullable", (inst, def) => {
  $ZodNullable.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => nullableProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function nullable(innerType) {
  return new ZodNullable({
    type: "nullable",
    innerType
  });
}
var ZodDefault = /* @__PURE__ */ $constructor("ZodDefault", (inst, def) => {
  $ZodDefault.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => defaultProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
  inst.removeDefault = inst.unwrap;
});
function _default(innerType, defaultValue) {
  return new ZodDefault({
    type: "default",
    innerType,
    get defaultValue() {
      return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
    }
  });
}
var ZodPrefault = /* @__PURE__ */ $constructor("ZodPrefault", (inst, def) => {
  $ZodPrefault.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => prefaultProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function prefault(innerType, defaultValue) {
  return new ZodPrefault({
    type: "prefault",
    innerType,
    get defaultValue() {
      return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
    }
  });
}
var ZodNonOptional = /* @__PURE__ */ $constructor("ZodNonOptional", (inst, def) => {
  $ZodNonOptional.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => nonoptionalProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function nonoptional(innerType, params) {
  return new ZodNonOptional({
    type: "nonoptional",
    innerType,
    ...normalizeParams(params)
  });
}
var ZodCatch = /* @__PURE__ */ $constructor("ZodCatch", (inst, def) => {
  $ZodCatch.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => catchProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
  inst.removeCatch = inst.unwrap;
});
function _catch(innerType, catchValue) {
  return new ZodCatch({
    type: "catch",
    innerType,
    catchValue: typeof catchValue === "function" ? catchValue : () => catchValue
  });
}
var ZodPipe = /* @__PURE__ */ $constructor("ZodPipe", (inst, def) => {
  $ZodPipe.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => pipeProcessor(inst, ctx, json, params);
  inst.in = def.in;
  inst.out = def.out;
});
function pipe(in_, out) {
  return new ZodPipe({
    type: "pipe",
    in: in_,
    out
  });
}
var ZodReadonly = /* @__PURE__ */ $constructor("ZodReadonly", (inst, def) => {
  $ZodReadonly.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => readonlyProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function readonly(innerType) {
  return new ZodReadonly({
    type: "readonly",
    innerType
  });
}
var ZodCustom = /* @__PURE__ */ $constructor("ZodCustom", (inst, def) => {
  $ZodCustom.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => customProcessor(inst, ctx, json, params);
});
function refine(fn, _params = {}) {
  return _refine(ZodCustom, fn, _params);
}
function superRefine(fn, params) {
  return _superRefine(fn, params);
}
// node_modules/@hatch/space-sdk/index.ts
var ACTION_BRAND = "@hatch/space-sdk/action/v1";
function defineAction(spec) {
  return { __brand: ACTION_BRAND, ...spec };
}

// server/src/actions.ts
import { and, asc, desc, eq, inArray, isNull, or } from "drizzle-orm";

// server/src/schema.ts
import { integer as integer2, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
var users = sqliteTable("users", {
  id: integer2("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  passwordSalt: text("password_salt").notNull(),
  displayName: text("display_name").notNull(),
  createdAt: integer2("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date)
});
var sessions = sqliteTable("sessions", {
  id: integer2("id").primaryKey({ autoIncrement: true }),
  userId: integer2("user_id").notNull().references(() => users.id),
  tokenHash: text("token_hash").notNull().unique(),
  userAgent: text("user_agent"),
  createdAt: integer2("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date),
  expiresAt: integer2("expires_at", { mode: "timestamp_ms" }).notNull()
});
var profiles = sqliteTable("profiles", {
  userId: integer2("user_id").primaryKey().references(() => users.id),
  displayName: text("display_name").notNull(),
  dateOfBirth: text("date_of_birth"),
  heightCm: real("height_cm"),
  weightKg: real("weight_kg"),
  sex: text("sex", { enum: ["male", "female", "other"] }),
  activityLevel: text("activity_level", {
    enum: ["sedentary", "light", "moderate", "active", "very_active"]
  }),
  experience: text("experience", {
    enum: ["beginner", "intermediate", "advanced"]
  }),
  onboardingCompleted: integer2("onboarding_completed").notNull().default(0),
  createdAt: integer2("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date),
  updatedAt: integer2("updated_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date)
});
var userGoals = sqliteTable("user_goals", {
  userId: integer2("user_id").primaryKey().references(() => users.id),
  mainGoal: text("main_goal", {
    enum: ["muscle_gain", "fat_loss", "maintenance", "general_fitness", "strength"]
  }),
  targetWeightKg: real("target_weight_kg"),
  calorieTargetOverride: integer2("calorie_target_override"),
  updatedAt: integer2("updated_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date)
});
var userPreferences = sqliteTable("user_preferences", {
  userId: integer2("user_id").primaryKey().references(() => users.id),
  dietPreference: text("diet_preference", {
    enum: ["vegetarian", "vegan", "eggetarian", "non_vegetarian", "custom"]
  }),
  dietCustomNote: text("diet_custom_note"),
  allergies: text("allergies"),
  trainingDaysPerWeek: integer2("training_days_per_week"),
  equipment: text("equipment", {
    enum: ["full_gym", "home_equipment", "bodyweight", "custom"]
  }),
  equipmentCustomNote: text("equipment_custom_note"),
  units: text("units", { enum: ["metric", "imperial"] }).notNull().default("metric"),
  waterTargetMl: integer2("water_target_ml"),
  notifyMeals: integer2("notify_meals").notNull().default(0),
  notifyWater: integer2("notify_water").notNull().default(0),
  notifyWorkouts: integer2("notify_workouts").notNull().default(0),
  profilePrivate: integer2("profile_private").notNull().default(1),
  updatedAt: integer2("updated_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date)
});
var foods = sqliteTable("foods", {
  id: integer2("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  aliases: text("aliases").notNull().default(""),
  category: text("category").notNull(),
  cuisine: text("cuisine").notNull(),
  dietFlag: text("diet_flag", {
    enum: ["veg", "vegan", "eggetarian", "non_veg"]
  }).notNull(),
  kcalPer100: real("kcal_per100").notNull(),
  proteinPer100: real("protein_per100").notNull(),
  carbsPer100: real("carbs_per100").notNull(),
  fatPer100: real("fat_per100").notNull(),
  fibrePer100: real("fibre_per100").notNull(),
  servingName: text("serving_name").notNull(),
  servingGrams: real("serving_grams").notNull(),
  source: text("source").notNull(),
  verification: text("verification", {
    enum: ["estimate", "verified", "user"]
  }).notNull().default("estimate"),
  notes: text("notes"),
  ownerUserId: integer2("owner_user_id").references(() => users.id),
  createdAt: integer2("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date)
});
var diaryEntries = sqliteTable("diary_entries", {
  id: integer2("id").primaryKey({ autoIncrement: true }),
  userId: integer2("user_id").notNull().references(() => users.id),
  foodId: integer2("food_id").references(() => foods.id),
  loggedOn: text("logged_on").notNull(),
  meal: text("meal", {
    enum: ["breakfast", "lunch", "snacks", "dinner", "custom"]
  }).notNull(),
  quantityGrams: real("quantity_grams").notNull(),
  servings: real("servings"),
  foodName: text("food_name").notNull(),
  kcalPer100: real("kcal_per100").notNull(),
  proteinPer100: real("protein_per100").notNull(),
  carbsPer100: real("carbs_per100").notNull(),
  fatPer100: real("fat_per100").notNull(),
  fibrePer100: real("fibre_per100").notNull(),
  servingName: text("serving_name").notNull(),
  servingGrams: real("serving_grams").notNull(),
  clientKey: text("client_key"),
  createdAt: integer2("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date)
});
var favouriteFoods = sqliteTable("favourite_foods", {
  id: integer2("id").primaryKey({ autoIncrement: true }),
  userId: integer2("user_id").notNull().references(() => users.id),
  foodId: integer2("food_id").notNull().references(() => foods.id),
  createdAt: integer2("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date)
});
var exercises = sqliteTable("exercises", {
  id: integer2("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  primaryMuscle: text("primary_muscle").notNull(),
  secondaryMuscles: text("secondary_muscles").notNull().default(""),
  equipment: text("equipment").notNull(),
  difficulty: text("difficulty", {
    enum: ["beginner", "intermediate", "advanced"]
  }).notNull(),
  pattern: text("pattern").notNull(),
  kind: text("kind", { enum: ["weighted", "bodyweight", "timed"] }).notNull().default("weighted"),
  instructions: text("instructions").notNull(),
  mistakes: text("mistakes").notNull(),
  suggestedSets: integer2("suggested_sets").notNull(),
  suggestedReps: text("suggested_reps").notNull(),
  restSeconds: integer2("rest_seconds").notNull(),
  createdAt: integer2("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date)
});
var routines = sqliteTable("routines", {
  id: integer2("id").primaryKey({ autoIncrement: true }),
  userId: integer2("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  notes: text("notes"),
  sourceTemplate: text("source_template"),
  createdAt: integer2("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date),
  updatedAt: integer2("updated_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date)
});
var routineExercises = sqliteTable("routine_exercises", {
  id: integer2("id").primaryKey({ autoIncrement: true }),
  routineId: integer2("routine_id").notNull().references(() => routines.id),
  exerciseId: integer2("exercise_id").notNull().references(() => exercises.id),
  position: integer2("position").notNull(),
  targetSets: integer2("target_sets").notNull(),
  targetReps: text("target_reps").notNull(),
  restSeconds: integer2("rest_seconds").notNull(),
  notes: text("notes")
});
var workoutSessions = sqliteTable("workout_sessions", {
  id: integer2("id").primaryKey({ autoIncrement: true }),
  userId: integer2("user_id").notNull().references(() => users.id),
  routineId: integer2("routine_id").references(() => routines.id),
  title: text("title").notNull(),
  status: text("status", { enum: ["in_progress", "completed"] }).notNull().default("in_progress"),
  startedOn: text("started_on").notNull(),
  startedAt: integer2("started_at", { mode: "timestamp_ms" }).notNull(),
  endedAt: integer2("ended_at", { mode: "timestamp_ms" }),
  durationSeconds: integer2("duration_seconds"),
  notes: text("notes"),
  createdAt: integer2("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date)
});
var sessionExercises = sqliteTable("session_exercises", {
  id: integer2("id").primaryKey({ autoIncrement: true }),
  sessionId: integer2("session_id").notNull().references(() => workoutSessions.id),
  exerciseId: integer2("exercise_id").notNull().references(() => exercises.id),
  position: integer2("position").notNull(),
  exerciseName: text("exercise_name").notNull(),
  primaryMuscle: text("primary_muscle").notNull(),
  kind: text("kind", { enum: ["weighted", "bodyweight", "timed"] }).notNull(),
  restSeconds: integer2("rest_seconds").notNull(),
  skipped: integer2("skipped").notNull().default(0),
  notes: text("notes")
});
var workoutSets = sqliteTable("workout_sets", {
  id: integer2("id").primaryKey({ autoIncrement: true }),
  sessionExerciseId: integer2("session_exercise_id").notNull().references(() => sessionExercises.id),
  setNumber: integer2("set_number").notNull(),
  reps: integer2("reps"),
  loadKg: real("load_kg"),
  durationSeconds: integer2("duration_seconds"),
  completed: integer2("completed").notNull().default(0),
  createdAt: integer2("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date)
});
var weightLogs = sqliteTable("weight_logs", {
  id: integer2("id").primaryKey({ autoIncrement: true }),
  userId: integer2("user_id").notNull().references(() => users.id),
  weightKg: real("weight_kg").notNull(),
  loggedOn: text("logged_on").notNull(),
  createdAt: integer2("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date)
});
var measurements = sqliteTable("measurements", {
  id: integer2("id").primaryKey({ autoIncrement: true }),
  userId: integer2("user_id").notNull().references(() => users.id),
  loggedOn: text("logged_on").notNull(),
  waistCm: real("waist_cm"),
  chestCm: real("chest_cm"),
  armCm: real("arm_cm"),
  thighCm: real("thigh_cm"),
  hipCm: real("hip_cm"),
  neckCm: real("neck_cm"),
  createdAt: integer2("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date)
});
var waterEntries = sqliteTable("water_entries", {
  id: integer2("id").primaryKey({ autoIncrement: true }),
  userId: integer2("user_id").notNull().references(() => users.id),
  loggedOn: text("logged_on").notNull(),
  amountMl: integer2("amount_ml").notNull(),
  clientKey: text("client_key"),
  createdAt: integer2("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date)
});
var recipes = sqliteTable("recipes", {
  id: integer2("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  category: text("category", {
    enum: ["breakfast", "lunch", "dinner", "snacks"]
  }).notNull(),
  dietFlag: text("diet_flag", {
    enum: ["veg", "vegan", "eggetarian", "non_veg"]
  }).notNull(),
  servings: real("servings").notNull(),
  prepMinutes: integer2("prep_minutes").notNull(),
  cookMinutes: integer2("cook_minutes"),
  steps: text("steps").notNull().default(""),
  budget: integer2("budget").notNull().default(0),
  ownerUserId: integer2("owner_user_id").references(() => users.id),
  createdAt: integer2("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date)
});
var recipeIngredients = sqliteTable("recipe_ingredients", {
  id: integer2("id").primaryKey({ autoIncrement: true }),
  recipeId: integer2("recipe_id").notNull().references(() => recipes.id),
  foodId: integer2("food_id").references(() => foods.id),
  name: text("name").notNull(),
  quantityGrams: real("quantity_grams").notNull(),
  position: integer2("position").notNull()
});
var favouriteRecipes = sqliteTable("favourite_recipes", {
  id: integer2("id").primaryKey({ autoIncrement: true }),
  userId: integer2("user_id").notNull().references(() => users.id),
  recipeId: integer2("recipe_id").notNull().references(() => recipes.id),
  createdAt: integer2("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date)
});
var mealPlanEntries = sqliteTable("meal_plan_entries", {
  id: integer2("id").primaryKey({ autoIncrement: true }),
  userId: integer2("user_id").notNull().references(() => users.id),
  weekday: integer2("weekday").notNull(),
  meal: text("meal", {
    enum: ["breakfast", "lunch", "snacks", "dinner", "custom"]
  }).notNull(),
  recipeId: integer2("recipe_id").notNull().references(() => recipes.id),
  servings: real("servings").notNull().default(1),
  createdAt: integer2("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date)
});
var challenges = sqliteTable("challenges", {
  id: integer2("id").primaryKey({ autoIncrement: true }),
  userId: integer2("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  template: text("template"),
  totalDays: integer2("total_days").notNull(),
  startedOn: text("started_on").notNull(),
  status: text("status", { enum: ["active", "paused"] }).notNull().default("active"),
  createdAt: integer2("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date)
});
var challengeTasks = sqliteTable("challenge_tasks", {
  id: integer2("id").primaryKey({ autoIncrement: true }),
  challengeId: integer2("challenge_id").notNull().references(() => challenges.id),
  label: text("label").notNull(),
  position: integer2("position").notNull()
});
var challengeChecks = sqliteTable("challenge_checks", {
  id: integer2("id").primaryKey({ autoIncrement: true }),
  challengeId: integer2("challenge_id").notNull().references(() => challenges.id),
  taskId: integer2("task_id").notNull().references(() => challengeTasks.id),
  loggedOn: text("logged_on").notNull(),
  createdAt: integer2("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date)
});
var adminRoles = sqliteTable("admin_roles", {
  userId: integer2("user_id").primaryKey().references(() => users.id),
  grantMethod: text("grant_method").notNull(),
  grantedAt: integer2("granted_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date)
});
var adminAuditLog = sqliteTable("admin_audit_log", {
  id: integer2("id").primaryKey({ autoIncrement: true }),
  adminUserId: integer2("admin_user_id").notNull(),
  adminEmail: text("admin_email").notNull(),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: integer2("entity_id"),
  summary: text("summary").notNull(),
  createdAt: integer2("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date)
});
var challengeDayNotes = sqliteTable("challenge_day_notes", {
  id: integer2("id").primaryKey({ autoIncrement: true }),
  challengeId: integer2("challenge_id").notNull().references(() => challenges.id),
  loggedOn: text("logged_on").notNull(),
  note: text("note").notNull(),
  createdAt: integer2("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date)
});

// server/src/foods-seed.ts
var FOOD_SOURCE = "Standard reference values (IFCT-style). Home preparation varies — treat as an estimate.";
var SEED_FOODS = [
  { name: "Poha", aliases: "pohe, beaten rice, avalakki, chivda (cooked)", category: "Breakfast", cuisine: "Maharashtrian", dietFlag: "vegan", kcal: 130, protein: 2.4, carbs: 24, fat: 2.8, fibre: 1.2, servingName: "1 plate", servingGrams: 150, notes: "With onion, peanuts and oil tempering." },
  { name: "Upma", aliases: "rava upma, uppittu, suji upma", category: "Breakfast", cuisine: "South Indian", dietFlag: "vegan", kcal: 132, protein: 3.4, carbs: 21, fat: 3.8, fibre: 1.6, servingName: "1 plate", servingGrams: 150 },
  { name: "Idli", aliases: "idly, rice cake", category: "Breakfast", cuisine: "South Indian", dietFlag: "vegan", kcal: 138, protein: 4.2, carbs: 27, fat: 1.2, fibre: 1.4, servingName: "1 piece", servingGrams: 40 },
  { name: "Vegetable Daliya", aliases: "dalia, broken wheat porridge, lapsi (savoury)", category: "Breakfast", cuisine: "North Indian", dietFlag: "vegan", kcal: 96, protein: 3.2, carbs: 17, fat: 1.6, fibre: 3.4, servingName: "1 bowl", servingGrams: 200 },
  { name: "Oats Porridge (with milk)", aliases: "oatmeal, oats", category: "Breakfast", cuisine: "Pan-Indian", dietFlag: "veg", kcal: 96, protein: 3.9, carbs: 14, fat: 2.7, fibre: 1.7, servingName: "1 bowl", servingGrams: 200 },
  { name: "Aloo Paratha", aliases: "alu paratha, stuffed paratha", category: "Breakfast", cuisine: "Punjabi", dietFlag: "veg", kcal: 208, protein: 4.6, carbs: 30, fat: 7.8, fibre: 3.4, servingName: "1 paratha", servingGrams: 90, notes: "Pan-fried; ghee/oil used changes the fat a lot." },
  { name: "Methi Thepla", aliases: "thepla", category: "Breakfast", cuisine: "Gujarati", dietFlag: "vegan", kcal: 272, protein: 6.4, carbs: 38, fat: 10.5, fibre: 4.6, servingName: "1 thepla", servingGrams: 40 },
  { name: "Moong Dal Chilla", aliases: "moong cheela, pesarattu (no rice)", category: "Breakfast", cuisine: "North Indian", dietFlag: "vegan", kcal: 168, protein: 8.6, carbs: 21, fat: 5.4, fibre: 3.8, servingName: "1 chilla", servingGrams: 80 },
  { name: "Sabudana Khichdi", aliases: "sago khichdi, sabudana", category: "Breakfast", cuisine: "Maharashtrian", dietFlag: "vegan", kcal: 228, protein: 2.6, carbs: 36, fat: 8.2, fibre: 1.4, servingName: "1 plate", servingGrams: 150 },
  { name: "Bread (white), toasted", aliases: "toast, sandwich bread", category: "Breakfast", cuisine: "Pan-Indian", dietFlag: "veg", kcal: 270, protein: 8.5, carbs: 49, fat: 3.6, fibre: 2.4, servingName: "1 slice", servingGrams: 25 },
  { name: "Bread (whole wheat)", aliases: "brown bread", category: "Breakfast", cuisine: "Pan-Indian", dietFlag: "veg", kcal: 252, protein: 10, carbs: 43, fat: 3.4, fibre: 5.8, servingName: "1 slice", servingGrams: 25 },
  { name: "Roti / Chapati", aliases: "chapati, phulka, roti", category: "Breads & Rice", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 297, protein: 9.6, carbs: 54, fat: 3.9, fibre: 7.4, servingName: "1 roti", servingGrams: 30, notes: "Dry-roasted, no oil. With ghee smeared, add roughly 45 kcal per teaspoon of ghee." },
  { name: "Tandoori Roti", aliases: "tandoori roti", category: "Breads & Rice", cuisine: "North Indian", dietFlag: "vegan", kcal: 282, protein: 8.8, carbs: 54, fat: 2.4, fibre: 5.2, servingName: "1 roti", servingGrams: 40 },
  { name: "Naan (plain)", aliases: "naan", category: "Breads & Rice", cuisine: "North Indian", dietFlag: "veg", kcal: 310, protein: 8.6, carbs: 54, fat: 6.2, fibre: 2.6, servingName: "1 naan", servingGrams: 90 },
  { name: "Butter Naan", aliases: "naan with butter", category: "Breads & Rice", cuisine: "North Indian", dietFlag: "veg", kcal: 336, protein: 8.4, carbs: 52, fat: 10, fibre: 2.6, servingName: "1 naan", servingGrams: 95 },
  { name: "Paratha (plain)", aliases: "plain paratha, layered paratha", category: "Breads & Rice", cuisine: "North Indian", dietFlag: "veg", kcal: 325, protein: 6.8, carbs: 44, fat: 13.4, fibre: 4.2, servingName: "1 paratha", servingGrams: 60, notes: "Oil/ghee used in layering varies widely." },
  { name: "Puri", aliases: "poori", category: "Breads & Rice", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 342, protein: 6.2, carbs: 44, fat: 15.6, fibre: 3.4, servingName: "1 puri", servingGrams: 20, notes: "Deep-fried; oil uptake varies." },
  { name: "Steamed Rice (cooked)", aliases: "cooked rice, plain rice, chawal", category: "Breads & Rice", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 130, protein: 2.7, carbs: 28, fat: 0.3, fibre: 0.4, servingName: "1 katori", servingGrams: 150 },
  { name: "Brown Rice (cooked)", aliases: "brown rice", category: "Breads & Rice", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 112, protein: 2.6, carbs: 23, fat: 0.9, fibre: 1.8, servingName: "1 katori", servingGrams: 150 },
  { name: "Jeera Rice", aliases: "cumin rice", category: "Breads & Rice", cuisine: "North Indian", dietFlag: "veg", kcal: 156, protein: 2.9, carbs: 27, fat: 4, fibre: 0.6, servingName: "1 katori", servingGrams: 150 },
  { name: "Vegetable Pulao", aliases: "veg pulao, pilaf", category: "Breads & Rice", cuisine: "North Indian", dietFlag: "veg", kcal: 148, protein: 3.6, carbs: 24, fat: 4.2, fibre: 1.8, servingName: "1 plate", servingGrams: 200 },
  { name: "Vegetable Biryani", aliases: "veg biryani, biriyani", category: "Breads & Rice", cuisine: "North Indian", dietFlag: "veg", kcal: 164, protein: 4, carbs: 24, fat: 5.8, fibre: 2, servingName: "1 plate", servingGrams: 250, notes: "Oil and fried-onion topping vary a lot between kitchens." },
  { name: "Khichdi (moong dal)", aliases: "khichri, dal khichdi", category: "Breads & Rice", cuisine: "Pan-Indian", dietFlag: "veg", kcal: 118, protein: 4.4, carbs: 19, fat: 2.6, fibre: 2.2, servingName: "1 bowl", servingGrams: 250 },
  { name: "Curd Rice", aliases: "dahi chawal, thayir sadam", category: "Breads & Rice", cuisine: "South Indian", dietFlag: "veg", kcal: 108, protein: 3.4, carbs: 16, fat: 3.2, fibre: 0.4, servingName: "1 bowl", servingGrams: 200 },
  { name: "Lemon Rice", aliases: "nimbu chawal, chitranna", category: "Breads & Rice", cuisine: "South Indian", dietFlag: "vegan", kcal: 168, protein: 3.2, carbs: 26, fat: 5.6, fibre: 1, servingName: "1 plate", servingGrams: 200 },
  { name: "Dal Tadka (cooked)", aliases: "arhar dal, toor dal tadka, dal fry", category: "Dal & Legumes", cuisine: "North Indian", dietFlag: "vegan", kcal: 104, protein: 5.8, carbs: 14, fat: 2.8, fibre: 3.6, servingName: "1 katori", servingGrams: 150, notes: "Ghee tadka raises the fat; values assume a light oil tempering." },
  { name: "Dal Makhani", aliases: "kali dal, black dal", category: "Dal & Legumes", cuisine: "Punjabi", dietFlag: "veg", kcal: 138, protein: 5.6, carbs: 13, fat: 7.2, fibre: 3.8, servingName: "1 katori", servingGrams: 150, notes: "Butter and cream content varies widely." },
  { name: "Rajma Curry", aliases: "rajma masala, kidney bean curry", category: "Dal & Legumes", cuisine: "Punjabi", dietFlag: "vegan", kcal: 112, protein: 6.2, carbs: 16, fat: 2.6, fibre: 5.2, servingName: "1 katori", servingGrams: 150 },
  { name: "Chole (cooked)", aliases: "chana masala, kabuli chana curry, chole masala", category: "Dal & Legumes", cuisine: "Punjabi", dietFlag: "vegan", kcal: 128, protein: 6.4, carbs: 18, fat: 3.6, fibre: 5.6, servingName: "1 katori", servingGrams: 150 },
  { name: "Sambar", aliases: "sambhar", category: "Dal & Legumes", cuisine: "South Indian", dietFlag: "vegan", kcal: 64, protein: 3, carbs: 8.6, fat: 2, fibre: 2.2, servingName: "1 katori", servingGrams: 150 },
  { name: "Moong Dal (cooked, plain)", aliases: "moong ki dal, split moong cooked", category: "Dal & Legumes", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 102, protein: 6.8, carbs: 15, fat: 1.6, fibre: 3.2, servingName: "1 katori", servingGrams: 150 },
  { name: "Sprouted Moong (cooked)", aliases: "moong sprouts, ankurit moong", category: "Dal & Legumes", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 98, protein: 7, carbs: 14, fat: 1.4, fibre: 4.4, servingName: "1 katori", servingGrams: 100 },
  { name: "Kadhi", aliases: "gujarati kadhi, punjabi kadhi (no pakoda)", category: "Dal & Legumes", cuisine: "Gujarati", dietFlag: "veg", kcal: 72, protein: 2.6, carbs: 7, fat: 3.6, fibre: 0.6, servingName: "1 katori", servingGrams: 150, notes: "Without pakodas. With pakodas, values rise sharply." },
  { name: "Paneer Butter Masala", aliases: "paneer makhani, paneer curry", category: "Sabzi & Curries", cuisine: "Punjabi", dietFlag: "veg", kcal: 168, protein: 6.4, carbs: 6.4, fat: 13, fibre: 1.2, servingName: "1 katori", servingGrams: 150, notes: "Gravy is butter/cream based — richer versions go well above this." },
  { name: "Palak Paneer", aliases: "spinach paneer", category: "Sabzi & Curries", cuisine: "North Indian", dietFlag: "veg", kcal: 116, protein: 6, carbs: 4.8, fat: 8.2, fibre: 2.4, servingName: "1 katori", servingGrams: 150 },
  { name: "Paneer Bhurji", aliases: "paneer scramble", category: "Sabzi & Curries", cuisine: "North Indian", dietFlag: "veg", kcal: 172, protein: 11.4, carbs: 4.6, fat: 12, fibre: 0.8, servingName: "1 katori", servingGrams: 120 },
  { name: "Soya Chunks Curry", aliases: "soya curry, nutri curry, meal maker curry", category: "Sabzi & Curries", cuisine: "North Indian", dietFlag: "vegan", kcal: 136, protein: 12.6, carbs: 8.4, fat: 5.8, fibre: 3.4, servingName: "1 katori", servingGrams: 150 },
  { name: "Aloo Gobi", aliases: "potato cauliflower sabzi", category: "Sabzi & Curries", cuisine: "North Indian", dietFlag: "vegan", kcal: 92, protein: 2.2, carbs: 11, fat: 4.4, fibre: 2.6, servingName: "1 katori", servingGrams: 150 },
  { name: "Bhindi Masala", aliases: "okra sabzi, bhindi ki sabzi", category: "Sabzi & Curries", cuisine: "North Indian", dietFlag: "vegan", kcal: 106, protein: 2.2, carbs: 7.6, fat: 7.6, fibre: 3.6, servingName: "1 katori", servingGrams: 120 },
  { name: "Baingan Bharta", aliases: "brinjal bharta, begun bhorta", category: "Sabzi & Curries", cuisine: "North Indian", dietFlag: "vegan", kcal: 88, protein: 1.8, carbs: 8, fat: 5.6, fibre: 3.2, servingName: "1 katori", servingGrams: 150 },
  { name: "Mixed Vegetable Sabzi", aliases: "mix veg, mixed veg curry", category: "Sabzi & Curries", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 86, protein: 2.4, carbs: 9.4, fat: 4.4, fibre: 3, servingName: "1 katori", servingGrams: 150 },
  { name: "Pav Bhaji (bhaji only)", aliases: "bhaji, bombay bhaji", category: "Sabzi & Curries", cuisine: "Maharashtrian", dietFlag: "veg", kcal: 142, protein: 3.2, carbs: 14, fat: 8.2, fibre: 3.4, servingName: "1 plate bhaji", servingGrams: 200, notes: "Bhaji only — log the pav separately. Butter on top adds up fast." },
  { name: "Undhiyu", aliases: "undhiya, gujarati mixed veg", category: "Sabzi & Curries", cuisine: "Gujarati", dietFlag: "vegan", kcal: 148, protein: 3.8, carbs: 15, fat: 8.2, fibre: 4.6, servingName: "1 katori", servingGrams: 150 },
  { name: "Misal (sprouts curry)", aliases: "misal, usal", category: "Sabzi & Curries", cuisine: "Maharashtrian", dietFlag: "vegan", kcal: 152, protein: 7.4, carbs: 17, fat: 6.2, fibre: 5, servingName: "1 bowl", servingGrams: 200, notes: "Without farsan topping and pav — log those separately." },
  { name: "Dhokla", aliases: "khaman dhokla, khaman", category: "Sabzi & Curries", cuisine: "Gujarati", dietFlag: "vegan", kcal: 112, protein: 4.6, carbs: 17, fat: 2.8, fibre: 1.6, servingName: "1 piece", servingGrams: 40 },
  { name: "Masala Dosa", aliases: "mysore masala dosa, dosa with aloo", category: "South Indian", cuisine: "South Indian", dietFlag: "vegan", kcal: 168, protein: 3.8, carbs: 25, fat: 5.8, fibre: 2, servingName: "1 dosa", servingGrams: 180, notes: "Includes potato filling; ghee roast versions are higher in fat." },
  { name: "Plain Dosa", aliases: "sada dosa, dosai", category: "South Indian", cuisine: "South Indian", dietFlag: "vegan", kcal: 214, protein: 4.4, carbs: 32, fat: 7.4, fibre: 1.4, servingName: "1 dosa", servingGrams: 100 },
  { name: "Rava Dosa", aliases: "rava dosai, semolina dosa", category: "South Indian", cuisine: "South Indian", dietFlag: "vegan", kcal: 238, protein: 4.6, carbs: 33, fat: 9.6, fibre: 1.2, servingName: "1 dosa", servingGrams: 100 },
  { name: "Medu Vada", aliases: "vada, ulundu vadai, garelu", category: "South Indian", cuisine: "South Indian", dietFlag: "vegan", kcal: 332, protein: 9.4, carbs: 31, fat: 18.6, fibre: 3.4, servingName: "1 vada", servingGrams: 35, notes: "Deep-fried; oil uptake varies." },
  { name: "Uttapam (onion)", aliases: "uttappa, onion uttapam", category: "South Indian", cuisine: "South Indian", dietFlag: "vegan", kcal: 186, protein: 4.2, carbs: 27, fat: 6.6, fibre: 1.8, servingName: "1 uttapam", servingGrams: 130 },
  { name: "Pongal", aliases: "ven pongal, khara pongal", category: "South Indian", cuisine: "South Indian", dietFlag: "veg", kcal: 146, protein: 4.8, carbs: 20, fat: 5.2, fibre: 1.6, servingName: "1 bowl", servingGrams: 200 },
  { name: "Appam", aliases: "hoppers, aappam", category: "South Indian", cuisine: "South Indian", dietFlag: "vegan", kcal: 118, protein: 2, carbs: 24, fat: 1.4, fibre: 0.6, servingName: "1 appam", servingGrams: 60 },
  { name: "Rasam", aliases: "tomato rasam, charu", category: "South Indian", cuisine: "South Indian", dietFlag: "vegan", kcal: 32, protein: 1.2, carbs: 3.8, fat: 1.4, fibre: 0.8, servingName: "1 katori", servingGrams: 150 },
  { name: "Coconut Chutney", aliases: "nariyal chutney, thengai chutney", category: "South Indian", cuisine: "South Indian", dietFlag: "vegan", kcal: 196, protein: 2.4, carbs: 6.4, fat: 18.4, fibre: 3, servingName: "2 tbsp", servingGrams: 30 },
  { name: "Vada Pav", aliases: "vada pao, bombay burger", category: "Street Food & Snacks", cuisine: "Maharashtrian", dietFlag: "vegan", kcal: 286, protein: 5.6, carbs: 39, fat: 11.8, fibre: 2.8, servingName: "1 vada pav", servingGrams: 140, notes: "Whole sandwich: pav + batata vada + chutneys." },
  { name: "Samosa", aliases: "aloo samosa", category: "Street Food & Snacks", cuisine: "North Indian", dietFlag: "vegan", kcal: 262, protein: 4.2, carbs: 30, fat: 13.8, fibre: 2.6, servingName: "1 samosa", servingGrams: 100, notes: "Deep-fried; size and oil uptake vary a lot." },
  { name: "Bhel Puri", aliases: "bhel, bhelpuri", category: "Street Food & Snacks", cuisine: "Maharashtrian", dietFlag: "vegan", kcal: 158, protein: 3.6, carbs: 26, fat: 4.6, fibre: 2.4, servingName: "1 plate", servingGrams: 120 },
  { name: "Sev Puri", aliases: "sev poori", category: "Street Food & Snacks", cuisine: "Maharashtrian", dietFlag: "vegan", kcal: 238, protein: 4.8, carbs: 30, fat: 11, fibre: 2.6, servingName: "1 plate (6 puri)", servingGrams: 120 },
  { name: "Pani Puri", aliases: "golgappa, puchka, gupchup", category: "Street Food & Snacks", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 152, protein: 3.4, carbs: 23, fat: 5.2, fibre: 2.2, servingName: "1 plate (6 puri)", servingGrams: 130 },
  { name: "Dabeli", aliases: "kutchi dabeli", category: "Street Food & Snacks", cuisine: "Gujarati", dietFlag: "vegan", kcal: 224, protein: 4.4, carbs: 34, fat: 7.8, fibre: 2.6, servingName: "1 dabeli", servingGrams: 110 },
  { name: "Aloo Tikki", aliases: "potato tikki, tikki chaat base", category: "Street Food & Snacks", cuisine: "North Indian", dietFlag: "vegan", kcal: 242, protein: 3, carbs: 27, fat: 13.6, fibre: 2.4, servingName: "1 tikki", servingGrams: 60, notes: "Shallow/deep fried; without curd and chutneys." },
  { name: "Onion Pakora", aliases: "pakoda, bhajiya, onion bhaji", category: "Street Food & Snacks", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 292, protein: 5.4, carbs: 24, fat: 19.4, fibre: 3.2, servingName: "1 plate", servingGrams: 80, notes: "Deep-fried; oil uptake varies." },
  { name: "Roasted Makhana", aliases: "fox nuts, lotus seeds, phool makhana", category: "Street Food & Snacks", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 348, protein: 9.7, carbs: 77, fat: 0.1, fibre: 14.5, servingName: "1 bowl", servingGrams: 30, notes: "Plain roasted. Ghee-roasted adds roughly 45 kcal per teaspoon of ghee used." },
  { name: "Roasted Chana", aliases: "bhuna chana, roasted gram", category: "Street Food & Snacks", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 392, protein: 19.4, carbs: 58, fat: 9.2, fibre: 16.8, servingName: "1 handful", servingGrams: 40 },
  { name: "Khakhra", aliases: "khakhra (plain)", category: "Street Food & Snacks", cuisine: "Gujarati", dietFlag: "vegan", kcal: 402, protein: 9.8, carbs: 62, fat: 12.6, fibre: 5.4, servingName: "1 khakhra", servingGrams: 15 },
  { name: "Namkeen Mixture", aliases: "mixture, farsan, chivda mixture", category: "Street Food & Snacks", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 528, protein: 9.4, carbs: 44, fat: 34.8, fibre: 4.2, servingName: "1 small bowl", servingGrams: 40, notes: "Fried snack mixes vary widely by brand and recipe." },
  { name: "Milk (toned)", aliases: "toned milk, doodh", category: "Dairy & Eggs", cuisine: "Pan-Indian", dietFlag: "veg", kcal: 62, protein: 3.2, carbs: 4.8, fat: 3.3, fibre: 0, servingName: "1 glass (200 ml)", servingGrams: 200 },
  { name: "Milk (full cream)", aliases: "full cream milk, whole milk", category: "Dairy & Eggs", cuisine: "Pan-Indian", dietFlag: "veg", kcal: 68, protein: 3.3, carbs: 4.9, fat: 3.9, fibre: 0, servingName: "1 glass (200 ml)", servingGrams: 200 },
  { name: "Milk (skimmed)", aliases: "skim milk, double toned", category: "Dairy & Eggs", cuisine: "Pan-Indian", dietFlag: "veg", kcal: 35, protein: 3.4, carbs: 5, fat: 0.1, fibre: 0, servingName: "1 glass (200 ml)", servingGrams: 200 },
  { name: "Curd (dahi)", aliases: "dahi, yogurt, plain curd", category: "Dairy & Eggs", cuisine: "Pan-Indian", dietFlag: "veg", kcal: 62, protein: 3.1, carbs: 4.7, fat: 3.3, fibre: 0, servingName: "1 katori", servingGrams: 100 },
  { name: "Greek Yogurt (plain)", aliases: "greek yoghurt, hung curd (approx)", category: "Dairy & Eggs", cuisine: "Pan-Indian", dietFlag: "veg", kcal: 97, protein: 9, carbs: 3.6, fat: 5, fibre: 0, servingName: "1 cup", servingGrams: 150, notes: "Plain, unsweetened. Flavoured versions carry added sugar." },
  { name: "Paneer", aliases: "cottage cheese, fresh paneer", category: "Dairy & Eggs", cuisine: "Pan-Indian", dietFlag: "veg", kcal: 265, protein: 18.3, carbs: 3.6, fat: 20.8, fibre: 0, servingName: "1 serving (cubes)", servingGrams: 50, notes: "Whole-milk paneer. Low-fat paneer is leaner." },
  { name: "Chaas (buttermilk)", aliases: "buttermilk, masala chaas, taak", category: "Dairy & Eggs", cuisine: "Pan-Indian", dietFlag: "veg", kcal: 26, protein: 1.6, carbs: 3, fat: 0.8, fibre: 0, servingName: "1 glass (200 ml)", servingGrams: 200 },
  { name: "Sweet Lassi", aliases: "lassi, punjabi lassi", category: "Dairy & Eggs", cuisine: "Punjabi", dietFlag: "veg", kcal: 96, protein: 3.2, carbs: 13.4, fat: 3.4, fibre: 0, servingName: "1 glass (200 ml)", servingGrams: 200, notes: "Sugar content varies by shop." },
  { name: "Cheese Slice (processed)", aliases: "cheese slice, processed cheese", category: "Dairy & Eggs", cuisine: "Pan-Indian", dietFlag: "veg", kcal: 302, protein: 16.8, carbs: 4.6, fat: 24, fibre: 0, servingName: "1 slice", servingGrams: 20 },
  { name: "Ghee", aliases: "clarified butter, desi ghee", category: "Dairy & Eggs", cuisine: "Pan-Indian", dietFlag: "veg", kcal: 900, protein: 0, carbs: 0, fat: 99.7, fibre: 0, servingName: "1 tsp", servingGrams: 5 },
  { name: "Butter", aliases: "makhan, table butter", category: "Dairy & Eggs", cuisine: "Pan-Indian", dietFlag: "veg", kcal: 717, protein: 0.9, carbs: 0.1, fat: 81, fibre: 0, servingName: "1 tsp", servingGrams: 5 },
  { name: "Egg (boiled, whole)", aliases: "boiled egg, anda", category: "Dairy & Eggs", cuisine: "Pan-Indian", dietFlag: "eggetarian", kcal: 155, protein: 13.3, carbs: 1.1, fat: 10.6, fibre: 0, servingName: "1 egg", servingGrams: 50 },
  { name: "Egg White (boiled)", aliases: "egg white", category: "Dairy & Eggs", cuisine: "Pan-Indian", dietFlag: "eggetarian", kcal: 52, protein: 10.9, carbs: 0.7, fat: 0.2, fibre: 0, servingName: "1 white", servingGrams: 33 },
  { name: "Omelette (2 eggs)", aliases: "omelet, anda omelette", category: "Dairy & Eggs", cuisine: "Pan-Indian", dietFlag: "eggetarian", kcal: 184, protein: 11.8, carbs: 1.6, fat: 14.4, fibre: 0.2, servingName: "1 omelette", servingGrams: 110, notes: "Cooked in oil; amount of oil changes the fat." },
  { name: "Egg Bhurji", aliases: "anda bhurji, egg scramble indian", category: "Dairy & Eggs", cuisine: "Pan-Indian", dietFlag: "eggetarian", kcal: 176, protein: 11.2, carbs: 2.8, fat: 13.2, fibre: 0.6, servingName: "1 katori", servingGrams: 120 },
  { name: "Chicken Curry (home style)", aliases: "chicken masala, murgh curry", category: "Meat & Fish", cuisine: "North Indian", dietFlag: "non_veg", kcal: 158, protein: 15.2, carbs: 3.6, fat: 9.2, fibre: 0.8, servingName: "1 katori (with bone pieces)", servingGrams: 150, notes: "Meat + gravy mix; skin-on and oil change values." },
  { name: "Butter Chicken", aliases: "murgh makhani", category: "Meat & Fish", cuisine: "Punjabi", dietFlag: "non_veg", kcal: 174, protein: 12.4, carbs: 5.6, fat: 11.4, fibre: 0.8, servingName: "1 katori", servingGrams: 150, notes: "Butter/cream gravy — restaurant versions run higher." },
  { name: "Chicken Biryani", aliases: "murgh biryani", category: "Meat & Fish", cuisine: "North Indian", dietFlag: "non_veg", kcal: 178, protein: 7.8, carbs: 22, fat: 6.6, fibre: 1.2, servingName: "1 plate", servingGrams: 300 },
  { name: "Grilled Chicken Breast", aliases: "chicken breast grilled, tandoori breast", category: "Meat & Fish", cuisine: "Pan-Indian", dietFlag: "non_veg", kcal: 165, protein: 31, carbs: 0, fat: 3.6, fibre: 0, servingName: "1 breast piece", servingGrams: 120, notes: "Skinless, cooked weight." },
  { name: "Tandoori Chicken", aliases: "tandoori murgh", category: "Meat & Fish", cuisine: "Punjabi", dietFlag: "non_veg", kcal: 148, protein: 21.4, carbs: 2.4, fat: 5.6, fibre: 0.4, servingName: "1 leg piece", servingGrams: 130, notes: "Skinless pieces; with skin, fat is higher." },
  { name: "Egg Curry", aliases: "anda curry", category: "Meat & Fish", cuisine: "North Indian", dietFlag: "eggetarian", kcal: 142, protein: 7.6, carbs: 4.2, fat: 10.6, fibre: 0.8, servingName: "1 katori (2 eggs + gravy)", servingGrams: 160 },
  { name: "Fish Curry (rohu)", aliases: "macher jhol, rohu curry", category: "Meat & Fish", cuisine: "Bengali", dietFlag: "non_veg", kcal: 118, protein: 13.2, carbs: 2.8, fat: 5.8, fibre: 0.6, servingName: "1 katori (1 piece + gravy)", servingGrams: 150 },
  { name: "Mutton Curry", aliases: "gosht curry, mutton masala", category: "Meat & Fish", cuisine: "North Indian", dietFlag: "non_veg", kcal: 186, protein: 14.6, carbs: 3.2, fat: 12.8, fibre: 0.6, servingName: "1 katori", servingGrams: 150, notes: "Fat depends heavily on the cut and gravy oil." },
  { name: "Banana", aliases: "kela, robosta banana", category: "Fruits", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 89, protein: 1.1, carbs: 22.8, fat: 0.3, fibre: 2.6, servingName: "1 medium banana", servingGrams: 100 },
  { name: "Apple", aliases: "seb", category: "Fruits", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 52, protein: 0.3, carbs: 13.8, fat: 0.2, fibre: 2.4, servingName: "1 medium apple", servingGrams: 150 },
  { name: "Mango (ripe)", aliases: "aam, alphonso (approx)", category: "Fruits", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 60, protein: 0.8, carbs: 15, fat: 0.4, fibre: 1.6, servingName: "1 medium mango", servingGrams: 200 },
  { name: "Orange", aliases: "santra, nagpur orange", category: "Fruits", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 47, protein: 0.9, carbs: 11.8, fat: 0.1, fibre: 2.4, servingName: "1 orange", servingGrams: 130 },
  { name: "Papaya (ripe)", aliases: "papita", category: "Fruits", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 43, protein: 0.5, carbs: 10.8, fat: 0.3, fibre: 1.7, servingName: "1 bowl cubes", servingGrams: 150 },
  { name: "Guava", aliases: "amrood, peru", category: "Fruits", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 68, protein: 2.6, carbs: 14.3, fat: 1, fibre: 5.4, servingName: "1 guava", servingGrams: 100 },
  { name: "Pomegranate", aliases: "anar, dalimb", category: "Fruits", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 83, protein: 1.7, carbs: 18.7, fat: 1.2, fibre: 4, servingName: "1 fruit (arils)", servingGrams: 150 },
  { name: "Watermelon", aliases: "tarbooj, tarbuj", category: "Fruits", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 30, protein: 0.6, carbs: 7.6, fat: 0.2, fibre: 0.4, servingName: "1 bowl cubes", servingGrams: 200 },
  { name: "Grapes", aliases: "angoor", category: "Fruits", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 69, protein: 0.7, carbs: 18.1, fat: 0.2, fibre: 0.9, servingName: "1 small bunch", servingGrams: 100 },
  { name: "Chikoo (sapota)", aliases: "sapota, chiku", category: "Fruits", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 83, protein: 0.4, carbs: 19.9, fat: 1.1, fibre: 5.3, servingName: "1 fruit", servingGrams: 80 },
  { name: "Potato (raw)", aliases: "aloo (raw)", category: "Vegetables", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 77, protein: 2, carbs: 17.5, fat: 0.1, fibre: 2.1, servingName: "1 medium potato", servingGrams: 100, notes: "Raw weight — cooked sabzi values differ with oil." },
  { name: "Onion (raw)", aliases: "pyaaz, kanda", category: "Vegetables", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fibre: 1.7, servingName: "1 medium onion", servingGrams: 70 },
  { name: "Tomato (raw)", aliases: "tamatar", category: "Vegetables", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fibre: 1.2, servingName: "1 medium tomato", servingGrams: 90 },
  { name: "Spinach (palak, raw)", aliases: "palak, spinach leaves", category: "Vegetables", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fibre: 2.2, servingName: "1 bunch", servingGrams: 100 },
  { name: "Cucumber", aliases: "kheera, kakdi", category: "Vegetables", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 15, protein: 0.7, carbs: 3.6, fat: 0.1, fibre: 0.5, servingName: "1 cucumber", servingGrams: 100 },
  { name: "Carrot (raw)", aliases: "gajar", category: "Vegetables", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 41, protein: 0.9, carbs: 9.6, fat: 0.2, fibre: 2.8, servingName: "1 carrot", servingGrams: 60 },
  { name: "Sweet Corn (boiled)", aliases: "makka, corn kernels", category: "Vegetables", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 96, protein: 3.4, carbs: 21, fat: 1.5, fibre: 2.4, servingName: "1 small bowl", servingGrams: 100 },
  { name: "Almonds", aliases: "badam", category: "Nuts, Seeds & Dry Fruits", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 579, protein: 21.2, carbs: 21.6, fat: 49.9, fibre: 12.5, servingName: "10 almonds", servingGrams: 12 },
  { name: "Cashews", aliases: "kaju", category: "Nuts, Seeds & Dry Fruits", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 553, protein: 18.2, carbs: 30.2, fat: 43.9, fibre: 3.3, servingName: "10 cashews", servingGrams: 15 },
  { name: "Walnuts", aliases: "akhrot", category: "Nuts, Seeds & Dry Fruits", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 654, protein: 15.2, carbs: 13.7, fat: 65.2, fibre: 6.7, servingName: "4 halves", servingGrams: 12 },
  { name: "Peanuts (roasted)", aliases: "moongphali, groundnuts roasted", category: "Nuts, Seeds & Dry Fruits", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 567, protein: 25.8, carbs: 16.1, fat: 49.2, fibre: 8.5, servingName: "1 handful", servingGrams: 30 },
  { name: "Raisins", aliases: "kishmish, manuka", category: "Nuts, Seeds & Dry Fruits", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 299, protein: 3.1, carbs: 79.2, fat: 0.5, fibre: 3.7, servingName: "1 tbsp", servingGrams: 15 },
  { name: "Dates (dried)", aliases: "khajoor, khajur", category: "Nuts, Seeds & Dry Fruits", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 282, protein: 2.5, carbs: 75, fat: 0.4, fibre: 8, servingName: "3 dates", servingGrams: 24 },
  { name: "Flax Seeds", aliases: "alsi, linseed", category: "Nuts, Seeds & Dry Fruits", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 534, protein: 18.3, carbs: 28.9, fat: 42.2, fibre: 27.3, servingName: "1 tbsp", servingGrams: 10 },
  { name: "Chia Seeds", aliases: "chia", category: "Nuts, Seeds & Dry Fruits", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 486, protein: 16.5, carbs: 42.1, fat: 30.7, fibre: 34.4, servingName: "1 tbsp", servingGrams: 12 },
  { name: "Pumpkin Seeds", aliases: "kaddu ke beej", category: "Nuts, Seeds & Dry Fruits", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 559, protein: 30.2, carbs: 10.7, fat: 49, fibre: 6, servingName: "1 tbsp", servingGrams: 12 },
  { name: "Peanut Butter", aliases: "peanut butter (unsweetened)", category: "Nuts, Seeds & Dry Fruits", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 588, protein: 25.1, carbs: 19.6, fat: 50, fibre: 6, servingName: "1 tbsp", servingGrams: 16, notes: "Unsweetened. Sweetened spreads carry added sugar and oil." },
  { name: "Jalebi", aliases: "jilebi, imarti (similar)", category: "Sweets & Desserts", cuisine: "Pan-Indian", dietFlag: "veg", kcal: 412, protein: 1.8, carbs: 68, fat: 15.2, fibre: 0.4, servingName: "2 pieces", servingGrams: 50, notes: "Fried and syrup-soaked — among the most variable sweets." },
  { name: "Gulab Jamun", aliases: "gulab jamoon", category: "Sweets & Desserts", cuisine: "Pan-Indian", dietFlag: "veg", kcal: 382, protein: 4.4, carbs: 56, fat: 15.8, fibre: 0.6, servingName: "1 piece", servingGrams: 40 },
  { name: "Rasgulla", aliases: "rosogolla", category: "Sweets & Desserts", cuisine: "Bengali", dietFlag: "veg", kcal: 124, protein: 3.8, carbs: 22.4, fat: 2.2, fibre: 0, servingName: "1 piece", servingGrams: 50, notes: "Squeezed of excess syrup." },
  { name: "Kaju Katli", aliases: "kaju barfi", category: "Sweets & Desserts", cuisine: "Pan-Indian", dietFlag: "veg", kcal: 508, protein: 8.2, carbs: 56, fat: 28.4, fibre: 1.4, servingName: "1 piece", servingGrams: 12 },
  { name: "Besan Ladoo", aliases: "besan laddu", category: "Sweets & Desserts", cuisine: "Pan-Indian", dietFlag: "veg", kcal: 468, protein: 7.4, carbs: 54, fat: 25.2, fibre: 3.2, servingName: "1 ladoo", servingGrams: 30 },
  { name: "Sandesh", aliases: "sondesh", category: "Sweets & Desserts", cuisine: "Bengali", dietFlag: "veg", kcal: 148, protein: 6.8, carbs: 18.4, fat: 5.4, fibre: 0, servingName: "1 piece", servingGrams: 30 },
  { name: "Masala Chai (with milk & sugar)", aliases: "chai, tea, cutting chai", category: "Drinks", cuisine: "Pan-Indian", dietFlag: "veg", kcal: 46, protein: 1.4, carbs: 6.8, fat: 1.5, fibre: 0, servingName: "1 cup (150 ml)", servingGrams: 150, notes: "Assumes roughly 2 tsp sugar per cup. Unsweetened is about half the calories." },
  { name: "Filter Coffee (with milk & sugar)", aliases: "filter coffee, kaapi", category: "Drinks", cuisine: "South Indian", dietFlag: "veg", kcal: 52, protein: 1.6, carbs: 8.2, fat: 1.5, fibre: 0, servingName: "1 tumbler (150 ml)", servingGrams: 150 },
  { name: "Coconut Water", aliases: "nariyal pani, elaneer", category: "Drinks", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 19, protein: 0.7, carbs: 3.7, fat: 0.2, fibre: 1.1, servingName: "1 glass (250 ml)", servingGrams: 250 },
  { name: "Sugarcane Juice", aliases: "ganne ka ras", category: "Drinks", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 58, protein: 0.2, carbs: 14.6, fat: 0.1, fibre: 0.2, servingName: "1 glass (250 ml)", servingGrams: 250 },
  { name: "Orange Juice (fresh, unsweetened)", aliases: "orange juice", category: "Drinks", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 45, protein: 0.7, carbs: 10.4, fat: 0.2, fibre: 0.2, servingName: "1 glass (200 ml)", servingGrams: 200 },
  { name: "Nimbu Pani (sweetened)", aliases: "shikanji, lemonade", category: "Drinks", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 24, protein: 0.1, carbs: 6.2, fat: 0, fibre: 0.1, servingName: "1 glass (250 ml)", servingGrams: 250, notes: "Salted/unsweetened nimbu pani is near zero calories." },
  { name: "Rice (raw, milled)", aliases: "raw rice, uncooked rice, chawal (raw)", category: "Raw Ingredients", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 360, protein: 6.8, carbs: 78.2, fat: 0.5, fibre: 2.8, servingName: "1 katori raw", servingGrams: 60, notes: "Raw weight. Cooked rice is roughly one-third of these values per 100 g." },
  { name: "Whole Wheat Flour (atta)", aliases: "atta, gehun ka atta, wheat flour", category: "Raw Ingredients", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 341, protein: 12.1, carbs: 69.4, fat: 1.7, fibre: 11.2, servingName: "1 cup", servingGrams: 120 },
  { name: "Toor Dal (raw)", aliases: "arhar dal raw, tur dal uncooked", category: "Raw Ingredients", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 335, protein: 22.3, carbs: 57.6, fat: 1.7, fibre: 15.2, servingName: "1 katori raw", servingGrams: 50, notes: "Raw weight. Cooked dal is roughly one-third of these values per 100 g." },
  { name: "Moong Dal (raw, split)", aliases: "moong dal uncooked, split green gram", category: "Raw Ingredients", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 347, protein: 24.5, carbs: 59.9, fat: 1.2, fibre: 16.3, servingName: "1 katori raw", servingGrams: 50 },
  { name: "Chana Dal (raw)", aliases: "bengal gram dal uncooked", category: "Raw Ingredients", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 360, protein: 20.8, carbs: 59.8, fat: 5.6, fibre: 17.4, servingName: "1 katori raw", servingGrams: 50 },
  { name: "Kabuli Chana (raw)", aliases: "white chickpeas uncooked, chole raw", category: "Raw Ingredients", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 364, protein: 19.3, carbs: 60.9, fat: 6, fibre: 17.4, servingName: "1 katori raw", servingGrams: 50 },
  { name: "Rajma (raw)", aliases: "kidney beans uncooked", category: "Raw Ingredients", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 333, protein: 23.6, carbs: 60, fat: 0.8, fibre: 24.9, servingName: "1 katori raw", servingGrams: 50 },
  { name: "Soya Chunks (dry)", aliases: "soya granules, nutri nuggets, meal maker dry", category: "Raw Ingredients", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 345, protein: 52, carbs: 32.8, fat: 0.5, fibre: 13, servingName: "1 katori dry", servingGrams: 40, notes: "Dry weight — chunks roughly triple in weight when soaked." },
  { name: "Besan (gram flour)", aliases: "chickpea flour, chana atta", category: "Raw Ingredients", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 387, protein: 22.4, carbs: 57.8, fat: 6.7, fibre: 10.8, servingName: "1 cup", servingGrams: 100 },
  { name: "Rolled Oats (dry)", aliases: "oats dry, oatmeal uncooked", category: "Raw Ingredients", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 389, protein: 16.9, carbs: 66.3, fat: 6.9, fibre: 10.6, servingName: "1 small bowl dry", servingGrams: 40 },
  { name: "Sugar", aliases: "cheeni, table sugar", category: "Raw Ingredients", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 387, protein: 0, carbs: 99.8, fat: 0, fibre: 0, servingName: "1 tsp", servingGrams: 4 },
  { name: "Jaggery", aliases: "gur, gud", category: "Raw Ingredients", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 383, protein: 0.4, carbs: 98.5, fat: 0.1, fibre: 0, servingName: "1 tsp", servingGrams: 5 },
  { name: "Honey", aliases: "shahad", category: "Raw Ingredients", cuisine: "Pan-Indian", dietFlag: "veg", kcal: 304, protein: 0.3, carbs: 82.4, fat: 0, fibre: 0.2, servingName: "1 tbsp", servingGrams: 21 },
  { name: "Cooking Oil (generic)", aliases: "oil, vegetable oil, sunflower oil", category: "Raw Ingredients", cuisine: "Pan-Indian", dietFlag: "vegan", kcal: 900, protein: 0, carbs: 0, fat: 100, fibre: 0, servingName: "1 tsp", servingGrams: 5, notes: "All common cooking oils are ~900 kcal per 100 g." }
];

// server/src/exercises-seed.ts
var SEED_EXERCISES = [
  {
    name: "Barbell Bench Press",
    primaryMuscle: "Chest",
    secondaryMuscles: "Triceps, Shoulders",
    equipment: "Barbell",
    difficulty: "intermediate",
    pattern: "Horizontal push",
    kind: "weighted",
    instructions: "Lie on the bench, grip just outside shoulder width, feet planted. Lower the bar to mid-chest with control, then press up and slightly back until arms are straight.",
    mistakes: "Bouncing the bar off the chest; flaring elbows to 90°; lifting hips off the bench.",
    suggestedSets: 4,
    suggestedReps: "6–8",
    restSeconds: 120
  },
  {
    name: "Incline Dumbbell Press",
    primaryMuscle: "Chest",
    secondaryMuscles: "Shoulders, Triceps",
    equipment: "Dumbbell",
    difficulty: "intermediate",
    pattern: "Horizontal push",
    kind: "weighted",
    instructions: "Set the bench to 30–45°. Press the dumbbells from chest height to full extension, keeping wrists over elbows. Lower slowly to a stretch.",
    mistakes: "Bench too steep (becomes a shoulder press); letting dumbbells drift apart at the top.",
    suggestedSets: 3,
    suggestedReps: "8–10",
    restSeconds: 90
  },
  {
    name: "Incline Barbell Press",
    primaryMuscle: "Chest",
    secondaryMuscles: "Shoulders, Triceps",
    equipment: "Barbell",
    difficulty: "intermediate",
    pattern: "Horizontal push",
    kind: "weighted",
    instructions: "On a 30–45° incline, lower the bar to the upper chest, then press up. Keep shoulder blades pinched into the bench throughout.",
    mistakes: "Lowering to the neck; losing upper-back tightness between reps.",
    suggestedSets: 3,
    suggestedReps: "6–10",
    restSeconds: 120
  },
  {
    name: "Dumbbell Chest Fly",
    primaryMuscle: "Chest",
    secondaryMuscles: "Shoulders",
    equipment: "Dumbbell",
    difficulty: "intermediate",
    pattern: "Fly",
    kind: "weighted",
    instructions: "Lie flat with a slight bend in the elbows. Open the arms wide until you feel a chest stretch, then bring the dumbbells together over your chest like hugging a barrel.",
    mistakes: "Straightening arms fully (strains shoulders); going too heavy and turning it into a press.",
    suggestedSets: 3,
    suggestedReps: "10–12",
    restSeconds: 60
  },
  {
    name: "Cable Crossover",
    primaryMuscle: "Chest",
    secondaryMuscles: "Shoulders",
    equipment: "Cable",
    difficulty: "beginner",
    pattern: "Fly",
    kind: "weighted",
    instructions: "Set both pulleys high, step forward into a staggered stance. Sweep the handles down and together in front of your waist, squeezing the chest at the bottom.",
    mistakes: "Bending the elbows more as you tire; letting the weight stack slam between reps.",
    suggestedSets: 3,
    suggestedReps: "12–15",
    restSeconds: 60
  },
  {
    name: "Machine Chest Press",
    primaryMuscle: "Chest",
    secondaryMuscles: "Triceps, Shoulders",
    equipment: "Machine",
    difficulty: "beginner",
    pattern: "Horizontal push",
    kind: "weighted",
    instructions: "Adjust the seat so handles sit at mid-chest. Press forward to full extension without locking out hard, then return slowly.",
    mistakes: "Seat too low (handles at neck height); shrugging shoulders toward ears.",
    suggestedSets: 3,
    suggestedReps: "10–12",
    restSeconds: 90
  },
  {
    name: "Push-Up",
    primaryMuscle: "Chest",
    secondaryMuscles: "Triceps, Shoulders, Core",
    equipment: "Bodyweight",
    difficulty: "beginner",
    pattern: "Horizontal push",
    kind: "bodyweight",
    instructions: "Hands under shoulders, body in one straight line. Lower until your chest is just above the floor, then press the floor away. Elevate hands or use knees to make it easier.",
    mistakes: "Hips sagging; half reps; head dropping toward the floor.",
    suggestedSets: 3,
    suggestedReps: "10–15",
    restSeconds: 60
  },
  {
    name: "Decline Push-Up",
    primaryMuscle: "Chest",
    secondaryMuscles: "Shoulders, Triceps",
    equipment: "Bodyweight",
    difficulty: "intermediate",
    pattern: "Horizontal push",
    kind: "bodyweight",
    instructions: "Feet on a step or chair, hands on the floor. Keep a straight line and lower with control — the angle shifts work to the upper chest and shoulders.",
    mistakes: "Letting the lower back arch; rushing the lowering phase.",
    suggestedSets: 3,
    suggestedReps: "8–12",
    restSeconds: 60
  },
  {
    name: "Deadlift",
    primaryMuscle: "Back",
    secondaryMuscles: "Glutes, Legs, Forearms",
    equipment: "Barbell",
    difficulty: "advanced",
    pattern: "Hinge",
    kind: "weighted",
    instructions: "Bar over mid-foot, hips back, chest tall, lats tight. Push the floor away and stand tall, keeping the bar close to your shins and thighs the whole way.",
    mistakes: "Rounding the lower back; jerking the bar off the floor; hyperextending at the top.",
    suggestedSets: 4,
    suggestedReps: "5",
    restSeconds: 180
  },
  {
    name: "Barbell Row",
    primaryMuscle: "Back",
    secondaryMuscles: "Biceps, Shoulders",
    equipment: "Barbell",
    difficulty: "intermediate",
    pattern: "Horizontal pull",
    kind: "weighted",
    instructions: "Hinge to about 45°, brace hard, and row the bar to your lower ribs. Lower under control without letting your torso rise.",
    mistakes: "Standing up with each rep; using momentum; rounding the back.",
    suggestedSets: 4,
    suggestedReps: "8–10",
    restSeconds: 90
  },
  {
    name: "Lat Pulldown",
    primaryMuscle: "Back",
    secondaryMuscles: "Biceps",
    equipment: "Cable",
    difficulty: "beginner",
    pattern: "Vertical pull",
    kind: "weighted",
    instructions: "Grip wide, sit tall with a slight lean back. Drive elbows down to your ribs and bring the bar to your upper chest, then control the return.",
    mistakes: "Pulling behind the neck; swinging the torso; using arms only.",
    suggestedSets: 3,
    suggestedReps: "8–12",
    restSeconds: 90
  },
  {
    name: "Seated Cable Row",
    primaryMuscle: "Back",
    secondaryMuscles: "Biceps, Shoulders",
    equipment: "Cable",
    difficulty: "beginner",
    pattern: "Horizontal pull",
    kind: "weighted",
    instructions: "Sit tall, shoulders down. Pull the handle to your stomach, squeezing the shoulder blades together, then extend the arms fully for a stretch.",
    mistakes: "Rocking back and forth; shrugging; cutting the stretch short.",
    suggestedSets: 3,
    suggestedReps: "10–12",
    restSeconds: 90
  },
  {
    name: "Pull-Up",
    primaryMuscle: "Back",
    secondaryMuscles: "Biceps, Core",
    equipment: "Bodyweight",
    difficulty: "advanced",
    pattern: "Vertical pull",
    kind: "bodyweight",
    instructions: "Overhand grip, just outside shoulders. Pull your chest to the bar from a dead hang, then lower slowly. Use a band or the assisted machine to build up.",
    mistakes: "Kipping without control; half reps at the bottom; dropping down fast.",
    suggestedSets: 4,
    suggestedReps: "5–8",
    restSeconds: 120
  },
  {
    name: "One-Arm Dumbbell Row",
    primaryMuscle: "Back",
    secondaryMuscles: "Biceps",
    equipment: "Dumbbell",
    difficulty: "beginner",
    pattern: "Horizontal pull",
    kind: "weighted",
    instructions: "One knee and hand on the bench, back flat. Row the dumbbell to your hip, elbow close to the body, then lower to a full stretch.",
    mistakes: "Rotating the torso open; rowing to the chest instead of the hip.",
    suggestedSets: 3,
    suggestedReps: "10–12",
    restSeconds: 60
  },
  {
    name: "Straight-Arm Pulldown",
    primaryMuscle: "Back",
    secondaryMuscles: "Triceps",
    equipment: "Cable",
    difficulty: "beginner",
    pattern: "Vertical pull",
    kind: "weighted",
    instructions: "Stand facing the high pulley, arms straight with soft elbows. Sweep the bar down to your thighs by driving with the lats, keeping the arms long.",
    mistakes: "Bending elbows into a pushdown; standing too close to the stack.",
    suggestedSets: 3,
    suggestedReps: "12–15",
    restSeconds: 60
  },
  {
    name: "Back Extension",
    primaryMuscle: "Back",
    secondaryMuscles: "Glutes",
    equipment: "Bodyweight",
    difficulty: "beginner",
    pattern: "Hinge",
    kind: "bodyweight",
    instructions: "On the hyperextension bench, hinge at the hips and lower until you feel the hamstrings load, then raise to a straight line — not beyond.",
    mistakes: "Hyperextending the lower back at the top; rounding on the way down.",
    suggestedSets: 3,
    suggestedReps: "12–15",
    restSeconds: 60
  },
  {
    name: "Barbell Overhead Press",
    primaryMuscle: "Shoulders",
    secondaryMuscles: "Triceps, Core",
    equipment: "Barbell",
    difficulty: "intermediate",
    pattern: "Vertical push",
    kind: "weighted",
    instructions: "Stand tall, glutes and core braced. Press the bar straight up, moving your head slightly back then through as the bar passes your face. Lock out over the middle of your foot.",
    mistakes: "Leaning back into a standing bench press; flaring ribs; pressing around the face.",
    suggestedSets: 4,
    suggestedReps: "6–8",
    restSeconds: 120
  },
  {
    name: "Dumbbell Shoulder Press",
    primaryMuscle: "Shoulders",
    secondaryMuscles: "Triceps",
    equipment: "Dumbbell",
    difficulty: "beginner",
    pattern: "Vertical push",
    kind: "weighted",
    instructions: "Seated or standing, press the dumbbells from ear height to overhead until they nearly touch. Lower slowly to ear level.",
    mistakes: "Arching the lower back; clanking dumbbells together; partial range.",
    suggestedSets: 3,
    suggestedReps: "8–12",
    restSeconds: 90
  },
  {
    name: "Lateral Raise",
    primaryMuscle: "Shoulders",
    secondaryMuscles: "",
    equipment: "Dumbbell",
    difficulty: "beginner",
    pattern: "Isolation",
    kind: "weighted",
    instructions: "Slight bend in the elbows, raise the dumbbells out to the side to shoulder height, leading with the elbows. Lower slowly — the lowering is half the exercise.",
    mistakes: "Swinging the weights up; raising above shoulder height with heavy weight; shrugging.",
    suggestedSets: 3,
    suggestedReps: "12–15",
    restSeconds: 60
  },
  {
    name: "Rear-Delt Fly",
    primaryMuscle: "Shoulders",
    secondaryMuscles: "Back",
    equipment: "Dumbbell",
    difficulty: "beginner",
    pattern: "Fly",
    kind: "weighted",
    instructions: "Hinge forward with a flat back (or sit facing a bench). Open the arms out wide with soft elbows, squeezing the rear shoulders, then return slowly.",
    mistakes: "Using the traps to shrug the weight up; standing upright mid-set.",
    suggestedSets: 3,
    suggestedReps: "12–15",
    restSeconds: 60
  },
  {
    name: "Face Pull",
    primaryMuscle: "Shoulders",
    secondaryMuscles: "Back",
    equipment: "Cable",
    difficulty: "beginner",
    pattern: "Horizontal pull",
    kind: "weighted",
    instructions: "Rope at face height. Pull toward your forehead, splitting the rope so your hands pass beside your ears, elbows high. Pause and squeeze.",
    mistakes: "Pulling to the chest; going too heavy and turning it into a row.",
    suggestedSets: 3,
    suggestedReps: "12–15",
    restSeconds: 60
  },
  {
    name: "Arnold Press",
    primaryMuscle: "Shoulders",
    secondaryMuscles: "Triceps",
    equipment: "Dumbbell",
    difficulty: "intermediate",
    pattern: "Vertical push",
    kind: "weighted",
    instructions: "Start with palms facing you at chin height. Rotate the palms forward as you press overhead; reverse the rotation on the way down.",
    mistakes: "Rushing the rotation; using weight meant for a regular press.",
    suggestedSets: 3,
    suggestedReps: "8–10",
    restSeconds: 90
  },
  {
    name: "Pike Push-Up",
    primaryMuscle: "Shoulders",
    secondaryMuscles: "Triceps, Chest",
    equipment: "Bodyweight",
    difficulty: "intermediate",
    pattern: "Vertical push",
    kind: "bodyweight",
    instructions: "From push-up position, walk feet in and lift hips high into an upside-down V. Lower the top of your head toward the floor between your hands, then press up.",
    mistakes: "Hips too low (becomes a normal push-up); flaring elbows wide.",
    suggestedSets: 3,
    suggestedReps: "8–12",
    restSeconds: 60
  },
  {
    name: "Barbell Curl",
    primaryMuscle: "Biceps",
    secondaryMuscles: "Forearms",
    equipment: "Barbell",
    difficulty: "beginner",
    pattern: "Isolation",
    kind: "weighted",
    instructions: "Elbows pinned at your sides, curl the bar up without swinging. Squeeze at the top, then lower fully until arms are straight.",
    mistakes: "Swinging the hips; elbows drifting forward; cutting the bottom short.",
    suggestedSets: 3,
    suggestedReps: "8–10",
    restSeconds: 60
  },
  {
    name: "Dumbbell Bicep Curl",
    primaryMuscle: "Biceps",
    secondaryMuscles: "Forearms",
    equipment: "Dumbbell",
    difficulty: "beginner",
    pattern: "Isolation",
    kind: "weighted",
    instructions: "Curl one or both dumbbells, turning the palm up as you lift. Keep the upper arm still and lower under control.",
    mistakes: "Letting elbows swing forward; dropping the weight down.",
    suggestedSets: 3,
    suggestedReps: "10–12",
    restSeconds: 60
  },
  {
    name: "Hammer Curl",
    primaryMuscle: "Biceps",
    secondaryMuscles: "Forearms",
    equipment: "Dumbbell",
    difficulty: "beginner",
    pattern: "Isolation",
    kind: "weighted",
    instructions: "Palms face each other the whole way, like holding hammers. Curl to shoulder height and lower slowly.",
    mistakes: "Turning it into a swing; elbows drifting behind the body.",
    suggestedSets: 3,
    suggestedReps: "10–12",
    restSeconds: 60
  },
  {
    name: "Incline Dumbbell Curl",
    primaryMuscle: "Biceps",
    secondaryMuscles: "",
    equipment: "Dumbbell",
    difficulty: "intermediate",
    pattern: "Isolation",
    kind: "weighted",
    instructions: "Lie back on a 45° incline, arms hanging straight down. Curl without letting the upper arms move — the stretch at the bottom is the point.",
    mistakes: "Sitting up between reps; elbows creeping forward.",
    suggestedSets: 3,
    suggestedReps: "10–12",
    restSeconds: 60
  },
  {
    name: "Cable Curl",
    primaryMuscle: "Biceps",
    secondaryMuscles: "",
    equipment: "Cable",
    difficulty: "beginner",
    pattern: "Isolation",
    kind: "weighted",
    instructions: "Low pulley, straight bar or rope. Curl with elbows fixed; the cable keeps tension through the whole range, so move slowly.",
    mistakes: "Stepping too close; leaning back to help the weight up.",
    suggestedSets: 3,
    suggestedReps: "12–15",
    restSeconds: 60
  },
  {
    name: "Preacher Curl",
    primaryMuscle: "Biceps",
    secondaryMuscles: "",
    equipment: "Machine",
    difficulty: "beginner",
    pattern: "Isolation",
    kind: "weighted",
    instructions: "Upper arms flat on the pad, armpits at the top edge. Curl up, then lower slowly — don't fully straighten under heavy load at the bottom.",
    mistakes: "Lifting the arms off the pad; bouncing out of the bottom.",
    suggestedSets: 3,
    suggestedReps: "10–12",
    restSeconds: 60
  },
  {
    name: "Tricep Pushdown",
    primaryMuscle: "Triceps",
    secondaryMuscles: "",
    equipment: "Cable",
    difficulty: "beginner",
    pattern: "Isolation",
    kind: "weighted",
    instructions: "Elbows pinned to your ribs. Push the bar or rope down until arms are fully straight, then let it rise only to forearm-parallel.",
    mistakes: "Elbows flaring or moving forward; leaning your whole body into it.",
    suggestedSets: 3,
    suggestedReps: "10–15",
    restSeconds: 60
  },
  {
    name: "Overhead Cable Extension",
    primaryMuscle: "Triceps",
    secondaryMuscles: "",
    equipment: "Cable",
    difficulty: "beginner",
    pattern: "Isolation",
    kind: "weighted",
    instructions: "Face away from the low pulley, rope behind your head, elbows pointing forward. Extend until arms are straight overhead, keeping upper arms still.",
    mistakes: "Elbows splaying wide; arching the lower back.",
    suggestedSets: 3,
    suggestedReps: "12–15",
    restSeconds: 60
  },
  {
    name: "Dips",
    primaryMuscle: "Triceps",
    secondaryMuscles: "Chest, Shoulders",
    equipment: "Bodyweight",
    difficulty: "intermediate",
    pattern: "Vertical push",
    kind: "bodyweight",
    instructions: "On parallel bars, torso fairly upright for triceps. Lower until upper arms are about parallel to the floor, then press up. Use the assisted machine or a bench version to start.",
    mistakes: "Dropping too deep and straining shoulders; swinging the legs.",
    suggestedSets: 3,
    suggestedReps: "8–12",
    restSeconds: 90
  },
  {
    name: "Skull Crusher",
    primaryMuscle: "Triceps",
    secondaryMuscles: "",
    equipment: "Barbell",
    difficulty: "intermediate",
    pattern: "Isolation",
    kind: "weighted",
    instructions: "Lie flat, bar over your forehead with elbows pointing at the ceiling. Bend only at the elbows to lower the bar toward your hairline, then extend.",
    mistakes: "Elbows flaring wide; letting the bar drift over the chest.",
    suggestedSets: 3,
    suggestedReps: "10–12",
    restSeconds: 60
  },
  {
    name: "Close-Grip Bench Press",
    primaryMuscle: "Triceps",
    secondaryMuscles: "Chest, Shoulders",
    equipment: "Barbell",
    difficulty: "intermediate",
    pattern: "Horizontal push",
    kind: "weighted",
    instructions: "Grip at shoulder width, elbows close to the body. Lower the bar to the lower chest and press — the triceps do more of the work than in a regular bench.",
    mistakes: "Grip too narrow (wrist strain); flaring elbows out.",
    suggestedSets: 3,
    suggestedReps: "8–10",
    restSeconds: 90
  },
  {
    name: "Diamond Push-Up",
    primaryMuscle: "Triceps",
    secondaryMuscles: "Chest, Shoulders",
    equipment: "Bodyweight",
    difficulty: "intermediate",
    pattern: "Horizontal push",
    kind: "bodyweight",
    instructions: "Hands together under your sternum, thumbs and index fingers forming a diamond. Keep elbows close as you lower and press.",
    mistakes: "Hands too far forward; hips sagging.",
    suggestedSets: 3,
    suggestedReps: "10–15",
    restSeconds: 60
  },
  {
    name: "Barbell Squat",
    primaryMuscle: "Legs",
    secondaryMuscles: "Glutes, Core",
    equipment: "Barbell",
    difficulty: "intermediate",
    pattern: "Squat",
    kind: "weighted",
    instructions: "Bar on the upper back, feet shoulder width. Sit down between your heels with a braced core and knees tracking over toes, then drive up through the whole foot.",
    mistakes: "Knees caving in; heels lifting; rounding the lower back at the bottom.",
    suggestedSets: 4,
    suggestedReps: "6–8",
    restSeconds: 150
  },
  {
    name: "Leg Press",
    primaryMuscle: "Legs",
    secondaryMuscles: "Glutes",
    equipment: "Machine",
    difficulty: "beginner",
    pattern: "Squat",
    kind: "weighted",
    instructions: "Feet shoulder width on the plate. Lower until knees reach about 90°, keeping your lower back on the pad, then press without locking the knees hard.",
    mistakes: "Letting the lower back round off the pad; half reps; knees caving.",
    suggestedSets: 3,
    suggestedReps: "10–12",
    restSeconds: 90
  },
  {
    name: "Leg Extension",
    primaryMuscle: "Legs",
    secondaryMuscles: "",
    equipment: "Machine",
    difficulty: "beginner",
    pattern: "Isolation",
    kind: "weighted",
    instructions: "Pad just above the ankles, knees aligned with the machine's pivot. Extend fully, pause and squeeze the quads, then lower slowly.",
    mistakes: "Swinging the weight up; lifting hips off the seat.",
    suggestedSets: 3,
    suggestedReps: "12–15",
    restSeconds: 60
  },
  {
    name: "Lying Leg Curl",
    primaryMuscle: "Legs",
    secondaryMuscles: "Calves",
    equipment: "Machine",
    difficulty: "beginner",
    pattern: "Isolation",
    kind: "weighted",
    instructions: "Pad just above the heels. Curl toward your glutes without lifting your hips off the bench, then lower under control.",
    mistakes: "Hips rising off the pad; letting the weight drop back.",
    suggestedSets: 3,
    suggestedReps: "10–12",
    restSeconds: 60
  },
  {
    name: "Romanian Deadlift",
    primaryMuscle: "Legs",
    secondaryMuscles: "Glutes, Back",
    equipment: "Barbell",
    difficulty: "intermediate",
    pattern: "Hinge",
    kind: "weighted",
    instructions: "Soft knees, push your hips back and slide the bar down your thighs until you feel a deep hamstring stretch, back flat. Drive the hips forward to stand.",
    mistakes: "Turning it into a squat; rounding the back; lowering past your flexibility.",
    suggestedSets: 3,
    suggestedReps: "8–10",
    restSeconds: 120
  },
  {
    name: "Walking Lunges",
    primaryMuscle: "Legs",
    secondaryMuscles: "Glutes",
    equipment: "Dumbbell",
    difficulty: "intermediate",
    pattern: "Lunge",
    kind: "weighted",
    instructions: "Step forward into a lunge, torso tall, front knee tracking over the foot. Push through the front heel and step straight into the next lunge.",
    mistakes: "Front knee caving in; short steps; leaning forward.",
    suggestedSets: 3,
    suggestedReps: "10 each leg",
    restSeconds: 90
  },
  {
    name: "Bulgarian Split Squat",
    primaryMuscle: "Legs",
    secondaryMuscles: "Glutes",
    equipment: "Dumbbell",
    difficulty: "intermediate",
    pattern: "Lunge",
    kind: "weighted",
    instructions: "Rear foot on a bench, front foot far enough forward. Lower straight down until the front thigh is near parallel, then drive up through the front foot.",
    mistakes: "Front foot too close (knee pain); pushing off the rear leg.",
    suggestedSets: 3,
    suggestedReps: "8–10 each leg",
    restSeconds: 90
  },
  {
    name: "Goblet Squat",
    primaryMuscle: "Legs",
    secondaryMuscles: "Glutes, Core",
    equipment: "Dumbbell",
    difficulty: "beginner",
    pattern: "Squat",
    kind: "weighted",
    instructions: "Hold one dumbbell at your chest like a goblet. Squat between your heels, elbows inside the knees at the bottom, chest tall.",
    mistakes: "Heels lifting; knees collapsing inward.",
    suggestedSets: 3,
    suggestedReps: "10–12",
    restSeconds: 90
  },
  {
    name: "Standing Calf Raise",
    primaryMuscle: "Legs",
    secondaryMuscles: "",
    equipment: "Machine",
    difficulty: "beginner",
    pattern: "Isolation",
    kind: "weighted",
    instructions: "Balls of the feet on the step, full stretch at the bottom. Rise as high as possible, pause at the top, lower slowly.",
    mistakes: "Bouncing out of the stretch; bending the knees; rushing.",
    suggestedSets: 4,
    suggestedReps: "12–15",
    restSeconds: 60
  },
  {
    name: "Seated Calf Raise",
    primaryMuscle: "Legs",
    secondaryMuscles: "",
    equipment: "Machine",
    difficulty: "beginner",
    pattern: "Isolation",
    kind: "weighted",
    instructions: "Knees bent at 90° under the pad. Raise the heels high, pause, and lower to a full stretch on every rep.",
    mistakes: "Using the thighs to help; partial range.",
    suggestedSets: 3,
    suggestedReps: "12–15",
    restSeconds: 60
  },
  {
    name: "Bodyweight Squat",
    primaryMuscle: "Legs",
    secondaryMuscles: "Glutes",
    equipment: "Bodyweight",
    difficulty: "beginner",
    pattern: "Squat",
    kind: "bodyweight",
    instructions: "Feet shoulder width, arms forward for balance. Sit back and down until thighs are near parallel, knees tracking over toes, then stand tall.",
    mistakes: "Heels lifting; knees caving; rounding the back.",
    suggestedSets: 3,
    suggestedReps: "15–20",
    restSeconds: 60
  },
  {
    name: "Hip Thrust",
    primaryMuscle: "Glutes",
    secondaryMuscles: "Legs",
    equipment: "Barbell",
    difficulty: "intermediate",
    pattern: "Hinge",
    kind: "weighted",
    instructions: "Upper back on a bench, bar across the hips (use a pad). Drive through the heels until your body is a straight table, squeezing the glutes hard at the top.",
    mistakes: "Arching the lower back at the top; feet too far forward (all hamstring).",
    suggestedSets: 4,
    suggestedReps: "8–12",
    restSeconds: 90
  },
  {
    name: "Glute Bridge",
    primaryMuscle: "Glutes",
    secondaryMuscles: "Legs",
    equipment: "Bodyweight",
    difficulty: "beginner",
    pattern: "Hinge",
    kind: "bodyweight",
    instructions: "Lie on your back, knees bent, heels close. Push through the heels and lift the hips until knees, hips and shoulders align. Pause and squeeze.",
    mistakes: "Pushing through the toes; over-arching at the top.",
    suggestedSets: 3,
    suggestedReps: "15–20",
    restSeconds: 60
  },
  {
    name: "Cable Kickback",
    primaryMuscle: "Glutes",
    secondaryMuscles: "",
    equipment: "Cable",
    difficulty: "beginner",
    pattern: "Isolation",
    kind: "weighted",
    instructions: "Ankle strap on the low pulley, hinge slightly and hold the frame. Kick the leg back by squeezing the glute, keeping the knee nearly straight, then return slowly.",
    mistakes: "Swinging with the lower back; turning the hip open.",
    suggestedSets: 3,
    suggestedReps: "12–15 each leg",
    restSeconds: 60
  },
  {
    name: "Plank",
    primaryMuscle: "Core",
    secondaryMuscles: "Shoulders",
    equipment: "Bodyweight",
    difficulty: "beginner",
    pattern: "Brace",
    kind: "timed",
    instructions: "Forearms down, body in one straight line, glutes and core braced. Breathe steadily — stop the set when your hips start to sag.",
    mistakes: "Hips sagging or piking up; holding your breath.",
    suggestedSets: 3,
    suggestedReps: "30–60 sec",
    restSeconds: 60
  },
  {
    name: "Crunches",
    primaryMuscle: "Core",
    secondaryMuscles: "",
    equipment: "Bodyweight",
    difficulty: "beginner",
    pattern: "Flexion",
    kind: "bodyweight",
    instructions: "Knees bent, lower back pressed down. Curl your ribs toward your pelvis, lifting shoulder blades off the floor, then lower slowly.",
    mistakes: "Pulling on the neck; sitting all the way up (becomes hip flexors).",
    suggestedSets: 3,
    suggestedReps: "15–20",
    restSeconds: 45
  },
  {
    name: "Mountain Climbers",
    primaryMuscle: "Core",
    secondaryMuscles: "Shoulders, Legs",
    equipment: "Bodyweight",
    difficulty: "beginner",
    pattern: "Brace",
    kind: "timed",
    instructions: "From a high plank, drive knees toward your chest alternately, keeping hips level and core tight. Go for control first, speed second.",
    mistakes: "Hips bouncing high; shoulders drifting behind the hands.",
    suggestedSets: 3,
    suggestedReps: "30–40 sec",
    restSeconds: 60
  },
  {
    name: "Hanging Leg Raise",
    primaryMuscle: "Core",
    secondaryMuscles: "Forearms",
    equipment: "Bodyweight",
    difficulty: "advanced",
    pattern: "Flexion",
    kind: "bodyweight",
    instructions: "Hang from the bar, brace, and raise straight legs to hip height by curling the pelvis. Lower slowly — no swinging. Bend the knees to make it easier.",
    mistakes: "Swinging for momentum; only lifting with hip flexors.",
    suggestedSets: 3,
    suggestedReps: "10–12",
    restSeconds: 60
  },
  {
    name: "Russian Twist",
    primaryMuscle: "Core",
    secondaryMuscles: "",
    equipment: "Bodyweight",
    difficulty: "beginner",
    pattern: "Rotation",
    kind: "bodyweight",
    instructions: "Sit tall, lean back slightly with a straight back, feet down or floating. Rotate the whole ribcage side to side, moving slowly.",
    mistakes: "Rounding the back; just waving the arms side to side.",
    suggestedSets: 3,
    suggestedReps: "12–16 total",
    restSeconds: 45
  },
  {
    name: "Dead Bug",
    primaryMuscle: "Core",
    secondaryMuscles: "",
    equipment: "Bodyweight",
    difficulty: "beginner",
    pattern: "Brace",
    kind: "bodyweight",
    instructions: "On your back, arms up, hips and knees at 90°. Lower one arm and the opposite leg while pressing your lower back into the floor. Alternate sides.",
    mistakes: "Lower back arching off the floor; rushing.",
    suggestedSets: 3,
    suggestedReps: "8–10 each side",
    restSeconds: 45
  },
  {
    name: "Bicycle Crunch",
    primaryMuscle: "Core",
    secondaryMuscles: "",
    equipment: "Bodyweight",
    difficulty: "beginner",
    pattern: "Rotation",
    kind: "bodyweight",
    instructions: "Curl up and rotate one elbow toward the opposite knee while the other leg extends. Move slowly enough to feel the obliques work.",
    mistakes: "Pulling the neck; racing through reps.",
    suggestedSets: 3,
    suggestedReps: "16–20 total",
    restSeconds: 45
  },
  {
    name: "Burpees",
    primaryMuscle: "Full Body",
    secondaryMuscles: "Chest, Legs",
    equipment: "Bodyweight",
    difficulty: "intermediate",
    pattern: "Conditioning",
    kind: "bodyweight",
    instructions: "Squat down, hands to the floor, jump feet back to a plank, optional push-up, jump feet in and jump up. Step back instead of jumping to scale it down.",
    mistakes: "Letting the hips sag in the plank; landing stiff-legged.",
    suggestedSets: 3,
    suggestedReps: "10–12",
    restSeconds: 90
  },
  {
    name: "Kettlebell Swing",
    primaryMuscle: "Full Body",
    secondaryMuscles: "Glutes, Back",
    equipment: "Kettlebell",
    difficulty: "intermediate",
    pattern: "Hinge",
    kind: "weighted",
    instructions: "Hike the bell back between your legs, then snap the hips forward to float it to chest height. It's a hinge, not a squat — the arms are just ropes.",
    mistakes: "Lifting with the shoulders; squatting the bell up; rounding the back.",
    suggestedSets: 3,
    suggestedReps: "12–15",
    restSeconds: 60
  },
  {
    name: "Farmer's Carry",
    primaryMuscle: "Full Body",
    secondaryMuscles: "Forearms, Core",
    equipment: "Dumbbell",
    difficulty: "beginner",
    pattern: "Carry",
    kind: "timed",
    instructions: "Heavy dumbbells in both hands, stand tall, shoulders down and back. Walk with short controlled steps, core braced, without leaning.",
    mistakes: "Shrugging the weight up; leaning away from the load.",
    suggestedSets: 3,
    suggestedReps: "40–60 sec",
    restSeconds: 60
  },
  {
    name: "Wall Sit",
    primaryMuscle: "Legs",
    secondaryMuscles: "",
    equipment: "Bodyweight",
    difficulty: "beginner",
    pattern: "Brace",
    kind: "timed",
    instructions: "Back flat against the wall, slide down until knees and hips are at 90°. Keep the whole back pressed to the wall and breathe.",
    mistakes: "Hands pushing on thighs for help; knees caving in.",
    suggestedSets: 3,
    suggestedReps: "30–60 sec",
    restSeconds: 60
  },
  {
    name: "Superman",
    primaryMuscle: "Back",
    secondaryMuscles: "Glutes, Shoulders",
    equipment: "Bodyweight",
    difficulty: "beginner",
    pattern: "Extension",
    kind: "bodyweight",
    instructions: "Lie face down, arms forward. Lift arms, chest and thighs off the floor together, pause, and lower slowly.",
    mistakes: "Jerking up; holding your breath at the top.",
    suggestedSets: 3,
    suggestedReps: "12–15",
    restSeconds: 45
  }
];
var WORKOUT_TEMPLATES = [
  {
    key: "ppl-push",
    name: "Push",
    group: "Push / Pull / Legs",
    focus: "Chest, shoulders, triceps",
    exercises: [
      { name: "Barbell Bench Press", sets: 4, reps: "6–8", restSeconds: 120 },
      { name: "Incline Dumbbell Press", sets: 3, reps: "8–10", restSeconds: 90 },
      { name: "Dumbbell Shoulder Press", sets: 3, reps: "8–12", restSeconds: 90 },
      { name: "Lateral Raise", sets: 3, reps: "12–15", restSeconds: 60 },
      { name: "Tricep Pushdown", sets: 3, reps: "10–15", restSeconds: 60 },
      { name: "Overhead Cable Extension", sets: 2, reps: "12–15", restSeconds: 60 }
    ]
  },
  {
    key: "ppl-pull",
    name: "Pull",
    group: "Push / Pull / Legs",
    focus: "Back, biceps, rear delts",
    exercises: [
      { name: "Deadlift", sets: 4, reps: "5", restSeconds: 180 },
      { name: "Lat Pulldown", sets: 3, reps: "8–12", restSeconds: 90 },
      { name: "Seated Cable Row", sets: 3, reps: "10–12", restSeconds: 90 },
      { name: "Face Pull", sets: 3, reps: "12–15", restSeconds: 60 },
      { name: "Barbell Curl", sets: 3, reps: "8–10", restSeconds: 60 },
      { name: "Hammer Curl", sets: 2, reps: "10–12", restSeconds: 60 }
    ]
  },
  {
    key: "ppl-legs",
    name: "Legs",
    group: "Push / Pull / Legs",
    focus: "Quads, hamstrings, calves",
    exercises: [
      { name: "Barbell Squat", sets: 4, reps: "6–8", restSeconds: 150 },
      { name: "Romanian Deadlift", sets: 3, reps: "8–10", restSeconds: 120 },
      { name: "Leg Press", sets: 3, reps: "10–12", restSeconds: 90 },
      { name: "Lying Leg Curl", sets: 3, reps: "10–12", restSeconds: 60 },
      { name: "Walking Lunges", sets: 2, reps: "10 each leg", restSeconds: 90 },
      { name: "Standing Calf Raise", sets: 4, reps: "12–15", restSeconds: 60 }
    ]
  },
  {
    key: "ul-upper",
    name: "Upper Body",
    group: "Upper / Lower",
    focus: "Chest, back, shoulders, arms",
    exercises: [
      { name: "Barbell Bench Press", sets: 4, reps: "6–8", restSeconds: 120 },
      { name: "Barbell Row", sets: 4, reps: "8–10", restSeconds: 90 },
      { name: "Barbell Overhead Press", sets: 3, reps: "6–8", restSeconds: 120 },
      { name: "Lat Pulldown", sets: 3, reps: "8–12", restSeconds: 90 },
      { name: "Dumbbell Bicep Curl", sets: 2, reps: "10–12", restSeconds: 60 },
      { name: "Tricep Pushdown", sets: 2, reps: "10–15", restSeconds: 60 }
    ]
  },
  {
    key: "ul-lower",
    name: "Lower Body",
    group: "Upper / Lower",
    focus: "Quads, hamstrings, glutes, core",
    exercises: [
      { name: "Barbell Squat", sets: 4, reps: "6–8", restSeconds: 150 },
      { name: "Romanian Deadlift", sets: 3, reps: "8–10", restSeconds: 120 },
      { name: "Leg Extension", sets: 3, reps: "12–15", restSeconds: 60 },
      { name: "Lying Leg Curl", sets: 3, reps: "10–12", restSeconds: 60 },
      { name: "Standing Calf Raise", sets: 3, reps: "12–15", restSeconds: 60 },
      { name: "Plank", sets: 3, reps: "30–60 sec", restSeconds: 60 }
    ]
  },
  {
    key: "fb-a",
    name: "Full Body",
    group: "Full Body",
    focus: "Everything, one session",
    exercises: [
      { name: "Barbell Squat", sets: 3, reps: "6–8", restSeconds: 150 },
      { name: "Barbell Bench Press", sets: 3, reps: "6–8", restSeconds: 120 },
      { name: "Barbell Row", sets: 3, reps: "8–10", restSeconds: 90 },
      { name: "Dumbbell Shoulder Press", sets: 2, reps: "8–12", restSeconds: 90 },
      { name: "Romanian Deadlift", sets: 2, reps: "8–10", restSeconds: 120 },
      { name: "Plank", sets: 2, reps: "30–60 sec", restSeconds: 60 }
    ]
  },
  {
    key: "bro-chest",
    name: "Bro Split — Chest",
    group: "Bro Split",
    focus: "Chest + a little triceps",
    exercises: [
      { name: "Barbell Bench Press", sets: 4, reps: "6–8", restSeconds: 120 },
      { name: "Incline Barbell Press", sets: 3, reps: "6–10", restSeconds: 120 },
      { name: "Dumbbell Chest Fly", sets: 3, reps: "10–12", restSeconds: 60 },
      { name: "Cable Crossover", sets: 3, reps: "12–15", restSeconds: 60 },
      { name: "Push-Up", sets: 2, reps: "10–15", restSeconds: 60 }
    ]
  },
  {
    key: "bro-back",
    name: "Bro Split — Back",
    group: "Bro Split",
    focus: "Back width and thickness",
    exercises: [
      { name: "Pull-Up", sets: 4, reps: "5–8", restSeconds: 120 },
      { name: "Barbell Row", sets: 4, reps: "8–10", restSeconds: 90 },
      { name: "Lat Pulldown", sets: 3, reps: "8–12", restSeconds: 90 },
      { name: "One-Arm Dumbbell Row", sets: 3, reps: "10–12", restSeconds: 60 },
      { name: "Straight-Arm Pulldown", sets: 2, reps: "12–15", restSeconds: 60 }
    ]
  },
  {
    key: "bro-arms",
    name: "Bro Split — Shoulders & Arms",
    group: "Bro Split",
    focus: "Delts, biceps, triceps",
    exercises: [
      { name: "Barbell Overhead Press", sets: 4, reps: "6–8", restSeconds: 120 },
      { name: "Lateral Raise", sets: 3, reps: "12–15", restSeconds: 60 },
      { name: "Rear-Delt Fly", sets: 3, reps: "12–15", restSeconds: 60 },
      { name: "Barbell Curl", sets: 3, reps: "8–10", restSeconds: 60 },
      { name: "Skull Crusher", sets: 3, reps: "10–12", restSeconds: 60 },
      { name: "Hammer Curl", sets: 2, reps: "10–12", restSeconds: 60 }
    ]
  },
  {
    key: "bro-legs",
    name: "Bro Split — Legs",
    group: "Bro Split",
    focus: "Quads, hamstrings, glutes, calves",
    exercises: [
      { name: "Barbell Squat", sets: 4, reps: "6–8", restSeconds: 150 },
      { name: "Leg Press", sets: 3, reps: "10–12", restSeconds: 90 },
      { name: "Romanian Deadlift", sets: 3, reps: "8–10", restSeconds: 120 },
      { name: "Leg Extension", sets: 3, reps: "12–15", restSeconds: 60 },
      { name: "Hip Thrust", sets: 3, reps: "8–12", restSeconds: 90 },
      { name: "Seated Calf Raise", sets: 3, reps: "12–15", restSeconds: 60 }
    ]
  },
  {
    key: "home-bodyweight",
    name: "Home — Bodyweight",
    group: "Home",
    focus: "No equipment, anywhere",
    exercises: [
      { name: "Push-Up", sets: 3, reps: "10–15", restSeconds: 60 },
      { name: "Bodyweight Squat", sets: 3, reps: "15–20", restSeconds: 60 },
      { name: "Glute Bridge", sets: 3, reps: "15–20", restSeconds: 60 },
      { name: "Pike Push-Up", sets: 3, reps: "8–12", restSeconds: 60 },
      { name: "Walking Lunges", sets: 2, reps: "10 each leg", restSeconds: 90 },
      { name: "Mountain Climbers", sets: 3, reps: "30–40 sec", restSeconds: 60 },
      { name: "Plank", sets: 3, reps: "30–60 sec", restSeconds: 60 }
    ]
  }
];

// server/src/recipes-seed.ts
var SEED_RECIPES = [
  {
    name: "Besan Chilla with Onion & Tomato",
    description: "Savoury gram-flour pancakes — crisp edges, soft middle.",
    category: "breakfast",
    dietFlag: "vegan",
    servings: 2,
    prepMinutes: 10,
    cookMinutes: 15,
    budget: true,
    steps: [
      "Whisk the besan with about 250 ml water, salt, turmeric and chilli into a pourable batter. Rest 10 minutes.",
      "Stir in the finely chopped onion and tomato.",
      "Heat a tawa, grease lightly with oil, and spread a ladle of batter like a dosa.",
      "Cook 2–3 minutes per side until golden at the edges. Repeat for the rest.",
      "Serve hot with green chutney or curd."
    ],
    ingredients: [
      { foodName: "Besan (gram flour)", grams: 120 },
      { foodName: "Onion (raw)", grams: 60 },
      { foodName: "Tomato (raw)", grams: 60 },
      { foodName: "Cooking Oil (generic)", grams: 10 }
    ]
  },
  {
    name: "Protein Oats Bowl",
    description: "Oats cooked in milk with banana, peanut butter and chia.",
    category: "breakfast",
    dietFlag: "veg",
    servings: 1,
    prepMinutes: 5,
    cookMinutes: 8,
    budget: false,
    steps: [
      "Simmer the oats in the milk for 6–8 minutes, stirring, until thick.",
      "Take off the heat and stir in the peanut butter.",
      "Top with sliced banana and the chia seeds. Eat warm."
    ],
    ingredients: [
      { foodName: "Rolled Oats (dry)", grams: 40 },
      { foodName: "Milk (toned)", grams: 250 },
      { foodName: "Banana", grams: 100 },
      { foodName: "Peanut Butter", grams: 16 },
      { foodName: "Chia Seeds", grams: 10 }
    ]
  },
  {
    name: "Sprouted Moong Chaat",
    description: "Crunchy sprouts with onion, tomato and roasted peanuts.",
    category: "breakfast",
    dietFlag: "vegan",
    servings: 2,
    prepMinutes: 10,
    cookMinutes: null,
    budget: true,
    steps: [
      "Steam the sprouted moong for 4–5 minutes if you prefer it softer; it is fine raw too.",
      "Toss with chopped onion, tomato and cucumber.",
      "Season with salt, chaat masala and lemon juice. Top with peanuts."
    ],
    ingredients: [
      { foodName: "Sprouted Moong (cooked)", grams: 300 },
      { foodName: "Onion (raw)", grams: 60 },
      { foodName: "Tomato (raw)", grams: 100 },
      { foodName: "Cucumber", grams: 100 },
      { foodName: "Peanuts (roasted)", grams: 30 }
    ]
  },
  {
    name: "Masala Egg Bhurji Toast",
    description: "Spiced scrambled eggs on whole-wheat toast.",
    category: "breakfast",
    dietFlag: "eggetarian",
    servings: 1,
    prepMinutes: 5,
    cookMinutes: 10,
    budget: true,
    steps: [
      "Soften the onion in oil, add tomato and cook down to a masala.",
      "Pour in beaten eggs with salt and turmeric; scramble on low heat until just set.",
      "Pile onto toasted bread and serve immediately."
    ],
    ingredients: [
      { foodName: "Egg (boiled, whole)", grams: 100 },
      { foodName: "Onion (raw)", grams: 50 },
      { foodName: "Tomato (raw)", grams: 50 },
      { foodName: "Cooking Oil (generic)", grams: 5 },
      { foodName: "Bread (whole wheat)", grams: 50 }
    ]
  },
  {
    name: "Paneer Stuffed Paratha",
    description: "Whole-wheat parathas with a spiced paneer filling and curd.",
    category: "breakfast",
    dietFlag: "veg",
    servings: 2,
    prepMinutes: 20,
    cookMinutes: 15,
    budget: false,
    steps: [
      "Knead the atta with water and a pinch of salt into a soft dough. Rest 15 minutes.",
      "Crumble the paneer with salt, green chilli and coriander.",
      "Roll, fill, seal and roll again gently so the filling stays in.",
      "Cook on a hot tawa with a little ghee until both sides are spotted and crisp.",
      "Serve with the curd on the side."
    ],
    ingredients: [
      { foodName: "Whole Wheat Flour (atta)", grams: 120 },
      { foodName: "Paneer", grams: 100 },
      { foodName: "Ghee", grams: 10 },
      { foodName: "Curd (dahi)", grams: 100 }
    ]
  },
  {
    name: "Idli Sambar Plate",
    description: "Soft idlis with a bowl of hot sambar for dipping.",
    category: "breakfast",
    dietFlag: "vegan",
    servings: 2,
    prepMinutes: 5,
    cookMinutes: 15,
    budget: true,
    steps: [
      "Steam the idlis until a knife comes out clean (about 12–15 minutes).",
      "Warm the sambar until it just boils; check salt.",
      "Serve three idlis per plate with sambar poured over and more on the side."
    ],
    ingredients: [
      { foodName: "Idli", grams: 240 },
      { foodName: "Sambar", grams: 300 }
    ]
  },
  {
    name: "Rajma Chawal",
    description: "Kidney-bean curry over steamed rice. Sunday food.",
    category: "lunch",
    dietFlag: "vegan",
    servings: 4,
    prepMinutes: 15,
    cookMinutes: 40,
    budget: true,
    steps: [
      "Soak the rajma overnight; pressure-cook until soft, keeping the cooking water.",
      "Brown the onion in oil, add tomato and cook to a thick masala with ginger, garlic and spices.",
      "Add rajma with its water; simmer 15 minutes, mashing a few beans to thicken.",
      "Serve over the steamed rice."
    ],
    ingredients: [
      { foodName: "Rajma (raw)", grams: 200 },
      { foodName: "Steamed Rice (cooked)", grams: 600 },
      { foodName: "Onion (raw)", grams: 100 },
      { foodName: "Tomato (raw)", grams: 150 },
      { foodName: "Cooking Oil (generic)", grams: 20 }
    ]
  },
  {
    name: "Chole with Brown Rice",
    description: "Amritsari-style chickpeas, tangy and dark, with brown rice.",
    category: "lunch",
    dietFlag: "vegan",
    servings: 4,
    prepMinutes: 15,
    cookMinutes: 45,
    budget: true,
    steps: [
      "Soak the chana overnight; pressure-cook with a tea bag or amla for colour.",
      "Cook onion and tomato down with chole masala until the oil separates.",
      "Add chana with its water; simmer 15–20 minutes.",
      "Serve over brown rice with sliced onion and lemon."
    ],
    ingredients: [
      { foodName: "Kabuli Chana (raw)", grams: 200 },
      { foodName: "Brown Rice (cooked)", grams: 600 },
      { foodName: "Onion (raw)", grams: 100 },
      { foodName: "Tomato (raw)", grams: 150 },
      { foodName: "Cooking Oil (generic)", grams: 20 }
    ]
  },
  {
    name: "Palak Paneer with Roti",
    description: "Spinach and paneer, lightly spiced, with two rotis.",
    category: "lunch",
    dietFlag: "veg",
    servings: 2,
    prepMinutes: 15,
    cookMinutes: 20,
    budget: false,
    steps: [
      "Blanch the spinach, cool and blend coarse — keep some texture.",
      "Soften onion and tomato in oil with cumin, ginger and garlic.",
      "Add the spinach, simmer 5 minutes, then fold in paneer cubes.",
      "Serve with hot rotis."
    ],
    ingredients: [
      { foodName: "Spinach (palak, raw)", grams: 300 },
      { foodName: "Paneer", grams: 150 },
      { foodName: "Onion (raw)", grams: 60 },
      { foodName: "Tomato (raw)", grams: 80 },
      { foodName: "Cooking Oil (generic)", grams: 10 },
      { foodName: "Roti / Chapati", grams: 120 }
    ]
  },
  {
    name: "Soya Chunks Curry with Rice",
    description: "The budget protein hero — meaty soya in a tomato-onion gravy.",
    category: "lunch",
    dietFlag: "vegan",
    servings: 2,
    prepMinutes: 10,
    cookMinutes: 25,
    budget: true,
    steps: [
      "Boil the soya chunks 5 minutes, cool and squeeze dry.",
      "Brown onion in oil, add tomato and spices; cook to a masala.",
      "Add the chunks with a splash of water; simmer 10 minutes so they drink the gravy.",
      "Serve over steamed rice."
    ],
    ingredients: [
      { foodName: "Soya Chunks (dry)", grams: 80 },
      { foodName: "Onion (raw)", grams: 80 },
      { foodName: "Tomato (raw)", grams: 100 },
      { foodName: "Cooking Oil (generic)", grams: 10 },
      { foodName: "Steamed Rice (cooked)", grams: 300 }
    ]
  },
  {
    name: "Dal Tadka with Jeera Rice",
    description: "Ghee-garlic tadka dal over cumin rice.",
    category: "lunch",
    dietFlag: "vegan",
    servings: 2,
    prepMinutes: 5,
    cookMinutes: 10,
    budget: true,
    steps: [
      "Warm the dal tadka and jeera rice.",
      "For a fresh tadka: sizzle garlic, dried red chilli and cumin in a spoon of oil and pour over the dal.",
      "Serve the dal over the rice with a wedge of lemon."
    ],
    ingredients: [
      { foodName: "Dal Tadka (cooked)", grams: 300 },
      { foodName: "Jeera Rice", grams: 300 }
    ]
  },
  {
    name: "Home-Style Chicken Curry with Rice",
    description: "Thin, spicy, everyday chicken curry — not the restaurant kind.",
    category: "lunch",
    dietFlag: "non_veg",
    servings: 2,
    prepMinutes: 10,
    cookMinutes: 15,
    budget: false,
    steps: [
      "Warm the chicken curry until the gravy is bubbling.",
      "Rest 5 minutes so the chicken stays juicy.",
      "Serve over steamed rice with onion and lemon on the side."
    ],
    ingredients: [
      { foodName: "Chicken Curry (home style)", grams: 300 },
      { foodName: "Steamed Rice (cooked)", grams: 300 }
    ]
  },
  {
    name: "Khichdi with Kadhi",
    description: "Soft moong-dal khichdi with a bowl of tangy kadhi. Comfort food.",
    category: "lunch",
    dietFlag: "veg",
    servings: 2,
    prepMinutes: 5,
    cookMinutes: 10,
    budget: true,
    steps: [
      "Warm the khichdi; loosen with a little hot water if it has set.",
      "Warm the kadhi gently — do not boil hard or it can split.",
      "Serve kadhi poured beside (or over) the khichdi, with papad if you have it."
    ],
    ingredients: [
      { foodName: "Khichdi (moong dal)", grams: 400 },
      { foodName: "Kadhi", grams: 200 }
    ]
  },
  {
    name: "Curd Rice with Pomegranate",
    description: "Cool, tempered curd rice — the South Indian reset button.",
    category: "lunch",
    dietFlag: "veg",
    servings: 2,
    prepMinutes: 10,
    cookMinutes: 5,
    budget: true,
    steps: [
      "Mash the warm rice slightly and mix with the curd and salt.",
      "Temper mustard seeds, curry leaves and a dried chilli in the oil; pour over.",
      "Fold in the pomegranate seeds. Serve cool."
    ],
    ingredients: [
      { foodName: "Steamed Rice (cooked)", grams: 300 },
      { foodName: "Curd (dahi)", grams: 200 },
      { foodName: "Pomegranate", grams: 40 },
      { foodName: "Cooking Oil (generic)", grams: 5 }
    ]
  },
  {
    name: "Grilled Chicken with Corn & Salad",
    description: "High-protein plate: grilled chicken, sweet corn, crunchy salad.",
    category: "dinner",
    dietFlag: "non_veg",
    servings: 1,
    prepMinutes: 10,
    cookMinutes: 15,
    budget: false,
    steps: [
      "Grill or pan-sear the chicken until cooked through; rest 5 minutes and slice.",
      "Warm the sweet corn with a pinch of salt and chilli flakes.",
      "Plate with carrot sticks and cucumber, lemon over everything."
    ],
    ingredients: [
      { foodName: "Grilled Chicken Breast", grams: 150 },
      { foodName: "Sweet Corn (boiled)", grams: 100 },
      { foodName: "Carrot (raw)", grams: 80 },
      { foodName: "Cucumber", grams: 100 }
    ]
  },
  {
    name: "Moong Dal Soup with Toast",
    description: "Light, peppery dal soup — a gentle dinner.",
    category: "dinner",
    dietFlag: "vegan",
    servings: 2,
    prepMinutes: 5,
    cookMinutes: 10,
    budget: true,
    steps: [
      "Thin the cooked moong dal with hot water to a soup consistency.",
      "Simmer with black pepper, cumin and a squeeze of lemon.",
      "Serve with crisp whole-wheat toast soldiers."
    ],
    ingredients: [
      { foodName: "Moong Dal (cooked, plain)", grams: 600 },
      { foodName: "Bread (whole wheat)", grams: 50 }
    ]
  },
  {
    name: "Mixed Veg Sabzi with Roti",
    description: "Whatever's in the fridge, cooked dry-style with rotis.",
    category: "dinner",
    dietFlag: "vegan",
    servings: 2,
    prepMinutes: 5,
    cookMinutes: 10,
    budget: true,
    steps: [
      "Warm the mixed vegetable sabzi.",
      "Puff the rotis directly on the flame or a dry tawa.",
      "Serve with a small bowl of curd or pickle if you like."
    ],
    ingredients: [
      { foodName: "Mixed Vegetable Sabzi", grams: 300 },
      { foodName: "Roti / Chapati", grams: 120 }
    ]
  },
  {
    name: "Egg Curry with Rice",
    description: "Boiled eggs simmered in a tomato-onion curry, over rice.",
    category: "dinner",
    dietFlag: "eggetarian",
    servings: 2,
    prepMinutes: 5,
    cookMinutes: 10,
    budget: true,
    steps: [
      "Warm the egg curry until the gravy bubbles gently.",
      "Serve over steamed rice with fresh coriander."
    ],
    ingredients: [
      { foodName: "Egg Curry", grams: 250 },
      { foodName: "Steamed Rice (cooked)", grams: 300 }
    ]
  },
  {
    name: "Tandoori Chicken Plate",
    description: "Smoky tandoori chicken with onion and cucumber salad.",
    category: "dinner",
    dietFlag: "non_veg",
    servings: 2,
    prepMinutes: 10,
    cookMinutes: 15,
    budget: false,
    steps: [
      "Roast or grill the tandoori chicken until charred at the edges.",
      "Rest, then serve with raw onion rings and cucumber, lemon over the top."
    ],
    ingredients: [
      { foodName: "Tandoori Chicken", grams: 200 },
      { foodName: "Onion (raw)", grams: 50 },
      { foodName: "Cucumber", grams: 100 }
    ]
  },
  {
    name: "Bhindi Masala, Dal & Roti",
    description: "A full home thali: bhindi, dal tadka and rotis.",
    category: "dinner",
    dietFlag: "vegan",
    servings: 2,
    prepMinutes: 5,
    cookMinutes: 12,
    budget: true,
    steps: [
      "Warm the bhindi masala and dal tadka.",
      "Puff the rotis fresh.",
      "Serve as a thali with onion and lemon."
    ],
    ingredients: [
      { foodName: "Bhindi Masala", grams: 200 },
      { foodName: "Dal Tadka (cooked)", grams: 200 },
      { foodName: "Roti / Chapati", grams: 90 }
    ]
  },
  {
    name: "Roasted Makhana Chaat",
    description: "Fox-nut chaat — crunchy, tangy, very snackable.",
    category: "snacks",
    dietFlag: "vegan",
    servings: 2,
    prepMinutes: 5,
    cookMinutes: null,
    budget: true,
    steps: [
      "Toss the roasted makhana with chopped onion and tomato.",
      "Season with chaat masala, salt and lemon juice. Eat immediately, before it softens."
    ],
    ingredients: [
      { foodName: "Roasted Makhana", grams: 50 },
      { foodName: "Onion (raw)", grams: 30 },
      { foodName: "Tomato (raw)", grams: 40 }
    ]
  },
  {
    name: "Greek Yogurt Fruit Bowl",
    description: "Thick yogurt with banana, apple, honey and walnuts.",
    category: "snacks",
    dietFlag: "veg",
    servings: 2,
    prepMinutes: 5,
    cookMinutes: null,
    budget: false,
    steps: [
      "Spoon the Greek yogurt into bowls.",
      "Top with chopped banana and apple.",
      "Drizzle the honey and scatter the walnuts."
    ],
    ingredients: [
      { foodName: "Greek Yogurt (plain)", grams: 200 },
      { foodName: "Banana", grams: 80 },
      { foodName: "Apple", grams: 80 },
      { foodName: "Honey", grams: 10 },
      { foodName: "Walnuts", grams: 10 }
    ]
  },
  {
    name: "Peanut Chaat",
    description: "Roasted peanuts with raw onion, tomato and cucumber.",
    category: "snacks",
    dietFlag: "vegan",
    servings: 2,
    prepMinutes: 5,
    cookMinutes: null,
    budget: true,
    steps: [
      "Mix the peanuts with finely chopped onion, tomato and cucumber.",
      "Add salt, chilli and lemon juice. Serve at once."
    ],
    ingredients: [
      { foodName: "Peanuts (roasted)", grams: 60 },
      { foodName: "Onion (raw)", grams: 40 },
      { foodName: "Tomato (raw)", grams: 50 },
      { foodName: "Cucumber", grams: 50 }
    ]
  },
  {
    name: "Chaas & Roasted Chana",
    description: "Spiced buttermilk with a handful of roasted chana.",
    category: "snacks",
    dietFlag: "veg",
    servings: 2,
    prepMinutes: 5,
    cookMinutes: null,
    budget: true,
    steps: [
      "Whisk the chaas with roasted cumin powder and black salt.",
      "Serve cold with the roasted chana on the side."
    ],
    ingredients: [
      { foodName: "Chaas (buttermilk)", grams: 400 },
      { foodName: "Roasted Chana", grams: 40 }
    ]
  },
  {
    name: "Dahi Paneer Chaat",
    description: "Chilled paneer cubes folded through spiced curd.",
    category: "snacks",
    dietFlag: "veg",
    servings: 2,
    prepMinutes: 10,
    cookMinutes: null,
    budget: false,
    steps: [
      "Whisk the curd with salt, roasted cumin and a pinch of sugar.",
      "Fold in paneer cubes and chill 10 minutes.",
      "Top with chilli flakes or chaat masala and serve cold."
    ],
    ingredients: [
      { foodName: "Paneer", grams: 200 },
      { foodName: "Curd (dahi)", grams: 50 }
    ]
  },
  {
    name: "Sweet Corn Chaat",
    description: "Buttered sweet corn with onion, tomato and chaat masala.",
    category: "snacks",
    dietFlag: "veg",
    servings: 2,
    prepMinutes: 5,
    cookMinutes: 5,
    budget: true,
    steps: [
      "Warm the sweet corn with the butter until glossy.",
      "Toss with onion, tomato, chaat masala and lemon juice."
    ],
    ingredients: [
      { foodName: "Sweet Corn (boiled)", grams: 200 },
      { foodName: "Onion (raw)", grams: 30 },
      { foodName: "Tomato (raw)", grams: 40 },
      { foodName: "Butter", grams: 5 }
    ]
  }
];

// server/src/actions.ts
var SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
var PBKDF2_ITERATIONS = 120000;
function bytesToHex(bytes) {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function bytesToB64(bytes) {
  let s = "";
  for (const b of bytes)
    s += String.fromCharCode(b);
  return btoa(s);
}
function b64ToBuffer(b64) {
  const s = atob(b64);
  const buf = new ArrayBuffer(s.length);
  const out = new Uint8Array(buf);
  for (let i = 0;i < s.length; i++)
    out[i] = s.charCodeAt(i);
  return buf;
}
async function sha256Hex(text) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return bytesToHex(new Uint8Array(digest));
}
async function hashPassword(password, saltB64) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({
    name: "PBKDF2",
    salt: b64ToBuffer(saltB64),
    iterations: PBKDF2_ITERATIONS,
    hash: "SHA-256"
  }, key, 256);
  return bytesToB64(new Uint8Array(bits));
}
function newSalt() {
  return bytesToB64(crypto.getRandomValues(new Uint8Array(16)));
}
function newToken() {
  return bytesToHex(crypto.getRandomValues(new Uint8Array(32)));
}
async function createSession(db, userId, userAgent) {
  const token = newToken();
  const tokenHash = await sha256Hex(token);
  const now = new Date;
  await db.insert(sessions).values({
    userId,
    tokenHash,
    userAgent: userAgent?.trim() ? userAgent.trim().slice(0, 300) : null,
    createdAt: now,
    expiresAt: new Date(now.getTime() + SESSION_TTL_MS)
  });
  return token;
}
async function resolveUserId(db, token) {
  const tokenHash = await sha256Hex(token);
  const rows = await db.select().from(sessions).where(eq(sessions.tokenHash, tokenHash)).limit(1);
  const session = rows[0];
  if (!session)
    return { error: "invalid" };
  if (session.expiresAt.getTime() <= Date.now()) {
    await db.delete(sessions).where(eq(sessions.id, session.id));
    return { error: "expired" };
  }
  return { userId: session.userId };
}
async function isAdmin(db, userId) {
  const rows = await db.select({ userId: adminRoles.userId }).from(adminRoles).where(eq(adminRoles.userId, userId)).limit(1);
  return rows.length > 0;
}
async function adminCount(db) {
  const rows = await db.select({ userId: adminRoles.userId }).from(adminRoles);
  return rows.length;
}
async function requireAdmin(db, token) {
  const resolved = await resolveUserId(db, token);
  if ("error" in resolved)
    return { error: "You are not signed in." };
  if (!await isAdmin(db, resolved.userId))
    return { error: "Admin access required." };
  const rows = await db.select({ email: users.email }).from(users).where(eq(users.id, resolved.userId)).limit(1);
  return { userId: resolved.userId, email: rows[0]?.email ?? "" };
}
async function logAdminAction(db, admin, action, entityType, entityId, summary) {
  await db.insert(adminAuditLog).values({
    adminUserId: admin.userId,
    adminEmail: admin.email,
    action,
    entityType,
    entityId,
    summary: summary.slice(0, 300),
    createdAt: new Date
  });
}
var profileShape = object({
  email: string2(),
  memberSince: string2(),
  displayName: string2(),
  dateOfBirth: string2().nullable(),
  heightCm: number2().nullable(),
  weightKg: number2().nullable(),
  sex: _enum(["male", "female", "other"]).nullable(),
  activityLevel: _enum(["sedentary", "light", "moderate", "active", "very_active"]).nullable(),
  experience: _enum(["beginner", "intermediate", "advanced"]).nullable(),
  onboardingCompleted: boolean2(),
  mainGoal: _enum(["muscle_gain", "fat_loss", "maintenance", "general_fitness", "strength"]).nullable(),
  targetWeightKg: number2().nullable(),
  calorieTargetOverride: number2().nullable(),
  dietPreference: _enum(["vegetarian", "vegan", "eggetarian", "non_vegetarian", "custom"]).nullable(),
  dietCustomNote: string2().nullable(),
  allergies: string2().nullable(),
  trainingDaysPerWeek: number2().nullable(),
  equipment: _enum(["full_gym", "home_equipment", "bodyweight", "custom"]).nullable(),
  equipmentCustomNote: string2().nullable(),
  units: _enum(["metric", "imperial"]),
  notifyMeals: boolean2(),
  notifyWater: boolean2(),
  notifyWorkouts: boolean2(),
  profilePrivate: boolean2()
});
async function loadProfile(db, userId) {
  const userRows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const user = userRows[0];
  if (!user)
    return null;
  const [profileRows, goalRows, prefRows] = await Promise.all([
    db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1),
    db.select().from(userGoals).where(eq(userGoals.userId, userId)).limit(1),
    db.select().from(userPreferences).where(eq(userPreferences.userId, userId)).limit(1)
  ]);
  const p = profileRows[0];
  const g = goalRows[0];
  const pref = prefRows[0];
  return {
    email: user.email,
    memberSince: user.createdAt.toISOString(),
    displayName: p?.displayName ?? user.displayName,
    dateOfBirth: p?.dateOfBirth ?? null,
    heightCm: p?.heightCm ?? null,
    weightKg: p?.weightKg ?? null,
    sex: p?.sex ?? null,
    activityLevel: p?.activityLevel ?? null,
    experience: p?.experience ?? null,
    onboardingCompleted: (p?.onboardingCompleted ?? 0) === 1,
    mainGoal: g?.mainGoal ?? null,
    targetWeightKg: g?.targetWeightKg ?? null,
    calorieTargetOverride: g?.calorieTargetOverride ?? null,
    dietPreference: pref?.dietPreference ?? null,
    dietCustomNote: pref?.dietCustomNote ?? null,
    allergies: pref?.allergies ?? null,
    trainingDaysPerWeek: pref?.trainingDaysPerWeek ?? null,
    equipment: pref?.equipment ?? null,
    equipmentCustomNote: pref?.equipmentCustomNote ?? null,
    units: pref?.units ?? "metric",
    notifyMeals: (pref?.notifyMeals ?? 0) === 1,
    notifyWater: (pref?.notifyWater ?? 0) === 1,
    notifyWorkouts: (pref?.notifyWorkouts ?? 0) === 1,
    profilePrivate: (pref?.profilePrivate ?? 1) === 1
  };
}
var targetsShape = object({
  status: _enum(["ok", "manual", "missing_inputs"]),
  bmr: number2().nullable(),
  tdee: number2().nullable(),
  calorieTarget: number2().nullable(),
  proteinG: number2().nullable(),
  carbsG: number2().nullable(),
  fatG: number2().nullable(),
  fibreG: number2().nullable(),
  missing: array(string2()),
  note: string2()
});
var ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9
};
function ageFromDob(dob, now) {
  const birth = new Date(`${dob}T00:00:00Z`);
  if (Number.isNaN(birth.getTime()))
    return null;
  let age = now.getUTCFullYear() - birth.getUTCFullYear();
  const m = now.getUTCMonth() - birth.getUTCMonth();
  if (m < 0 || m === 0 && now.getUTCDate() < birth.getUTCDate())
    age -= 1;
  return age >= 5 && age <= 110 ? age : null;
}
function computeTargets(profile) {
  const missing = [];
  const age = profile.dateOfBirth ? ageFromDob(profile.dateOfBirth, new Date) : null;
  if (age == null)
    missing.push("date of birth");
  if (profile.heightCm == null)
    missing.push("height");
  if (profile.weightKg == null)
    missing.push("current weight");
  if (profile.sex == null)
    missing.push("sex (used by the BMR formula)");
  if (profile.activityLevel == null)
    missing.push("activity level");
  const proteinPerKg = profile.mainGoal === "fat_loss" ? 2 : profile.mainGoal === "muscle_gain" || profile.mainGoal === "strength" ? 1.8 : 1.6;
  if (profile.calorieTargetOverride != null && profile.weightKg != null) {
    const kcal = profile.calorieTargetOverride;
    const proteinG = Math.round(profile.weightKg * proteinPerKg);
    const fatG = Math.round(kcal * 0.25 / 9);
    const carbsG = Math.max(0, Math.round((kcal - proteinG * 4 - fatG * 9) / 4));
    return {
      status: "manual",
      bmr: null,
      tdee: null,
      calorieTarget: kcal,
      proteinG,
      carbsG,
      fatG,
      fibreG: Math.round(kcal / 1000 * 14),
      missing: [],
      note: "You set this calorie target manually. Macro split: protein by body weight, fat at 25% of calories, carbohydrates for the remainder."
    };
  }
  if (missing.length > 0 || age == null || profile.heightCm == null || profile.weightKg == null || profile.sex == null || profile.activityLevel == null) {
    return {
      status: "missing_inputs",
      bmr: null,
      tdee: null,
      calorieTarget: null,
      proteinG: null,
      carbsG: null,
      fatG: null,
      fibreG: null,
      missing,
      note: "Add the missing details in your profile to calculate an estimated daily target."
    };
  }
  const base = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * age;
  const bmr = profile.sex === "male" ? base + 5 : profile.sex === "female" ? base - 161 : base - 78;
  const multiplier = ACTIVITY_MULTIPLIERS[profile.activityLevel] ?? 1.2;
  const tdee = bmr * multiplier;
  let adjustment = 0;
  if (profile.mainGoal === "fat_loss")
    adjustment = -450;
  else if (profile.mainGoal === "muscle_gain")
    adjustment = 300;
  else if (profile.mainGoal === "strength")
    adjustment = 200;
  let calorieTarget = Math.round(tdee + adjustment);
  const floor = Math.max(1200, Math.round(bmr));
  if (calorieTarget < floor)
    calorieTarget = floor;
  const proteinG = Math.round(profile.weightKg * proteinPerKg);
  const fatG = Math.round(calorieTarget * 0.25 / 9);
  const carbsG = Math.max(0, Math.round((calorieTarget - proteinG * 4 - fatG * 9) / 4));
  return {
    status: "ok",
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    calorieTarget,
    proteinG,
    carbsG,
    fatG,
    fibreG: Math.round(calorieTarget / 1000 * 14),
    missing: [],
    note: "Estimate from the Mifflin–St Jeor equation (BMR) × your activity level (TDEE), adjusted for your goal. " + (profile.sex === "other" ? "The published formula defines male/female constants; yours averages the two. " : "") + "Exercise calories are not added back automatically. These are estimates, not medical advice."
  };
}
var foodShape = object({
  id: number2(),
  name: string2(),
  aliases: string2(),
  category: string2(),
  cuisine: string2(),
  dietFlag: _enum(["veg", "vegan", "eggetarian", "non_veg"]),
  kcalPer100: number2(),
  proteinPer100: number2(),
  carbsPer100: number2(),
  fatPer100: number2(),
  fibrePer100: number2(),
  servingName: string2(),
  servingGrams: number2(),
  source: string2(),
  verification: _enum(["estimate", "verified", "user"]),
  notes: string2().nullable(),
  isCustom: boolean2(),
  isFavourite: boolean2()
});
var MEALS = ["breakfast", "lunch", "snacks", "dinner", "custom"];
var mealEnum = _enum(["breakfast", "lunch", "snacks", "dinner", "custom"]);
var entryShape = object({
  id: number2(),
  foodId: number2().nullable(),
  foodName: string2(),
  meal: mealEnum,
  quantityGrams: number2(),
  servings: number2().nullable(),
  servingName: string2(),
  servingGrams: number2(),
  kcal: number2(),
  protein: number2(),
  carbs: number2(),
  fat: number2(),
  fibre: number2()
});
function entryPayload(e) {
  const f = e.quantityGrams / 100;
  const r1 = (n) => Math.round(n * 10) / 10;
  return {
    id: e.id,
    foodId: e.foodId,
    foodName: e.foodName,
    meal: e.meal,
    quantityGrams: e.quantityGrams,
    servings: e.servings,
    servingName: e.servingName,
    servingGrams: e.servingGrams,
    kcal: r1(e.kcalPer100 * f),
    protein: r1(e.proteinPer100 * f),
    carbs: r1(e.carbsPer100 * f),
    fat: r1(e.fatPer100 * f),
    fibre: r1(e.fibrePer100 * f)
  };
}
var totalsShape = object({
  kcal: number2(),
  protein: number2(),
  carbs: number2(),
  fat: number2(),
  fibre: number2()
});
function sumTotals(entries) {
  const r1 = (n) => Math.round(n * 10) / 10;
  return {
    kcal: r1(entries.reduce((s, e) => s + e.kcal, 0)),
    protein: r1(entries.reduce((s, e) => s + e.protein, 0)),
    carbs: r1(entries.reduce((s, e) => s + e.carbs, 0)),
    fat: r1(entries.reduce((s, e) => s + e.fat, 0)),
    fibre: r1(entries.reduce((s, e) => s + e.fibre, 0))
  };
}
function foodPayload(f, favouriteIds) {
  return {
    id: f.id,
    name: f.name,
    aliases: f.aliases,
    category: f.category,
    cuisine: f.cuisine,
    dietFlag: f.dietFlag,
    kcalPer100: f.kcalPer100,
    proteinPer100: f.proteinPer100,
    carbsPer100: f.carbsPer100,
    fatPer100: f.fatPer100,
    fibrePer100: f.fibrePer100,
    servingName: f.servingName,
    servingGrams: f.servingGrams,
    source: f.source,
    verification: f.verification,
    notes: f.notes,
    isCustom: f.ownerUserId != null,
    isFavourite: favouriteIds.has(f.id)
  };
}
async function ensureFoodCatalog(db) {
  const existing = await db.select({ name: foods.name }).from(foods).where(isNull(foods.ownerUserId));
  const have = new Set(existing.map((r) => r.name));
  const missing = SEED_FOODS.filter((f) => !have.has(f.name));
  if (missing.length === 0)
    return;
  await db.insert(foods).values(missing.map((f) => ({
    name: f.name,
    aliases: f.aliases,
    category: f.category,
    cuisine: f.cuisine,
    dietFlag: f.dietFlag,
    kcalPer100: f.kcal,
    proteinPer100: f.protein,
    carbsPer100: f.carbs,
    fatPer100: f.fat,
    fibrePer100: f.fibre,
    servingName: f.servingName,
    servingGrams: f.servingGrams,
    source: FOOD_SOURCE,
    verification: "estimate",
    notes: f.notes ?? null,
    ownerUserId: null
  })));
}
async function favouriteIdSet(db, userId) {
  const rows = await db.select({ foodId: favouriteFoods.foodId }).from(favouriteFoods).where(eq(favouriteFoods.userId, userId));
  return new Set(rows.map((r) => r.foodId));
}
async function visibleFoods(db, userId) {
  return db.select().from(foods).where(or(isNull(foods.ownerUserId), eq(foods.ownerUserId, userId)));
}
async function diaryForDate(db, userId, date) {
  const rows = await db.select().from(diaryEntries).where(and(eq(diaryEntries.userId, userId), eq(diaryEntries.loggedOn, date))).orderBy(asc(diaryEntries.id));
  return rows.map(entryPayload);
}
function bmiOf(profile) {
  if (profile.heightCm == null || profile.weightKg == null)
    return null;
  const m = profile.heightCm / 100;
  if (m <= 0)
    return null;
  const value = Math.round(profile.weightKg / (m * m) * 10) / 10;
  const category = value < 18.5 ? "Below 18.5" : value < 25 ? "18.5 – 24.9" : value < 30 ? "25 – 29.9" : "30 or above";
  return { value, category };
}
var exerciseShape = object({
  id: number2(),
  name: string2(),
  primaryMuscle: string2(),
  secondaryMuscles: string2(),
  equipment: string2(),
  difficulty: _enum(["beginner", "intermediate", "advanced"]),
  pattern: string2(),
  kind: _enum(["weighted", "bodyweight", "timed"]),
  instructions: string2(),
  mistakes: string2(),
  suggestedSets: number2(),
  suggestedReps: string2(),
  restSeconds: number2()
});
function exercisePayload(e) {
  return {
    id: e.id,
    name: e.name,
    primaryMuscle: e.primaryMuscle,
    secondaryMuscles: e.secondaryMuscles,
    equipment: e.equipment,
    difficulty: e.difficulty,
    pattern: e.pattern,
    kind: e.kind,
    instructions: e.instructions,
    mistakes: e.mistakes,
    suggestedSets: e.suggestedSets,
    suggestedReps: e.suggestedReps,
    restSeconds: e.restSeconds
  };
}
async function ensureExerciseLibrary(db) {
  const existing = await db.select({ name: exercises.name }).from(exercises);
  const have = new Set(existing.map((r) => r.name));
  const missing = SEED_EXERCISES.filter((e) => !have.has(e.name));
  if (missing.length === 0)
    return;
  await db.insert(exercises).values(missing.map((e) => ({
    name: e.name,
    primaryMuscle: e.primaryMuscle,
    secondaryMuscles: e.secondaryMuscles,
    equipment: e.equipment,
    difficulty: e.difficulty,
    pattern: e.pattern,
    kind: e.kind,
    instructions: e.instructions,
    mistakes: e.mistakes,
    suggestedSets: e.suggestedSets,
    suggestedReps: e.suggestedReps,
    restSeconds: e.restSeconds
  })));
}
async function exerciseByName(db, name) {
  const rows = await db.select().from(exercises).where(eq(exercises.name, name)).limit(1);
  return rows[0] ?? null;
}
var routineShape = object({
  id: number2(),
  name: string2(),
  notes: string2().nullable(),
  sourceTemplate: string2().nullable(),
  exerciseCount: number2()
});
var routineExerciseShape = object({
  id: number2(),
  exerciseId: number2(),
  exerciseName: string2(),
  primaryMuscle: string2(),
  equipment: string2(),
  kind: _enum(["weighted", "bodyweight", "timed"]),
  position: number2(),
  targetSets: number2(),
  targetReps: string2(),
  restSeconds: number2(),
  notes: string2().nullable()
});
var setShape = object({
  id: number2(),
  setNumber: number2(),
  reps: number2().nullable(),
  loadKg: number2().nullable(),
  durationSeconds: number2().nullable(),
  completed: boolean2()
});
var sessionExerciseShape = object({
  id: number2(),
  exerciseId: number2(),
  exerciseName: string2(),
  primaryMuscle: string2(),
  kind: _enum(["weighted", "bodyweight", "timed"]),
  position: number2(),
  restSeconds: number2(),
  skipped: boolean2(),
  notes: string2().nullable(),
  sets: array(setShape)
});
var sessionShape = object({
  id: number2(),
  title: string2(),
  status: _enum(["in_progress", "completed"]),
  routineId: number2().nullable(),
  startedOn: string2(),
  startedAt: string2(),
  endedAt: string2().nullable(),
  durationSeconds: number2().nullable(),
  notes: string2().nullable(),
  exercises: array(sessionExerciseShape),
  totalVolumeKg: number2(),
  completedSets: number2()
});
function setVolumeKg(s) {
  if (s.completed !== 1 || s.reps == null || s.loadKg == null)
    return 0;
  return s.reps * s.loadKg;
}
async function sessionPayload(db, session) {
  const exRows = await db.select().from(sessionExercises).where(eq(sessionExercises.sessionId, session.id)).orderBy(asc(sessionExercises.position), asc(sessionExercises.id));
  const exercises2 = [];
  let volume = 0;
  let completedSets = 0;
  for (const ex of exRows) {
    const sets = await db.select().from(workoutSets).where(eq(workoutSets.sessionExerciseId, ex.id)).orderBy(asc(workoutSets.setNumber), asc(workoutSets.id));
    if (ex.skipped !== 1) {
      for (const s of sets) {
        volume += setVolumeKg(s);
        if (s.completed === 1)
          completedSets += 1;
      }
    }
    exercises2.push({
      id: ex.id,
      exerciseId: ex.exerciseId,
      exerciseName: ex.exerciseName,
      primaryMuscle: ex.primaryMuscle,
      kind: ex.kind,
      position: ex.position,
      restSeconds: ex.restSeconds,
      skipped: ex.skipped === 1,
      notes: ex.notes,
      sets: sets.map((s) => ({
        id: s.id,
        setNumber: s.setNumber,
        reps: s.reps,
        loadKg: s.loadKg,
        durationSeconds: s.durationSeconds,
        completed: s.completed === 1
      }))
    });
  }
  return {
    id: session.id,
    title: session.title,
    status: session.status,
    routineId: session.routineId,
    startedOn: session.startedOn,
    startedAt: session.startedAt.toISOString(),
    endedAt: session.endedAt ? session.endedAt.toISOString() : null,
    durationSeconds: session.durationSeconds,
    notes: session.notes,
    exercises: exercises2,
    totalVolumeKg: Math.round(volume * 10) / 10,
    completedSets
  };
}
async function ownRoutine(db, userId, routineId) {
  const rows = await db.select().from(routines).where(and(eq(routines.id, routineId), eq(routines.userId, userId))).limit(1);
  return rows[0] ?? null;
}
async function ownSession(db, userId, sessionId) {
  const rows = await db.select().from(workoutSessions).where(and(eq(workoutSessions.id, sessionId), eq(workoutSessions.userId, userId))).limit(1);
  return rows[0] ?? null;
}
async function ownSessionExercise(db, userId, sessionExerciseId) {
  const rows = await db.select().from(sessionExercises).where(eq(sessionExercises.id, sessionExerciseId)).limit(1);
  const ex = rows[0];
  if (!ex)
    return null;
  const session = await ownSession(db, userId, ex.sessionId);
  if (!session)
    return null;
  return { ex, session };
}
async function ownSet(db, userId, setId) {
  const rows = await db.select().from(workoutSets).where(eq(workoutSets.id, setId)).limit(1);
  const set = rows[0];
  if (!set)
    return null;
  const found = await ownSessionExercise(db, userId, set.sessionExerciseId);
  if (!found)
    return null;
  return { set, session: found.session };
}
async function allCompletedSets(db, userId) {
  const sessions2 = await db.select().from(workoutSessions).where(and(eq(workoutSessions.userId, userId), eq(workoutSessions.status, "completed")));
  if (sessions2.length === 0)
    return [];
  const sessionById = new Map(sessions2.map((s) => [s.id, s]));
  const exRows = await db.select().from(sessionExercises).where(inArray(sessionExercises.sessionId, sessions2.map((s) => s.id)));
  const exById = new Map(exRows.map((e) => [e.id, e]));
  const setRows = await db.select().from(workoutSets).where(and(inArray(workoutSets.sessionExerciseId, exRows.map((e) => e.id)), eq(workoutSets.completed, 1)));
  const out = [];
  for (const s of setRows) {
    const ex = exById.get(s.sessionExerciseId);
    if (!ex || ex.skipped === 1)
      continue;
    const session = sessionById.get(ex.sessionId);
    if (!session)
      continue;
    out.push({
      exerciseId: ex.exerciseId,
      exerciseName: ex.exerciseName,
      kind: ex.kind,
      date: session.startedOn,
      reps: s.reps,
      loadKg: s.loadKg,
      durationSeconds: s.durationSeconds
    });
  }
  return out;
}
var prShape = object({
  exerciseId: number2(),
  exerciseName: string2(),
  kind: _enum(["weighted", "bodyweight", "timed"]),
  heaviestLoadKg: number2().nullable(),
  heaviestReps: number2().nullable(),
  estimatedOneRmKg: number2().nullable(),
  bestReps: number2().nullable(),
  longestSeconds: number2().nullable(),
  lastTrainedOn: string2().nullable()
});
function computePrs(done) {
  const byExercise = new Map;
  for (const s of done) {
    const list = byExercise.get(s.exerciseId) ?? [];
    list.push(s);
    byExercise.set(s.exerciseId, list);
  }
  const prs = [];
  for (const [exerciseId, sets] of byExercise) {
    const first = sets[0];
    if (!first)
      continue;
    let heaviestLoadKg = null;
    let heaviestReps = null;
    let estimatedOneRmKg = null;
    let bestReps = null;
    let longestSeconds = null;
    let lastTrainedOn = null;
    for (const s of sets) {
      if (lastTrainedOn == null || s.date > lastTrainedOn)
        lastTrainedOn = s.date;
      if (s.loadKg != null && s.loadKg > 0) {
        if (heaviestLoadKg == null || s.loadKg > heaviestLoadKg) {
          heaviestLoadKg = s.loadKg;
          heaviestReps = s.reps;
        } else if (s.loadKg === heaviestLoadKg) {
          if ((s.reps ?? 0) > (heaviestReps ?? 0))
            heaviestReps = s.reps;
        }
        if (s.reps != null && s.reps >= 1) {
          const est = s.loadKg * (1 + s.reps / 30);
          if (estimatedOneRmKg == null || est > estimatedOneRmKg)
            estimatedOneRmKg = Math.round(est * 10) / 10;
        }
      }
      if (s.reps != null && (bestReps == null || s.reps > bestReps))
        bestReps = s.reps;
      if (s.durationSeconds != null && (longestSeconds == null || s.durationSeconds > longestSeconds))
        longestSeconds = s.durationSeconds;
    }
    prs.push({
      exerciseId,
      exerciseName: first.exerciseName,
      kind: first.kind,
      heaviestLoadKg,
      heaviestReps,
      estimatedOneRmKg,
      bestReps,
      longestSeconds,
      lastTrainedOn
    });
  }
  prs.sort((a, b) => (b.lastTrainedOn ?? "").localeCompare(a.lastTrainedOn ?? ""));
  return prs;
}
var trainingShape = object({
  workoutsThisWeek: number2(),
  totalWorkouts: number2(),
  dayStreak: number2(),
  activeSessionId: number2().nullable(),
  lastWorkout: object({
    title: string2(),
    startedOn: string2(),
    durationSeconds: number2().nullable()
  }).nullable(),
  latestPrs: array(prShape)
});
var EMPTY_TRAINING = {
  workoutsThisWeek: 0,
  totalWorkouts: 0,
  dayStreak: 0,
  activeSessionId: null,
  lastWorkout: null,
  latestPrs: []
};
async function trainingSummary(db, userId, today, weekStart) {
  const sessions2 = await db.select().from(workoutSessions).where(eq(workoutSessions.userId, userId)).orderBy(desc(workoutSessions.startedAt));
  const completed = sessions2.filter((s) => s.status === "completed");
  const active = sessions2.find((s) => s.status === "in_progress") ?? null;
  const days = new Set(completed.map((s) => s.startedOn));
  let streak = 0;
  const cursor = new Date(`${today}T00:00:00Z`);
  if (!days.has(today))
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  for (;; ) {
    const key = cursor.toISOString().slice(0, 10);
    if (!days.has(key))
      break;
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  const last = completed[0] ?? null;
  const prs = computePrs(await allCompletedSets(db, userId));
  return {
    workoutsThisWeek: completed.filter((s) => s.startedOn >= weekStart && s.startedOn <= today).length,
    totalWorkouts: completed.length,
    dayStreak: streak,
    activeSessionId: active ? active.id : null,
    lastWorkout: last ? {
      title: last.title,
      startedOn: last.startedOn,
      durationSeconds: last.durationSeconds
    } : null,
    latestPrs: prs.slice(0, 3)
  };
}
function shiftDateStr(iso, days) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
function daysBetween(a, b) {
  const ms = new Date(`${b}T00:00:00Z`).getTime() - new Date(`${a}T00:00:00Z`).getTime();
  return Math.round(ms / 86400000);
}
var r1 = (n) => Math.round(n * 10) / 10;
var r2 = (n) => Math.round(n * 100) / 100;
var WATER_SUGGESTED_ML = 2500;
async function waterTarget(db, userId) {
  const rows = await db.select({ waterTargetMl: userPreferences.waterTargetMl }).from(userPreferences).where(eq(userPreferences.userId, userId)).limit(1);
  const t = rows[0]?.waterTargetMl ?? null;
  return { targetMl: t ?? WATER_SUGGESTED_ML, isCustom: t != null };
}
async function waterTotalForDate(db, userId, date) {
  const rows = await db.select({ amountMl: waterEntries.amountMl }).from(waterEntries).where(and(eq(waterEntries.userId, userId), eq(waterEntries.loggedOn, date)));
  return rows.reduce((s, r) => s + r.amountMl, 0);
}
var recipeCategoryEnum = _enum(["breakfast", "lunch", "dinner", "snacks"]);
var recipeShape = object({
  id: number2(),
  name: string2(),
  description: string2(),
  category: recipeCategoryEnum,
  dietFlag: _enum(["veg", "vegan", "eggetarian", "non_veg"]),
  servings: number2(),
  prepMinutes: number2(),
  cookMinutes: number2().nullable(),
  budget: boolean2(),
  isOwn: boolean2(),
  isFavourite: boolean2(),
  perServing: totalsShape,
  highProtein: boolean2()
});
var recipeIngredientShape = object({
  id: number2(),
  foodId: number2().nullable(),
  name: string2(),
  quantityGrams: number2(),
  kcal: number2(),
  protein: number2(),
  carbs: number2(),
  fat: number2(),
  fibre: number2()
});
var recipeDetailShape = recipeShape.extend({
  steps: array(string2()),
  ingredients: array(recipeIngredientShape),
  totals: totalsShape,
  methodNote: string2()
});
var RECIPE_METHOD_NOTE = "Per-serving values are calculated from the catalogue values of the ingredients (grams × per-100 g values ÷ servings). Estimates — home preparation varies.";
async function ensureRecipeLibrary(db) {
  await ensureFoodCatalog(db);
  const existing = await db.select({ name: recipes.name }).from(recipes).where(isNull(recipes.ownerUserId));
  const have = new Set(existing.map((r) => r.name));
  const missing = SEED_RECIPES.filter((r) => !have.has(r.name));
  if (missing.length === 0)
    return;
  const foods2 = await db.select().from(foods).where(isNull(foods.ownerUserId));
  const foodByName = new Map(foods2.map((f) => [f.name, f]));
  for (const r of missing) {
    const inserted = await db.insert(recipes).values({
      name: r.name,
      description: r.description,
      category: r.category,
      dietFlag: r.dietFlag,
      servings: r.servings,
      prepMinutes: r.prepMinutes,
      cookMinutes: r.cookMinutes,
      steps: r.steps.join(`
`),
      budget: r.budget ? 1 : 0,
      ownerUserId: null
    }).returning();
    const row = inserted[0];
    if (!row)
      continue;
    const ings = [];
    r.ingredients.forEach((ing, i) => {
      const food = foodByName.get(ing.foodName);
      ings.push({
        recipeId: row.id,
        foodId: food ? food.id : null,
        name: ing.foodName,
        quantityGrams: ing.grams,
        position: i
      });
    });
    if (ings.length > 0)
      await db.insert(recipeIngredients).values(ings);
  }
}
async function favouriteRecipeIdSet(db, userId) {
  const rows = await db.select({ recipeId: favouriteRecipes.recipeId }).from(favouriteRecipes).where(eq(favouriteRecipes.userId, userId));
  return new Set(rows.map((r) => r.recipeId));
}
async function recipeData(db, recipe) {
  const rows = await db.select().from(recipeIngredients).where(eq(recipeIngredients.recipeId, recipe.id)).orderBy(asc(recipeIngredients.position), asc(recipeIngredients.id));
  const foodIds = rows.map((r) => r.foodId).filter((id) => id != null);
  const foods2 = foodIds.length > 0 ? await db.select().from(foods).where(inArray(foods.id, foodIds)) : [];
  const foodById = new Map(foods2.map((f) => [f.id, f]));
  const zero = { kcal: 0, protein: 0, carbs: 0, fat: 0, fibre: 0 };
  const totals = { ...zero };
  const ingredients = rows.map((r) => {
    const food = r.foodId != null ? foodById.get(r.foodId) : undefined;
    const f = r.quantityGrams / 100;
    const computed = food ? {
      kcal: r1(food.kcalPer100 * f),
      protein: r1(food.proteinPer100 * f),
      carbs: r1(food.carbsPer100 * f),
      fat: r1(food.fatPer100 * f),
      fibre: r1(food.fibrePer100 * f)
    } : { ...zero };
    totals.kcal += computed.kcal;
    totals.protein += computed.protein;
    totals.carbs += computed.carbs;
    totals.fat += computed.fat;
    totals.fibre += computed.fibre;
    return { ...r, computed };
  });
  const servings = recipe.servings > 0 ? recipe.servings : 1;
  const perServing = {
    kcal: r1(totals.kcal / servings),
    protein: r1(totals.protein / servings),
    carbs: r1(totals.carbs / servings),
    fat: r1(totals.fat / servings),
    fibre: r1(totals.fibre / servings)
  };
  return {
    ingredients,
    totals: {
      kcal: r1(totals.kcal),
      protein: r1(totals.protein),
      carbs: r1(totals.carbs),
      fat: r1(totals.fat),
      fibre: r1(totals.fibre)
    },
    perServing
  };
}
function recipePayload(recipe, data, userId, favIds) {
  return {
    id: recipe.id,
    name: recipe.name,
    description: recipe.description,
    category: recipe.category,
    dietFlag: recipe.dietFlag,
    servings: recipe.servings,
    prepMinutes: recipe.prepMinutes,
    cookMinutes: recipe.cookMinutes,
    budget: recipe.budget === 1,
    isOwn: recipe.ownerUserId === userId,
    isFavourite: favIds.has(recipe.id),
    perServing: data.perServing,
    highProtein: data.perServing.protein >= 15
  };
}
async function visibleRecipe(db, userId, recipeId) {
  const rows = await db.select().from(recipes).where(eq(recipes.id, recipeId)).limit(1);
  const r = rows[0];
  if (!r)
    return null;
  if (r.ownerUserId != null && r.ownerUserId !== userId)
    return null;
  return r;
}
function deriveDietFlag(flags) {
  if (flags.includes("non_veg"))
    return "non_veg";
  if (flags.includes("eggetarian"))
    return "eggetarian";
  if (flags.includes("veg"))
    return "veg";
  return "vegan";
}
var challengeSummaryShape = object({
  id: number2(),
  name: string2(),
  template: string2().nullable(),
  totalDays: number2(),
  startedOn: string2(),
  status: _enum(["active", "paused"]),
  taskCount: number2(),
  dayNumber: number2(),
  percent: number2(),
  streak: number2(),
  todayDone: number2(),
  finished: boolean2()
});
async function challengeSummary(db, ch, today) {
  const tasks = await db.select({ id: challengeTasks.id }).from(challengeTasks).where(eq(challengeTasks.challengeId, ch.id));
  const taskCount = tasks.length;
  const checks = await db.select({ loggedOn: challengeChecks.loggedOn }).from(challengeChecks).where(eq(challengeChecks.challengeId, ch.id));
  const perDay = new Map;
  for (const c of checks)
    perDay.set(c.loggedOn, (perDay.get(c.loggedOn) ?? 0) + 1);
  const endOn = shiftDateStr(ch.startedOn, ch.totalDays - 1);
  const elapsed = today < ch.startedOn ? 0 : Math.min(daysBetween(ch.startedOn, today) + 1, ch.totalDays);
  let doneChecks = 0;
  for (let i = 0;i < elapsed; i++)
    doneChecks += perDay.get(shiftDateStr(ch.startedOn, i)) ?? 0;
  const percent = taskCount > 0 && elapsed > 0 ? Math.round(doneChecks / (elapsed * taskCount) * 100) : 0;
  const completeDay = (date) => taskCount > 0 && (perDay.get(date) ?? 0) >= taskCount;
  let streak = 0;
  if (taskCount > 0 && elapsed > 0) {
    let cursor = today > endOn ? endOn : today;
    if (cursor === today && !completeDay(cursor))
      cursor = shiftDateStr(cursor, -1);
    while (cursor >= ch.startedOn && completeDay(cursor)) {
      streak += 1;
      cursor = shiftDateStr(cursor, -1);
    }
  }
  return {
    id: ch.id,
    name: ch.name,
    template: ch.template,
    totalDays: ch.totalDays,
    startedOn: ch.startedOn,
    status: ch.status,
    taskCount,
    dayNumber: elapsed,
    percent,
    streak,
    todayDone: perDay.get(today) ?? 0,
    finished: today > endOn
  };
}
async function ownChallenge(db, userId, challengeId) {
  const rows = await db.select().from(challenges).where(and(eq(challenges.id, challengeId), eq(challenges.userId, userId))).limit(1);
  return rows[0] ?? null;
}
var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function validateCredentials(email, password) {
  if (!EMAIL_RE.test(email))
    return "Enter a valid email address.";
  if (password.length < 8)
    return "Password must be at least 8 characters long.";
  if (password.length > 200)
    return "Password is too long.";
  return null;
}
var authResponse = object({
  ok: boolean2(),
  error: string2().nullable(),
  token: string2().nullable(),
  profile: profileShape.nullable()
});
var okResponse = object({
  ok: boolean2(),
  error: string2().nullable()
});
var Actions = {
  signup: defineAction({
    description: "Creates a FITIND account with email and password and returns a session token plus the new profile.",
    request: object({
      email: string2().trim().toLowerCase().min(3).max(254),
      password: string2().min(1).max(200),
      displayName: string2().trim().min(1).max(80),
      userAgent: string2().max(300).optional()
    }),
    response: authResponse,
    async handler(ctx, args) {
      const invalid = validateCredentials(args.email, args.password);
      if (invalid)
        return { ok: false, error: invalid, token: null, profile: null };
      const db = ctx.db();
      const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, args.email)).limit(1);
      if (existing[0])
        return {
          ok: false,
          error: "An account with this email already exists. Try logging in instead.",
          token: null,
          profile: null
        };
      const salt = newSalt();
      const passwordHash = await hashPassword(args.password, salt);
      const inserted = await db.insert(users).values({
        email: args.email,
        passwordHash,
        passwordSalt: salt,
        displayName: args.displayName
      }).returning({ id: users.id });
      const user = inserted[0];
      if (!user)
        throw new Error("signup: user insert returned no rows");
      const now = new Date;
      await db.insert(profiles).values({
        userId: user.id,
        displayName: args.displayName,
        createdAt: now,
        updatedAt: now
      });
      await db.insert(userGoals).values({ userId: user.id, updatedAt: now });
      await db.insert(userPreferences).values({ userId: user.id, updatedAt: now });
      const token = await createSession(db, user.id, args.userAgent);
      const profile = await loadProfile(db, user.id);
      ctx.invalidateQueries();
      return { ok: true, error: null, token, profile };
    }
  }),
  login: defineAction({
    description: "Logs in with email and password and returns a fresh session token plus the saved profile.",
    request: object({
      email: string2().trim().toLowerCase().min(3).max(254),
      password: string2().min(1).max(200),
      userAgent: string2().max(300).optional()
    }),
    response: authResponse,
    async handler(ctx, args) {
      const db = ctx.db();
      const rows = await db.select().from(users).where(eq(users.email, args.email)).limit(1);
      const user = rows[0];
      if (!user)
        return {
          ok: false,
          error: "No account found for this email. Check the email or create an account.",
          token: null,
          profile: null
        };
      const attempt = await hashPassword(args.password, user.passwordSalt);
      if (attempt !== user.passwordHash)
        return {
          ok: false,
          error: "Incorrect password. Please try again.",
          token: null,
          profile: null
        };
      const token = await createSession(db, user.id, args.userAgent);
      const profile = await loadProfile(db, user.id);
      return { ok: true, error: null, token, profile };
    }
  }),
  logout: defineAction({
    description: "Ends the given session so the token can no longer be used.",
    request: object({ token: string2().min(1).max(200) }),
    response: okResponse,
    async handler(ctx, args) {
      const db = ctx.db();
      const tokenHash = await sha256Hex(args.token);
      await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
      return { ok: true, error: null };
    }
  }),
  getSession: defineAction({
    description: "Validates a session token and returns the signed-in user's profile and calculated nutrition targets.",
    request: object({ token: string2().min(1).max(200) }),
    response: object({
      authenticated: boolean2(),
      expired: boolean2(),
      profile: profileShape.nullable(),
      targets: targetsShape.nullable(),
      isAdmin: boolean2(),
      adminClaimAvailable: boolean2()
    }),
    async handler(ctx, args) {
      const db = ctx.db();
      const claimAvailable = await adminCount(db) === 0;
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return {
          authenticated: false,
          expired: resolved.error === "expired",
          profile: null,
          targets: null,
          isAdmin: false,
          adminClaimAvailable: claimAvailable
        };
      const profile = await loadProfile(db, resolved.userId);
      if (!profile)
        return {
          authenticated: false,
          expired: false,
          profile: null,
          targets: null,
          isAdmin: false,
          adminClaimAvailable: claimAvailable
        };
      return {
        authenticated: true,
        expired: false,
        profile,
        targets: computeTargets(profile),
        isAdmin: await isAdmin(db, resolved.userId),
        adminClaimAvailable: claimAvailable
      };
    }
  }),
  saveProfile: defineAction({
    description: "Saves onboarding or profile/settings edits for the signed-in user and returns the updated profile with recalculated targets.",
    request: object({
      token: string2().min(1).max(200),
      markOnboardingComplete: boolean2().default(false),
      displayName: string2().trim().min(1).max(80).optional(),
      dateOfBirth: string2().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
      heightCm: number2().min(80).max(260).nullable().optional(),
      weightKg: number2().min(25).max(500).nullable().optional(),
      sex: _enum(["male", "female", "other"]).nullable().optional(),
      activityLevel: _enum(["sedentary", "light", "moderate", "active", "very_active"]).nullable().optional(),
      experience: _enum(["beginner", "intermediate", "advanced"]).nullable().optional(),
      mainGoal: _enum(["muscle_gain", "fat_loss", "maintenance", "general_fitness", "strength"]).nullable().optional(),
      targetWeightKg: number2().min(25).max(500).nullable().optional(),
      calorieTargetOverride: number2().int().min(800).max(1e4).nullable().optional(),
      dietPreference: _enum(["vegetarian", "vegan", "eggetarian", "non_vegetarian", "custom"]).nullable().optional(),
      dietCustomNote: string2().trim().max(200).nullable().optional(),
      allergies: string2().trim().max(300).nullable().optional(),
      trainingDaysPerWeek: number2().int().min(0).max(7).nullable().optional(),
      equipment: _enum(["full_gym", "home_equipment", "bodyweight", "custom"]).nullable().optional(),
      equipmentCustomNote: string2().trim().max(200).nullable().optional(),
      units: _enum(["metric", "imperial"]).optional(),
      notifyMeals: boolean2().optional(),
      notifyWater: boolean2().optional(),
      notifyWorkouts: boolean2().optional(),
      profilePrivate: boolean2().optional()
    }),
    response: object({
      ok: boolean2(),
      error: string2().nullable(),
      profile: profileShape.nullable(),
      targets: targetsShape.nullable()
    }),
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return {
          ok: false,
          error: resolved.error === "expired" ? "Your session has expired. Please log in again." : "You are not signed in.",
          profile: null,
          targets: null
        };
      const userId = resolved.userId;
      const now = new Date;
      if (args.dateOfBirth) {
        const age = ageFromDob(args.dateOfBirth, now);
        if (age == null)
          return {
            ok: false,
            error: "Date of birth looks invalid. Check it and try again.",
            profile: null,
            targets: null
          };
      }
      const profilePatch = {
        updatedAt: now
      };
      if (args.displayName !== undefined)
        profilePatch.displayName = args.displayName;
      if (args.dateOfBirth !== undefined)
        profilePatch.dateOfBirth = args.dateOfBirth;
      if (args.heightCm !== undefined)
        profilePatch.heightCm = args.heightCm;
      if (args.weightKg !== undefined)
        profilePatch.weightKg = args.weightKg;
      if (args.sex !== undefined)
        profilePatch.sex = args.sex;
      if (args.activityLevel !== undefined)
        profilePatch.activityLevel = args.activityLevel;
      if (args.experience !== undefined)
        profilePatch.experience = args.experience;
      if (args.markOnboardingComplete)
        profilePatch.onboardingCompleted = 1;
      await db.update(profiles).set(profilePatch).where(eq(profiles.userId, userId));
      if (args.displayName !== undefined) {
        await db.update(users).set({ displayName: args.displayName }).where(eq(users.id, userId));
      }
      const goalPatch = {
        updatedAt: now
      };
      if (args.mainGoal !== undefined)
        goalPatch.mainGoal = args.mainGoal;
      if (args.targetWeightKg !== undefined)
        goalPatch.targetWeightKg = args.targetWeightKg;
      if (args.calorieTargetOverride !== undefined)
        goalPatch.calorieTargetOverride = args.calorieTargetOverride;
      await db.update(userGoals).set(goalPatch).where(eq(userGoals.userId, userId));
      const prefPatch = {
        updatedAt: now
      };
      if (args.dietPreference !== undefined)
        prefPatch.dietPreference = args.dietPreference;
      if (args.dietCustomNote !== undefined)
        prefPatch.dietCustomNote = args.dietCustomNote;
      if (args.allergies !== undefined)
        prefPatch.allergies = args.allergies;
      if (args.trainingDaysPerWeek !== undefined)
        prefPatch.trainingDaysPerWeek = args.trainingDaysPerWeek;
      if (args.equipment !== undefined)
        prefPatch.equipment = args.equipment;
      if (args.equipmentCustomNote !== undefined)
        prefPatch.equipmentCustomNote = args.equipmentCustomNote;
      if (args.units !== undefined)
        prefPatch.units = args.units;
      if (args.notifyMeals !== undefined)
        prefPatch.notifyMeals = args.notifyMeals ? 1 : 0;
      if (args.notifyWater !== undefined)
        prefPatch.notifyWater = args.notifyWater ? 1 : 0;
      if (args.notifyWorkouts !== undefined)
        prefPatch.notifyWorkouts = args.notifyWorkouts ? 1 : 0;
      if (args.profilePrivate !== undefined)
        prefPatch.profilePrivate = args.profilePrivate ? 1 : 0;
      await db.update(userPreferences).set(prefPatch).where(eq(userPreferences.userId, userId));
      const profile = await loadProfile(db, userId);
      ctx.invalidateQueries();
      return {
        ok: true,
        error: null,
        profile,
        targets: profile ? computeTargets(profile) : null
      };
    }
  }),
  getDashboard: defineAction({
    description: "Returns the signed-in user's dashboard: profile, nutrition targets, real weight-log history, today's diary totals and BMI.",
    request: object({
      token: string2().min(1).max(200),
      today: string2().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      weekStart: string2().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
    }),
    response: object({
      authenticated: boolean2(),
      profile: profileShape.nullable(),
      targets: targetsShape.nullable(),
      training: trainingShape,
      latestWeight: object({ weightKg: number2(), loggedOn: string2() }).nullable(),
      weightLogCount: number2(),
      recentWeights: array(object({ weightKg: number2(), loggedOn: string2() })),
      today: object({
        date: string2(),
        totals: totalsShape,
        entryCount: number2()
      }),
      water: object({ totalMl: number2(), targetMl: number2() }),
      bmi: object({ value: number2(), category: string2() }).nullable()
    }),
    async handler(ctx, args) {
      const now = new Date;
      const today = args.today ?? `${now.getFullYear()}-${`${now.getMonth() + 1}`.padStart(2, "0")}-${`${now.getDate()}`.padStart(2, "0")}`;
      const empty = {
        authenticated: false,
        profile: null,
        targets: null,
        training: EMPTY_TRAINING,
        latestWeight: null,
        weightLogCount: 0,
        recentWeights: [],
        today: {
          date: today,
          totals: { kcal: 0, protein: 0, carbs: 0, fat: 0, fibre: 0 },
          entryCount: 0
        },
        water: { totalMl: 0, targetMl: WATER_SUGGESTED_ML },
        bmi: null
      };
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return empty;
      const profile = await loadProfile(db, resolved.userId);
      if (!profile)
        return empty;
      const logs = await db.select().from(weightLogs).where(eq(weightLogs.userId, resolved.userId)).orderBy(desc(weightLogs.loggedOn), desc(weightLogs.id)).limit(30);
      const recent = logs.slice(0, 10).map((l) => ({
        weightKg: l.weightKg,
        loggedOn: l.loggedOn
      }));
      const todaysEntries = await diaryForDate(db, resolved.userId, today);
      const weekStart = args.weekStart ?? today;
      const wTarget = await waterTarget(db, resolved.userId);
      return {
        authenticated: true,
        profile,
        targets: computeTargets(profile),
        training: await trainingSummary(db, resolved.userId, today, weekStart),
        latestWeight: recent[0] ?? null,
        weightLogCount: logs.length,
        recentWeights: recent,
        today: {
          date: today,
          totals: sumTotals(todaysEntries),
          entryCount: todaysEntries.length
        },
        water: {
          totalMl: await waterTotalForDate(db, resolved.userId, today),
          targetMl: wTarget.targetMl
        },
        bmi: bmiOf(profile)
      };
    }
  }),
  logWeight: defineAction({
    description: "Logs a body-weight entry for the signed-in user on a given date and updates their current weight.",
    request: object({
      token: string2().min(1).max(200),
      weightKg: number2().min(25).max(500),
      loggedOn: string2().regex(/^\d{4}-\d{2}-\d{2}$/)
    }),
    response: okResponse,
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const userId = resolved.userId;
      await db.insert(weightLogs).values({
        userId,
        weightKg: args.weightKg,
        loggedOn: args.loggedOn
      });
      const latest = await db.select().from(weightLogs).where(eq(weightLogs.userId, userId)).orderBy(desc(weightLogs.loggedOn), desc(weightLogs.id)).limit(1);
      const top = latest[0];
      if (top) {
        await db.update(profiles).set({ weightKg: top.weightKg, updatedAt: new Date }).where(eq(profiles.userId, userId));
      }
      ctx.invalidateQueries();
      return { ok: true, error: null };
    }
  }),
  deleteWeightLog: defineAction({
    description: "Deletes one of the signed-in user's own weight-log entries by date and weight value.",
    request: object({
      token: string2().min(1).max(200),
      loggedOn: string2().regex(/^\d{4}-\d{2}-\d{2}$/),
      weightKg: number2().min(25).max(500)
    }),
    response: okResponse,
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const userId = resolved.userId;
      const rows = await db.select().from(weightLogs).where(and(eq(weightLogs.userId, userId), eq(weightLogs.loggedOn, args.loggedOn), eq(weightLogs.weightKg, args.weightKg))).orderBy(desc(weightLogs.id)).limit(1);
      const row = rows[0];
      if (!row)
        return { ok: false, error: "Entry not found." };
      await db.delete(weightLogs).where(eq(weightLogs.id, row.id));
      ctx.invalidateQueries();
      return { ok: true, error: null };
    }
  }),
  searchFoods: defineAction({
    description: "Searches the food catalogue (shared foods plus the user's own custom foods) by name or alias, with optional category, cuisine, diet and high-protein filters and sorting.",
    request: object({
      token: string2().min(1).max(200),
      query: string2().trim().max(80).default(""),
      category: string2().max(40).optional(),
      cuisine: string2().max(40).optional(),
      dietFlag: _enum(["veg", "vegan", "eggetarian", "non_veg"]).optional(),
      highProtein: boolean2().default(false),
      sort: _enum(["relevance", "kcalAsc", "kcalDesc", "proteinDesc"]).default("relevance"),
      offset: number2().int().min(0).max(1e5).default(0)
    }),
    response: object({
      ok: boolean2(),
      error: string2().nullable(),
      foods: array(foodShape),
      total: number2()
    }),
    async handler(ctx, args) {
      const fail = { ok: false, error: "You are not signed in.", foods: [], total: 0 };
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return fail;
      const userId = resolved.userId;
      await ensureFoodCatalog(db);
      const [all, favs] = await Promise.all([
        visibleFoods(db, userId),
        favouriteIdSet(db, userId)
      ]);
      const q = args.query.toLowerCase();
      const terms = q.split(/\s+/).filter(Boolean);
      const scored = [];
      for (const f of all) {
        if (args.category && f.category !== args.category)
          continue;
        if (args.cuisine && f.cuisine !== args.cuisine)
          continue;
        if (args.dietFlag && f.dietFlag !== args.dietFlag)
          continue;
        if (args.highProtein && f.proteinPer100 < 10)
          continue;
        let score = 0;
        if (terms.length > 0) {
          const name = f.name.toLowerCase();
          const hay = `${name} ${f.aliases.toLowerCase()}`;
          if (!terms.every((t) => hay.includes(t)))
            continue;
          if (name === q)
            score = 100;
          else if (name.startsWith(q))
            score = 60;
          else if (name.includes(q))
            score = 40;
          else
            score = 20;
          if (favs.has(f.id))
            score += 5;
        }
        scored.push({ f, score });
      }
      scored.sort((a, b) => {
        if (args.sort === "kcalAsc")
          return a.f.kcalPer100 - b.f.kcalPer100;
        if (args.sort === "kcalDesc")
          return b.f.kcalPer100 - a.f.kcalPer100;
        if (args.sort === "proteinDesc")
          return b.f.proteinPer100 - a.f.proteinPer100;
        return b.score - a.score || a.f.name.localeCompare(b.f.name);
      });
      return {
        ok: true,
        error: null,
        foods: scored.slice(args.offset, args.offset + 60).map((s) => foodPayload(s.f, favs)),
        total: scored.length
      };
    }
  }),
  getFoodLists: defineAction({
    description: "Returns the signed-in user's favourite foods and recently logged foods, for the food search page.",
    request: object({ token: string2().min(1).max(200) }),
    response: object({
      ok: boolean2(),
      error: string2().nullable(),
      favourites: array(foodShape),
      recents: array(foodShape)
    }),
    async handler(ctx, args) {
      const fail = { ok: false, error: "You are not signed in.", favourites: [], recents: [] };
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return fail;
      const userId = resolved.userId;
      await ensureFoodCatalog(db);
      const favs = await favouriteIdSet(db, userId);
      const all = await visibleFoods(db, userId);
      const byId = new Map(all.map((f) => [f.id, f]));
      const favourites = [];
      for (const id of favs) {
        const f = byId.get(id);
        if (f)
          favourites.push(foodPayload(f, favs));
      }
      const recentRows = await db.select({ foodId: diaryEntries.foodId }).from(diaryEntries).where(eq(diaryEntries.userId, userId)).orderBy(desc(diaryEntries.id)).limit(60);
      const seen = new Set;
      const recents = [];
      for (const r of recentRows) {
        if (r.foodId == null || seen.has(r.foodId))
          continue;
        seen.add(r.foodId);
        const f = byId.get(r.foodId);
        if (f)
          recents.push(foodPayload(f, favs));
        if (recents.length >= 10)
          break;
      }
      return { ok: true, error: null, favourites, recents };
    }
  }),
  toggleFavourite: defineAction({
    description: "Adds or removes a food from the signed-in user's favourites.",
    request: object({
      token: string2().min(1).max(200),
      foodId: number2().int().positive()
    }),
    response: object({
      ok: boolean2(),
      error: string2().nullable(),
      isFavourite: boolean2()
    }),
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in.", isFavourite: false };
      const userId = resolved.userId;
      const visible = (await visibleFoods(db, userId)).some((f) => f.id === args.foodId);
      if (!visible)
        return { ok: false, error: "Food not found.", isFavourite: false };
      const existing = await db.select().from(favouriteFoods).where(and(eq(favouriteFoods.userId, userId), eq(favouriteFoods.foodId, args.foodId))).limit(1);
      if (existing[0]) {
        await db.delete(favouriteFoods).where(eq(favouriteFoods.id, existing[0].id));
        ctx.invalidateQueries();
        return { ok: true, error: null, isFavourite: false };
      }
      await db.insert(favouriteFoods).values({
        userId,
        foodId: args.foodId
      });
      ctx.invalidateQueries();
      return { ok: true, error: null, isFavourite: true };
    }
  }),
  createCustomFood: defineAction({
    description: "Creates a custom food owned by the signed-in user (marked user-submitted, visible only to them).",
    request: object({
      token: string2().min(1).max(200),
      name: string2().trim().min(2).max(80),
      category: string2().trim().min(1).max(40),
      cuisine: string2().trim().min(1).max(40),
      dietFlag: _enum(["veg", "vegan", "eggetarian", "non_veg"]),
      kcalPer100: number2().min(0).max(950),
      proteinPer100: number2().min(0).max(100),
      carbsPer100: number2().min(0).max(100),
      fatPer100: number2().min(0).max(100),
      fibrePer100: number2().min(0).max(100),
      servingName: string2().trim().min(1).max(40),
      servingGrams: number2().min(1).max(2000),
      notes: string2().trim().max(300).nullable().optional()
    }),
    response: object({
      ok: boolean2(),
      error: string2().nullable(),
      food: foodShape.nullable()
    }),
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in.", food: null };
      const userId = resolved.userId;
      const inserted = await db.insert(foods).values({
        name: args.name,
        aliases: "",
        category: args.category,
        cuisine: args.cuisine,
        dietFlag: args.dietFlag,
        kcalPer100: args.kcalPer100,
        proteinPer100: args.proteinPer100,
        carbsPer100: args.carbsPer100,
        fatPer100: args.fatPer100,
        fibrePer100: args.fibrePer100,
        servingName: args.servingName,
        servingGrams: args.servingGrams,
        source: "Added by you — values as you entered them.",
        verification: "user",
        notes: args.notes ?? null,
        ownerUserId: userId
      }).returning();
      const food = inserted[0];
      if (!food)
        throw new Error("createCustomFood: insert returned no rows");
      ctx.invalidateQueries();
      return {
        ok: true,
        error: null,
        food: foodPayload(food, await favouriteIdSet(db, userId))
      };
    }
  }),
  getDiary: defineAction({
    description: "Returns the signed-in user's food diary for one date: entries grouped by meal, per-meal and daily totals computed from the stored snapshots, plus their targets.",
    request: object({
      token: string2().min(1).max(200),
      date: string2().regex(/^\d{4}-\d{2}-\d{2}$/)
    }),
    response: object({
      ok: boolean2(),
      error: string2().nullable(),
      date: string2(),
      entries: array(entryShape),
      mealTotals: record(mealEnum, totalsShape),
      totals: totalsShape,
      targets: targetsShape.nullable()
    }),
    async handler(ctx, args) {
      const zero = { kcal: 0, protein: 0, carbs: 0, fat: 0, fibre: 0 };
      const zeroMeals = {
        breakfast: zero,
        lunch: zero,
        snacks: zero,
        dinner: zero,
        custom: zero
      };
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return {
          ok: false,
          error: "You are not signed in.",
          date: args.date,
          entries: [],
          mealTotals: zeroMeals,
          totals: zero,
          targets: null
        };
      const entries = await diaryForDate(db, resolved.userId, args.date);
      const mealTotals = { ...zeroMeals };
      for (const m of MEALS) {
        mealTotals[m] = sumTotals(entries.filter((e) => e.meal === m));
      }
      const profile = await loadProfile(db, resolved.userId);
      return {
        ok: true,
        error: null,
        date: args.date,
        entries,
        mealTotals,
        totals: sumTotals(entries),
        targets: profile ? computeTargets(profile) : null
      };
    }
  }),
  addDiaryEntry: defineAction({
    description: "Logs a food to the signed-in user's diary for a date and meal, storing a nutrition snapshot. A repeated clientKey returns the existing entry instead of duplicating it.",
    request: object({
      token: string2().min(1).max(200),
      foodId: number2().int().positive(),
      date: string2().regex(/^\d{4}-\d{2}-\d{2}$/),
      meal: mealEnum,
      quantityGrams: number2().min(1).max(5000),
      servings: number2().min(0.01).max(50).nullable().optional(),
      clientKey: string2().min(8).max(80)
    }),
    response: object({
      ok: boolean2(),
      error: string2().nullable(),
      entry: entryShape.nullable(),
      duplicate: boolean2()
    }),
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return {
          ok: false,
          error: "You are not signed in.",
          entry: null,
          duplicate: false
        };
      const userId = resolved.userId;
      const dup = await db.select().from(diaryEntries).where(and(eq(diaryEntries.userId, userId), eq(diaryEntries.clientKey, args.clientKey))).limit(1);
      if (dup[0])
        return { ok: true, error: null, entry: entryPayload(dup[0]), duplicate: true };
      const foodRows = await db.select().from(foods).where(eq(foods.id, args.foodId)).limit(1);
      const food = foodRows[0];
      if (!food || food.ownerUserId != null && food.ownerUserId !== userId)
        return { ok: false, error: "Food not found.", entry: null, duplicate: false };
      const inserted = await db.insert(diaryEntries).values({
        userId,
        foodId: food.id,
        loggedOn: args.date,
        meal: args.meal,
        quantityGrams: args.quantityGrams,
        servings: args.servings ?? null,
        foodName: food.name,
        kcalPer100: food.kcalPer100,
        proteinPer100: food.proteinPer100,
        carbsPer100: food.carbsPer100,
        fatPer100: food.fatPer100,
        fibrePer100: food.fibrePer100,
        servingName: food.servingName,
        servingGrams: food.servingGrams,
        clientKey: args.clientKey
      }).returning();
      const row = inserted[0];
      if (!row)
        throw new Error("addDiaryEntry: insert returned no rows");
      ctx.invalidateQueries();
      return { ok: true, error: null, entry: entryPayload(row), duplicate: false };
    }
  }),
  updateDiaryEntry: defineAction({
    description: "Changes the quantity of one of the signed-in user's diary entries; nutrition is recomputed from the stored snapshot.",
    request: object({
      token: string2().min(1).max(200),
      entryId: number2().int().positive(),
      quantityGrams: number2().min(1).max(5000)
    }),
    response: okResponse,
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const rows = await db.select().from(diaryEntries).where(and(eq(diaryEntries.id, args.entryId), eq(diaryEntries.userId, resolved.userId))).limit(1);
      const row = rows[0];
      if (!row)
        return { ok: false, error: "Entry not found." };
      await db.update(diaryEntries).set({
        quantityGrams: args.quantityGrams,
        servings: Math.round(args.quantityGrams / row.servingGrams * 100) / 100
      }).where(eq(diaryEntries.id, row.id));
      ctx.invalidateQueries();
      return { ok: true, error: null };
    }
  }),
  deleteDiaryEntry: defineAction({
    description: "Deletes one of the signed-in user's own diary entries.",
    request: object({
      token: string2().min(1).max(200),
      entryId: number2().int().positive()
    }),
    response: okResponse,
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const rows = await db.select({ id: diaryEntries.id }).from(diaryEntries).where(and(eq(diaryEntries.id, args.entryId), eq(diaryEntries.userId, resolved.userId))).limit(1);
      if (!rows[0])
        return { ok: false, error: "Entry not found." };
      await db.delete(diaryEntries).where(eq(diaryEntries.id, rows[0].id));
      ctx.invalidateQueries();
      return { ok: true, error: null };
    }
  }),
  copyPreviousDay: defineAction({
    description: "Copies all of the signed-in user's diary entries from the previous day into the given date (skips if that date already has entries).",
    request: object({
      token: string2().min(1).max(200),
      date: string2().regex(/^\d{4}-\d{2}-\d{2}$/)
    }),
    response: object({
      ok: boolean2(),
      error: string2().nullable(),
      copied: number2()
    }),
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in.", copied: 0 };
      const userId = resolved.userId;
      const target = await diaryForDate(db, userId, args.date);
      if (target.length > 0)
        return {
          ok: false,
          error: "This day already has entries — copying would duplicate them.",
          copied: 0
        };
      const prev = new Date(`${args.date}T00:00:00Z`);
      prev.setUTCDate(prev.getUTCDate() - 1);
      const prevDate = prev.toISOString().slice(0, 10);
      const source = await db.select().from(diaryEntries).where(and(eq(diaryEntries.userId, userId), eq(diaryEntries.loggedOn, prevDate))).orderBy(asc(diaryEntries.id));
      if (source.length === 0)
        return {
          ok: false,
          error: "Nothing was logged yesterday to copy.",
          copied: 0
        };
      await db.insert(diaryEntries).values(source.map((e) => ({
        userId,
        foodId: e.foodId,
        loggedOn: args.date,
        meal: e.meal,
        quantityGrams: e.quantityGrams,
        servings: e.servings,
        foodName: e.foodName,
        kcalPer100: e.kcalPer100,
        proteinPer100: e.proteinPer100,
        carbsPer100: e.carbsPer100,
        fatPer100: e.fatPer100,
        fibrePer100: e.fibrePer100,
        servingName: e.servingName,
        servingGrams: e.servingGrams,
        clientKey: null
      })));
      ctx.invalidateQueries();
      return { ok: true, error: null, copied: source.length };
    }
  }),
  searchExercises: defineAction({
    description: "Searches the shared exercise library by name, with optional muscle group, equipment and difficulty filters.",
    request: object({
      token: string2().min(1).max(200),
      query: string2().trim().max(80).default(""),
      muscleGroup: string2().max(40).optional(),
      equipment: string2().max(40).optional(),
      difficulty: _enum(["beginner", "intermediate", "advanced"]).optional(),
      offset: number2().int().min(0).max(1e5).default(0)
    }),
    response: object({
      ok: boolean2(),
      error: string2().nullable(),
      exercises: array(exerciseShape),
      total: number2()
    }),
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in.", exercises: [], total: 0 };
      await ensureExerciseLibrary(db);
      const all = await db.select().from(exercises).orderBy(asc(exercises.name));
      const q = args.query.toLowerCase();
      const terms = q.split(/\s+/).filter(Boolean);
      const filtered = all.filter((e) => {
        if (args.muscleGroup && e.primaryMuscle !== args.muscleGroup)
          return false;
        if (args.equipment && e.equipment !== args.equipment)
          return false;
        if (args.difficulty && e.difficulty !== args.difficulty)
          return false;
        if (terms.length > 0) {
          const hay = `${e.name} ${e.primaryMuscle} ${e.secondaryMuscles}`.toLowerCase();
          if (!terms.every((t) => hay.includes(t)))
            return false;
        }
        return true;
      });
      return {
        ok: true,
        error: null,
        exercises: filtered.slice(args.offset, args.offset + 40).map(exercisePayload),
        total: filtered.length
      };
    }
  }),
  getWorkoutTemplates: defineAction({
    description: "Returns the built-in workout templates (PPL, Upper/Lower, Full Body, Bro Split, Home) with their exercises resolved from the library.",
    request: object({ token: string2().min(1).max(200) }),
    response: object({
      ok: boolean2(),
      error: string2().nullable(),
      templates: array(object({
        key: string2(),
        name: string2(),
        group: string2(),
        focus: string2(),
        exercises: array(object({
          name: string2(),
          sets: number2(),
          reps: string2(),
          restSeconds: number2()
        }))
      }))
    }),
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in.", templates: [] };
      await ensureExerciseLibrary(db);
      return { ok: true, error: null, templates: WORKOUT_TEMPLATES };
    }
  }),
  copyTemplate: defineAction({
    description: "Copies a built-in workout template into a new routine owned by the signed-in user, which they can then edit freely.",
    request: object({
      token: string2().min(1).max(200),
      templateKey: string2().min(1).max(60)
    }),
    response: object({
      ok: boolean2(),
      error: string2().nullable(),
      routineId: number2().nullable()
    }),
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in.", routineId: null };
      const template = WORKOUT_TEMPLATES.find((t) => t.key === args.templateKey);
      if (!template)
        return { ok: false, error: "Template not found.", routineId: null };
      await ensureExerciseLibrary(db);
      const now = new Date;
      const inserted = await db.insert(routines).values({
        userId: resolved.userId,
        name: template.name,
        notes: template.focus,
        sourceTemplate: template.key,
        createdAt: now,
        updatedAt: now
      }).returning({ id: routines.id });
      const routine = inserted[0];
      if (!routine)
        throw new Error("copyTemplate: insert returned no rows");
      let position = 0;
      for (const te of template.exercises) {
        const ex = await exerciseByName(db, te.name);
        if (!ex)
          continue;
        position += 1;
        await db.insert(routineExercises).values({
          routineId: routine.id,
          exerciseId: ex.id,
          position,
          targetSets: te.sets,
          targetReps: te.reps,
          restSeconds: te.restSeconds
        });
      }
      ctx.invalidateQueries();
      return { ok: true, error: null, routineId: routine.id };
    }
  }),
  getRoutines: defineAction({
    description: "Lists the signed-in user's own workout routines with exercise counts.",
    request: object({ token: string2().min(1).max(200) }),
    response: object({
      ok: boolean2(),
      error: string2().nullable(),
      routines: array(routineShape)
    }),
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in.", routines: [] };
      const rows = await db.select().from(routines).where(eq(routines.userId, resolved.userId)).orderBy(desc(routines.updatedAt));
      const routines2 = [];
      for (const r of rows) {
        const exs = await db.select({ id: routineExercises.id }).from(routineExercises).where(eq(routineExercises.routineId, r.id));
        routines2.push({
          id: r.id,
          name: r.name,
          notes: r.notes,
          sourceTemplate: r.sourceTemplate,
          exerciseCount: exs.length
        });
      }
      return { ok: true, error: null, routines: routines2 };
    }
  }),
  createRoutine: defineAction({
    description: "Creates a new empty routine owned by the signed-in user.",
    request: object({
      token: string2().min(1).max(200),
      name: string2().trim().min(1).max(80),
      notes: string2().trim().max(300).nullable().optional()
    }),
    response: object({
      ok: boolean2(),
      error: string2().nullable(),
      routineId: number2().nullable()
    }),
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in.", routineId: null };
      const now = new Date;
      const inserted = await db.insert(routines).values({
        userId: resolved.userId,
        name: args.name,
        notes: args.notes ?? null,
        createdAt: now,
        updatedAt: now
      }).returning({ id: routines.id });
      const routine = inserted[0];
      if (!routine)
        throw new Error("createRoutine: insert returned no rows");
      ctx.invalidateQueries();
      return { ok: true, error: null, routineId: routine.id };
    }
  }),
  getRoutine: defineAction({
    description: "Returns one of the signed-in user's routines with its exercises in order.",
    request: object({
      token: string2().min(1).max(200),
      routineId: number2().int().positive()
    }),
    response: object({
      ok: boolean2(),
      error: string2().nullable(),
      routine: routineShape.extend({ exercises: array(routineExerciseShape) }).nullable()
    }),
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in.", routine: null };
      const routine = await ownRoutine(db, resolved.userId, args.routineId);
      if (!routine)
        return { ok: false, error: "Routine not found.", routine: null };
      const rows = await db.select().from(routineExercises).where(eq(routineExercises.routineId, routine.id)).orderBy(asc(routineExercises.position), asc(routineExercises.id));
      const exercises2 = [];
      for (const r of rows) {
        const exRows = await db.select().from(exercises).where(eq(exercises.id, r.exerciseId)).limit(1);
        const e = exRows[0];
        if (!e)
          continue;
        exercises2.push({
          id: r.id,
          exerciseId: r.exerciseId,
          exerciseName: e.name,
          primaryMuscle: e.primaryMuscle,
          equipment: e.equipment,
          kind: e.kind,
          position: r.position,
          targetSets: r.targetSets,
          targetReps: r.targetReps,
          restSeconds: r.restSeconds,
          notes: r.notes
        });
      }
      return {
        ok: true,
        error: null,
        routine: {
          id: routine.id,
          name: routine.name,
          notes: routine.notes,
          sourceTemplate: routine.sourceTemplate,
          exerciseCount: exercises2.length,
          exercises: exercises2
        }
      };
    }
  }),
  updateRoutine: defineAction({
    description: "Renames one of the signed-in user's routines or edits its notes.",
    request: object({
      token: string2().min(1).max(200),
      routineId: number2().int().positive(),
      name: string2().trim().min(1).max(80).optional(),
      notes: string2().trim().max(300).nullable().optional()
    }),
    response: okResponse,
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const routine = await ownRoutine(db, resolved.userId, args.routineId);
      if (!routine)
        return { ok: false, error: "Routine not found." };
      const patch = {
        updatedAt: new Date
      };
      if (args.name !== undefined)
        patch.name = args.name;
      if (args.notes !== undefined)
        patch.notes = args.notes;
      await db.update(routines).set(patch).where(eq(routines.id, routine.id));
      ctx.invalidateQueries();
      return { ok: true, error: null };
    }
  }),
  deleteRoutine: defineAction({
    description: "Deletes one of the signed-in user's routines and its exercise list. Past workout history is kept (it snapshots the session).",
    request: object({
      token: string2().min(1).max(200),
      routineId: number2().int().positive()
    }),
    response: okResponse,
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const routine = await ownRoutine(db, resolved.userId, args.routineId);
      if (!routine)
        return { ok: false, error: "Routine not found." };
      await db.update(workoutSessions).set({ routineId: null }).where(eq(workoutSessions.routineId, routine.id));
      await db.delete(routineExercises).where(eq(routineExercises.routineId, routine.id));
      await db.delete(routines).where(eq(routines.id, routine.id));
      ctx.invalidateQueries();
      return { ok: true, error: null };
    }
  }),
  duplicateRoutine: defineAction({
    description: "Duplicates one of the signed-in user's routines, including its full exercise list.",
    request: object({
      token: string2().min(1).max(200),
      routineId: number2().int().positive()
    }),
    response: object({
      ok: boolean2(),
      error: string2().nullable(),
      routineId: number2().nullable()
    }),
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in.", routineId: null };
      const routine = await ownRoutine(db, resolved.userId, args.routineId);
      if (!routine)
        return { ok: false, error: "Routine not found.", routineId: null };
      const now = new Date;
      const inserted = await db.insert(routines).values({
        userId: resolved.userId,
        name: `${routine.name} copy`,
        notes: routine.notes,
        sourceTemplate: routine.sourceTemplate,
        createdAt: now,
        updatedAt: now
      }).returning({ id: routines.id });
      const copy = inserted[0];
      if (!copy)
        throw new Error("duplicateRoutine: insert returned no rows");
      const rows = await db.select().from(routineExercises).where(eq(routineExercises.routineId, routine.id)).orderBy(asc(routineExercises.position));
      for (const r of rows) {
        await db.insert(routineExercises).values({
          routineId: copy.id,
          exerciseId: r.exerciseId,
          position: r.position,
          targetSets: r.targetSets,
          targetReps: r.targetReps,
          restSeconds: r.restSeconds,
          notes: r.notes
        });
      }
      ctx.invalidateQueries();
      return { ok: true, error: null, routineId: copy.id };
    }
  }),
  addRoutineExercise: defineAction({
    description: "Adds a library exercise to the end of one of the signed-in user's routines, using the library's suggested sets/reps/rest as defaults.",
    request: object({
      token: string2().min(1).max(200),
      routineId: number2().int().positive(),
      exerciseId: number2().int().positive()
    }),
    response: okResponse,
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const routine = await ownRoutine(db, resolved.userId, args.routineId);
      if (!routine)
        return { ok: false, error: "Routine not found." };
      await ensureExerciseLibrary(db);
      const exRows = await db.select().from(exercises).where(eq(exercises.id, args.exerciseId)).limit(1);
      const ex = exRows[0];
      if (!ex)
        return { ok: false, error: "Exercise not found." };
      const existing = await db.select({ position: routineExercises.position }).from(routineExercises).where(eq(routineExercises.routineId, routine.id)).orderBy(desc(routineExercises.position)).limit(1);
      await db.insert(routineExercises).values({
        routineId: routine.id,
        exerciseId: ex.id,
        position: (existing[0]?.position ?? 0) + 1,
        targetSets: ex.suggestedSets,
        targetReps: ex.suggestedReps,
        restSeconds: ex.restSeconds
      });
      await db.update(routines).set({ updatedAt: new Date }).where(eq(routines.id, routine.id));
      ctx.invalidateQueries();
      return { ok: true, error: null };
    }
  }),
  updateRoutineExercise: defineAction({
    description: "Edits the target sets, reps and rest of one exercise inside the signed-in user's routine.",
    request: object({
      token: string2().min(1).max(200),
      routineExerciseId: number2().int().positive(),
      targetSets: number2().int().min(1).max(20),
      targetReps: string2().trim().min(1).max(30),
      restSeconds: number2().int().min(0).max(900)
    }),
    response: okResponse,
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const rows = await db.select().from(routineExercises).where(eq(routineExercises.id, args.routineExerciseId)).limit(1);
      const row = rows[0];
      if (!row)
        return { ok: false, error: "Entry not found." };
      const routine = await ownRoutine(db, resolved.userId, row.routineId);
      if (!routine)
        return { ok: false, error: "Entry not found." };
      await db.update(routineExercises).set({
        targetSets: args.targetSets,
        targetReps: args.targetReps,
        restSeconds: args.restSeconds
      }).where(eq(routineExercises.id, row.id));
      ctx.invalidateQueries();
      return { ok: true, error: null };
    }
  }),
  removeRoutineExercise: defineAction({
    description: "Removes one exercise from the signed-in user's routine and closes the position gap.",
    request: object({
      token: string2().min(1).max(200),
      routineExerciseId: number2().int().positive()
    }),
    response: okResponse,
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const rows = await db.select().from(routineExercises).where(eq(routineExercises.id, args.routineExerciseId)).limit(1);
      const row = rows[0];
      if (!row)
        return { ok: false, error: "Entry not found." };
      const routine = await ownRoutine(db, resolved.userId, row.routineId);
      if (!routine)
        return { ok: false, error: "Entry not found." };
      await db.delete(routineExercises).where(eq(routineExercises.id, row.id));
      const rest = await db.select().from(routineExercises).where(eq(routineExercises.routineId, routine.id)).orderBy(asc(routineExercises.position), asc(routineExercises.id));
      let pos = 0;
      for (const r of rest) {
        pos += 1;
        if (r.position !== pos) {
          await db.update(routineExercises).set({ position: pos }).where(eq(routineExercises.id, r.id));
        }
      }
      ctx.invalidateQueries();
      return { ok: true, error: null };
    }
  }),
  moveRoutineExercise: defineAction({
    description: "Moves one exercise up or down within the signed-in user's routine.",
    request: object({
      token: string2().min(1).max(200),
      routineExerciseId: number2().int().positive(),
      direction: _enum(["up", "down"])
    }),
    response: okResponse,
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const rows = await db.select().from(routineExercises).where(eq(routineExercises.id, args.routineExerciseId)).limit(1);
      const row = rows[0];
      if (!row)
        return { ok: false, error: "Entry not found." };
      const routine = await ownRoutine(db, resolved.userId, row.routineId);
      if (!routine)
        return { ok: false, error: "Entry not found." };
      const all = await db.select().from(routineExercises).where(eq(routineExercises.routineId, routine.id)).orderBy(asc(routineExercises.position), asc(routineExercises.id));
      const idx = all.findIndex((r) => r.id === row.id);
      const swapIdx = args.direction === "up" ? idx - 1 : idx + 1;
      if (idx < 0 || swapIdx < 0 || swapIdx >= all.length)
        return { ok: true, error: null };
      const other = all[swapIdx];
      if (!other)
        return { ok: true, error: null };
      await db.update(routineExercises).set({ position: other.position }).where(eq(routineExercises.id, row.id));
      await db.update(routineExercises).set({ position: row.position }).where(eq(routineExercises.id, other.id));
      ctx.invalidateQueries();
      return { ok: true, error: null };
    }
  }),
  startSession: defineAction({
    description: "Starts a live workout session from one of the user's routines or blank. If a session is already in progress it is returned instead (resume), never duplicated.",
    request: object({
      token: string2().min(1).max(200),
      routineId: number2().int().positive().nullable().optional(),
      title: string2().trim().min(1).max(80).optional(),
      today: string2().regex(/^\d{4}-\d{2}-\d{2}$/)
    }),
    response: object({
      ok: boolean2(),
      error: string2().nullable(),
      session: sessionShape.nullable(),
      resumed: boolean2()
    }),
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return {
          ok: false,
          error: "You are not signed in.",
          session: null,
          resumed: false
        };
      const userId = resolved.userId;
      const active = await db.select().from(workoutSessions).where(and(eq(workoutSessions.userId, userId), eq(workoutSessions.status, "in_progress"))).orderBy(desc(workoutSessions.id)).limit(1);
      if (active[0]) {
        return {
          ok: true,
          error: null,
          session: await sessionPayload(db, active[0]),
          resumed: true
        };
      }
      let routine = null;
      if (args.routineId != null) {
        routine = await ownRoutine(db, userId, args.routineId);
        if (!routine)
          return {
            ok: false,
            error: "Routine not found.",
            session: null,
            resumed: false
          };
      }
      const now = new Date;
      const inserted = await db.insert(workoutSessions).values({
        userId,
        routineId: routine ? routine.id : null,
        title: args.title ?? routine?.name ?? "Workout",
        status: "in_progress",
        startedOn: args.today,
        startedAt: now,
        createdAt: now
      }).returning();
      const session = inserted[0];
      if (!session)
        throw new Error("startSession: insert returned no rows");
      if (routine) {
        const rows = await db.select().from(routineExercises).where(eq(routineExercises.routineId, routine.id)).orderBy(asc(routineExercises.position), asc(routineExercises.id));
        for (const r of rows) {
          const exRows = await db.select().from(exercises).where(eq(exercises.id, r.exerciseId)).limit(1);
          const ex = exRows[0];
          if (!ex)
            continue;
          const seInserted = await db.insert(sessionExercises).values({
            sessionId: session.id,
            exerciseId: ex.id,
            position: r.position,
            exerciseName: ex.name,
            primaryMuscle: ex.primaryMuscle,
            kind: ex.kind,
            restSeconds: r.restSeconds
          }).returning({ id: sessionExercises.id });
          const se = seInserted[0];
          if (!se)
            continue;
          for (let n = 1;n <= r.targetSets; n++) {
            await db.insert(workoutSets).values({
              sessionExerciseId: se.id,
              setNumber: n
            });
          }
        }
      }
      ctx.invalidateQueries();
      return {
        ok: true,
        error: null,
        session: await sessionPayload(db, session),
        resumed: false
      };
    }
  }),
  getActiveSession: defineAction({
    description: "Returns the signed-in user's in-progress workout session, if one exists, with all exercises and sets.",
    request: object({ token: string2().min(1).max(200) }),
    response: object({
      ok: boolean2(),
      error: string2().nullable(),
      session: sessionShape.nullable()
    }),
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in.", session: null };
      const rows = await db.select().from(workoutSessions).where(and(eq(workoutSessions.userId, resolved.userId), eq(workoutSessions.status, "in_progress"))).orderBy(desc(workoutSessions.id)).limit(1);
      const session = rows[0];
      if (!session)
        return { ok: true, error: null, session: null };
      return { ok: true, error: null, session: await sessionPayload(db, session) };
    }
  }),
  getWorkoutSession: defineAction({
    description: "Returns one of the signed-in user's workout sessions (live or completed) with exercises, sets and volume.",
    request: object({
      token: string2().min(1).max(200),
      sessionId: number2().int().positive()
    }),
    response: object({
      ok: boolean2(),
      error: string2().nullable(),
      session: sessionShape.nullable()
    }),
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in.", session: null };
      const session = await ownSession(db, resolved.userId, args.sessionId);
      if (!session)
        return { ok: false, error: "Session not found.", session: null };
      return { ok: true, error: null, session: await sessionPayload(db, session) };
    }
  }),
  addSessionExercise: defineAction({
    description: "Adds a library exercise to the signed-in user's in-progress session.",
    request: object({
      token: string2().min(1).max(200),
      sessionId: number2().int().positive(),
      exerciseId: number2().int().positive()
    }),
    response: okResponse,
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const session = await ownSession(db, resolved.userId, args.sessionId);
      if (!session)
        return { ok: false, error: "Session not found." };
      if (session.status !== "in_progress")
        return { ok: false, error: "This workout is already finished." };
      await ensureExerciseLibrary(db);
      const exRows = await db.select().from(exercises).where(eq(exercises.id, args.exerciseId)).limit(1);
      const ex = exRows[0];
      if (!ex)
        return { ok: false, error: "Exercise not found." };
      const existing = await db.select({ position: sessionExercises.position }).from(sessionExercises).where(eq(sessionExercises.sessionId, session.id)).orderBy(desc(sessionExercises.position)).limit(1);
      const seInserted = await db.insert(sessionExercises).values({
        sessionId: session.id,
        exerciseId: ex.id,
        position: (existing[0]?.position ?? 0) + 1,
        exerciseName: ex.name,
        primaryMuscle: ex.primaryMuscle,
        kind: ex.kind,
        restSeconds: ex.restSeconds
      }).returning({ id: sessionExercises.id });
      const se = seInserted[0];
      if (se) {
        for (let n = 1;n <= ex.suggestedSets; n++) {
          await db.insert(workoutSets).values({
            sessionExerciseId: se.id,
            setNumber: n
          });
        }
      }
      ctx.invalidateQueries();
      return { ok: true, error: null };
    }
  }),
  removeSessionExercise: defineAction({
    description: "Removes an exercise (and its sets) from the signed-in user's in-progress session.",
    request: object({
      token: string2().min(1).max(200),
      sessionExerciseId: number2().int().positive()
    }),
    response: okResponse,
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const found = await ownSessionExercise(db, resolved.userId, args.sessionExerciseId);
      if (!found)
        return { ok: false, error: "Exercise not found." };
      if (found.session.status !== "in_progress")
        return { ok: false, error: "This workout is already finished." };
      await db.delete(workoutSets).where(eq(workoutSets.sessionExerciseId, found.ex.id));
      await db.delete(sessionExercises).where(eq(sessionExercises.id, found.ex.id));
      ctx.invalidateQueries();
      return { ok: true, error: null };
    }
  }),
  skipSessionExercise: defineAction({
    description: "Marks an exercise in the in-progress session as skipped (or un-skips it). Skipped exercises' sets never count toward volume or records.",
    request: object({
      token: string2().min(1).max(200),
      sessionExerciseId: number2().int().positive(),
      skipped: boolean2()
    }),
    response: okResponse,
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const found = await ownSessionExercise(db, resolved.userId, args.sessionExerciseId);
      if (!found)
        return { ok: false, error: "Exercise not found." };
      if (found.session.status !== "in_progress")
        return { ok: false, error: "This workout is already finished." };
      await db.update(sessionExercises).set({ skipped: args.skipped ? 1 : 0 }).where(eq(sessionExercises.id, found.ex.id));
      ctx.invalidateQueries();
      return { ok: true, error: null };
    }
  }),
  substituteExercise: defineAction({
    description: "Substitutes an exercise in the in-progress session: the original is marked skipped (its sets stay in the record but stop counting) and the replacement is inserted right after it with fresh sets.",
    request: object({
      token: string2().min(1).max(200),
      sessionExerciseId: number2().int().positive(),
      newExerciseId: number2().int().positive()
    }),
    response: okResponse,
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const found = await ownSessionExercise(db, resolved.userId, args.sessionExerciseId);
      if (!found)
        return { ok: false, error: "Exercise not found." };
      if (found.session.status !== "in_progress")
        return { ok: false, error: "This workout is already finished." };
      await ensureExerciseLibrary(db);
      const exRows = await db.select().from(exercises).where(eq(exercises.id, args.newExerciseId)).limit(1);
      const ex = exRows[0];
      if (!ex)
        return { ok: false, error: "Exercise not found." };
      const orig = found.ex;
      const later = await db.select().from(sessionExercises).where(eq(sessionExercises.sessionId, found.session.id)).orderBy(desc(sessionExercises.position));
      for (const e of later) {
        if (e.position > orig.position) {
          await db.update(sessionExercises).set({ position: e.position + 1 }).where(eq(sessionExercises.id, e.id));
        }
      }
      await db.update(sessionExercises).set({ skipped: 1 }).where(eq(sessionExercises.id, orig.id));
      const seInserted = await db.insert(sessionExercises).values({
        sessionId: found.session.id,
        exerciseId: ex.id,
        position: orig.position + 1,
        exerciseName: ex.name,
        primaryMuscle: ex.primaryMuscle,
        kind: ex.kind,
        restSeconds: ex.restSeconds
      }).returning({ id: sessionExercises.id });
      const se = seInserted[0];
      if (se) {
        for (let n = 1;n <= ex.suggestedSets; n++) {
          await db.insert(workoutSets).values({
            sessionExerciseId: se.id,
            setNumber: n
          });
        }
      }
      ctx.invalidateQueries();
      return { ok: true, error: null };
    }
  }),
  addSet: defineAction({
    description: "Adds an empty set to an exercise in the signed-in user's in-progress session.",
    request: object({
      token: string2().min(1).max(200),
      sessionExerciseId: number2().int().positive()
    }),
    response: object({
      ok: boolean2(),
      error: string2().nullable(),
      set: setShape.nullable()
    }),
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in.", set: null };
      const found = await ownSessionExercise(db, resolved.userId, args.sessionExerciseId);
      if (!found)
        return { ok: false, error: "Exercise not found.", set: null };
      if (found.session.status !== "in_progress")
        return {
          ok: false,
          error: "This workout is already finished.",
          set: null
        };
      const existing = await db.select({ setNumber: workoutSets.setNumber }).from(workoutSets).where(eq(workoutSets.sessionExerciseId, found.ex.id)).orderBy(desc(workoutSets.setNumber)).limit(1);
      const inserted = await db.insert(workoutSets).values({
        sessionExerciseId: found.ex.id,
        setNumber: (existing[0]?.setNumber ?? 0) + 1
      }).returning();
      const row = inserted[0];
      if (!row)
        throw new Error("addSet: insert returned no rows");
      ctx.invalidateQueries();
      return {
        ok: true,
        error: null,
        set: {
          id: row.id,
          setNumber: row.setNumber,
          reps: row.reps,
          loadKg: row.loadKg,
          durationSeconds: row.durationSeconds,
          completed: row.completed === 1
        }
      };
    }
  }),
  updateSet: defineAction({
    description: "Edits one set in the signed-in user's in-progress session: reps, load (kg), duration, or completed state.",
    request: object({
      token: string2().min(1).max(200),
      setId: number2().int().positive(),
      reps: number2().int().min(0).max(1000).nullable().optional(),
      loadKg: number2().min(0).max(1000).nullable().optional(),
      durationSeconds: number2().int().min(0).max(7200).nullable().optional(),
      completed: boolean2().optional()
    }),
    response: okResponse,
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const found = await ownSet(db, resolved.userId, args.setId);
      if (!found)
        return { ok: false, error: "Set not found." };
      if (found.session.status !== "in_progress")
        return { ok: false, error: "This workout is already finished." };
      const patch = {};
      if (args.reps !== undefined)
        patch.reps = args.reps;
      if (args.loadKg !== undefined)
        patch.loadKg = args.loadKg;
      if (args.durationSeconds !== undefined)
        patch.durationSeconds = args.durationSeconds;
      if (args.completed !== undefined)
        patch.completed = args.completed ? 1 : 0;
      await db.update(workoutSets).set(patch).where(eq(workoutSets.id, found.set.id));
      ctx.invalidateQueries();
      return { ok: true, error: null };
    }
  }),
  deleteSet: defineAction({
    description: "Deletes one set from the signed-in user's in-progress session and renumbers the rest.",
    request: object({
      token: string2().min(1).max(200),
      setId: number2().int().positive()
    }),
    response: okResponse,
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const found = await ownSet(db, resolved.userId, args.setId);
      if (!found)
        return { ok: false, error: "Set not found." };
      if (found.session.status !== "in_progress")
        return { ok: false, error: "This workout is already finished." };
      await db.delete(workoutSets).where(eq(workoutSets.id, found.set.id));
      const rest = await db.select().from(workoutSets).where(eq(workoutSets.sessionExerciseId, found.set.sessionExerciseId)).orderBy(asc(workoutSets.setNumber), asc(workoutSets.id));
      let n = 0;
      for (const s of rest) {
        n += 1;
        if (s.setNumber !== n) {
          await db.update(workoutSets).set({ setNumber: n }).where(eq(workoutSets.id, s.id));
        }
      }
      ctx.invalidateQueries();
      return { ok: true, error: null };
    }
  }),
  setSessionNotes: defineAction({
    description: "Saves notes on one of the signed-in user's workout sessions.",
    request: object({
      token: string2().min(1).max(200),
      sessionId: number2().int().positive(),
      notes: string2().trim().max(1000).nullable()
    }),
    response: okResponse,
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const session = await ownSession(db, resolved.userId, args.sessionId);
      if (!session)
        return { ok: false, error: "Session not found." };
      await db.update(workoutSessions).set({ notes: args.notes }).where(eq(workoutSessions.id, session.id));
      ctx.invalidateQueries();
      return { ok: true, error: null };
    }
  }),
  finishSession: defineAction({
    description: "Finishes the signed-in user's in-progress session: marks it completed, stamps the end time and duration, and saves it to history.",
    request: object({
      token: string2().min(1).max(200),
      sessionId: number2().int().positive(),
      notes: string2().trim().max(1000).nullable().optional()
    }),
    response: object({
      ok: boolean2(),
      error: string2().nullable(),
      session: sessionShape.nullable()
    }),
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in.", session: null };
      const session = await ownSession(db, resolved.userId, args.sessionId);
      if (!session)
        return { ok: false, error: "Session not found.", session: null };
      if (session.status !== "in_progress")
        return {
          ok: false,
          error: "This workout is already finished.",
          session: null
        };
      const now = new Date;
      const durationSeconds = Math.max(0, Math.round((now.getTime() - session.startedAt.getTime()) / 1000));
      const finishPatch = { status: "completed", endedAt: now, durationSeconds };
      if (args.notes !== undefined)
        finishPatch.notes = args.notes;
      await db.update(workoutSessions).set(finishPatch).where(eq(workoutSessions.id, session.id));
      ctx.invalidateQueries();
      const updated = await ownSession(db, resolved.userId, session.id);
      return {
        ok: true,
        error: null,
        session: updated ? await sessionPayload(db, updated) : null
      };
    }
  }),
  discardSession: defineAction({
    description: "Discards the signed-in user's in-progress session and all its sets. It never reaches history.",
    request: object({
      token: string2().min(1).max(200),
      sessionId: number2().int().positive()
    }),
    response: okResponse,
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const session = await ownSession(db, resolved.userId, args.sessionId);
      if (!session)
        return { ok: false, error: "Session not found." };
      if (session.status !== "in_progress")
        return { ok: false, error: "A finished workout can't be discarded." };
      const exRows = await db.select({ id: sessionExercises.id }).from(sessionExercises).where(eq(sessionExercises.sessionId, session.id));
      for (const ex of exRows) {
        await db.delete(workoutSets).where(eq(workoutSets.sessionExerciseId, ex.id));
      }
      await db.delete(sessionExercises).where(eq(sessionExercises.sessionId, session.id));
      await db.delete(workoutSessions).where(eq(workoutSessions.id, session.id));
      ctx.invalidateQueries();
      return { ok: true, error: null };
    }
  }),
  getWorkoutHistory: defineAction({
    description: "Lists the signed-in user's completed workout sessions, newest first, with exercise/set counts and total volume.",
    request: object({
      token: string2().min(1).max(200),
      limit: number2().int().min(1).max(100).default(30)
    }),
    response: object({
      ok: boolean2(),
      error: string2().nullable(),
      sessions: array(object({
        id: number2(),
        title: string2(),
        startedOn: string2(),
        durationSeconds: number2().nullable(),
        exerciseCount: number2(),
        completedSets: number2(),
        totalVolumeKg: number2(),
        notes: string2().nullable()
      })),
      total: number2()
    }),
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in.", sessions: [], total: 0 };
      const allIds = await db.select({ id: workoutSessions.id }).from(workoutSessions).where(and(eq(workoutSessions.userId, resolved.userId), eq(workoutSessions.status, "completed")));
      const rows = await db.select().from(workoutSessions).where(and(eq(workoutSessions.userId, resolved.userId), eq(workoutSessions.status, "completed"))).orderBy(desc(workoutSessions.startedAt)).limit(args.limit);
      const sessions2 = [];
      for (const s of rows) {
        const p = await sessionPayload(db, s);
        sessions2.push({
          id: s.id,
          title: s.title,
          startedOn: s.startedOn,
          durationSeconds: s.durationSeconds,
          exerciseCount: p.exercises.filter((e) => !e.skipped).length,
          completedSets: p.completedSets,
          totalVolumeKg: p.totalVolumeKg,
          notes: s.notes
        });
      }
      return { ok: true, error: null, sessions: sessions2, total: allIds.length };
    }
  }),
  getPersonalRecords: defineAction({
    description: "Computes the signed-in user's personal records from their real completed sets only: heaviest load, best estimated 1RM (Epley), best reps and longest hold per exercise.",
    request: object({ token: string2().min(1).max(200) }),
    response: object({
      ok: boolean2(),
      error: string2().nullable(),
      records: array(prShape)
    }),
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in.", records: [] };
      const done = await allCompletedSets(db, resolved.userId);
      return { ok: true, error: null, records: computePrs(done) };
    }
  }),
  getExerciseProgress: defineAction({
    description: "Returns one exercise's progression for the signed-in user: per-session best set and volume from completed workouts, plus its personal records.",
    request: object({
      token: string2().min(1).max(200),
      exerciseId: number2().int().positive()
    }),
    response: object({
      ok: boolean2(),
      error: string2().nullable(),
      exerciseName: string2().nullable(),
      kind: _enum(["weighted", "bodyweight", "timed"]).nullable(),
      record: prShape.nullable(),
      sessions: array(object({
        date: string2(),
        bestLoadKg: number2().nullable(),
        bestLoadReps: number2().nullable(),
        bestReps: number2().nullable(),
        longestSeconds: number2().nullable(),
        volumeKg: number2(),
        setCount: number2()
      }))
    }),
    async handler(ctx, args) {
      const fail = {
        ok: false,
        error: "You are not signed in.",
        exerciseName: null,
        kind: null,
        record: null,
        sessions: []
      };
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return fail;
      await ensureExerciseLibrary(db);
      const exRows = await db.select().from(exercises).where(eq(exercises.id, args.exerciseId)).limit(1);
      const ex = exRows[0];
      if (!ex)
        return { ...fail, error: "Exercise not found." };
      const done = (await allCompletedSets(db, resolved.userId)).filter((s) => s.exerciseId === args.exerciseId);
      const byDate = new Map;
      for (const s of done) {
        const list = byDate.get(s.date) ?? [];
        list.push(s);
        byDate.set(s.date, list);
      }
      const sessions2 = [...byDate.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([date, sets]) => {
        let bestLoadKg = null;
        let bestLoadReps = null;
        let bestReps = null;
        let longestSeconds = null;
        let volumeKg = 0;
        for (const s of sets) {
          if (s.loadKg != null && s.loadKg > 0) {
            if (bestLoadKg == null || s.loadKg > bestLoadKg) {
              bestLoadKg = s.loadKg;
              bestLoadReps = s.reps;
            }
            if (s.reps != null)
              volumeKg += s.reps * s.loadKg;
          }
          if (s.reps != null && (bestReps == null || s.reps > bestReps))
            bestReps = s.reps;
          if (s.durationSeconds != null && (longestSeconds == null || s.durationSeconds > longestSeconds))
            longestSeconds = s.durationSeconds;
        }
        return {
          date,
          bestLoadKg,
          bestLoadReps,
          bestReps,
          longestSeconds,
          volumeKg: Math.round(volumeKg * 10) / 10,
          setCount: sets.length
        };
      });
      const prs = computePrs(done);
      return {
        ok: true,
        error: null,
        exerciseName: ex.name,
        kind: ex.kind,
        record: prs[0] ?? null,
        sessions: sessions2
      };
    }
  }),
  getProgress: defineAction({
    description: "Returns the signed-in user's progress analytics for a time range (7/30/90/180/365 days): real weight points, daily calorie and macro series from the diary, workout frequency, personal records, hydration totals, body measurements and challenge consistency. Days with no records are returned explicitly as unlogged — nothing is interpolated.",
    request: object({
      token: string2().min(1).max(200),
      today: string2().regex(/^\d{4}-\d{2}-\d{2}$/),
      days: number2().int()
    }),
    response: object({
      ok: boolean2(),
      error: string2().nullable(),
      rangeDays: number2(),
      from: string2(),
      to: string2(),
      weights: array(object({ loggedOn: string2(), weightKg: number2() })),
      calorieDays: array(object({
        date: string2(),
        logged: boolean2(),
        kcal: number2(),
        protein: number2(),
        carbs: number2(),
        fat: number2(),
        fibre: number2()
      })),
      calorieTarget: number2().nullable(),
      macroAverages: object({
        daysLogged: number2(),
        kcal: number2(),
        protein: number2(),
        carbs: number2(),
        fat: number2(),
        fibre: number2()
      }),
      workoutDays: array(object({ date: string2(), sessions: number2() })),
      totalWorkouts: number2(),
      workoutsPerWeek: number2(),
      records: array(prShape),
      waterDays: array(object({ date: string2(), totalMl: number2() })),
      waterTargetMl: number2(),
      measurements: array(object({
        id: number2(),
        loggedOn: string2(),
        waistCm: number2().nullable(),
        chestCm: number2().nullable(),
        armCm: number2().nullable(),
        thighCm: number2().nullable(),
        hipCm: number2().nullable(),
        neckCm: number2().nullable()
      })),
      challenges: array(challengeSummaryShape)
    }),
    async handler(ctx, args) {
      const fail = {
        ok: false,
        error: "You are not signed in.",
        rangeDays: 30,
        from: args.today,
        to: args.today,
        weights: [],
        calorieDays: [],
        calorieTarget: null,
        macroAverages: {
          daysLogged: 0,
          kcal: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fibre: 0
        },
        workoutDays: [],
        totalWorkouts: 0,
        workoutsPerWeek: 0,
        records: [],
        waterDays: [],
        waterTargetMl: WATER_SUGGESTED_ML,
        measurements: [],
        challenges: []
      };
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return fail;
      const userId = resolved.userId;
      const profile = await loadProfile(db, userId);
      if (!profile)
        return fail;
      const rangeDays = [7, 30, 90, 180, 365].includes(args.days) ? args.days : 30;
      const to = args.today;
      const from = shiftDateStr(to, -(rangeDays - 1));
      const dates = [];
      for (let i = 0;i < rangeDays; i++)
        dates.push(shiftDateStr(from, i));
      const weightRows = await db.select().from(weightLogs).where(eq(weightLogs.userId, userId)).orderBy(asc(weightLogs.loggedOn), asc(weightLogs.id));
      const weights = weightRows.filter((w) => w.loggedOn >= from && w.loggedOn <= to).map((w) => ({ loggedOn: w.loggedOn, weightKg: w.weightKg }));
      const diaryRows = await db.select().from(diaryEntries).where(eq(diaryEntries.userId, userId)).orderBy(asc(diaryEntries.id));
      const diaryByDay = new Map;
      for (const row of diaryRows) {
        if (row.loggedOn < from || row.loggedOn > to)
          continue;
        const p = entryPayload(row);
        const cur = diaryByDay.get(row.loggedOn) ?? {
          kcal: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fibre: 0,
          count: 0
        };
        cur.kcal += p.kcal;
        cur.protein += p.protein;
        cur.carbs += p.carbs;
        cur.fat += p.fat;
        cur.fibre += p.fibre;
        cur.count += 1;
        diaryByDay.set(row.loggedOn, cur);
      }
      const calorieDays = dates.map((date) => {
        const d = diaryByDay.get(date);
        return {
          date,
          logged: d != null,
          kcal: d ? r1(d.kcal) : 0,
          protein: d ? r1(d.protein) : 0,
          carbs: d ? r1(d.carbs) : 0,
          fat: d ? r1(d.fat) : 0,
          fibre: d ? r1(d.fibre) : 0
        };
      });
      const loggedDays = calorieDays.filter((d) => d.logged);
      const avg = (k) => loggedDays.length === 0 ? 0 : r1(loggedDays.reduce((s, d) => s + d[k], 0) / loggedDays.length);
      const macroAverages = {
        daysLogged: loggedDays.length,
        kcal: avg("kcal"),
        protein: avg("protein"),
        carbs: avg("carbs"),
        fat: avg("fat"),
        fibre: avg("fibre")
      };
      const sessionRows = await db.select().from(workoutSessions).where(and(eq(workoutSessions.userId, userId), eq(workoutSessions.status, "completed")));
      const sessByDay = new Map;
      for (const s of sessionRows) {
        if (s.startedOn < from || s.startedOn > to)
          continue;
        sessByDay.set(s.startedOn, (sessByDay.get(s.startedOn) ?? 0) + 1);
      }
      const workoutDays = dates.map((date) => ({
        date,
        sessions: sessByDay.get(date) ?? 0
      }));
      const totalWorkouts = workoutDays.reduce((s, d) => s + d.sessions, 0);
      const waterRows = await db.select().from(waterEntries).where(eq(waterEntries.userId, userId));
      const waterByDay = new Map;
      for (const w of waterRows) {
        if (w.loggedOn < from || w.loggedOn > to)
          continue;
        waterByDay.set(w.loggedOn, (waterByDay.get(w.loggedOn) ?? 0) + w.amountMl);
      }
      const waterDays = dates.map((date) => ({
        date,
        totalMl: waterByDay.get(date) ?? 0
      }));
      const target = await waterTarget(db, userId);
      const measurementRows = await db.select().from(measurements).where(eq(measurements.userId, userId)).orderBy(asc(measurements.loggedOn), asc(measurements.id));
      const measurements2 = measurementRows.map((m) => ({
        id: m.id,
        loggedOn: m.loggedOn,
        waistCm: m.waistCm,
        chestCm: m.chestCm,
        armCm: m.armCm,
        thighCm: m.thighCm,
        hipCm: m.hipCm,
        neckCm: m.neckCm
      }));
      const challengeRows = await db.select().from(challenges).where(eq(challenges.userId, userId)).orderBy(desc(challenges.createdAt));
      const challenges2 = [];
      for (const ch of challengeRows)
        challenges2.push(await challengeSummary(db, ch, to));
      const targets = computeTargets(profile);
      return {
        ok: true,
        error: null,
        rangeDays,
        from,
        to,
        weights,
        calorieDays,
        calorieTarget: targets.calorieTarget,
        macroAverages,
        workoutDays,
        totalWorkouts,
        workoutsPerWeek: r1(totalWorkouts / (rangeDays / 7)),
        records: computePrs(await allCompletedSets(db, userId)),
        waterDays,
        waterTargetMl: target.targetMl,
        measurements: measurements2,
        challenges: challenges2
      };
    }
  }),
  logMeasurement: defineAction({
    description: "Saves the signed-in user's body measurements for a date (one row per date — saving again on the same date updates it). Every field is optional; at least one is required.",
    request: object({
      token: string2().min(1).max(200),
      loggedOn: string2().regex(/^\d{4}-\d{2}-\d{2}$/),
      waistCm: number2().min(20).max(300).nullable().optional(),
      chestCm: number2().min(20).max(300).nullable().optional(),
      armCm: number2().min(10).max(120).nullable().optional(),
      thighCm: number2().min(10).max(200).nullable().optional(),
      hipCm: number2().min(20).max(300).nullable().optional(),
      neckCm: number2().min(10).max(120).nullable().optional()
    }),
    response: okResponse,
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const userId = resolved.userId;
      const fields = {
        waistCm: args.waistCm,
        chestCm: args.chestCm,
        armCm: args.armCm,
        thighCm: args.thighCm,
        hipCm: args.hipCm,
        neckCm: args.neckCm
      };
      if (Object.values(fields).every((v) => v == null))
        return { ok: false, error: "Enter at least one measurement." };
      const existing = await db.select().from(measurements).where(and(eq(measurements.userId, userId), eq(measurements.loggedOn, args.loggedOn))).limit(1);
      const patch = {};
      for (const [k, v] of Object.entries(fields))
        if (v !== undefined)
          patch[k] = v;
      if (existing[0]) {
        await db.update(measurements).set(patch).where(eq(measurements.id, existing[0].id));
      } else {
        await db.insert(measurements).values({
          userId,
          loggedOn: args.loggedOn,
          waistCm: args.waistCm ?? null,
          chestCm: args.chestCm ?? null,
          armCm: args.armCm ?? null,
          thighCm: args.thighCm ?? null,
          hipCm: args.hipCm ?? null,
          neckCm: args.neckCm ?? null
        });
      }
      ctx.invalidateQueries();
      return { ok: true, error: null };
    }
  }),
  deleteMeasurement: defineAction({
    description: "Deletes one of the signed-in user's own measurement rows.",
    request: object({
      token: string2().min(1).max(200),
      id: number2().int().positive()
    }),
    response: okResponse,
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const rows = await db.select({ id: measurements.id }).from(measurements).where(and(eq(measurements.id, args.id), eq(measurements.userId, resolved.userId))).limit(1);
      if (!rows[0])
        return { ok: false, error: "Entry not found." };
      await db.delete(measurements).where(eq(measurements.id, rows[0].id));
      ctx.invalidateQueries();
      return { ok: true, error: null };
    }
  }),
  getWaterDay: defineAction({
    description: "Returns the signed-in user's water entries for a date, the day total, their daily target (or the 2,500 ml suggestion when unset), and the last 7 days of totals ending on that date.",
    request: object({
      token: string2().min(1).max(200),
      date: string2().regex(/^\d{4}-\d{2}-\d{2}$/)
    }),
    response: object({
      ok: boolean2(),
      error: string2().nullable(),
      entries: array(object({
        id: number2(),
        amountMl: number2(),
        createdAt: string2()
      })),
      totalMl: number2(),
      targetMl: number2(),
      targetIsCustom: boolean2(),
      week: array(object({ date: string2(), totalMl: number2() }))
    }),
    async handler(ctx, args) {
      const fail = {
        ok: false,
        error: "You are not signed in.",
        entries: [],
        totalMl: 0,
        targetMl: WATER_SUGGESTED_ML,
        targetIsCustom: false,
        week: []
      };
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return fail;
      const userId = resolved.userId;
      const rows = await db.select().from(waterEntries).where(eq(waterEntries.userId, userId)).orderBy(asc(waterEntries.id));
      const entries = rows.filter((r) => r.loggedOn === args.date).map((r) => ({
        id: r.id,
        amountMl: r.amountMl,
        createdAt: r.createdAt.toISOString()
      }));
      const byDay = new Map;
      for (const r of rows)
        byDay.set(r.loggedOn, (byDay.get(r.loggedOn) ?? 0) + r.amountMl);
      const week = [];
      for (let i = 6;i >= 0; i--) {
        const d = shiftDateStr(args.date, -i);
        week.push({ date: d, totalMl: byDay.get(d) ?? 0 });
      }
      const target = await waterTarget(db, userId);
      return {
        ok: true,
        error: null,
        entries,
        totalMl: entries.reduce((s, e) => s + e.amountMl, 0),
        targetMl: target.targetMl,
        targetIsCustom: target.isCustom,
        week
      };
    }
  }),
  addWater: defineAction({
    description: "Logs a water entry (ml) for the signed-in user on a date. A repeated clientKey returns success without duplicating the entry.",
    request: object({
      token: string2().min(1).max(200),
      date: string2().regex(/^\d{4}-\d{2}-\d{2}$/),
      amountMl: number2().int().min(10).max(3000),
      clientKey: string2().min(8).max(80)
    }),
    response: object({
      ok: boolean2(),
      error: string2().nullable(),
      duplicate: boolean2()
    }),
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in.", duplicate: false };
      const userId = resolved.userId;
      const dup = await db.select({ id: waterEntries.id }).from(waterEntries).where(and(eq(waterEntries.userId, userId), eq(waterEntries.clientKey, args.clientKey))).limit(1);
      if (dup[0])
        return { ok: true, error: null, duplicate: true };
      await db.insert(waterEntries).values({
        userId,
        loggedOn: args.date,
        amountMl: args.amountMl,
        clientKey: args.clientKey
      });
      ctx.invalidateQueries();
      return { ok: true, error: null, duplicate: false };
    }
  }),
  updateWaterEntry: defineAction({
    description: "Changes the amount of one of the signed-in user's own water entries.",
    request: object({
      token: string2().min(1).max(200),
      entryId: number2().int().positive(),
      amountMl: number2().int().min(10).max(3000)
    }),
    response: okResponse,
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const rows = await db.select({ id: waterEntries.id }).from(waterEntries).where(and(eq(waterEntries.id, args.entryId), eq(waterEntries.userId, resolved.userId))).limit(1);
      if (!rows[0])
        return { ok: false, error: "Entry not found." };
      await db.update(waterEntries).set({ amountMl: args.amountMl }).where(eq(waterEntries.id, rows[0].id));
      ctx.invalidateQueries();
      return { ok: true, error: null };
    }
  }),
  deleteWaterEntry: defineAction({
    description: "Deletes one of the signed-in user's own water entries.",
    request: object({
      token: string2().min(1).max(200),
      entryId: number2().int().positive()
    }),
    response: okResponse,
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const rows = await db.select({ id: waterEntries.id }).from(waterEntries).where(and(eq(waterEntries.id, args.entryId), eq(waterEntries.userId, resolved.userId))).limit(1);
      if (!rows[0])
        return { ok: false, error: "Entry not found." };
      await db.delete(waterEntries).where(eq(waterEntries.id, rows[0].id));
      ctx.invalidateQueries();
      return { ok: true, error: null };
    }
  }),
  setWaterTarget: defineAction({
    description: "Sets the signed-in user's own daily water target in ml, stored in their preferences.",
    request: object({
      token: string2().min(1).max(200),
      targetMl: number2().int().min(500).max(6000)
    }),
    response: okResponse,
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const userId = resolved.userId;
      const rows = await db.select({ userId: userPreferences.userId }).from(userPreferences).where(eq(userPreferences.userId, userId)).limit(1);
      if (rows[0]) {
        await db.update(userPreferences).set({ waterTargetMl: args.targetMl, updatedAt: new Date }).where(eq(userPreferences.userId, userId));
      } else {
        await db.insert(userPreferences).values({
          userId,
          waterTargetMl: args.targetMl
        });
      }
      ctx.invalidateQueries();
      return { ok: true, error: null };
    }
  }),
  searchRecipes: defineAction({
    description: "Searches the recipe library (shared recipes plus the signed-in user's own) by name, with category, diet, high-protein and favourites filters. Per-serving nutrition is calculated live from each recipe's catalogue ingredients.",
    request: object({
      token: string2().min(1).max(200),
      query: string2().trim().max(80).default(""),
      category: recipeCategoryEnum.optional(),
      dietFlag: _enum(["veg", "vegan", "eggetarian", "non_veg"]).optional(),
      highProteinOnly: boolean2().default(false),
      favouritesOnly: boolean2().default(false)
    }),
    response: object({
      ok: boolean2(),
      error: string2().nullable(),
      recipes: array(recipeShape)
    }),
    async handler(ctx, args) {
      const fail = { ok: false, error: "You are not signed in.", recipes: [] };
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return fail;
      const userId = resolved.userId;
      await ensureRecipeLibrary(db);
      const [all, favIds] = await Promise.all([
        db.select().from(recipes).where(or(isNull(recipes.ownerUserId), eq(recipes.ownerUserId, userId))),
        favouriteRecipeIdSet(db, userId)
      ]);
      const q = args.query.toLowerCase();
      const out = [];
      for (const r of all) {
        if (args.category && r.category !== args.category)
          continue;
        if (args.dietFlag && r.dietFlag !== args.dietFlag)
          continue;
        if (args.favouritesOnly && !favIds.has(r.id))
          continue;
        if (q && !r.name.toLowerCase().includes(q))
          continue;
        const data = await recipeData(db, r);
        const payload = recipePayload(r, data, userId, favIds);
        if (args.highProteinOnly && !payload.highProtein)
          continue;
        out.push(payload);
      }
      out.sort((a, b) => a.name.localeCompare(b.name));
      return { ok: true, error: null, recipes: out };
    }
  }),
  getRecipe: defineAction({
    description: "Returns one visible recipe in full: ingredients with their calculated nutrition contribution, steps, whole-recipe totals and per-serving values.",
    request: object({
      token: string2().min(1).max(200),
      recipeId: number2().int().positive()
    }),
    response: object({
      ok: boolean2(),
      error: string2().nullable(),
      recipe: recipeDetailShape.nullable()
    }),
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in.", recipe: null };
      const userId = resolved.userId;
      await ensureRecipeLibrary(db);
      const recipe = await visibleRecipe(db, userId, args.recipeId);
      if (!recipe)
        return { ok: false, error: "Recipe not found.", recipe: null };
      const favIds = await favouriteRecipeIdSet(db, userId);
      const data = await recipeData(db, recipe);
      const base = recipePayload(recipe, data, userId, favIds);
      return {
        ok: true,
        error: null,
        recipe: {
          ...base,
          steps: recipe.steps.split(`
`).map((s) => s.trim()).filter(Boolean),
          ingredients: data.ingredients.map((ing) => ({
            id: ing.id,
            foodId: ing.foodId,
            name: ing.name,
            quantityGrams: ing.quantityGrams,
            kcal: ing.computed.kcal,
            protein: ing.computed.protein,
            carbs: ing.computed.carbs,
            fat: ing.computed.fat,
            fibre: ing.computed.fibre
          })),
          totals: data.totals,
          methodNote: RECIPE_METHOD_NOTE
        }
      };
    }
  }),
  toggleFavouriteRecipe: defineAction({
    description: "Stars or unstars a recipe for the signed-in user.",
    request: object({
      token: string2().min(1).max(200),
      recipeId: number2().int().positive()
    }),
    response: object({
      ok: boolean2(),
      error: string2().nullable(),
      isFavourite: boolean2()
    }),
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in.", isFavourite: false };
      const userId = resolved.userId;
      await ensureRecipeLibrary(db);
      const recipe = await visibleRecipe(db, userId, args.recipeId);
      if (!recipe)
        return { ok: false, error: "Recipe not found.", isFavourite: false };
      const existing = await db.select({ id: favouriteRecipes.id }).from(favouriteRecipes).where(and(eq(favouriteRecipes.userId, userId), eq(favouriteRecipes.recipeId, recipe.id))).limit(1);
      if (existing[0]) {
        await db.delete(favouriteRecipes).where(eq(favouriteRecipes.id, existing[0].id));
        ctx.invalidateQueries();
        return { ok: true, error: null, isFavourite: false };
      }
      await db.insert(favouriteRecipes).values({
        userId,
        recipeId: recipe.id
      });
      ctx.invalidateQueries();
      return { ok: true, error: null, isFavourite: true };
    }
  }),
  createRecipe: defineAction({
    description: "Creates a private recipe for the signed-in user from catalogue ingredients; its diet flag and nutrition are derived from those ingredients, exactly like the shared library.",
    request: object({
      token: string2().min(1).max(200),
      name: string2().trim().min(1).max(80),
      description: string2().trim().max(300).default(""),
      category: recipeCategoryEnum,
      servings: number2().min(0.5).max(50),
      prepMinutes: number2().int().min(0).max(600),
      cookMinutes: number2().int().min(0).max(600).nullable().optional(),
      steps: array(string2().trim().min(1).max(300)).max(20),
      budget: boolean2().default(false),
      ingredients: array(object({
        foodId: number2().int().positive(),
        quantityGrams: number2().min(1).max(5000)
      })).min(1).max(30)
    }),
    response: object({
      ok: boolean2(),
      error: string2().nullable(),
      recipeId: number2().nullable()
    }),
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in.", recipeId: null };
      const userId = resolved.userId;
      await ensureFoodCatalog(db);
      const foods2 = await visibleFoods(db, userId);
      const foodById = new Map(foods2.map((f) => [f.id, f]));
      const resolvedIngs = [];
      for (const ing of args.ingredients) {
        const food = foodById.get(ing.foodId);
        if (!food)
          return {
            ok: false,
            error: "An ingredient is not available.",
            recipeId: null
          };
        resolvedIngs.push({ food, grams: ing.quantityGrams });
      }
      const dietFlag = deriveDietFlag(resolvedIngs.map((r) => r.food.dietFlag));
      const inserted = await db.insert(recipes).values({
        name: args.name,
        description: args.description,
        category: args.category,
        dietFlag,
        servings: args.servings,
        prepMinutes: args.prepMinutes,
        cookMinutes: args.cookMinutes ?? null,
        steps: args.steps.join(`
`),
        budget: args.budget ? 1 : 0,
        ownerUserId: userId
      }).returning();
      const row = inserted[0];
      if (!row)
        throw new Error("createRecipe: insert returned no rows");
      await db.insert(recipeIngredients).values(resolvedIngs.map((r, i) => ({
        recipeId: row.id,
        foodId: r.food.id,
        name: r.food.name,
        quantityGrams: r.grams,
        position: i
      })));
      ctx.invalidateQueries();
      return { ok: true, error: null, recipeId: row.id };
    }
  }),
  updateRecipe: defineAction({
    description: "Replaces the signed-in user's own recipe (fields and full ingredient list). Shared library recipes cannot be edited.",
    request: object({
      token: string2().min(1).max(200),
      recipeId: number2().int().positive(),
      name: string2().trim().min(1).max(80),
      description: string2().trim().max(300).default(""),
      category: recipeCategoryEnum,
      servings: number2().min(0.5).max(50),
      prepMinutes: number2().int().min(0).max(600),
      cookMinutes: number2().int().min(0).max(600).nullable().optional(),
      steps: array(string2().trim().min(1).max(300)).max(20),
      budget: boolean2().default(false),
      ingredients: array(object({
        foodId: number2().int().positive(),
        quantityGrams: number2().min(1).max(5000)
      })).min(1).max(30)
    }),
    response: okResponse,
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const userId = resolved.userId;
      const rows = await db.select().from(recipes).where(eq(recipes.id, args.recipeId)).limit(1);
      const recipe = rows[0];
      if (!recipe || recipe.ownerUserId !== userId)
        return { ok: false, error: "Recipe not found." };
      await ensureFoodCatalog(db);
      const foods2 = await visibleFoods(db, userId);
      const foodById = new Map(foods2.map((f) => [f.id, f]));
      const resolvedIngs = [];
      for (const ing of args.ingredients) {
        const food = foodById.get(ing.foodId);
        if (!food)
          return { ok: false, error: "An ingredient is not available." };
        resolvedIngs.push({ food, grams: ing.quantityGrams });
      }
      const dietFlag = deriveDietFlag(resolvedIngs.map((r) => r.food.dietFlag));
      await db.update(recipes).set({
        name: args.name,
        description: args.description,
        category: args.category,
        dietFlag,
        servings: args.servings,
        prepMinutes: args.prepMinutes,
        cookMinutes: args.cookMinutes ?? null,
        steps: args.steps.join(`
`),
        budget: args.budget ? 1 : 0
      }).where(eq(recipes.id, recipe.id));
      await db.delete(recipeIngredients).where(eq(recipeIngredients.recipeId, recipe.id));
      await db.insert(recipeIngredients).values(resolvedIngs.map((r, i) => ({
        recipeId: recipe.id,
        foodId: r.food.id,
        name: r.food.name,
        quantityGrams: r.grams,
        position: i
      })));
      ctx.invalidateQueries();
      return { ok: true, error: null };
    }
  }),
  deleteRecipe: defineAction({
    description: "Deletes the signed-in user's own recipe, its ingredients, and any favourites or meal-plan entries pointing at it.",
    request: object({
      token: string2().min(1).max(200),
      recipeId: number2().int().positive()
    }),
    response: okResponse,
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const rows = await db.select().from(recipes).where(eq(recipes.id, args.recipeId)).limit(1);
      const recipe = rows[0];
      if (!recipe || recipe.ownerUserId !== resolved.userId)
        return { ok: false, error: "Recipe not found." };
      await db.delete(recipeIngredients).where(eq(recipeIngredients.recipeId, recipe.id));
      await db.delete(favouriteRecipes).where(eq(favouriteRecipes.recipeId, recipe.id));
      await db.delete(mealPlanEntries).where(eq(mealPlanEntries.recipeId, recipe.id));
      await db.delete(recipes).where(eq(recipes.id, recipe.id));
      ctx.invalidateQueries();
      return { ok: true, error: null };
    }
  }),
  addRecipeToDiary: defineAction({
    description: "Adds servings of a recipe to the signed-in user's food diary as a real entry: the stored snapshot is the recipe's calculated per-serving nutrition, so diary totals rise by exactly that amount. A repeated clientKey returns the existing entry.",
    request: object({
      token: string2().min(1).max(200),
      recipeId: number2().int().positive(),
      date: string2().regex(/^\d{4}-\d{2}-\d{2}$/),
      meal: mealEnum,
      servings: number2().min(0.25).max(10),
      clientKey: string2().min(8).max(80)
    }),
    response: object({
      ok: boolean2(),
      error: string2().nullable(),
      entry: entryShape.nullable(),
      duplicate: boolean2()
    }),
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return {
          ok: false,
          error: "You are not signed in.",
          entry: null,
          duplicate: false
        };
      const userId = resolved.userId;
      const dup = await db.select().from(diaryEntries).where(and(eq(diaryEntries.userId, userId), eq(diaryEntries.clientKey, args.clientKey))).limit(1);
      if (dup[0])
        return {
          ok: true,
          error: null,
          entry: entryPayload(dup[0]),
          duplicate: true
        };
      await ensureRecipeLibrary(db);
      const recipe = await visibleRecipe(db, userId, args.recipeId);
      if (!recipe)
        return {
          ok: false,
          error: "Recipe not found.",
          entry: null,
          duplicate: false
        };
      const data = await recipeData(db, recipe);
      const inserted = await db.insert(diaryEntries).values({
        userId,
        foodId: null,
        loggedOn: args.date,
        meal: args.meal,
        quantityGrams: 100 * args.servings,
        servings: args.servings,
        foodName: recipe.name,
        kcalPer100: r2(data.perServing.kcal),
        proteinPer100: r2(data.perServing.protein),
        carbsPer100: r2(data.perServing.carbs),
        fatPer100: r2(data.perServing.fat),
        fibrePer100: r2(data.perServing.fibre),
        servingName: "1 serving (recipe)",
        servingGrams: 100,
        clientKey: args.clientKey
      }).returning();
      const row = inserted[0];
      if (!row)
        throw new Error("addRecipeToDiary: insert returned no rows");
      ctx.invalidateQueries();
      return { ok: true, error: null, entry: entryPayload(row), duplicate: false };
    }
  }),
  getMealPlan: defineAction({
    description: "Returns the signed-in user's weekly meal plan: recipes assigned to weekdays and meals, with each recipe's calculated per-serving calories.",
    request: object({ token: string2().min(1).max(200) }),
    response: object({
      ok: boolean2(),
      error: string2().nullable(),
      entries: array(object({
        id: number2(),
        weekday: number2(),
        meal: mealEnum,
        recipeId: number2(),
        recipeName: string2(),
        servings: number2(),
        kcalPerServing: number2()
      }))
    }),
    async handler(ctx, args) {
      const fail = { ok: false, error: "You are not signed in.", entries: [] };
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return fail;
      const userId = resolved.userId;
      await ensureRecipeLibrary(db);
      const rows = await db.select().from(mealPlanEntries).where(eq(mealPlanEntries.userId, userId)).orderBy(asc(mealPlanEntries.weekday), asc(mealPlanEntries.id));
      const entries = [];
      for (const row of rows) {
        const recipe = await visibleRecipe(db, userId, row.recipeId);
        if (!recipe)
          continue;
        const data = await recipeData(db, recipe);
        entries.push({
          id: row.id,
          weekday: row.weekday,
          meal: row.meal,
          recipeId: row.recipeId,
          recipeName: recipe.name,
          servings: row.servings,
          kcalPerServing: data.perServing.kcal
        });
      }
      return { ok: true, error: null, entries };
    }
  }),
  addMealPlanEntry: defineAction({
    description: "Assigns a recipe to a weekday and meal in the signed-in user's weekly meal plan.",
    request: object({
      token: string2().min(1).max(200),
      weekday: number2().int().min(0).max(6),
      meal: mealEnum,
      recipeId: number2().int().positive(),
      servings: number2().min(0.25).max(10).default(1)
    }),
    response: okResponse,
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const userId = resolved.userId;
      await ensureRecipeLibrary(db);
      const recipe = await visibleRecipe(db, userId, args.recipeId);
      if (!recipe)
        return { ok: false, error: "Recipe not found." };
      await db.insert(mealPlanEntries).values({
        userId,
        weekday: args.weekday,
        meal: args.meal,
        recipeId: recipe.id,
        servings: args.servings
      });
      ctx.invalidateQueries();
      return { ok: true, error: null };
    }
  }),
  removeMealPlanEntry: defineAction({
    description: "Removes one entry from the signed-in user's weekly meal plan.",
    request: object({
      token: string2().min(1).max(200),
      entryId: number2().int().positive()
    }),
    response: okResponse,
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const rows = await db.select({ id: mealPlanEntries.id }).from(mealPlanEntries).where(and(eq(mealPlanEntries.id, args.entryId), eq(mealPlanEntries.userId, resolved.userId))).limit(1);
      if (!rows[0])
        return { ok: false, error: "Entry not found." };
      await db.delete(mealPlanEntries).where(eq(mealPlanEntries.id, rows[0].id));
      ctx.invalidateQueries();
      return { ok: true, error: null };
    }
  }),
  getChallenges: defineAction({
    description: "Lists the signed-in user's challenges with live progress: current day, percent of elapsed task-checks done, streak of fully-completed days, and today's check count. All checks are manual — nothing is auto-completed.",
    request: object({
      token: string2().min(1).max(200),
      today: string2().regex(/^\d{4}-\d{2}-\d{2}$/)
    }),
    response: object({
      ok: boolean2(),
      error: string2().nullable(),
      challenges: array(challengeSummaryShape)
    }),
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in.", challenges: [] };
      const rows = await db.select().from(challenges).where(eq(challenges.userId, resolved.userId)).orderBy(desc(challenges.createdAt));
      const challenges2 = [];
      for (const ch of rows)
        challenges2.push(await challengeSummary(db, ch, args.today));
      return { ok: true, error: null, challenges: challenges2 };
    }
  }),
  createChallenge: defineAction({
    description: "Starts a challenge for the signed-in user from a template (30-day Reset, 75-day Strong) or fully custom: name, length in days, start date and the daily task list the user will tick by hand.",
    request: object({
      token: string2().min(1).max(200),
      name: string2().trim().min(1).max(60),
      template: _enum(["reset30", "strong75"]).nullable().optional(),
      totalDays: number2().int().min(1).max(365),
      startedOn: string2().regex(/^\d{4}-\d{2}-\d{2}$/),
      tasks: array(string2().trim().min(1).max(120)).min(1).max(10)
    }),
    response: object({
      ok: boolean2(),
      error: string2().nullable(),
      challengeId: number2().nullable()
    }),
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in.", challengeId: null };
      const inserted = await db.insert(challenges).values({
        userId: resolved.userId,
        name: args.name,
        template: args.template ?? null,
        totalDays: args.totalDays,
        startedOn: args.startedOn,
        status: "active"
      }).returning();
      const row = inserted[0];
      if (!row)
        throw new Error("createChallenge: insert returned no rows");
      await db.insert(challengeTasks).values(args.tasks.map((label, i) => ({
        challengeId: row.id,
        label,
        position: i
      })));
      ctx.invalidateQueries();
      return { ok: true, error: null, challengeId: row.id };
    }
  }),
  getChallenge: defineAction({
    description: "Returns one of the signed-in user's challenges in detail: summary, the task list with tick state for the requested date, that date's note, and per-day completion counts for the whole challenge grid.",
    request: object({
      token: string2().min(1).max(200),
      challengeId: number2().int().positive(),
      date: string2().regex(/^\d{4}-\d{2}-\d{2}$/),
      today: string2().regex(/^\d{4}-\d{2}-\d{2}$/)
    }),
    response: object({
      ok: boolean2(),
      error: string2().nullable(),
      challenge: challengeSummaryShape.nullable(),
      tasks: array(object({ id: number2(), label: string2(), done: boolean2() })),
      note: string2(),
      days: array(object({
        date: string2(),
        dayNumber: number2(),
        doneCount: number2()
      }))
    }),
    async handler(ctx, args) {
      const fail = {
        ok: false,
        error: "You are not signed in.",
        challenge: null,
        tasks: [],
        note: "",
        days: []
      };
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return fail;
      const ch = await ownChallenge(db, resolved.userId, args.challengeId);
      if (!ch)
        return { ...fail, error: "Challenge not found." };
      const taskRows = await db.select().from(challengeTasks).where(eq(challengeTasks.challengeId, ch.id)).orderBy(asc(challengeTasks.position), asc(challengeTasks.id));
      const checks = await db.select().from(challengeChecks).where(eq(challengeChecks.challengeId, ch.id));
      const doneOnDate = new Set(checks.filter((c) => c.loggedOn === args.date).map((c) => c.taskId));
      const perDay = new Map;
      for (const c of checks)
        perDay.set(c.loggedOn, (perDay.get(c.loggedOn) ?? 0) + 1);
      const days = [];
      for (let i = 0;i < ch.totalDays; i++) {
        const date = shiftDateStr(ch.startedOn, i);
        days.push({
          date,
          dayNumber: i + 1,
          doneCount: perDay.get(date) ?? 0
        });
      }
      const noteRows = await db.select().from(challengeDayNotes).where(and(eq(challengeDayNotes.challengeId, ch.id), eq(challengeDayNotes.loggedOn, args.date))).limit(1);
      return {
        ok: true,
        error: null,
        challenge: await challengeSummary(db, ch, args.today),
        tasks: taskRows.map((t) => ({
          id: t.id,
          label: t.label,
          done: doneOnDate.has(t.id)
        })),
        note: noteRows[0]?.note ?? "",
        days
      };
    }
  }),
  toggleChallengeCheck: defineAction({
    description: "Ticks or unticks one daily task of the signed-in user's challenge for a date inside the challenge window. This is the only way a check is ever created — by the user's own hand.",
    request: object({
      token: string2().min(1).max(200),
      challengeId: number2().int().positive(),
      taskId: number2().int().positive(),
      date: string2().regex(/^\d{4}-\d{2}-\d{2}$/),
      done: boolean2()
    }),
    response: okResponse,
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const ch = await ownChallenge(db, resolved.userId, args.challengeId);
      if (!ch)
        return { ok: false, error: "Challenge not found." };
      if (ch.status === "paused")
        return { ok: false, error: "This challenge is paused. Resume it to keep ticking." };
      const endOn = shiftDateStr(ch.startedOn, ch.totalDays - 1);
      if (args.date < ch.startedOn || args.date > endOn)
        return { ok: false, error: "That date is outside the challenge." };
      const taskRows = await db.select({ id: challengeTasks.id }).from(challengeTasks).where(and(eq(challengeTasks.id, args.taskId), eq(challengeTasks.challengeId, ch.id))).limit(1);
      if (!taskRows[0])
        return { ok: false, error: "Task not found." };
      const existing = await db.select({ id: challengeChecks.id }).from(challengeChecks).where(and(eq(challengeChecks.challengeId, ch.id), eq(challengeChecks.taskId, args.taskId), eq(challengeChecks.loggedOn, args.date))).limit(1);
      if (args.done && !existing[0]) {
        await db.insert(challengeChecks).values({
          challengeId: ch.id,
          taskId: args.taskId,
          loggedOn: args.date
        });
      } else if (!args.done && existing[0]) {
        await db.delete(challengeChecks).where(eq(challengeChecks.id, existing[0].id));
      }
      ctx.invalidateQueries();
      return { ok: true, error: null };
    }
  }),
  setChallengeDayNote: defineAction({
    description: "Saves (or clears, when empty) the signed-in user's note for one day of their challenge.",
    request: object({
      token: string2().min(1).max(200),
      challengeId: number2().int().positive(),
      date: string2().regex(/^\d{4}-\d{2}-\d{2}$/),
      note: string2().trim().max(500)
    }),
    response: okResponse,
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const ch = await ownChallenge(db, resolved.userId, args.challengeId);
      if (!ch)
        return { ok: false, error: "Challenge not found." };
      const endOn = shiftDateStr(ch.startedOn, ch.totalDays - 1);
      if (args.date < ch.startedOn || args.date > endOn)
        return { ok: false, error: "That date is outside the challenge." };
      const existing = await db.select({ id: challengeDayNotes.id }).from(challengeDayNotes).where(and(eq(challengeDayNotes.challengeId, ch.id), eq(challengeDayNotes.loggedOn, args.date))).limit(1);
      if (args.note === "") {
        if (existing[0])
          await db.delete(challengeDayNotes).where(eq(challengeDayNotes.id, existing[0].id));
      } else if (existing[0]) {
        await db.update(challengeDayNotes).set({ note: args.note }).where(eq(challengeDayNotes.id, existing[0].id));
      } else {
        await db.insert(challengeDayNotes).values({
          challengeId: ch.id,
          loggedOn: args.date,
          note: args.note
        });
      }
      ctx.invalidateQueries();
      return { ok: true, error: null };
    }
  }),
  setChallengeStatus: defineAction({
    description: "Pauses or resumes one of the signed-in user's challenges. Pausing keeps every check and note.",
    request: object({
      token: string2().min(1).max(200),
      challengeId: number2().int().positive(),
      status: _enum(["active", "paused"])
    }),
    response: okResponse,
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const ch = await ownChallenge(db, resolved.userId, args.challengeId);
      if (!ch)
        return { ok: false, error: "Challenge not found." };
      await db.update(challenges).set({ status: args.status }).where(eq(challenges.id, ch.id));
      ctx.invalidateQueries();
      return { ok: true, error: null };
    }
  }),
  restartChallenge: defineAction({
    description: "Restarts one of the signed-in user's challenges from a new start date: all checks and day notes are cleared and the challenge becomes active. The task list is kept.",
    request: object({
      token: string2().min(1).max(200),
      challengeId: number2().int().positive(),
      startedOn: string2().regex(/^\d{4}-\d{2}-\d{2}$/)
    }),
    response: okResponse,
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const ch = await ownChallenge(db, resolved.userId, args.challengeId);
      if (!ch)
        return { ok: false, error: "Challenge not found." };
      await db.delete(challengeChecks).where(eq(challengeChecks.challengeId, ch.id));
      await db.delete(challengeDayNotes).where(eq(challengeDayNotes.challengeId, ch.id));
      await db.update(challenges).set({ startedOn: args.startedOn, status: "active" }).where(eq(challenges.id, ch.id));
      ctx.invalidateQueries();
      return { ok: true, error: null };
    }
  }),
  deleteChallenge: defineAction({
    description: "Deletes one of the signed-in user's challenges with all its tasks, checks and notes.",
    request: object({
      token: string2().min(1).max(200),
      challengeId: number2().int().positive()
    }),
    response: okResponse,
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const ch = await ownChallenge(db, resolved.userId, args.challengeId);
      if (!ch)
        return { ok: false, error: "Challenge not found." };
      await db.delete(challengeChecks).where(eq(challengeChecks.challengeId, ch.id));
      await db.delete(challengeDayNotes).where(eq(challengeDayNotes.challengeId, ch.id));
      await db.delete(challengeTasks).where(eq(challengeTasks.challengeId, ch.id));
      await db.delete(challenges).where(eq(challenges.id, ch.id));
      ctx.invalidateQueries();
      return { ok: true, error: null };
    }
  }),
  changePassword: defineAction({
    description: "Changes the signed-in user's password after verifying the current one, and ends their other sessions.",
    request: object({
      token: string2().min(1).max(200),
      currentPassword: string2().min(1).max(200),
      newPassword: string2().min(1).max(200)
    }),
    response: okResponse,
    async handler(ctx, args) {
      if (args.newPassword.length < 8)
        return {
          ok: false,
          error: "New password must be at least 8 characters long."
        };
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const rows = await db.select().from(users).where(eq(users.id, resolved.userId)).limit(1);
      const user = rows[0];
      if (!user)
        return { ok: false, error: "Account not found." };
      const attempt = await hashPassword(args.currentPassword, user.passwordSalt);
      if (attempt !== user.passwordHash)
        return { ok: false, error: "Current password is incorrect." };
      const salt = newSalt();
      const passwordHash = await hashPassword(args.newPassword, salt);
      await db.update(users).set({ passwordHash, passwordSalt: salt }).where(eq(users.id, user.id));
      const currentHash = await sha256Hex(args.token);
      const allSessions = await db.select().from(sessions).where(eq(sessions.userId, user.id));
      for (const s of allSessions) {
        if (s.tokenHash !== currentHash) {
          await db.delete(sessions).where(eq(sessions.id, s.id));
        }
      }
      return { ok: true, error: null };
    }
  }),
  deleteAccount: defineAction({
    description: "Permanently deletes the signed-in user's account and all of their FITIND data after password confirmation.",
    request: object({
      token: string2().min(1).max(200),
      password: string2().min(1).max(200)
    }),
    response: okResponse,
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const rows = await db.select().from(users).where(eq(users.id, resolved.userId)).limit(1);
      const user = rows[0];
      if (!user)
        return { ok: false, error: "Account not found." };
      const attempt = await hashPassword(args.password, user.passwordSalt);
      if (attempt !== user.passwordHash)
        return { ok: false, error: "Password is incorrect." };
      const userId = user.id;
      await db.delete(sessions).where(eq(sessions.userId, userId));
      await db.delete(adminRoles).where(eq(adminRoles.userId, userId));
      const userSessions = await db.select({ id: workoutSessions.id }).from(workoutSessions).where(eq(workoutSessions.userId, userId));
      for (const s of userSessions) {
        const exRows = await db.select({ id: sessionExercises.id }).from(sessionExercises).where(eq(sessionExercises.sessionId, s.id));
        for (const ex of exRows) {
          await db.delete(workoutSets).where(eq(workoutSets.sessionExerciseId, ex.id));
        }
        await db.delete(sessionExercises).where(eq(sessionExercises.sessionId, s.id));
      }
      await db.delete(workoutSessions).where(eq(workoutSessions.userId, userId));
      const userRoutines = await db.select({ id: routines.id }).from(routines).where(eq(routines.userId, userId));
      for (const r of userRoutines) {
        await db.delete(routineExercises).where(eq(routineExercises.routineId, r.id));
      }
      await db.delete(routines).where(eq(routines.userId, userId));
      const userChallenges = await db.select({ id: challenges.id }).from(challenges).where(eq(challenges.userId, userId));
      for (const c of userChallenges) {
        await db.delete(challengeChecks).where(eq(challengeChecks.challengeId, c.id));
        await db.delete(challengeDayNotes).where(eq(challengeDayNotes.challengeId, c.id));
        await db.delete(challengeTasks).where(eq(challengeTasks.challengeId, c.id));
      }
      await db.delete(challenges).where(eq(challenges.userId, userId));
      const ownRecipes = await db.select({ id: recipes.id }).from(recipes).where(eq(recipes.ownerUserId, userId));
      for (const r of ownRecipes) {
        await db.delete(recipeIngredients).where(eq(recipeIngredients.recipeId, r.id));
        await db.delete(favouriteRecipes).where(eq(favouriteRecipes.recipeId, r.id));
        await db.delete(mealPlanEntries).where(eq(mealPlanEntries.recipeId, r.id));
      }
      await db.delete(recipes).where(eq(recipes.ownerUserId, userId));
      await db.delete(favouriteRecipes).where(eq(favouriteRecipes.userId, userId));
      await db.delete(mealPlanEntries).where(eq(mealPlanEntries.userId, userId));
      await db.delete(waterEntries).where(eq(waterEntries.userId, userId));
      await db.delete(measurements).where(eq(measurements.userId, userId));
      await db.delete(diaryEntries).where(eq(diaryEntries.userId, userId));
      await db.delete(favouriteFoods).where(eq(favouriteFoods.userId, userId));
      await db.delete(foods).where(eq(foods.ownerUserId, userId));
      await db.delete(weightLogs).where(eq(weightLogs.userId, userId));
      await db.delete(profiles).where(eq(profiles.userId, userId));
      await db.delete(userGoals).where(eq(userGoals.userId, userId));
      await db.delete(userPreferences).where(eq(userPreferences.userId, userId));
      await db.delete(users).where(eq(users.id, userId));
      ctx.invalidateQueries();
      return { ok: true, error: null };
    }
  }),
  exportData: defineAction({
    description: "Returns all of the signed-in user's own FITIND data as a JSON-ready object for download.",
    request: object({ token: string2().min(1).max(200) }),
    response: object({
      ok: boolean2(),
      error: string2().nullable(),
      profile: profileShape.nullable(),
      targets: targetsShape.nullable(),
      weightLogs: array(object({ weightKg: number2(), loggedOn: string2() })),
      diaryEntries: array(object({
        loggedOn: string2(),
        meal: string2(),
        foodName: string2(),
        quantityGrams: number2(),
        servings: number2().nullable(),
        kcal: number2(),
        protein: number2(),
        carbs: number2(),
        fat: number2(),
        fibre: number2()
      })),
      customFoods: array(object({
        name: string2(),
        aliases: string2(),
        category: string2(),
        cuisine: string2(),
        dietFlag: string2(),
        kcalPer100: number2(),
        proteinPer100: number2(),
        carbsPer100: number2(),
        fatPer100: number2(),
        fibrePer100: number2(),
        servingName: string2(),
        servingGrams: number2(),
        notes: string2().nullable()
      })),
      favouriteFoods: array(object({ name: string2() })),
      favouriteRecipes: array(object({ name: string2() })),
      workoutSessions: array(object({
        title: string2(),
        startedOn: string2(),
        status: string2(),
        durationSeconds: number2().nullable(),
        notes: string2().nullable(),
        exercises: array(object({
          name: string2(),
          skipped: boolean2(),
          sets: array(object({
            reps: number2().nullable(),
            loadKg: number2().nullable(),
            durationSeconds: number2().nullable(),
            completed: boolean2()
          }))
        }))
      })),
      routines: array(object({
        name: string2(),
        notes: string2().nullable(),
        exercises: array(object({
          name: string2(),
          targetSets: number2(),
          targetReps: string2(),
          restSeconds: number2()
        }))
      })),
      measurements: array(object({
        loggedOn: string2(),
        waistCm: number2().nullable(),
        chestCm: number2().nullable(),
        armCm: number2().nullable(),
        thighCm: number2().nullable(),
        hipCm: number2().nullable(),
        neckCm: number2().nullable()
      })),
      waterEntries: array(object({ loggedOn: string2(), amountMl: number2() })),
      ownRecipes: array(object({
        name: string2(),
        description: string2(),
        category: string2(),
        dietFlag: string2(),
        servings: number2(),
        prepMinutes: number2(),
        cookMinutes: number2().nullable(),
        steps: string2(),
        ingredients: array(object({ name: string2(), quantityGrams: number2() }))
      })),
      mealPlan: array(object({
        weekday: number2(),
        meal: string2(),
        recipeName: string2(),
        servings: number2()
      })),
      challenges: array(object({
        name: string2(),
        totalDays: number2(),
        startedOn: string2(),
        status: string2(),
        tasks: array(string2()),
        checksDone: number2(),
        checks: array(object({ task: string2(), loggedOn: string2() })),
        dayNotes: array(object({ loggedOn: string2(), note: string2() }))
      })),
      exportedAt: string2().nullable()
    }),
    async handler(ctx, args) {
      const fail = {
        ok: false,
        error: "You are not signed in.",
        profile: null,
        targets: null,
        weightLogs: [],
        diaryEntries: [],
        customFoods: [],
        favouriteFoods: [],
        favouriteRecipes: [],
        workoutSessions: [],
        routines: [],
        measurements: [],
        waterEntries: [],
        ownRecipes: [],
        mealPlan: [],
        challenges: [],
        exportedAt: null
      };
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return fail;
      const profile = await loadProfile(db, resolved.userId);
      if (!profile)
        return fail;
      const logs = await db.select().from(weightLogs).where(eq(weightLogs.userId, resolved.userId)).orderBy(desc(weightLogs.loggedOn), desc(weightLogs.id));
      const diary = await db.select().from(diaryEntries).where(eq(diaryEntries.userId, resolved.userId)).orderBy(desc(diaryEntries.loggedOn), asc(diaryEntries.id));
      const workoutRows = await db.select().from(workoutSessions).where(eq(workoutSessions.userId, resolved.userId)).orderBy(desc(workoutSessions.startedAt));
      const workoutSessions2 = [];
      for (const s of workoutRows) {
        const p = await sessionPayload(db, s);
        workoutSessions2.push({
          title: s.title,
          startedOn: s.startedOn,
          status: s.status,
          durationSeconds: s.durationSeconds,
          notes: s.notes,
          exercises: p.exercises.map((e) => ({
            name: e.exerciseName,
            skipped: e.skipped,
            sets: e.sets.map((st) => ({
              reps: st.reps,
              loadKg: st.loadKg,
              durationSeconds: st.durationSeconds,
              completed: st.completed
            }))
          }))
        });
      }
      const routineRows = await db.select().from(routines).where(eq(routines.userId, resolved.userId)).orderBy(asc(routines.name));
      const routines2 = [];
      for (const r of routineRows) {
        const exRows = await db.select().from(routineExercises).where(eq(routineExercises.routineId, r.id)).orderBy(asc(routineExercises.position));
        const exList = [];
        for (const re of exRows) {
          const lib = await db.select({ name: exercises.name }).from(exercises).where(eq(exercises.id, re.exerciseId)).limit(1);
          exList.push({
            name: lib[0]?.name ?? "Exercise",
            targetSets: re.targetSets,
            targetReps: re.targetReps,
            restSeconds: re.restSeconds
          });
        }
        routines2.push({ name: r.name, notes: r.notes, exercises: exList });
      }
      const measurementRows = await db.select().from(measurements).where(eq(measurements.userId, resolved.userId)).orderBy(desc(measurements.loggedOn));
      const waterRows = await db.select().from(waterEntries).where(eq(waterEntries.userId, resolved.userId)).orderBy(desc(waterEntries.loggedOn), asc(waterEntries.id));
      const ownRecipeRows = await db.select().from(recipes).where(eq(recipes.ownerUserId, resolved.userId)).orderBy(asc(recipes.name));
      const ownRecipesExport = [];
      for (const r of ownRecipeRows) {
        const ingRows = await db.select().from(recipeIngredients).where(eq(recipeIngredients.recipeId, r.id)).orderBy(asc(recipeIngredients.position));
        ownRecipesExport.push({
          name: r.name,
          description: r.description,
          category: r.category,
          dietFlag: r.dietFlag,
          servings: r.servings,
          prepMinutes: r.prepMinutes,
          cookMinutes: r.cookMinutes,
          steps: r.steps,
          ingredients: ingRows.map((i) => ({
            name: i.name,
            quantityGrams: i.quantityGrams
          }))
        });
      }
      const customFoodRows = await db.select().from(foods).where(eq(foods.ownerUserId, resolved.userId)).orderBy(asc(foods.name));
      const favFoodRows = await db.select({ foodId: favouriteFoods.foodId }).from(favouriteFoods).where(eq(favouriteFoods.userId, resolved.userId));
      const favouriteFoodsExport = [];
      for (const f of favFoodRows) {
        const food = await db.select({ name: foods.name }).from(foods).where(eq(foods.id, f.foodId)).limit(1);
        if (food[0])
          favouriteFoodsExport.push({ name: food[0].name });
      }
      const favRecipeRows = await db.select({ recipeId: favouriteRecipes.recipeId }).from(favouriteRecipes).where(eq(favouriteRecipes.userId, resolved.userId));
      const favouriteRecipesExport = [];
      for (const f of favRecipeRows) {
        const rec = await db.select({ name: recipes.name }).from(recipes).where(eq(recipes.id, f.recipeId)).limit(1);
        if (rec[0])
          favouriteRecipesExport.push({ name: rec[0].name });
      }
      const planRows = await db.select().from(mealPlanEntries).where(eq(mealPlanEntries.userId, resolved.userId)).orderBy(asc(mealPlanEntries.weekday), asc(mealPlanEntries.id));
      const planExport = [];
      for (const p of planRows) {
        const rec = await db.select({ name: recipes.name }).from(recipes).where(eq(recipes.id, p.recipeId)).limit(1);
        planExport.push({
          weekday: p.weekday,
          meal: p.meal,
          recipeName: rec[0]?.name ?? "Recipe",
          servings: p.servings
        });
      }
      const challengeRows = await db.select().from(challenges).where(eq(challenges.userId, resolved.userId)).orderBy(desc(challenges.createdAt));
      const challengeExport = [];
      for (const c of challengeRows) {
        const taskRows = await db.select({ label: challengeTasks.label }).from(challengeTasks).where(eq(challengeTasks.challengeId, c.id)).orderBy(asc(challengeTasks.position));
        const checkRows = await db.select({
          taskId: challengeChecks.taskId,
          loggedOn: challengeChecks.loggedOn
        }).from(challengeChecks).where(eq(challengeChecks.challengeId, c.id)).orderBy(asc(challengeChecks.loggedOn));
        const taskLabelRows = await db.select({
          id: challengeTasks.id,
          label: challengeTasks.label
        }).from(challengeTasks).where(eq(challengeTasks.challengeId, c.id));
        const labelById = new Map(taskLabelRows.map((t) => [t.id, t.label]));
        const noteRows = await db.select().from(challengeDayNotes).where(eq(challengeDayNotes.challengeId, c.id)).orderBy(asc(challengeDayNotes.loggedOn));
        challengeExport.push({
          name: c.name,
          totalDays: c.totalDays,
          startedOn: c.startedOn,
          status: c.status,
          tasks: taskRows.map((t) => t.label),
          checksDone: checkRows.length,
          checks: checkRows.map((ch) => ({
            task: labelById.get(ch.taskId) ?? "Task",
            loggedOn: ch.loggedOn
          })),
          dayNotes: noteRows.map((n) => ({
            loggedOn: n.loggedOn,
            note: n.note
          }))
        });
      }
      return {
        ok: true,
        error: null,
        profile,
        targets: computeTargets(profile),
        weightLogs: logs.map((l) => ({
          weightKg: l.weightKg,
          loggedOn: l.loggedOn
        })),
        diaryEntries: diary.map((e) => {
          const p = entryPayload(e);
          return {
            loggedOn: e.loggedOn,
            meal: e.meal,
            foodName: e.foodName,
            quantityGrams: e.quantityGrams,
            servings: e.servings,
            kcal: p.kcal,
            protein: p.protein,
            carbs: p.carbs,
            fat: p.fat,
            fibre: p.fibre
          };
        }),
        workoutSessions: workoutSessions2,
        routines: routines2,
        measurements: measurementRows.map((m) => ({
          loggedOn: m.loggedOn,
          waistCm: m.waistCm,
          chestCm: m.chestCm,
          armCm: m.armCm,
          thighCm: m.thighCm,
          hipCm: m.hipCm,
          neckCm: m.neckCm
        })),
        waterEntries: waterRows.map((w) => ({
          loggedOn: w.loggedOn,
          amountMl: w.amountMl
        })),
        customFoods: customFoodRows.map((f) => ({
          name: f.name,
          aliases: f.aliases,
          category: f.category,
          cuisine: f.cuisine,
          dietFlag: f.dietFlag,
          kcalPer100: f.kcalPer100,
          proteinPer100: f.proteinPer100,
          carbsPer100: f.carbsPer100,
          fatPer100: f.fatPer100,
          fibrePer100: f.fibrePer100,
          servingName: f.servingName,
          servingGrams: f.servingGrams,
          notes: f.notes
        })),
        favouriteFoods: favouriteFoodsExport,
        favouriteRecipes: favouriteRecipesExport,
        ownRecipes: ownRecipesExport,
        mealPlan: planExport,
        challenges: challengeExport,
        exportedAt: new Date().toISOString()
      };
    }
  }),
  listSessions: defineAction({
    description: "Lists the signed-in user's active sessions (sign-in time, expiry, and the device string recorded at login) so they can review where they are signed in.",
    request: object({ token: string2().min(1).max(200) }),
    response: object({
      ok: boolean2(),
      error: string2().nullable(),
      sessions: array(object({
        id: number2(),
        createdAt: string2(),
        expiresAt: string2(),
        userAgent: string2().nullable(),
        current: boolean2()
      }))
    }),
    async handler(ctx, args) {
      const fail = { ok: false, error: "You are not signed in.", sessions: [] };
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return fail;
      const currentHash = await sha256Hex(args.token);
      const rows = await db.select().from(sessions).where(eq(sessions.userId, resolved.userId)).orderBy(desc(sessions.createdAt));
      const now = Date.now();
      return {
        ok: true,
        error: null,
        sessions: rows.filter((s) => s.expiresAt.getTime() > now).map((s) => ({
          id: s.id,
          createdAt: s.createdAt.toISOString(),
          expiresAt: s.expiresAt.toISOString(),
          userAgent: s.userAgent,
          current: s.tokenHash === currentHash
        }))
      };
    }
  }),
  logoutOtherSessions: defineAction({
    description: "Ends every session of the signed-in user except the current one.",
    request: object({ token: string2().min(1).max(200) }),
    response: okResponse,
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const currentHash = await sha256Hex(args.token);
      const rows = await db.select().from(sessions).where(eq(sessions.userId, resolved.userId));
      for (const s of rows) {
        if (s.tokenHash !== currentHash) {
          await db.delete(sessions).where(eq(sessions.id, s.id));
        }
      }
      ctx.invalidateQueries();
      return { ok: true, error: null };
    }
  }),
  claimAdmin: defineAction({
    description: "One-time first-admin bootstrap: succeeds ONLY while no admin exists in the whole app. Grants the signed-in user the admin role and audit-logs the claim. Once any admin exists this action always refuses.",
    request: object({ token: string2().min(1).max(200) }),
    response: okResponse,
    async handler(ctx, args) {
      const db = ctx.db();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      if (await adminCount(db) > 0)
        return {
          ok: false,
          error: "Admin is already set up for this site, so the first-admin claim is closed."
        };
      const userRows = await db.select({ email: users.email }).from(users).where(eq(users.id, resolved.userId)).limit(1);
      const email = userRows[0]?.email ?? "";
      await db.insert(adminRoles).values({
        userId: resolved.userId,
        grantMethod: "bootstrap",
        grantedAt: new Date
      });
      await logAdminAction(db, { userId: resolved.userId, email }, "admin.claim", "admin", resolved.userId, `First admin claimed via one-time bootstrap by ${email}`);
      ctx.invalidateQueries();
      return { ok: true, error: null };
    }
  }),
  adminOverview: defineAction({
    description: "Admin-only aggregate counts for the whole app (totals only — never any individual user's private data).",
    request: object({ token: string2().min(1).max(200) }),
    response: object({
      ok: boolean2(),
      error: string2().nullable(),
      users: number2(),
      admins: number2(),
      catalogueFoods: number2(),
      customFoods: number2(),
      exercises: number2(),
      seededRecipes: number2(),
      userRecipes: number2(),
      diaryEntries: number2(),
      workoutSessions: number2(),
      waterEntries: number2(),
      challenges: number2()
    }),
    async handler(ctx, args) {
      const fail = {
        ok: false,
        error: "Admin access required.",
        users: 0,
        admins: 0,
        catalogueFoods: 0,
        customFoods: 0,
        exercises: 0,
        seededRecipes: 0,
        userRecipes: 0,
        diaryEntries: 0,
        workoutSessions: 0,
        waterEntries: 0,
        challenges: 0
      };
      const db = ctx.db();
      const admin = await requireAdmin(db, args.token);
      if ("error" in admin)
        return { ...fail, error: admin.error };
      await ensureFoodCatalog(db);
      await ensureExerciseLibrary(db);
      await ensureRecipeLibrary(db);
      const allUsers = await db.select({ id: users.id }).from(users);
      const allFoods = await db.select({ ownerUserId: foods.ownerUserId }).from(foods);
      const allExercises = await db.select({ id: exercises.id }).from(exercises);
      const allRecipes = await db.select({ ownerUserId: recipes.ownerUserId }).from(recipes);
      const allDiary = await db.select({ id: diaryEntries.id }).from(diaryEntries);
      const allWorkouts = await db.select({ id: workoutSessions.id }).from(workoutSessions);
      const allWater = await db.select({ id: waterEntries.id }).from(waterEntries);
      const allChallenges = await db.select({ id: challenges.id }).from(challenges);
      return {
        ok: true,
        error: null,
        users: allUsers.length,
        admins: await adminCount(db),
        catalogueFoods: allFoods.filter((f) => f.ownerUserId == null).length,
        customFoods: allFoods.filter((f) => f.ownerUserId != null).length,
        exercises: allExercises.length,
        seededRecipes: allRecipes.filter((r) => r.ownerUserId == null).length,
        userRecipes: allRecipes.filter((r) => r.ownerUserId != null).length,
        diaryEntries: allDiary.length,
        workoutSessions: allWorkouts.length,
        waterEntries: allWater.length,
        challenges: allChallenges.length
      };
    }
  }),
  adminListFoods: defineAction({
    description: "Admin-only paged food list for content management. Scope 'catalogue' = shared foods, 'custom' = user-created foods shown for quality review WITHOUT any owner identity, 'all' = both.",
    request: object({
      token: string2().min(1).max(200),
      query: string2().trim().max(80).default(""),
      scope: _enum(["catalogue", "custom", "all"]).default("catalogue"),
      offset: number2().int().min(0).max(1e5).default(0),
      limit: number2().int().min(1).max(300).default(60)
    }),
    response: object({
      ok: boolean2(),
      error: string2().nullable(),
      foods: array(foodShape),
      total: number2()
    }),
    async handler(ctx, args) {
      const fail = { ok: false, error: "Admin access required.", foods: [], total: 0 };
      const db = ctx.db();
      const admin = await requireAdmin(db, args.token);
      if ("error" in admin)
        return { ...fail, error: admin.error };
      await ensureFoodCatalog(db);
      const all = await db.select().from(foods).orderBy(asc(foods.name));
      const q = args.query.toLowerCase();
      const filtered = all.filter((f) => {
        if (args.scope === "catalogue" && f.ownerUserId != null)
          return false;
        if (args.scope === "custom" && f.ownerUserId == null)
          return false;
        if (q && !`${f.name} ${f.aliases}`.toLowerCase().includes(q))
          return false;
        return true;
      });
      const emptyFavs = new Set;
      return {
        ok: true,
        error: null,
        foods: filtered.slice(args.offset, args.offset + args.limit).map((f) => foodPayload(f, emptyFavs)),
        total: filtered.length
      };
    }
  }),
  adminSaveFood: defineAction({
    description: "Admin-only create or edit of a SHARED catalogue food, including its source and verification fields. User-created custom foods cannot be edited here. Every change is audit-logged.",
    request: object({
      token: string2().min(1).max(200),
      id: number2().int().positive().optional(),
      name: string2().trim().min(2).max(80),
      aliases: string2().trim().max(200).default(""),
      category: string2().trim().min(1).max(40),
      cuisine: string2().trim().min(1).max(40),
      dietFlag: _enum(["veg", "vegan", "eggetarian", "non_veg"]),
      kcalPer100: number2().min(0).max(950),
      proteinPer100: number2().min(0).max(100),
      carbsPer100: number2().min(0).max(100),
      fatPer100: number2().min(0).max(100),
      fibrePer100: number2().min(0).max(100),
      servingName: string2().trim().min(1).max(40),
      servingGrams: number2().min(1).max(2000),
      source: string2().trim().min(1).max(200),
      verification: _enum(["estimate", "verified"]),
      notes: string2().trim().max(300).nullable().optional()
    }),
    response: object({
      ok: boolean2(),
      error: string2().nullable(),
      foodId: number2().nullable()
    }),
    async handler(ctx, args) {
      const fail = { ok: false, error: "Admin access required.", foodId: null };
      const db = ctx.db();
      const admin = await requireAdmin(db, args.token);
      if ("error" in admin)
        return { ...fail, error: admin.error };
      await ensureFoodCatalog(db);
      const values = {
        name: args.name,
        aliases: args.aliases,
        category: args.category,
        cuisine: args.cuisine,
        dietFlag: args.dietFlag,
        kcalPer100: args.kcalPer100,
        proteinPer100: args.proteinPer100,
        carbsPer100: args.carbsPer100,
        fatPer100: args.fatPer100,
        fibrePer100: args.fibrePer100,
        servingName: args.servingName,
        servingGrams: args.servingGrams,
        source: args.source,
        verification: args.verification,
        notes: args.notes ?? null
      };
      const dupes = await db.select({ id: foods.id }).from(foods).where(and(isNull(foods.ownerUserId), eq(foods.name, args.name)));
      if (args.id != null) {
        const rows = await db.select().from(foods).where(eq(foods.id, args.id)).limit(1);
        const food = rows[0];
        if (!food)
          return { ...fail, error: "Food not found." };
        if (food.ownerUserId != null)
          return {
            ...fail,
            error: "That is a user's custom food. Custom foods can be reviewed or removed, not edited."
          };
        if (dupes.some((d) => d.id !== args.id))
          return { ...fail, error: "Another catalogue food already uses this name." };
        await db.update(foods).set(values).where(eq(foods.id, args.id));
        await logAdminAction(db, admin, "food.update", "food", args.id, `Updated catalogue food "${args.name}" — ${args.kcalPer100} kcal, P ${args.proteinPer100} g per 100 g (${args.verification})`);
        ctx.invalidateQueries();
        return { ok: true, error: null, foodId: args.id };
      }
      if (dupes.length > 0)
        return { ...fail, error: "A catalogue food already uses this name." };
      const inserted = await db.insert(foods).values({ ...values, ownerUserId: null }).returning({ id: foods.id });
      const newId = inserted[0]?.id ?? null;
      await logAdminAction(db, admin, "food.create", "food", newId, `Created catalogue food "${args.name}" — ${args.kcalPer100} kcal per 100 g (${args.verification})`);
      ctx.invalidateQueries();
      return { ok: true, error: null, foodId: newId };
    }
  }),
  adminDeleteFood: defineAction({
    description: "Admin-only delete of a food. A catalogue food used by any recipe cannot be deleted (recipes calculate from it); user-created custom foods can be removed for quality. Diary history is snapshot-based and is never rewritten. Audit-logged.",
    request: object({
      token: string2().min(1).max(200),
      foodId: number2().int().positive()
    }),
    response: okResponse,
    async handler(ctx, args) {
      const db = ctx.db();
      const admin = await requireAdmin(db, args.token);
      if ("error" in admin)
        return { ok: false, error: admin.error };
      const rows = await db.select().from(foods).where(eq(foods.id, args.foodId)).limit(1);
      const food = rows[0];
      if (!food)
        return { ok: false, error: "Food not found." };
      if (food.ownerUserId == null) {
        const usedBy = await db.select({ id: recipeIngredients.id }).from(recipeIngredients).where(eq(recipeIngredients.foodId, args.foodId));
        if (usedBy.length > 0)
          return {
            ok: false,
            error: `This food is an ingredient in ${usedBy.length} recipe(s). Remove it from those recipes first.`
          };
      }
      await db.delete(favouriteFoods).where(eq(favouriteFoods.foodId, args.foodId));
      await db.delete(foods).where(eq(foods.id, args.foodId));
      await logAdminAction(db, admin, "food.delete", food.ownerUserId == null ? "food" : "custom_food", args.foodId, `Deleted ${food.ownerUserId == null ? "catalogue" : "user-created"} food "${food.name}"`);
      ctx.invalidateQueries();
      return { ok: true, error: null };
    }
  }),
  adminListExercises: defineAction({
    description: "Admin-only paged exercise library list for content management.",
    request: object({
      token: string2().min(1).max(200),
      query: string2().trim().max(80).default(""),
      offset: number2().int().min(0).max(1e5).default(0),
      limit: number2().int().min(1).max(200).default(60)
    }),
    response: object({
      ok: boolean2(),
      error: string2().nullable(),
      exercises: array(exerciseShape),
      total: number2()
    }),
    async handler(ctx, args) {
      const fail = { ok: false, error: "Admin access required.", exercises: [], total: 0 };
      const db = ctx.db();
      const admin = await requireAdmin(db, args.token);
      if ("error" in admin)
        return { ...fail, error: admin.error };
      await ensureExerciseLibrary(db);
      const all = await db.select().from(exercises).orderBy(asc(exercises.name));
      const q = args.query.toLowerCase();
      const filtered = q ? all.filter((e) => `${e.name} ${e.primaryMuscle} ${e.secondaryMuscles}`.toLowerCase().includes(q)) : all;
      return {
        ok: true,
        error: null,
        exercises: filtered.slice(args.offset, args.offset + args.limit).map(exercisePayload),
        total: filtered.length
      };
    }
  }),
  adminSaveExercise: defineAction({
    description: "Admin-only create or edit of a library exercise. Every change is audit-logged.",
    request: object({
      token: string2().min(1).max(200),
      id: number2().int().positive().optional(),
      name: string2().trim().min(2).max(80),
      primaryMuscle: string2().trim().min(1).max(40),
      secondaryMuscles: string2().trim().max(120).default(""),
      equipment: string2().trim().min(1).max(40),
      difficulty: _enum(["beginner", "intermediate", "advanced"]),
      pattern: string2().trim().min(1).max(60),
      kind: _enum(["weighted", "bodyweight", "timed"]),
      instructions: string2().trim().min(1).max(1200),
      mistakes: string2().trim().min(1).max(1200),
      suggestedSets: number2().int().min(1).max(10),
      suggestedReps: string2().trim().min(1).max(40),
      restSeconds: number2().int().min(0).max(600)
    }),
    response: object({
      ok: boolean2(),
      error: string2().nullable(),
      exerciseId: number2().nullable()
    }),
    async handler(ctx, args) {
      const fail = { ok: false, error: "Admin access required.", exerciseId: null };
      const db = ctx.db();
      const admin = await requireAdmin(db, args.token);
      if ("error" in admin)
        return { ...fail, error: admin.error };
      await ensureExerciseLibrary(db);
      const values = {
        name: args.name,
        primaryMuscle: args.primaryMuscle,
        secondaryMuscles: args.secondaryMuscles,
        equipment: args.equipment,
        difficulty: args.difficulty,
        pattern: args.pattern,
        kind: args.kind,
        instructions: args.instructions,
        mistakes: args.mistakes,
        suggestedSets: args.suggestedSets,
        suggestedReps: args.suggestedReps,
        restSeconds: args.restSeconds
      };
      const dupes = await db.select({ id: exercises.id }).from(exercises).where(eq(exercises.name, args.name));
      if (args.id != null) {
        const rows = await db.select({ id: exercises.id }).from(exercises).where(eq(exercises.id, args.id)).limit(1);
        if (!rows[0])
          return { ...fail, error: "Exercise not found." };
        if (dupes.some((d) => d.id !== args.id))
          return { ...fail, error: "Another exercise already uses this name." };
        await db.update(exercises).set(values).where(eq(exercises.id, args.id));
        await logAdminAction(db, admin, "exercise.update", "exercise", args.id, `Updated exercise "${args.name}"`);
        ctx.invalidateQueries();
        return { ok: true, error: null, exerciseId: args.id };
      }
      if (dupes.length > 0)
        return { ...fail, error: "An exercise already uses this name." };
      const inserted = await db.insert(exercises).values(values).returning({ id: exercises.id });
      const newId = inserted[0]?.id ?? null;
      await logAdminAction(db, admin, "exercise.create", "exercise", newId, `Created exercise "${args.name}"`);
      ctx.invalidateQueries();
      return { ok: true, error: null, exerciseId: newId };
    }
  }),
  adminDeleteExercise: defineAction({
    description: "Admin-only delete of a library exercise. Refused while any routine or workout session still references it. Audit-logged.",
    request: object({
      token: string2().min(1).max(200),
      exerciseId: number2().int().positive()
    }),
    response: okResponse,
    async handler(ctx, args) {
      const db = ctx.db();
      const admin = await requireAdmin(db, args.token);
      if ("error" in admin)
        return { ok: false, error: admin.error };
      const rows = await db.select().from(exercises).where(eq(exercises.id, args.exerciseId)).limit(1);
      const ex = rows[0];
      if (!ex)
        return { ok: false, error: "Exercise not found." };
      const inRoutines = await db.select({ id: routineExercises.id }).from(routineExercises).where(eq(routineExercises.exerciseId, args.exerciseId));
      const inSessions = await db.select({ id: sessionExercises.id }).from(sessionExercises).where(eq(sessionExercises.exerciseId, args.exerciseId));
      if (inRoutines.length > 0 || inSessions.length > 0)
        return {
          ok: false,
          error: "This exercise is used in routines or workout history, so it cannot be deleted."
        };
      await db.delete(exercises).where(eq(exercises.id, args.exerciseId));
      await logAdminAction(db, admin, "exercise.delete", "exercise", args.exerciseId, `Deleted exercise "${ex.name}"`);
      ctx.invalidateQueries();
      return { ok: true, error: null };
    }
  }),
  adminListRecipes: defineAction({
    description: "Admin-only list of the SHARED (seeded) recipes for content management. User-owned recipes are never listed here.",
    request: object({
      token: string2().min(1).max(200),
      query: string2().trim().max(80).default("")
    }),
    response: object({
      ok: boolean2(),
      error: string2().nullable(),
      recipes: array(object({
        id: number2(),
        name: string2(),
        category: recipeCategoryEnum,
        dietFlag: _enum(["veg", "vegan", "eggetarian", "non_veg"]),
        servings: number2(),
        prepMinutes: number2(),
        cookMinutes: number2().nullable(),
        budget: boolean2(),
        ingredientCount: number2()
      }))
    }),
    async handler(ctx, args) {
      const fail = { ok: false, error: "Admin access required.", recipes: [] };
      const db = ctx.db();
      const admin = await requireAdmin(db, args.token);
      if ("error" in admin)
        return { ...fail, error: admin.error };
      await ensureRecipeLibrary(db);
      const all = await db.select().from(recipes).where(isNull(recipes.ownerUserId)).orderBy(asc(recipes.name));
      const q = args.query.toLowerCase();
      const out = [];
      for (const r of all) {
        if (q && !r.name.toLowerCase().includes(q))
          continue;
        const ings = await db.select({ id: recipeIngredients.id }).from(recipeIngredients).where(eq(recipeIngredients.recipeId, r.id));
        out.push({
          id: r.id,
          name: r.name,
          category: r.category,
          dietFlag: r.dietFlag,
          servings: r.servings,
          prepMinutes: r.prepMinutes,
          cookMinutes: r.cookMinutes,
          budget: r.budget === 1,
          ingredientCount: ings.length
        });
      }
      return { ok: true, error: null, recipes: out };
    }
  }),
  adminGetRecipe: defineAction({
    description: "Admin-only full detail of one shared recipe for editing: metadata, raw steps text and its ingredient rows.",
    request: object({
      token: string2().min(1).max(200),
      recipeId: number2().int().positive()
    }),
    response: object({
      ok: boolean2(),
      error: string2().nullable(),
      recipe: object({
        id: number2(),
        name: string2(),
        description: string2(),
        category: recipeCategoryEnum,
        dietFlag: _enum(["veg", "vegan", "eggetarian", "non_veg"]),
        servings: number2(),
        prepMinutes: number2(),
        cookMinutes: number2().nullable(),
        steps: string2(),
        budget: boolean2(),
        ingredients: array(object({
          id: number2(),
          foodId: number2().nullable(),
          name: string2(),
          quantityGrams: number2()
        }))
      }).nullable()
    }),
    async handler(ctx, args) {
      const fail = { ok: false, error: "Admin access required.", recipe: null };
      const db = ctx.db();
      const admin = await requireAdmin(db, args.token);
      if ("error" in admin)
        return { ...fail, error: admin.error };
      const rows = await db.select().from(recipes).where(eq(recipes.id, args.recipeId)).limit(1);
      const r = rows[0];
      if (!r || r.ownerUserId != null)
        return { ...fail, error: "Shared recipe not found." };
      const ings = await db.select().from(recipeIngredients).where(eq(recipeIngredients.recipeId, r.id)).orderBy(asc(recipeIngredients.position));
      return {
        ok: true,
        error: null,
        recipe: {
          id: r.id,
          name: r.name,
          description: r.description,
          category: r.category,
          dietFlag: r.dietFlag,
          servings: r.servings,
          prepMinutes: r.prepMinutes,
          cookMinutes: r.cookMinutes,
          steps: r.steps,
          budget: r.budget === 1,
          ingredients: ings.map((i) => ({
            id: i.id,
            foodId: i.foodId,
            name: i.name,
            quantityGrams: i.quantityGrams
          }))
        }
      };
    }
  }),
  adminSaveRecipe: defineAction({
    description: "Admin-only create or edit of a SHARED recipe. Ingredients must be shared catalogue foods (recipe nutrition is calculated from them). Every change is audit-logged.",
    request: object({
      token: string2().min(1).max(200),
      id: number2().int().positive().optional(),
      name: string2().trim().min(2).max(80),
      description: string2().trim().max(500).default(""),
      category: recipeCategoryEnum,
      dietFlag: _enum(["veg", "vegan", "eggetarian", "non_veg"]),
      servings: number2().min(0.5).max(100),
      prepMinutes: number2().int().min(0).max(600),
      cookMinutes: number2().int().min(0).max(600).nullable().optional(),
      steps: string2().trim().max(4000).default(""),
      budget: boolean2().default(false),
      ingredients: array(object({
        foodId: number2().int().positive(),
        quantityGrams: number2().min(1).max(5000)
      })).min(1).max(40)
    }),
    response: object({
      ok: boolean2(),
      error: string2().nullable(),
      recipeId: number2().nullable()
    }),
    async handler(ctx, args) {
      const fail = { ok: false, error: "Admin access required.", recipeId: null };
      const db = ctx.db();
      const admin = await requireAdmin(db, args.token);
      if ("error" in admin)
        return { ...fail, error: admin.error };
      await ensureRecipeLibrary(db);
      const resolvedIngredients = [];
      for (const ing of args.ingredients) {
        const fRows = await db.select().from(foods).where(eq(foods.id, ing.foodId)).limit(1);
        const f = fRows[0];
        if (!f || f.ownerUserId != null)
          return {
            ...fail,
            error: "Every ingredient must be a shared catalogue food."
          };
        resolvedIngredients.push({
          foodId: f.id,
          name: f.name,
          quantityGrams: ing.quantityGrams
        });
      }
      const values = {
        name: args.name,
        description: args.description,
        category: args.category,
        dietFlag: args.dietFlag,
        servings: args.servings,
        prepMinutes: args.prepMinutes,
        cookMinutes: args.cookMinutes ?? null,
        steps: args.steps,
        budget: args.budget ? 1 : 0
      };
      let recipeId = args.id ?? null;
      if (args.id != null) {
        const rows = await db.select().from(recipes).where(eq(recipes.id, args.id)).limit(1);
        const r = rows[0];
        if (!r || r.ownerUserId != null)
          return { ...fail, error: "Shared recipe not found." };
        await db.update(recipes).set(values).where(eq(recipes.id, args.id));
        await db.delete(recipeIngredients).where(eq(recipeIngredients.recipeId, args.id));
      } else {
        const inserted = await db.insert(recipes).values({ ...values, ownerUserId: null }).returning({ id: recipes.id });
        recipeId = inserted[0]?.id ?? null;
        if (recipeId == null)
          return { ...fail, error: "Could not create the recipe." };
      }
      await db.insert(recipeIngredients).values(resolvedIngredients.map((ing, i) => ({
        recipeId,
        foodId: ing.foodId,
        name: ing.name,
        quantityGrams: ing.quantityGrams,
        position: i
      })));
      await logAdminAction(db, admin, args.id != null ? "recipe.update" : "recipe.create", "recipe", recipeId, `${args.id != null ? "Updated" : "Created"} shared recipe "${args.name}" with ${resolvedIngredients.length} ingredients`);
      ctx.invalidateQueries();
      return { ok: true, error: null, recipeId };
    }
  }),
  adminDeleteRecipe: defineAction({
    description: "Admin-only delete of a SHARED recipe (also removes it from favourites and meal plans). User-owned recipes are never touched. Audit-logged.",
    request: object({
      token: string2().min(1).max(200),
      recipeId: number2().int().positive()
    }),
    response: okResponse,
    async handler(ctx, args) {
      const db = ctx.db();
      const admin = await requireAdmin(db, args.token);
      if ("error" in admin)
        return { ok: false, error: admin.error };
      const rows = await db.select().from(recipes).where(eq(recipes.id, args.recipeId)).limit(1);
      const r = rows[0];
      if (!r || r.ownerUserId != null)
        return { ok: false, error: "Shared recipe not found." };
      await db.delete(recipeIngredients).where(eq(recipeIngredients.recipeId, args.recipeId));
      await db.delete(favouriteRecipes).where(eq(favouriteRecipes.recipeId, args.recipeId));
      await db.delete(mealPlanEntries).where(eq(mealPlanEntries.recipeId, args.recipeId));
      await db.delete(recipes).where(eq(recipes.id, args.recipeId));
      await logAdminAction(db, admin, "recipe.delete", "recipe", args.recipeId, `Deleted shared recipe "${r.name}"`);
      ctx.invalidateQueries();
      return { ok: true, error: null };
    }
  }),
  adminListAudit: defineAction({
    description: "Admin-only audit log of administrative changes (who, when, what), newest first.",
    request: object({
      token: string2().min(1).max(200),
      limit: number2().int().min(1).max(100).default(50)
    }),
    response: object({
      ok: boolean2(),
      error: string2().nullable(),
      entries: array(object({
        id: number2(),
        adminEmail: string2(),
        action: string2(),
        entityType: string2(),
        entityId: number2().nullable(),
        summary: string2(),
        createdAt: string2()
      }))
    }),
    async handler(ctx, args) {
      const fail = { ok: false, error: "Admin access required.", entries: [] };
      const db = ctx.db();
      const admin = await requireAdmin(db, args.token);
      if ("error" in admin)
        return { ...fail, error: admin.error };
      const rows = await db.select().from(adminAuditLog).orderBy(desc(adminAuditLog.id)).limit(args.limit);
      return {
        ok: true,
        error: null,
        entries: rows.map((r) => ({
          id: r.id,
          adminEmail: r.adminEmail,
          action: r.action,
          entityType: r.entityType,
          entityId: r.entityId,
          summary: r.summary,
          createdAt: r.createdAt.toISOString()
        }))
      };
    }
  })
};

// server/app.ts
var ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
var MIGRATIONS_DIR = join(ROOT, "drizzle");
async function initDb() {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  let dbUrl;
  let dbLabel;
  if (tursoUrl) {
    dbUrl = tursoUrl;
    dbLabel = "Turso (remote libSQL)";
  } else {
    const dbPath = resolve(process.env.DATABASE_PATH ?? "./data/app.db");
    mkdirSync(dirname(dbPath), { recursive: true });
    dbUrl = `file:${dbPath}`;
    dbLabel = `local file ${dbPath}`;
  }
  const client = createClient({
    url: dbUrl,
    authToken: tursoUrl ? process.env.TURSO_AUTH_TOKEN : undefined
  });
  if (dbUrl.startsWith("file:")) {
    try {
      await client.execute("PRAGMA journal_mode = WAL;");
    } catch {}
  }
  await client.execute("CREATE TABLE IF NOT EXISTS __standalone_migrations " + "(name TEXT PRIMARY KEY, applied_at INTEGER NOT NULL)");
  const appliedResult = await client.execute("SELECT name FROM __standalone_migrations");
  const applied = new Set(appliedResult.rows.map((r) => String(r.name)));
  const migrationFiles = readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith(".sql")).sort();
  for (const file of migrationFiles) {
    if (applied.has(file))
      continue;
    const sqlText = readFileSync(join(MIGRATIONS_DIR, file), "utf8");
    await client.executeMultiple(sqlText);
    await client.execute({
      sql: "INSERT INTO __standalone_migrations (name, applied_at) VALUES (?, ?)",
      args: [file, Date.now()]
    });
    console.log(`[fitind] applied migration ${file}`);
  }
  console.log(`[fitind] database ready: ${dbLabel}`);
  return drizzle(client, { schema: exports_schema });
}
var dbPromise = null;
function getDb() {
  dbPromise ??= initDb();
  return dbPromise;
}
var actionTable = Actions;
function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" }
  });
}
async function handleAction(req) {
  let payload;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "invalid JSON body" }, 400);
  }
  const actionName = typeof payload?.action === "string" ? payload.action : "";
  const def = actionTable[actionName];
  if (!def || typeof def.handler !== "function") {
    return json({ error: `unknown action: ${actionName || "(missing)"}` });
  }
  let args = payload?.args ?? {};
  if (def.request) {
    const parsed = def.request.safeParse(args);
    if (!parsed.success) {
      const detail = parsed.error.issues.map((i) => `${i.path.map(String).join(".") || "(root)"}: ${i.message}`).join("; ");
      return json({
        error: `invalid request for action ${actionName}: ${detail}`
      });
    }
    args = parsed.data;
  }
  const db = await getDb();
  const state = { invalidated: false };
  const ctx = {
    db: () => db,
    invalidateQueries: () => {
      state.invalidated = true;
    }
  };
  try {
    const data = await def.handler(ctx, args);
    return json({ data, invalidateAll: state.invalidated });
  } catch (err) {
    return json({
      error: err instanceof Error ? err.message : String(err)
    });
  }
}
async function handleRequest(req, serveStatic) {
  const url = new URL(req.url, "http://localhost");
  if (req.method === "POST" && url.pathname === "/actions") {
    return handleAction(req);
  }
  if ((req.method === "GET" || req.method === "HEAD") && serveStatic) {
    const res = await serveStatic(url);
    if (res)
      return res;
  }
  return new Response("not found", { status: 404 });
}

// server/vercel-entry.ts
async function POST(req) {
  return handleRequest(req);
}
async function GET() {
  return new Response("method not allowed", { status: 405 });
}
export {
  GET,
  POST
};
