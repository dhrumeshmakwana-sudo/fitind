// FITIND server actions — Phase 1.
//
// Authentication is implemented in-app: passwords are hashed with
// PBKDF2-SHA256 (WebCrypto, per-user random salt) and sessions are random
// tokens stored only as SHA-256 hashes with a 30-day expiry. Every
// protected action resolves the session token to a user_id on the server
// and filters all reads/writes by that user_id — a client can never
// address another user's rows.
//
// Calorie targets use the documented Mifflin–St Jeor equation with
// standard activity multipliers and a goal adjustment. They are
// estimates, labelled as such in the UI, and a manual override saved by
// the user always wins.

import { defineAction, z, type ActionsModule, type Ctx } from "@hatch/space-sdk";
import { and, asc, desc, eq, inArray, isNull, or } from "drizzle-orm";
import * as schema from "./schema";
import { FOOD_SOURCE, SEED_FOODS } from "./foods-seed";
import {
SEED_EXERCISES,
WORKOUT_TEMPLATES,
} from "./exercises-seed";
import { SEED_RECIPES } from "./recipes-seed";

// ---------------------------------------------------------------- helpers

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const PBKDF2_ITERATIONS = 120_000;

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function bytesToB64(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}

function b64ToBuffer(b64: string): ArrayBuffer {
  const s = atob(b64);
  const buf = new ArrayBuffer(s.length);
  const out = new Uint8Array(buf);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return buf;
}

async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text),
  );
  return bytesToHex(new Uint8Array(digest));
}

async function hashPassword(
  password: string,
  saltB64: string,
): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: b64ToBuffer(saltB64),
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    key,
    256,
  );
  return bytesToB64(new Uint8Array(bits));
}

function newSalt(): string {
  return bytesToB64(crypto.getRandomValues(new Uint8Array(16)));
}

function newToken(): string {
  return bytesToHex(crypto.getRandomValues(new Uint8Array(32)));
}

function getDb(ctx: Ctx) {
  return ctx.db<typeof schema>();
}

type Db = ReturnType<typeof getDb>;

async function createSession(
  db: Db,
  userId: number,
  userAgent?: string,
): Promise<string> {
  const token = newToken();
  const tokenHash = await sha256Hex(token);
  const now = new Date();
  await db.insert(schema.sessions).values({
    userId,
    tokenHash,
    userAgent: userAgent?.trim() ? userAgent.trim().slice(0, 300) : null,
    createdAt: now,
    expiresAt: new Date(now.getTime() + SESSION_TTL_MS),
  });
  return token;
}

async function resolveUserId(
  db: Db,
  token: string,
): Promise<{ userId: number } | { error: "invalid" | "expired" }> {
  const tokenHash = await sha256Hex(token);
  const rows = await db
    .select()
    .from(schema.sessions)
    .where(eq(schema.sessions.tokenHash, tokenHash))
    .limit(1);
  const session = rows[0];
  if (!session) return { error: "invalid" };
  if (session.expiresAt.getTime() <= Date.now()) {
    await db
      .delete(schema.sessions)
      .where(eq(schema.sessions.id, session.id));
    return { error: "expired" };
  }
  return { userId: session.userId };
}

// ------------------------------------------------------- Phase 5: admin
// Admin status is read from `admin_roles` on the server for EVERY
// admin action. It is never taken from a client payload and can never
// be set through profile/settings fields.

async function isAdmin(db: Db, userId: number): Promise<boolean> {
  const rows = await db
    .select({ userId: schema.adminRoles.userId })
    .from(schema.adminRoles)
    .where(eq(schema.adminRoles.userId, userId))
    .limit(1);
  return rows.length > 0;
}

async function adminCount(db: Db): Promise<number> {
  const rows = await db
    .select({ userId: schema.adminRoles.userId })
    .from(schema.adminRoles);
  return rows.length;
}

async function requireAdmin(
  db: Db,
  token: string,
): Promise<{ userId: number; email: string } | { error: string }> {
  const resolved = await resolveUserId(db, token);
  if ("error" in resolved) return { error: "You are not signed in." };
  if (!(await isAdmin(db, resolved.userId)))
    return { error: "Admin access required." };
  const rows = await db
    .select({ email: schema.users.email })
    .from(schema.users)
    .where(eq(schema.users.id, resolved.userId))
    .limit(1);
  return { userId: resolved.userId, email: rows[0]?.email ?? "" };
}

async function logAdminAction(
  db: Db,
  admin: { userId: number; email: string },
  action: string,
  entityType: string,
  entityId: number | null,
  summary: string,
): Promise<void> {
  await db.insert(schema.adminAuditLog).values({
    adminUserId: admin.userId,
    adminEmail: admin.email,
    action,
    entityType,
    entityId,
    summary: summary.slice(0, 300),
    createdAt: new Date(),
  });
}

// ------------------------------------------------------------- profile IO

const profileShape = z.object({
  email: z.string(),
  memberSince: z.string(),
  displayName: z.string(),
  dateOfBirth: z.string().nullable(),
  heightCm: z.number().nullable(),
  weightKg: z.number().nullable(),
  sex: z.enum(["male", "female", "other"]).nullable(),
  activityLevel: z
    .enum(["sedentary", "light", "moderate", "active", "very_active"])
    .nullable(),
  experience: z.enum(["beginner", "intermediate", "advanced"]).nullable(),
  onboardingCompleted: z.boolean(),
  mainGoal: z
    .enum(["muscle_gain", "fat_loss", "maintenance", "general_fitness", "strength"])
    .nullable(),
  targetWeightKg: z.number().nullable(),
  calorieTargetOverride: z.number().nullable(),
  dietPreference: z
    .enum(["vegetarian", "vegan", "eggetarian", "non_vegetarian", "custom"])
    .nullable(),
  dietCustomNote: z.string().nullable(),
  allergies: z.string().nullable(),
  trainingDaysPerWeek: z.number().nullable(),
  equipment: z
    .enum(["full_gym", "home_equipment", "bodyweight", "custom"])
    .nullable(),
  equipmentCustomNote: z.string().nullable(),
  units: z.enum(["metric", "imperial"]),
  notifyMeals: z.boolean(),
  notifyWater: z.boolean(),
  notifyWorkouts: z.boolean(),
  profilePrivate: z.boolean(),
});

type ProfilePayload = z.infer<typeof profileShape>;

async function loadProfile(
  db: Db,
  userId: number,
): Promise<ProfilePayload | null> {
  const userRows = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);
  const user = userRows[0];
  if (!user) return null;
  const [profileRows, goalRows, prefRows] = await Promise.all([
    db.select().from(schema.profiles).where(eq(schema.profiles.userId, userId)).limit(1),
    db.select().from(schema.userGoals).where(eq(schema.userGoals.userId, userId)).limit(1),
    db
      .select()
      .from(schema.userPreferences)
      .where(eq(schema.userPreferences.userId, userId))
      .limit(1),
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
    profilePrivate: (pref?.profilePrivate ?? 1) === 1,
  };
}

// ------------------------------------------------------- nutrition engine

const targetsShape = z.object({
  status: z.enum(["ok", "manual", "missing_inputs"]),
  bmr: z.number().nullable(),
  tdee: z.number().nullable(),
  calorieTarget: z.number().nullable(),
  proteinG: z.number().nullable(),
  carbsG: z.number().nullable(),
  fatG: z.number().nullable(),
  fibreG: z.number().nullable(),
  missing: z.array(z.string()),
  note: z.string(),
});

type TargetsPayload = z.infer<typeof targetsShape>;

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

function ageFromDob(dob: string, now: Date): number | null {
  const birth = new Date(`${dob}T00:00:00Z`);
  if (Number.isNaN(birth.getTime())) return null;
  let age = now.getUTCFullYear() - birth.getUTCFullYear();
  const m = now.getUTCMonth() - birth.getUTCMonth();
  if (m < 0 || (m === 0 && now.getUTCDate() < birth.getUTCDate())) age -= 1;
  return age >= 5 && age <= 110 ? age : null;
}

function computeTargets(profile: ProfilePayload): TargetsPayload {
  const missing: string[] = [];
  const age = profile.dateOfBirth
    ? ageFromDob(profile.dateOfBirth, new Date())
    : null;
  if (age == null) missing.push("date of birth");
  if (profile.heightCm == null) missing.push("height");
  if (profile.weightKg == null) missing.push("current weight");
  if (profile.sex == null) missing.push("sex (used by the BMR formula)");
  if (profile.activityLevel == null) missing.push("activity level");

  const proteinPerKg =
    profile.mainGoal === "fat_loss"
      ? 2.0
      : profile.mainGoal === "muscle_gain" || profile.mainGoal === "strength"
        ? 1.8
        : 1.6;

  if (profile.calorieTargetOverride != null && profile.weightKg != null) {
    const kcal = profile.calorieTargetOverride;
    const proteinG = Math.round(profile.weightKg * proteinPerKg);
    const fatG = Math.round((kcal * 0.25) / 9);
    const carbsG = Math.max(
      0,
      Math.round((kcal - proteinG * 4 - fatG * 9) / 4),
    );
    return {
      status: "manual",
      bmr: null,
      tdee: null,
      calorieTarget: kcal,
      proteinG,
      carbsG,
      fatG,
      fibreG: Math.round((kcal / 1000) * 14),
      missing: [],
      note: "You set this calorie target manually. Macro split: protein by body weight, fat at 25% of calories, carbohydrates for the remainder.",
    };
  }

  if (
    missing.length > 0 ||
    age == null ||
    profile.heightCm == null ||
    profile.weightKg == null ||
    profile.sex == null ||
    profile.activityLevel == null
  ) {
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
      note: "Add the missing details in your profile to calculate an estimated daily target.",
    };
  }

  // Mifflin–St Jeor. For sex = "other" we average the two constants and
  // say so — the formula itself only defines male/female variants.
  const base =
    10 * profile.weightKg + 6.25 * profile.heightCm - 5 * age;
  const bmr =
    profile.sex === "male"
      ? base + 5
      : profile.sex === "female"
        ? base - 161
        : base - 78;
  const multiplier = ACTIVITY_MULTIPLIERS[profile.activityLevel] ?? 1.2;
  const tdee = bmr * multiplier;

  let adjustment = 0;
  if (profile.mainGoal === "fat_loss") adjustment = -450;
  else if (profile.mainGoal === "muscle_gain") adjustment = 300;
  else if (profile.mainGoal === "strength") adjustment = 200;

  let calorieTarget = Math.round(tdee + adjustment);
  // Safety floor: never suggest an aggressive target.
  const floor = Math.max(1200, Math.round(bmr));
  if (calorieTarget < floor) calorieTarget = floor;

  const proteinG = Math.round(profile.weightKg * proteinPerKg);
  const fatG = Math.round((calorieTarget * 0.25) / 9);
  const carbsG = Math.max(
    0,
    Math.round((calorieTarget - proteinG * 4 - fatG * 9) / 4),
  );

  return {
    status: "ok",
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    calorieTarget,
    proteinG,
    carbsG,
    fatG,
    fibreG: Math.round((calorieTarget / 1000) * 14),
    missing: [],
    note:
      "Estimate from the Mifflin–St Jeor equation (BMR) × your activity level (TDEE), adjusted for your goal. " +
      (profile.sex === "other"
        ? "The published formula defines male/female constants; yours averages the two. "
        : "") +
      "Exercise calories are not added back automatically. These are estimates, not medical advice.",
  };
}

// ------------------------------------------------- Phase 2: food engine

const foodShape = z.object({
  id: z.number(),
  name: z.string(),
  aliases: z.string(),
  category: z.string(),
  cuisine: z.string(),
  dietFlag: z.enum(["veg", "vegan", "eggetarian", "non_veg"]),
  kcalPer100: z.number(),
  proteinPer100: z.number(),
  carbsPer100: z.number(),
  fatPer100: z.number(),
  fibrePer100: z.number(),
  servingName: z.string(),
  servingGrams: z.number(),
  source: z.string(),
  verification: z.enum(["estimate", "verified", "user"]),
  notes: z.string().nullable(),
  isCustom: z.boolean(),
  isFavourite: z.boolean(),
});

type FoodPayload = z.infer<typeof foodShape>;

const MEALS = ["breakfast", "lunch", "snacks", "dinner", "custom"] as const;
const mealEnum = z.enum(["breakfast", "lunch", "snacks", "dinner", "custom"]);

const entryShape = z.object({
  id: z.number(),
  foodId: z.number().nullable(),
  foodName: z.string(),
  meal: mealEnum,
  quantityGrams: z.number(),
  servings: z.number().nullable(),
  servingName: z.string(),
  servingGrams: z.number(),
  kcal: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fat: z.number(),
  fibre: z.number(),
});

type EntryRow = typeof schema.diaryEntries.$inferSelect;

/* nutrient = (grams / 100) × per-100g snapshot value, rounded to 0.1. */
function entryPayload(e: EntryRow): z.infer<typeof entryShape> {
  const f = e.quantityGrams / 100;
  const r1 = (n: number) => Math.round(n * 10) / 10;
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
    fibre: r1(e.fibrePer100 * f),
  };
}

const totalsShape = z.object({
  kcal: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fat: z.number(),
  fibre: z.number(),
});

type Totals = z.infer<typeof totalsShape>;

function sumTotals(entries: z.infer<typeof entryShape>[]): Totals {
  const r1 = (n: number) => Math.round(n * 10) / 10;
  return {
    kcal: r1(entries.reduce((s, e) => s + e.kcal, 0)),
    protein: r1(entries.reduce((s, e) => s + e.protein, 0)),
    carbs: r1(entries.reduce((s, e) => s + e.carbs, 0)),
    fat: r1(entries.reduce((s, e) => s + e.fat, 0)),
    fibre: r1(entries.reduce((s, e) => s + e.fibre, 0)),
  };
}

function foodPayload(
  f: typeof schema.foods.$inferSelect,
  favouriteIds: Set<number>,
): FoodPayload {
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
    isFavourite: favouriteIds.has(f.id),
  };
}

/* Seeds the shared catalogue once. Idempotent: keyed on food names, so
   re-runs (and later catalogue batches) never duplicate a row. */
async function ensureFoodCatalog(db: Db): Promise<void> {
  const existing = await db
    .select({ name: schema.foods.name })
    .from(schema.foods)
    .where(isNull(schema.foods.ownerUserId));
  const have = new Set(existing.map((r) => r.name));
  const missing = SEED_FOODS.filter((f) => !have.has(f.name));
  if (missing.length === 0) return;
  await db.insert(schema.foods).values(
    missing.map((f) => ({
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
      verification: "estimate" as const,
      notes: f.notes ?? null,
      ownerUserId: null,
    })),
  );
}

async function favouriteIdSet(db: Db, userId: number): Promise<Set<number>> {
  const rows = await db
    .select({ foodId: schema.favouriteFoods.foodId })
    .from(schema.favouriteFoods)
    .where(eq(schema.favouriteFoods.userId, userId));
  return new Set(rows.map((r) => r.foodId));
}

/* Foods a user may see and log: the shared catalogue + their own
   custom foods. Another user's custom foods are never visible. */
async function visibleFoods(db: Db, userId: number) {
  return db
    .select()
    .from(schema.foods)
    .where(
      or(
        isNull(schema.foods.ownerUserId),
        eq(schema.foods.ownerUserId, userId),
      ),
    );
}

async function diaryForDate(db: Db, userId: number, date: string) {
  const rows = await db
    .select()
    .from(schema.diaryEntries)
    .where(
      and(
        eq(schema.diaryEntries.userId, userId),
        eq(schema.diaryEntries.loggedOn, date),
      ),
    )
    .orderBy(asc(schema.diaryEntries.id));
  return rows.map(entryPayload);
}

function bmiOf(profile: ProfilePayload): {
  value: number;
  category: string;
} | null {
  if (profile.heightCm == null || profile.weightKg == null) return null;
  const m = profile.heightCm / 100;
  if (m <= 0) return null;
  const value = Math.round((profile.weightKg / (m * m)) * 10) / 10;
  const category =
    value < 18.5
      ? "Below 18.5"
      : value < 25
        ? "18.5 – 24.9"
        : value < 30
          ? "25 – 29.9"
          : "30 or above";
  return { value, category };
}

// ------------------------------------------------- Phase 3: workout engine

const exerciseShape = z.object({
  id: z.number(),
  name: z.string(),
  primaryMuscle: z.string(),
  secondaryMuscles: z.string(),
  equipment: z.string(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  pattern: z.string(),
  kind: z.enum(["weighted", "bodyweight", "timed"]),
  instructions: z.string(),
  mistakes: z.string(),
  suggestedSets: z.number(),
  suggestedReps: z.string(),
  restSeconds: z.number(),
});

type ExerciseRow = typeof schema.exercises.$inferSelect;

function exercisePayload(e: ExerciseRow): z.infer<typeof exerciseShape> {
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
    restSeconds: e.restSeconds,
  };
}

/* Seeds the shared exercise library once, keyed on exercise names. */
async function ensureExerciseLibrary(db: Db): Promise<void> {
  const existing = await db
    .select({ name: schema.exercises.name })
    .from(schema.exercises);
  const have = new Set(existing.map((r) => r.name));
  const missing = SEED_EXERCISES.filter((e) => !have.has(e.name));
  if (missing.length === 0) return;
  await db.insert(schema.exercises).values(
    missing.map((e) => ({
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
      restSeconds: e.restSeconds,
    })),
  );
}

async function exerciseByName(
  db: Db,
  name: string,
): Promise<ExerciseRow | null> {
  const rows = await db
    .select()
    .from(schema.exercises)
    .where(eq(schema.exercises.name, name))
    .limit(1);
  return rows[0] ?? null;
}

const routineShape = z.object({
  id: z.number(),
  name: z.string(),
  notes: z.string().nullable(),
  sourceTemplate: z.string().nullable(),
  exerciseCount: z.number(),
});

const routineExerciseShape = z.object({
  id: z.number(),
  exerciseId: z.number(),
  exerciseName: z.string(),
  primaryMuscle: z.string(),
  equipment: z.string(),
  kind: z.enum(["weighted", "bodyweight", "timed"]),
  position: z.number(),
  targetSets: z.number(),
  targetReps: z.string(),
  restSeconds: z.number(),
  notes: z.string().nullable(),
});

const setShape = z.object({
  id: z.number(),
  setNumber: z.number(),
  reps: z.number().nullable(),
  loadKg: z.number().nullable(),
  durationSeconds: z.number().nullable(),
  completed: z.boolean(),
});

const sessionExerciseShape = z.object({
  id: z.number(),
  exerciseId: z.number(),
  exerciseName: z.string(),
  primaryMuscle: z.string(),
  kind: z.enum(["weighted", "bodyweight", "timed"]),
  position: z.number(),
  restSeconds: z.number(),
  skipped: z.boolean(),
  notes: z.string().nullable(),
  sets: z.array(setShape),
});

const sessionShape = z.object({
  id: z.number(),
  title: z.string(),
  status: z.enum(["in_progress", "completed"]),
  routineId: z.number().nullable(),
  startedOn: z.string(),
  startedAt: z.string(),
  endedAt: z.string().nullable(),
  durationSeconds: z.number().nullable(),
  notes: z.string().nullable(),
  exercises: z.array(sessionExerciseShape),
  totalVolumeKg: z.number(),
  completedSets: z.number(),
});

type SessionRow = typeof schema.workoutSessions.$inferSelect;
type SessionExerciseRow = typeof schema.sessionExercises.$inferSelect;
type WorkoutSetRow = typeof schema.workoutSets.$inferSelect;

function setVolumeKg(s: WorkoutSetRow): number {
  if (s.completed !== 1 || s.reps == null || s.loadKg == null) return 0;
  return s.reps * s.loadKg;
}

async function sessionPayload(
  db: Db,
  session: SessionRow,
): Promise<z.infer<typeof sessionShape>> {
  const exRows = await db
    .select()
    .from(schema.sessionExercises)
    .where(eq(schema.sessionExercises.sessionId, session.id))
    .orderBy(asc(schema.sessionExercises.position), asc(schema.sessionExercises.id));
  const exercises: z.infer<typeof sessionExerciseShape>[] = [];
  let volume = 0;
  let completedSets = 0;
  for (const ex of exRows) {
    const sets = await db
      .select()
      .from(schema.workoutSets)
      .where(eq(schema.workoutSets.sessionExerciseId, ex.id))
      .orderBy(asc(schema.workoutSets.setNumber), asc(schema.workoutSets.id));
    if (ex.skipped !== 1) {
      for (const s of sets) {
        volume += setVolumeKg(s);
        if (s.completed === 1) completedSets += 1;
      }
    }
    exercises.push({
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
        completed: s.completed === 1,
      })),
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
    exercises,
    totalVolumeKg: Math.round(volume * 10) / 10,
    completedSets,
  };
}

