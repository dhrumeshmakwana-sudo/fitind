// FITIND database schema (Phase 1 foundation).
//
// Tables created in Phase 1: users, sessions, profiles, user_goals,
// user_preferences, weight_logs. Later phases add foods, meals, exercises,
// workouts and challenges as their own migrations — no placeholder tables
// for unbuilt features.
//
// Every user-owned table carries user_id and every server action filters
// by the authenticated session's user_id, so one account can never read
// or modify another account's rows (row-level isolation enforced in the
// server layer).

import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  passwordSalt: text("password_salt").notNull(),
  displayName: text("display_name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const sessions = sqliteTable("sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  tokenHash: text("token_hash").notNull().unique(),
  // Phase 5: the browser/device string sent at login, so Settings can
  // list the user's real sessions. Null for sessions created before
  // this column existed — shown honestly as "unknown device".
  userAgent: text("user_agent"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
});

export const profiles = sqliteTable("profiles", {
  userId: integer("user_id")
    .primaryKey()
    .references(() => users.id),
  displayName: text("display_name").notNull(),
  dateOfBirth: text("date_of_birth"), // ISO date YYYY-MM-DD, optional
  heightCm: real("height_cm"),
  weightKg: real("weight_kg"),
  // Used only for the Mifflin–St Jeor calorie estimate; nullable so the
  // user can decline and still use the app.
  sex: text("sex", { enum: ["male", "female", "other"] }),
  activityLevel: text("activity_level", {
    enum: ["sedentary", "light", "moderate", "active", "very_active"],
  }),
  experience: text("experience", {
    enum: ["beginner", "intermediate", "advanced"],
  }),
  onboardingCompleted: integer("onboarding_completed").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const userGoals = sqliteTable("user_goals", {
  userId: integer("user_id")
    .primaryKey()
    .references(() => users.id),
  mainGoal: text("main_goal", {
    enum: ["muscle_gain", "fat_loss", "maintenance", "general_fitness", "strength"],
  }),
  targetWeightKg: real("target_weight_kg"),
  // Manual calorie target set by the user; overrides the estimate.
  calorieTargetOverride: integer("calorie_target_override"),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const userPreferences = sqliteTable("user_preferences", {
  userId: integer("user_id")
    .primaryKey()
    .references(() => users.id),
  dietPreference: text("diet_preference", {
    enum: ["vegetarian", "vegan", "eggetarian", "non_vegetarian", "custom"],
  }),
  dietCustomNote: text("diet_custom_note"),
  allergies: text("allergies"), // free text, comma separated
  trainingDaysPerWeek: integer("training_days_per_week"),
  equipment: text("equipment", {
    enum: ["full_gym", "home_equipment", "bodyweight", "custom"],
  }),
  equipmentCustomNote: text("equipment_custom_note"),
  units: text("units", { enum: ["metric", "imperial"] })
    .notNull()
    .default("metric"),
  // Phase 4: the user's own daily water target in ml. NULL means "not
  // set" — the app then shows 2,500 ml as a suggestion, never a rule.
  waterTargetMl: integer("water_target_ml"),
  notifyMeals: integer("notify_meals").notNull().default(0),
  notifyWater: integer("notify_water").notNull().default(0),
  notifyWorkouts: integer("notify_workouts").notNull().default(0),
  profilePrivate: integer("profile_private").notNull().default(1),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// ------------------------------------------------------------ Phase 2
// Food catalogue + diary. `foods` rows with owner_user_id NULL are the
// shared seeded catalogue; rows with an owner are that user's private
// custom foods. Diary entries store a full nutrition SNAPSHOT taken at
// logging time, so editing a food later never rewrites diary history.

export const foods = sqliteTable("foods", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  // Comma-separated local names / spellings, searched alongside `name`.
  aliases: text("aliases").notNull().default(""),
  category: text("category").notNull(),
  cuisine: text("cuisine").notNull(),
  dietFlag: text("diet_flag", {
    enum: ["veg", "vegan", "eggetarian", "non_veg"],
  }).notNull(),
  kcalPer100: real("kcal_per100").notNull(),
  proteinPer100: real("protein_per100").notNull(),
  carbsPer100: real("carbs_per100").notNull(),
  fatPer100: real("fat_per100").notNull(),
  fibrePer100: real("fibre_per100").notNull(),
  servingName: text("serving_name").notNull(),
  servingGrams: real("serving_grams").notNull(),
  source: text("source").notNull(),
  // "estimate" = standard reference values, home preparation varies.
  // "verified" = checked against a named published source.
  // "user" = submitted by a user as a custom food.
  verification: text("verification", {
    enum: ["estimate", "verified", "user"],
  })
    .notNull()
    .default("estimate"),
  notes: text("notes"),
  ownerUserId: integer("owner_user_id").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const diaryEntries = sqliteTable("diary_entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  foodId: integer("food_id").references(() => foods.id),
  loggedOn: text("logged_on").notNull(), // local date YYYY-MM-DD
  meal: text("meal", {
    enum: ["breakfast", "lunch", "snacks", "dinner", "custom"],
  }).notNull(),
  quantityGrams: real("quantity_grams").notNull(),
  servings: real("servings"), // set when the user logged by servings
  // --- snapshot of the food as it was when logged ---
  foodName: text("food_name").notNull(),
  kcalPer100: real("kcal_per100").notNull(),
  proteinPer100: real("protein_per100").notNull(),
  carbsPer100: real("carbs_per100").notNull(),
  fatPer100: real("fat_per100").notNull(),
  fibrePer100: real("fibre_per100").notNull(),
  servingName: text("serving_name").notNull(),
  servingGrams: real("serving_grams").notNull(),
  // Idempotency key from the client: a retried/double submission with
  // the same key returns the existing entry instead of duplicating it.
  clientKey: text("client_key"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const favouriteFoods = sqliteTable("favourite_foods", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  foodId: integer("food_id")
    .notNull()
    .references(() => foods.id),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// ------------------------------------------------------------ Phase 3
// Workouts. `exercises` is the shared seeded library (text only — no
// images/videos are licensed or configured). Routines are user-owned.
// A workout session is created in_progress and only becomes history
// when the user finishes it; its exercises snapshot the library name /
// muscle group / kind at start time, and sets record what was actually
// done. Personal records are computed from completed sessions only.

export const exercises = sqliteTable("exercises", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  primaryMuscle: text("primary_muscle").notNull(),
  secondaryMuscles: text("secondary_muscles").notNull().default(""),
  equipment: text("equipment").notNull(),
  difficulty: text("difficulty", {
    enum: ["beginner", "intermediate", "advanced"],
  }).notNull(),
  pattern: text("pattern").notNull(),
  // weighted = reps + load; bodyweight = reps only; timed = seconds.
  kind: text("kind", { enum: ["weighted", "bodyweight", "timed"] })
    .notNull()
    .default("weighted"),
  instructions: text("instructions").notNull(),
  mistakes: text("mistakes").notNull(),
  suggestedSets: integer("suggested_sets").notNull(),
  suggestedReps: text("suggested_reps").notNull(),
  restSeconds: integer("rest_seconds").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const routines = sqliteTable("routines", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(),
  notes: text("notes"),
  // Set when the routine was copied from a built-in template.
  sourceTemplate: text("source_template"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const routineExercises = sqliteTable("routine_exercises", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  routineId: integer("routine_id")
    .notNull()
    .references(() => routines.id),
  exerciseId: integer("exercise_id")
    .notNull()
    .references(() => exercises.id),
  position: integer("position").notNull(),
  targetSets: integer("target_sets").notNull(),
  targetReps: text("target_reps").notNull(),
  restSeconds: integer("rest_seconds").notNull(),
  notes: text("notes"),
});

export const workoutSessions = sqliteTable("workout_sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  routineId: integer("routine_id").references(() => routines.id),
  title: text("title").notNull(),
  status: text("status", { enum: ["in_progress", "completed"] })
    .notNull()
    .default("in_progress"),
  // The user's local calendar date when the session started.
  startedOn: text("started_on").notNull(),
  startedAt: integer("started_at", { mode: "timestamp_ms" }).notNull(),
  endedAt: integer("ended_at", { mode: "timestamp_ms" }),
  durationSeconds: integer("duration_seconds"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const sessionExercises = sqliteTable("session_exercises", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: integer("session_id")
    .notNull()
    .references(() => workoutSessions.id),
  exerciseId: integer("exercise_id")
    .notNull()
    .references(() => exercises.id),
  position: integer("position").notNull(),
  // --- snapshot of the exercise as it was when the session started ---
  exerciseName: text("exercise_name").notNull(),
  primaryMuscle: text("primary_muscle").notNull(),
  kind: text("kind", { enum: ["weighted", "bodyweight", "timed"] }).notNull(),
  restSeconds: integer("rest_seconds").notNull(),
  // Skipped (or substituted away) exercises stay visible in the record
  // but their sets never count toward volume or personal records.
  skipped: integer("skipped").notNull().default(0),
  notes: text("notes"),
});

export const workoutSets = sqliteTable("workout_sets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionExerciseId: integer("session_exercise_id")
    .notNull()
    .references(() => sessionExercises.id),
  setNumber: integer("set_number").notNull(),
  reps: integer("reps"),
  loadKg: real("load_kg"),
  durationSeconds: integer("duration_seconds"),
  completed: integer("completed").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const weightLogs = sqliteTable("weight_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  weightKg: real("weight_kg").notNull(),
  loggedOn: text("logged_on").notNull(), // local date YYYY-MM-DD
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// ------------------------------------------------------------ Phase 4
// Progress, water, recipes, challenges. Measurements and water entries
// are per-user dated logs like weight_logs. Recipes mirror the food
// catalogue: rows with owner_user_id NULL are the shared seeded library;
// a recipe's nutrition is never stored — it is always calculated from
// its ingredients' catalogue values, so it can never drift from the
// catalogue. Challenges are fully manual: a check row exists only
// because the user ticked that task on that date.

export const measurements = sqliteTable("measurements", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  loggedOn: text("logged_on").notNull(), // local date YYYY-MM-DD
  // All optional, stored in cm; the client converts for imperial users.
  waistCm: real("waist_cm"),
  chestCm: real("chest_cm"),
  armCm: real("arm_cm"),
  thighCm: real("thigh_cm"),
  hipCm: real("hip_cm"),
  neckCm: real("neck_cm"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const waterEntries = sqliteTable("water_entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  loggedOn: text("logged_on").notNull(), // local date YYYY-MM-DD
  amountMl: integer("amount_ml").notNull(),
  clientKey: text("client_key"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const recipes = sqliteTable("recipes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  category: text("category", {
    enum: ["breakfast", "lunch", "dinner", "snacks"],
  }).notNull(),
  dietFlag: text("diet_flag", {
    enum: ["veg", "vegan", "eggetarian", "non_veg"],
  }).notNull(),
  servings: real("servings").notNull(),
  prepMinutes: integer("prep_minutes").notNull(),
  cookMinutes: integer("cook_minutes"),
  // Steps stored one per line.
  steps: text("steps").notNull().default(""),
  budget: integer("budget").notNull().default(0),
  ownerUserId: integer("owner_user_id").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const recipeIngredients = sqliteTable("recipe_ingredients", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  recipeId: integer("recipe_id")
    .notNull()
    .references(() => recipes.id),
  // Null only if the catalogue food was deleted after the fact; the
  // name snapshot keeps the ingredient list readable and its nutrition
  // contribution becomes 0 rather than breaking the recipe.
  foodId: integer("food_id").references(() => foods.id),
  name: text("name").notNull(),
  quantityGrams: real("quantity_grams").notNull(),
  position: integer("position").notNull(),
});

export const favouriteRecipes = sqliteTable("favourite_recipes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  recipeId: integer("recipe_id")
    .notNull()
    .references(() => recipes.id),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const mealPlanEntries = sqliteTable("meal_plan_entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  weekday: integer("weekday").notNull(), // 0 = Monday … 6 = Sunday
  meal: text("meal", {
    enum: ["breakfast", "lunch", "snacks", "dinner", "custom"],
  }).notNull(),
  recipeId: integer("recipe_id")
    .notNull()
    .references(() => recipes.id),
  servings: real("servings").notNull().default(1),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const challenges = sqliteTable("challenges", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(),
  // "reset30" | "strong75" for templates; null for custom challenges.
  template: text("template"),
  totalDays: integer("total_days").notNull(),
  startedOn: text("started_on").notNull(), // local date YYYY-MM-DD
  status: text("status", { enum: ["active", "paused"] })
    .notNull()
    .default("active"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const challengeTasks = sqliteTable("challenge_tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  challengeId: integer("challenge_id")
    .notNull()
    .references(() => challenges.id),
  label: text("label").notNull(),
  position: integer("position").notNull(),
});

export const challengeChecks = sqliteTable("challenge_checks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  challengeId: integer("challenge_id")
    .notNull()
    .references(() => challenges.id),
  taskId: integer("task_id")
    .notNull()
    .references(() => challengeTasks.id),
  loggedOn: text("logged_on").notNull(), // local date YYYY-MM-DD
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// ------------------------------------------------------------ Phase 5
// Admin. Admin status lives ONLY in `admin_roles` — it is never a
// column on users/profiles and no user-facing action can write it.
// The first admin is created by a one-time bootstrap action that only
// succeeds while the table is empty; after that, no in-app path can
// grant admin (see BUILD_STATUS for the owner instructions). Every
// admin action re-checks this table on the server, and every admin
// change to shared content is written to `admin_audit_log`.

export const adminRoles = sqliteTable("admin_roles", {
  userId: integer("user_id")
    .primaryKey()
    .references(() => users.id),
  // "bootstrap" for the first-admin claim; no other grant path exists
  // in-app in this environment.
  grantMethod: text("grant_method").notNull(),
  grantedAt: integer("granted_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const adminAuditLog = sqliteTable("admin_audit_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  adminUserId: integer("admin_user_id").notNull(),
  // Email snapshot so the log stays readable after the admin account
  // is renamed or deleted.
  adminEmail: text("admin_email").notNull(),
  action: text("action").notNull(), // e.g. "food.update", "admin.claim"
  entityType: text("entity_type").notNull(), // "food" | "exercise" | "recipe" | "admin"
  entityId: integer("entity_id"),
  summary: text("summary").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const challengeDayNotes = sqliteTable("challenge_day_notes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  challengeId: integer("challenge_id")
    .notNull()
    .references(() => challenges.id),
  loggedOn: text("logged_on").notNull(), // local date YYYY-MM-DD
  note: text("note").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});