async function ownRoutine(db: Db, userId: number, routineId: number) {
  const rows = await db
    .select()
    .from(schema.routines)
    .where(
      and(
        eq(schema.routines.id, routineId),
        eq(schema.routines.userId, userId),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

async function ownSession(db: Db, userId: number, sessionId: number) {
  const rows = await db
    .select()
    .from(schema.workoutSessions)
    .where(
      and(
        eq(schema.workoutSessions.id, sessionId),
        eq(schema.workoutSessions.userId, userId),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

/* Resolves a session exercise to its owning user, or null. */
async function ownSessionExercise(
  db: Db,
  userId: number,
  sessionExerciseId: number,
): Promise<{ ex: SessionExerciseRow; session: SessionRow } | null> {
  const rows = await db
    .select()
    .from(schema.sessionExercises)
    .where(eq(schema.sessionExercises.id, sessionExerciseId))
    .limit(1);
  const ex = rows[0];
  if (!ex) return null;
  const session = await ownSession(db, userId, ex.sessionId);
  if (!session) return null;
  return { ex, session };
}

async function ownSet(
  db: Db,
  userId: number,
  setId: number,
): Promise<{ set: WorkoutSetRow; session: SessionRow } | null> {
  const rows = await db
    .select()
    .from(schema.workoutSets)
    .where(eq(schema.workoutSets.id, setId))
    .limit(1);
  const set = rows[0];
  if (!set) return null;
  const found = await ownSessionExercise(db, userId, set.sessionExerciseId);
  if (!found) return null;
  return { set, session: found.session };
}

/* Every completed set the user has ever logged, in completed sessions,
   excluding skipped exercises. The single source for PRs, progression
   and volume — nothing here is estimated or invented. */
type DoneSet = {
  exerciseId: number;
  exerciseName: string;
  kind: "weighted" | "bodyweight" | "timed";
  date: string;
  reps: number | null;
  loadKg: number | null;
  durationSeconds: number | null;
};

async function allCompletedSets(db: Db, userId: number): Promise<DoneSet[]> {
  const sessions = await db
    .select()
    .from(schema.workoutSessions)
    .where(
      and(
        eq(schema.workoutSessions.userId, userId),
        eq(schema.workoutSessions.status, "completed"),
      ),
    );
  if (sessions.length === 0) return [];
  const sessionById = new Map(sessions.map((s) => [s.id, s]));
  const exRows = await db
    .select()
    .from(schema.sessionExercises)
    .where(
      inArray(
        schema.sessionExercises.sessionId,
        sessions.map((s) => s.id),
      ),
    );
  const exById = new Map(exRows.map((e) => [e.id, e]));
  const setRows = await db
    .select()
    .from(schema.workoutSets)
    .where(
      and(
        inArray(
          schema.workoutSets.sessionExerciseId,
          exRows.map((e) => e.id),
        ),
        eq(schema.workoutSets.completed, 1),
      ),
    );
  const out: DoneSet[] = [];
  for (const s of setRows) {
    const ex = exById.get(s.sessionExerciseId);
    if (!ex || ex.skipped === 1) continue;
    const session = sessionById.get(ex.sessionId);
    if (!session) continue;
    out.push({
      exerciseId: ex.exerciseId,
      exerciseName: ex.exerciseName,
      kind: ex.kind,
      date: session.startedOn,
      reps: s.reps,
      loadKg: s.loadKg,
      durationSeconds: s.durationSeconds,
    });
  }
  return out;
}

const prShape = z.object({
  exerciseId: z.number(),
  exerciseName: z.string(),
  kind: z.enum(["weighted", "bodyweight", "timed"]),
  heaviestLoadKg: z.number().nullable(),
  heaviestReps: z.number().nullable(),
  // Epley estimate: load × (1 + reps/30), labelled as an estimate in UI.
  estimatedOneRmKg: z.number().nullable(),
  bestReps: z.number().nullable(),
  longestSeconds: z.number().nullable(),
  lastTrainedOn: z.string().nullable(),
});

type PrPayload = z.infer<typeof prShape>;

function computePrs(done: DoneSet[]): PrPayload[] {
  const byExercise = new Map<number, DoneSet[]>();
  for (const s of done) {
    const list = byExercise.get(s.exerciseId) ?? [];
    list.push(s);
    byExercise.set(s.exerciseId, list);
  }
  const prs: PrPayload[] = [];
  for (const [exerciseId, sets] of byExercise) {
    const first = sets[0];
    if (!first) continue;
    let heaviestLoadKg: number | null = null;
    let heaviestReps: number | null = null;
    let estimatedOneRmKg: number | null = null;
    let bestReps: number | null = null;
    let longestSeconds: number | null = null;
    let lastTrainedOn: string | null = null;
    for (const s of sets) {
      if (lastTrainedOn == null || s.date > lastTrainedOn)
        lastTrainedOn = s.date;
      if (s.loadKg != null && s.loadKg > 0) {
        if (heaviestLoadKg == null || s.loadKg > heaviestLoadKg) {
          heaviestLoadKg = s.loadKg;
          heaviestReps = s.reps;
        } else if (s.loadKg === heaviestLoadKg) {
          if ((s.reps ?? 0) > (heaviestReps ?? 0)) heaviestReps = s.reps;
        }
        if (s.reps != null && s.reps >= 1) {
          const est = s.loadKg * (1 + s.reps / 30);
          if (estimatedOneRmKg == null || est > estimatedOneRmKg)
            estimatedOneRmKg = Math.round(est * 10) / 10;
        }
      }
      if (s.reps != null && (bestReps == null || s.reps > bestReps))
        bestReps = s.reps;
      if (
        s.durationSeconds != null &&
        (longestSeconds == null || s.durationSeconds > longestSeconds)
      )
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
      lastTrainedOn,
    });
  }
  prs.sort((a, b) =>
    (b.lastTrainedOn ?? "").localeCompare(a.lastTrainedOn ?? ""),
  );
  return prs;
}

const trainingShape = z.object({
  workoutsThisWeek: z.number(),
  totalWorkouts: z.number(),
  dayStreak: z.number(),
  activeSessionId: z.number().nullable(),
  lastWorkout: z
    .object({
      title: z.string(),
      startedOn: z.string(),
      durationSeconds: z.number().nullable(),
    })
    .nullable(),
  latestPrs: z.array(prShape),
});

const EMPTY_TRAINING: z.infer<typeof trainingShape> = {
  workoutsThisWeek: 0,
  totalWorkouts: 0,
  dayStreak: 0,
  activeSessionId: null,
  lastWorkout: null,
  latestPrs: [],
};

/* Dashboard training summary — completed sessions only. The streak
   counts consecutive days with a completed workout, ending today or
   yesterday (a rest day today doesn't erase it until tomorrow). */
async function trainingSummary(
  db: Db,
  userId: number,
  today: string,
  weekStart: string,
): Promise<z.infer<typeof trainingShape>> {
  const sessions = await db
    .select()
    .from(schema.workoutSessions)
    .where(eq(schema.workoutSessions.userId, userId))
    .orderBy(desc(schema.workoutSessions.startedAt));
  const completed = sessions.filter((s) => s.status === "completed");
  const active = sessions.find((s) => s.status === "in_progress") ?? null;
  const days = new Set(completed.map((s) => s.startedOn));
  let streak = 0;
  const cursor = new Date(`${today}T00:00:00Z`);
  if (!days.has(today)) cursor.setUTCDate(cursor.getUTCDate() - 1);
  for (;;) {
    const key = cursor.toISOString().slice(0, 10);
    if (!days.has(key)) break;
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  const last = completed[0] ?? null;
  const prs = computePrs(await allCompletedSets(db, userId));
  return {
    workoutsThisWeek: completed.filter(
      (s) => s.startedOn >= weekStart && s.startedOn <= today,
    ).length,
    totalWorkouts: completed.length,
    dayStreak: streak,
    activeSessionId: active ? active.id : null,
    lastWorkout: last
      ? {
          title: last.title,
          startedOn: last.startedOn,
          durationSeconds: last.durationSeconds,
        }
      : null,
    latestPrs: prs.slice(0, 3),
  };
}

// ------------------------------------------------- Phase 4: progress,
// water, recipes & challenges.

function shiftDateStr(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  const ms =
    new Date(`${b}T00:00:00Z`).getTime() - new Date(`${a}T00:00:00Z`).getTime();
  return Math.round(ms / 86400000);
}

const r1 = (n: number) => Math.round(n * 10) / 10;
const r2 = (n: number) => Math.round(n * 100) / 100;

// ------------------------------------------------------------- water

/* Suggested starting target shown when the user hasn't set their own.
   It is a suggestion in the UI copy, never presented as a rule. */
const WATER_SUGGESTED_ML = 2500;

async function waterTarget(
  db: Db,
  userId: number,
): Promise<{ targetMl: number; isCustom: boolean }> {
  const rows = await db
    .select({ waterTargetMl: schema.userPreferences.waterTargetMl })
    .from(schema.userPreferences)
    .where(eq(schema.userPreferences.userId, userId))
    .limit(1);
  const t = rows[0]?.waterTargetMl ?? null;
  return { targetMl: t ?? WATER_SUGGESTED_ML, isCustom: t != null };
}

async function waterTotalForDate(
  db: Db,
  userId: number,
  date: string,
): Promise<number> {
  const rows = await db
    .select({ amountMl: schema.waterEntries.amountMl })
    .from(schema.waterEntries)
    .where(
      and(
        eq(schema.waterEntries.userId, userId),
        eq(schema.waterEntries.loggedOn, date),
      ),
    );
  return rows.reduce((s, r) => s + r.amountMl, 0);
}

// ------------------------------------------------------------- recipes

type RecipeRow = typeof schema.recipes.$inferSelect;
type RecipeIngredientRow = typeof schema.recipeIngredients.$inferSelect;

const recipeCategoryEnum = z.enum(["breakfast", "lunch", "dinner", "snacks"]);

const recipeShape = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  category: recipeCategoryEnum,
  dietFlag: z.enum(["veg", "vegan", "eggetarian", "non_veg"]),
  servings: z.number(),
  prepMinutes: z.number(),
  cookMinutes: z.number().nullable(),
  budget: z.boolean(),
  isOwn: z.boolean(),
  isFavourite: z.boolean(),
  perServing: totalsShape,
  highProtein: z.boolean(),
});

const recipeIngredientShape = z.object({
  id: z.number(),
  foodId: z.number().nullable(),
  name: z.string(),
  quantityGrams: z.number(),
  kcal: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fat: z.number(),
  fibre: z.number(),
});

const recipeDetailShape = recipeShape.extend({
  steps: z.array(z.string()),
  ingredients: z.array(recipeIngredientShape),
  totals: totalsShape,
  methodNote: z.string(),
});

const RECIPE_METHOD_NOTE =
  "Per-serving values are calculated from the catalogue values of the ingredients (grams × per-100 g values ÷ servings). Estimates — home preparation varies.";

/* Seeds the shared recipe library once, keyed on recipe names.
   Ingredients are matched to shared catalogue foods by exact name. */
async function ensureRecipeLibrary(db: Db): Promise<void> {
  await ensureFoodCatalog(db);
  const existing = await db
    .select({ name: schema.recipes.name })
    .from(schema.recipes)
    .where(isNull(schema.recipes.ownerUserId));
  const have = new Set(existing.map((r) => r.name));
  const missing = SEED_RECIPES.filter((r) => !have.has(r.name));
  if (missing.length === 0) return;
  const foods = await db
    .select()
    .from(schema.foods)
    .where(isNull(schema.foods.ownerUserId));
  const foodByName = new Map(foods.map((f) => [f.name, f]));
  for (const r of missing) {
    const inserted = await db
      .insert(schema.recipes)
      .values({
        name: r.name,
        description: r.description,
        category: r.category,
        dietFlag: r.dietFlag,
        servings: r.servings,
        prepMinutes: r.prepMinutes,
        cookMinutes: r.cookMinutes,
        steps: r.steps.join("\n"),
        budget: r.budget ? 1 : 0,
        ownerUserId: null,
      })
      .returning();
    const row = inserted[0];
    if (!row) continue;
    const ings: (typeof schema.recipeIngredients.$inferInsert)[] = [];
    r.ingredients.forEach((ing, i) => {
      const food = foodByName.get(ing.foodName);
      ings.push({
        recipeId: row.id,
        foodId: food ? food.id : null,
        name: ing.foodName,
        quantityGrams: ing.grams,
        position: i,
      });
    });
    if (ings.length > 0) await db.insert(schema.recipeIngredients).values(ings);
  }
}

async function favouriteRecipeIdSet(
  db: Db,
  userId: number,
): Promise<Set<number>> {
  const rows = await db
    .select({ recipeId: schema.favouriteRecipes.recipeId })
    .from(schema.favouriteRecipes)
    .where(eq(schema.favouriteRecipes.userId, userId));
  return new Set(rows.map((r) => r.recipeId));
}

type RecipeData = {
  ingredients: (RecipeIngredientRow & {
    computed: Totals;
  })[];
  totals: Totals;
  perServing: Totals;
};

/* The one place recipe nutrition is computed: ingredient grams × the
   catalogue per-100 g values, summed, then divided by servings. */
async function recipeData(db: Db, recipe: RecipeRow): Promise<RecipeData> {
  const rows = await db
    .select()
    .from(schema.recipeIngredients)
    .where(eq(schema.recipeIngredients.recipeId, recipe.id))
    .orderBy(asc(schema.recipeIngredients.position), asc(schema.recipeIngredients.id));
  const foodIds = rows
    .map((r) => r.foodId)
    .filter((id): id is number => id != null);
  const foods =
    foodIds.length > 0
      ? await db
          .select()
          .from(schema.foods)
          .where(inArray(schema.foods.id, foodIds))
      : [];
  const foodById = new Map(foods.map((f) => [f.id, f]));
  const zero: Totals = { kcal: 0, protein: 0, carbs: 0, fat: 0, fibre: 0 };
  const totals: Totals = { ...zero };
  const ingredients = rows.map((r) => {
    const food = r.foodId != null ? foodById.get(r.foodId) : undefined;
    const f = r.quantityGrams / 100;
    const computed: Totals = food
      ? {
          kcal: r1(food.kcalPer100 * f),
          protein: r1(food.proteinPer100 * f),
          carbs: r1(food.carbsPer100 * f),
          fat: r1(food.fatPer100 * f),
          fibre: r1(food.fibrePer100 * f),
        }
      : { ...zero };
    totals.kcal += computed.kcal;
    totals.protein += computed.protein;
    totals.carbs += computed.carbs;
    totals.fat += computed.fat;
    totals.fibre += computed.fibre;
    return { ...r, computed };
  });
  const servings = recipe.servings > 0 ? recipe.servings : 1;
  const perServing: Totals = {
    kcal: r1(totals.kcal / servings),
    protein: r1(totals.protein / servings),
    carbs: r1(totals.carbs / servings),
    fat: r1(totals.fat / servings),
    fibre: r1(totals.fibre / servings),
  };
  return {
    ingredients,
    totals: {
      kcal: r1(totals.kcal),
      protein: r1(totals.protein),
      carbs: r1(totals.carbs),
      fat: r1(totals.fat),
      fibre: r1(totals.fibre),
    },
    perServing,
  };
}

function recipePayload(
  recipe: RecipeRow,
  data: RecipeData,
  userId: number,
  favIds: Set<number>,
): z.infer<typeof recipeShape> {
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
    highProtein: data.perServing.protein >= 15,
  };
}

/* A recipe is visible when it is shared or the user's own. */
async function visibleRecipe(
  db: Db,
  userId: number,
  recipeId: number,
): Promise<RecipeRow | null> {
  const rows = await db
    .select()
    .from(schema.recipes)
    .where(eq(schema.recipes.id, recipeId))
    .limit(1);
  const r = rows[0];
  if (!r) return null;
  if (r.ownerUserId != null && r.ownerUserId !== userId) return null;
  return r;
}

/* Diet flag of a recipe from its ingredients: the most inclusive flag
   wins (non-veg > egg > veg > vegan). */
function deriveDietFlag(
  flags: ("veg" | "vegan" | "eggetarian" | "non_veg")[],
): "veg" | "vegan" | "eggetarian" | "non_veg" {
  if (flags.includes("non_veg")) return "non_veg";
  if (flags.includes("eggetarian")) return "eggetarian";
  if (flags.includes("veg")) return "veg";
  return "vegan";
}

// ---------------------------------------------------------- challenges

const challengeSummaryShape = z.object({
  id: z.number(),
  name: z.string(),
  template: z.string().nullable(),
  totalDays: z.number(),
  startedOn: z.string(),
  status: z.enum(["active", "paused"]),
  taskCount: z.number(),
  dayNumber: z.number(),
  percent: z.number(),
  streak: z.number(),
  todayDone: z.number(),
  finished: z.boolean(),
});

type ChallengeRow = typeof schema.challenges.$inferSelect;

/* All challenge maths in one place. A day counts complete only when
   every task has a check row for that date — checks are only ever
   created by the user ticking a box. */
async function challengeSummary(
  db: Db,
  ch: ChallengeRow,
  today: string,
): Promise<z.infer<typeof challengeSummaryShape>> {
  const tasks = await db
    .select({ id: schema.challengeTasks.id })
    .from(schema.challengeTasks)
    .where(eq(schema.challengeTasks.challengeId, ch.id));
  const taskCount = tasks.length;
  const checks = await db
    .select({ loggedOn: schema.challengeChecks.loggedOn })
    .from(schema.challengeChecks)
    .where(eq(schema.challengeChecks.challengeId, ch.id));
  const perDay = new Map<string, number>();
  for (const c of checks)
    perDay.set(c.loggedOn, (perDay.get(c.loggedOn) ?? 0) + 1);
  const endOn = shiftDateStr(ch.startedOn, ch.totalDays - 1);
  const elapsed =
    today < ch.startedOn
      ? 0
      : Math.min(daysBetween(ch.startedOn, today) + 1, ch.totalDays);
  let doneChecks = 0;
  for (let i = 0; i < elapsed; i++)
    doneChecks += perDay.get(shiftDateStr(ch.startedOn, i)) ?? 0;
  const percent =
    taskCount > 0 && elapsed > 0
      ? Math.round((doneChecks / (elapsed * taskCount)) * 100)
      : 0;
  const completeDay = (date: string) =>
    taskCount > 0 && (perDay.get(date) ?? 0) >= taskCount;
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
    finished: today > endOn,
  };
}

async function ownChallenge(
  db: Db,
  userId: number,
  challengeId: number,
): Promise<ChallengeRow | null> {
  const rows = await db
    .select()
    .from(schema.challenges)
    .where(
      and(
        eq(schema.challenges.id, challengeId),
        eq(schema.challenges.userId, userId),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

// ------------------------------------------------------------ validation

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateCredentials(
  email: string,
  password: string,
): string | null {
  if (!EMAIL_RE.test(email)) return "Enter a valid email address.";
  if (password.length < 8)
    return "Password must be at least 8 characters long.";
  if (password.length > 200) return "Password is too long.";
  return null;
}

// --------------------------------------------------------------- actions

const authResponse = z.object({
  ok: z.boolean(),
  error: z.string().nullable(),
  token: z.string().nullable(),
  profile: profileShape.nullable(),
});

const okResponse = z.object({
  ok: z.boolean(),
  error: z.string().nullable(),
});

export const Actions = {
  signup: defineAction({
    description:
      "Creates a FITIND account with email and password and returns a session token plus the new profile.",
    request: z.object({
      email: z.string().trim().toLowerCase().min(3).max(254),
      password: z.string().min(1).max(200),
      displayName: z.string().trim().min(1).max(80),
      userAgent: z.string().max(300).optional(),
    }),
    response: authResponse,
    async handler(ctx, args): Promise<z.infer<typeof authResponse>> {
      const invalid = validateCredentials(args.email, args.password);
      if (invalid)
        return { ok: false, error: invalid, token: null, profile: null };
      const db = ctx.db<typeof schema>();
      const existing = await db
        .select({ id: schema.users.id })
        .from(schema.users)
        .where(eq(schema.users.email, args.email))
        .limit(1);
      if (existing[0])
        return {
          ok: false,
          error: "An account with this email already exists. Try logging in instead.",
          token: null,
          profile: null,
        };
      const salt = newSalt();
      const passwordHash = await hashPassword(args.password, salt);
      const inserted = await db
        .insert(schema.users)
        .values({
          email: args.email,
          passwordHash,
          passwordSalt: salt,
          displayName: args.displayName,
        })
        .returning({ id: schema.users.id });
      const user = inserted[0];
      if (!user) throw new Error("signup: user insert returned no rows");
      const now = new Date();
      await db.insert(schema.profiles).values({
        userId: user.id,
        displayName: args.displayName,
        createdAt: now,
        updatedAt: now,
      });
      await db.insert(schema.userGoals).values({ userId: user.id, updatedAt: now });
      await db
        .insert(schema.userPreferences)
        .values({ userId: user.id, updatedAt: now });
      const token = await createSession(db, user.id, args.userAgent);
      const profile = await loadProfile(db, user.id);
      ctx.invalidateQueries();
      return { ok: true, error: null, token, profile };
    },
  }),

  login: defineAction({
    description:
      "Logs in with email and password and returns a fresh session token plus the saved profile.",
    request: z.object({
      email: z.string().trim().toLowerCase().min(3).max(254),
      password: z.string().min(1).max(200),
      userAgent: z.string().max(300).optional(),
    }),
    response: authResponse,
    async handler(ctx, args): Promise<z.infer<typeof authResponse>> {
      const db = ctx.db<typeof schema>();
      const rows = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, args.email))
        .limit(1);
      const user = rows[0];
      if (!user)
        return {
          ok: false,
          error: "No account found for this email. Check the email or create an account.",
          token: null,
          profile: null,
        };
      const attempt = await hashPassword(args.password, user.passwordSalt);
      if (attempt !== user.passwordHash)
        return {
          ok: false,
          error: "Incorrect password. Please try again.",
          token: null,
          profile: null,
        };
      const token = await createSession(db, user.id, args.userAgent);
      const profile = await loadProfile(db, user.id);
      return { ok: true, error: null, token, profile };
    },
  }),

  logout: defineAction({
    description: "Ends the given session so the token can no longer be used.",
    request: z.object({ token: z.string().min(1).max(200) }),
    response: okResponse,
    async handler(ctx, args): Promise<z.infer<typeof okResponse>> {
      const db = ctx.db<typeof schema>();
      const tokenHash = await sha256Hex(args.token);
      await db
        .delete(schema.sessions)
        .where(eq(schema.sessions.tokenHash, tokenHash));
      return { ok: true, error: null };
    },
  }),

  getSession: defineAction({
    description:
      "Validates a session token and returns the signed-in user's profile and calculated nutrition targets.",
    request: z.object({ token: z.string().min(1).max(200) }),
    response: z.object({
      authenticated: z.boolean(),
      expired: z.boolean(),
      profile: profileShape.nullable(),
      targets: targetsShape.nullable(),
      // Phase 5: whether this user holds an admin role (server-checked
      // against admin_roles) and whether the one-time first-admin claim
      // is still available (true only while no admin exists at all).
      isAdmin: z.boolean(),
      adminClaimAvailable: z.boolean(),
    }),
    async handler(ctx, args) {
      const db = ctx.db<typeof schema>();
      const claimAvailable = (await adminCount(db)) === 0;
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return {
          authenticated: false,
          expired: resolved.error === "expired",
          profile: null,
          targets: null,
          isAdmin: false,
          adminClaimAvailable: claimAvailable,
        };
      const profile = await loadProfile(db, resolved.userId);
      if (!profile)
        return {
          authenticated: false,
          expired: false,
          profile: null,
          targets: null,
          isAdmin: false,
          adminClaimAvailable: claimAvailable,
        };
      return {
        authenticated: true,
        expired: false,
        profile,
        targets: computeTargets(profile),
        isAdmin: await isAdmin(db, resolved.userId),
        adminClaimAvailable: claimAvailable,
      };
    },
  }),

  saveProfile: defineAction({
    description:
      "Saves onboarding or profile/settings edits for the signed-in user and returns the updated profile with recalculated targets.",
    request: z.object({
      token: z.string().min(1).max(200),
      markOnboardingComplete: z.boolean().default(false),
      displayName: z.string().trim().min(1).max(80).optional(),
      dateOfBirth: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .nullable()
        .optional(),
      heightCm: z.number().min(80).max(260).nullable().optional(),
      weightKg: z.number().min(25).max(500).nullable().optional(),
      sex: z.enum(["male", "female", "other"]).nullable().optional(),
      activityLevel: z
        .enum(["sedentary", "light", "moderate", "active", "very_active"])
        .nullable()
        .optional(),
      experience: z
        .enum(["beginner", "intermediate", "advanced"])
        .nullable()
        .optional(),
      mainGoal: z
        .enum(["muscle_gain", "fat_loss", "maintenance", "general_fitness", "strength"])
        .nullable()
        .optional(),
      targetWeightKg: z.number().min(25).max(500).nullable().optional(),
      calorieTargetOverride: z
        .number()
        .int()
        .min(800)
        .max(10000)
        .nullable()
        .optional(),
      dietPreference: z
        .enum(["vegetarian", "vegan", "eggetarian", "non_vegetarian", "custom"])
        .nullable()
        .optional(),
      dietCustomNote: z.string().trim().max(200).nullable().optional(),
      allergies: z.string().trim().max(300).nullable().optional(),
      trainingDaysPerWeek: z.number().int().min(0).max(7).nullable().optional(),
      equipment: z
        .enum(["full_gym", "home_equipment", "bodyweight", "custom"])
        .nullable()
        .optional(),
      equipmentCustomNote: z.string().trim().max(200).nullable().optional(),
      units: z.enum(["metric", "imperial"]).optional(),
      notifyMeals: z.boolean().optional(),
      notifyWater: z.boolean().optional(),
      notifyWorkouts: z.boolean().optional(),
      profilePrivate: z.boolean().optional(),
    }),
    response: z.object({
      ok: z.boolean(),
      error: z.string().nullable(),
      profile: profileShape.nullable(),
      targets: targetsShape.nullable(),
    }),
    async handler(ctx, args) {
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return {
          ok: false,
          error:
            resolved.error === "expired"
              ? "Your session has expired. Please log in again."
              : "You are not signed in.",
          profile: null,
          targets: null,
        };
      const userId = resolved.userId;
      const now = new Date();

      if (args.dateOfBirth) {
        const age = ageFromDob(args.dateOfBirth, now);
        if (age == null)
          return {
            ok: false,
            error: "Date of birth looks invalid. Check it and try again.",
            profile: null,
            targets: null,
          };
      }

      const profilePatch: Partial<typeof schema.profiles.$inferInsert> = {
        updatedAt: now,
      };
      if (args.displayName !== undefined)
        profilePatch.displayName = args.displayName;
      if (args.dateOfBirth !== undefined)
        profilePatch.dateOfBirth = args.dateOfBirth;
      if (args.heightCm !== undefined) profilePatch.heightCm = args.heightCm;
      if (args.weightKg !== undefined) profilePatch.weightKg = args.weightKg;
      if (args.sex !== undefined) profilePatch.sex = args.sex;
      if (args.activityLevel !== undefined)
        profilePatch.activityLevel = args.activityLevel;
      if (args.experience !== undefined)
        profilePatch.experience = args.experience;
      if (args.markOnboardingComplete) profilePatch.onboardingCompleted = 1;
      await db
        .update(schema.profiles)
        .set(profilePatch)
        .where(eq(schema.profiles.userId, userId));
      if (args.displayName !== undefined) {
        await db
          .update(schema.users)
          .set({ displayName: args.displayName })
          .where(eq(schema.users.id, userId));
      }

      const goalPatch: Partial<typeof schema.userGoals.$inferInsert> = {
        updatedAt: now,
      };
      if (args.mainGoal !== undefined) goalPatch.mainGoal = args.mainGoal;
      if (args.targetWeightKg !== undefined)
        goalPatch.targetWeightKg = args.targetWeightKg;
      if (args.calorieTargetOverride !== undefined)
        goalPatch.calorieTargetOverride = args.calorieTargetOverride;
      await db
        .update(schema.userGoals)
        .set(goalPatch)
        .where(eq(schema.userGoals.userId, userId));

      const prefPatch: Partial<typeof schema.userPreferences.$inferInsert> = {
        updatedAt: now,
      };
      if (args.dietPreference !== undefined)
        prefPatch.dietPreference = args.dietPreference;
      if (args.dietCustomNote !== undefined)
        prefPatch.dietCustomNote = args.dietCustomNote;
      if (args.allergies !== undefined) prefPatch.allergies = args.allergies;
      if (args.trainingDaysPerWeek !== undefined)
        prefPatch.trainingDaysPerWeek = args.trainingDaysPerWeek;
      if (args.equipment !== undefined) prefPatch.equipment = args.equipment;
      if (args.equipmentCustomNote !== undefined)
        prefPatch.equipmentCustomNote = args.equipmentCustomNote;
      if (args.units !== undefined) prefPatch.units = args.units;
      if (args.notifyMeals !== undefined)
        prefPatch.notifyMeals = args.notifyMeals ? 1 : 0;
      if (args.notifyWater !== undefined)
        prefPatch.notifyWater = args.notifyWater ? 1 : 0;
      if (args.notifyWorkouts !== undefined)
        prefPatch.notifyWorkouts = args.notifyWorkouts ? 1 : 0;
      if (args.profilePrivate !== undefined)
        prefPatch.profilePrivate = args.profilePrivate ? 1 : 0;
      await db
        .update(schema.userPreferences)
        .set(prefPatch)
        .where(eq(schema.userPreferences.userId, userId));

      const profile = await loadProfile(db, userId);
      ctx.invalidateQueries();
      return {
        ok: true,
        error: null,
        profile,
        targets: profile ? computeTargets(profile) : null,
      };
    },
  }),

  getDashboard: defineAction({
    description:
      "Returns the signed-in user's dashboard: profile, nutrition targets, real weight-log history, today's diary totals and BMI.",
    request: z.object({
      token: z.string().min(1).max(200),
      // The client's local calendar date — "today" is the user's day,
      // not the server's.
      today: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .optional(),
      // The client's local Monday (YYYY-MM-DD) for "this week" counts.
      weekStart: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .optional(),
    }),
    response: z.object({
      authenticated: z.boolean(),
      profile: profileShape.nullable(),
      targets: targetsShape.nullable(),
      training: trainingShape,
      latestWeight: z
        .object({ weightKg: z.number(), loggedOn: z.string() })
        .nullable(),
      weightLogCount: z.number(),
      recentWeights: z.array(
        z.object({ weightKg: z.number(), loggedOn: z.string() }),
      ),
      today: z.object({
        date: z.string(),
        totals: totalsShape,
        entryCount: z.number(),
      }),
      water: z.object({ totalMl: z.number(), targetMl: z.number() }),
      bmi: z
        .object({ value: z.number(), category: z.string() })
        .nullable(),
    }),
    async handler(ctx, args) {
      const now = new Date();
      const today =
        args.today ??
        `${now.getFullYear()}-${`${now.getMonth() + 1}`.padStart(2, "0")}-${`${now.getDate()}`.padStart(2, "0")}`;
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
          entryCount: 0,
        },
        water: { totalMl: 0, targetMl: WATER_SUGGESTED_ML },
        bmi: null,
      };
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved) return empty;
      const profile = await loadProfile(db, resolved.userId);
      if (!profile) return empty;
      const logs = await db
        .select()
        .from(schema.weightLogs)
        .where(eq(schema.weightLogs.userId, resolved.userId))
        .orderBy(desc(schema.weightLogs.loggedOn), desc(schema.weightLogs.id))
        .limit(30);
      const recent = logs.slice(0, 10).map((l) => ({
        weightKg: l.weightKg,
        loggedOn: l.loggedOn,
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
          entryCount: todaysEntries.length,
        },
        water: {
          totalMl: await waterTotalForDate(db, resolved.userId, today),
          targetMl: wTarget.targetMl,
        },
        bmi: bmiOf(profile),
      };
    },
  }),

  logWeight: defineAction({
    description:
      "Logs a body-weight entry for the signed-in user on a given date and updates their current weight.",
    request: z.object({
      token: z.string().min(1).max(200),
      weightKg: z.number().min(25).max(500),
      loggedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    }),
    response: okResponse,
    async handler(ctx, args): Promise<z.infer<typeof okResponse>> {
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const userId = resolved.userId;
      await db.insert(schema.weightLogs).values({
        userId,
        weightKg: args.weightKg,
        loggedOn: args.loggedOn,
      });
      // Current weight on the profile follows the most recent log.
      const latest = await db
        .select()
        .from(schema.weightLogs)
        .where(eq(schema.weightLogs.userId, userId))
        .orderBy(desc(schema.weightLogs.loggedOn), desc(schema.weightLogs.id))
        .limit(1);
      const top = latest[0];
      if (top) {
        await db
          .update(schema.profiles)
          .set({ weightKg: top.weightKg, updatedAt: new Date() })
          .where(eq(schema.profiles.userId, userId));
      }
      ctx.invalidateQueries();
      return { ok: true, error: null };
    },
  }),

  deleteWeightLog: defineAction({
    description:
      "Deletes one of the signed-in user's own weight-log entries by date and weight value.",
    request: z.object({
      token: z.string().min(1).max(200),
      loggedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      weightKg: z.number().min(25).max(500),
    }),
    response: okResponse,
    async handler(ctx, args): Promise<z.infer<typeof okResponse>> {
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const userId = resolved.userId;
      const rows = await db
        .select()
        .from(schema.weightLogs)
        .where(
          and(
            eq(schema.weightLogs.userId, userId),
            eq(schema.weightLogs.loggedOn, args.loggedOn),
            eq(schema.weightLogs.weightKg, args.weightKg),
          ),
        )
        .orderBy(desc(schema.weightLogs.id))
        .limit(1);
      const row = rows[0];
      if (!row) return { ok: false, error: "Entry not found." };
      await db
        .delete(schema.weightLogs)
        .where(eq(schema.weightLogs.id, row.id));
      ctx.invalidateQueries();
      return { ok: true, error: null };
    },
  }),

  searchFoods: defineAction({
    description:
      "Searches the food catalogue (shared foods plus the user's own custom foods) by name or alias, with optional category, cuisine, diet and high-protein filters and sorting.",
    request: z.object({
      token: z.string().min(1).max(200),
      query: z.string().trim().max(80).default(""),
      category: z.string().max(40).optional(),
      cuisine: z.string().max(40).optional(),
      dietFlag: z
        .enum(["veg", "vegan", "eggetarian", "non_veg"])
        .optional(),
      highProtein: z.boolean().default(false),
      sort: z
        .enum(["relevance", "kcalAsc", "kcalDesc", "proteinDesc"])
        .default("relevance"),
      // Phase 5 performance: results are paged (60 per page) with a
      // total so the client can load more instead of rendering all.
      offset: z.number().int().min(0).max(100000).default(0),
    }),
    response: z.object({
      ok: z.boolean(),
      error: z.string().nullable(),
      foods: z.array(foodShape),
      total: z.number(),
    }),
    async handler(ctx, args) {
      const fail = { ok: false, error: "You are not signed in.", foods: [], total: 0 };
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved) return fail;
      const userId = resolved.userId;
      await ensureFoodCatalog(db);
      const [all, favs] = await Promise.all([
        visibleFoods(db, userId),
        favouriteIdSet(db, userId),
      ]);
      const q = args.query.toLowerCase();
      const terms = q.split(/\s+/).filter(Boolean);
      const scored: { f: (typeof all)[number]; score: number }[] = [];
      for (const f of all) {
        if (args.category && f.category !== args.category) continue;
        if (args.cuisine && f.cuisine !== args.cuisine) continue;
        if (args.dietFlag && f.dietFlag !== args.dietFlag) continue;
        if (args.highProtein && f.proteinPer100 < 10) continue;
        let score = 0;
        if (terms.length > 0) {
          const name = f.name.toLowerCase();
          const hay = `${name} ${f.aliases.toLowerCase()}`;
          if (!terms.every((t) => hay.includes(t))) continue;
          if (name === q) score = 100;
          else if (name.startsWith(q)) score = 60;
          else if (name.includes(q)) score = 40;
          else score = 20;
          if (favs.has(f.id)) score += 5;
        }
        scored.push({ f, score });
      }
      scored.sort((a, b) => {
        if (args.sort === "kcalAsc") return a.f.kcalPer100 - b.f.kcalPer100;
        if (args.sort === "kcalDesc") return b.f.kcalPer100 - a.f.kcalPer100;
        if (args.sort === "proteinDesc")
          return b.f.proteinPer100 - a.f.proteinPer100;
        return b.score - a.score || a.f.name.localeCompare(b.f.name);
      });
      return {
        ok: true,
        error: null,
        foods: scored
          .slice(args.offset, args.offset + 60)
          .map((s) => foodPayload(s.f, favs)),
        total: scored.length,
      };
    },
  }),

  getFoodLists: defineAction({
    description:
      "Returns the signed-in user's favourite foods and recently logged foods, for the food search page.",
    request: z.object({ token: z.string().min(1).max(200) }),
    response: z.object({
      ok: z.boolean(),
      error: z.string().nullable(),
      favourites: z.array(foodShape),
      recents: z.array(foodShape),
    }),
    async handler(ctx, args) {
      const fail = { ok: false, error: "You are not signed in.", favourites: [], recents: [] };
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved) return fail;
      const userId = resolved.userId;
      await ensureFoodCatalog(db);
      const favs = await favouriteIdSet(db, userId);
      const all = await visibleFoods(db, userId);
      const byId = new Map(all.map((f) => [f.id, f]));
      const favourites: FoodPayload[] = [];
      for (const id of favs) {
        const f = byId.get(id);
        if (f) favourites.push(foodPayload(f, favs));
      }
      // Recent = distinct foods from the user's newest diary entries.
      const recentRows = await db
        .select({ foodId: schema.diaryEntries.foodId })
        .from(schema.diaryEntries)
        .where(eq(schema.diaryEntries.userId, userId))
        .orderBy(desc(schema.diaryEntries.id))
        .limit(60);
      const seen = new Set<number>();
      const recents: FoodPayload[] = [];
      for (const r of recentRows) {
        if (r.foodId == null || seen.has(r.foodId)) continue;
        seen.add(r.foodId);
        const f = byId.get(r.foodId);
        if (f) recents.push(foodPayload(f, favs));
        if (recents.length >= 10) break;
      }
      return { ok: true, error: null, favourites, recents };
    },
  }),

  toggleFavourite: defineAction({
    description:
      "Adds or removes a food from the signed-in user's favourites.",
    request: z.object({
      token: z.string().min(1).max(200),
      foodId: z.number().int().positive(),
    }),
    response: z.object({
      ok: z.boolean(),
      error: z.string().nullable(),
      isFavourite: z.boolean(),
    }),
    async handler(ctx, args) {
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in.", isFavourite: false };
      const userId = resolved.userId;
      const visible = (await visibleFoods(db, userId)).some(
        (f) => f.id === args.foodId,
      );
      if (!visible)
        return { ok: false, error: "Food not found.", isFavourite: false };
      const existing = await db
        .select()
        .from(schema.favouriteFoods)
        .where(
          and(
            eq(schema.favouriteFoods.userId, userId),
            eq(schema.favouriteFoods.foodId, args.foodId),
          ),
        )
        .limit(1);
      if (existing[0]) {
        await db
          .delete(schema.favouriteFoods)
          .where(eq(schema.favouriteFoods.id, existing[0].id));
        ctx.invalidateQueries();
        return { ok: true, error: null, isFavourite: false };
      }
      await db.insert(schema.favouriteFoods).values({
        userId,
        foodId: args.foodId,
      });
      ctx.invalidateQueries();
      return { ok: true, error: null, isFavourite: true };
    },
  }),

  createCustomFood: defineAction({
    description:
      "Creates a custom food owned by the signed-in user (marked user-submitted, visible only to them).",
    request: z.object({
      token: z.string().min(1).max(200),
      name: z.string().trim().min(2).max(80),
      category: z.string().trim().min(1).max(40),
      cuisine: z.string().trim().min(1).max(40),
      dietFlag: z.enum(["veg", "vegan", "eggetarian", "non_veg"]),
      kcalPer100: z.number().min(0).max(950),
      proteinPer100: z.number().min(0).max(100),
      carbsPer100: z.number().min(0).max(100),
      fatPer100: z.number().min(0).max(100),
      fibrePer100: z.number().min(0).max(100),
      servingName: z.string().trim().min(1).max(40),
      servingGrams: z.number().min(1).max(2000),
      notes: z.string().trim().max(300).nullable().optional(),
    }),
    response: z.object({
      ok: z.boolean(),
      error: z.string().nullable(),
      food: foodShape.nullable(),
    }),
    async handler(ctx, args) {
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in.", food: null };
      const userId = resolved.userId;
      const inserted = await db
        .insert(schema.foods)
        .values({
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
          ownerUserId: userId,
        })
        .returning();
      const food = inserted[0];
      if (!food) throw new Error("createCustomFood: insert returned no rows");
      ctx.invalidateQueries();
      return {
        ok: true,
        error: null,
        food: foodPayload(food, await favouriteIdSet(db, userId)),
      };
    },
  }),

  getDiary: defineAction({
    description:
      "Returns the signed-in user's food diary for one date: entries grouped by meal, per-meal and daily totals computed from the stored snapshots, plus their targets.",
    request: z.object({
      token: z.string().min(1).max(200),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    }),
    response: z.object({
      ok: z.boolean(),
      error: z.string().nullable(),
      date: z.string(),
      entries: z.array(entryShape),
      mealTotals: z.record(mealEnum, totalsShape),
      totals: totalsShape,
      targets: targetsShape.nullable(),
    }),
    async handler(ctx, args) {
      const zero = { kcal: 0, protein: 0, carbs: 0, fat: 0, fibre: 0 };
      const zeroMeals = {
        breakfast: zero,
        lunch: zero,
        snacks: zero,
        dinner: zero,
        custom: zero,
      };
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return {
          ok: false,
          error: "You are not signed in.",
          date: args.date,
          entries: [],
          mealTotals: zeroMeals,
          totals: zero,
          targets: null,
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
        targets: profile ? computeTargets(profile) : null,
      };
    },
  }),

  addDiaryEntry: defineAction({
    description:
      "Logs a food to the signed-in user's diary for a date and meal, storing a nutrition snapshot. A repeated clientKey returns the existing entry instead of duplicating it.",
    request: z.object({
      token: z.string().min(1).max(200),
      foodId: z.number().int().positive(),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      meal: mealEnum,
      quantityGrams: z.number().min(1).max(5000),
      servings: z.number().min(0.01).max(50).nullable().optional(),
      clientKey: z.string().min(8).max(80),
    }),
    response: z.object({
      ok: z.boolean(),
      error: z.string().nullable(),
      entry: entryShape.nullable(),
      duplicate: z.boolean(),
    }),
    async handler(ctx, args) {
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return {
          ok: false,
          error: "You are not signed in.",
          entry: null,
          duplicate: false,
        };
      const userId = resolved.userId;
      // Duplicate-submission protection: same key → same entry.
      const dup = await db
        .select()
        .from(schema.diaryEntries)
        .where(
          and(
            eq(schema.diaryEntries.userId, userId),
            eq(schema.diaryEntries.clientKey, args.clientKey),
          ),
        )
        .limit(1);
      if (dup[0])
        return { ok: true, error: null, entry: entryPayload(dup[0]), duplicate: true };
      const foodRows = await db
        .select()
        .from(schema.foods)
        .where(eq(schema.foods.id, args.foodId))
        .limit(1);
      const food = foodRows[0];
      if (!food || (food.ownerUserId != null && food.ownerUserId !== userId))
        return { ok: false, error: "Food not found.", entry: null, duplicate: false };
      const inserted = await db
        .insert(schema.diaryEntries)
        .values({
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
          clientKey: args.clientKey,
        })
        .returning();
      const row = inserted[0];
      if (!row) throw new Error("addDiaryEntry: insert returned no rows");
      ctx.invalidateQueries();
      return { ok: true, error: null, entry: entryPayload(row), duplicate: false };
    },
  }),

  updateDiaryEntry: defineAction({
    description:
      "Changes the quantity of one of the signed-in user's diary entries; nutrition is recomputed from the stored snapshot.",
    request: z.object({
      token: z.string().min(1).max(200),
      entryId: z.number().int().positive(),
      quantityGrams: z.number().min(1).max(5000),
    }),
    response: okResponse,
    async handler(ctx, args): Promise<z.infer<typeof okResponse>> {
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const rows = await db
        .select()
        .from(schema.diaryEntries)
        .where(
          and(
            eq(schema.diaryEntries.id, args.entryId),
            eq(schema.diaryEntries.userId, resolved.userId),
          ),
        )
        .limit(1);
      const row = rows[0];
      if (!row) return { ok: false, error: "Entry not found." };
      await db
        .update(schema.diaryEntries)
        .set({
          quantityGrams: args.quantityGrams,
          servings:
            Math.round((args.quantityGrams / row.servingGrams) * 100) / 100,
        })
        .where(eq(schema.diaryEntries.id, row.id));
      ctx.invalidateQueries();
      return { ok: true, error: null };
    },
  }),

  deleteDiaryEntry: defineAction({
    description: "Deletes one of the signed-in user's own diary entries.",
    request: z.object({
      token: z.string().min(1).max(200),
      entryId: z.number().int().positive(),
    }),
    response: okResponse,
    async handler(ctx, args): Promise<z.infer<typeof okResponse>> {
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const rows = await db
        .select({ id: schema.diaryEntries.id })
        .from(schema.diaryEntries)
        .where(
          and(
            eq(schema.diaryEntries.id, args.entryId),
            eq(schema.diaryEntries.userId, resolved.userId),
          ),
        )
        .limit(1);
      if (!rows[0]) return { ok: false, error: "Entry not found." };
      await db
        .delete(schema.diaryEntries)
        .where(eq(schema.diaryEntries.id, rows[0].id));
      ctx.invalidateQueries();
      return { ok: true, error: null };
    },
  }),

  copyPreviousDay: defineAction({
    description:
      "Copies all of the signed-in user's diary entries from the previous day into the given date (skips if that date already has entries).",
    request: z.object({
      token: z.string().min(1).max(200),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    }),
    response: z.object({
      ok: z.boolean(),
      error: z.string().nullable(),
      copied: z.number(),
    }),
    async handler(ctx, args) {
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in.", copied: 0 };
      const userId = resolved.userId;
      const target = await diaryForDate(db, userId, args.date);
      if (target.length > 0)
        return {
          ok: false,
          error: "This day already has entries — copying would duplicate them.",
          copied: 0,
        };
      const prev = new Date(`${args.date}T00:00:00Z`);
      prev.setUTCDate(prev.getUTCDate() - 1);
      const prevDate = prev.toISOString().slice(0, 10);
      const source = await db
        .select()
        .from(schema.diaryEntries)
        .where(
          and(
            eq(schema.diaryEntries.userId, userId),
            eq(schema.diaryEntries.loggedOn, prevDate),
          ),
        )
        .orderBy(asc(schema.diaryEntries.id));
      if (source.length === 0)
        return {
          ok: false,
          error: "Nothing was logged yesterday to copy.",
          copied: 0,
        };
      await db.insert(schema.diaryEntries).values(
        source.map((e) => ({
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
          clientKey: null,
        })),
      );
      ctx.invalidateQueries();
      return { ok: true, error: null, copied: source.length };
    },
  }),

  searchExercises: defineAction({
    description:
      "Searches the shared exercise library by name, with optional muscle group, equipment and difficulty filters.",
    request: z.object({
      token: z.string().min(1).max(200),
      query: z.string().trim().max(80).default(""),
      muscleGroup: z.string().max(40).optional(),
      equipment: z.string().max(40).optional(),
      difficulty: z
        .enum(["beginner", "intermediate", "advanced"])
        .optional(),
      // Phase 5 performance: paged results (40 per page) + total.
      offset: z.number().int().min(0).max(100000).default(0),
    }),
    response: z.object({
      ok: z.boolean(),
      error: z.string().nullable(),
      exercises: z.array(exerciseShape),
      total: z.number(),
    }),
    async handler(ctx, args) {
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in.", exercises: [], total: 0 };
      await ensureExerciseLibrary(db);
      const all = await db
        .select()
        .from(schema.exercises)
        .orderBy(asc(schema.exercises.name));
      const q = args.query.toLowerCase();
      const terms = q.split(/\s+/).filter(Boolean);
      const filtered = all.filter((e) => {
        if (args.muscleGroup && e.primaryMuscle !== args.muscleGroup)
          return false;
        if (args.equipment && e.equipment !== args.equipment) return false;
        if (args.difficulty && e.difficulty !== args.difficulty)
          return false;
        if (terms.length > 0) {
          const hay =
            `${e.name} ${e.primaryMuscle} ${e.secondaryMuscles}`.toLowerCase();
          if (!terms.every((t) => hay.includes(t))) return false;
        }
        return true;
      });
      return {
        ok: true,
        error: null,
        exercises: filtered
          .slice(args.offset, args.offset + 40)
          .map(exercisePayload),
        total: filtered.length,
      };
    },
  }),

  getWorkoutTemplates: defineAction({
    description:
      "Returns the built-in workout templates (PPL, Upper/Lower, Full Body, Bro Split, Home) with their exercises resolved from the library.",
    request: z.object({ token: z.string().min(1).max(200) }),
    response: z.object({
      ok: z.boolean(),
      error: z.string().nullable(),
      templates: z.array(
        z.object({
          key: z.string(),
          name: z.string(),
          group: z.string(),
          focus: z.string(),
          exercises: z.array(
            z.object({
              name: z.string(),
              sets: z.number(),
              reps: z.string(),
              restSeconds: z.number(),
            }),
          ),
        }),
      ),
    }),
    async handler(ctx, args) {
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in.", templates: [] };
      await ensureExerciseLibrary(db);
      return { ok: true, error: null, templates: WORKOUT_TEMPLATES };
    },
  }),

  copyTemplate: defineAction({
    description:
      "Copies a built-in workout template into a new routine owned by the signed-in user, which they can then edit freely.",
    request: z.object({
      token: z.string().min(1).max(200),
      templateKey: z.string().min(1).max(60),
    }),
    response: z.object({
      ok: z.boolean(),
      error: z.string().nullable(),
      routineId: z.number().nullable(),
    }),
    async handler(ctx, args) {
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in.", routineId: null };
      const template = WORKOUT_TEMPLATES.find((t) => t.key === args.templateKey);
      if (!template)
        return { ok: false, error: "Template not found.", routineId: null };
      await ensureExerciseLibrary(db);
      const now = new Date();
      const inserted = await db
        .insert(schema.routines)
        .values({
          userId: resolved.userId,
          name: template.name,
          notes: template.focus,
          sourceTemplate: template.key,
          createdAt: now,
          updatedAt: now,
        })
        .returning({ id: schema.routines.id });
      const routine = inserted[0];
      if (!routine) throw new Error("copyTemplate: insert returned no rows");
      let position = 0;
      for (const te of template.exercises) {
        const ex = await exerciseByName(db, te.name);
        if (!ex) continue;
        position += 1;
        await db.insert(schema.routineExercises).values({
          routineId: routine.id,
          exerciseId: ex.id,
          position,
          targetSets: te.sets,
          targetReps: te.reps,
          restSeconds: te.restSeconds,
        });
      }
      ctx.invalidateQueries();
      return { ok: true, error: null, routineId: routine.id };
    },
  }),

  getRoutines: defineAction({
    description:
      "Lists the signed-in user's own workout routines with exercise counts.",
    request: z.object({ token: z.string().min(1).max(200) }),
    response: z.object({
      ok: z.boolean(),
      error: z.string().nullable(),
      routines: z.array(routineShape),
    }),
    async handler(ctx, args) {
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in.", routines: [] };
      const rows = await db
        .select()
        .from(schema.routines)
        .where(eq(schema.routines.userId, resolved.userId))
        .orderBy(desc(schema.routines.updatedAt));
      const routines: z.infer<typeof routineShape>[] = [];
      for (const r of rows) {
        const exs = await db
          .select({ id: schema.routineExercises.id })
          .from(schema.routineExercises)
          .where(eq(schema.routineExercises.routineId, r.id));
        routines.push({
          id: r.id,
          name: r.name,
          notes: r.notes,
          sourceTemplate: r.sourceTemplate,
          exerciseCount: exs.length,
        });
      }
      return { ok: true, error: null, routines };
    },
  }),

  createRoutine: defineAction({
    description: "Creates a new empty routine owned by the signed-in user.",
    request: z.object({
      token: z.string().min(1).max(200),
      name: z.string().trim().min(1).max(80),
      notes: z.string().trim().max(300).nullable().optional(),
    }),
    response: z.object({
      ok: z.boolean(),
      error: z.string().nullable(),
      routineId: z.number().nullable(),
    }),
    async handler(ctx, args) {
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in.", routineId: null };
      const now = new Date();
      const inserted = await db
        .insert(schema.routines)
        .values({
          userId: resolved.userId,
          name: args.name,
          notes: args.notes ?? null,
          createdAt: now,
          updatedAt: now,
        })
        .returning({ id: schema.routines.id });
      const routine = inserted[0];
      if (!routine) throw new Error("createRoutine: insert returned no rows");
      ctx.invalidateQueries();
      return { ok: true, error: null, routineId: routine.id };
    },
  }),

  getRoutine: defineAction({
    description:
      "Returns one of the signed-in user's routines with its exercises in order.",
    request: z.object({
      token: z.string().min(1).max(200),
      routineId: z.number().int().positive(),
    }),
    response: z.object({
      ok: z.boolean(),
      error: z.string().nullable(),
      routine: routineShape
        .extend({ exercises: z.array(routineExerciseShape) })
        .nullable(),
    }),
    async handler(ctx, args) {
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in.", routine: null };
      const routine = await ownRoutine(db, resolved.userId, args.routineId);
      if (!routine)
        return { ok: false, error: "Routine not found.", routine: null };
      const rows = await db
        .select()
        .from(schema.routineExercises)
        .where(eq(schema.routineExercises.routineId, routine.id))
        .orderBy(
          asc(schema.routineExercises.position),
          asc(schema.routineExercises.id),
        );
      const exercises: z.infer<typeof routineExerciseShape>[] = [];
      for (const r of rows) {
        const exRows = await db
          .select()
          .from(schema.exercises)
          .where(eq(schema.exercises.id, r.exerciseId))
          .limit(1);
        const e = exRows[0];
        if (!e) continue;
        exercises.push({
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
          notes: r.notes,
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
          exerciseCount: exercises.length,
          exercises,
        },
      };
    },
  }),

  updateRoutine: defineAction({
    description: "Renames one of the signed-in user's routines or edits its notes.",
    request: z.object({
      token: z.string().min(1).max(200),
      routineId: z.number().int().positive(),
      name: z.string().trim().min(1).max(80).optional(),
      notes: z.string().trim().max(300).nullable().optional(),
    }),
    response: okResponse,
    async handler(ctx, args): Promise<z.infer<typeof okResponse>> {
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const routine = await ownRoutine(db, resolved.userId, args.routineId);
      if (!routine) return { ok: false, error: "Routine not found." };
      const patch: Partial<typeof schema.routines.$inferInsert> = {
        updatedAt: new Date(),
      };
      if (args.name !== undefined) patch.name = args.name;
      if (args.notes !== undefined) patch.notes = args.notes;
      await db
        .update(schema.routines)
        .set(patch)
        .where(eq(schema.routines.id, routine.id));
      ctx.invalidateQueries();
      return { ok: true, error: null };
    },
  }),

  deleteRoutine: defineAction({
    description:
      "Deletes one of the signed-in user's routines and its exercise list. Past workout history is kept (it snapshots the session).",
    request: z.object({
      token: z.string().min(1).max(200),
      routineId: z.number().int().positive(),
    }),
    response: okResponse,
    async handler(ctx, args): Promise<z.infer<typeof okResponse>> {
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const routine = await ownRoutine(db, resolved.userId, args.routineId);
      if (!routine) return { ok: false, error: "Routine not found." };
      await db
        .update(schema.workoutSessions)
        .set({ routineId: null })
        .where(eq(schema.workoutSessions.routineId, routine.id));
      await db
        .delete(schema.routineExercises)
        .where(eq(schema.routineExercises.routineId, routine.id));
      await db
        .delete(schema.routines)
        .where(eq(schema.routines.id, routine.id));
      ctx.invalidateQueries();
      return { ok: true, error: null };
    },
  }),

  duplicateRoutine: defineAction({
    description:
      "Duplicates one of the signed-in user's routines, including its full exercise list.",
    request: z.object({
      token: z.string().min(1).max(200),
      routineId: z.number().int().positive(),
    }),
    response: z.object({
      ok: z.boolean(),
      error: z.string().nullable(),
      routineId: z.number().nullable(),
    }),
    async handler(ctx, args) {
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in.", routineId: null };
      const routine = await ownRoutine(db, resolved.userId, args.routineId);
      if (!routine)
        return { ok: false, error: "Routine not found.", routineId: null };
      const now = new Date();
      const inserted = await db
        .insert(schema.routines)
        .values({
          userId: resolved.userId,
          name: `${routine.name} copy`,
          notes: routine.notes,
          sourceTemplate: routine.sourceTemplate,
          createdAt: now,
          updatedAt: now,
        })
        .returning({ id: schema.routines.id });
      const copy = inserted[0];
      if (!copy) throw new Error("duplicateRoutine: insert returned no rows");
      const rows = await db
        .select()
        .from(schema.routineExercises)
        .where(eq(schema.routineExercises.routineId, routine.id))
        .orderBy(asc(schema.routineExercises.position));
      for (const r of rows) {
        await db.insert(schema.routineExercises).values({
          routineId: copy.id,
          exerciseId: r.exerciseId,
          position: r.position,
          targetSets: r.targetSets,
          targetReps: r.targetReps,
          restSeconds: r.restSeconds,
          notes: r.notes,
        });
      }
      ctx.invalidateQueries();
      return { ok: true, error: null, routineId: copy.id };
    },
  }),

  addRoutineExercise: defineAction({
    description:
      "Adds a library exercise to the end of one of the signed-in user's routines, using the library's suggested sets/reps/rest as defaults.",
    request: z.object({
      token: z.string().min(1).max(200),
      routineId: z.number().int().positive(),
      exerciseId: z.number().int().positive(),
    }),
    response: okResponse,
    async handler(ctx, args): Promise<z.infer<typeof okResponse>> {
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const routine = await ownRoutine(db, resolved.userId, args.routineId);
      if (!routine) return { ok: false, error: "Routine not found." };
      await ensureExerciseLibrary(db);
      const exRows = await db
        .select()
        .from(schema.exercises)
        .where(eq(schema.exercises.id, args.exerciseId))
        .limit(1);
      const ex = exRows[0];
      if (!ex) return { ok: false, error: "Exercise not found." };
      const existing = await db
        .select({ position: schema.routineExercises.position })
        .from(schema.routineExercises)
        .where(eq(schema.routineExercises.routineId, routine.id))
        .orderBy(desc(schema.routineExercises.position))
        .limit(1);
      await db.insert(schema.routineExercises).values({
        routineId: routine.id,
        exerciseId: ex.id,
        position: (existing[0]?.position ?? 0) + 1,
        targetSets: ex.suggestedSets,
        targetReps: ex.suggestedReps,
        restSeconds: ex.restSeconds,
      });
      await db
        .update(schema.routines)
        .set({ updatedAt: new Date() })
        .where(eq(schema.routines.id, routine.id));
      ctx.invalidateQueries();
      return { ok: true, error: null };
    },
  }),

  updateRoutineExercise: defineAction({
    description:
      "Edits the target sets, reps and rest of one exercise inside the signed-in user's routine.",
    request: z.object({
      token: z.string().min(1).max(200),
      routineExerciseId: z.number().int().positive(),
      targetSets: z.number().int().min(1).max(20),
      targetReps: z.string().trim().min(1).max(30),
      restSeconds: z.number().int().min(0).max(900),
    }),
    response: okResponse,
    async handler(ctx, args): Promise<z.infer<typeof okResponse>> {
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const rows = await db
        .select()
        .from(schema.routineExercises)
        .where(eq(schema.routineExercises.id, args.routineExerciseId))
        .limit(1);
      const row = rows[0];
      if (!row) return { ok: false, error: "Entry not found." };
      const routine = await ownRoutine(db, resolved.userId, row.routineId);
      if (!routine) return { ok: false, error: "Entry not found." };
      await db
        .update(schema.routineExercises)
        .set({
          targetSets: args.targetSets,
          targetReps: args.targetReps,
          restSeconds: args.restSeconds,
        })
        .where(eq(schema.routineExercises.id, row.id));
      ctx.invalidateQueries();
      return { ok: true, error: null };
    },
  }),

  removeRoutineExercise: defineAction({
    description:
      "Removes one exercise from the signed-in user's routine and closes the position gap.",
    request: z.object({
      token: z.string().min(1).max(200),
      routineExerciseId: z.number().int().positive(),
    }),
    response: okResponse,
    async handler(ctx, args): Promise<z.infer<typeof okResponse>> {
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const rows = await db
        .select()
        .from(schema.routineExercises)
        .where(eq(schema.routineExercises.id, args.routineExerciseId))
        .limit(1);
      const row = rows[0];
      if (!row) return { ok: false, error: "Entry not found." };
      const routine = await ownRoutine(db, resolved.userId, row.routineId);
      if (!routine) return { ok: false, error: "Entry not found." };
      await db
        .delete(schema.routineExercises)
        .where(eq(schema.routineExercises.id, row.id));
      const rest = await db
        .select()
        .from(schema.routineExercises)
        .where(eq(schema.routineExercises.routineId, routine.id))
        .orderBy(
          asc(schema.routineExercises.position),
          asc(schema.routineExercises.id),
        );
      let pos = 0;
      for (const r of rest) {
        pos += 1;
        if (r.position !== pos) {
          await db
            .update(schema.routineExercises)
            .set({ position: pos })
            .where(eq(schema.routineExercises.id, r.id));
        }
      }
      ctx.invalidateQueries();
      return { ok: true, error: null };
    },
  }),

  moveRoutineExercise: defineAction({
    description:
      "Moves one exercise up or down within the signed-in user's routine.",
    request: z.object({
      token: z.string().min(1).max(200),
      routineExerciseId: z.number().int().positive(),
      direction: z.enum(["up", "down"]),
    }),
    response: okResponse,
    async handler(ctx, args): Promise<z.infer<typeof okResponse>> {
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const rows = await db
        .select()
        .from(schema.routineExercises)
        .where(eq(schema.routineExercises.id, args.routineExerciseId))
        .limit(1);
      const row = rows[0];
      if (!row) return { ok: false, error: "Entry not found." };
      const routine = await ownRoutine(db, resolved.userId, row.routineId);
      if (!routine) return { ok: false, error: "Entry not found." };
      const all = await db
        .select()
        .from(schema.routineExercises)
        .where(eq(schema.routineExercises.routineId, routine.id))
        .orderBy(
          asc(schema.routineExercises.position),
          asc(schema.routineExercises.id),
        );
      const idx = all.findIndex((r) => r.id === row.id);
      const swapIdx = args.direction === "up" ? idx - 1 : idx + 1;
      if (idx < 0 || swapIdx < 0 || swapIdx >= all.length)
        return { ok: true, error: null };
      const other = all[swapIdx];
      if (!other) return { ok: true, error: null };
      await db
        .update(schema.routineExercises)
        .set({ position: other.position })
        .where(eq(schema.routineExercises.id, row.id));
      await db
        .update(schema.routineExercises)
        .set({ position: row.position })
        .where(eq(schema.routineExercises.id, other.id));
      ctx.invalidateQueries();
      return { ok: true, error: null };
    },
  }),

  startSession: defineAction({
    description:
      "Starts a live workout session from one of the user's routines or blank. If a session is already in progress it is returned instead (resume), never duplicated.",
    request: z.object({
      token: z.string().min(1).max(200),
      routineId: z.number().int().positive().nullable().optional(),
      title: z.string().trim().min(1).max(80).optional(),
      today: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    }),
    response: z.object({
      ok: z.boolean(),
      error: z.string().nullable(),
      session: sessionShape.nullable(),
      resumed: z.boolean(),
    }),
    async handler(ctx, args) {
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return {
          ok: false,
          error: "You are not signed in.",
          session: null,
          resumed: false,
        };
      const userId = resolved.userId;
      const active = await db
        .select()
        .from(schema.workoutSessions)
        .where(
          and(
            eq(schema.workoutSessions.userId, userId),
            eq(schema.workoutSessions.status, "in_progress"),
          ),
        )
        .orderBy(desc(schema.workoutSessions.id))
        .limit(1);
      if (active[0]) {
        return {
          ok: true,
          error: null,
          session: await sessionPayload(db, active[0]),
          resumed: true,
        };
      }
      let routine: typeof schema.routines.$inferSelect | null = null;
      if (args.routineId != null) {
        routine = await ownRoutine(db, userId, args.routineId);
        if (!routine)
          return {
            ok: false,
            error: "Routine not found.",
            session: null,
            resumed: false,
          };
      }
      const now = new Date();
      const inserted = await db
        .insert(schema.workoutSessions)
        .values({
          userId,
          routineId: routine ? routine.id : null,
          title: args.title ?? routine?.name ?? "Workout",
          status: "in_progress",
          startedOn: args.today,
          startedAt: now,
          createdAt: now,
        })
        .returning();
      const session = inserted[0];
      if (!session) throw new Error("startSession: insert returned no rows");
      if (routine) {
        const rows = await db
          .select()
          .from(schema.routineExercises)
          .where(eq(schema.routineExercises.routineId, routine.id))
          .orderBy(
            asc(schema.routineExercises.position),
            asc(schema.routineExercises.id),
          );
        for (const r of rows) {
          const exRows = await db
            .select()
            .from(schema.exercises)
            .where(eq(schema.exercises.id, r.exerciseId))
            .limit(1);
          const ex = exRows[0];
          if (!ex) continue;
          const seInserted = await db
            .insert(schema.sessionExercises)
            .values({
              sessionId: session.id,
              exerciseId: ex.id,
              position: r.position,
              exerciseName: ex.name,
              primaryMuscle: ex.primaryMuscle,
              kind: ex.kind,
              restSeconds: r.restSeconds,
            })
            .returning({ id: schema.sessionExercises.id });
          const se = seInserted[0];
          if (!se) continue;
          for (let n = 1; n <= r.targetSets; n++) {
            await db.insert(schema.workoutSets).values({
              sessionExerciseId: se.id,
              setNumber: n,
            });
          }
        }
      }
      ctx.invalidateQueries();
      return {
        ok: true,
        error: null,
        session: await sessionPayload(db, session),
        resumed: false,
      };
    },
  }),

  getActiveSession: defineAction({
    description:
      "Returns the signed-in user's in-progress workout session, if one exists, with all exercises and sets.",
    request: z.object({ token: z.string().min(1).max(200) }),
    response: z.object({
      ok: z.boolean(),
      error: z.string().nullable(),
      session: sessionShape.nullable(),
    }),
    async handler(ctx, args) {
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in.", session: null };
      const rows = await db
        .select()
        .from(schema.workoutSessions)
        .where(
          and(
            eq(schema.workoutSessions.userId, resolved.userId),
            eq(schema.workoutSessions.status, "in_progress"),
          ),
        )
        .orderBy(desc(schema.workoutSessions.id))
        .limit(1);
      const session = rows[0];
      if (!session) return { ok: true, error: null, session: null };
      return { ok: true, error: null, session: await sessionPayload(db, session) };
    },
  }),

  getWorkoutSession: defineAction({
    description:
      "Returns one of the signed-in user's workout sessions (live or completed) with exercises, sets and volume.",
    request: z.object({
      token: z.string().min(1).max(200),
      sessionId: z.number().int().positive(),
    }),
    response: z.object({
      ok: z.boolean(),
      error: z.string().nullable(),
      session: sessionShape.nullable(),
    }),
    async handler(ctx, args) {
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in.", session: null };
      const session = await ownSession(db, resolved.userId, args.sessionId);
      if (!session)
        return { ok: false, error: "Session not found.", session: null };
      return { ok: true, error: null, session: await sessionPayload(db, session) };
    },
  }),

  addSessionExercise: defineAction({
    description:
      "Adds a library exercise to the signed-in user's in-progress session.",
    request: z.object({
      token: z.string().min(1).max(200),
      sessionId: z.number().int().positive(),
      exerciseId: z.number().int().positive(),
    }),
    response: okResponse,
    async handler(ctx, args): Promise<z.infer<typeof okResponse>> {
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const session = await ownSession(db, resolved.userId, args.sessionId);
      if (!session) return { ok: false, error: "Session not found." };
      if (session.status !== "in_progress")
        return { ok: false, error: "This workout is already finished." };
      await ensureExerciseLibrary(db);
      const exRows = await db
        .select()
        .from(schema.exercises)
        .where(eq(schema.exercises.id, args.exerciseId))
        .limit(1);
      const ex = exRows[0];
      if (!ex) return { ok: false, error: "Exercise not found." };
      const existing = await db
        .select({ position: schema.sessionExercises.position })
        .from(schema.sessionExercises)
        .where(eq(schema.sessionExercises.sessionId, session.id))
        .orderBy(desc(schema.sessionExercises.position))
        .limit(1);
      const seInserted = await db
        .insert(schema.sessionExercises)
        .values({
          sessionId: session.id,
          exerciseId: ex.id,
          position: (existing[0]?.position ?? 0) + 1,
          exerciseName: ex.name,
          primaryMuscle: ex.primaryMuscle,
          kind: ex.kind,
          restSeconds: ex.restSeconds,
        })
        .returning({ id: schema.sessionExercises.id });
      const se = seInserted[0];
      if (se) {
        for (let n = 1; n <= ex.suggestedSets; n++) {
          await db.insert(schema.workoutSets).values({
            sessionExerciseId: se.id,
            setNumber: n,
          });
        }
      }
      ctx.invalidateQueries();
      return { ok: true, error: null };
    },
  }),

  removeSessionExercise: defineAction({
    description:
      "Removes an exercise (and its sets) from the signed-in user's in-progress session.",
    request: z.object({
      token: z.string().min(1).max(200),
      sessionExerciseId: z.number().int().positive(),
    }),
    response: okResponse,
    async handler(ctx, args): Promise<z.infer<typeof okResponse>> {
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const found = await ownSessionExercise(
        db,
        resolved.userId,
        args.sessionExerciseId,
      );
      if (!found) return { ok: false, error: "Exercise not found." };
      if (found.session.status !== "in_progress")
        return { ok: false, error: "This workout is already finished." };
      await db
        .delete(schema.workoutSets)
        .where(eq(schema.workoutSets.sessionExerciseId, found.ex.id));
      await db
        .delete(schema.sessionExercises)
        .where(eq(schema.sessionExercises.id, found.ex.id));
      ctx.invalidateQueries();
      return { ok: true, error: null };
    },
  }),

  skipSessionExercise: defineAction({
    description:
      "Marks an exercise in the in-progress session as skipped (or un-skips it). Skipped exercises' sets never count toward volume or records.",
    request: z.object({
      token: z.string().min(1).max(200),
      sessionExerciseId: z.number().int().positive(),
      skipped: z.boolean(),
    }),
    response: okResponse,
    async handler(ctx, args): Promise<z.infer<typeof okResponse>> {
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const found = await ownSessionExercise(
        db,
        resolved.userId,
        args.sessionExerciseId,
      );
      if (!found) return { ok: false, error: "Exercise not found." };
      if (found.session.status !== "in_progress")
        return { ok: false, error: "This workout is already finished." };
      await db
        .update(schema.sessionExercises)
        .set({ skipped: args.skipped ? 1 : 0 })
        .where(eq(schema.sessionExercises.id, found.ex.id));
      ctx.invalidateQueries();
      return { ok: true, error: null };
    },
  }),

  substituteExercise: defineAction({
    description:
      "Substitutes an exercise in the in-progress session: the original is marked skipped (its sets stay in the record but stop counting) and the replacement is inserted right after it with fresh sets.",
    request: z.object({
      token: z.string().min(1).max(200),
      sessionExerciseId: z.number().int().positive(),
      newExerciseId: z.number().int().positive(),
    }),
    response: okResponse,
    async handler(ctx, args): Promise<z.infer<typeof okResponse>> {
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const found = await ownSessionExercise(
        db,
        resolved.userId,
        args.sessionExerciseId,
      );
      if (!found) return { ok: false, error: "Exercise not found." };
      if (found.session.status !== "in_progress")
        return { ok: false, error: "This workout is already finished." };
      await ensureExerciseLibrary(db);
      const exRows = await db
        .select()
        .from(schema.exercises)
        .where(eq(schema.exercises.id, args.newExerciseId))
        .limit(1);
      const ex = exRows[0];
      if (!ex) return { ok: false, error: "Exercise not found." };
      const orig = found.ex;
      // Shift later exercises down one slot, then place the substitute
      // immediately after the (now skipped) original.
      const later = await db
        .select()
        .from(schema.sessionExercises)
        .where(eq(schema.sessionExercises.sessionId, found.session.id))
        .orderBy(desc(schema.sessionExercises.position));
      for (const e of later) {
        if (e.position > orig.position) {
          await db
            .update(schema.sessionExercises)
            .set({ position: e.position + 1 })
            .where(eq(schema.sessionExercises.id, e.id));
        }
      }
      await db
        .update(schema.sessionExercises)
        .set({ skipped: 1 })
        .where(eq(schema.sessionExercises.id, orig.id));
      const seInserted = await db
        .insert(schema.sessionExercises)
        .values({
          sessionId: found.session.id,
          exerciseId: ex.id,
          position: orig.position + 1,
          exerciseName: ex.name,
          primaryMuscle: ex.primaryMuscle,
          kind: ex.kind,
          restSeconds: ex.restSeconds,
        })
        .returning({ id: schema.sessionExercises.id });
      const se = seInserted[0];
      if (se) {
        for (let n = 1; n <= ex.suggestedSets; n++) {
          await db.insert(schema.workoutSets).values({
            sessionExerciseId: se.id,
            setNumber: n,
          });
        }
      }
      ctx.invalidateQueries();
      return { ok: true, error: null };
    },
  }),

  addSet: defineAction({
    description:
      "Adds an empty set to an exercise in the signed-in user's in-progress session.",
    request: z.object({
      token: z.string().min(1).max(200),
      sessionExerciseId: z.number().int().positive(),
    }),
    response: z.object({
      ok: z.boolean(),
      error: z.string().nullable(),
      set: setShape.nullable(),
    }),
    async handler(ctx, args) {
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in.", set: null };
      const found = await ownSessionExercise(
        db,
        resolved.userId,
        args.sessionExerciseId,
      );
      if (!found)
        return { ok: false, error: "Exercise not found.", set: null };
      if (found.session.status !== "in_progress")
        return {
          ok: false,
          error: "This workout is already finished.",
          set: null,
        };
      const existing = await db
        .select({ setNumber: schema.workoutSets.setNumber })
        .from(schema.workoutSets)
        .where(eq(schema.workoutSets.sessionExerciseId, found.ex.id))
        .orderBy(desc(schema.workoutSets.setNumber))
        .limit(1);
      const inserted = await db
        .insert(schema.workoutSets)
        .values({
          sessionExerciseId: found.ex.id,
          setNumber: (existing[0]?.setNumber ?? 0) + 1,
        })
        .returning();
      const row = inserted[0];
      if (!row) throw new Error("addSet: insert returned no rows");
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
          completed: row.completed === 1,
        },
      };
    },
  }),

  updateSet: defineAction({
    description:
      "Edits one set in the signed-in user's in-progress session: reps, load (kg), duration, or completed state.",
    request: z.object({
      token: z.string().min(1).max(200),
      setId: z.number().int().positive(),
      reps: z.number().int().min(0).max(1000).nullable().optional(),
      loadKg: z.number().min(0).max(1000).nullable().optional(),
      durationSeconds: z.number().int().min(0).max(7200).nullable().optional(),
      completed: z.boolean().optional(),
    }),
    response: okResponse,
    async handler(ctx, args): Promise<z.infer<typeof okResponse>> {
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const found = await ownSet(db, resolved.userId, args.setId);
      if (!found) return { ok: false, error: "Set not found." };
      if (found.session.status !== "in_progress")
        return { ok: false, error: "This workout is already finished." };
      const patch: Partial<typeof schema.workoutSets.$inferInsert> = {};
      if (args.reps !== undefined) patch.reps = args.reps;
      if (args.loadKg !== undefined) patch.loadKg = args.loadKg;
      if (args.durationSeconds !== undefined)
        patch.durationSeconds = args.durationSeconds;
      if (args.completed !== undefined)
        patch.completed = args.completed ? 1 : 0;
      await db
        .update(schema.workoutSets)
        .set(patch)
        .where(eq(schema.workoutSets.id, found.set.id));
      ctx.invalidateQueries();
      return { ok: true, error: null };
    },
  }),

  deleteSet: defineAction({
    description:
      "Deletes one set from the signed-in user's in-progress session and renumbers the rest.",
    request: z.object({
      token: z.string().min(1).max(200),
      setId: z.number().int().positive(),
    }),
    response: okResponse,
    async handler(ctx, args): Promise<z.infer<typeof okResponse>> {
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const found = await ownSet(db, resolved.userId, args.setId);
      if (!found) return { ok: false, error: "Set not found." };
      if (found.session.status !== "in_progress")
        return { ok: false, error: "This workout is already finished." };
      await db
        .delete(schema.workoutSets)
        .where(eq(schema.workoutSets.id, found.set.id));
      const rest = await db
        .select()
        .from(schema.workoutSets)
        .where(
          eq(schema.workoutSets.sessionExerciseId, found.set.sessionExerciseId),
        )
        .orderBy(asc(schema.workoutSets.setNumber), asc(schema.workoutSets.id));
      let n = 0;
      for (const s of rest) {
        n += 1;
        if (s.setNumber !== n) {
          await db
            .update(schema.workoutSets)
            .set({ setNumber: n })
            .where(eq(schema.workoutSets.id, s.id));
        }
      }
      ctx.invalidateQueries();
      return { ok: true, error: null };
    },
  }),

  setSessionNotes: defineAction({
    description: "Saves notes on one of the signed-in user's workout sessions.",
    request: z.object({
      token: z.string().min(1).max(200),
      sessionId: z.number().int().positive(),
      notes: z.string().trim().max(1000).nullable(),
    }),
    response: okResponse,
    async handler(ctx, args): Promise<z.infer<typeof okResponse>> {
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const session = await ownSession(db, resolved.userId, args.sessionId);
      if (!session) return { ok: false, error: "Session not found." };
      await db
        .update(schema.workoutSessions)
        .set({ notes: args.notes })
        .where(eq(schema.workoutSessions.id, session.id));
      ctx.invalidateQueries();
      return { ok: true, error: null };
    },
  }),

  finishSession: defineAction({
    description:
      "Finishes the signed-in user's in-progress session: marks it completed, stamps the end time and duration, and saves it to history.",
    request: z.object({
      token: z.string().min(1).max(200),
      sessionId: z.number().int().positive(),
      notes: z.string().trim().max(1000).nullable().optional(),
    }),
    response: z.object({
      ok: z.boolean(),
      error: z.string().nullable(),
      session: sessionShape.nullable(),
    }),
    async handler(ctx, args) {
      const db = ctx.db<typeof schema>();
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
          session: null,
        };
      const now = new Date();
      const durationSeconds = Math.max(
        0,
        Math.round((now.getTime() - session.startedAt.getTime()) / 1000),
      );
      await db
        .update(schema.workoutSessions)
        .set({
          status: "completed",
          endedAt: now,
          durationSeconds,
          notes: args.notes !== undefined ? args.notes : session.notes,
        })
        .where(eq(schema.workoutSessions.id, session.id));
      ctx.invalidateQueries();
      const updated = await ownSession(db, resolved.userId, session.id);
      return {
        ok: true,
        error: null,
        session: updated ? await sessionPayload(db, updated) : null,
      };
    },
  }),

  discardSession: defineAction({
    description:
      "Discards the signed-in user's in-progress session and all its sets. It never reaches history.",
    request: z.object({
      token: z.string().min(1).max(200),
      sessionId: z.number().int().positive(),
    }),
    response: okResponse,
    async handler(ctx, args): Promise<z.infer<typeof okResponse>> {
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const session = await ownSession(db, resolved.userId, args.sessionId);
      if (!session) return { ok: false, error: "Session not found." };
      if (session.status !== "in_progress")
        return { ok: false, error: "A finished workout can't be discarded." };
      const exRows = await db
        .select({ id: schema.sessionExercises.id })
        .from(schema.sessionExercises)
        .where(eq(schema.sessionExercises.sessionId, session.id));
      for (const ex of exRows) {
        await db
          .delete(schema.workoutSets)
          .where(eq(schema.workoutSets.sessionExerciseId, ex.id));
      }
      await db
        .delete(schema.sessionExercises)
        .where(eq(schema.sessionExercises.sessionId, session.id));
      await db
        .delete(schema.workoutSessions)
        .where(eq(schema.workoutSessions.id, session.id));
      ctx.invalidateQueries();
      return { ok: true, error: null };
    },
  }),

  getWorkoutHistory: defineAction({
    description:
      "Lists the signed-in user's completed workout sessions, newest first, with exercise/set counts and total volume.",
    request: z.object({
      token: z.string().min(1).max(200),
      limit: z.number().int().min(1).max(100).default(30),
    }),
    response: z.object({
      ok: z.boolean(),
      error: z.string().nullable(),
      sessions: z.array(
        z.object({
          id: z.number(),
          title: z.string(),
          startedOn: z.string(),
          durationSeconds: z.number().nullable(),
          exerciseCount: z.number(),
          completedSets: z.number(),
          totalVolumeKg: z.number(),
          notes: z.string().nullable(),
        }),
      ),
      total: z.number(),
    }),
    async handler(ctx, args) {
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in.", sessions: [], total: 0 };
      const allIds = await db
        .select({ id: schema.workoutSessions.id })
        .from(schema.workoutSessions)
        .where(
          and(
            eq(schema.workoutSessions.userId, resolved.userId),
            eq(schema.workoutSessions.status, "completed"),
          ),
        );
      const rows = await db
        .select()
        .from(schema.workoutSessions)
        .where(
          and(
            eq(schema.workoutSessions.userId, resolved.userId),
            eq(schema.workoutSessions.status, "completed"),
          ),
        )
        .orderBy(desc(schema.workoutSessions.startedAt))
        .limit(args.limit);
      const sessions = [];
      for (const s of rows) {
        const p = await sessionPayload(db, s);
        sessions.push({
          id: s.id,
          title: s.title,
          startedOn: s.startedOn,
          durationSeconds: s.durationSeconds,
          exerciseCount: p.exercises.filter((e) => !e.skipped).length,
          completedSets: p.completedSets,
          totalVolumeKg: p.totalVolumeKg,
          notes: s.notes,
        });
      }
      return { ok: true, error: null, sessions, total: allIds.length };
    },
  }),

  getPersonalRecords: defineAction({
    description:
      "Computes the signed-in user's personal records from their real completed sets only: heaviest load, best estimated 1RM (Epley), best reps and longest hold per exercise.",
    request: z.object({ token: z.string().min(1).max(200) }),
    response: z.object({
      ok: z.boolean(),
      error: z.string().nullable(),
      records: z.array(prShape),
    }),
    async handler(ctx, args) {
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in.", records: [] };
      const done = await allCompletedSets(db, resolved.userId);
      return { ok: true, error: null, records: computePrs(done) };
    },
  }),

  getExerciseProgress: defineAction({
    description:
      "Returns one exercise's progression for the signed-in user: per-session best set and volume from completed workouts, plus its personal records.",
    request: z.object({
      token: z.string().min(1).max(200),
      exerciseId: z.number().int().positive(),
    }),
    response: z.object({
      ok: z.boolean(),
      error: z.string().nullable(),
      exerciseName: z.string().nullable(),
      kind: z.enum(["weighted", "bodyweight", "timed"]).nullable(),
      record: prShape.nullable(),
      sessions: z.array(
        z.object({
          date: z.string(),
          bestLoadKg: z.number().nullable(),
          bestLoadReps: z.number().nullable(),
          bestReps: z.number().nullable(),
          longestSeconds: z.number().nullable(),
          volumeKg: z.number(),
          setCount: z.number(),
        }),
      ),
    }),
    async handler(ctx, args) {
      const fail = {
        ok: false,
        error: "You are not signed in.",
        exerciseName: null,
        kind: null,
        record: null,
        sessions: [],
      };
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved) return fail;
      await ensureExerciseLibrary(db);
      const exRows = await db
        .select()
        .from(schema.exercises)
        .where(eq(schema.exercises.id, args.exerciseId))
        .limit(1);
      const ex = exRows[0];
      if (!ex) return { ...fail, error: "Exercise not found." };
      const done = (await allCompletedSets(db, resolved.userId)).filter(
        (s) => s.exerciseId === args.exerciseId,
      );
      const byDate = new Map<string, DoneSet[]>();
      for (const s of done) {
        const list = byDate.get(s.date) ?? [];
        list.push(s);
        byDate.set(s.date, list);
      }
      const sessions = [...byDate.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, sets]) => {
          let bestLoadKg: number | null = null;
          let bestLoadReps: number | null = null;
          let bestReps: number | null = null;
          let longestSeconds: number | null = null;
          let volumeKg = 0;
          for (const s of sets) {
            if (s.loadKg != null && s.loadKg > 0) {
              if (bestLoadKg == null || s.loadKg > bestLoadKg) {
                bestLoadKg = s.loadKg;
                bestLoadReps = s.reps;
              }
              if (s.reps != null) volumeKg += s.reps * s.loadKg;
            }
            if (s.reps != null && (bestReps == null || s.reps > bestReps))
              bestReps = s.reps;
            if (
              s.durationSeconds != null &&
              (longestSeconds == null || s.durationSeconds > longestSeconds)
            )
              longestSeconds = s.durationSeconds;
          }
          return {
            date,
            bestLoadKg,
            bestLoadReps,
            bestReps,
            longestSeconds,
            volumeKg: Math.round(volumeKg * 10) / 10,
            setCount: sets.length,
          };
        });
      const prs = computePrs(done);
      return {
        ok: true,
        error: null,
        exerciseName: ex.name,
        kind: ex.kind,
        record: prs[0] ?? null,
        sessions,
      };
    },
  }),

  getProgress: defineAction({
    description:
      "Returns the signed-in user's progress analytics for a time range (7/30/90/180/365 days): real weight points, daily calorie and macro series from the diary, workout frequency, personal records, hydration totals, body measurements and challenge consistency. Days with no records are returned explicitly as unlogged — nothing is interpolated.",
    request: z.object({
      token: z.string().min(1).max(200),
      today: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      days: z.number().int(),
    }),
    response: z.object({
      ok: z.boolean(),
      error: z.string().nullable(),
      rangeDays: z.number(),
      from: z.string(),
      to: z.string(),
      weights: z.array(
        z.object({ loggedOn: z.string(), weightKg: z.number() }),
      ),
      calorieDays: z.array(
        z.object({
          date: z.string(),
          logged: z.boolean(),
          kcal: z.number(),
          protein: z.number(),
          carbs: z.number(),
          fat: z.number(),
          fibre: z.number(),
        }),
      ),
      calorieTarget: z.number().nullable(),
      macroAverages: z.object({
        daysLogged: z.number(),
        kcal: z.number(),
        protein: z.number(),
        carbs: z.number(),
        fat: z.number(),
        fibre: z.number(),
      }),
      workoutDays: z.array(
        z.object({ date: z.string(), sessions: z.number() }),
      ),
      totalWorkouts: z.number(),
      workoutsPerWeek: z.number(),
      records: z.array(prShape),
      waterDays: z.array(
        z.object({ date: z.string(), totalMl: z.number() }),
      ),
      waterTargetMl: z.number(),
      measurements: z.array(
        z.object({
          id: z.number(),
          loggedOn: z.string(),
          waistCm: z.number().nullable(),
          chestCm: z.number().nullable(),
          armCm: z.number().nullable(),
          thighCm: z.number().nullable(),
          hipCm: z.number().nullable(),
          neckCm: z.number().nullable(),
        }),
      ),
      challenges: z.array(challengeSummaryShape),
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
          fibre: 0,
        },
        workoutDays: [],
        totalWorkouts: 0,
        workoutsPerWeek: 0,
        records: [],
        waterDays: [],
        waterTargetMl: WATER_SUGGESTED_ML,
        measurements: [],
        challenges: [],
      };
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved) return fail;
      const userId = resolved.userId;
      const profile = await loadProfile(db, userId);
      if (!profile) return fail;
      const rangeDays = [7, 30, 90, 180, 365].includes(args.days)
        ? args.days
        : 30;
      const to = args.today;
      const from = shiftDateStr(to, -(rangeDays - 1));
      const dates: string[] = [];
      for (let i = 0; i < rangeDays; i++) dates.push(shiftDateStr(from, i));

      const weightRows = await db
        .select()
        .from(schema.weightLogs)
        .where(eq(schema.weightLogs.userId, userId))
        .orderBy(asc(schema.weightLogs.loggedOn), asc(schema.weightLogs.id));
      const weights = weightRows
        .filter((w) => w.loggedOn >= from && w.loggedOn <= to)
        .map((w) => ({ loggedOn: w.loggedOn, weightKg: w.weightKg }));

      const diaryRows = await db
        .select()
        .from(schema.diaryEntries)
        .where(eq(schema.diaryEntries.userId, userId))
        .orderBy(asc(schema.diaryEntries.id));
      const diaryByDay = new Map<string, Totals & { count: number }>();
      for (const row of diaryRows) {
        if (row.loggedOn < from || row.loggedOn > to) continue;
        const p = entryPayload(row);
        const cur = diaryByDay.get(row.loggedOn) ?? {
          kcal: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fibre: 0,
          count: 0,
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
          fibre: d ? r1(d.fibre) : 0,
        };
      });
      const loggedDays = calorieDays.filter((d) => d.logged);
      const avg = (k: "kcal" | "protein" | "carbs" | "fat" | "fibre") =>
        loggedDays.length === 0
          ? 0
          : r1(loggedDays.reduce((s, d) => s + d[k], 0) / loggedDays.length);
      const macroAverages = {
        daysLogged: loggedDays.length,
        kcal: avg("kcal"),
        protein: avg("protein"),
        carbs: avg("carbs"),
        fat: avg("fat"),
        fibre: avg("fibre"),
      };

      const sessionRows = await db
        .select()
        .from(schema.workoutSessions)
        .where(
          and(
            eq(schema.workoutSessions.userId, userId),
            eq(schema.workoutSessions.status, "completed"),
          ),
        );
      const sessByDay = new Map<string, number>();
      for (const s of sessionRows) {
        if (s.startedOn < from || s.startedOn > to) continue;
        sessByDay.set(s.startedOn, (sessByDay.get(s.startedOn) ?? 0) + 1);
      }
      const workoutDays = dates.map((date) => ({
        date,
        sessions: sessByDay.get(date) ?? 0,
      }));
      const totalWorkouts = workoutDays.reduce((s, d) => s + d.sessions, 0);

      const waterRows = await db
        .select()
        .from(schema.waterEntries)
        .where(eq(schema.waterEntries.userId, userId));
      const waterByDay = new Map<string, number>();
      for (const w of waterRows) {
        if (w.loggedOn < from || w.loggedOn > to) continue;
        waterByDay.set(w.loggedOn, (waterByDay.get(w.loggedOn) ?? 0) + w.amountMl);
      }
      const waterDays = dates.map((date) => ({
        date,
        totalMl: waterByDay.get(date) ?? 0,
      }));
      const target = await waterTarget(db, userId);

      const measurementRows = await db
        .select()
        .from(schema.measurements)
        .where(eq(schema.measurements.userId, userId))
        .orderBy(asc(schema.measurements.loggedOn), asc(schema.measurements.id));
      const measurements = measurementRows.map((m) => ({
        id: m.id,
        loggedOn: m.loggedOn,
        waistCm: m.waistCm,
        chestCm: m.chestCm,
        armCm: m.armCm,
        thighCm: m.thighCm,
        hipCm: m.hipCm,
        neckCm: m.neckCm,
      }));

      const challengeRows = await db
        .select()
        .from(schema.challenges)
        .where(eq(schema.challenges.userId, userId))
        .orderBy(desc(schema.challenges.createdAt));
      const challenges = [];
      for (const ch of challengeRows)
        challenges.push(await challengeSummary(db, ch, to));

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
        measurements,
        challenges,
      };
    },
  }),

  logMeasurement: defineAction({
    description:
      "Saves the signed-in user's body measurements for a date (one row per date — saving again on the same date updates it). Every field is optional; at least one is required.",
    request: z.object({
      token: z.string().min(1).max(200),
      loggedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      waistCm: z.number().min(20).max(300).nullable().optional(),
      chestCm: z.number().min(20).max(300).nullable().optional(),
      armCm: z.number().min(10).max(120).nullable().optional(),
      thighCm: z.number().min(10).max(200).nullable().optional(),
      hipCm: z.number().min(20).max(300).nullable().optional(),
      neckCm: z.number().min(10).max(120).nullable().optional(),
    }),
    response: okResponse,
    async handler(ctx, args): Promise<z.infer<typeof okResponse>> {
      const db = ctx.db<typeof schema>();
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
        neckCm: args.neckCm,
      };
      if (Object.values(fields).every((v) => v == null))
        return { ok: false, error: "Enter at least one measurement." };
      const existing = await db
        .select()
        .from(schema.measurements)
        .where(
          and(
            eq(schema.measurements.userId, userId),
            eq(schema.measurements.loggedOn, args.loggedOn),
          ),
        )
        .limit(1);
      const patch: Partial<typeof fields> = {};
      for (const [k, v] of Object.entries(fields))
        if (v !== undefined) patch[k as keyof typeof fields] = v;
      if (existing[0]) {
        await db
          .update(schema.measurements)
          .set(patch)
          .where(eq(schema.measurements.id, existing[0].id));
      } else {
        await db.insert(schema.measurements).values({
          userId,
          loggedOn: args.loggedOn,
          waistCm: args.waistCm ?? null,
          chestCm: args.chestCm ?? null,
          armCm: args.armCm ?? null,
          thighCm: args.thighCm ?? null,
          hipCm: args.hipCm ?? null,
          neckCm: args.neckCm ?? null,
        });
      }
      ctx.invalidateQueries();
      return { ok: true, error: null };
    },
  }),

  deleteMeasurement: defineAction({
    description: "Deletes one of the signed-in user's own measurement rows.",
    request: z.object({
      token: z.string().min(1).max(200),
      id: z.number().int().positive(),
    }),
    response: okResponse,
    async handler(ctx, args): Promise<z.infer<typeof okResponse>> {
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const rows = await db
        .select({ id: schema.measurements.id })
        .from(schema.measurements)
        .where(
          and(
            eq(schema.measurements.id, args.id),
            eq(schema.measurements.userId, resolved.userId),
          ),
        )
        .limit(1);
      if (!rows[0]) return { ok: false, error: "Entry not found." };
      await db
        .delete(schema.measurements)
        .where(eq(schema.measurements.id, rows[0].id));
      ctx.invalidateQueries();
      return { ok: true, error: null };
    },
  }),

  getWaterDay: defineAction({
    description:
      "Returns the signed-in user's water entries for a date, the day total, their daily target (or the 2,500 ml suggestion when unset), and the last 7 days of totals ending on that date.",
    request: z.object({
      token: z.string().min(1).max(200),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    }),
    response: z.object({
      ok: z.boolean(),
      error: z.string().nullable(),
      entries: z.array(
        z.object({
          id: z.number(),
          amountMl: z.number(),
          createdAt: z.string(),
        }),
      ),
      totalMl: z.number(),
      targetMl: z.number(),
      targetIsCustom: z.boolean(),
      week: z.array(z.object({ date: z.string(), totalMl: z.number() })),
    }),
    async handler(ctx, args) {
      const fail = {
        ok: false,
        error: "You are not signed in.",
        entries: [],
        totalMl: 0,
        targetMl: WATER_SUGGESTED_ML,
        targetIsCustom: false,
        week: [],
      };
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved) return fail;
      const userId = resolved.userId;
      const rows = await db
        .select()
        .from(schema.waterEntries)
        .where(eq(schema.waterEntries.userId, userId))
        .orderBy(asc(schema.waterEntries.id));
      const entries = rows
        .filter((r) => r.loggedOn === args.date)
        .map((r) => ({
          id: r.id,
          amountMl: r.amountMl,
          createdAt: r.createdAt.toISOString(),
        }));
      const byDay = new Map<string, number>();
      for (const r of rows)
        byDay.set(r.loggedOn, (byDay.get(r.loggedOn) ?? 0) + r.amountMl);
      const week = [];
      for (let i = 6; i >= 0; i--) {
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
        week,
      };
    },
  }),

  addWater: defineAction({
    description:
      "Logs a water entry (ml) for the signed-in user on a date. A repeated clientKey returns success without duplicating the entry.",
    request: z.object({
      token: z.string().min(1).max(200),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      amountMl: z.number().int().min(10).max(3000),
      clientKey: z.string().min(8).max(80),
    }),
    response: z.object({
      ok: z.boolean(),
      error: z.string().nullable(),
      duplicate: z.boolean(),
    }),
    async handler(ctx, args) {
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in.", duplicate: false };
      const userId = resolved.userId;
      const dup = await db
        .select({ id: schema.waterEntries.id })
        .from(schema.waterEntries)
        .where(
          and(
            eq(schema.waterEntries.userId, userId),
            eq(schema.waterEntries.clientKey, args.clientKey),
          ),
        )
        .limit(1);
      if (dup[0]) return { ok: true, error: null, duplicate: true };
      await db.insert(schema.waterEntries).values({
        userId,
        loggedOn: args.date,
        amountMl: args.amountMl,
        clientKey: args.clientKey,
      });
      ctx.invalidateQueries();
      return { ok: true, error: null, duplicate: false };
    },
  }),

  updateWaterEntry: defineAction({
    description: "Changes the amount of one of the signed-in user's own water entries.",
    request: z.object({
      token: z.string().min(1).max(200),
      entryId: z.number().int().positive(),
      amountMl: z.number().int().min(10).max(3000),
    }),
    response: okResponse,
    async handler(ctx, args): Promise<z.infer<typeof okResponse>> {
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const rows = await db
        .select({ id: schema.waterEntries.id })
        .from(schema.waterEntries)
        .where(
          and(
            eq(schema.waterEntries.id, args.entryId),
            eq(schema.waterEntries.userId, resolved.userId),
          ),
        )
        .limit(1);
      if (!rows[0]) return { ok: false, error: "Entry not found." };
      await db
        .update(schema.waterEntries)
        .set({ amountMl: args.amountMl })
        .where(eq(schema.waterEntries.id, rows[0].id));
      ctx.invalidateQueries();
      return { ok: true, error: null };
    },
  }),

  deleteWaterEntry: defineAction({
    description: "Deletes one of the signed-in user's own water entries.",
    request: z.object({
      token: z.string().min(1).max(200),
      entryId: z.number().int().positive(),
    }),
    response: okResponse,
    async handler(ctx, args): Promise<z.infer<typeof okResponse>> {
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const rows = await db
        .select({ id: schema.waterEntries.id })
        .from(schema.waterEntries)
        .where(
          and(
            eq(schema.waterEntries.id, args.entryId),
            eq(schema.waterEntries.userId, resolved.userId),
          ),
        )
        .limit(1);
      if (!rows[0]) return { ok: false, error: "Entry not found." };
      await db
        .delete(schema.waterEntries)
        .where(eq(schema.waterEntries.id, rows[0].id));
      ctx.invalidateQueries();
      return { ok: true, error: null };
    },
  }),

  setWaterTarget: defineAction({
    description:
      "Sets the signed-in user's own daily water target in ml, stored in their preferences.",
    request: z.object({
      token: z.string().min(1).max(200),
      targetMl: z.number().int().min(500).max(6000),
    }),
    response: okResponse,
    async handler(ctx, args): Promise<z.infer<typeof okResponse>> {
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const userId = resolved.userId;
      const rows = await db
        .select({ userId: schema.userPreferences.userId })
        .from(schema.userPreferences)
        .where(eq(schema.userPreferences.userId, userId))
        .limit(1);
      if (rows[0]) {
        await db
          .update(schema.userPreferences)
          .set({ waterTargetMl: args.targetMl, updatedAt: new Date() })
          .where(eq(schema.userPreferences.userId, userId));
      } else {
        await db.insert(schema.userPreferences).values({
          userId,
          waterTargetMl: args.targetMl,
        });
      }
      ctx.invalidateQueries();
      return { ok: true, error: null };
    },
  }),

  searchRecipes: defineAction({
    description:
      "Searches the recipe library (shared recipes plus the signed-in user's own) by name, with category, diet, high-protein and favourites filters. Per-serving nutrition is calculated live from each recipe's catalogue ingredients.",
    request: z.object({
      token: z.string().min(1).max(200),
      query: z.string().trim().max(80).default(""),
      category: recipeCategoryEnum.optional(),
      dietFlag: z
        .enum(["veg", "vegan", "eggetarian", "non_veg"])
        .optional(),
      highProteinOnly: z.boolean().default(false),
      favouritesOnly: z.boolean().default(false),
    }),
    response: z.object({
      ok: z.boolean(),
      error: z.string().nullable(),
      recipes: z.array(recipeShape),
    }),
    async handler(ctx, args) {
      const fail = { ok: false, error: "You are not signed in.", recipes: [] };
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved) return fail;
      const userId = resolved.userId;
      await ensureRecipeLibrary(db);
      const [all, favIds] = await Promise.all([
        db
          .select()
          .from(schema.recipes)
          .where(
            or(
              isNull(schema.recipes.ownerUserId),
              eq(schema.recipes.ownerUserId, userId),
            ),
          ),
        favouriteRecipeIdSet(db, userId),
      ]);
      const q = args.query.toLowerCase();
      const out: z.infer<typeof recipeShape>[] = [];
      for (const r of all) {
        if (args.category && r.category !== args.category) continue;
        if (args.dietFlag && r.dietFlag !== args.dietFlag) continue;
        if (args.favouritesOnly && !favIds.has(r.id)) continue;
        if (q && !r.name.toLowerCase().includes(q)) continue;
        const data = await recipeData(db, r);
        const payload = recipePayload(r, data, userId, favIds);
        if (args.highProteinOnly && !payload.highProtein) continue;
        out.push(payload);
      }
      out.sort((a, b) => a.name.localeCompare(b.name));
      return { ok: true, error: null, recipes: out };
    },
  }),

  getRecipe: defineAction({
    description:
      "Returns one visible recipe in full: ingredients with their calculated nutrition contribution, steps, whole-recipe totals and per-serving values.",
    request: z.object({
      token: z.string().min(1).max(200),
      recipeId: z.number().int().positive(),
    }),
    response: z.object({
      ok: z.boolean(),
      error: z.string().nullable(),
      recipe: recipeDetailShape.nullable(),
    }),
    async handler(ctx, args) {
      const db = ctx.db<typeof schema>();
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
          steps: recipe.steps
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
          ingredients: data.ingredients.map((ing) => ({
            id: ing.id,
            foodId: ing.foodId,
            name: ing.name,
            quantityGrams: ing.quantityGrams,
            kcal: ing.computed.kcal,
            protein: ing.computed.protein,
            carbs: ing.computed.carbs,
            fat: ing.computed.fat,
            fibre: ing.computed.fibre,
          })),
          totals: data.totals,
          methodNote: RECIPE_METHOD_NOTE,
        },
      };
    },
  }),

  toggleFavouriteRecipe: defineAction({
    description: "Stars or unstars a recipe for the signed-in user.",
    request: z.object({
      token: z.string().min(1).max(200),
      recipeId: z.number().int().positive(),
    }),
    response: z.object({
      ok: z.boolean(),
      error: z.string().nullable(),
      isFavourite: z.boolean(),
    }),
    async handler(ctx, args) {
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in.", isFavourite: false };
      const userId = resolved.userId;
      await ensureRecipeLibrary(db);
      const recipe = await visibleRecipe(db, userId, args.recipeId);
      if (!recipe)
        return { ok: false, error: "Recipe not found.", isFavourite: false };
      const existing = await db
        .select({ id: schema.favouriteRecipes.id })
        .from(schema.favouriteRecipes)
        .where(
          and(
            eq(schema.favouriteRecipes.userId, userId),
            eq(schema.favouriteRecipes.recipeId, recipe.id),
          ),
        )
        .limit(1);
      if (existing[0]) {
        await db
          .delete(schema.favouriteRecipes)
          .where(eq(schema.favouriteRecipes.id, existing[0].id));
        ctx.invalidateQueries();
        return { ok: true, error: null, isFavourite: false };
      }
      await db.insert(schema.favouriteRecipes).values({
        userId,
        recipeId: recipe.id,
      });
      ctx.invalidateQueries();
      return { ok: true, error: null, isFavourite: true };
    },
  }),

  createRecipe: defineAction({
    description:
      "Creates a private recipe for the signed-in user from catalogue ingredients; its diet flag and nutrition are derived from those ingredients, exactly like the shared library.",
    request: z.object({
      token: z.string().min(1).max(200),
      name: z.string().trim().min(1).max(80),
      description: z.string().trim().max(300).default(""),
      category: recipeCategoryEnum,
      servings: z.number().min(0.5).max(50),
      prepMinutes: z.number().int().min(0).max(600),
      cookMinutes: z.number().int().min(0).max(600).nullable().optional(),
      steps: z.array(z.string().trim().min(1).max(300)).max(20),
      budget: z.boolean().default(false),
      ingredients: z
        .array(
          z.object({
            foodId: z.number().int().positive(),
            quantityGrams: z.number().min(1).max(5000),
          }),
        )
        .min(1)
        .max(30),
    }),
    response: z.object({
      ok: z.boolean(),
      error: z.string().nullable(),
      recipeId: z.number().nullable(),
    }),
    async handler(ctx, args) {
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in.", recipeId: null };
      const userId = resolved.userId;
      await ensureFoodCatalog(db);
      const foods = await visibleFoods(db, userId);
      const foodById = new Map(foods.map((f) => [f.id, f]));
      const resolvedIngs: {
        food: (typeof foods)[number];
        grams: number;
      }[] = [];
      for (const ing of args.ingredients) {
        const food = foodById.get(ing.foodId);
        if (!food)
          return {
            ok: false,
            error: "An ingredient is not available.",
            recipeId: null,
          };
        resolvedIngs.push({ food, grams: ing.quantityGrams });
      }
      const dietFlag = deriveDietFlag(resolvedIngs.map((r) => r.food.dietFlag));
      const inserted = await db
        .insert(schema.recipes)
        .values({
          name: args.name,
          description: args.description,
          category: args.category,
          dietFlag,
          servings: args.servings,
          prepMinutes: args.prepMinutes,
          cookMinutes: args.cookMinutes ?? null,
          steps: args.steps.join("\n"),
          budget: args.budget ? 1 : 0,
          ownerUserId: userId,
        })
        .returning();
      const row = inserted[0];
      if (!row) throw new Error("createRecipe: insert returned no rows");
      await db.insert(schema.recipeIngredients).values(
        resolvedIngs.map((r, i) => ({
          recipeId: row.id,
          foodId: r.food.id,
          name: r.food.name,
          quantityGrams: r.grams,
          position: i,
        })),
      );
      ctx.invalidateQueries();
      return { ok: true, error: null, recipeId: row.id };
    },
  }),

  updateRecipe: defineAction({
    description:
      "Replaces the signed-in user's own recipe (fields and full ingredient list). Shared library recipes cannot be edited.",
    request: z.object({
      token: z.string().min(1).max(200),
      recipeId: z.number().int().positive(),
      name: z.string().trim().min(1).max(80),
      description: z.string().trim().max(300).default(""),
      category: recipeCategoryEnum,
      servings: z.number().min(0.5).max(50),
      prepMinutes: z.number().int().min(0).max(600),
      cookMinutes: z.number().int().min(0).max(600).nullable().optional(),
      steps: z.array(z.string().trim().min(1).max(300)).max(20),
      budget: z.boolean().default(false),
      ingredients: z
        .array(
          z.object({
            foodId: z.number().int().positive(),
            quantityGrams: z.number().min(1).max(5000),
          }),
        )
        .min(1)
        .max(30),
    }),
    response: okResponse,
    async handler(ctx, args): Promise<z.infer<typeof okResponse>> {
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const userId = resolved.userId;
      const rows = await db
        .select()
        .from(schema.recipes)
        .where(eq(schema.recipes.id, args.recipeId))
        .limit(1);
      const recipe = rows[0];
      if (!recipe || recipe.ownerUserId !== userId)
        return { ok: false, error: "Recipe not found." };
      await ensureFoodCatalog(db);
      const foods = await visibleFoods(db, userId);
      const foodById = new Map(foods.map((f) => [f.id, f]));
      const resolvedIngs: {
        food: (typeof foods)[number];
        grams: number;
      }[] = [];
      for (const ing of args.ingredients) {
        const food = foodById.get(ing.foodId);
        if (!food)
          return { ok: false, error: "An ingredient is not available." };
        resolvedIngs.push({ food, grams: ing.quantityGrams });
      }
      const dietFlag = deriveDietFlag(resolvedIngs.map((r) => r.food.dietFlag));
      await db
        .update(schema.recipes)
        .set({
          name: args.name,
          description: args.description,
          category: args.category,
          dietFlag,
          servings: args.servings,
          prepMinutes: args.prepMinutes,
          cookMinutes: args.cookMinutes ?? null,
          steps: args.steps.join("\n"),
          budget: args.budget ? 1 : 0,
        })
        .where(eq(schema.recipes.id, recipe.id));
      await db
        .delete(schema.recipeIngredients)
        .where(eq(schema.recipeIngredients.recipeId, recipe.id));
      await db.insert(schema.recipeIngredients).values(
        resolvedIngs.map((r, i) => ({
          recipeId: recipe.id,
          foodId: r.food.id,
          name: r.food.name,
          quantityGrams: r.grams,
          position: i,
        })),
      );
      ctx.invalidateQueries();
      return { ok: true, error: null };
    },
  }),

  deleteRecipe: defineAction({
    description:
      "Deletes the signed-in user's own recipe, its ingredients, and any favourites or meal-plan entries pointing at it.",
    request: z.object({
      token: z.string().min(1).max(200),
      recipeId: z.number().int().positive(),
    }),
    response: okResponse,
    async handler(ctx, args): Promise<z.infer<typeof okResponse>> {
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const rows = await db
        .select()
        .from(schema.recipes)
        .where(eq(schema.recipes.id, args.recipeId))
        .limit(1);
      const recipe = rows[0];
      if (!recipe || recipe.ownerUserId !== resolved.userId)
        return { ok: false, error: "Recipe not found." };
      await db
        .delete(schema.recipeIngredients)
        .where(eq(schema.recipeIngredients.recipeId, recipe.id));
      await db
        .delete(schema.favouriteRecipes)
        .where(eq(schema.favouriteRecipes.recipeId, recipe.id));
      await db
        .delete(schema.mealPlanEntries)
        .where(eq(schema.mealPlanEntries.recipeId, recipe.id));
      await db
        .delete(schema.recipes)
        .where(eq(schema.recipes.id, recipe.id));
      ctx.invalidateQueries();
      return { ok: true, error: null };
    },
  }),

  addRecipeToDiary: defineAction({
    description:
      "Adds servings of a recipe to the signed-in user's food diary as a real entry: the stored snapshot is the recipe's calculated per-serving nutrition, so diary totals rise by exactly that amount. A repeated clientKey returns the existing entry.",
    request: z.object({
      token: z.string().min(1).max(200),
      recipeId: z.number().int().positive(),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      meal: mealEnum,
      servings: z.number().min(0.25).max(10),
      clientKey: z.string().min(8).max(80),
    }),
    response: z.object({
      ok: z.boolean(),
      error: z.string().nullable(),
      entry: entryShape.nullable(),
      duplicate: z.boolean(),
    }),
    async handler(ctx, args) {
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return {
          ok: false,
          error: "You are not signed in.",
          entry: null,
          duplicate: false,
        };
      const userId = resolved.userId;
      const dup = await db
        .select()
        .from(schema.diaryEntries)
        .where(
          and(
            eq(schema.diaryEntries.userId, userId),
            eq(schema.diaryEntries.clientKey, args.clientKey),
          ),
        )
        .limit(1);
      if (dup[0])
        return {
          ok: true,
          error: null,
          entry: entryPayload(dup[0]),
          duplicate: true,
        };
      await ensureRecipeLibrary(db);
      const recipe = await visibleRecipe(db, userId, args.recipeId);
      if (!recipe)
        return {
          ok: false,
          error: "Recipe not found.",
          entry: null,
          duplicate: false,
        };
      const data = await recipeData(db, recipe);
      const inserted = await db
        .insert(schema.diaryEntries)
        .values({
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
          clientKey: args.clientKey,
        })
        .returning();
      const row = inserted[0];
      if (!row) throw new Error("addRecipeToDiary: insert returned no rows");
      ctx.invalidateQueries();
      return { ok: true, error: null, entry: entryPayload(row), duplicate: false };
    },
  }),

  getMealPlan: defineAction({
    description:
      "Returns the signed-in user's weekly meal plan: recipes assigned to weekdays and meals, with each recipe's calculated per-serving calories.",
    request: z.object({ token: z.string().min(1).max(200) }),
    response: z.object({
      ok: z.boolean(),
      error: z.string().nullable(),
      entries: z.array(
        z.object({
          id: z.number(),
          weekday: z.number(),
          meal: mealEnum,
          recipeId: z.number(),
          recipeName: z.string(),
          servings: z.number(),
          kcalPerServing: z.number(),
        }),
      ),
    }),
    async handler(ctx, args) {
      const fail = { ok: false, error: "You are not signed in.", entries: [] };
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved) return fail;
      const userId = resolved.userId;
      await ensureRecipeLibrary(db);
      const rows = await db
        .select()
        .from(schema.mealPlanEntries)
        .where(eq(schema.mealPlanEntries.userId, userId))
        .orderBy(
          asc(schema.mealPlanEntries.weekday),
          asc(schema.mealPlanEntries.id),
        );
      const entries = [];
      for (const row of rows) {
        const recipe = await visibleRecipe(db, userId, row.recipeId);
        if (!recipe) continue;
        const data = await recipeData(db, recipe);
        entries.push({
          id: row.id,
          weekday: row.weekday,
          meal: row.meal,
          recipeId: row.recipeId,
          recipeName: recipe.name,
          servings: row.servings,
          kcalPerServing: data.perServing.kcal,
        });
      }
      return { ok: true, error: null, entries };
    },
  }),

  addMealPlanEntry: defineAction({
    description:
      "Assigns a recipe to a weekday and meal in the signed-in user's weekly meal plan.",
    request: z.object({
      token: z.string().min(1).max(200),
      weekday: z.number().int().min(0).max(6),
      meal: mealEnum,
      recipeId: z.number().int().positive(),
      servings: z.number().min(0.25).max(10).default(1),
    }),
    response: okResponse,
    async handler(ctx, args): Promise<z.infer<typeof okResponse>> {
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const userId = resolved.userId;
      await ensureRecipeLibrary(db);
      const recipe = await visibleRecipe(db, userId, args.recipeId);
      if (!recipe) return { ok: false, error: "Recipe not found." };
      await db.insert(schema.mealPlanEntries).values({
        userId,
        weekday: args.weekday,
        meal: args.meal,
        recipeId: recipe.id,
        servings: args.servings,
      });
      ctx.invalidateQueries();
      return { ok: true, error: null };
    },
  }),

  removeMealPlanEntry: defineAction({
    description: "Removes one entry from the signed-in user's weekly meal plan.",
    request: z.object({
      token: z.string().min(1).max(200),
      entryId: z.number().int().positive(),
    }),
    response: okResponse,
    async handler(ctx, args): Promise<z.infer<typeof okResponse>> {
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const rows = await db
        .select({ id: schema.mealPlanEntries.id })
        .from(schema.mealPlanEntries)
        .where(
          and(
            eq(schema.mealPlanEntries.id, args.entryId),
            eq(schema.mealPlanEntries.userId, resolved.userId),
          ),
        )
        .limit(1);
      if (!rows[0]) return { ok: false, error: "Entry not found." };
      await db
        .delete(schema.mealPlanEntries)
        .where(eq(schema.mealPlanEntries.id, rows[0].id));
      ctx.invalidateQueries();
      return { ok: true, error: null };
    },
  }),

  getChallenges: defineAction({
    description:
      "Lists the signed-in user's challenges with live progress: current day, percent of elapsed task-checks done, streak of fully-completed days, and today's check count. All checks are manual — nothing is auto-completed.",
    request: z.object({
      token: z.string().min(1).max(200),
      today: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    }),
    response: z.object({
      ok: z.boolean(),
      error: z.string().nullable(),
      challenges: z.array(challengeSummaryShape),
    }),
    async handler(ctx, args) {
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in.", challenges: [] };
      const rows = await db
        .select()
        .from(schema.challenges)
        .where(eq(schema.challenges.userId, resolved.userId))
        .orderBy(desc(schema.challenges.createdAt));
      const challenges = [];
      for (const ch of rows)
        challenges.push(await challengeSummary(db, ch, args.today));
      return { ok: true, error: null, challenges };
    },
  }),

  createChallenge: defineAction({
    description:
      "Starts a challenge for the signed-in user from a template (30-day Reset, 75-day Strong) or fully custom: name, length in days, start date and the daily task list the user will tick by hand.",
    request: z.object({
      token: z.string().min(1).max(200),
      name: z.string().trim().min(1).max(60),
      template: z.enum(["reset30", "strong75"]).nullable().optional(),
      totalDays: z.number().int().min(1).max(365),
      startedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      tasks: z.array(z.string().trim().min(1).max(120)).min(1).max(10),
    }),
    response: z.object({
      ok: z.boolean(),
      error: z.string().nullable(),
      challengeId: z.number().nullable(),
    }),
    async handler(ctx, args) {
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in.", challengeId: null };
      const inserted = await db
        .insert(schema.challenges)
        .values({
          userId: resolved.userId,
          name: args.name,
          template: args.template ?? null,
          totalDays: args.totalDays,
          startedOn: args.startedOn,
          status: "active",
        })
        .returning();
      const row = inserted[0];
      if (!row) throw new Error("createChallenge: insert returned no rows");
      await db.insert(schema.challengeTasks).values(
        args.tasks.map((label, i) => ({
          challengeId: row.id,
          label,
          position: i,
        })),
      );
      ctx.invalidateQueries();
      return { ok: true, error: null, challengeId: row.id };
    },
  }),

  getChallenge: defineAction({
    description:
      "Returns one of the signed-in user's challenges in detail: summary, the task list with tick state for the requested date, that date's note, and per-day completion counts for the whole challenge grid.",
    request: z.object({
      token: z.string().min(1).max(200),
      challengeId: z.number().int().positive(),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      today: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    }),
    response: z.object({
      ok: z.boolean(),
      error: z.string().nullable(),
      challenge: challengeSummaryShape.nullable(),
      tasks: z.array(
        z.object({ id: z.number(), label: z.string(), done: z.boolean() }),
      ),
      note: z.string(),
      days: z.array(
        z.object({
          date: z.string(),
          dayNumber: z.number(),
          doneCount: z.number(),
        }),
      ),
    }),
    async handler(ctx, args) {
      const fail = {
        ok: false,
        error: "You are not signed in.",
        challenge: null,
        tasks: [],
        note: "",
        days: [],
      };
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved) return fail;
      const ch = await ownChallenge(db, resolved.userId, args.challengeId);
      if (!ch) return { ...fail, error: "Challenge not found." };
      const taskRows = await db
        .select()
        .from(schema.challengeTasks)
        .where(eq(schema.challengeTasks.challengeId, ch.id))
        .orderBy(asc(schema.challengeTasks.position), asc(schema.challengeTasks.id));
      const checks = await db
        .select()
        .from(schema.challengeChecks)
        .where(eq(schema.challengeChecks.challengeId, ch.id));
      const doneOnDate = new Set(
        checks.filter((c) => c.loggedOn === args.date).map((c) => c.taskId),
      );
      const perDay = new Map<string, number>();
      for (const c of checks)
        perDay.set(c.loggedOn, (perDay.get(c.loggedOn) ?? 0) + 1);
      const days = [];
      for (let i = 0; i < ch.totalDays; i++) {
        const date = shiftDateStr(ch.startedOn, i);
        days.push({
          date,
          dayNumber: i + 1,
          doneCount: perDay.get(date) ?? 0,
        });
      }
      const noteRows = await db
        .select()
        .from(schema.challengeDayNotes)
        .where(
          and(
            eq(schema.challengeDayNotes.challengeId, ch.id),
            eq(schema.challengeDayNotes.loggedOn, args.date),
          ),
        )
        .limit(1);
      return {
        ok: true,
        error: null,
        challenge: await challengeSummary(db, ch, args.today),
        tasks: taskRows.map((t) => ({
          id: t.id,
          label: t.label,
          done: doneOnDate.has(t.id),
        })),
        note: noteRows[0]?.note ?? "",
        days,
      };
    },
  }),

  toggleChallengeCheck: defineAction({
    description:
      "Ticks or unticks one daily task of the signed-in user's challenge for a date inside the challenge window. This is the only way a check is ever created — by the user's own hand.",
    request: z.object({
      token: z.string().min(1).max(200),
      challengeId: z.number().int().positive(),
      taskId: z.number().int().positive(),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      done: z.boolean(),
    }),
    response: okResponse,
    async handler(ctx, args): Promise<z.infer<typeof okResponse>> {
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const ch = await ownChallenge(db, resolved.userId, args.challengeId);
      if (!ch) return { ok: false, error: "Challenge not found." };
      if (ch.status === "paused")
        return { ok: false, error: "This challenge is paused. Resume it to keep ticking." };
      const endOn = shiftDateStr(ch.startedOn, ch.totalDays - 1);
      if (args.date < ch.startedOn || args.date > endOn)
        return { ok: false, error: "That date is outside the challenge." };
      const taskRows = await db
        .select({ id: schema.challengeTasks.id })
        .from(schema.challengeTasks)
        .where(
          and(
            eq(schema.challengeTasks.id, args.taskId),
            eq(schema.challengeTasks.challengeId, ch.id),
          ),
        )
        .limit(1);
      if (!taskRows[0]) return { ok: false, error: "Task not found." };
      const existing = await db
        .select({ id: schema.challengeChecks.id })
        .from(schema.challengeChecks)
        .where(
          and(
            eq(schema.challengeChecks.challengeId, ch.id),
            eq(schema.challengeChecks.taskId, args.taskId),
            eq(schema.challengeChecks.loggedOn, args.date),
          ),
        )
        .limit(1);
      if (args.done && !existing[0]) {
        await db.insert(schema.challengeChecks).values({
          challengeId: ch.id,
          taskId: args.taskId,
          loggedOn: args.date,
        });
      } else if (!args.done && existing[0]) {
        await db
          .delete(schema.challengeChecks)
          .where(eq(schema.challengeChecks.id, existing[0].id));
      }
      ctx.invalidateQueries();
      return { ok: true, error: null };
    },
  }),

  setChallengeDayNote: defineAction({
    description:
      "Saves (or clears, when empty) the signed-in user's note for one day of their challenge.",
    request: z.object({
      token: z.string().min(1).max(200),
      challengeId: z.number().int().positive(),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      note: z.string().trim().max(500),
    }),
    response: okResponse,
    async handler(ctx, args): Promise<z.infer<typeof okResponse>> {
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const ch = await ownChallenge(db, resolved.userId, args.challengeId);
      if (!ch) return { ok: false, error: "Challenge not found." };
      const endOn = shiftDateStr(ch.startedOn, ch.totalDays - 1);
      if (args.date < ch.startedOn || args.date > endOn)
        return { ok: false, error: "That date is outside the challenge." };
      const existing = await db
        .select({ id: schema.challengeDayNotes.id })
        .from(schema.challengeDayNotes)
        .where(
          and(
            eq(schema.challengeDayNotes.challengeId, ch.id),
            eq(schema.challengeDayNotes.loggedOn, args.date),
          ),
        )
        .limit(1);
      if (args.note === "") {
        if (existing[0])
          await db
            .delete(schema.challengeDayNotes)
            .where(eq(schema.challengeDayNotes.id, existing[0].id));
      } else if (existing[0]) {
        await db
          .update(schema.challengeDayNotes)
          .set({ note: args.note })
          .where(eq(schema.challengeDayNotes.id, existing[0].id));
      } else {
        await db.insert(schema.challengeDayNotes).values({
          challengeId: ch.id,
          loggedOn: args.date,
          note: args.note,
        });
      }
      ctx.invalidateQueries();
      return { ok: true, error: null };
    },
  }),

  setChallengeStatus: defineAction({
    description: "Pauses or resumes one of the signed-in user's challenges. Pausing keeps every check and note.",
    request: z.object({
      token: z.string().min(1).max(200),
      challengeId: z.number().int().positive(),
      status: z.enum(["active", "paused"]),
    }),
    response: okResponse,
    async handler(ctx, args): Promise<z.infer<typeof okResponse>> {
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const ch = await ownChallenge(db, resolved.userId, args.challengeId);
      if (!ch) return { ok: false, error: "Challenge not found." };
      await db
        .update(schema.challenges)
        .set({ status: args.status })
        .where(eq(schema.challenges.id, ch.id));
      ctx.invalidateQueries();
      return { ok: true, error: null };
    },
  }),

  restartChallenge: defineAction({
    description:
      "Restarts one of the signed-in user's challenges from a new start date: all checks and day notes are cleared and the challenge becomes active. The task list is kept.",
    request: z.object({
      token: z.string().min(1).max(200),
      challengeId: z.number().int().positive(),
      startedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    }),
    response: okResponse,
    async handler(ctx, args): Promise<z.infer<typeof okResponse>> {
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const ch = await ownChallenge(db, resolved.userId, args.challengeId);
      if (!ch) return { ok: false, error: "Challenge not found." };
      await db
        .delete(schema.challengeChecks)
        .where(eq(schema.challengeChecks.challengeId, ch.id));
      await db
        .delete(schema.challengeDayNotes)
        .where(eq(schema.challengeDayNotes.challengeId, ch.id));
      await db
        .update(schema.challenges)
        .set({ startedOn: args.startedOn, status: "active" })
        .where(eq(schema.challenges.id, ch.id));
      ctx.invalidateQueries();
      return { ok: true, error: null };
    },
  }),

  deleteChallenge: defineAction({
    description:
      "Deletes one of the signed-in user's challenges with all its tasks, checks and notes.",
    request: z.object({
      token: z.string().min(1).max(200),
      challengeId: z.number().int().positive(),
    }),
    response: okResponse,
    async handler(ctx, args): Promise<z.infer<typeof okResponse>> {
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const ch = await ownChallenge(db, resolved.userId, args.challengeId);
      if (!ch) return { ok: false, error: "Challenge not found." };
      await db
        .delete(schema.challengeChecks)
        .where(eq(schema.challengeChecks.challengeId, ch.id));
      await db
        .delete(schema.challengeDayNotes)
        .where(eq(schema.challengeDayNotes.challengeId, ch.id));
      await db
        .delete(schema.challengeTasks)
        .where(eq(schema.challengeTasks.challengeId, ch.id));
      await db
        .delete(schema.challenges)
        .where(eq(schema.challenges.id, ch.id));
      ctx.invalidateQueries();
      return { ok: true, error: null };
    },
  }),

  changePassword: defineAction({
    description:
      "Changes the signed-in user's password after verifying the current one, and ends their other sessions.",
    request: z.object({
      token: z.string().min(1).max(200),
      currentPassword: z.string().min(1).max(200),
      newPassword: z.string().min(1).max(200),
    }),
    response: okResponse,
    async handler(ctx, args): Promise<z.infer<typeof okResponse>> {
      if (args.newPassword.length < 8)
        return {
          ok: false,
          error: "New password must be at least 8 characters long.",
        };
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const rows = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, resolved.userId))
        .limit(1);
      const user = rows[0];
      if (!user) return { ok: false, error: "Account not found." };
      const attempt = await hashPassword(
        args.currentPassword,
        user.passwordSalt,
      );
      if (attempt !== user.passwordHash)
        return { ok: false, error: "Current password is incorrect." };
      const salt = newSalt();
      const passwordHash = await hashPassword(args.newPassword, salt);
      await db
        .update(schema.users)
        .set({ passwordHash, passwordSalt: salt })
        .where(eq(schema.users.id, user.id));
      // End every other session for this account.
      const currentHash = await sha256Hex(args.token);
      const allSessions = await db
        .select()
        .from(schema.sessions)
        .where(eq(schema.sessions.userId, user.id));
      for (const s of allSessions) {
        if (s.tokenHash !== currentHash) {
          await db
            .delete(schema.sessions)
            .where(eq(schema.sessions.id, s.id));
        }
      }
      return { ok: true, error: null };
    },
  }),

  deleteAccount: defineAction({
    description:
      "Permanently deletes the signed-in user's account and all of their FITIND data after password confirmation.",
    request: z.object({
      token: z.string().min(1).max(200),
      password: z.string().min(1).max(200),
    }),
    response: okResponse,
    async handler(ctx, args): Promise<z.infer<typeof okResponse>> {
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const rows = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, resolved.userId))
        .limit(1);
      const user = rows[0];
      if (!user) return { ok: false, error: "Account not found." };
      const attempt = await hashPassword(args.password, user.passwordSalt);
      if (attempt !== user.passwordHash)
        return { ok: false, error: "Password is incorrect." };
      const userId = user.id;
      await db.delete(schema.sessions).where(eq(schema.sessions.userId, userId));
      // Phase 5: an admin role belongs to the account and goes with it.
      // Audit-log rows stay as the administrative record of changes to
      // shared content; they hold only the admin's email snapshot.
      await db.delete(schema.adminRoles).where(eq(schema.adminRoles.userId, userId));
      // Workouts: sets → session exercises → sessions, then routines.
      const userSessions = await db
        .select({ id: schema.workoutSessions.id })
        .from(schema.workoutSessions)
        .where(eq(schema.workoutSessions.userId, userId));
      for (const s of userSessions) {
        const exRows = await db
          .select({ id: schema.sessionExercises.id })
          .from(schema.sessionExercises)
          .where(eq(schema.sessionExercises.sessionId, s.id));
        for (const ex of exRows) {
          await db
            .delete(schema.workoutSets)
            .where(eq(schema.workoutSets.sessionExerciseId, ex.id));
        }
        await db
          .delete(schema.sessionExercises)
          .where(eq(schema.sessionExercises.sessionId, s.id));
      }
      await db
        .delete(schema.workoutSessions)
        .where(eq(schema.workoutSessions.userId, userId));
      const userRoutines = await db
        .select({ id: schema.routines.id })
        .from(schema.routines)
        .where(eq(schema.routines.userId, userId));
      for (const r of userRoutines) {
        await db
          .delete(schema.routineExercises)
          .where(eq(schema.routineExercises.routineId, r.id));
      }
      await db.delete(schema.routines).where(eq(schema.routines.userId, userId));
      // Phase 4: challenges (children first), recipes, plan, water, measurements.
      const userChallenges = await db
        .select({ id: schema.challenges.id })
        .from(schema.challenges)
        .where(eq(schema.challenges.userId, userId));
      for (const c of userChallenges) {
        await db
          .delete(schema.challengeChecks)
          .where(eq(schema.challengeChecks.challengeId, c.id));
        await db
          .delete(schema.challengeDayNotes)
          .where(eq(schema.challengeDayNotes.challengeId, c.id));
        await db
          .delete(schema.challengeTasks)
          .where(eq(schema.challengeTasks.challengeId, c.id));
      }
      await db.delete(schema.challenges).where(eq(schema.challenges.userId, userId));
      const ownRecipes = await db
        .select({ id: schema.recipes.id })
        .from(schema.recipes)
        .where(eq(schema.recipes.ownerUserId, userId));
      for (const r of ownRecipes) {
        await db
          .delete(schema.recipeIngredients)
          .where(eq(schema.recipeIngredients.recipeId, r.id));
        await db
          .delete(schema.favouriteRecipes)
          .where(eq(schema.favouriteRecipes.recipeId, r.id));
        await db
          .delete(schema.mealPlanEntries)
          .where(eq(schema.mealPlanEntries.recipeId, r.id));
      }
      await db.delete(schema.recipes).where(eq(schema.recipes.ownerUserId, userId));
      await db.delete(schema.favouriteRecipes).where(eq(schema.favouriteRecipes.userId, userId));
      await db.delete(schema.mealPlanEntries).where(eq(schema.mealPlanEntries.userId, userId));
      await db.delete(schema.waterEntries).where(eq(schema.waterEntries.userId, userId));
      await db.delete(schema.measurements).where(eq(schema.measurements.userId, userId));
      await db.delete(schema.diaryEntries).where(eq(schema.diaryEntries.userId, userId));
      await db.delete(schema.favouriteFoods).where(eq(schema.favouriteFoods.userId, userId));
      await db.delete(schema.foods).where(eq(schema.foods.ownerUserId, userId));
      await db.delete(schema.weightLogs).where(eq(schema.weightLogs.userId, userId));
      await db.delete(schema.profiles).where(eq(schema.profiles.userId, userId));
      await db.delete(schema.userGoals).where(eq(schema.userGoals.userId, userId));
      await db
        .delete(schema.userPreferences)
        .where(eq(schema.userPreferences.userId, userId));
      await db.delete(schema.users).where(eq(schema.users.id, userId));
      ctx.invalidateQueries();
      return { ok: true, error: null };
    },
  }),

  exportData: defineAction({
    description:
      "Returns all of the signed-in user's own FITIND data as a JSON-ready object for download.",
    request: z.object({ token: z.string().min(1).max(200) }),
    response: z.object({
      ok: z.boolean(),
      error: z.string().nullable(),
      profile: profileShape.nullable(),
      targets: targetsShape.nullable(),
      weightLogs: z.array(
        z.object({ weightKg: z.number(), loggedOn: z.string() }),
      ),
      diaryEntries: z.array(
        z.object({
          loggedOn: z.string(),
          meal: z.string(),
          foodName: z.string(),
          quantityGrams: z.number(),
          servings: z.number().nullable(),
          kcal: z.number(),
          protein: z.number(),
          carbs: z.number(),
          fat: z.number(),
          fibre: z.number(),
        }),
      ),
      // Phase 5: the export is complete — the user's own catalogue
      // entries and favourites are part of their data too.
      customFoods: z.array(
        z.object({
          name: z.string(),
          aliases: z.string(),
          category: z.string(),
          cuisine: z.string(),
          dietFlag: z.string(),
          kcalPer100: z.number(),
          proteinPer100: z.number(),
          carbsPer100: z.number(),
          fatPer100: z.number(),
          fibrePer100: z.number(),
          servingName: z.string(),
          servingGrams: z.number(),
          notes: z.string().nullable(),
        }),
      ),
      favouriteFoods: z.array(z.object({ name: z.string() })),
      favouriteRecipes: z.array(z.object({ name: z.string() })),
      workoutSessions: z.array(
        z.object({
          title: z.string(),
          startedOn: z.string(),
          status: z.string(),
          durationSeconds: z.number().nullable(),
          notes: z.string().nullable(),
          exercises: z.array(
            z.object({
              name: z.string(),
              skipped: z.boolean(),
              sets: z.array(
                z.object({
                  reps: z.number().nullable(),
                  loadKg: z.number().nullable(),
                  durationSeconds: z.number().nullable(),
                  completed: z.boolean(),
                }),
              ),
            }),
          ),
        }),
      ),
      routines: z.array(
        z.object({
          name: z.string(),
          notes: z.string().nullable(),
          exercises: z.array(
            z.object({
              name: z.string(),
              targetSets: z.number(),
              targetReps: z.string(),
              restSeconds: z.number(),
            }),
          ),
        }),
      ),
      measurements: z.array(
        z.object({
          loggedOn: z.string(),
          waistCm: z.number().nullable(),
          chestCm: z.number().nullable(),
          armCm: z.number().nullable(),
          thighCm: z.number().nullable(),
          hipCm: z.number().nullable(),
          neckCm: z.number().nullable(),
        }),
      ),
      waterEntries: z.array(
        z.object({ loggedOn: z.string(), amountMl: z.number() }),
      ),
      ownRecipes: z.array(
        z.object({
          name: z.string(),
          description: z.string(),
          category: z.string(),
          dietFlag: z.string(),
          servings: z.number(),
          prepMinutes: z.number(),
          cookMinutes: z.number().nullable(),
          steps: z.string(),
          ingredients: z.array(
            z.object({ name: z.string(), quantityGrams: z.number() }),
          ),
        }),
      ),
      mealPlan: z.array(
        z.object({
          weekday: z.number(),
          meal: z.string(),
          recipeName: z.string(),
          servings: z.number(),
        }),
      ),
      challenges: z.array(
        z.object({
          name: z.string(),
          totalDays: z.number(),
          startedOn: z.string(),
          status: z.string(),
          tasks: z.array(z.string()),
          checksDone: z.number(),
          checks: z.array(
            z.object({ task: z.string(), loggedOn: z.string() }),
          ),
          dayNotes: z.array(
            z.object({ loggedOn: z.string(), note: z.string() }),
          ),
        }),
      ),
      exportedAt: z.string().nullable(),
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
        exportedAt: null,
      };
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved) return fail;
      const profile = await loadProfile(db, resolved.userId);
      if (!profile) return fail;
      const logs = await db
        .select()
        .from(schema.weightLogs)
        .where(eq(schema.weightLogs.userId, resolved.userId))
        .orderBy(desc(schema.weightLogs.loggedOn), desc(schema.weightLogs.id));
      const diary = await db
        .select()
        .from(schema.diaryEntries)
        .where(eq(schema.diaryEntries.userId, resolved.userId))
        .orderBy(desc(schema.diaryEntries.loggedOn), asc(schema.diaryEntries.id));
      const workoutRows = await db
        .select()
        .from(schema.workoutSessions)
        .where(eq(schema.workoutSessions.userId, resolved.userId))
        .orderBy(desc(schema.workoutSessions.startedAt));
      const workoutSessions = [];
      for (const s of workoutRows) {
        const p = await sessionPayload(db, s);
        workoutSessions.push({
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
              completed: st.completed,
            })),
          })),
        });
      }
      const routineRows = await db
        .select()
        .from(schema.routines)
        .where(eq(schema.routines.userId, resolved.userId))
        .orderBy(asc(schema.routines.name));
      const routines = [];
      for (const r of routineRows) {
        const exRows = await db
          .select()
          .from(schema.routineExercises)
          .where(eq(schema.routineExercises.routineId, r.id))
          .orderBy(asc(schema.routineExercises.position));
        const exList = [];
        for (const re of exRows) {
          const lib = await db
            .select({ name: schema.exercises.name })
            .from(schema.exercises)
            .where(eq(schema.exercises.id, re.exerciseId))
            .limit(1);
          exList.push({
            name: lib[0]?.name ?? "Exercise",
            targetSets: re.targetSets,
            targetReps: re.targetReps,
            restSeconds: re.restSeconds,
          });
        }
        routines.push({ name: r.name, notes: r.notes, exercises: exList });
      }
      const measurementRows = await db
        .select()
        .from(schema.measurements)
        .where(eq(schema.measurements.userId, resolved.userId))
        .orderBy(desc(schema.measurements.loggedOn));
      const waterRows = await db
        .select()
        .from(schema.waterEntries)
        .where(eq(schema.waterEntries.userId, resolved.userId))
        .orderBy(desc(schema.waterEntries.loggedOn), asc(schema.waterEntries.id));
      const ownRecipeRows = await db
        .select()
        .from(schema.recipes)
        .where(eq(schema.recipes.ownerUserId, resolved.userId))
        .orderBy(asc(schema.recipes.name));
      const ownRecipesExport = [];
      for (const r of ownRecipeRows) {
        const ingRows = await db
          .select()
          .from(schema.recipeIngredients)
          .where(eq(schema.recipeIngredients.recipeId, r.id))
          .orderBy(asc(schema.recipeIngredients.position));
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
            quantityGrams: i.quantityGrams,
          })),
        });
      }
      const customFoodRows = await db
        .select()
        .from(schema.foods)
        .where(eq(schema.foods.ownerUserId, resolved.userId))
        .orderBy(asc(schema.foods.name));
      const favFoodRows = await db
        .select({ foodId: schema.favouriteFoods.foodId })
        .from(schema.favouriteFoods)
        .where(eq(schema.favouriteFoods.userId, resolved.userId));
      const favouriteFoodsExport = [];
      for (const f of favFoodRows) {
        const food = await db
          .select({ name: schema.foods.name })
          .from(schema.foods)
          .where(eq(schema.foods.id, f.foodId))
          .limit(1);
        if (food[0]) favouriteFoodsExport.push({ name: food[0].name });
      }
      const favRecipeRows = await db
        .select({ recipeId: schema.favouriteRecipes.recipeId })
        .from(schema.favouriteRecipes)
        .where(eq(schema.favouriteRecipes.userId, resolved.userId));
      const favouriteRecipesExport = [];
      for (const f of favRecipeRows) {
        const rec = await db
          .select({ name: schema.recipes.name })
          .from(schema.recipes)
          .where(eq(schema.recipes.id, f.recipeId))
          .limit(1);
        if (rec[0]) favouriteRecipesExport.push({ name: rec[0].name });
      }
      const planRows = await db
        .select()
        .from(schema.mealPlanEntries)
        .where(eq(schema.mealPlanEntries.userId, resolved.userId))
        .orderBy(asc(schema.mealPlanEntries.weekday), asc(schema.mealPlanEntries.id));
      const planExport = [];
      for (const p of planRows) {
        const rec = await db
          .select({ name: schema.recipes.name })
          .from(schema.recipes)
          .where(eq(schema.recipes.id, p.recipeId))
          .limit(1);
        planExport.push({
          weekday: p.weekday,
          meal: p.meal,
          recipeName: rec[0]?.name ?? "Recipe",
          servings: p.servings,
        });
      }
      const challengeRows = await db
        .select()
        .from(schema.challenges)
        .where(eq(schema.challenges.userId, resolved.userId))
        .orderBy(desc(schema.challenges.createdAt));
      const challengeExport = [];
      for (const c of challengeRows) {
        const taskRows = await db
          .select({ label: schema.challengeTasks.label })
          .from(schema.challengeTasks)
          .where(eq(schema.challengeTasks.challengeId, c.id))
          .orderBy(asc(schema.challengeTasks.position));
        const checkRows = await db
          .select({
            taskId: schema.challengeChecks.taskId,
            loggedOn: schema.challengeChecks.loggedOn,
          })
          .from(schema.challengeChecks)
          .where(eq(schema.challengeChecks.challengeId, c.id))
          .orderBy(asc(schema.challengeChecks.loggedOn));
        const taskLabelRows = await db
          .select({
            id: schema.challengeTasks.id,
            label: schema.challengeTasks.label,
          })
          .from(schema.challengeTasks)
          .where(eq(schema.challengeTasks.challengeId, c.id));
        const labelById = new Map(taskLabelRows.map((t) => [t.id, t.label]));
        const noteRows = await db
          .select()
          .from(schema.challengeDayNotes)
          .where(eq(schema.challengeDayNotes.challengeId, c.id))
          .orderBy(asc(schema.challengeDayNotes.loggedOn));
        challengeExport.push({
          name: c.name,
          totalDays: c.totalDays,
          startedOn: c.startedOn,
          status: c.status,
          tasks: taskRows.map((t) => t.label),
          checksDone: checkRows.length,
          checks: checkRows.map((ch) => ({
            task: labelById.get(ch.taskId) ?? "Task",
            loggedOn: ch.loggedOn,
          })),
          dayNotes: noteRows.map((n) => ({
            loggedOn: n.loggedOn,
            note: n.note,
          })),
        });
      }
      return {
        ok: true,
        error: null,
        profile,
        targets: computeTargets(profile),
        weightLogs: logs.map((l) => ({
          weightKg: l.weightKg,
          loggedOn: l.loggedOn,
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
            fibre: p.fibre,
          };
        }),
        workoutSessions,
        routines,
        measurements: measurementRows.map((m) => ({
          loggedOn: m.loggedOn,
          waistCm: m.waistCm,
          chestCm: m.chestCm,
          armCm: m.armCm,
          thighCm: m.thighCm,
          hipCm: m.hipCm,
          neckCm: m.neckCm,
        })),
        waterEntries: waterRows.map((w) => ({
          loggedOn: w.loggedOn,
          amountMl: w.amountMl,
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
          notes: f.notes,
        })),
        favouriteFoods: favouriteFoodsExport,
        favouriteRecipes: favouriteRecipesExport,
        ownRecipes: ownRecipesExport,
        mealPlan: planExport,
        challenges: challengeExport,
        exportedAt: new Date().toISOString(),
      };
    },
  }),

  // ---------------------------------------------------------- Phase 5
  // Sessions, admin bootstrap, and the server-protected admin area.

  listSessions: defineAction({
    description:
      "Lists the signed-in user's active sessions (sign-in time, expiry, and the device string recorded at login) so they can review where they are signed in.",
    request: z.object({ token: z.string().min(1).max(200) }),
    response: z.object({
      ok: z.boolean(),
      error: z.string().nullable(),
      sessions: z.array(
        z.object({
          id: z.number(),
          createdAt: z.string(),
          expiresAt: z.string(),
          userAgent: z.string().nullable(),
          current: z.boolean(),
        }),
      ),
    }),
    async handler(ctx, args) {
      const fail = { ok: false, error: "You are not signed in.", sessions: [] };
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved) return fail;
      const currentHash = await sha256Hex(args.token);
      const rows = await db
        .select()
        .from(schema.sessions)
        .where(eq(schema.sessions.userId, resolved.userId))
        .orderBy(desc(schema.sessions.createdAt));
      const now = Date.now();
      return {
        ok: true,
        error: null,
        sessions: rows
          .filter((s) => s.expiresAt.getTime() > now)
          .map((s) => ({
            id: s.id,
            createdAt: s.createdAt.toISOString(),
            expiresAt: s.expiresAt.toISOString(),
            userAgent: s.userAgent,
            current: s.tokenHash === currentHash,
          })),
      };
    },
  }),

  logoutOtherSessions: defineAction({
    description:
      "Ends every session of the signed-in user except the current one.",
    request: z.object({ token: z.string().min(1).max(200) }),
    response: okResponse,
    async handler(ctx, args): Promise<z.infer<typeof okResponse>> {
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      const currentHash = await sha256Hex(args.token);
      const rows = await db
        .select()
        .from(schema.sessions)
        .where(eq(schema.sessions.userId, resolved.userId));
      for (const s of rows) {
        if (s.tokenHash !== currentHash) {
          await db
            .delete(schema.sessions)
            .where(eq(schema.sessions.id, s.id));
        }
      }
      ctx.invalidateQueries();
      return { ok: true, error: null };
    },
  }),

  claimAdmin: defineAction({
    description:
      "One-time first-admin bootstrap: succeeds ONLY while no admin exists in the whole app. Grants the signed-in user the admin role and audit-logs the claim. Once any admin exists this action always refuses.",
    request: z.object({ token: z.string().min(1).max(200) }),
    response: okResponse,
    async handler(ctx, args): Promise<z.infer<typeof okResponse>> {
      const db = ctx.db<typeof schema>();
      const resolved = await resolveUserId(db, args.token);
      if ("error" in resolved)
        return { ok: false, error: "You are not signed in." };
      if ((await adminCount(db)) > 0)
        return {
          ok: false,
          error:
            "Admin is already set up for this site, so the first-admin claim is closed.",
        };
      const userRows = await db
        .select({ email: schema.users.email })
        .from(schema.users)
        .where(eq(schema.users.id, resolved.userId))
        .limit(1);
      const email = userRows[0]?.email ?? "";
      await db.insert(schema.adminRoles).values({
        userId: resolved.userId,
        grantMethod: "bootstrap",
        grantedAt: new Date(),
      });
      await logAdminAction(
        db,
        { userId: resolved.userId, email },
        "admin.claim",
        "admin",
        resolved.userId,
        `First admin claimed via one-time bootstrap by ${email}`,
      );
      ctx.invalidateQueries();
      return { ok: true, error: null };
    },
  }),

  adminOverview: defineAction({
    description:
      "Admin-only aggregate counts for the whole app (totals only — never any individual user's private data).",
    request: z.object({ token: z.string().min(1).max(200) }),
    response: z.object({
      ok: z.boolean(),
      error: z.string().nullable(),
      users: z.number(),
      admins: z.number(),
      catalogueFoods: z.number(),
      customFoods: z.number(),
      exercises: z.number(),
      seededRecipes: z.number(),
      userRecipes: z.number(),
      diaryEntries: z.number(),
      workoutSessions: z.number(),
      waterEntries: z.number(),
      challenges: z.number(),
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
        challenges: 0,
      };
      const db = ctx.db<typeof schema>();
      const admin = await requireAdmin(db, args.token);
      if ("error" in admin) return { ...fail, error: admin.error };
      await ensureFoodCatalog(db);
      await ensureExerciseLibrary(db);
      await ensureRecipeLibrary(db);
      const allUsers = await db.select({ id: schema.users.id }).from(schema.users);
      const allFoods = await db
        .select({ ownerUserId: schema.foods.ownerUserId })
        .from(schema.foods);
      const allExercises = await db
        .select({ id: schema.exercises.id })
        .from(schema.exercises);
      const allRecipes = await db
        .select({ ownerUserId: schema.recipes.ownerUserId })
        .from(schema.recipes);
      const allDiary = await db
        .select({ id: schema.diaryEntries.id })
        .from(schema.diaryEntries);
      const allWorkouts = await db
        .select({ id: schema.workoutSessions.id })
        .from(schema.workoutSessions);
      const allWater = await db
        .select({ id: schema.waterEntries.id })
        .from(schema.waterEntries);
      const allChallenges = await db
        .select({ id: schema.challenges.id })
        .from(schema.challenges);
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
        challenges: allChallenges.length,
      };
    },
  }),

  adminListFoods: defineAction({
    description:
      "Admin-only paged food list for content management. Scope 'catalogue' = shared foods, 'custom' = user-created foods shown for quality review WITHOUT any owner identity, 'all' = both.",
    request: z.object({
      token: z.string().min(1).max(200),
      query: z.string().trim().max(80).default(""),
      scope: z.enum(["catalogue", "custom", "all"]).default("catalogue"),
      offset: z.number().int().min(0).max(100000).default(0),
      limit: z.number().int().min(1).max(300).default(60),
    }),
    response: z.object({
      ok: z.boolean(),
      error: z.string().nullable(),
      foods: z.array(foodShape),
      total: z.number(),
    }),
    async handler(ctx, args) {
      const fail = { ok: false, error: "Admin access required.", foods: [], total: 0 };
      const db = ctx.db<typeof schema>();
      const admin = await requireAdmin(db, args.token);
      if ("error" in admin) return { ...fail, error: admin.error };
      await ensureFoodCatalog(db);
      const all = await db
        .select()
        .from(schema.foods)
        .orderBy(asc(schema.foods.name));
      const q = args.query.toLowerCase();
      const filtered = all.filter((f) => {
        if (args.scope === "catalogue" && f.ownerUserId != null) return false;
        if (args.scope === "custom" && f.ownerUserId == null) return false;
        if (
          q &&
          !`${f.name} ${f.aliases}`.toLowerCase().includes(q)
        )
          return false;
        return true;
      });
      const emptyFavs = new Set<number>();
      return {
        ok: true,
        error: null,
        foods: filtered
          .slice(args.offset, args.offset + args.limit)
          .map((f) => foodPayload(f, emptyFavs)),
        total: filtered.length,
      };
    },
  }),

  adminSaveFood: defineAction({
    description:
      "Admin-only create or edit of a SHARED catalogue food, including its source and verification fields. User-created custom foods cannot be edited here. Every change is audit-logged.",
    request: z.object({
      token: z.string().min(1).max(200),
      id: z.number().int().positive().optional(),
      name: z.string().trim().min(2).max(80),
      aliases: z.string().trim().max(200).default(""),
      category: z.string().trim().min(1).max(40),
      cuisine: z.string().trim().min(1).max(40),
      dietFlag: z.enum(["veg", "vegan", "eggetarian", "non_veg"]),
      kcalPer100: z.number().min(0).max(950),
      proteinPer100: z.number().min(0).max(100),
      carbsPer100: z.number().min(0).max(100),
      fatPer100: z.number().min(0).max(100),
      fibrePer100: z.number().min(0).max(100),
      servingName: z.string().trim().min(1).max(40),
      servingGrams: z.number().min(1).max(2000),
      source: z.string().trim().min(1).max(200),
      verification: z.enum(["estimate", "verified"]),
      notes: z.string().trim().max(300).nullable().optional(),
    }),
    response: z.object({
      ok: z.boolean(),
      error: z.string().nullable(),
      foodId: z.number().nullable(),
    }),
    async handler(ctx, args) {
      const fail = { ok: false, error: "Admin access required.", foodId: null };
      const db = ctx.db<typeof schema>();
      const admin = await requireAdmin(db, args.token);
      if ("error" in admin) return { ...fail, error: admin.error };
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
        notes: args.notes ?? null,
      };
      const dupes = await db
        .select({ id: schema.foods.id })
        .from(schema.foods)
        .where(
          and(isNull(schema.foods.ownerUserId), eq(schema.foods.name, args.name)),
        );
      if (args.id != null) {
        const rows = await db
          .select()
          .from(schema.foods)
          .where(eq(schema.foods.id, args.id))
          .limit(1);
        const food = rows[0];
        if (!food) return { ...fail, error: "Food not found." };
        if (food.ownerUserId != null)
          return {
            ...fail,
            error:
              "That is a user's custom food. Custom foods can be reviewed or removed, not edited.",
          };
        if (dupes.some((d) => d.id !== args.id))
          return { ...fail, error: "Another catalogue food already uses this name." };
        await db
          .update(schema.foods)
          .set(values)
          .where(eq(schema.foods.id, args.id));
        await logAdminAction(
          db,
          admin,
          "food.update",
          "food",
          args.id,
          `Updated catalogue food "${args.name}" — ${args.kcalPer100} kcal, P ${args.proteinPer100} g per 100 g (${args.verification})`,
        );
        ctx.invalidateQueries();
        return { ok: true, error: null, foodId: args.id };
      }
      if (dupes.length > 0)
        return { ...fail, error: "A catalogue food already uses this name." };
      const inserted = await db
        .insert(schema.foods)
        .values({ ...values, ownerUserId: null })
        .returning({ id: schema.foods.id });
      const newId = inserted[0]?.id ?? null;
      await logAdminAction(
        db,
        admin,
        "food.create",
        "food",
        newId,
        `Created catalogue food "${args.name}" — ${args.kcalPer100} kcal per 100 g (${args.verification})`,
      );
      ctx.invalidateQueries();
      return { ok: true, error: null, foodId: newId };
    },
  }),

  adminDeleteFood: defineAction({
    description:
      "Admin-only delete of a food. A catalogue food used by any recipe cannot be deleted (recipes calculate from it); user-created custom foods can be removed for quality. Diary history is snapshot-based and is never rewritten. Audit-logged.",
    request: z.object({
      token: z.string().min(1).max(200),
      foodId: z.number().int().positive(),
    }),
    response: okResponse,
    async handler(ctx, args): Promise<z.infer<typeof okResponse>> {
      const db = ctx.db<typeof schema>();
      const admin = await requireAdmin(db, args.token);
      if ("error" in admin) return { ok: false, error: admin.error };
      const rows = await db
        .select()
        .from(schema.foods)
        .where(eq(schema.foods.id, args.foodId))
        .limit(1);
      const food = rows[0];
      if (!food) return { ok: false, error: "Food not found." };
      if (food.ownerUserId == null) {
        const usedBy = await db
          .select({ id: schema.recipeIngredients.id })
          .from(schema.recipeIngredients)
          .where(eq(schema.recipeIngredients.foodId, args.foodId));
        if (usedBy.length > 0)
          return {
            ok: false,
            error: `This food is an ingredient in ${usedBy.length} recipe(s). Remove it from those recipes first.`,
          };
      }
      await db
        .delete(schema.favouriteFoods)
        .where(eq(schema.favouriteFoods.foodId, args.foodId));
      await db.delete(schema.foods).where(eq(schema.foods.id, args.foodId));
      await logAdminAction(
        db,
        admin,
        "food.delete",
        food.ownerUserId == null ? "food" : "custom_food",
        args.foodId,
        `Deleted ${food.ownerUserId == null ? "catalogue" : "user-created"} food "${food.name}"`,
      );
      ctx.invalidateQueries();
      return { ok: true, error: null };
    },
  }),

  adminListExercises: defineAction({
    description: "Admin-only paged exercise library list for content management.",
    request: z.object({
      token: z.string().min(1).max(200),
      query: z.string().trim().max(80).default(""),
      offset: z.number().int().min(0).max(100000).default(0),
      limit: z.number().int().min(1).max(200).default(60),
    }),
    response: z.object({
      ok: z.boolean(),
      error: z.string().nullable(),
      exercises: z.array(exerciseShape),
      total: z.number(),
    }),
    async handler(ctx, args) {
      const fail = { ok: false, error: "Admin access required.", exercises: [], total: 0 };
      const db = ctx.db<typeof schema>();
      const admin = await requireAdmin(db, args.token);
      if ("error" in admin) return { ...fail, error: admin.error };
      await ensureExerciseLibrary(db);
      const all = await db
        .select()
        .from(schema.exercises)
        .orderBy(asc(schema.exercises.name));
      const q = args.query.toLowerCase();
      const filtered = q
        ? all.filter((e) =>
            `${e.name} ${e.primaryMuscle} ${e.secondaryMuscles}`
              .toLowerCase()
              .includes(q),
          )
        : all;
      return {
        ok: true,
        error: null,
        exercises: filtered
          .slice(args.offset, args.offset + args.limit)
          .map(exercisePayload),
        total: filtered.length,
      };
    },
  }),

  adminSaveExercise: defineAction({
    description:
      "Admin-only create or edit of a library exercise. Every change is audit-logged.",
    request: z.object({
      token: z.string().min(1).max(200),
      id: z.number().int().positive().optional(),
      name: z.string().trim().min(2).max(80),
      primaryMuscle: z.string().trim().min(1).max(40),
      secondaryMuscles: z.string().trim().max(120).default(""),
      equipment: z.string().trim().min(1).max(40),
      difficulty: z.enum(["beginner", "intermediate", "advanced"]),
      pattern: z.string().trim().min(1).max(60),
      kind: z.enum(["weighted", "bodyweight", "timed"]),
      instructions: z.string().trim().min(1).max(1200),
      mistakes: z.string().trim().min(1).max(1200),
      suggestedSets: z.number().int().min(1).max(10),
      suggestedReps: z.string().trim().min(1).max(40),
      restSeconds: z.number().int().min(0).max(600),
    }),
    response: z.object({
      ok: z.boolean(),
      error: z.string().nullable(),
      exerciseId: z.number().nullable(),
    }),
    async handler(ctx, args) {
      const fail = { ok: false, error: "Admin access required.", exerciseId: null };
      const db = ctx.db<typeof schema>();
      const admin = await requireAdmin(db, args.token);
      if ("error" in admin) return { ...fail, error: admin.error };
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
        restSeconds: args.restSeconds,
      };
      const dupes = await db
        .select({ id: schema.exercises.id })
        .from(schema.exercises)
        .where(eq(schema.exercises.name, args.name));
      if (args.id != null) {
        const rows = await db
          .select({ id: schema.exercises.id })
          .from(schema.exercises)
          .where(eq(schema.exercises.id, args.id))
          .limit(1);
        if (!rows[0]) return { ...fail, error: "Exercise not found." };
        if (dupes.some((d) => d.id !== args.id))
          return { ...fail, error: "Another exercise already uses this name." };
        await db
          .update(schema.exercises)
          .set(values)
          .where(eq(schema.exercises.id, args.id));
        await logAdminAction(
          db,
          admin,
          "exercise.update",
          "exercise",
          args.id,
          `Updated exercise "${args.name}"`,
        );
        ctx.invalidateQueries();
        return { ok: true, error: null, exerciseId: args.id };
      }
      if (dupes.length > 0)
        return { ...fail, error: "An exercise already uses this name." };
      const inserted = await db
        .insert(schema.exercises)
        .values(values)
        .returning({ id: schema.exercises.id });
      const newId = inserted[0]?.id ?? null;
      await logAdminAction(
        db,
        admin,
        "exercise.create",
        "exercise",
        newId,
        `Created exercise "${args.name}"`,
      );
      ctx.invalidateQueries();
      return { ok: true, error: null, exerciseId: newId };
    },
  }),

  adminDeleteExercise: defineAction({
    description:
      "Admin-only delete of a library exercise. Refused while any routine or workout session still references it. Audit-logged.",
    request: z.object({
      token: z.string().min(1).max(200),
      exerciseId: z.number().int().positive(),
    }),
    response: okResponse,
    async handler(ctx, args): Promise<z.infer<typeof okResponse>> {
      const db = ctx.db<typeof schema>();
      const admin = await requireAdmin(db, args.token);
      if ("error" in admin) return { ok: false, error: admin.error };
      const rows = await db
        .select()
        .from(schema.exercises)
        .where(eq(schema.exercises.id, args.exerciseId))
        .limit(1);
      const ex = rows[0];
      if (!ex) return { ok: false, error: "Exercise not found." };
      const inRoutines = await db
        .select({ id: schema.routineExercises.id })
        .from(schema.routineExercises)
        .where(eq(schema.routineExercises.exerciseId, args.exerciseId));
      const inSessions = await db
        .select({ id: schema.sessionExercises.id })
        .from(schema.sessionExercises)
        .where(eq(schema.sessionExercises.exerciseId, args.exerciseId));
      if (inRoutines.length > 0 || inSessions.length > 0)
        return {
          ok: false,
          error:
            "This exercise is used in routines or workout history, so it cannot be deleted.",
        };
      await db
        .delete(schema.exercises)
        .where(eq(schema.exercises.id, args.exerciseId));
      await logAdminAction(
        db,
        admin,
        "exercise.delete",
        "exercise",
        args.exerciseId,
        `Deleted exercise "${ex.name}"`,
      );
      ctx.invalidateQueries();
      return { ok: true, error: null };
    },
  }),

  adminListRecipes: defineAction({
    description:
      "Admin-only list of the SHARED (seeded) recipes for content management. User-owned recipes are never listed here.",
    request: z.object({
      token: z.string().min(1).max(200),
      query: z.string().trim().max(80).default(""),
    }),
    response: z.object({
      ok: z.boolean(),
      error: z.string().nullable(),
      recipes: z.array(
        z.object({
          id: z.number(),
          name: z.string(),
          category: recipeCategoryEnum,
          dietFlag: z.enum(["veg", "vegan", "eggetarian", "non_veg"]),
          servings: z.number(),
          prepMinutes: z.number(),
          cookMinutes: z.number().nullable(),
          budget: z.boolean(),
          ingredientCount: z.number(),
        }),
      ),
    }),
    async handler(ctx, args) {
      const fail = { ok: false, error: "Admin access required.", recipes: [] };
      const db = ctx.db<typeof schema>();
      const admin = await requireAdmin(db, args.token);
      if ("error" in admin) return { ...fail, error: admin.error };
      await ensureRecipeLibrary(db);
      const all = await db
        .select()
        .from(schema.recipes)
        .where(isNull(schema.recipes.ownerUserId))
        .orderBy(asc(schema.recipes.name));
      const q = args.query.toLowerCase();
      const out = [];
      for (const r of all) {
        if (q && !r.name.toLowerCase().includes(q)) continue;
        const ings = await db
          .select({ id: schema.recipeIngredients.id })
          .from(schema.recipeIngredients)
          .where(eq(schema.recipeIngredients.recipeId, r.id));
        out.push({
          id: r.id,
          name: r.name,
          category: r.category,
          dietFlag: r.dietFlag,
          servings: r.servings,
          prepMinutes: r.prepMinutes,
          cookMinutes: r.cookMinutes,
          budget: r.budget === 1,
          ingredientCount: ings.length,
        });
      }
      return { ok: true, error: null, recipes: out };
    },
  }),

  adminGetRecipe: defineAction({
    description:
      "Admin-only full detail of one shared recipe for editing: metadata, raw steps text and its ingredient rows.",
    request: z.object({
      token: z.string().min(1).max(200),
      recipeId: z.number().int().positive(),
    }),
    response: z.object({
      ok: z.boolean(),
      error: z.string().nullable(),
      recipe: z
        .object({
          id: z.number(),
          name: z.string(),
          description: z.string(),
          category: recipeCategoryEnum,
          dietFlag: z.enum(["veg", "vegan", "eggetarian", "non_veg"]),
          servings: z.number(),
          prepMinutes: z.number(),
          cookMinutes: z.number().nullable(),
          steps: z.string(),
          budget: z.boolean(),
          ingredients: z.array(
            z.object({
              id: z.number(),
              foodId: z.number().nullable(),
              name: z.string(),
              quantityGrams: z.number(),
            }),
          ),
        })
        .nullable(),
    }),
    async handler(ctx, args) {
      const fail = { ok: false, error: "Admin access required.", recipe: null };
      const db = ctx.db<typeof schema>();
      const admin = await requireAdmin(db, args.token);
      if ("error" in admin) return { ...fail, error: admin.error };
      const rows = await db
        .select()
        .from(schema.recipes)
        .where(eq(schema.recipes.id, args.recipeId))
        .limit(1);
      const r = rows[0];
      if (!r || r.ownerUserId != null)
        return { ...fail, error: "Shared recipe not found." };
      const ings = await db
        .select()
        .from(schema.recipeIngredients)
        .where(eq(schema.recipeIngredients.recipeId, r.id))
        .orderBy(asc(schema.recipeIngredients.position));
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
            quantityGrams: i.quantityGrams,
          })),
        },
      };
    },
  }),

  adminSaveRecipe: defineAction({
    description:
      "Admin-only create or edit of a SHARED recipe. Ingredients must be shared catalogue foods (recipe nutrition is calculated from them). Every change is audit-logged.",
    request: z.object({
      token: z.string().min(1).max(200),
      id: z.number().int().positive().optional(),
      name: z.string().trim().min(2).max(80),
      description: z.string().trim().max(500).default(""),
      category: recipeCategoryEnum,
      dietFlag: z.enum(["veg", "vegan", "eggetarian", "non_veg"]),
      servings: z.number().min(0.5).max(100),
      prepMinutes: z.number().int().min(0).max(600),
      cookMinutes: z.number().int().min(0).max(600).nullable().optional(),
      steps: z.string().trim().max(4000).default(""),
      budget: z.boolean().default(false),
      ingredients: z
        .array(
          z.object({
            foodId: z.number().int().positive(),
            quantityGrams: z.number().min(1).max(5000),
          }),
        )
        .min(1)
        .max(40),
    }),
    response: z.object({
      ok: z.boolean(),
      error: z.string().nullable(),
      recipeId: z.number().nullable(),
    }),
    async handler(ctx, args) {
      const fail = { ok: false, error: "Admin access required.", recipeId: null };
      const db = ctx.db<typeof schema>();
      const admin = await requireAdmin(db, args.token);
      if ("error" in admin) return { ...fail, error: admin.error };
      await ensureRecipeLibrary(db);
      // Resolve ingredient foods — shared catalogue only.
      const resolvedIngredients = [];
      for (const ing of args.ingredients) {
        const fRows = await db
          .select()
          .from(schema.foods)
          .where(eq(schema.foods.id, ing.foodId))
          .limit(1);
        const f = fRows[0];
        if (!f || f.ownerUserId != null)
          return {
            ...fail,
            error: "Every ingredient must be a shared catalogue food.",
          };
        resolvedIngredients.push({
          foodId: f.id,
          name: f.name,
          quantityGrams: ing.quantityGrams,
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
        budget: args.budget ? 1 : 0,
      };
      let recipeId = args.id ?? null;
      if (args.id != null) {
        const rows = await db
          .select()
          .from(schema.recipes)
          .where(eq(schema.recipes.id, args.id))
          .limit(1);
        const r = rows[0];
        if (!r || r.ownerUserId != null)
          return { ...fail, error: "Shared recipe not found." };
        await db
          .update(schema.recipes)
          .set(values)
          .where(eq(schema.recipes.id, args.id));
        await db
          .delete(schema.recipeIngredients)
          .where(eq(schema.recipeIngredients.recipeId, args.id));
      } else {
        const inserted = await db
          .insert(schema.recipes)
          .values({ ...values, ownerUserId: null })
          .returning({ id: schema.recipes.id });
        recipeId = inserted[0]?.id ?? null;
        if (recipeId == null)
          return { ...fail, error: "Could not create the recipe." };
      }
      await db.insert(schema.recipeIngredients).values(
        resolvedIngredients.map((ing, i) => ({
          recipeId: recipeId as number,
          foodId: ing.foodId,
          name: ing.name,
          quantityGrams: ing.quantityGrams,
          position: i,
        })),
      );
      await logAdminAction(
        db,
        admin,
        args.id != null ? "recipe.update" : "recipe.create",
        "recipe",
        recipeId,
        `${args.id != null ? "Updated" : "Created"} shared recipe "${args.name}" with ${resolvedIngredients.length} ingredients`,
      );
      ctx.invalidateQueries();
      return { ok: true, error: null, recipeId };
    },
  }),

  adminDeleteRecipe: defineAction({
    description:
      "Admin-only delete of a SHARED recipe (also removes it from favourites and meal plans). User-owned recipes are never touched. Audit-logged.",
    request: z.object({
      token: z.string().min(1).max(200),
      recipeId: z.number().int().positive(),
    }),
    response: okResponse,
    async handler(ctx, args): Promise<z.infer<typeof okResponse>> {
      const db = ctx.db<typeof schema>();
      const admin = await requireAdmin(db, args.token);
      if ("error" in admin) return { ok: false, error: admin.error };
      const rows = await db
        .select()
        .from(schema.recipes)
        .where(eq(schema.recipes.id, args.recipeId))
        .limit(1);
      const r = rows[0];
      if (!r || r.ownerUserId != null)
        return { ok: false, error: "Shared recipe not found." };
      await db
        .delete(schema.recipeIngredients)
        .where(eq(schema.recipeIngredients.recipeId, args.recipeId));
      await db
        .delete(schema.favouriteRecipes)
        .where(eq(schema.favouriteRecipes.recipeId, args.recipeId));
      await db
        .delete(schema.mealPlanEntries)
        .where(eq(schema.mealPlanEntries.recipeId, args.recipeId));
      await db
        .delete(schema.recipes)
        .where(eq(schema.recipes.id, args.recipeId));
      await logAdminAction(
        db,
        admin,
        "recipe.delete",
        "recipe",
        args.recipeId,
        `Deleted shared recipe "${r.name}"`,
      );
      ctx.invalidateQueries();
      return { ok: true, error: null };
    },
  }),

  adminListAudit: defineAction({
    description:
      "Admin-only audit log of administrative changes (who, when, what), newest first.",
    request: z.object({
      token: z.string().min(1).max(200),
      limit: z.number().int().min(1).max(100).default(50),
    }),
    response: z.object({
      ok: z.boolean(),
      error: z.string().nullable(),
      entries: z.array(
        z.object({
          id: z.number(),
          adminEmail: z.string(),
          action: z.string(),
          entityType: z.string(),
          entityId: z.number().nullable(),
          summary: z.string(),
          createdAt: z.string(),
        }),
      ),
    }),
    async handler(ctx, args) {
      const fail = { ok: false, error: "Admin access required.", entries: [] };
      const db = ctx.db<typeof schema>();
      const admin = await requireAdmin(db, args.token);
      if ("error" in admin) return { ...fail, error: admin.error };
      const rows = await db
        .select()
        .from(schema.adminAuditLog)
        .orderBy(desc(schema.adminAuditLog.id))
        .limit(args.limit);
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
          createdAt: r.createdAt.toISOString(),
        })),
      };
    },
  }),
} satisfies ActionsModule;
