// FITIND client (first-design palette, restored).
//
// Screens: public landing, login, signup, a 4-step onboarding wizard,
// and the signed-in app (sidebar on desktop, bottom nav on mobile) with
// Dashboard, Food Diary, Food Search, Workouts (library, routines, live
// sessions, history, records), Progress (real-data charts, measurements,
// hydration), Recipes & meal plan, Challenges, Profile & Settings and
// Build Status. All data comes from the server actions in
// server/src/actions.ts; nothing here invents numbers.
//
// Design: editorial, type-led, no photography. The first design's
// basic palette — warm cream #EBE9E1, vivid red-orange #E43D12,
// near-black ink #16140F, near-black sidebar, and the small accents
// #D6536D / #FFA286 / #EFB11D — with giant heavy display type on the
// landing and quiet cream-step cards inside.

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SafeAreaTopScrim } from "@hatch/space-sdk/client";
import { api, type ApiResponse } from "./api";

type Profile = NonNullable<ApiResponse<typeof api, "getSession">["profile"]>;
type Targets = NonNullable<ApiResponse<typeof api, "getSession">["targets"]>;
type Food = ApiResponse<typeof api, "searchFoods">["foods"][number];
type DiaryEntry = ApiResponse<typeof api, "getDiary">["entries"][number];
type Exercise = ApiResponse<typeof api, "searchExercises">["exercises"][number];
type RoutineSummary = ApiResponse<typeof api, "getRoutines">["routines"][number];
type RoutineDetail = NonNullable<ApiResponse<typeof api, "getRoutine">["routine"]>;
type WorkoutSessionData = NonNullable<
  ApiResponse<typeof api, "getWorkoutSession">["session"]
>;
type SessionExerciseData = WorkoutSessionData["exercises"][number];
type PrRecord = ApiResponse<typeof api, "getPersonalRecords">["records"][number];
type ProgressData = ApiResponse<typeof api, "getProgress">;
type MeasurementRow = ProgressData["measurements"][number];
type RecipeSummary = ApiResponse<typeof api, "searchRecipes">["recipes"][number];
type RecipeDetailData = NonNullable<ApiResponse<typeof api, "getRecipe">["recipe"]>;
type ChallengeSummaryData =
  ApiResponse<typeof api, "getChallenges">["challenges"][number];

const MUSCLE_GROUPS = [
  "Chest",
  "Back",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Legs",
  "Glutes",
  "Core",
  "Full Body",
];
const EQUIPMENT_LIST = [
  "Barbell",
  "Dumbbell",
  "Cable",
  "Machine",
  "Bodyweight",
  "Kettlebell",
  "Bench",
];
const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};
type MealKey = "breakfast" | "lunch" | "snacks" | "dinner" | "custom";

const MEAL_ORDER: MealKey[] = ["breakfast", "lunch", "snacks", "dinner", "custom"];
const MEAL_LABELS: Record<MealKey, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  snacks: "Evening snacks",
  dinner: "Dinner",
  custom: "Custom",
};
const DIET_FLAG_LABELS: Record<string, string> = {
  veg: "Veg",
  vegan: "Vegan",
  eggetarian: "Eggetarian",
  non_veg: "Non-veg",
};
const FOOD_CATEGORIES = [
  "Breakfast",
  "Breads & Rice",
  "Dal & Legumes",
  "Sabzi & Curries",
  "South Indian",
  "Street Food & Snacks",
  "Dairy & Eggs",
  "Meat & Fish",
  "Fruits",
  "Vegetables",
  "Nuts, Seeds & Dry Fruits",
  "Sweets & Desserts",
  "Drinks",
  "Raw Ingredients",
];
const FOOD_CUISINES = [
  "Pan-Indian",
  "North Indian",
  "Punjabi",
  "Gujarati",
  "Maharashtrian",
  "South Indian",
  "Bengali",
];

const TOKEN_KEY = "fitind.session.token";

// ------------------------------------------------------------ formatting

const GOAL_LABELS: Record<string, string> = {
  muscle_gain: "Muscle gain",
  fat_loss: "Fat loss",
  maintenance: "Maintenance",
  general_fitness: "General fitness",
  strength: "Strength",
};
const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: "Sedentary — desk job, little exercise",
  light: "Light — exercise 1–3 days/week",
  moderate: "Moderate — exercise 3–5 days/week",
  active: "Active — hard exercise 6–7 days/week",
  very_active: "Very active — physical job + training",
};
const DIET_LABELS: Record<string, string> = {
  vegetarian: "Vegetarian",
  vegan: "Vegan",
  eggetarian: "Eggetarian",
  non_vegetarian: "Non-vegetarian",
  custom: "Custom",
};
const EQUIPMENT_LABELS: Record<string, string> = {
  full_gym: "Full gym",
  home_equipment: "Home equipment",
  bodyweight: "Bodyweight only",
  custom: "Custom",
};
const EXPERIENCE_LABELS: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

function kgToLb(kg: number): number {
  return kg * 2.20462;
}
function lbToKg(lb: number): number {
  return lb / 2.20462;
}
function fmtWeight(kg: number | null, units: string): string {
  if (kg == null) return "—";
  if (units === "imperial") return `${kgToLb(kg).toFixed(1)} lb`;
  return `${kg.toFixed(1)} kg`;
}
function fmtHeight(cm: number | null, units: string): string {
  if (cm == null) return "—";
  if (units === "imperial") {
    const totalIn = cm / 2.54;
    const ft = Math.floor(totalIn / 12);
    const inch = Math.round(totalIn - ft * 12);
    return `${ft} ft ${inch} in`;
  }
  return `${Math.round(cm)} cm`;
}
function todayLocal(): string {
  const d = new Date();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}
function prettyDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
function num(v: string): number | null {
  if (v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function mondayLocal(): string {
  const d = new Date();
  const shift = (d.getDay() + 6) % 7; // days since Monday
  d.setDate(d.getDate() - shift);
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}
function fmtDuration(totalSeconds: number | null): string {
  if (totalSeconds == null) return "—";
  const s = Math.round(totalSeconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m} min`;
  return `${s} sec`;
}
function fmtClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = h > 0 ? `${m}`.padStart(2, "0") : `${m}`;
  return `${h > 0 ? `${h}:` : ""}${mm}:${`${sec}`.padStart(2, "0")}`;
}
function fmtLoad(kg: number | null, units: string): string {
  if (kg == null) return "—";
  if (units === "imperial") return `${Math.round(kgToLb(kg) * 10) / 10} lb`;
  return `${Math.round(kg * 10) / 10} kg`;
}
function fmtVolume(kg: number, units: string): string {
  if (units === "imperial")
    return `${Math.round(kgToLb(kg)).toLocaleString("en-IN")} lb`;
  return `${Math.round(kg).toLocaleString("en-IN")} kg`;
}

// ------------------------------------------------------------------ icons

function Icon({ d, children }: { d?: string; children?: ReactNode }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {d ? <path d={d} /> : children}
    </svg>
  );
}
const I = {
  home: (
    <Icon>
      <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1z" />
    </Icon>
  ),
  diary: (
    <Icon>
      <path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z" />
      <path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z" />
    </Icon>
  ),
  search: (
    <Icon>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.5-4.5" />
    </Icon>
  ),
  target: (
    <Icon>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </Icon>
  ),
  dumbbell: (
    <Icon>
      <path d="M6.5 6.5v11M3.5 9v6M17.5 6.5v11M20.5 9v6M6.5 12h11" />
    </Icon>
  ),
  chart: (
    <Icon>
      <path d="M3 3v18h18" />
      <path d="M8 17v-6M13 17V7M18 17v-3" />
    </Icon>
  ),
  utensils: (
    <Icon>
      <path d="M6 2v20M3 2v4a3 3 0 0 0 6 0V2M6 6v4" />
      <path d="M20 15V2a5 5 0 0 0-4 5v6a2 2 0 0 0 2 2h2zm0 0v7" />
    </Icon>
  ),
  trophy: (
    <Icon>
      <path d="M8 21h8M12 17v4M7 4h10v6a5 5 0 0 1-10 0V4z" />
      <path d="M7 6H4a1 1 0 0 0-1 1c0 2 1.5 3 4 3M17 6h3a1 1 0 0 1 1 1c0 2-1.5 3-4 3" />
    </Icon>
  ),
  shield: (
    <Icon>
      <path d="M12 3l7 3v5c0 5-3.2 8.4-7 10-3.8-1.6-7-5-7-10V6z" />
      <path d="m9.5 12 2 2 3.5-4" />
    </Icon>
  ),
  user: (
    <Icon>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
    </Icon>
  ),
  info: (
    <Icon>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </Icon>
  ),
  logout: (
    <Icon>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5M21 12H9" />
    </Icon>
  ),
  eye: (
    <Icon>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </Icon>
  ),
  eyeOff: (
    <Icon>
      <path d="M17.94 17.94A10.6 10.6 0 0 1 12 19c-6.5 0-10-7-10-7a17.6 17.6 0 0 1 4.06-4.94M9.9 4.24A9.5 9.5 0 0 1 12 5c6.5 0 10 7 10 7a17.7 17.7 0 0 1-2.16 3.19M14.12 14.12A3 3 0 1 1 9.88 9.88" />
      <path d="m2 2 20 20" />
    </Icon>
  ),
  trash: (
    <Icon>
      <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </Icon>
  ),
  download: (
    <Icon>
      <path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </Icon>
  ),
  check: <Icon d="M20 6 9 17l-5-5" />,
  plus: <Icon d="M12 5v14M5 12h14" />,
  x: <Icon d="M18 6 6 18M6 6l12 12" />,
  edit: (
    <Icon>
      <path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </Icon>
  ),
  star: (
    <Icon>
      <path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6L12 16.7 6.6 19.6l1.1-6L3.2 9.4l6.1-.8z" />
    </Icon>
  ),
  arrowRight: <Icon d="M5 12h14m-6-6 6 6-6 6" />,
  chevronLeft: <Icon d="m14 6-6 6 6 6" />,
  chevronRight: <Icon d="m10 6 6 6-6 6" />,
  flame: (
    <Icon>
      <path d="M12 22c4.4 0 7-2.8 7-6.5 0-3.2-2.1-5.4-3.5-7C14 6.8 13 5 13 2c-3 2-5.5 5-5.5 8.5 0 1 .2 1.9.6 2.7C7.3 12.4 6.6 11.4 6.2 10 5.5 11.2 5 12.8 5 15.5 5 19.2 7.6 22 12 22z" />
    </Icon>
  ),
  play: <Icon d="M6 4.5v15l13-7.5z" />,
  clock: (
    <Icon>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </Icon>
  ),
  copy: (
    <Icon>
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </Icon>
  ),
  chevronUp: <Icon d="m6 14 6-6 6 6" />,
  chevronDown: <Icon d="m6 10 6 6 6-6" />,
  swap: <Icon d="M7 4 3 8l4 4M3 8h14M17 12l4 4-4 4M21 16H7" />,
  timer: (
    <Icon>
      <path d="M10 2h4M12 8v5l3 2" />
      <circle cx="12" cy="14" r="7" />
    </Icon>
  ),
};

// ------------------------------------------------------------ primitives

const inputCls =
  "w-full rounded-[8px] border border-[var(--border)] bg-[var(--input)] px-3.5 py-3 text-base text-[var(--text)] transition-colors duration-150 placeholder:text-[var(--faint)] hover:border-[var(--border-strong)] focus:border-[var(--accent)] focus:outline-none";
const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-[8px] bg-[var(--accent-btn)] px-5 py-3 text-sm font-semibold text-white transition-all duration-150 hover:bg-[var(--accent-dark)] active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100";
const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded-[8px] border border-[var(--border-strong)] bg-[var(--surface)] px-5 py-3 text-sm font-semibold text-[var(--ink)] transition-all duration-150 hover:border-[var(--ink)] active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100";
const btnInk =
  "inline-flex items-center justify-center gap-2 rounded-[8px] bg-[var(--ink)] px-5 py-3 text-sm font-semibold text-[var(--bg)] transition-all duration-150 hover:bg-[var(--accent-btn)] hover:text-white active:scale-[0.98] disabled:opacity-50";
const btnDanger =
  "inline-flex items-center justify-center gap-2 rounded-[8px] border border-[var(--accent)] bg-transparent px-5 py-3 text-sm font-semibold text-[var(--accent-text)] transition-colors duration-150 hover:bg-[var(--accent-soft)] disabled:opacity-50";
const linkBtn =
  "inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--text)] underline decoration-[var(--accent)] decoration-2 underline-offset-4 transition-colors hover:text-[var(--accent-text)]";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="kicker mb-2 block text-[var(--dim)]">{label}</span>
      {children}
      {hint ? (
        <span className="mt-1.5 block text-xs text-[var(--faint)]">{hint}</span>
      ) : null}
    </label>
  );
}

/* Selectable option tiles — the core selection control for onboarding
   and settings. Big tap target, decisive selected state. */
function ChoiceTiles({
  label,
  options,
  value,
  onChange,
  cols = "sm:grid-cols-2",
}: {
  label: string;
  options: { value: string; label: string; hint?: string }[];
  value: string;
  onChange: (v: string) => void;
  cols?: string;
}) {
  return (
    <fieldset>
      <legend className="kicker mb-2 text-[var(--dim)]">{label}</legend>
      <div className={`grid grid-cols-1 gap-2 ${cols}`} role="radiogroup" aria-label={label}>
        {options.map((o) => {
          const active = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(active ? "" : o.value)}
              className={`relative rounded-[6px] border px-4 py-3.5 text-left transition-all duration-150 active:scale-[0.99] ${
                active
                  ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                  : "border-[var(--border-strong)] bg-[var(--surface)] hover:border-[var(--faint)]"
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className={`text-sm ${active ? "font-bold" : "font-medium"}`}>
                  {o.label}
                </span>
                <span
                  className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border ${
                    active
                      ? "border-[var(--accent-btn)] bg-[var(--accent-btn)] text-white"
                      : "border-[var(--border-strong)] text-transparent"
                  }`}
                  aria-hidden="true"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
              </span>
              {o.hint ? (
                <span className="mt-0.5 block text-xs text-[var(--dim)]">{o.hint}</span>
              ) : null}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {hint ? (
          <span className="mt-0.5 block text-xs text-[var(--faint)]">{hint}</span>
        ) : null}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
          checked ? "bg-[var(--accent)]" : "bg-[var(--surface-3)]"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all duration-200 ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

/* Framed panel — used where content genuinely groups (dashboard hero,
   account security, danger zone). */
function Panel({
  label,
  children,
  action,
  className = "",
}: {
  label?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[10px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)] sm:p-6 ${className}`}
    >
      {label ? (
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="kicker text-[var(--dim)]">{label}</h3>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

/* Unframed settings section — heading, rule, content. */
function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-[var(--border)] py-7 first:border-t-0 first:pt-0">
      <h3 className="font-display text-lg tracking-wide">{title}</h3>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function EmptyNote({ children }: { children: ReactNode }) {
  return (
    <p className="text-sm leading-relaxed text-[var(--dim)]">{children}</p>
  );
}

function ErrorBox({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="rounded-[8px] border border-[var(--accent)] bg-[var(--accent-soft)] px-3.5 py-2.5 text-sm text-[var(--text)]"
    >
      {message}
    </p>
  );
}

/* Loading placeholder rows while a list fetches — keeps layout stable
   instead of flashing "Loading…" text. Decorative; hidden from
   assistive tech, with a polite status for screen readers. */
function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div aria-hidden="true" className="divide-y divide-[var(--border)]">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-3 py-3.5">
          <div className="min-w-0 flex-1">
            <div className="h-4 w-2/5 animate-pulse rounded bg-[var(--surface-3)]" />
            <div className="mt-2 h-3 w-3/5 animate-pulse rounded bg-[var(--surface-2)]" />
          </div>
          <div className="h-8 w-16 animate-pulse rounded-[6px] bg-[var(--surface-2)]" />
        </div>
      ))}
      <span className="sr-only" role="status">
        Loading…
      </span>
    </div>
  );
}

function Wordmark({ size = "text-2xl" }: { size?: string }) {
  return (
    <span className={`font-display ${size} leading-none tracking-tight`}>
      FITIND<span className="text-[var(--accent)]">.</span>
    </span>
  );
}

// --------------------------------------------------------------- landing

const HERO_LINES = ["Train smart.", "Eat right.", "Track everything."];

const TICKER_WORDS = [
  "Train",
  "Roti",
  "Dal",
  "Paneer",
  "Protein",
  "Eat",
  "Idli",
  "Squat",
  "Track",
  "Chole",
  "Deadlift",
  "Progress",
];

/* One flat colour-step band: a giant word, an oversized index numeral
   and one CTA — nothing else. Scale, alignment rhythm and the palette
   steps carry the design; no pictures, no paragraph text. Alternate
   bands flip direction so the page reads as a designed sequence, not
   a stack. */
function StepBand({
  id,
  index,
  word,
  cta,
  onGo,
  bandClass,
  wordClass,
  numeralClass,
  ctaClass,
  flip = false,
}: {
  id: string;
  index: string;
  word: string;
  cta: string;
  onGo: () => void;
  bandClass: string;
  wordClass: string;
  numeralClass: string;
  ctaClass: string;
  flip?: boolean;
}) {
  return (
    <section id={id} className={`scroll-mt-20 ${bandClass}`}>
      {/* Stacked on phones — heading first, CTA below it in normal
          flow with real spacing, so the two can never overlap. From
          sm up they sit in one row with space-between; flipped bands
          mirror the row on desktop and right-align the stack on
          phones, keeping the alternating rhythm. */}
      <div
        className={`mx-auto flex w-full max-w-6xl flex-col gap-7 px-4 py-14 sm:flex-row sm:items-center sm:justify-between sm:gap-x-6 sm:px-6 sm:py-20 ${
          flip ? "items-end sm:flex-row-reverse" : "items-start"
        }`}
      >
        <div className="flex min-w-0 items-start gap-4 sm:gap-7">
          <span
            aria-hidden="true"
            className={`font-display mt-2 hidden text-2xl font-black leading-none sm:mt-4 sm:block sm:text-4xl ${numeralClass}`}
          >
            {index}
          </span>
          <h2
            className={`font-display text-[clamp(3.8rem,13vw,9.5rem)] font-black uppercase leading-[0.85] ${wordClass}`}
          >
            {word}
          </h2>
        </div>
        <button
          type="button"
          className={`inline-flex shrink-0 items-center gap-2 text-base font-bold sm:text-lg ${ctaClass}`}
          onClick={onGo}
        >
          {cta} {I.arrowRight}
        </button>
      </div>
    </section>
  );
}

function Landing({
  onLogin,
  onSignup,
  onSearch,
}: {
  onLogin: () => void;
  onSignup: () => void;
  onSearch: () => void;
}) {
  const [lineIdx, setLineIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(
      () => setLineIdx((i) => (i + 1) % HERO_LINES.length),
      2600,
    );
    return () => clearInterval(t);
  }, []);

  const navLink =
    "text-sm font-medium text-[var(--dim)] transition-colors hover:text-[var(--text)]";
  const tickerRow = (ariaHidden: boolean) => (
    <div className="flex shrink-0 items-center" aria-hidden={ariaHidden || undefined}>
      {TICKER_WORDS.map((w) => (
        <span
          key={w}
          className="flex items-center whitespace-nowrap text-lg font-black uppercase tracking-wide text-[#f5f1e6]"
        >
          <span className="px-4">{w}</span>
          <span className="text-[var(--accent)]">•</span>
        </span>
      ))}
    </div>
  );

  return (
    <div className="bg-[var(--bg)]">
      {/* Header: wordmark left, section links, actions right. */}
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg)]/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Wordmark size="text-2xl" />
          <nav className="hidden items-center gap-6 md:flex" aria-label="Sections">
            <a className={navLink} href="#train">Train</a>
            <a className={navLink} href="#eat">Eat</a>
            <a className={navLink} href="#track">Track</a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              className="rounded-full p-2 text-[var(--dim)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--text)]"
              onClick={onSearch}
              aria-label="Search food"
            >
              {I.search}
            </button>
            <button
              type="button"
              className="hidden px-2 py-2 text-sm font-semibold text-[var(--text)] transition-colors hover:text-[var(--accent-text)] sm:block"
              onClick={onLogin}
            >
              Log in
            </button>
            <button
              type="button"
              className="rounded-[8px] bg-[var(--accent-btn)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-dark)]"
              onClick={onSignup}
            >
              Join free
            </button>
          </div>
        </div>
      </header>

      {/* Hero — the giant wordmark is the design. Oversized type, one
          rotating line, two buttons, generous air. Nothing else. */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:pb-24 sm:pt-24">
        <h1
          className="hero-rise font-display text-[clamp(4.6rem,18.5vw,13.5rem)] font-black uppercase leading-[0.82]"
          aria-label="FITIND"
        >
          FITIND<span className="animate-pulse text-[var(--accent)]">.</span>
        </h1>
        <div className="fade-up-1 mt-9 flex items-center gap-3.5 sm:mt-12">
          <span aria-hidden="true" className="h-3 w-3 shrink-0 bg-[var(--accent)] sm:h-3.5 sm:w-3.5" />
          <p className="min-w-[12ch] text-3xl font-extrabold tracking-tight text-[var(--accent)] sm:text-[2.6rem] sm:leading-none" aria-live="off">
            <span key={lineIdx} className="fade-up inline-block">
              {HERO_LINES[lineIdx]}
            </span>
          </p>
        </div>
        <div className="fade-up-2 mt-10 flex flex-wrap items-center gap-3 sm:mt-12">
          <button
            type="button"
            className={`${btnPrimary} px-7 py-3.5 text-base`}
            onClick={onSignup}
          >
            Create free account {I.arrowRight}
          </button>
          <button
            type="button"
            className={`${btnGhost} px-6 py-3.5 text-base`}
            onClick={onLogin}
          >
            Log in
          </button>
        </div>
      </section>

      {/* Ticker — slow heavy words on a near-black band. */}
      <div
        className="overflow-hidden bg-[#16140f] py-3.5"
        aria-hidden="true"
      >
        <div className="ticker-track flex w-max">
          {tickerRow(false)}
          {tickerRow(true)}
        </div>
      </div>

      {/* The three steps as flat colour steps in the basic palette:
          peach → red-orange → near-black, alternating alignment. */}
      <StepBand
        id="train"
        index="01"
        word="Train."
        cta="Start training"
        onGo={onSignup}
        bandClass="bg-[var(--peach)]"
        wordClass="text-[var(--ink)]"
        numeralClass="text-[var(--accent)]"
        ctaClass="text-[var(--ink)] transition-opacity hover:opacity-70"
      />
      <StepBand
        id="eat"
        index="02"
        word="Eat."
        cta="See the food"
        onGo={onSignup}
        bandClass="bg-[var(--accent)]"
        wordClass="text-[#f5f1e6]"
        numeralClass="text-[var(--ink)]"
        ctaClass="rounded-full bg-[#16140f] px-5 py-2.5 text-[#f5f1e6] transition-opacity hover:opacity-85"
        flip
      />
      <StepBand
        id="track"
        index="03"
        word="Track."
        cta="Track progress"
        onGo={onSignup}
        bandClass="bg-[#16140f]"
        wordClass="text-[#f5f1e6]"
        numeralClass="text-[var(--accent)]"
        ctaClass="text-[var(--peach)] transition-opacity hover:opacity-75"
      />

      {/* Final join — back on cream after the near-black band: one
          heading, one button. */}
      <section>
        <div className="mx-auto w-full max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-24">
          <h2 className="font-display text-[clamp(2.4rem,7vw,4.5rem)] font-black leading-[0.95] text-[var(--ink)]">
            Your first week
            <br />
            starts here<span className="text-[var(--accent)]">.</span>
          </h2>
          <button
            type="button"
            className={`${btnPrimary} mt-9 px-8 py-4 text-base`}
            onClick={onSignup}
          >
            Create free account {I.arrowRight}
          </button>
        </div>
      </section>

      <footer>
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-xs text-[var(--faint)] sm:px-6">
          <span>
            <Wordmark size="text-sm" /> — Train Smart. Eat Right. Track Everything.
          </span>
        </div>
      </footer>
    </div>
  );
}

// ------------------------------------------------------------------ auth

function AuthForm({
  mode,
  notice,
  onDone,
  onSwitch,
  onBack,
}: {
  mode: "login" | "signup";
  notice: string | null;
  onDone: (token: string, profile: Profile) => void;
  onSwitch: () => void;
  onBack: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () =>
      mode === "signup"
        ? await api.signup({
            email,
            password,
            displayName: name,
            userAgent: navigator.userAgent,
          })
        : await api.login({
            email,
            password,
            userAgent: navigator.userAgent,
          }),
    onSuccess: (res) => {
      if (!res.ok || !res.token || !res.profile) {
        setError(res.error ?? "Something went wrong. Please try again.");
        return;
      }
      onDone(res.token, res.profile);
    },
    onError: () => setError("Could not reach the server. Please try again."),
  });

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Type side — flat red-orange panel, giant stacked words, no
          photo. The wordmark sits in its own scoped wrapper (cream
          letters, ink dot) — the scope must NOT sit on the panel
          itself, or the panel's own bg-[var(--accent)] would resolve
          to the overridden value. --dim is scoped on the panel only
          for the small print, which needs near-black to clear AA on
          the red-orange. */}
      <div
        className="hidden flex-col justify-between bg-[var(--accent)] p-10 text-[#f5f1e6] lg:flex"
        style={{ "--dim": "#140b03" } as CSSProperties}
      >
        <span style={{ "--accent": "#16140f" } as CSSProperties}>
          <Wordmark size="text-2xl" />
        </span>
        <div aria-hidden="true">
          <p className="font-display text-[clamp(3rem,6vw,5.5rem)] font-black uppercase leading-[0.95] text-[#f5f1e6]">
            Train.
          </p>
          <p className="font-display text-[clamp(3rem,6vw,5.5rem)] font-black uppercase leading-[0.95] text-[#16140f]">
            Eat.
          </p>
          <p className="font-display text-[clamp(3rem,6vw,5.5rem)] font-black uppercase leading-[0.95] text-[#f5f1e6]">
            Track.
          </p>
        </div>
        <p className="max-w-xs text-sm font-medium text-[var(--dim)]">
          Your food, your workouts, your progress — saved to your account,
          on every login.
        </p>
      </div>

      {/* Form side */}
      <div className="flex flex-col bg-[var(--bg)] px-4 pb-14 sm:px-8">
        <header className="flex items-center justify-between py-5">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--dim)] transition-colors hover:text-[var(--ink)]"
            aria-label="Back to home"
          >
            {I.chevronLeft} <Wordmark size="text-lg" />
          </button>
          <button
            type="button"
            className="kicker text-[var(--dim)] transition-colors hover:text-[var(--ink)]"
            onClick={onSwitch}
          >
            {mode === "signup" ? "Log in" : "Create account"}
          </button>
        </header>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center pt-8 lg:pt-0">
          <h1 className="font-display text-4xl leading-tight">
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-3 text-sm text-[var(--dim)]">
            {mode === "signup"
              ? "One account for your food, training and progress."
              : "Your targets and logs are where you left them."}
          </p>

          <form
            className="mt-8 space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              setError(null);
              mutation.mutate();
            }}
          >
            {notice ? <ErrorBox message={notice} /> : null}
            <ErrorBox message={error} />
            {mode === "signup" ? (
              <Field label="Your name">
                <input
                  className={inputCls}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                  placeholder="e.g. Dhru Makwana"
                />
              </Field>
            ) : null}
            <Field label="Email">
              <input
                className={inputCls}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                placeholder="you@example.com"
              />
            </Field>
            <Field
              label="Password"
              hint={mode === "signup" ? "At least 8 characters." : undefined}
            >
              <div className="relative">
                <input
                  className={`${inputCls} pr-12`}
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  aria-label="Password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-[4px] p-2 text-[var(--dim)] transition-colors hover:text-[var(--ink)]"
                  onClick={() => setShowPw((s) => !s)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? I.eyeOff : I.eye}
                </button>
              </div>
            </Field>
            <button
              type="submit"
              className={`${btnPrimary} w-full !py-3.5 text-base`}
              disabled={mutation.isPending}
            >
              {mutation.isPending
                ? "Please wait…"
                : mode === "signup"
                  ? "Create account"
                  : "Log in"}
            </button>
          </form>

          {mode === "login" ? (
            <p className="mt-5 text-xs leading-relaxed text-[var(--faint)]">
              Forgot your password? Password reset isn't available yet — no
              email service is connected, so nothing would actually be sent.
            </p>
          ) : null}

          <p className="mt-8 border-t border-[var(--border)] pt-5 text-sm text-[var(--dim)]">
            {mode === "signup" ? "Already have an account? " : "New to FITIND? "}
            <button
              type="button"
              className="font-bold text-[var(--accent-text)]"
              onClick={onSwitch}
            >
              {mode === "signup" ? "Log in" : "Create an account"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------- profile forms

type FormState = {
  displayName: string;
  dateOfBirth: string;
  heightCm: string;
  weightKg: string; // always stored in kg in the form state
  sex: string;
  activityLevel: string;
  experience: string;
  mainGoal: string;
  targetWeightKg: string;
  calorieOverride: string;
  dietPreference: string;
  dietCustomNote: string;
  allergies: string;
  trainingDays: string;
  equipment: string;
  equipmentCustomNote: string;
  units: string;
  notifyMeals: boolean;
  notifyWater: boolean;
  notifyWorkouts: boolean;
  profilePrivate: boolean;
};

function formFromProfile(p: Profile): FormState {
  return {
    displayName: p.displayName,
    dateOfBirth: p.dateOfBirth ?? "",
    heightCm: p.heightCm != null ? String(p.heightCm) : "",
    weightKg: p.weightKg != null ? String(p.weightKg) : "",
    sex: p.sex ?? "",
    activityLevel: p.activityLevel ?? "",
    experience: p.experience ?? "",
    mainGoal: p.mainGoal ?? "",
    targetWeightKg: p.targetWeightKg != null ? String(p.targetWeightKg) : "",
    calorieOverride:
      p.calorieTargetOverride != null ? String(p.calorieTargetOverride) : "",
    dietPreference: p.dietPreference ?? "",
    dietCustomNote: p.dietCustomNote ?? "",
    allergies: p.allergies ?? "",
    trainingDays:
      p.trainingDaysPerWeek != null ? String(p.trainingDaysPerWeek) : "",
    equipment: p.equipment ?? "",
    equipmentCustomNote: p.equipmentCustomNote ?? "",
    units: p.units,
    notifyMeals: p.notifyMeals,
    notifyWater: p.notifyWater,
    notifyWorkouts: p.notifyWorkouts,
    profilePrivate: p.profilePrivate,
  };
}

function orNull(v: string): string | null {
  return v === "" ? null : v;
}

function formToArgs(f: FormState) {
  return {
    displayName: f.displayName.trim() || undefined,
    dateOfBirth: f.dateOfBirth === "" ? null : f.dateOfBirth,
    heightCm: num(f.heightCm),
    weightKg: num(f.weightKg),
    sex: orNull(f.sex) as "male" | "female" | "other" | null,
    activityLevel: orNull(f.activityLevel) as
      | "sedentary"
      | "light"
      | "moderate"
      | "active"
      | "very_active"
      | null,
    experience: orNull(f.experience) as
      | "beginner"
      | "intermediate"
      | "advanced"
      | null,
    mainGoal: orNull(f.mainGoal) as
      | "muscle_gain"
      | "fat_loss"
      | "maintenance"
      | "general_fitness"
      | "strength"
      | null,
    targetWeightKg: num(f.targetWeightKg),
    calorieTargetOverride: num(f.calorieOverride),
    dietPreference: orNull(f.dietPreference) as
      | "vegetarian"
      | "vegan"
      | "eggetarian"
      | "non_vegetarian"
      | "custom"
      | null,
    dietCustomNote: f.dietCustomNote.trim() === "" ? null : f.dietCustomNote.trim(),
    allergies: f.allergies.trim() === "" ? null : f.allergies.trim(),
    trainingDaysPerWeek: num(f.trainingDays),
    equipment: orNull(f.equipment) as
      | "full_gym"
      | "home_equipment"
      | "bodyweight"
      | "custom"
      | null,
    equipmentCustomNote:
      f.equipmentCustomNote.trim() === "" ? null : f.equipmentCustomNote.trim(),
    units: f.units as "metric" | "imperial",
    notifyMeals: f.notifyMeals,
    notifyWater: f.notifyWater,
    notifyWorkouts: f.notifyWorkouts,
    profilePrivate: f.profilePrivate,
  };
}

/* Split "Light — exercise 1–3 days/week" into tile title + hint. */
function tileOptions(labels: Record<string, string>) {
  return Object.entries(labels).map(([value, label]) => {
    const [title, ...rest] = label.split(" — ");
    return {
      value,
      label: title ?? label,
      hint: rest.length > 0 ? rest.join(" — ") : undefined,
    };
  });
}

// -------------------------------------------------------------- onboarding

function Onboarding({
  token,
  profile,
  onFinished,
  onSkip,
}: {
  token: string;
  profile: Profile;
  onFinished: () => void;
  onSkip: () => void;
}) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(() => formFromProfile(profile));
  const [error, setError] = useState<string | null>(null);
  const set = (patch: Partial<FormState>) =>
    setForm((f) => ({ ...f, ...patch }));

  const save = useMutation({
    mutationFn: async () =>
      await api.saveProfile({
        token,
        markOnboardingComplete: true,
        ...formToArgs(form),
      }),
    onSuccess: (res) => {
      if (!res.ok) {
        setError(res.error ?? "Could not save. Please try again.");
        return;
      }
      void queryClient.invalidateQueries({ queryKey: ["session"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      onFinished();
    },
    onError: () => setError("Could not reach the server. Please try again."),
  });

  const steps = [
    { title: "About you", sub: "The basics. Everything here is private." },
    { title: "Body & goal", sub: "What you're working towards." },
    { title: "Training", sub: "How you train, and where." },
    { title: "Food & units", sub: "How you eat, and how you measure." },
  ];
  const current = steps[step];

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-16 sm:px-6">
      <header className="flex items-center justify-between py-5">
        <Wordmark />
        <button
          type="button"
          className="text-sm font-medium text-[var(--dim)] transition-colors hover:text-[var(--text)]"
          onClick={onSkip}
        >
          Skip for now
        </button>
      </header>

      {/* Progress */}
      <div className="mt-2">
        <div className="flex items-baseline justify-between">
          <p className="kicker text-[var(--accent-text)]">
            Step {step + 1} of {steps.length}
          </p>
          <p className="text-xs text-[var(--faint)]">All optional except your name</p>
        </div>
        <div
          className="mt-2.5 h-[3px] w-full overflow-hidden rounded-full bg-[var(--surface-3)]"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={steps.length}
          aria-valuenow={step + 1}
          aria-label="Onboarding progress"
        >
          <div
            className="h-full bg-[var(--accent)] transition-all duration-300"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      <h1 className="font-display mt-8 text-4xl leading-none sm:text-5xl">
        {current?.title}
      </h1>
      <p className="mt-2 text-sm text-[var(--dim)]">{current?.sub}</p>

      <div className="mt-8 space-y-6">
        <ErrorBox message={error} />

        {step === 0 ? (
          <>
            <Field label="What should we call you?">
              <input
                className={inputCls}
                value={form.displayName}
                onChange={(e) => set({ displayName: e.target.value })}
                autoComplete="name"
              />
            </Field>
            <Field
              label="Date of birth"
              hint="Sets your age for the calorie estimate."
            >
              <input
                className={inputCls}
                type="date"
                value={form.dateOfBirth}
                max={todayLocal()}
                onChange={(e) => set({ dateOfBirth: e.target.value })}
                aria-label="Date of birth"
              />
            </Field>
            <ChoiceTiles
              label="Sex"
              options={[
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "other", label: "Other", hint: "Uses the average of both formulas" },
              ]}
              value={form.sex}
              onChange={(v) => set({ sex: v })}
              cols="sm:grid-cols-3"
            />
          </>
        ) : null}

        {step === 1 ? (
          <>
            <ChoiceTiles
              label="Main goal"
              options={tileOptions(GOAL_LABELS)}
              value={form.mainGoal}
              onChange={(v) => set({ mainGoal: v })}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Height (cm)"
                hint={
                  form.heightCm && num(form.heightCm)
                    ? `≈ ${fmtHeight(num(form.heightCm), "imperial")}`
                    : undefined
                }
              >
                <input
                  className={inputCls}
                  type="number"
                  inputMode="decimal"
                  min={80}
                  max={260}
                  value={form.heightCm}
                  onChange={(e) => set({ heightCm: e.target.value })}
                  placeholder="172"
                />
              </Field>
              <Field label="Current weight (kg)">
                <input
                  className={inputCls}
                  type="number"
                  inputMode="decimal"
                  min={25}
                  max={500}
                  step="0.1"
                  value={form.weightKg}
                  onChange={(e) => set({ weightKg: e.target.value })}
                  placeholder="68.5"
                />
              </Field>
            </div>
            <Field label="Target weight (kg)">
              <input
                className={inputCls}
                type="number"
                inputMode="decimal"
                min={25}
                max={500}
                step="0.1"
                value={form.targetWeightKg}
                onChange={(e) => set({ targetWeightKg: e.target.value })}
                placeholder="Optional"
              />
            </Field>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <ChoiceTiles
              label="Activity level"
              options={tileOptions(ACTIVITY_LABELS)}
              value={form.activityLevel}
              onChange={(v) => set({ activityLevel: v })}
              cols="sm:grid-cols-1"
            />
            <ChoiceTiles
              label="Experience"
              options={tileOptions(EXPERIENCE_LABELS)}
              value={form.experience}
              onChange={(v) => set({ experience: v })}
              cols="sm:grid-cols-3"
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Training days / week">
                <input
                  className={inputCls}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={7}
                  value={form.trainingDays}
                  onChange={(e) => set({ trainingDays: e.target.value })}
                  placeholder="4"
                />
              </Field>
            </div>
            <ChoiceTiles
              label="Equipment"
              options={tileOptions(EQUIPMENT_LABELS)}
              value={form.equipment}
              onChange={(v) => set({ equipment: v })}
            />
            {form.equipment === "custom" ? (
              <Field label="Describe your equipment">
                <input
                  className={inputCls}
                  value={form.equipmentCustomNote}
                  onChange={(e) => set({ equipmentCustomNote: e.target.value })}
                  placeholder="e.g. Adjustable dumbbells + resistance bands"
                />
              </Field>
            ) : null}
          </>
        ) : null}

        {step === 3 ? (
          <>
            <ChoiceTiles
              label="Diet preference"
              options={tileOptions(DIET_LABELS)}
              value={form.dietPreference}
              onChange={(v) => set({ dietPreference: v })}
            />
            {form.dietPreference === "custom" ? (
              <Field label="Describe your diet preference">
                <input
                  className={inputCls}
                  value={form.dietCustomNote}
                  onChange={(e) => set({ dietCustomNote: e.target.value })}
                  placeholder="e.g. Jain, no onion/garlic"
                />
              </Field>
            ) : null}
            <Field label="Allergies or foods you avoid">
              <input
                className={inputCls}
                value={form.allergies}
                onChange={(e) => set({ allergies: e.target.value })}
                placeholder="None"
              />
            </Field>
            <ChoiceTiles
              label="Units"
              options={[
                { value: "metric", label: "Metric", hint: "kg / cm" },
                { value: "imperial", label: "Imperial", hint: "lb / ft-in" },
              ]}
              value={form.units}
              onChange={(v) => set({ units: v })}
            />
          </>
        ) : null}
      </div>

      <div className="mt-10 flex items-center justify-between gap-3 border-t border-[var(--border)] pt-5">
        <button
          type="button"
          className={btnGhost}
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
        >
          {I.chevronLeft} Back
        </button>
        {step < steps.length - 1 ? (
          <button
            type="button"
            className={btnPrimary}
            onClick={() => setStep((s) => s + 1)}
          >
            Continue {I.arrowRight}
          </button>
        ) : (
          <button
            type="button"
            className={btnPrimary}
            disabled={save.isPending}
            onClick={() => save.mutate()}
          >
            {save.isPending ? "Saving…" : "Finish setup"}
          </button>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------- dashboard

/* The day's calorie ring, driven by the real diary: the fill is the
   share of the target still remaining after today's logged food. */
function CalorieRing({
  targets,
  consumedKcal,
}: {
  targets: Targets;
  consumedKcal: number;
}) {
  const target = targets.calorieTarget ?? 0;
  const remaining = Math.max(0, Math.round(target - consumedKcal));
  const over = consumedKcal > target && target > 0;
  const size = 216;
  const stroke = 11;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const frac = target > 0 ? Math.min(1, Math.max(0, remaining / target)) : 0;
  const off = circ * (1 - frac);
  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={
        over
          ? `${Math.round(consumedKcal).toLocaleString("en-IN")} of ${target.toLocaleString("en-IN")} kilocalories logged today — over target`
          : `${remaining.toLocaleString("en-IN")} of ${target.toLocaleString("en-IN")} kilocalories remaining today`
      }
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--surface-3)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={off}
          className="ring-anim"
          style={
            {
              "--ring-circ": circ,
              "--ring-off": off,
            } as React.CSSProperties
          }
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="kicker text-[var(--faint)]">
          {over ? "Over by" : "Remaining"}
        </span>
        <span className="font-display tnum mt-1 text-[56px] leading-none">
          {(over ? Math.round(consumedKcal - target) : remaining).toLocaleString("en-IN")}
        </span>
        <span className="mt-1.5 text-xs font-medium text-[var(--dim)]">
          of {target.toLocaleString("en-IN")} kcal
        </span>
      </div>
    </div>
  );
}

/* Consumed vs target for one macro. */
function MacroBar({
  label,
  consumed,
  target,
  color,
}: {
  label: string;
  consumed: number;
  target: number | null;
  color: string;
}) {
  const pct =
    target != null && target > 0
      ? Math.min(100, (consumed / target) * 100)
      : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="kicker text-[var(--dim)]">{label}</span>
        <span className="tnum text-base font-bold">
          {Math.round(consumed)}
          <span className="ml-1 text-xs font-medium text-[var(--faint)]">
            / {target != null ? `${target} g` : "—"}
          </span>
        </span>
      </div>
      <div className="mt-1.5 h-[3px] w-full overflow-hidden rounded-full bg-[var(--surface-3)]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

type DayTotals = { kcal: number; protein: number; carbs: number; fat: number; fibre: number };

function TargetsHero({
  targets,
  today,
  bmi,
  onCompleteProfile,
  go,
}: {
  targets: Targets;
  today: { totals: DayTotals; entryCount: number };
  bmi: { value: number; category: string } | null;
  onCompleteProfile: () => void;
  go: (v: View) => void;
}) {
  const [showHow, setShowHow] = useState(false);
  if (targets.status === "missing_inputs") {
    return (
      <Panel label="Today">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="font-display text-4xl leading-none sm:text-5xl">
              Almost there.
            </p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-[var(--dim)]">
              Add your {targets.missing.join(", ")} and your daily target
              appears here.
            </p>
          </div>
          <button type="button" className={btnPrimary} onClick={onCompleteProfile}>
            Complete profile {I.arrowRight}
          </button>
        </div>
        {today.entryCount > 0 ? (
          <p className="mt-5 border-t border-[var(--border)] pt-4 text-sm text-[var(--dim)]">
            Logged today:{" "}
            <span className="tnum font-bold text-[var(--text)]">
              {Math.round(today.totals.kcal).toLocaleString("en-IN")} kcal
            </span>{" "}
            · {today.entryCount}{" "}
            {today.entryCount === 1 ? "entry" : "entries"}{" "}
            <button
              type="button"
              className="font-semibold text-[var(--accent-text)]"
              onClick={() => go("diary")}
            >
              Open diary
            </button>
          </p>
        ) : null}
      </Panel>
    );
  }
  const t = today.totals;
  return (
    <Panel label="Today">
      <div className="flex flex-col items-center gap-8 sm:flex-row sm:gap-10">
        <CalorieRing targets={targets} consumedKcal={t.kcal} />
        <div className="w-full min-w-0 flex-1">
          <div className="space-y-4">
            <MacroBar label="Protein" consumed={t.protein} target={targets.proteinG} color="var(--accent)" />
            <MacroBar label="Carbs" consumed={t.carbs} target={targets.carbsG} color="var(--amber)" />
            <MacroBar label="Fat" consumed={t.fat} target={targets.fatG} color="var(--rose)" />
          </div>
          <div className="mt-5 flex flex-wrap gap-x-7 gap-y-2 border-t border-[var(--border)] pt-4 text-sm">
            <span className="text-[var(--dim)]">
              Eaten{" "}
              <span className="tnum font-bold text-[var(--text)]">
                {Math.round(t.kcal).toLocaleString("en-IN")} kcal
              </span>
            </span>
            {targets.fibreG != null ? (
              <span className="text-[var(--dim)]">
                Fibre{" "}
                <span className="tnum font-bold text-[var(--text)]">
                  {Math.round(t.fibre)} / {targets.fibreG} g
                </span>
              </span>
            ) : null}
            {targets.bmr != null ? (
              <span className="text-[var(--dim)]">
                BMR{" "}
                <span className="tnum font-bold text-[var(--text)]">
                  {targets.bmr.toLocaleString("en-IN")}
                </span>
              </span>
            ) : null}
            {targets.tdee != null ? (
              <span className="text-[var(--dim)]">
                TDEE{" "}
                <span className="tnum font-bold text-[var(--text)]">
                  {targets.tdee.toLocaleString("en-IN")}
                </span>
              </span>
            ) : null}
            {bmi ? (
              <span className="text-[var(--dim)]">
                BMI{" "}
                <span className="tnum font-bold text-[var(--text)]">
                  {bmi.value.toFixed(1)}
                </span>{" "}
                · {bmi.category}
              </span>
            ) : null}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
            <button
              type="button"
              className={btnPrimary}
              onClick={() => go("diary")}
            >
              {today.entryCount > 0 ? "Open today's diary" : "Log food"} {I.arrowRight}
            </button>
            <p className="text-xs text-[var(--faint)]">
              {targets.status === "manual"
                ? "Target set by you."
                : "Estimate — Mifflin–St Jeor."}{" "}
              <button
                type="button"
                className="font-semibold text-[var(--dim)] underline decoration-[var(--border-strong)] underline-offset-2 transition-colors hover:text-[var(--text)]"
                onClick={() => setShowHow((s) => !s)}
                aria-expanded={showHow}
              >
                {showHow ? "Hide" : "How it's calculated"}
              </button>
            </p>
          </div>
          {showHow ? (
            <p className="mt-2 max-w-xl text-xs leading-relaxed text-[var(--dim)]">
              {targets.note}
              {bmi
                ? " BMI is a rough screening measure from your height and weight — it doesn't measure body fat or fitness directly."
                : ""}
            </p>
          ) : null}
        </div>
      </div>
    </Panel>
  );
}

/* Minimal weight trend from the user's real logs (oldest → newest). */
function WeightSparkline({
  entries,
  units,
}: {
  entries: { weightKg: number; loggedOn: string }[];
  units: string;
}) {
  const pts = [...entries].reverse();
  const W = 560;
  const H = 120;
  const PAD = 10;
  const values = pts.map((p) => p.weightKg);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const x = (i: number) =>
    pts.length === 1 ? W / 2 : PAD + (i * (W - PAD * 2)) / (pts.length - 1);
  const y = (v: number) => H - PAD - ((v - min) / span) * (H - PAD * 2);
  const line = pts.map((p, i) => `${x(i)},${y(p.weightKg)}`).join(" ");
  const area = `${PAD},${H} ${line} ${W - PAD},${H}`;
  const first = pts[0];
  const last = pts[pts.length - 1];
  return (
    <figure>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label={`Weight trend from ${first ? fmtWeight(first.weightKg, units) : ""} to ${last ? fmtWeight(last.weightKg, units) : ""} across ${pts.length} entries`}
        preserveAspectRatio="none"
        style={{ height: 96 }}
      >
        <polygon points={area} fill="var(--accent)" opacity="0.08" />
        <polyline
          points={line}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        {pts.map((p, i) => (
          <circle
            key={`${p.loggedOn}-${i}`}
            cx={x(i)}
            cy={y(p.weightKg)}
            r="3"
            fill="var(--bg)"
            stroke="var(--accent)"
            strokeWidth="1.6"
          />
        ))}
      </svg>
      <figcaption className="mt-1 flex justify-between text-[11px] text-[var(--faint)]">
        <span>{first ? prettyDate(first.loggedOn) : ""}</span>
        <span>{last ? prettyDate(last.loggedOn) : ""}</span>
      </figcaption>
    </figure>
  );
}

function WeightCard({
  token,
  profile,
  latestWeight,
  recentWeights,
  weightLogCount,
}: {
  token: string;
  profile: Profile;
  latestWeight: { weightKg: number; loggedOn: string } | null;
  recentWeights: { weightKg: number; loggedOn: string }[];
  weightLogCount: number;
}) {
  const queryClient = useQueryClient();
  const imperial = profile.units === "imperial";
  const [value, setValue] = useState("");
  const [date, setDate] = useState(todayLocal());
  const [error, setError] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    void queryClient.invalidateQueries({ queryKey: ["session"] });
  };

  const log = useMutation({
    mutationFn: async () => {
      const v = num(value);
      if (v == null) throw new Error("local");
      const kg = imperial ? lbToKg(v) : v;
      return await api.logWeight({ token, weightKg: kg, loggedOn: date });
    },
    onSuccess: (res) => {
      if (!res.ok) {
        setError(res.error ?? "Could not save weight.");
        return;
      }
      setValue("");
      setSavedMsg("Saved.");
      refresh();
    },
    onError: (e) =>
      setError(
        e instanceof Error && e.message === "local"
          ? `Enter a weight in ${imperial ? "lb" : "kg"}.`
          : "Could not reach the server. Please try again.",
      ),
  });

  const del = useMutation({
    mutationFn: async (entry: { weightKg: number; loggedOn: string }) =>
      await api.deleteWeightLog({
        token,
        weightKg: entry.weightKg,
        loggedOn: entry.loggedOn,
      }),
    onSuccess: (res) => {
      if (!res.ok) setError(res.error ?? "Could not delete entry.");
      else refresh();
    },
  });

  const target = profile.targetWeightKg;
  const diff =
    latestWeight && target != null ? latestWeight.weightKg - target : null;
  const unit = imperial ? "lb" : "kg";
  const latestDisplay =
    latestWeight != null
      ? imperial
        ? kgToLb(latestWeight.weightKg).toFixed(1)
        : latestWeight.weightKg.toFixed(1)
      : null;

  return (
    <Panel
      label="Body weight"
      action={
        weightLogCount > 0 ? (
          <span className="text-xs text-[var(--faint)]">
            {weightLogCount} {weightLogCount === 1 ? "entry" : "entries"}
          </span>
        ) : undefined
      }
    >
      {latestWeight ? (
        <>
          <div className="flex flex-wrap items-end gap-x-6 gap-y-1">
            <p className="font-display tnum text-5xl leading-none">
              {latestDisplay}
              <span className="ml-1.5 text-lg text-[var(--dim)]">{unit}</span>
            </p>
            <p className="pb-0.5 text-sm text-[var(--dim)]">
              {prettyDate(latestWeight.loggedOn)}
              {target != null && diff != null ? (
                <>
                  {" · "}
                  {diff > 0
                    ? `${fmtWeight(Math.abs(diff), profile.units)} to goal`
                    : diff < 0
                      ? `${fmtWeight(Math.abs(diff), profile.units)} past goal`
                      : "Goal reached"}
                </>
              ) : null}
            </p>
          </div>
          {recentWeights.length >= 2 ? (
            <div className="mt-4">
              <WeightSparkline entries={recentWeights} units={profile.units} />
            </div>
          ) : null}
        </>
      ) : (
        <EmptyNote>
          Nothing logged yet. Add today's weight — your trend starts here.
        </EmptyNote>
      )}

      <form
        className="mt-5 flex flex-wrap items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          setSavedMsg(null);
          log.mutate();
        }}
      >
        <div className="w-28">
          <Field label={`Weight (${unit})`}>
            <input
              className={inputCls}
              type="number"
              inputMode="decimal"
              step="0.1"
              min={imperial ? 55 : 25}
              max={imperial ? 1100 : 500}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={imperial ? "151" : "68.5"}
              aria-label={`Weight in ${imperial ? "pounds" : "kilograms"}`}
            />
          </Field>
        </div>
        <div className="w-40">
          <Field label="Date">
            <input
              className={inputCls}
              type="date"
              value={date}
              max={todayLocal()}
              onChange={(e) => setDate(e.target.value)}
              aria-label="Weight log date"
            />
          </Field>
        </div>
        <button type="submit" className={btnPrimary} disabled={log.isPending}>
          {log.isPending ? "Saving…" : "Log weight"}
        </button>
        {savedMsg ? (
          <span className="flex items-center gap-1 pb-2.5 text-sm font-medium text-[var(--ok)]">
            {I.check} {savedMsg}
          </span>
        ) : null}
      </form>
      <div className="mt-2">
        <ErrorBox message={error} />
      </div>

      {recentWeights.length > 0 ? (
        <ul className="mt-3 divide-y divide-[var(--border)] border-t border-[var(--border)]">
          {recentWeights.slice(0, 5).map((w, i) => (
            <li
              key={`${w.loggedOn}-${w.weightKg}-${i}`}
              className="group flex items-center justify-between py-2.5 text-sm"
            >
              <span className="text-[var(--dim)]">{prettyDate(w.loggedOn)}</span>
              <span className="flex items-center gap-1">
                <span className="tnum font-semibold">
                  {fmtWeight(w.weightKg, profile.units)}
                </span>
                <button
                  type="button"
                  className="rounded-[4px] p-1.5 text-[var(--faint)] transition-colors hover:text-[var(--accent-text)]"
                  aria-label={`Delete weight entry ${fmtWeight(w.weightKg, profile.units)} on ${prettyDate(w.loggedOn)}`}
                  onClick={() => del.mutate(w)}
                >
                  {I.trash}
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </Panel>
  );
}

function Dashboard({
  token,
  profile,
  go,
}: {
  token: string;
  profile: Profile;
  go: (v: View) => void;
}) {
  const dash = useQuery({
    queryKey: ["dashboard", token],
    queryFn: () =>
      api.getDashboard({ token, today: todayLocal(), weekStart: mondayLocal() }),
  });
  const firstName = profile.displayName.split(" ")[0] ?? profile.displayName;
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="kicker text-[var(--accent-text)]">{today}</p>
          <h2 className="font-display mt-1.5 text-4xl leading-none sm:text-5xl">
            Namaste, {firstName}
          </h2>
        </div>
        {profile.mainGoal ? (
          <p className="flex items-center gap-2 pb-1 text-sm text-[var(--dim)]">
            <span className="text-[var(--accent-text)]">{I.flame}</span>
            Goal:{" "}
            <span className="font-bold text-[var(--text)]">
              {GOAL_LABELS[profile.mainGoal]}
            </span>
          </p>
        ) : null}
      </div>

      {!profile.onboardingCompleted ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-[var(--shadow-card)]">
          <p className="text-sm">
            <span className="font-bold">Finish your setup</span>
            <span className="text-[var(--dim)]">
              {" "}
              — two minutes, and your targets switch on.
            </span>
          </p>
          <button type="button" className={btnPrimary} onClick={() => go("onboarding")}>
            Finish setup
          </button>
        </div>
      ) : null}

      <div className="mt-6 space-y-4">
        {dash.isPending ? (
          <ListSkeleton rows={5} />
        ) : dash.isError || !dash.data?.authenticated ? (
          <ErrorBox message="Could not load your dashboard. Try again, or log in again." />
        ) : (
          <>
            {dash.data.targets ? (
              <TargetsHero
                targets={dash.data.targets}
                today={dash.data.today}
                bmi={dash.data.bmi}
                onCompleteProfile={() => go("profile")}
                go={go}
              />
            ) : null}

            {/* Quick actions */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(
                [
                  { label: "Log food", icon: I.plus, view: "diary" as View },
                  { label: "Find food", icon: I.search, view: "search" as View },
                  { label: "Start workout", icon: I.dumbbell, view: "workouts" as View },
                  { label: "Progress", icon: I.chart, view: "progress" as View },
                ]
              ).map((a) => (
                <button
                  key={a.label}
                  type="button"
                  onClick={() => go(a.view)}
                  className="flex items-center gap-3 rounded-[10px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3.5 text-left shadow-[var(--shadow-card)] transition-colors hover:border-[var(--border-strong)]"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent-text)]">
                    {a.icon}
                  </span>
                  <span className="text-sm font-semibold">{a.label}</span>
                </button>
              ))}
            </div>

            <div className="grid items-start gap-4 lg:grid-cols-5">
              <div className="lg:col-span-3">
                <WeightCard
                  token={token}
                  profile={profile}
                  latestWeight={dash.data.latestWeight}
                  recentWeights={dash.data.recentWeights}
                  weightLogCount={dash.data.weightLogCount}
                />
              </div>

              <div className="flex flex-col gap-4 lg:col-span-2">
                <Panel label="Training">
                {dash.data.training.activeSessionId != null ? (
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[8px] bg-[var(--accent-soft)] px-3.5 py-2.5">
                    <p className="text-sm font-bold">Workout in progress</p>
                    <button
                      type="button"
                      className={btnPrimary}
                      onClick={() => go("workouts")}
                    >
                      Resume
                    </button>
                  </div>
                ) : null}
                {dash.data.training.totalWorkouts > 0 ? (
                  <>
                    <div className="flex items-baseline gap-6">
                      <p>
                        <span className="font-display text-4xl leading-none">
                          {dash.data.training.workoutsThisWeek}
                        </span>{" "}
                        <span className="text-sm text-[var(--dim)]">
                          this week
                        </span>
                      </p>
                      <p>
                        <span className="font-display text-4xl leading-none">
                          {dash.data.training.dayStreak}
                        </span>{" "}
                        <span className="text-sm text-[var(--dim)]">
                          day streak
                        </span>
                      </p>
                    </div>
                    <dl className="mt-3">
                      {dash.data.training.lastWorkout ? (
                        <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] py-2.5 text-sm">
                          <dt className="text-[var(--dim)]">Last workout</dt>
                          <dd className="text-right font-semibold">
                            {dash.data.training.lastWorkout.title}
                            <span className="block text-xs font-medium text-[var(--faint)]">
                              {prettyDate(dash.data.training.lastWorkout.startedOn)}
                              {" · "}
                              {fmtDuration(
                                dash.data.training.lastWorkout.durationSeconds,
                              )}
                            </span>
                          </dd>
                        </div>
                      ) : null}
                      <div className="flex items-baseline justify-between gap-3 py-2.5 text-sm">
                        <dt className="text-[var(--dim)]">Total workouts</dt>
                        <dd className="font-semibold">
                          {dash.data.training.totalWorkouts}
                        </dd>
                      </div>
                    </dl>
                    {dash.data.training.latestPrs.length > 0 ? (
                      <div className="border-t border-[var(--border)] pt-3">
                        <p className="kicker text-[var(--faint)]">
                          Latest records
                        </p>
                        <ul className="mt-2 space-y-1.5 text-sm">
                          {dash.data.training.latestPrs.map((pr) => (
                            <li
                              key={pr.exerciseId}
                              className="flex items-baseline justify-between gap-3"
                            >
                              <span className="text-[var(--dim)]">
                                {pr.exerciseName}
                              </span>
                              <span className="font-semibold">
                                {pr.heaviestLoadKg != null
                                  ? `${fmtLoad(pr.heaviestLoadKg, profile.units)}${pr.heaviestReps != null ? ` × ${pr.heaviestReps}` : ""}`
                                  : pr.longestSeconds != null
                                    ? fmtClock(pr.longestSeconds)
                                    : pr.bestReps != null
                                      ? `${pr.bestReps} reps`
                                      : "—"}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </>
                ) : dash.data.training.activeSessionId == null ? (
                  <EmptyNote>
                    No workouts logged yet. Your first session starts here.
                  </EmptyNote>
                ) : null}
                <button
                  type="button"
                  className={`${btnInk} mt-4 w-full`}
                  onClick={() => go("workouts")}
                >
                  {I.play} Start workout
                </button>
                </Panel>
                <WaterCard token={token} />
              </div>
            </div>

            <div className="flex flex-wrap gap-x-8 gap-y-2 px-1 pt-1">
              {(
                [
                  ["Height", fmtHeight(profile.heightCm, profile.units)],
                  [
                    "Diet",
                    profile.dietPreference
                      ? DIET_LABELS[profile.dietPreference]
                      : "Not set",
                  ],
                  [
                    "Activity",
                    profile.activityLevel
                      ? ((ACTIVITY_LABELS[profile.activityLevel] ?? "").split(" — ")[0] ?? "Set")
                      : "Not set",
                  ],
                  [
                    "Units",
                    profile.units === "imperial" ? "lb / ft-in" : "kg / cm",
                  ],
                  [
                    "Member since",
                    new Date(profile.memberSince).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }),
                  ],
                ] as const
              ).map(([k, v]) => (
                <p key={k} className="text-sm">
                  <span className="text-[var(--faint)]">{k} </span>
                  <span className="font-semibold">{v ?? "—"}</span>
                </p>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- settings

function ProfileSettings({
  token,
  profile,
  onSignedOut,
  adminClaimAvailable,
}: {
  token: string;
  profile: Profile;
  onSignedOut: () => void;
  adminClaimAvailable: boolean;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(() => formFromProfile(profile));
  const [error, setError] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const set = (patch: Partial<FormState>) =>
    setForm((f) => ({ ...f, ...patch }));

  // Weight fields are edited in the user's display units.
  const imperial = form.units === "imperial";
  const weightDisplay =
    form.weightKg === ""
      ? ""
      : imperial
        ? String(Math.round(kgToLb(Number(form.weightKg)) * 10) / 10)
        : form.weightKg;
  const targetDisplay =
    form.targetWeightKg === ""
      ? ""
      : imperial
        ? String(Math.round(kgToLb(Number(form.targetWeightKg)) * 10) / 10)
        : form.targetWeightKg;
  const setWeightDisplay = (v: string) =>
    set({ weightKg: v === "" ? "" : String(imperial ? lbToKg(Number(v) || 0) : v) });
  const setTargetDisplay = (v: string) =>
    set({
      targetWeightKg:
        v === "" ? "" : String(imperial ? lbToKg(Number(v) || 0) : v),
    });

  const save = useMutation({
    mutationFn: async () =>
      await api.saveProfile({ token, ...formToArgs(form) }),
    onSuccess: (res) => {
      if (!res.ok) {
        setError(res.error ?? "Could not save. Please try again.");
        return;
      }
      setSavedMsg("Saved.");
      void queryClient.invalidateQueries({ queryKey: ["session"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: () => setError("Could not reach the server. Please try again."),
  });

  // Change password
  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [pwMsg, setPwMsg] = useState<string | null>(null);
  const [pwErr, setPwErr] = useState<string | null>(null);
  const changePw = useMutation({
    mutationFn: async () =>
      await api.changePassword({
        token,
        currentPassword: curPw,
        newPassword: newPw,
      }),
    onSuccess: (res) => {
      if (!res.ok) {
        setPwErr(res.error ?? "Could not change password.");
        return;
      }
      setCurPw("");
      setNewPw("");
      setPwMsg("Password changed. Other devices signed out.");
    },
    onError: () => setPwErr("Could not reach the server. Please try again."),
  });

  // Export
  const [exportErr, setExportErr] = useState<string | null>(null);
  const exportData = useMutation({
    mutationFn: async () => await api.exportData({ token }),
    onSuccess: (res) => {
      if (!res.ok) {
        setExportErr(res.error ?? "Export failed.");
        return;
      }
      const blob = new Blob(
        [
          JSON.stringify(
            {
              profile: res.profile,
              targets: res.targets,
              weightLogs: res.weightLogs,
              diaryEntries: res.diaryEntries,
              exportedAt: res.exportedAt,
            },
            null,
            2,
          ),
        ],
        { type: "application/json" },
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "fitind-my-data.json";
      a.click();
      URL.revokeObjectURL(url);
    },
    onError: () => setExportErr("Could not reach the server. Please try again."),
  });

  // Sessions (Phase 5): list real sign-ins and end the others.
  const mySessions = useQuery({
    queryKey: ["mySessions", token],
    queryFn: () => api.listSessions({ token }),
  });
  const [sessionsMsg, setSessionsMsg] = useState<string | null>(null);
  const logoutOthers = useMutation({
    mutationFn: async () => await api.logoutOtherSessions({ token }),
    onSuccess: (res) => {
      if (!res.ok) {
        setSessionsMsg(res.error ?? "Could not sign out other sessions.");
        return;
      }
      setSessionsMsg("Other sessions signed out.");
      void queryClient.invalidateQueries({ queryKey: ["mySessions", token] });
    },
    onError: () => setSessionsMsg("Could not reach the server. Please try again."),
  });

  // First-admin claim (Phase 5): only rendered while the server says
  // no admin exists yet.
  const [claimErr, setClaimErr] = useState<string | null>(null);
  const [confirmingClaim, setConfirmingClaim] = useState(false);
  const claimAdmin = useMutation({
    mutationFn: async () => await api.claimAdmin({ token }),
    onSuccess: (res) => {
      if (!res.ok) {
        setClaimErr(res.error ?? "Could not claim admin access.");
        return;
      }
      setConfirmingClaim(false);
      void queryClient.invalidateQueries({ queryKey: ["session"] });
    },
    onError: () => setClaimErr("Could not reach the server. Please try again."),
  });

  // Delete account
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deletePw, setDeletePw] = useState("");
  const [deleteErr, setDeleteErr] = useState<string | null>(null);
  const deleteAccount = useMutation({
    mutationFn: async () =>
      await api.deleteAccount({ token, password: deletePw }),
    onSuccess: (res) => {
      if (!res.ok) {
        setDeleteErr(res.error ?? "Could not delete account.");
        return;
      }
      onSignedOut();
    },
    onError: () => setDeleteErr("Could not reach the server. Please try again."),
  });

  return (
    <div>
      <p className="kicker text-[var(--accent-text)]">{profile.email}</p>
      <h2 className="font-display mt-1.5 text-4xl leading-none sm:text-5xl">
        Profile & settings
      </h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          setSavedMsg(null);
          save.mutate();
        }}
        className="mt-8"
      >
        <Section title="Personal">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Display name">
              <input
                className={inputCls}
                value={form.displayName}
                onChange={(e) => set({ displayName: e.target.value })}
              />
            </Field>
            <Field label="Date of birth" hint="Sets your age for the calorie estimate.">
              <input
                className={inputCls}
                type="date"
                value={form.dateOfBirth}
                max={todayLocal()}
                onChange={(e) => set({ dateOfBirth: e.target.value })}
                aria-label="Date of birth"
              />
            </Field>
            <Field
              label="Height (cm)"
              hint={
                form.heightCm && num(form.heightCm)
                  ? `≈ ${fmtHeight(num(form.heightCm), "imperial")}`
                  : undefined
              }
            >
              <input
                className={inputCls}
                type="number"
                inputMode="decimal"
                min={80}
                max={260}
                value={form.heightCm}
                onChange={(e) => set({ heightCm: e.target.value })}
              />
            </Field>
            <Field label={`Current weight (${imperial ? "lb" : "kg"})`}>
              <input
                className={inputCls}
                type="number"
                inputMode="decimal"
                step="0.1"
                value={weightDisplay}
                onChange={(e) => setWeightDisplay(e.target.value)}
                aria-label={`Current weight in ${imperial ? "pounds" : "kilograms"}`}
              />
            </Field>
          </div>
          <div className="mt-5">
            <ChoiceTiles
              label="Sex"
              options={[
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "other", label: "Other", hint: "Averages both formulas" },
              ]}
              value={form.sex}
              onChange={(v) => set({ sex: v })}
              cols="sm:grid-cols-3"
            />
          </div>
        </Section>

        <Section title="Goal & targets">
          <div className="space-y-5">
            <ChoiceTiles
              label="Main goal"
              options={tileOptions(GOAL_LABELS)}
              value={form.mainGoal}
              onChange={(v) => set({ mainGoal: v })}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={`Target weight (${imperial ? "lb" : "kg"})`}>
                <input
                  className={inputCls}
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  value={targetDisplay}
                  onChange={(e) => setTargetDisplay(e.target.value)}
                  aria-label={`Target weight in ${imperial ? "pounds" : "kilograms"}`}
                  placeholder="Optional"
                />
              </Field>
              <Field
                label="Calorie target override (kcal)"
                hint="Blank = automatic estimate. Your number wins."
              >
                <input
                  className={inputCls}
                  type="number"
                  inputMode="numeric"
                  min={800}
                  max={10000}
                  value={form.calorieOverride}
                  onChange={(e) => set({ calorieOverride: e.target.value })}
                  placeholder="Auto"
                />
              </Field>
            </div>
            <ChoiceTiles
              label="Activity level"
              options={tileOptions(ACTIVITY_LABELS)}
              value={form.activityLevel}
              onChange={(v) => set({ activityLevel: v })}
              cols="sm:grid-cols-1"
            />
          </div>
        </Section>

        <Section title="Training & food">
          <div className="space-y-5">
            <ChoiceTiles
              label="Experience"
              options={tileOptions(EXPERIENCE_LABELS)}
              value={form.experience}
              onChange={(v) => set({ experience: v })}
              cols="sm:grid-cols-3"
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Training days / week">
                <input
                  className={inputCls}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={7}
                  value={form.trainingDays}
                  onChange={(e) => set({ trainingDays: e.target.value })}
                />
              </Field>
              <Field label="Allergies / foods you avoid">
                <input
                  className={inputCls}
                  value={form.allergies}
                  onChange={(e) => set({ allergies: e.target.value })}
                  placeholder="None"
                />
              </Field>
            </div>
            <ChoiceTiles
              label="Equipment"
              options={tileOptions(EQUIPMENT_LABELS)}
              value={form.equipment}
              onChange={(v) => set({ equipment: v })}
            />
            {form.equipment === "custom" ? (
              <Field label="Describe your equipment">
                <input
                  className={inputCls}
                  value={form.equipmentCustomNote}
                  onChange={(e) => set({ equipmentCustomNote: e.target.value })}
                />
              </Field>
            ) : null}
            <ChoiceTiles
              label="Diet preference"
              options={tileOptions(DIET_LABELS)}
              value={form.dietPreference}
              onChange={(v) => set({ dietPreference: v })}
            />
            {form.dietPreference === "custom" ? (
              <Field label="Describe your diet preference">
                <input
                  className={inputCls}
                  value={form.dietCustomNote}
                  onChange={(e) => set({ dietCustomNote: e.target.value })}
                />
              </Field>
            ) : null}
          </div>
        </Section>

        <Section title="Display & reminders">
          <ChoiceTiles
            label="Units"
            options={[
              { value: "metric", label: "Metric", hint: "kg / cm" },
              { value: "imperial", label: "Imperial", hint: "lb / ft-in" },
            ]}
            value={form.units}
            onChange={(v) => set({ units: v })}
          />
          <div className="mt-3 divide-y divide-[var(--border)]">
            <Toggle
              label="Meal reminders"
              hint="Saved now; delivery isn't connected yet."
              checked={form.notifyMeals}
              onChange={(v) => set({ notifyMeals: v })}
            />
            <Toggle
              label="Water reminders"
              hint="Saved now; delivery isn't connected yet."
              checked={form.notifyWater}
              onChange={(v) => set({ notifyWater: v })}
            />
            <Toggle
              label="Workout reminders"
              hint="Saved now; delivery isn't connected yet."
              checked={form.notifyWorkouts}
              onChange={(v) => set({ notifyWorkouts: v })}
            />
            <Toggle
              label="Private profile"
              hint="Your body data is never shown to other users."
              checked={form.profilePrivate}
              onChange={(v) => set({ profilePrivate: v })}
            />
          </div>
        </Section>

        <div className="border-t border-[var(--border)] pt-6">
          <ErrorBox message={error} />
          <div className="mt-1 flex items-center gap-3">
            <button type="submit" className={btnPrimary} disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save settings"}
            </button>
            {savedMsg ? (
              <span className="flex items-center gap-1 text-sm font-medium text-[var(--ok)]">
                {I.check} {savedMsg}
              </span>
            ) : null}
          </div>
        </div>
      </form>

      <div className="mt-4 grid items-start gap-4 lg:grid-cols-2">
        <Panel label="Password">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setPwErr(null);
              setPwMsg(null);
              changePw.mutate();
            }}
          >
            <Field label="Current password">
              <input
                className={inputCls}
                type="password"
                value={curPw}
                onChange={(e) => setCurPw(e.target.value)}
                autoComplete="current-password"
                required
              />
            </Field>
            <Field label="New password" hint="At least 8 characters.">
              <input
                className={inputCls}
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                autoComplete="new-password"
                required
              />
            </Field>
            <ErrorBox message={pwErr} />
            {pwMsg ? (
              <p className="flex items-center gap-1 text-sm font-medium text-[var(--ok)]">
                {I.check} {pwMsg}
              </p>
            ) : null}
            <button type="submit" className={btnGhost} disabled={changePw.isPending}>
              {changePw.isPending ? "Changing…" : "Change password"}
            </button>
          </form>
          <p className="mt-4 text-xs text-[var(--faint)]">
            Sessions last 30 days on this device. Email verification and
            password-reset mail aren't connected yet.
          </p>
        </Panel>

        <Panel label="Your data">
          <p className="text-sm text-[var(--dim)]">
            Everything FITIND holds for you — profile, goals and
            preferences, weight and measurements, food diary, your custom
            foods and favourites, workouts, water, recipes, meal plan and
            challenges — as one JSON file.
          </p>
          <div className="mt-3">
            <ErrorBox message={exportErr} />
          </div>
          <button
            type="button"
            className={`${btnGhost} mt-3`}
            disabled={exportData.isPending}
            onClick={() => exportData.mutate()}
          >
            {I.download} {exportData.isPending ? "Preparing…" : "Export my data"}
          </button>

          <div className="mt-6 border-t border-[var(--border)] pt-5">
            <h4 className="text-sm font-bold text-[var(--accent-text)]">
              Delete account
            </h4>
            <p className="mt-1 text-sm text-[var(--dim)]">
              Deletes your account and every record with it. No undo.
            </p>
            {!confirmingDelete ? (
              <button
                type="button"
                className={`${btnDanger} mt-3`}
                onClick={() => setConfirmingDelete(true)}
              >
                Delete my account
              </button>
            ) : (
              <form
                className="mt-3 space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  setDeleteErr(null);
                  deleteAccount.mutate();
                }}
              >
                <Field label="Password to confirm">
                  <input
                    className={inputCls}
                    type="password"
                    value={deletePw}
                    onChange={(e) => setDeletePw(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </Field>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="submit"
                    className={btnPrimary}
                    disabled={deleteAccount.isPending}
                  >
                    {deleteAccount.isPending ? "Deleting…" : "Permanently delete"}
                  </button>
                  <button
                    type="button"
                    className={btnGhost}
                    onClick={() => setConfirmingDelete(false)}
                  >
                    Cancel
                  </button>
                </div>
                <ErrorBox message={deleteErr} />
              </form>
            )}
          </div>
        </Panel>
      </div>

      <div className="mt-4 grid items-start gap-4 lg:grid-cols-2">
        <Panel label="Sessions">
          <p className="text-sm text-[var(--dim)]">
            Where this account is signed in. Sessions last 30 days.
          </p>
          {mySessions.isPending ? (
            <div className="mt-3">
              <ListSkeleton rows={2} />
            </div>
          ) : mySessions.data?.ok ? (
            <ul className="mt-3 divide-y divide-[var(--border)]">
              {mySessions.data.sessions.map((s) => (
                <li key={s.id} className="py-3">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <span className="min-w-0 truncate">
                      {s.userAgent ?? "Unknown device"}
                    </span>
                    {s.current ? (
                      <span className="shrink-0 rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[var(--accent-text)]">
                        This device
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--faint)]">
                    Signed in {new Date(s.createdAt).toLocaleString("en-IN")}{" "}
                    · expires {new Date(s.expiresAt).toLocaleDateString("en-IN")}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-[var(--dim)]">
              Could not load your sessions.
            </p>
          )}
          {sessionsMsg ? (
            <p className="mt-2 text-sm font-medium text-[var(--ok)]" role="status">
              {sessionsMsg}
            </p>
          ) : null}
          <button
            type="button"
            className={`${btnGhost} mt-3`}
            disabled={
              logoutOthers.isPending ||
              (mySessions.data?.sessions.length ?? 0) <= 1
            }
            onClick={() => logoutOthers.mutate()}
          >
            {logoutOthers.isPending
              ? "Signing out…"
              : "Log out all other sessions"}
          </button>
          <p className="mt-3 text-xs text-[var(--faint)]">
            Device names are recorded at sign-in; sessions from before
            this feature show as “Unknown device”.
          </p>
        </Panel>

        {adminClaimAvailable ? (
          <Panel label="Site owner — admin setup">
            <p className="text-sm leading-relaxed text-[var(--dim)]">
              No admin account exists for this site yet. If you are the
              site owner, claim admin access for this account — it lets
              you manage the food, exercise and recipe libraries. This
              claim works only once: as soon as any admin exists, it
              closes for everyone.
            </p>
            <div className="mt-3">
              <ErrorBox message={claimErr} />
            </div>
            {!confirmingClaim ? (
              <button
                type="button"
                className={`${btnPrimary} mt-3`}
                onClick={() => setConfirmingClaim(true)}
              >
                Claim admin access
              </button>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className={btnPrimary}
                  disabled={claimAdmin.isPending}
                  onClick={() => claimAdmin.mutate()}
                >
                  {claimAdmin.isPending ? "Claiming…" : "Yes, make me admin"}
                </button>
                <button
                  type="button"
                  className={btnGhost}
                  onClick={() => setConfirmingClaim(false)}
                >
                  Cancel
                </button>
              </div>
            )}
          </Panel>
        ) : null}
      </div>
    </div>
  );
}

// ------------------------------------------------------------ food UI

function fmt1(n: number): string {
  return (Math.round(n * 10) / 10).toLocaleString("en-IN");
}

function VerificationChip({ food }: { food: Food }) {
  if (food.verification === "verified")
    return (
      <span className="rounded-[4px] bg-[var(--ok)] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
        Verified
      </span>
    );
  if (food.verification === "user")
    return (
      <span className="rounded-[4px] border border-[var(--border-strong)] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--dim)]">
        Your food
      </span>
    );
  return (
    <span className="rounded-[4px] border border-[var(--border-strong)] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--dim)]">
      Estimate
    </span>
  );
}

function StarButton({
  token,
  food,
}: {
  token: string;
  food: Food;
}) {
  const queryClient = useQueryClient();
  const toggle = useMutation({
    mutationFn: async () => await api.toggleFavourite({ token, foodId: food.id }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["foodSearch"] });
      void queryClient.invalidateQueries({ queryKey: ["foodLists"] });
    },
  });
  return (
    <button
      type="button"
      onClick={() => toggle.mutate()}
      disabled={toggle.isPending}
      aria-label={
        food.isFavourite
          ? `Remove ${food.name} from favourites`
          : `Add ${food.name} to favourites`
      }
      aria-pressed={food.isFavourite}
      className={`rounded-[4px] p-2 transition-colors ${
        food.isFavourite
          ? "text-[var(--accent)]"
          : "text-[var(--faint)] hover:text-[var(--accent)]"
      }`}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill={food.isFavourite ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6L12 16.7 6.6 19.6l1.1-6L3.2 9.4l6.1-.8z" />
      </svg>
    </button>
  );
}

/* One food in a list: name, per-100 g values, default serving, labels. */
function FoodRow({
  token,
  food,
  onAdd,
}: {
  token: string;
  food: Food;
  onAdd: (food: Food) => void;
}) {
  return (
    <li className="flex items-start gap-1 py-3.5">
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-semibold">{food.name}</span>
          <VerificationChip food={food} />
          <span className="text-[11px] font-medium text-[var(--faint)]">
            {DIET_FLAG_LABELS[food.dietFlag]} · {food.cuisine}
          </span>
        </p>
        <p className="tnum mt-1 text-[13px] text-[var(--dim)]">
          {Math.round(food.kcalPer100)} kcal · P {fmt1(food.proteinPer100)} ·
          C {fmt1(food.carbsPer100)} · F {fmt1(food.fatPer100)} · Fibre{" "}
          {fmt1(food.fibrePer100)}
          <span className="text-[var(--faint)]"> per 100 g</span>
        </p>
        <p className="mt-0.5 text-[13px] text-[var(--faint)]">
          {food.servingName} = {fmt1(food.servingGrams)} g ·{" "}
          {Math.round((food.kcalPer100 * food.servingGrams) / 100)} kcal
        </p>
      </div>
      <StarButton token={token} food={food} />
      <button
        type="button"
        className="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-[6px] bg-[var(--ink)] px-3 py-2 text-[13px] font-bold text-[var(--bg)] transition-colors hover:bg-[var(--accent-btn)] hover:text-white"
        onClick={() => onAdd(food)}
        aria-label={`Add ${food.name} to diary`}
      >
        {I.plus} Add
      </button>
    </li>
  );
}

/* Quantity step: grams or servings, live nutrient preview, then log.
   The clientKey is generated once per panel session, so a retried or
   double-tapped submit can never create a duplicate entry. */
function AddFoodPanel({
  token,
  food,
  date,
  initialMeal,
  lockMeal,
  onDone,
  onCancel,
}: {
  token: string;
  food: Food;
  date: string;
  initialMeal: MealKey;
  lockMeal: boolean;
  onDone: () => void;
  onCancel: () => void;
}) {
  const queryClient = useQueryClient();
  const [meal, setMeal] = useState<MealKey>(initialMeal);
  const [mode, setMode] = useState<"servings" | "grams">("servings");
  const [amount, setAmount] = useState("1");
  const [error, setError] = useState<string | null>(null);
  const [clientKey] = useState(
    () =>
      `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`,
  );

  const amt = num(amount);
  const grams =
    amt == null
      ? null
      : mode === "servings"
        ? Math.round(amt * food.servingGrams * 10) / 10
        : amt;
  const f = grams != null ? grams / 100 : 0;

  const add = useMutation({
    mutationFn: async () => {
      if (grams == null || grams <= 0) throw new Error("local");
      return await api.addDiaryEntry({
        token,
        foodId: food.id,
        date,
        meal,
        quantityGrams: grams,
        servings: mode === "servings" ? amt : null,
        clientKey,
      });
    },
    onSuccess: (res) => {
      if (!res.ok) {
        setError(res.error ?? "Could not add. Please try again.");
        return;
      }
      void queryClient.invalidateQueries({ queryKey: ["diary"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      void queryClient.invalidateQueries({ queryKey: ["foodLists"] });
      onDone();
    },
    onError: (e) =>
      setError(
        e instanceof Error && e.message === "local"
          ? "Enter a quantity above zero."
          : "Could not reach the server. Please try again.",
      ),
  });

  return (
    <div className="rounded-[8px] border border-[var(--ink)] bg-[var(--surface)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-bold">{food.name}</p>
          <p className="mt-0.5 text-xs text-[var(--dim)]">
            {food.servingName} = {fmt1(food.servingGrams)} g ·{" "}
            {Math.round(food.kcalPer100)} kcal per 100 g
          </p>
        </div>
        <button
          type="button"
          className="rounded-[4px] p-1.5 text-[var(--dim)] transition-colors hover:text-[var(--ink)]"
          onClick={onCancel}
          aria-label="Close add panel"
        >
          {I.x}
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {!lockMeal ? (
          <Field label="Meal">
            <select
              className={inputCls}
              value={meal}
              onChange={(e) => setMeal(e.target.value as MealKey)}
              aria-label="Meal"
            >
              {MEAL_ORDER.map((m) => (
                <option key={m} value={m}>
                  {MEAL_LABELS[m]}
                </option>
              ))}
            </select>
          </Field>
        ) : null}
        <Field label="Amount">
          <input
            className={inputCls}
            type="number"
            inputMode="decimal"
            min={0}
            step={mode === "servings" ? "0.25" : "5"}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            aria-label={mode === "servings" ? "Number of servings" : "Quantity in grams"}
          />
        </Field>
        <Field label="Measure">
          <div className="grid grid-cols-2 gap-1 rounded-[6px] border border-[var(--border-strong)] bg-[var(--input)] p-1">
            {(
              [
                ["servings", "Servings"],
                ["grams", "Grams"],
              ] as const
            ).map(([m, label]) => (
              <button
                key={m}
                type="button"
                aria-pressed={mode === m}
                onClick={() => setMode(m)}
                className={`rounded-[4px] px-2 py-2 text-[13px] font-semibold transition-colors ${
                  mode === m
                    ? "bg-[var(--ink)] text-[var(--bg)]"
                    : "text-[var(--dim)] hover:text-[var(--ink)]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </Field>
      </div>

      <p className="tnum mt-3 text-sm text-[var(--dim)]" aria-live="polite">
        {grams != null && grams > 0 ? (
          <>
            <span className="font-bold text-[var(--text)]">
              {Math.round(food.kcalPer100 * f)} kcal
            </span>{" "}
            · P {fmt1(food.proteinPer100 * f)} g · C {fmt1(food.carbsPer100 * f)}{" "}
            g · F {fmt1(food.fatPer100 * f)} g · Fibre {fmt1(food.fibrePer100 * f)}{" "}
            g · {fmt1(grams)} g total
          </>
        ) : (
          "Enter an amount to see the values."
        )}
      </p>

      <div className="mt-3">
        <ErrorBox message={error} />
      </div>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          className={btnPrimary}
          disabled={add.isPending}
          onClick={() => {
            setError(null);
            add.mutate();
          }}
        >
          {add.isPending
            ? "Adding…"
            : `Add to ${MEAL_LABELS[meal].toLowerCase()}`}
        </button>
        <button type="button" className={btnGhost} onClick={onCancel}>
          Cancel
        </button>
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-[var(--faint)]">
        {food.source}
        {food.notes ? ` ${food.notes}` : ""}
      </p>
    </div>
  );
}

/* Debounced food search used inside the diary's add flow. */
function FoodPicker({
  token,
  onPick,
}: {
  token: string;
  onPick: (food: Food) => void;
}) {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  useEffect(() => {
    const id = window.setTimeout(() => setQuery(input.trim()), 250);
    return () => window.clearTimeout(id);
  }, [input]);

  const results = useQuery({
    queryKey: ["foodSearch", token, query, "picker"],
    queryFn: () =>
      api.searchFoods({ token, query, highProtein: false, sort: "relevance" }),
  });
  const lists = useQuery({
    queryKey: ["foodLists", token],
    queryFn: () => api.getFoodLists({ token }),
  });

  const quick: Food[] =
    query === ""
      ? [
          ...(lists.data?.favourites ?? []),
          ...(lists.data?.recents ?? []).filter(
            (r) => !(lists.data?.favourites ?? []).some((fv) => fv.id === r.id),
          ),
        ].slice(0, 8)
      : [];

  return (
    <div>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--faint)]">
          {I.search}
        </span>
        <input
          className={`${inputCls} pl-10`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search roti, dal, paneer…"
          aria-label="Search foods"
        />
      </div>
      {query === "" && quick.length > 0 ? (
        <>
          <p className="kicker mt-4 text-[var(--faint)]">
            Favourites & recent
          </p>
          <ul className="divide-y divide-[var(--border)]">
            {quick.map((food) => (
              <FoodRow key={food.id} token={token} food={food} onAdd={onPick} />
            ))}
          </ul>
        </>
      ) : null}
      {results.isPending ? (
        <ListSkeleton rows={4} />
      ) : results.data && results.data.foods.length > 0 ? (
        <ul className="divide-y divide-[var(--border)]">
          {results.data.foods.map((food) => (
            <FoodRow key={food.id} token={token} food={food} onAdd={onPick} />
          ))}
        </ul>
      ) : query !== "" ? (
        <p className="mt-4 text-sm text-[var(--dim)]">
          No match for “{query}”. Try a shorter name — or add it as your own
          food from Food Search.
        </p>
      ) : null}
    </div>
  );
}

function shiftDate(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// ------------------------------------------------------------- food diary

function DiaryEntryRow({
  token,
  entry,
  date,
}: {
  token: string;
  entry: DiaryEntry;
  date: string;
}) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [gramsInput, setGramsInput] = useState(String(entry.quantityGrams));
  const [error, setError] = useState<string | null>(null);

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["diary"] });
    void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    void queryClient.invalidateQueries({ queryKey: ["foodLists"] });
  };

  const update = useMutation({
    mutationFn: async () => {
      const g = num(gramsInput);
      if (g == null || g <= 0) throw new Error("local");
      return await api.updateDiaryEntry({
        token,
        entryId: entry.id,
        quantityGrams: g,
      });
    },
    onSuccess: (res) => {
      if (!res.ok) {
        setError(res.error ?? "Could not update.");
        return;
      }
      setEditing(false);
      refresh();
    },
    onError: (e) =>
      setError(
        e instanceof Error && e.message === "local"
          ? "Enter grams above zero."
          : "Could not reach the server.",
      ),
  });

  const del = useMutation({
    mutationFn: async () => await api.deleteDiaryEntry({ token, entryId: entry.id }),
    onSuccess: (res) => {
      if (!res.ok) setError(res.error ?? "Could not delete.");
      else refresh();
    },
  });

  const qtyLabel =
    entry.servings != null
      ? `${fmt1(entry.servings)} × ${entry.servingName} · ${fmt1(entry.quantityGrams)} g`
      : `${fmt1(entry.quantityGrams)} g`;

  return (
    <li className="py-3">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-medium leading-snug">{entry.foodName}</p>
          <p className="tnum mt-0.5 text-[13px] text-[var(--faint)]">
            {qtyLabel} · P {fmt1(entry.protein)} · C {fmt1(entry.carbs)} · F{" "}
            {fmt1(entry.fat)}
          </p>
        </div>
        <span className="tnum pt-0.5 text-[15px] font-bold">
          {Math.round(entry.kcal)}
          <span className="ml-1 text-[11px] font-medium text-[var(--faint)]">
            kcal
          </span>
        </span>
        <button
          type="button"
          className="rounded-[4px] p-1.5 text-[var(--faint)] transition-colors hover:text-[var(--ink)]"
          aria-label={`Edit quantity of ${entry.foodName}`}
          onClick={() => {
            setGramsInput(String(entry.quantityGrams));
            setEditing((e) => !e);
          }}
        >
          {I.edit}
        </button>
        <button
          type="button"
          className="rounded-[4px] p-1.5 text-[var(--faint)] transition-colors hover:text-[var(--accent-text)]"
          aria-label={`Remove ${entry.foodName} from ${prettyDate(date)}`}
          onClick={() => del.mutate()}
          disabled={del.isPending}
        >
          {I.trash}
        </button>
      </div>
      {editing ? (
        <form
          className="mt-2.5 flex flex-wrap items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            update.mutate();
          }}
        >
          <div className="w-28">
            <Field label="Grams">
              <input
                className={inputCls}
                type="number"
                inputMode="decimal"
                min={1}
                step="1"
                value={gramsInput}
                onChange={(e) => setGramsInput(e.target.value)}
                aria-label={`Quantity in grams for ${entry.foodName}`}
              />
            </Field>
          </div>
          <p className="tnum pb-3 text-[13px] text-[var(--dim)]">
            1 {entry.servingName} = {fmt1(entry.servingGrams)} g
          </p>
          <button type="submit" className={btnPrimary} disabled={update.isPending}>
            {update.isPending ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            className={btnGhost}
            onClick={() => setEditing(false)}
          >
            Cancel
          </button>
        </form>
      ) : null}
      <div className="mt-1.5">
        <ErrorBox message={error} />
      </div>
    </li>
  );
}

function FoodDiary({ token }: { token: string }) {
  const queryClient = useQueryClient();
  const [date, setDate] = useState(todayLocal());
  const [addingMeal, setAddingMeal] = useState<MealKey | null>(null);
  const [picked, setPicked] = useState<Food | null>(null);
  const [copyMsg, setCopyMsg] = useState<string | null>(null);
  const [copyErr, setCopyErr] = useState<string | null>(null);

  const diary = useQuery({
    queryKey: ["diary", token, date],
    queryFn: () => api.getDiary({ token, date }),
  });

  const copy = useMutation({
    mutationFn: async () => await api.copyPreviousDay({ token, date }),
    onSuccess: (res) => {
      if (!res.ok) {
        setCopyErr(res.error ?? "Nothing to copy.");
        return;
      }
      setCopyMsg(`Copied ${res.copied} ${res.copied === 1 ? "entry" : "entries"} from yesterday.`);
      void queryClient.invalidateQueries({ queryKey: ["diary"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: () => setCopyErr("Could not reach the server."),
  });

  const data = diary.data;
  const targets = data?.targets ?? null;
  const totals = data?.totals ?? { kcal: 0, protein: 0, carbs: 0, fat: 0, fibre: 0 };
  const remaining =
    targets?.calorieTarget != null
      ? Math.round(targets.calorieTarget - totals.kcal)
      : null;
  const isToday = date === todayLocal();

  return (
    <div>
      <p className="kicker text-[var(--accent-text)]">Food diary</p>
      <h2 className="font-display mt-1.5 text-4xl leading-none sm:text-5xl">
        {isToday ? "Today" : prettyDate(date)}
      </h2>

      {/* Date navigation */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={`${btnGhost} shrink-0 px-3.5`}
          onClick={() => setDate((d) => shiftDate(d, -1))}
          aria-label="Previous day"
        >
          {I.chevronLeft}
        </button>
        <div className="min-w-40 flex-1 sm:max-w-48">
          <input
            className={inputCls}
            type="date"
            value={date}
            max={todayLocal()}
            onChange={(e) => {
              if (e.target.value) setDate(e.target.value);
            }}
            aria-label="Diary date"
          />
        </div>
        <button
          type="button"
          className={`${btnGhost} shrink-0 px-3.5`}
          disabled={isToday}
          onClick={() => setDate((d) => shiftDate(d, 1))}
          aria-label="Next day"
        >
          {I.chevronRight}
        </button>
        {!isToday ? (
          <button
            type="button"
            className={linkBtn}
            onClick={() => setDate(todayLocal())}
          >
            Back to today
          </button>
        ) : null}
      </div>

      {diary.isPending ? (
        <div className="mt-8">
          <ListSkeleton rows={5} />
        </div>
      ) : diary.isError || !data?.ok ? (
        <div className="mt-8">
          <ErrorBox message="Could not load this day's diary. Try again." />
        </div>
      ) : (
        <>
          {/* Day summary */}
          <div className="mt-6 flex flex-wrap items-end gap-x-10 gap-y-4 border-y-2 border-[var(--ink)] py-5">
            <div>
              <p className="kicker text-[var(--faint)]">
                {remaining != null
                  ? remaining >= 0
                    ? "Remaining"
                    : "Over target"
                  : "Eaten"}
              </p>
              <p className="font-display tnum mt-1 text-5xl leading-none">
                {remaining != null
                  ? Math.abs(remaining).toLocaleString("en-IN")
                  : Math.round(totals.kcal).toLocaleString("en-IN")}
                <span className="ml-1.5 text-base text-[var(--dim)]">kcal</span>
              </p>
            </div>
            <div className="tnum space-y-1 pb-1 text-sm text-[var(--dim)]">
              <p>
                Eaten{" "}
                <span className="font-bold text-[var(--text)]">
                  {Math.round(totals.kcal).toLocaleString("en-IN")} kcal
                </span>
                {targets?.calorieTarget != null ? (
                  <>
                    {" "}of{" "}
                    <span className="font-bold text-[var(--text)]">
                      {targets.calorieTarget.toLocaleString("en-IN")}
                    </span>
                  </>
                ) : null}
              </p>
              <p>
                P <span className="font-bold text-[var(--text)]">{fmt1(totals.protein)} g</span>
                {" · "}C <span className="font-bold text-[var(--text)]">{fmt1(totals.carbs)} g</span>
                {" · "}F <span className="font-bold text-[var(--text)]">{fmt1(totals.fat)} g</span>
                {" · "}Fibre <span className="font-bold text-[var(--text)]">{fmt1(totals.fibre)} g</span>
              </p>
            </div>
            {data.entries.length === 0 ? (
              <div className="pb-1">
                <button
                  type="button"
                  className={btnGhost}
                  disabled={copy.isPending}
                  onClick={() => {
                    setCopyErr(null);
                    setCopyMsg(null);
                    copy.mutate();
                  }}
                >
                  {copy.isPending ? "Copying…" : "Copy yesterday"}
                </button>
              </div>
            ) : null}
          </div>
          {copyMsg ? (
            <p className="mt-3 flex items-center gap-1 text-sm font-medium text-[var(--ok)]">
              {I.check} {copyMsg}
            </p>
          ) : null}
          <div className="mt-2">
            <ErrorBox message={copyErr} />
          </div>

          {/* Meals */}
          <div className="mt-2">
            {MEAL_ORDER.map((meal) => {
              const entries = data.entries.filter((e) => e.meal === meal);
              const mt = data.mealTotals[meal];
              const isAdding = addingMeal === meal && !picked;
              return (
                <section
                  key={meal}
                  className="border-b border-[var(--border)] py-5"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-display text-xl tracking-wide">
                      {MEAL_LABELS[meal]}
                    </h3>
                    <span className="tnum text-sm text-[var(--dim)]">
                      {entries.length > 0 ? (
                        <>
                          <span className="font-bold text-[var(--text)]">
                            {Math.round(mt.kcal)}
                          </span>{" "}
                          kcal · P {fmt1(mt.protein)} · C {fmt1(mt.carbs)} · F{" "}
                          {fmt1(mt.fat)}
                        </>
                      ) : (
                        "—"
                      )}
                    </span>
                  </div>

                  {entries.length > 0 ? (
                    <ul className="mt-1 divide-y divide-[var(--border)]">
                      {entries.map((e) => (
                        <DiaryEntryRow key={e.id} token={token} entry={e} date={date} />
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-sm text-[var(--faint)]">
                      Nothing logged.
                    </p>
                  )}

                  {addingMeal === meal ? (
                    <div className="mt-3">
                      {picked ? (
                        <AddFoodPanel
                          token={token}
                          food={picked}
                          date={date}
                          initialMeal={meal}
                          lockMeal
                          onDone={() => {
                            setPicked(null);
                            setAddingMeal(null);
                          }}
                          onCancel={() => setPicked(null)}
                        />
                      ) : (
                        <>
                          <FoodPicker token={token} onPick={setPicked} />
                          <button
                            type="button"
                            className={`${btnGhost} mt-3`}
                            onClick={() => setAddingMeal(null)}
                          >
                            Done
                          </button>
                        </>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-[var(--accent-text)] transition-colors hover:text-[var(--accent-dark)]"
                      onClick={() => {
                        setPicked(null);
                        setAddingMeal(meal);
                      }}
                      aria-label={`Add food to ${MEAL_LABELS[meal]}`}
                    >
                      {I.plus} Add food
                    </button>
                  )}
                </section>
              );
            })}
          </div>

          <p className="mt-5 text-xs leading-relaxed text-[var(--faint)]">
            Values are standard reference estimates (IFCT-style) — home
            cooking varies. Totals are worked out from exactly what you
            logged.
          </p>
        </>
      )}
    </div>
  );
}

// ------------------------------------------------------------ food search

function CustomFoodForm({
  token,
  onCreated,
}: {
  token: string;
  onCreated: (food: Food) => void;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [category, setCategory] = useState(FOOD_CATEGORIES[0] ?? "Breakfast");
  const [cuisine, setCuisine] = useState(FOOD_CUISINES[0] ?? "Pan-Indian");
  const [dietFlag, setDietFlag] = useState("veg");
  const [kcal, setKcal] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [fibre, setFibre] = useState("");
  const [servingName, setServingName] = useState("1 serving");
  const [servingGrams, setServingGrams] = useState("100");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: async () => {
      const vals = {
        kcal: num(kcal),
        protein: num(protein),
        carbs: num(carbs),
        fat: num(fat),
        fibre: num(fibre),
        sg: num(servingGrams),
      };
      if (
        vals.kcal == null ||
        vals.protein == null ||
        vals.carbs == null ||
        vals.fat == null ||
        vals.fibre == null ||
        vals.sg == null
      )
        throw new Error("local");
      return await api.createCustomFood({
        token,
        name: name.trim(),
        category,
        cuisine,
        dietFlag: dietFlag as "veg" | "vegan" | "eggetarian" | "non_veg",
        kcalPer100: vals.kcal,
        proteinPer100: vals.protein,
        carbsPer100: vals.carbs,
        fatPer100: vals.fat,
        fibrePer100: vals.fibre,
        servingName: servingName.trim() || "1 serving",
        servingGrams: vals.sg,
        notes: notes.trim() === "" ? null : notes.trim(),
      });
    },
    onSuccess: (res) => {
      if (!res.ok || !res.food) {
        setError(res.error ?? "Could not save this food.");
        return;
      }
      void queryClient.invalidateQueries({ queryKey: ["foodSearch"] });
      void queryClient.invalidateQueries({ queryKey: ["foodLists"] });
      onCreated(res.food);
    },
    onError: (e) =>
      setError(
        e instanceof Error && e.message === "local"
          ? "Fill every value per 100 g with a number (0 is fine)."
          : "Could not reach the server. Please try again.",
      ),
  });

  const numField = (
    label: string,
    value: string,
    set: (v: string) => void,
  ) => (
    <Field label={label}>
      <input
        className={inputCls}
        type="number"
        inputMode="decimal"
        min={0}
        step="0.1"
        value={value}
        onChange={(e) => set(e.target.value)}
        aria-label={label}
        required
      />
    </Field>
  );

  return (
    <form
      className="rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-5"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        create.mutate();
      }}
    >
      <h3 className="font-display text-lg tracking-wide">Your own food</h3>
      <p className="mt-1 text-sm text-[var(--dim)]">
        Values per 100 g, from the packet or your recipe. Only you can see
        and log it.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Food name">
          <input
            className={inputCls}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Mom's rajma"
            required
            minLength={2}
          />
        </Field>
        <Field label="Diet">
          <select
            className={inputCls}
            value={dietFlag}
            onChange={(e) => setDietFlag(e.target.value)}
            aria-label="Diet type"
          >
            {Object.entries(DIET_FLAG_LABELS).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Category">
          <select
            className={inputCls}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Category"
          >
            {FOOD_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Cuisine">
          <select
            className={inputCls}
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            aria-label="Cuisine"
          >
            {FOOD_CUISINES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
        {numField("Kcal / 100 g", kcal, setKcal)}
        {numField("Protein g", protein, setProtein)}
        {numField("Carbs g", carbs, setCarbs)}
        {numField("Fat g", fat, setFat)}
        {numField("Fibre g", fibre, setFibre)}
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Serving name">
          <input
            className={inputCls}
            value={servingName}
            onChange={(e) => setServingName(e.target.value)}
            placeholder="1 katori"
          />
        </Field>
        {numField("Serving grams", servingGrams, setServingGrams)}
      </div>
      <div className="mt-4">
        <Field label="Notes (optional)">
          <input
            className={inputCls}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. From the packet label"
          />
        </Field>
      </div>
      <div className="mt-4">
        <ErrorBox message={error} />
      </div>
      <button
        type="submit"
        className={`${btnPrimary} mt-2`}
        disabled={create.isPending}
      >
        {create.isPending ? "Saving…" : "Save my food"}
      </button>
    </form>
  );
}

function FoodSearch({ token }: { token: string }) {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [dietFlag, setDietFlag] = useState("");
  const [highProtein, setHighProtein] = useState(false);
  const [sort, setSort] = useState("relevance");
  const [picked, setPicked] = useState<Food | null>(null);
  const [showCustom, setShowCustom] = useState(false);
  const [customMsg, setCustomMsg] = useState<string | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => setQuery(input.trim()), 250);
    return () => window.clearTimeout(id);
  }, [input]);

  const hasFilters =
    query !== "" || category !== "" || cuisine !== "" || dietFlag !== "" || highProtein;

  const results = useQuery({
    queryKey: ["foodSearch", token, query, category, cuisine, dietFlag, highProtein, sort],
    queryFn: () =>
      api.searchFoods({
        token,
        query,
        category: category === "" ? undefined : category,
        cuisine: cuisine === "" ? undefined : cuisine,
        dietFlag:
          dietFlag === ""
            ? undefined
            : (dietFlag as "veg" | "vegan" | "eggetarian" | "non_veg"),
        highProtein,
        sort: sort as "relevance" | "kcalAsc" | "kcalDesc" | "proteinDesc",
      }),
  });
  const lists = useQuery({
    queryKey: ["foodLists", token],
    queryFn: () => api.getFoodLists({ token }),
  });

  // Paged results (60 per page from the server): the query loads page
  // one; "Load more" appends further pages until the total is shown.
  const [extraFoods, setExtraFoods] = useState<Food[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  useEffect(() => {
    setExtraFoods([]);
  }, [query, category, cuisine, dietFlag, highProtein, sort]);
  const seenFoodIds = new Set<number>();
  const shownFoods = [...(results.data?.foods ?? []), ...extraFoods].filter(
    (f) => {
      if (seenFoodIds.has(f.id)) return false;
      seenFoodIds.add(f.id);
      return true;
    },
  );
  const totalFoods = results.data?.total ?? 0;
  const loadMoreFoods = async () => {
    setLoadingMore(true);
    try {
      const res = await api.searchFoods({
        token,
        query,
        category: category === "" ? undefined : category,
        cuisine: cuisine === "" ? undefined : cuisine,
        dietFlag:
          dietFlag === ""
            ? undefined
            : (dietFlag as "veg" | "vegan" | "eggetarian" | "non_veg"),
        highProtein,
        sort: sort as "relevance" | "kcalAsc" | "kcalDesc" | "proteinDesc",
        offset: shownFoods.length,
      });
      if (res.ok) setExtraFoods((prev) => [...prev, ...res.foods]);
    } catch {
      /* keep what's shown; the button can be tapped again */
    } finally {
      setLoadingMore(false);
    }
  };

  const selectCls = `${inputCls} appearance-none pr-8`;

  return (
    <div>
      <p className="kicker text-[var(--accent-text)]">Food search</p>
      <h2 className="font-display mt-1.5 text-4xl leading-none sm:text-5xl">
        Find food
      </h2>

      <div className="relative mt-6">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--faint)]">
          {I.search}
        </span>
        <input
          className={`${inputCls} py-3.5 pl-11 text-lg`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Roti, dal, paneer, golgappa…"
          aria-label="Search foods by name"
        />
      </div>

      {/* Filters */}
      <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
        <select
          className={selectCls}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {FOOD_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          className={selectCls}
          value={cuisine}
          onChange={(e) => setCuisine(e.target.value)}
          aria-label="Filter by cuisine"
        >
          <option value="">All cuisines</option>
          {FOOD_CUISINES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          className={selectCls}
          value={dietFlag}
          onChange={(e) => setDietFlag(e.target.value)}
          aria-label="Filter by diet type"
        >
          <option value="">Veg & all</option>
          {Object.entries(DIET_FLAG_LABELS).map(([v, l]) => (
            <option key={v} value={v}>
              {l} only
            </option>
          ))}
        </select>
        <select
          className={selectCls}
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          aria-label="Sort results"
        >
          <option value="relevance">Best match</option>
          <option value="proteinDesc">Most protein</option>
          <option value="kcalAsc">Lowest kcal</option>
          <option value="kcalDesc">Highest kcal</option>
        </select>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={highProtein}
          onClick={() => setHighProtein((v) => !v)}
          className={`rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
            highProtein
              ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-text)]"
              : "border-[var(--border-strong)] text-[var(--dim)] hover:text-[var(--ink)]"
          }`}
        >
          High protein (10 g+ / 100 g)
        </button>
        {hasFilters ? (
          <button
            type="button"
            className="text-[13px] font-semibold text-[var(--dim)] underline decoration-[var(--border-strong)] underline-offset-2 hover:text-[var(--ink)]"
            onClick={() => {
              setInput("");
              setQuery("");
              setCategory("");
              setCuisine("");
              setDietFlag("");
              setHighProtein(false);
            }}
          >
            Clear filters
          </button>
        ) : null}
        <button
          type="button"
          className="ml-auto text-[13px] font-bold text-[var(--accent-text)]"
          onClick={() => setShowCustom((s) => !s)}
          aria-expanded={showCustom}
        >
          {showCustom ? "Close" : "+ Add your own food"}
        </button>
      </div>

      {customMsg ? (
        <p className="mt-4 flex items-center gap-1 text-sm font-medium text-[var(--ok)]">
          {I.check} {customMsg}
        </p>
      ) : null}
      {showCustom ? (
        <div className="mt-4">
          <CustomFoodForm
            token={token}
            onCreated={(food) => {
              setShowCustom(false);
              setCustomMsg(`“${food.name}” saved — it's in your search results now.`);
              setPicked(food);
            }}
          />
        </div>
      ) : null}

      {picked ? (
        <div className="mt-5">
          <AddFoodPanel
            token={token}
            food={picked}
            date={todayLocal()}
            initialMeal="lunch"
            lockMeal={false}
            onDone={() => setPicked(null)}
            onCancel={() => setPicked(null)}
          />
        </div>
      ) : null}

      {/* Favourites & recents when not searching */}
      {!hasFilters && lists.data?.ok ? (
        <div className="mt-8 space-y-8">
          {lists.data.favourites.length > 0 ? (
            <section>
              <h3 className="kicker text-[var(--dim)]">Favourites</h3>
              <ul className="mt-1 divide-y divide-[var(--border)]">
                {lists.data.favourites.map((food) => (
                  <FoodRow key={food.id} token={token} food={food} onAdd={setPicked} />
                ))}
              </ul>
            </section>
          ) : null}
          {lists.data.recents.length > 0 ? (
            <section>
              <h3 className="kicker text-[var(--dim)]">Recently logged</h3>
              <ul className="mt-1 divide-y divide-[var(--border)]">
                {lists.data.recents.map((food) => (
                  <FoodRow key={food.id} token={token} food={food} onAdd={setPicked} />
                ))}
              </ul>
            </section>
          ) : null}
          {lists.data.favourites.length === 0 &&
          lists.data.recents.length === 0 ? (
            <p className="text-sm text-[var(--dim)]">
              Search above to find a food. Star the ones you eat often —
              they'll live here.
            </p>
          ) : null}
        </div>
      ) : null}

      {/* Results */}
      {hasFilters ? (
        <div className="mt-6">
          {results.isPending ? (
            <ListSkeleton rows={5} />
          ) : results.data && shownFoods.length > 0 ? (
            <>
              <p className="kicker text-[var(--dim)]">
                {totalFoods} {totalFoods === 1 ? "food" : "foods"}
              </p>
              <ul className="mt-1 divide-y divide-[var(--border)]">
                {shownFoods.map((food) => (
                  <FoodRow key={food.id} token={token} food={food} onAdd={setPicked} />
                ))}
              </ul>
              {shownFoods.length < totalFoods ? (
                <button
                  type="button"
                  className={`${btnGhost} mt-4 w-full`}
                  onClick={() => void loadMoreFoods()}
                  disabled={loadingMore}
                >
                  {loadingMore
                    ? "Loading…"
                    : `Load more (${totalFoods - shownFoods.length} more)`}
                </button>
              ) : null}
            </>
          ) : (
            <p className="text-sm text-[var(--dim)]">
              Nothing matches. Loosen a filter, try a shorter name — or add
              it as your own food above.
            </p>
          )}
        </div>
      ) : null}

      <p className="mt-8 border-t border-[var(--border)] pt-4 text-xs leading-relaxed text-[var(--faint)]">
        Catalogue values are standard reference estimates (IFCT-style) per
        100 g. Home preparation varies — oil, ghee and gravy change the
        real numbers.
      </p>
    </div>
  );
}

// ------------------------------------------------------------ workouts

/* Searchable exercise library browser. With `onPick` it acts as a
   picker (routine editor, live session, substitute); without it, it's
   the read-only library with form cues expanded per exercise. */
function ExerciseBrowser({
  token,
  onPick,
  initialMuscle,
  pickLabel = "Add",
}: {
  token: string;
  onPick?: (ex: Exercise) => void;
  initialMuscle?: string;
  pickLabel?: string;
}) {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [muscle, setMuscle] = useState(initialMuscle ?? "");
  const [equipment, setEquipment] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setQuery(input), 250);
    return () => clearTimeout(t);
  }, [input]);

  const results = useQuery({
    queryKey: ["exerciseSearch", token, query, muscle, equipment, difficulty],
    queryFn: () =>
      api.searchExercises({
        token,
        query,
        muscleGroup: muscle || undefined,
        equipment: equipment || undefined,
        difficulty:
          difficulty === "beginner" ||
          difficulty === "intermediate" ||
          difficulty === "advanced"
            ? difficulty
            : undefined,
      }),
  });

  // Paged results (40 per page from the server) with load-more.
  const [extraExercises, setExtraExercises] = useState<Exercise[]>([]);
  const [loadingMoreEx, setLoadingMoreEx] = useState(false);
  useEffect(() => {
    setExtraExercises([]);
  }, [query, muscle, equipment, difficulty]);
  const seenExIds = new Set<number>();
  const shownExercises = [
    ...(results.data?.exercises ?? []),
    ...extraExercises,
  ].filter((e) => {
    if (seenExIds.has(e.id)) return false;
    seenExIds.add(e.id);
    return true;
  });
  const totalExercises = results.data?.total ?? 0;
  const loadMoreExercises = async () => {
    setLoadingMoreEx(true);
    try {
      const res = await api.searchExercises({
        token,
        query,
        muscleGroup: muscle || undefined,
        equipment: equipment || undefined,
        difficulty:
          difficulty === "beginner" ||
          difficulty === "intermediate" ||
          difficulty === "advanced"
            ? difficulty
            : undefined,
        offset: shownExercises.length,
      });
      if (res.ok) setExtraExercises((prev) => [...prev, ...res.exercises]);
    } catch {
      /* keep what's shown */
    } finally {
      setLoadingMoreEx(false);
    }
  };

  return (
    <div>
      <input
        className={inputCls}
        type="search"
        placeholder="Search exercises — try “squat” or “curl”"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        aria-label="Search exercises"
      />
      <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Muscle group">
        {["", ...MUSCLE_GROUPS].map((m) => (
          <button
            key={m || "all"}
            type="button"
            onClick={() => setMuscle(m)}
            aria-pressed={muscle === m}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
              muscle === m
                ? "border-[var(--accent-btn)] bg-[var(--accent-btn)] text-white"
                : "border-[var(--border-strong)] text-[var(--dim)] hover:border-[var(--faint)]"
            }`}
          >
            {m === "" ? "All muscles" : m}
          </button>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <label className="block">
          <span className="sr-only">Equipment</span>
          <select
            className={inputCls}
            value={equipment}
            onChange={(e) => setEquipment(e.target.value)}
            aria-label="Equipment"
          >
            <option value="">Any equipment</option>
            {EQUIPMENT_LIST.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="sr-only">Difficulty</span>
          <select
            className={inputCls}
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            aria-label="Difficulty"
          >
            <option value="">Any level</option>
            {Object.entries(DIFFICULTY_LABELS).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4">
        {results.isPending ? (
          <ListSkeleton rows={5} />
        ) : results.data && shownExercises.length > 0 ? (
          <>
          <ul className="divide-y divide-[var(--border)]">
            {shownExercises.map((ex) => {
              const expanded = expandedId === ex.id;
              return (
                <li key={ex.id} className="py-3">
                  <div className="flex items-start justify-between gap-3">
                    <button
                      type="button"
                      className="min-w-0 flex-1 text-left"
                      onClick={() => setExpandedId(expanded ? null : ex.id)}
                      aria-expanded={expanded}
                    >
                      <span className="block text-[15px] font-bold leading-snug">
                        {ex.name}
                      </span>
                      <span className="mt-0.5 block text-xs text-[var(--faint)]">
                        {ex.primaryMuscle}
                        {ex.secondaryMuscles ? ` · ${ex.secondaryMuscles}` : ""} ·{" "}
                        {ex.equipment} · {DIFFICULTY_LABELS[ex.difficulty]}
                      </span>
                    </button>
                    {onPick ? (
                      <button
                        type="button"
                        className="shrink-0 rounded-[6px] bg-[var(--ink)] px-3.5 py-2 text-xs font-bold text-[var(--bg)] transition-colors hover:bg-[var(--accent-btn)] hover:text-white"
                        onClick={() => onPick(ex)}
                        aria-label={`${pickLabel} ${ex.name}`}
                      >
                        {pickLabel}
                      </button>
                    ) : (
                      <span className="shrink-0 text-[var(--faint)]">
                        {expanded ? I.chevronUp : I.chevronDown}
                      </span>
                    )}
                  </div>
                  {expanded ? (
                    <div className="mt-2.5 space-y-2 text-sm leading-relaxed text-[var(--dim)]">
                      <p>{ex.instructions}</p>
                      <p>
                        <span className="font-bold text-[var(--text)]">
                          Watch out:{" "}
                        </span>
                        {ex.mistakes}
                      </p>
                      <p className="text-xs text-[var(--faint)]">
                        Suggested: {ex.suggestedSets} × {ex.suggestedReps} · Rest{" "}
                        {ex.restSeconds}s · {ex.pattern}
                      </p>
                      {onPick ? (
                        <button
                          type="button"
                          className={linkBtn}
                          onClick={() => onPick(ex)}
                        >
                          {I.plus} {pickLabel} this exercise
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
          {shownExercises.length < totalExercises ? (
            <button
              type="button"
              className={`${btnGhost} mt-4 w-full`}
              onClick={() => void loadMoreExercises()}
              disabled={loadingMoreEx}
            >
              {loadingMoreEx
                ? "Loading…"
                : `Load more (${totalExercises - shownExercises.length} more)`}
            </button>
          ) : null}
          </>
        ) : (
          <p className="text-sm text-[var(--dim)]">
            No exercises match. Loosen a filter or try a shorter name.
          </p>
        )}
      </div>
    </div>
  );
}

function RoutineExerciseRow({
  token,
  row,
  isFirst,
  isLast,
  refresh,
}: {
  token: string;
  row: RoutineDetail["exercises"][number];
  isFirst: boolean;
  isLast: boolean;
  refresh: () => void;
}) {
  const [sets, setSets] = useState(`${row.targetSets}`);
  const [reps, setReps] = useState(row.targetReps);
  const [rest, setRest] = useState(`${row.restSeconds}`);
  const [error, setError] = useState<string | null>(null);
  const dirty =
    sets !== `${row.targetSets}` ||
    reps !== row.targetReps ||
    rest !== `${row.restSeconds}`;

  const save = useMutation({
    mutationFn: async () =>
      await api.updateRoutineExercise({
        token,
        routineExerciseId: row.id,
        targetSets: Math.min(20, Math.max(1, Math.round(num(sets) ?? row.targetSets))),
        targetReps: reps.trim() || row.targetReps,
        restSeconds: Math.min(900, Math.max(0, Math.round(num(rest) ?? row.restSeconds))),
      }),
    onSuccess: (res) => {
      if (!res.ok) setError(res.error ?? "Could not save.");
      else refresh();
    },
    onError: () => setError("Could not reach the server."),
  });
  const move = useMutation({
    mutationFn: async (direction: "up" | "down") =>
      await api.moveRoutineExercise({
        token,
        routineExerciseId: row.id,
        direction,
      }),
    onSuccess: () => refresh(),
  });
  const remove = useMutation({
    mutationFn: async () =>
      await api.removeRoutineExercise({ token, routineExerciseId: row.id }),
    onSuccess: () => refresh(),
  });

  return (
    <li className="py-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[15px] font-bold leading-snug">{row.exerciseName}</p>
          <p className="mt-0.5 text-xs text-[var(--faint)]">
            {row.primaryMuscle} · {row.equipment}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            className="rounded-[6px] border border-[var(--border-strong)] p-2 text-[var(--dim)] disabled:opacity-30"
            onClick={() => move.mutate("up")}
            disabled={isFirst}
            aria-label={`Move ${row.exerciseName} up`}
          >
            {I.chevronUp}
          </button>
          <button
            type="button"
            className="rounded-[6px] border border-[var(--border-strong)] p-2 text-[var(--dim)] disabled:opacity-30"
            onClick={() => move.mutate("down")}
            disabled={isLast}
            aria-label={`Move ${row.exerciseName} down`}
          >
            {I.chevronDown}
          </button>
          <button
            type="button"
            className="rounded-[6px] border border-[var(--border-strong)] p-2 text-[var(--accent-text)]"
            onClick={() => remove.mutate()}
            aria-label={`Remove ${row.exerciseName}`}
          >
            {I.trash}
          </button>
        </div>
      </div>
      <div className="mt-2.5 grid grid-cols-3 gap-2">
        <label className="block">
          <span className="kicker mb-1 block text-[10px] text-[var(--faint)]">Sets</span>
          <input
            className={`${inputCls} !py-2 text-center`}
            type="number"
            inputMode="numeric"
            min={1}
            max={20}
            value={sets}
            onChange={(e) => setSets(e.target.value)}
            aria-label={`Target sets for ${row.exerciseName}`}
          />
        </label>
        <label className="block">
          <span className="kicker mb-1 block text-[10px] text-[var(--faint)]">Reps</span>
          <input
            className={`${inputCls} !py-2 text-center`}
            type="text"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            aria-label={`Target reps for ${row.exerciseName}`}
          />
        </label>
        <label className="block">
          <span className="kicker mb-1 block text-[10px] text-[var(--faint)]">Rest (sec)</span>
          <input
            className={`${inputCls} !py-2 text-center`}
            type="number"
            inputMode="numeric"
            min={0}
            max={900}
            step={15}
            value={rest}
            onChange={(e) => setRest(e.target.value)}
            aria-label={`Rest seconds for ${row.exerciseName}`}
          />
        </label>
      </div>
      {dirty ? (
        <button
          type="button"
          className={`${btnPrimary} mt-2.5 !px-4 !py-2 text-xs`}
          onClick={() => save.mutate()}
          disabled={save.isPending}
        >
          {save.isPending ? "Saving…" : "Save targets"}
        </button>
      ) : null}
      <ErrorBox message={error} />
    </li>
  );
}

function RoutineEditor({
  token,
  routineId,
  onBack,
  onStart,
}: {
  token: string;
  routineId: number;
  onBack: () => void;
  onStart: (routineId: number) => void;
}) {
  const queryClient = useQueryClient();
  const routine = useQuery({
    queryKey: ["routine", token, routineId],
    queryFn: () => api.getRoutine({ token, routineId }),
  });
  const data = routine.data?.routine ?? null;
  const [name, setName] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["routine", token, routineId] });
    void queryClient.invalidateQueries({ queryKey: ["routines", token] });
  };

  const rename = useMutation({
    mutationFn: async () =>
      await api.updateRoutine({
        token,
        routineId,
        name: (name ?? "").trim(),
      }),
    onSuccess: (res) => {
      if (!res.ok) setError(res.error ?? "Could not rename.");
      else refresh();
    },
  });
  const addEx = useMutation({
    mutationFn: async (ex: Exercise) =>
      await api.addRoutineExercise({ token, routineId, exerciseId: ex.id }),
    onSuccess: (res) => {
      if (!res.ok) setError(res.error ?? "Could not add exercise.");
      else {
        setPickerOpen(false);
        refresh();
      }
    },
  });
  const del = useMutation({
    mutationFn: async () => await api.deleteRoutine({ token, routineId }),
    onSuccess: (res) => {
      if (!res.ok) setError(res.error ?? "Could not delete routine.");
      else {
        void queryClient.invalidateQueries({ queryKey: ["routines", token] });
        onBack();
      }
    },
  });

  if (routine.isPending) {
    return <p className="pt-6 text-sm text-[var(--dim)]">Loading routine…</p>;
  }
  if (!data) {
    return (
      <div className="pt-6">
        <ErrorBox message={routine.data?.error ?? "Routine not found."} />
        <button type="button" className={`${linkBtn} mt-4`} onClick={onBack}>
          {I.chevronLeft} Back to workouts
        </button>
      </div>
    );
  }

  const nameValue = name ?? data.name;
  return (
    <div className="pt-6 sm:pt-10">
      <button type="button" className={linkBtn} onClick={onBack}>
        {I.chevronLeft} All workouts
      </button>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0 flex-1">
          <label className="block">
            <span className="kicker text-[var(--dim)]">Routine name</span>
            <input
              className="font-display mt-1.5 w-full border-b-2 border-[var(--border-strong)] bg-transparent pb-1 text-3xl uppercase leading-none focus:border-[var(--accent)] focus:outline-none sm:text-4xl"
              value={nameValue}
              onChange={(e) => setName(e.target.value)}
              aria-label="Routine name"
            />
          </label>
          {data.notes ? (
            <p className="mt-1.5 text-sm text-[var(--dim)]">{data.notes}</p>
          ) : null}
        </div>
        {name != null && name.trim() !== data.name && name.trim() !== "" ? (
          <button
            type="button"
            className={btnPrimary}
            onClick={() => rename.mutate()}
            disabled={rename.isPending}
          >
            Save name
          </button>
        ) : null}
      </div>

      <ErrorBox message={error} />

      {data.exercises.length > 0 ? (
        <ul className="mt-4 divide-y divide-[var(--border)] border-y border-[var(--border)]">
          {data.exercises.map((row, i) => (
            <RoutineExerciseRow
              key={row.id}
              token={token}
              row={row}
              isFirst={i === 0}
              isLast={i === data.exercises.length - 1}
              refresh={refresh}
            />
          ))}
        </ul>
      ) : (
        <p className="mt-6 text-sm text-[var(--dim)]">
          No exercises yet — add the first one below.
        </p>
      )}

      {pickerOpen ? (
        <div className="mt-5 border border-[var(--border-strong)] bg-[var(--surface)] p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="kicker text-[var(--dim)]">Add exercise</h3>
            <button
              type="button"
              className="p-1 text-[var(--dim)]"
              onClick={() => setPickerOpen(false)}
              aria-label="Close exercise picker"
            >
              {I.x}
            </button>
          </div>
          <ExerciseBrowser token={token} onPick={(ex) => addEx.mutate(ex)} />
        </div>
      ) : (
        <button
          type="button"
          className={`${btnGhost} mt-5`}
          onClick={() => setPickerOpen(true)}
        >
          {I.plus} Add exercise
        </button>
      )}

      <div className="mt-8 flex flex-wrap gap-3 border-t border-[var(--border)] pt-6">
        <button
          type="button"
          className={btnInk}
          onClick={() => onStart(routineId)}
          disabled={data.exercises.length === 0}
        >
          {I.play} Start this workout
        </button>
        {confirmDelete ? (
          <>
            <button
              type="button"
              className={btnDanger}
              onClick={() => del.mutate()}
              disabled={del.isPending}
            >
              Delete routine for good?
            </button>
            <button
              type="button"
              className={btnGhost}
              onClick={() => setConfirmDelete(false)}
            >
              Keep it
            </button>
          </>
        ) : (
          <button
            type="button"
            className={btnDanger}
            onClick={() => setConfirmDelete(true)}
          >
            {I.trash} Delete routine
          </button>
        )}
      </div>
      <p className="mt-3 text-xs text-[var(--faint)]">
        Deleting a routine never deletes your past workout history.
      </p>
    </div>
  );
}

function RestTimer({
  total,
  onClose,
}: {
  total: number;
  onClose: () => void;
}) {
  const [remaining, setRemaining] = useState(total);
  const [added, setAdded] = useState(0);
  const done = remaining <= 0;

  useEffect(() => {
    if (remaining <= 0) {
      try {
        navigator.vibrate?.(200);
      } catch {
        /* not supported */
      }
      return;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining]);

  const full = total + added;
  const pct = full > 0 ? Math.min(100, Math.max(0, (1 - remaining / full) * 100)) : 100;
  return (
    <div
      className="fixed inset-x-0 bottom-[68px] z-40 lg:bottom-6"
      role="timer"
      aria-label={done ? "Rest finished" : `Rest: ${fmtClock(remaining)} remaining`}
    >
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
        <div
          className={`overflow-hidden rounded-[8px] border border-[var(--border-strong)] shadow-[var(--shadow-card)] ${
            done
              ? "bg-[var(--ok)] text-white"
              : "bg-[var(--surface)] text-[var(--text)]"
          }`}
        >
          <span className="sr-only" aria-live="polite">
            {done ? "Rest finished. Time for the next set." : ""}
          </span>
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className={done ? undefined : "text-[var(--accent-text)]"}>
                {I.timer}
              </span>
              <div>
                <p className="font-display text-2xl leading-none">
                  {done ? "REST DONE" : fmtClock(remaining)}
                </p>
                <p className={`mt-0.5 text-xs ${done ? "font-semibold text-white/80" : "text-[var(--dim)]"}`}>
                  {done ? "Next set — go." : "Resting…"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!done ? (
                <button
                  type="button"
                  className="rounded-[6px] border border-[var(--border-strong)] px-3 py-2 text-xs font-bold"
                  onClick={() => {
                    setAdded((a) => a + 30);
                    setRemaining((r) => r + 30);
                  }}
                >
                  +30s
                </button>
              ) : null}
              <button
                type="button"
                className="rounded-[6px] bg-[var(--accent-btn)] px-3.5 py-2 text-xs font-bold text-white"
                onClick={onClose}
              >
                {done ? "OK" : "Skip"}
              </button>
            </div>
          </div>
          <div className="h-1 bg-[var(--surface-3)]">
            <div
              className="h-full bg-[var(--accent)] transition-[width] duration-1000 ease-linear"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SetRow({
  token,
  profile,
  ex,
  set,
  refresh,
  onCompleted,
}: {
  token: string;
  profile: Profile;
  ex: SessionExerciseData;
  set: SessionExerciseData["sets"][number];
  refresh: () => void;
  onCompleted: (restSeconds: number) => void;
}) {
  const imperial = profile.units === "imperial";
  const [reps, setReps] = useState(set.reps != null ? `${set.reps}` : "");
  const [load, setLoad] = useState(
    set.loadKg != null
      ? `${imperial ? Math.round(kgToLb(set.loadKg) * 10) / 10 : set.loadKg}`
      : "",
  );
  const [dur, setDur] = useState(
    set.durationSeconds != null ? `${set.durationSeconds}` : "",
  );
  const [error, setError] = useState<string | null>(null);

  const values = () => {
    const r = num(reps);
    const l = num(load);
    const d = num(dur);
    return {
      reps: r != null ? Math.round(r) : null,
      loadKg:
        l != null
          ? Math.round((imperial ? lbToKg(l) : l) * 100) / 100
          : null,
      durationSeconds: d != null ? Math.round(d) : null,
    };
  };

  const update = useMutation({
    mutationFn: async (args: {
      reps: number | null;
      loadKg: number | null;
      durationSeconds: number | null;
      completed?: boolean;
    }) =>
      await api.updateSet({
        token,
        setId: set.id,
        reps: args.reps,
        loadKg: args.loadKg,
        durationSeconds: args.durationSeconds,
        // Only the done-toggle sends `completed`; a blur value-save
        // omits it so it can never revert a toggle it raced with
        // (Phase 6 fix — the server patches only fields it receives).
        ...(args.completed !== undefined
          ? { completed: args.completed }
          : {}),
      }),
    onSuccess: (res, args) => {
      if (!res.ok) {
        setError(res.error ?? "Could not save set.");
        return;
      }
      if (args.completed && !set.completed) onCompleted(ex.restSeconds);
      refresh();
    },
    onError: () => setError("Could not reach the server."),
  });
  const del = useMutation({
    mutationFn: async () => await api.deleteSet({ token, setId: set.id }),
    onSuccess: () => refresh(),
  });

  const saveValues = () => {
    if (update.isPending) return;
    // Values only — never send `completed` from a blur save (see the
    // mutation above): the done state belongs to the toggle alone.
    update.mutate({ ...values() });
  };

  const inputClsSet =
    "w-full rounded-[6px] border border-[var(--border-strong)] bg-[var(--input)] px-2 py-2.5 text-center text-base font-semibold text-[var(--text)] focus:border-[var(--accent)] focus:outline-none";

  return (
    <li
      className={`rounded-[6px] px-2 py-2 ${
        set.completed ? "bg-[var(--accent-soft)]" : ""
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="w-6 shrink-0 text-center text-sm font-bold text-[var(--faint)]">
          {set.setNumber}
        </span>
        {ex.kind === "timed" ? (
          <label className="flex-1">
            <span className="sr-only">Duration in seconds for set {set.setNumber}</span>
            <input
              className={inputClsSet}
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="sec"
              value={dur}
              onChange={(e) => setDur(e.target.value)}
              onBlur={saveValues}
            />
          </label>
        ) : (
          <>
            <label className="flex-1">
              <span className="sr-only">Reps for set {set.setNumber}</span>
              <input
                className={inputClsSet}
                type="number"
                inputMode="numeric"
                min={0}
                placeholder="reps"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                onBlur={saveValues}
              />
            </label>
            {ex.kind === "weighted" ? (
              <label className="flex-1">
                <span className="sr-only">
                  Load in {imperial ? "pounds" : "kilograms"} for set {set.setNumber}
                </span>
                <input
                  className={inputClsSet}
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="0.5"
                  placeholder={imperial ? "lb" : "kg"}
                  value={load}
                  onChange={(e) => setLoad(e.target.value)}
                  onBlur={saveValues}
                />
              </label>
            ) : null}
          </>
        )}
        <button
          type="button"
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[6px] border-2 transition-colors ${
            set.completed
              ? "border-[var(--accent-btn)] bg-[var(--accent-btn)] text-white"
              : "border-[var(--border-strong)] text-[var(--faint)] hover:border-[var(--accent)] hover:text-[var(--accent-text)]"
          }`}
          onClick={() =>
            update.mutate({ ...values(), completed: !set.completed })
          }
          disabled={update.isPending}
          aria-label={
            set.completed
              ? `Mark set ${set.setNumber} not done`
              : `Mark set ${set.setNumber} done`
          }
          aria-pressed={set.completed}
        >
          {I.check}
        </button>
        <button
          type="button"
          className="shrink-0 p-1.5 text-[var(--faint)] hover:text-[var(--accent-text)]"
          onClick={() => del.mutate()}
          aria-label={`Delete set ${set.setNumber}`}
        >
          {I.x}
        </button>
      </div>
      <ErrorBox message={error} />
    </li>
  );
}

function SessionExerciseBlock({
  token,
  profile,
  ex,
  refresh,
  startRest,
  onSubstitute,
}: {
  token: string;
  profile: Profile;
  ex: SessionExerciseData;
  refresh: () => void;
  startRest: (seconds: number) => void;
  onSubstitute: (ex: SessionExerciseData) => void;
}) {
  const addSetMut = useMutation({
    mutationFn: async () =>
      await api.addSet({ token, sessionExerciseId: ex.id }),
    onSuccess: () => refresh(),
  });
  const skipMut = useMutation({
    mutationFn: async () =>
      await api.skipSessionExercise({
        token,
        sessionExerciseId: ex.id,
        skipped: !ex.skipped,
      }),
    onSuccess: () => refresh(),
  });
  const removeMut = useMutation({
    mutationFn: async () =>
      await api.removeSessionExercise({ token, sessionExerciseId: ex.id }),
    onSuccess: () => refresh(),
  });
  const doneCount = ex.sets.filter((s) => s.completed).length;

  return (
    <section className="border-t border-[var(--border)] py-5 first:border-t-0">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-display text-xl leading-tight">{ex.exerciseName}</h3>
          <p className="mt-0.5 text-xs text-[var(--faint)]">
            {ex.primaryMuscle} ·{" "}
            {ex.kind === "timed"
              ? "Timed"
              : ex.kind === "bodyweight"
                ? "Bodyweight"
                : "Weighted"}{" "}
            · Rest {ex.restSeconds}s
            {ex.sets.length > 0 ? ` · ${doneCount}/${ex.sets.length} sets done` : ""}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-1.5">
          {!ex.skipped ? (
            <>
              <button
                type="button"
                className="rounded-[6px] border border-[var(--border-strong)] px-2.5 py-1.5 text-xs font-semibold text-[var(--dim)]"
                onClick={() => onSubstitute(ex)}
              >
                Substitute
              </button>
              <button
                type="button"
                className="rounded-[6px] border border-[var(--border-strong)] px-2.5 py-1.5 text-xs font-semibold text-[var(--dim)]"
                onClick={() => skipMut.mutate()}
              >
                Skip
              </button>
            </>
          ) : null}
          <button
            type="button"
            className="rounded-[6px] border border-[var(--border-strong)] px-2.5 py-1.5 text-xs font-semibold text-[var(--accent-text)]"
            onClick={() => removeMut.mutate()}
            aria-label={`Remove ${ex.exerciseName} from workout`}
          >
            Remove
          </button>
        </div>
      </div>
      {ex.skipped ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 bg-[var(--surface-2)] px-3.5 py-2.5">
          <p className="text-sm text-[var(--dim)]">
            Skipped — its sets don't count toward volume or records.
          </p>
          <button
            type="button"
            className={linkBtn}
            onClick={() => skipMut.mutate()}
          >
            Un-skip
          </button>
        </div>
      ) : (
        <>
          <ul className="mt-3 space-y-1.5">
            {ex.sets.map((s) => (
              <SetRow
                key={s.id}
                token={token}
                profile={profile}
                ex={ex}
                set={s}
                refresh={refresh}
                onCompleted={startRest}
              />
            ))}
          </ul>
          <button
            type="button"
            className="mt-2 inline-flex items-center gap-1.5 px-2 py-1.5 text-sm font-semibold text-[var(--dim)] hover:text-[var(--accent-text)]"
            onClick={() => addSetMut.mutate()}
          >
            {I.plus} Add set
          </button>
        </>
      )}
    </section>
  );
}

function LiveSession({
  token,
  profile,
  sessionId,
  onFinished,
  onExit,
}: {
  token: string;
  profile: Profile;
  sessionId: number;
  onFinished: (sessionId: number) => void;
  onExit: () => void;
}) {
  const queryClient = useQueryClient();
  const sessionQ = useQuery({
    queryKey: ["workoutSession", token, sessionId],
    queryFn: () => api.getWorkoutSession({ token, sessionId }),
  });
  const session = sessionQ.data?.session ?? null;
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [rest, setRest] = useState<{ key: number; seconds: number } | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [subTarget, setSubTarget] = useState<SessionExerciseData | null>(null);
  const [notes, setNotes] = useState<string | null>(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const refresh = () => {
    void queryClient.invalidateQueries({
      queryKey: ["workoutSession", token, sessionId],
    });
  };
  const refreshAll = () => {
    refresh();
    void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    void queryClient.invalidateQueries({ queryKey: ["activeSession", token] });
    void queryClient.invalidateQueries({ queryKey: ["workoutHistory", token] });
    void queryClient.invalidateQueries({ queryKey: ["personalRecords", token] });
  };

  const addExMut = useMutation({
    mutationFn: async (ex: Exercise) =>
      await api.addSessionExercise({ token, sessionId, exerciseId: ex.id }),
    onSuccess: (res) => {
      if (!res.ok) setError(res.error ?? "Could not add exercise.");
      else {
        setAddOpen(false);
        refresh();
      }
    },
  });
  const subMut = useMutation({
    mutationFn: async (ex: Exercise) =>
      await api.substituteExercise({
        token,
        sessionExerciseId: subTarget?.id ?? 0,
        newExerciseId: ex.id,
      }),
    onSuccess: (res) => {
      if (!res.ok) setError(res.error ?? "Could not substitute.");
      else {
        setSubTarget(null);
        refresh();
      }
    },
  });
  const notesMut = useMutation({
    mutationFn: async () =>
      await api.setSessionNotes({
        token,
        sessionId,
        notes: (notes ?? "").trim() === "" ? null : (notes ?? "").trim(),
      }),
    onSuccess: (res) => {
      if (!res.ok) setError(res.error ?? "Could not save notes.");
      else refresh();
    },
  });
  const finishMut = useMutation({
    mutationFn: async () =>
      await api.finishSession({
        token,
        sessionId,
        notes:
          notes != null
            ? notes.trim() === ""
              ? null
              : notes.trim()
            : undefined,
      }),
    onSuccess: (res) => {
      if (!res.ok) {
        setError(res.error ?? "Could not finish the workout.");
        return;
      }
      refreshAll();
      onFinished(sessionId);
    },
    onError: () => setError("Could not reach the server."),
  });
  const discardMut = useMutation({
    mutationFn: async () => await api.discardSession({ token, sessionId }),
    onSuccess: (res) => {
      if (!res.ok) {
        setError(res.error ?? "Could not discard.");
        return;
      }
      refreshAll();
      onExit();
    },
  });

  if (sessionQ.isPending) {
    return <p className="pt-6 text-sm text-[var(--dim)]">Loading workout…</p>;
  }
  if (!session) {
    return (
      <div className="pt-6">
        <ErrorBox message={sessionQ.data?.error ?? "Workout not found."} />
        <button type="button" className={`${linkBtn} mt-4`} onClick={onExit}>
          {I.chevronLeft} Back to workouts
        </button>
      </div>
    );
  }

  const startedAtMs = new Date(session.startedAt).getTime();
  const elapsed = Math.max(0, Math.floor((nowMs - startedAtMs) / 1000));
  const notesValue = notes ?? session.notes ?? "";

  return (
    <div className="pt-6 sm:pt-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="kicker flex items-center gap-2 text-[var(--accent-text)]">
            <span className="dot-pulse inline-block h-2 w-2 rounded-full bg-[var(--accent)]" aria-hidden="true" />
            Live workout · {prettyDate(session.startedOn)}
          </p>
          <h2 className="font-display mt-1.5 text-4xl leading-none sm:text-5xl">
            {session.title}
          </h2>
        </div>
        <p className="tnum pb-1 text-right">
          <span className="font-display block text-3xl leading-none">
            {fmtClock(elapsed)}
          </span>
          <span className="mt-1 block text-xs text-[var(--faint)]">
            {session.completedSets} sets done · {fmtVolume(session.totalVolumeKg, profile.units)} volume
          </span>
        </p>
      </div>

      <ErrorBox message={error} />

      <div className="mt-2">
        {session.exercises.map((ex) => (
          <SessionExerciseBlock
            key={ex.id}
            token={token}
            profile={profile}
            ex={ex}
            refresh={refresh}
            startRest={(seconds) => {
              if (seconds > 0) setRest({ key: Date.now(), seconds });
            }}
            onSubstitute={(target) => setSubTarget(target)}
          />
        ))}
      </div>

      {subTarget ? (
        <div className="mt-2 border border-[var(--border-strong)] bg-[var(--surface)] p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="kicker text-[var(--dim)]">
              Substitute for {subTarget.exerciseName} — {subTarget.primaryMuscle}
            </h3>
            <button
              type="button"
              className="p-1 text-[var(--dim)]"
              onClick={() => setSubTarget(null)}
              aria-label="Cancel substitute"
            >
              {I.x}
            </button>
          </div>
          <ExerciseBrowser
            token={token}
            initialMuscle={subTarget.primaryMuscle}
            pickLabel="Swap in"
            onPick={(ex) => subMut.mutate(ex)}
          />
        </div>
      ) : addOpen ? (
        <div className="mt-2 border border-[var(--border-strong)] bg-[var(--surface)] p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="kicker text-[var(--dim)]">Add exercise</h3>
            <button
              type="button"
              className="p-1 text-[var(--dim)]"
              onClick={() => setAddOpen(false)}
              aria-label="Close exercise picker"
            >
              {I.x}
            </button>
          </div>
          <ExerciseBrowser token={token} onPick={(ex) => addExMut.mutate(ex)} />
        </div>
      ) : (
        <button
          type="button"
          className={`${btnGhost} mt-2`}
          onClick={() => setAddOpen(true)}
        >
          {I.plus} Add exercise
        </button>
      )}

      <div className="mt-6 border-t border-[var(--border)] pt-5">
        <Field label="Session notes">
          <textarea
            className={inputCls}
            rows={2}
            placeholder="How it felt, what to change next time…"
            value={notesValue}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => {
              if (notes != null && notes !== (session.notes ?? "")) notesMut.mutate();
            }}
          />
        </Field>
      </div>

      <div className="mt-6 flex flex-wrap gap-3 pb-24">
        <button
          type="button"
          className={`${btnInk} flex-1 !py-4 text-base`}
          onClick={() => finishMut.mutate()}
          disabled={finishMut.isPending}
        >
          {I.check} {finishMut.isPending ? "Saving…" : "Finish workout"}
        </button>
        {confirmDiscard ? (
          <>
            <button
              type="button"
              className={btnDanger}
              onClick={() => discardMut.mutate()}
              disabled={discardMut.isPending}
            >
              Discard for good?
            </button>
            <button
              type="button"
              className={btnGhost}
              onClick={() => setConfirmDiscard(false)}
            >
              Keep going
            </button>
          </>
        ) : (
          <button
            type="button"
            className={btnDanger}
            onClick={() => setConfirmDiscard(true)}
          >
            Discard
          </button>
        )}
      </div>

      {rest ? (
        <RestTimer
          key={rest.key}
          total={rest.seconds}
          onClose={() => setRest(null)}
        />
      ) : null}
    </div>
  );
}

function SessionDetail({
  token,
  profile,
  sessionId,
  onBack,
  onProgress,
}: {
  token: string;
  profile: Profile;
  sessionId: number;
  onBack: () => void;
  onProgress: (exerciseId: number) => void;
}) {
  const sessionQ = useQuery({
    queryKey: ["workoutSession", token, sessionId],
    queryFn: () => api.getWorkoutSession({ token, sessionId }),
  });
  const session = sessionQ.data?.session ?? null;

  if (sessionQ.isPending) {
    return <p className="pt-6 text-sm text-[var(--dim)]">Loading…</p>;
  }
  if (!session) {
    return (
      <div className="pt-6">
        <ErrorBox message={sessionQ.data?.error ?? "Workout not found."} />
        <button type="button" className={`${linkBtn} mt-4`} onClick={onBack}>
          {I.chevronLeft} Back
        </button>
      </div>
    );
  }

  return (
    <div className="pt-6 sm:pt-10">
      <button type="button" className={linkBtn} onClick={onBack}>
        {I.chevronLeft} All workouts
      </button>
      <h2 className="font-display mt-3 text-4xl leading-none sm:text-5xl">
        {session.title}
      </h2>
      <p className="mt-2 text-sm text-[var(--dim)]">
        {prettyDate(session.startedOn)} · {fmtDuration(session.durationSeconds)} ·{" "}
        {session.completedSets} sets · {fmtVolume(session.totalVolumeKg, profile.units)} volume
      </p>
      {session.notes ? (
        <p className="mt-3 max-w-lg rounded-[8px] bg-[var(--accent-soft)] px-4 py-2.5 text-sm">
          {session.notes}
        </p>
      ) : null}

      <div className="mt-2">
        {session.exercises.map((ex) => (
          <section
            key={ex.id}
            className="border-t border-[var(--border)] py-5 first:border-t-0"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="font-display text-xl leading-tight">
                  {ex.exerciseName}
                  {ex.skipped ? (
                    <span className="ml-2 align-middle text-xs font-bold uppercase tracking-wider text-[var(--faint)]">
                      Skipped
                    </span>
                  ) : null}
                </h3>
                <p className="mt-0.5 text-xs text-[var(--faint)]">
                  {ex.primaryMuscle}
                </p>
              </div>
              {!ex.skipped ? (
                <button
                  type="button"
                  className={linkBtn}
                  onClick={() => onProgress(ex.exerciseId)}
                >
                  Progress {I.arrowRight}
                </button>
              ) : null}
            </div>
            {!ex.skipped ? (
              <ul className="mt-3 space-y-1">
                {ex.sets.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center gap-3 text-sm"
                  >
                    <span className="w-6 text-center font-bold text-[var(--faint)]">
                      {s.setNumber}
                    </span>
                    <span className={s.completed ? "" : "text-[var(--faint)]"}>
                      {ex.kind === "timed"
                        ? s.durationSeconds != null
                          ? fmtClock(s.durationSeconds)
                          : "—"
                        : s.reps != null
                          ? `${s.reps} reps`
                          : "—"}
                      {ex.kind === "weighted" && s.loadKg != null
                        ? ` × ${fmtLoad(s.loadKg, profile.units)}`
                        : ""}
                    </span>
                    <span
                      className={
                        s.completed
                          ? "text-[var(--ok)]"
                          : "text-[var(--faint)]"
                      }
                      aria-label={s.completed ? "Completed" : "Not completed"}
                    >
                      {s.completed ? I.check : I.x}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>
    </div>
  );
}

function ProgressLine({
  points,
}: {
  points: { date: string; value: number }[];
}) {
  if (points.length < 2) return null;
  const W = 300;
  const H = 90;
  const PAD = 8;
  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const x = (i: number) => PAD + (i / (points.length - 1)) * (W - PAD * 2);
  const y = (v: number) => H - PAD - ((v - min) / span) * (H - PAD * 2);
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p.value)}`).join(" ");
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="mt-3 w-full"
      role="img"
      aria-label={`Load progression from ${values[0]} to ${values[values.length - 1]} kilograms`}
    >
      <path d={d} fill="none" stroke="var(--accent)" strokeWidth="2.5" />
      {points.map((p, i) => (
        <circle key={p.date} cx={x(i)} cy={y(p.value)} r="3.5" fill="var(--accent)" />
      ))}
    </svg>
  );
}

function ExerciseProgress({
  token,
  profile,
  exerciseId,
  onBack,
}: {
  token: string;
  profile: Profile;
  exerciseId: number;
  onBack: () => void;
}) {
  const progress = useQuery({
    queryKey: ["exerciseProgress", token, exerciseId],
    queryFn: () => api.getExerciseProgress({ token, exerciseId }),
  });
  const data = progress.data;
  const record = data?.record ?? null;
  const linePoints = (data?.sessions ?? [])
    .filter((s) => s.bestLoadKg != null)
    .map((s) => ({ date: s.date, value: s.bestLoadKg ?? 0 }));

  return (
    <div className="pt-6 sm:pt-10">
      <button type="button" className={linkBtn} onClick={onBack}>
        {I.chevronLeft} All workouts
      </button>
      {progress.isPending ? (
        <ListSkeleton rows={3} />
      ) : !data?.ok ? (
        <div className="mt-4">
          <ErrorBox message={data?.error ?? "Could not load progress."} />
        </div>
      ) : (
        <>
          <h2 className="font-display mt-3 text-4xl leading-none sm:text-5xl">
            {data.exerciseName}
          </h2>
          {record ? (
            <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
              {record.heaviestLoadKg != null ? (
                <p>
                  <span className="kicker block text-[var(--faint)]">Heaviest</span>
                  <span className="font-display mt-1 block text-3xl leading-none">
                    {fmtLoad(record.heaviestLoadKg, profile.units)}
                    {record.heaviestReps != null ? (
                      <span className="text-lg"> × {record.heaviestReps}</span>
                    ) : null}
                  </span>
                </p>
              ) : null}
              {record.estimatedOneRmKg != null ? (
                <p>
                  <span className="kicker block text-[var(--faint)]">
                    Est. 1RM · Epley
                  </span>
                  <span className="font-display mt-1 block text-3xl leading-none">
                    {fmtLoad(record.estimatedOneRmKg, profile.units)}
                  </span>
                </p>
              ) : null}
              {record.bestReps != null && record.heaviestLoadKg == null ? (
                <p>
                  <span className="kicker block text-[var(--faint)]">Best set</span>
                  <span className="font-display mt-1 block text-3xl leading-none">
                    {record.bestReps} reps
                  </span>
                </p>
              ) : null}
              {record.longestSeconds != null ? (
                <p>
                  <span className="kicker block text-[var(--faint)]">Longest</span>
                  <span className="font-display mt-1 block text-3xl leading-none">
                    {fmtClock(record.longestSeconds)}
                  </span>
                </p>
              ) : null}
            </div>
          ) : (
            <p className="mt-4 text-sm text-[var(--dim)]">
              No completed sets yet — finish a workout with this exercise and
              your progression starts here.
            </p>
          )}

          {linePoints.length >= 2 ? (
            <div className="mt-6 border-t border-[var(--border)] pt-4">
              <p className="kicker text-[var(--dim)]">Best load per session</p>
              <ProgressLine points={linePoints} />
              <div className="mt-1 flex justify-between text-xs text-[var(--faint)]">
                <span>{prettyDate(linePoints[0]?.date ?? "")}</span>
                <span>{prettyDate(linePoints[linePoints.length - 1]?.date ?? "")}</span>
              </div>
            </div>
          ) : null}

          {data.sessions.length > 0 ? (
            <ul className="mt-6 divide-y divide-[var(--border)] border-y border-[var(--border)]">
              {[...data.sessions].reverse().map((s) => (
                <li
                  key={s.date}
                  className="flex flex-wrap items-baseline justify-between gap-2 py-3 text-sm"
                >
                  <span className="font-semibold">{prettyDate(s.date)}</span>
                  <span className="text-[var(--dim)]">
                    {s.bestLoadKg != null
                      ? `Best ${fmtLoad(s.bestLoadKg, profile.units)}${s.bestLoadReps != null ? ` × ${s.bestLoadReps}` : ""} · `
                      : s.longestSeconds != null
                        ? `Longest ${fmtClock(s.longestSeconds)} · `
                        : s.bestReps != null
                          ? `Best ${s.bestReps} reps · `
                          : ""}
                    {s.setCount} sets · {fmtVolume(s.volumeKg, profile.units)}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </>
      )}
    </div>
  );
}

type WorkoutScreen =
  | { kind: "home" }
  | { kind: "editRoutine"; routineId: number }
  | { kind: "live"; sessionId: number }
  | { kind: "detail"; sessionId: number }
  | { kind: "progress"; exerciseId: number };

function Workouts({ token, profile }: { token: string; profile: Profile }) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"train" | "library" | "history" | "records">(
    "train",
  );
  const [screen, setScreen] = useState<WorkoutScreen>({ kind: "home" });
  const [newRoutineName, setNewRoutineName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const templates = useQuery({
    queryKey: ["workoutTemplates", token],
    queryFn: () => api.getWorkoutTemplates({ token }),
  });
  const routines = useQuery({
    queryKey: ["routines", token],
    queryFn: () => api.getRoutines({ token }),
  });
  const active = useQuery({
    queryKey: ["activeSession", token],
    queryFn: () => api.getActiveSession({ token }),
  });
  const [historyLimit, setHistoryLimit] = useState(30);
  const history = useQuery({
    queryKey: ["workoutHistory", token, historyLimit],
    queryFn: () => api.getWorkoutHistory({ token, limit: historyLimit }),
  });
  const records = useQuery({
    queryKey: ["personalRecords", token],
    queryFn: () => api.getPersonalRecords({ token }),
  });

  const refreshAll = () => {
    void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    void queryClient.invalidateQueries({ queryKey: ["routines", token] });
    void queryClient.invalidateQueries({ queryKey: ["activeSession", token] });
    void queryClient.invalidateQueries({ queryKey: ["workoutHistory", token] });
    void queryClient.invalidateQueries({ queryKey: ["personalRecords", token] });
  };

  const start = useMutation({
    mutationFn: async (routineId: number | null) =>
      await api.startSession({ token, routineId, today: todayLocal() }),
    onSuccess: (res) => {
      if (!res.ok || !res.session) {
        setError(res.error ?? "Could not start the workout.");
        return;
      }
      setError(null);
      refreshAll();
      setScreen({ kind: "live", sessionId: res.session.id });
    },
    onError: () => setError("Could not reach the server."),
  });
  const copy = useMutation({
    mutationFn: async (templateKey: string) =>
      await api.copyTemplate({ token, templateKey }),
    onSuccess: (res) => {
      if (!res.ok || res.routineId == null) {
        setError(res.error ?? "Could not copy the template.");
        return;
      }
      refreshAll();
      setScreen({ kind: "editRoutine", routineId: res.routineId });
    },
  });
  const create = useMutation({
    mutationFn: async () =>
      await api.createRoutine({ token, name: newRoutineName.trim() }),
    onSuccess: (res) => {
      if (!res.ok || res.routineId == null) {
        setError(res.error ?? "Could not create the routine.");
        return;
      }
      setNewRoutineName("");
      refreshAll();
      setScreen({ kind: "editRoutine", routineId: res.routineId });
    },
  });
  const duplicate = useMutation({
    mutationFn: async (routineId: number) =>
      await api.duplicateRoutine({ token, routineId }),
    onSuccess: (res) => {
      if (!res.ok) setError(res.error ?? "Could not duplicate.");
      else refreshAll();
    },
  });
  const del = useMutation({
    mutationFn: async (routineId: number) =>
      await api.deleteRoutine({ token, routineId }),
    onSuccess: (res) => {
      if (!res.ok) setError(res.error ?? "Could not delete routine.");
      else {
        setConfirmDeleteId(null);
        refreshAll();
      }
    },
  });
  const discardActive = useMutation({
    mutationFn: async (sessionId: number) =>
      await api.discardSession({ token, sessionId }),
    onSuccess: () => refreshAll(),
  });

  if (screen.kind === "live") {
    return (
      <LiveSession
        token={token}
        profile={profile}
        sessionId={screen.sessionId}
        onFinished={(id) => {
          refreshAll();
          setTab("history");
          setScreen({ kind: "detail", sessionId: id });
        }}
        onExit={() => {
          refreshAll();
          setScreen({ kind: "home" });
        }}
      />
    );
  }
  if (screen.kind === "editRoutine") {
    return (
      <RoutineEditor
        key={screen.routineId}
        token={token}
        routineId={screen.routineId}
        onBack={() => {
          refreshAll();
          setScreen({ kind: "home" });
        }}
        onStart={(routineId) => start.mutate(routineId)}
      />
    );
  }
  if (screen.kind === "detail") {
    return (
      <SessionDetail
        token={token}
        profile={profile}
        sessionId={screen.sessionId}
        onBack={() => setScreen({ kind: "home" })}
        onProgress={(exerciseId) =>
          setScreen({ kind: "progress", exerciseId })
        }
      />
    );
  }
  if (screen.kind === "progress") {
    return (
      <ExerciseProgress
        token={token}
        profile={profile}
        exerciseId={screen.exerciseId}
        onBack={() => setScreen({ kind: "home" })}
      />
    );
  }

  const activeSession = active.data?.session ?? null;
  const templateGroups: { group: string; items: NonNullable<typeof templates.data>["templates"] }[] = [];
  for (const t of templates.data?.templates ?? []) {
    const g = templateGroups.find((x) => x.group === t.group);
    if (g) g.items.push(t);
    else templateGroups.push({ group: t.group, items: [t] });
  }

  const tabBtn = (key: typeof tab, label: string) => (
    <button
      key={key}
      type="button"
      onClick={() => setTab(key)}
      aria-pressed={tab === key}
      className={`border-b-2 px-1 pb-2 text-sm transition-colors ${
        tab === key
          ? "border-[var(--accent)] font-bold text-[var(--text)]"
          : "border-transparent font-medium text-[var(--faint)] hover:text-[var(--dim)]"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="pt-6 sm:pt-10">
      <p className="kicker text-[var(--accent-text)]">Train hard</p>
      <h2 className="font-display mt-1.5 text-4xl leading-none sm:text-5xl">
        Workouts
      </h2>

      <div className="mt-6 flex gap-5 border-b border-[var(--border)]" role="group" aria-label="Workout sections">
        {tabBtn("train", "Train")}
        {tabBtn("library", "Exercises")}
        {tabBtn("history", "History")}
        {tabBtn("records", "Records")}
      </div>

      <div className="mt-5">
        <ErrorBox message={error} />
      </div>

      {tab === "library" ? (
        <ExerciseBrowser token={token} />
      ) : tab === "history" ? (
        history.isPending ? (
          <ListSkeleton rows={5} />
        ) : history.data && history.data.sessions.length > 0 ? (
          <>
          <ul className="divide-y divide-[var(--border)]">
            {history.data.sessions.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  className="flex w-full items-baseline justify-between gap-3 py-3.5 text-left"
                  onClick={() => setScreen({ kind: "detail", sessionId: s.id })}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[15px] font-bold">
                      {s.title}
                    </span>
                    <span className="mt-0.5 block text-xs text-[var(--faint)]">
                      {prettyDate(s.startedOn)} · {fmtDuration(s.durationSeconds)} ·{" "}
                      {s.exerciseCount} exercises · {s.completedSets} sets
                    </span>
                  </span>
                  <span className="shrink-0 text-sm font-semibold">
                    {fmtVolume(s.totalVolumeKg, profile.units)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {history.data.sessions.length < history.data.total ? (
            <button
              type="button"
              className={`${btnGhost} mt-4 w-full`}
              onClick={() => setHistoryLimit((l) => l + 30)}
              disabled={history.isFetching}
            >
              {history.isFetching
                ? "Loading…"
                : `Load more (${history.data.total - history.data.sessions.length} more)`}
            </button>
          ) : null}
          </>
        ) : (
          <EmptyNote>
            Nothing here yet. Finish your first workout and it lands here with
            every set you logged.
          </EmptyNote>
        )
      ) : tab === "records" ? (
        records.isPending ? (
          <ListSkeleton rows={4} />
        ) : records.data && records.data.records.length > 0 ? (
          <>
            <ul className="divide-y divide-[var(--border)]">
              {records.data.records.map((r) => (
                <li key={r.exerciseId}>
                  <button
                    type="button"
                    className="flex w-full items-baseline justify-between gap-3 py-3.5 text-left"
                    onClick={() =>
                      setScreen({ kind: "progress", exerciseId: r.exerciseId })
                    }
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[15px] font-bold">
                        {r.exerciseName}
                      </span>
                      <span className="mt-0.5 block text-xs text-[var(--faint)]">
                        {r.lastTrainedOn
                          ? `Last trained ${prettyDate(r.lastTrainedOn)}`
                          : ""}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-sm font-bold">
                        {r.heaviestLoadKg != null
                          ? `${fmtLoad(r.heaviestLoadKg, profile.units)}${r.heaviestReps != null ? ` × ${r.heaviestReps}` : ""}`
                          : r.longestSeconds != null
                            ? fmtClock(r.longestSeconds)
                            : r.bestReps != null
                              ? `${r.bestReps} reps`
                              : "—"}
                      </span>
                      {r.estimatedOneRmKg != null ? (
                        <span className="block text-xs text-[var(--faint)]">
                          Est. 1RM {fmtLoad(r.estimatedOneRmKg, profile.units)}
                        </span>
                      ) : null}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-[var(--faint)]">
              Records come only from sets you marked done in finished
              workouts. Estimated 1RM uses the Epley formula: load × (1 +
              reps ÷ 30) — an estimate, not a tested max.
            </p>
          </>
        ) : (
          <EmptyNote>
            No records yet. They appear automatically from the sets you
            complete — nothing is estimated or invented.
          </EmptyNote>
        )
      ) : (
        <>
          {activeSession ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[8px] bg-[var(--accent-soft)] px-4 py-3">
              <p className="text-sm">
                <span className="font-bold">{activeSession.title}</span>
                <span className="text-[var(--dim)]">
                  {" "}
                  — in progress, {activeSession.completedSets} sets done.
                </span>
              </p>
              <span className="flex gap-2">
                <button
                  type="button"
                  className={btnPrimary}
                  onClick={() =>
                    setScreen({ kind: "live", sessionId: activeSession.id })
                  }
                >
                  Resume
                </button>
                <button
                  type="button"
                  className={btnGhost}
                  onClick={() => discardActive.mutate(activeSession.id)}
                >
                  Discard
                </button>
              </span>
            </div>
          ) : (
            <button
              type="button"
              className={`${btnInk} w-full !py-4 text-base`}
              onClick={() => start.mutate(null)}
              disabled={start.isPending}
            >
              {I.play} Start blank workout
            </button>
          )}

          <section className="mt-8">
            <h3 className="kicker text-[var(--dim)]">My routines</h3>
            {routines.isPending ? (
              <p className="mt-3 text-sm text-[var(--dim)]">Loading…</p>
            ) : routines.data && routines.data.routines.length > 0 ? (
              <ul className="mt-2 divide-y divide-[var(--border)]">
                {routines.data.routines.map((r) => (
                  <li key={r.id} className="py-3.5">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <button
                        type="button"
                        className="min-w-0 flex-1 text-left"
                        onClick={() =>
                          setScreen({ kind: "editRoutine", routineId: r.id })
                        }
                      >
                        <span className="block text-lg font-bold leading-snug">
                          {r.name}
                        </span>
                        <span className="mt-0.5 block text-xs text-[var(--faint)]">
                          {r.exerciseCount}{" "}
                          {r.exerciseCount === 1 ? "exercise" : "exercises"}
                          {r.notes ? ` · ${r.notes}` : ""}
                        </span>
                      </button>
                      <div className="flex shrink-0 flex-wrap gap-1.5">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1.5 rounded-[6px] bg-[var(--accent-btn)] px-3 py-2 text-xs font-bold text-white"
                          onClick={() => start.mutate(r.id)}
                          aria-label={`Start ${r.name}`}
                        >
                          {I.play} Start
                        </button>
                        <button
                          type="button"
                          className="rounded-[6px] border border-[var(--border-strong)] p-2 text-[var(--dim)]"
                          onClick={() => duplicate.mutate(r.id)}
                          aria-label={`Duplicate ${r.name}`}
                        >
                          {I.copy}
                        </button>
                        {confirmDeleteId === r.id ? (
                          <button
                            type="button"
                            className="rounded-[6px] bg-[var(--accent-btn)] px-3 py-2 text-xs font-bold text-white"
                            onClick={() => del.mutate(r.id)}
                          >
                            Delete?
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="rounded-[6px] border border-[var(--border-strong)] p-2 text-[var(--accent-text)]"
                            onClick={() => setConfirmDeleteId(r.id)}
                            aria-label={`Delete ${r.name}`}
                          >
                            {I.trash}
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-[var(--dim)]">
                No routines yet. Copy a template below or build your own.
              </p>
            )}
            <form
              className="mt-4 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (newRoutineName.trim()) create.mutate();
              }}
            >
              <label className="min-w-0 flex-1">
                <span className="sr-only">New routine name</span>
                <input
                  className={inputCls}
                  placeholder="New routine name — e.g. My Push Day"
                  value={newRoutineName}
                  onChange={(e) => setNewRoutineName(e.target.value)}
                  maxLength={80}
                />
              </label>
              <button
                type="submit"
                className={btnGhost}
                disabled={!newRoutineName.trim() || create.isPending}
              >
                {I.plus} Create
              </button>
            </form>
          </section>

          <section className="mt-10">
            <h3 className="kicker text-[var(--dim)]">Templates</h3>
            <p className="mt-1.5 text-sm text-[var(--dim)]">
              Copy one into your routines, then make it yours.
            </p>
            {templateGroups.map((g) => (
              <div key={g.group} className="mt-5">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--faint)]">
                  {g.group}
                </p>
                <ul className="mt-1 divide-y divide-[var(--border)]">
                  {g.items.map((t) => (
                    <li
                      key={t.key}
                      className="flex flex-wrap items-center justify-between gap-2 py-3"
                    >
                      <div className="min-w-0">
                        <p className="text-[15px] font-bold">{t.name}</p>
                        <p className="mt-0.5 text-xs text-[var(--faint)]">
                          {t.focus} · {t.exercises.length} exercises
                        </p>
                      </div>
                      <button
                        type="button"
                        className="shrink-0 rounded-[6px] border border-[var(--ink)] px-3.5 py-2 text-xs font-bold transition-colors hover:bg-[var(--ink)] hover:text-[var(--bg)]"
                        onClick={() => copy.mutate(t.key)}
                        disabled={copy.isPending}
                        aria-label={`Copy the ${t.name} template into my routines`}
                      >
                        Copy to my routines
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        </>
      )}
    </div>
  );
}

// --------------------------------------------------- Phase 4: progress,
// water, recipes & challenges.

function newClientKey(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function shortDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

/* Measurements are stored in cm; imperial users see and enter inches. */
function fmtCm(cm: number | null, units: string): string {
  if (cm == null) return "—";
  if (units === "imperial") return `${(cm / 2.54).toFixed(1)} in`;
  return `${Math.round(cm * 10) / 10} cm`;
}
function cmFromDisplay(v: number, units: string): number {
  return units === "imperial" ? v * 2.54 : v;
}
function cmToDisplay(cm: number, units: string): number {
  return units === "imperial" ? Math.round((cm / 2.54) * 10) / 10 : cm;
}

/* Line chart drawn only from real measured points — the line joins
   actual records; days without a record simply have no point. Axes are
   labelled with values and the unit. */
function LineChart({
  points,
  unit,
  color = "var(--accent)",
  ariaLabel,
}: {
  points: { date: string; value: number }[];
  unit: string;
  color?: string;
  ariaLabel: string;
}) {
  const W = 600;
  const H = 170;
  const PL = 46;
  const PR = 10;
  const PT = 12;
  const PB = 22;
  const values = points.map((p) => p.value);
  let min = Math.min(...values);
  let max = Math.max(...values);
  if (min === max) {
    min -= 1;
    max += 1;
  }
  const pad = (max - min) * 0.15;
  min -= pad;
  max += pad;
  const iw = W - PL - PR;
  const ih = H - PT - PB;
  const x = (i: number) =>
    points.length === 1 ? PL + iw / 2 : PL + (i / (points.length - 1)) * iw;
  const y = (v: number) => PT + (1 - (v - min) / (max - min)) * ih;
  const line = points.map((p, i) => `${x(i)},${y(p.value)}`).join(" ");
  const gridVals = [max - pad, (min + max) / 2, min + pad];
  const first = points[0];
  const mid = points[Math.floor(points.length / 2)];
  const last = points[points.length - 1];
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      role="img"
      aria-label={ariaLabel}
    >
      {gridVals.map((v, i) => (
        <g key={i}>
          <line
            x1={PL}
            x2={W - PR}
            y1={y(v)}
            y2={y(v)}
            stroke="var(--border)"
            strokeWidth="1"
            strokeDasharray={i === 1 ? "" : "3 3"}
          />
          <text x={PL - 6} y={y(v) + 4} textAnchor="end" fontSize="11" fill="var(--faint)">
            {Math.round(v * 10) / 10}
          </text>
        </g>
      ))}
      <text x={PL - 6} y={PT + 2} textAnchor="end" fontSize="10" fill="var(--faint)">
        {unit}
      </text>
      {points.length > 1 ? (
        <polyline
          points={line}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ) : null}
      {points.map((p, i) => (
        <circle key={p.date} cx={x(i)} cy={y(p.value)} r="3.5" fill={color} />
      ))}
      {first ? (
        <text x={PL} y={H - 6} fontSize="11" fill="var(--faint)">
          {shortDate(first.date)}
        </text>
      ) : null}
      {mid && points.length > 2 ? (
        <text x={x(Math.floor(points.length / 2))} y={H - 6} textAnchor="middle" fontSize="11" fill="var(--faint)">
          {shortDate(mid.date)}
        </text>
      ) : null}
      {last && points.length > 1 ? (
        <text x={W - PR} y={H - 6} textAnchor="end" fontSize="11" fill="var(--faint)">
          {shortDate(last.date)}
        </text>
      ) : null}
    </svg>
  );
}

/* Bar chart for per-day values. Days with `filled: false` draw only a
   baseline tick — an honest gap, never an invented bar. An optional
   target draws as a dashed rule with its value labelled. */
function BarChart({
  bars,
  target,
  unit,
  color = "var(--accent)",
  ariaLabel,
}: {
  bars: { date: string; value: number; filled: boolean }[];
  target?: number | null;
  unit: string;
  color?: string;
  ariaLabel: string;
}) {
  const W = 600;
  const H = 170;
  const PL = 46;
  const PR = 10;
  const PT = 14;
  const PB = 22;
  const maxVal = Math.max(1, ...bars.map((b) => b.value), target ?? 0);
  const iw = W - PL - PR;
  const ih = H - PT - PB;
  const slot = iw / Math.max(1, bars.length);
  const bw = Math.max(1.5, slot * 0.68);
  const y = (v: number) => PT + (1 - v / maxVal) * ih;
  const first = bars[0];
  const mid = bars[Math.floor(bars.length / 2)];
  const last = bars[bars.length - 1];
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      role="img"
      aria-label={ariaLabel}
    >
      <line x1={PL} x2={W - PR} y1={y(0)} y2={y(0)} stroke="var(--border-strong)" strokeWidth="1" />
      <text x={PL - 6} y={y(maxVal) + 4} textAnchor="end" fontSize="11" fill="var(--faint)">
        {Math.round(maxVal).toLocaleString("en-IN")}
      </text>
      <text x={PL - 6} y={PT - 4} textAnchor="end" fontSize="10" fill="var(--faint)">
        {unit}
      </text>
      {bars.map((b, i) => {
        const bx = PL + i * slot + (slot - bw) / 2;
        return b.filled ? (
          <rect
            key={b.date}
            x={bx}
            y={y(b.value)}
            width={bw}
            height={Math.max(1.5, y(0) - y(b.value))}
            fill={color}
            rx="1"
          >
            <title>{`${shortDate(b.date)}: ${b.value.toLocaleString("en-IN")} ${unit}`}</title>
          </rect>
        ) : (
          <rect
            key={b.date}
            x={bx}
            y={y(0) - 2}
            width={bw}
            height="2"
            fill="var(--surface-3)"
          >
            <title>{`${shortDate(b.date)}: nothing logged`}</title>
          </rect>
        );
      })}
      {target != null && target > 0 ? (
        <g>
          <line
            x1={PL}
            x2={W - PR}
            y1={y(target)}
            y2={y(target)}
            stroke="var(--ink)"
            strokeWidth="1.2"
            strokeDasharray="5 4"
          />
          <text x={W - PR} y={y(target) - 4} textAnchor="end" fontSize="11" fontWeight="700" fill="var(--ink)">
            Target {Math.round(target).toLocaleString("en-IN")}
          </text>
        </g>
      ) : null}
      {first ? (
        <text x={PL} y={H - 6} fontSize="11" fill="var(--faint)">
          {shortDate(first.date)}
        </text>
      ) : null}
      {mid && bars.length > 2 ? (
        <text x={PL + Math.floor(bars.length / 2) * slot + slot / 2} y={H - 6} textAnchor="middle" fontSize="11" fill="var(--faint)">
          {shortDate(mid.date)}
        </text>
      ) : null}
      {last && bars.length > 1 ? (
        <text x={W - PR} y={H - 6} textAnchor="end" fontSize="11" fill="var(--faint)">
          {shortDate(last.date)}
        </text>
      ) : null}
    </svg>
  );
}

// ------------------------------------------------------------- water card

function WaterEntryRow({
  token,
  entry,
  onChanged,
}: {
  token: string;
  entry: { id: number; amountMl: number };
  onChanged: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [amount, setAmount] = useState(String(entry.amountMl));
  const [error, setError] = useState<string | null>(null);
  const save = useMutation({
    mutationFn: async () => {
      const v = num(amount);
      if (v == null || v < 10 || v > 3000) throw new Error("local");
      return await api.updateWaterEntry({
        token,
        entryId: entry.id,
        amountMl: Math.round(v),
      });
    },
    onSuccess: (res) => {
      if (!res.ok) {
        setError(res.error ?? "Could not update.");
        return;
      }
      setEditing(false);
      onChanged();
    },
    onError: (e) =>
      setError(
        e instanceof Error && e.message === "local"
          ? "Enter 10–3,000 ml."
          : "Could not reach the server.",
      ),
  });
  const del = useMutation({
    mutationFn: async () => await api.deleteWaterEntry({ token, entryId: entry.id }),
    onSuccess: (res) => {
      if (!res.ok) setError(res.error ?? "Could not delete.");
      else onChanged();
    },
    onError: () => setError("Could not reach the server."),
  });
  return (
    <li className="flex items-center justify-between gap-2 py-2 text-sm">
      {editing ? (
        <span className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            min={10}
            max={3000}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            aria-label="Water amount in millilitres"
            className="w-24 rounded-[6px] border border-[var(--border-strong)] bg-[var(--input)] px-2.5 py-1.5 text-sm"
          />
          <span className="text-[var(--dim)]">ml</span>
          <button
            type="button"
            className="rounded-[6px] bg-[var(--ink)] px-3 py-1.5 text-xs font-bold text-[var(--bg)] disabled:opacity-50"
            onClick={() => save.mutate()}
            disabled={save.isPending}
          >
            Save
          </button>
          <button
            type="button"
            className="px-1.5 py-1.5 text-xs font-semibold text-[var(--dim)]"
            onClick={() => setEditing(false)}
          >
            Cancel
          </button>
        </span>
      ) : (
        <>
          <span className="tnum font-semibold">{entry.amountMl} ml</span>
          <span className="flex items-center gap-1">
            <button
              type="button"
              className="rounded-[4px] p-1.5 text-[var(--faint)] transition-colors hover:text-[var(--text)]"
              aria-label={`Edit water entry of ${entry.amountMl} millilitres`}
              onClick={() => {
                setAmount(String(entry.amountMl));
                setEditing(true);
              }}
            >
              {I.edit}
            </button>
            <button
              type="button"
              className="rounded-[4px] p-1.5 text-[var(--faint)] transition-colors hover:text-[var(--accent-text)]"
              aria-label={`Delete water entry of ${entry.amountMl} millilitres`}
              onClick={() => del.mutate()}
              disabled={del.isPending}
            >
              {I.trash}
            </button>
          </span>
        </>
      )}
      {error ? (
        <span role="alert" className="text-xs text-[var(--accent-text)]">
          {error}
        </span>
      ) : null}
    </li>
  );
}

/* Water for today: total vs the user's own target (2,500 ml is only a
   suggestion until they set one), quick adds, custom amount, editable
   entries and the last 7 days. Used on the dashboard. */
function WaterCard({ token }: { token: string }) {
  const queryClient = useQueryClient();
  const today = todayLocal();
  const q = useQuery({
    queryKey: ["waterDay", token, today],
    queryFn: () => api.getWaterDay({ token, date: today }),
  });
  const [custom, setCustom] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [targetEditing, setTargetEditing] = useState(false);
  const [targetInput, setTargetInput] = useState("");

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["waterDay"] });
    void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    void queryClient.invalidateQueries({ queryKey: ["progress"] });
  };

  const add = useMutation({
    mutationFn: async (amountMl: number) =>
      await api.addWater({ token, date: today, amountMl, clientKey: newClientKey() }),
    onSuccess: (res) => {
      if (!res.ok) {
        setError(res.error ?? "Could not add water.");
        return;
      }
      setError(null);
      setCustom("");
      refresh();
    },
    onError: () => setError("Could not reach the server."),
  });

  const saveTarget = useMutation({
    mutationFn: async () => {
      const v = num(targetInput);
      if (v == null || v < 500 || v > 6000) throw new Error("local");
      return await api.setWaterTarget({ token, targetMl: Math.round(v) });
    },
    onSuccess: (res) => {
      if (!res.ok) {
        setError(res.error ?? "Could not save target.");
        return;
      }
      setTargetEditing(false);
      refresh();
    },
    onError: (e) =>
      setError(
        e instanceof Error && e.message === "local"
          ? "Target must be 500–6,000 ml."
          : "Could not reach the server.",
      ),
  });

  const data = q.data;
  const pct =
    data && data.targetMl > 0
      ? Math.min(100, Math.round((data.totalMl / data.targetMl) * 100))
      : 0;
  const weekMax = data ? Math.max(1, ...data.week.map((d) => d.totalMl)) : 1;

  return (
    <Panel label="Water today">
      {q.isPending ? (
        <p className="text-sm text-[var(--dim)]">Loading…</p>
      ) : q.isError || !data?.ok ? (
        <ErrorBox message="Could not load your water log." />
      ) : (
        <>
          <p className="flex items-baseline gap-2">
            <span className="font-display text-4xl leading-none">
              {data.totalMl.toLocaleString("en-IN")}
            </span>
            <span className="text-sm text-[var(--dim)]">
              of {data.targetMl.toLocaleString("en-IN")} ml
            </span>
          </p>
          <div
            className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-[var(--surface-3)]"
            role="progressbar"
            aria-valuenow={data.totalMl}
            aria-valuemin={0}
            aria-valuemax={data.targetMl}
            aria-label="Today's water against your target"
          >
            <div
              className="h-full rounded-full bg-[var(--amber)] transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className={btnGhost}
              onClick={() => add.mutate(250)}
              disabled={add.isPending}
            >
              {I.plus} 250 ml
            </button>
            <button
              type="button"
              className={btnGhost}
              onClick={() => add.mutate(500)}
              disabled={add.isPending}
            >
              {I.plus} 500 ml
            </button>
            <span className="flex gap-2">
              <input
                type="number"
                inputMode="numeric"
                min={10}
                max={3000}
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                placeholder="Custom ml"
                aria-label="Custom water amount in millilitres"
                className="w-28 rounded-[6px] border border-[var(--border-strong)] bg-[var(--input)] px-3 py-2.5 text-sm"
              />
              <button
                type="button"
                className={btnInk}
                disabled={add.isPending || custom.trim() === ""}
                onClick={() => {
                  const v = num(custom);
                  if (v == null || v < 10 || v > 3000) {
                    setError("Enter 10–3,000 ml.");
                    return;
                  }
                  add.mutate(Math.round(v));
                }}
              >
                Add
              </button>
            </span>
          </div>
          <ErrorBox message={error} />

          {data.entries.length > 0 ? (
            <ul className="mt-2 divide-y divide-[var(--border)] border-t border-[var(--border)]">
              {data.entries.map((e) => (
                <WaterEntryRow
                  key={e.id}
                  token={token}
                  entry={e}
                  onChanged={refresh}
                />
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-[var(--dim)]">
              Nothing logged yet today.
            </p>
          )}

          {data.week.length > 0 ? (
            <div className="mt-4 border-t border-[var(--border)] pt-3">
              <p className="kicker text-[var(--faint)]">Last 7 days</p>
              <div className="mt-2.5 flex items-end gap-2" aria-hidden="true">
                {data.week.map((d) => (
                  <div key={d.date} className="flex flex-1 flex-col items-center gap-1.5">
                    <div className="flex h-14 w-full items-end rounded-[3px] bg-[var(--surface-2)]">
                      <div
                        className="w-full rounded-[3px] bg-[var(--amber)]"
                        style={{
                          height: `${Math.max(d.totalMl > 0 ? 8 : 0, (d.totalMl / weekMax) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-[var(--faint)]">
                      {new Date(`${d.date}T00:00:00`).toLocaleDateString("en-IN", { weekday: "narrow" })}
                    </span>
                  </div>
                ))}
              </div>
              <p className="sr-only">
                {data.week
                  .map((d) => `${shortDate(d.date)}: ${d.totalMl} ml`)
                  .join(", ")}
              </p>
            </div>
          ) : null}

          <div className="mt-4 border-t border-[var(--border)] pt-3 text-sm">
            {targetEditing ? (
              <span className="flex flex-wrap items-center gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  min={500}
                  max={6000}
                  step={50}
                  value={targetInput}
                  onChange={(e) => setTargetInput(e.target.value)}
                  aria-label="Daily water target in millilitres"
                  className="w-28 rounded-[6px] border border-[var(--border-strong)] bg-[var(--input)] px-3 py-2 text-sm"
                />
                <span className="text-[var(--dim)]">ml / day</span>
                <button
                  type="button"
                  className="rounded-[6px] bg-[var(--ink)] px-3 py-2 text-xs font-bold text-[var(--bg)] disabled:opacity-50"
                  onClick={() => saveTarget.mutate()}
                  disabled={saveTarget.isPending}
                >
                  Save target
                </button>
                <button
                  type="button"
                  className="px-1 py-2 text-xs font-semibold text-[var(--dim)]"
                  onClick={() => setTargetEditing(false)}
                >
                  Cancel
                </button>
              </span>
            ) : (
              <p className="text-[var(--dim)]">
                {data.targetIsCustom ? (
                  <>Your target: {data.targetMl.toLocaleString("en-IN")} ml. </>
                ) : (
                  <>Suggested target: 2,500 ml — no single amount suits everyone. </>
                )}
                <button
                  type="button"
                  className="font-semibold text-[var(--text)] underline decoration-[var(--accent)] decoration-2 underline-offset-4"
                  onClick={() => {
                    setTargetInput(String(data.targetMl));
                    setTargetEditing(true);
                  }}
                >
                  {data.targetIsCustom ? "Change it" : "Set your own"}
                </button>
              </p>
            )}
          </div>
        </>
      )}
    </Panel>
  );
}

// ---------------------------------------------------------------- progress

const RANGE_OPTIONS: { days: number; label: string }[] = [
  { days: 7, label: "7D" },
  { days: 30, label: "30D" },
  { days: 90, label: "90D" },
  { days: 180, label: "6M" },
  { days: 365, label: "1Y" },
];

const MEASURE_FIELDS = [
  { key: "waistCm", label: "Waist" },
  { key: "chestCm", label: "Chest" },
  { key: "armCm", label: "Arm" },
  { key: "thighCm", label: "Thigh" },
  { key: "hipCm", label: "Hip" },
  { key: "neckCm", label: "Neck" },
] as const;

type MeasureKey = (typeof MEASURE_FIELDS)[number]["key"];

function MeasurementForm({
  token,
  profile,
  latest,
}: {
  token: string;
  profile: Profile;
  latest: MeasurementRow | null;
}) {
  const queryClient = useQueryClient();
  const imperial = profile.units === "imperial";
  const unitLabel = imperial ? "in" : "cm";
  const [date, setDate] = useState(todayLocal());
  const [values, setValues] = useState<Record<MeasureKey, string>>({
    waistCm: "",
    chestCm: "",
    armCm: "",
    thighCm: "",
    hipCm: "",
    neckCm: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const save = useMutation({
    mutationFn: async () => {
      const payload: Record<string, number | null> = {};
      let any = false;
      for (const f of MEASURE_FIELDS) {
        const v = num(values[f.key]);
        if (v != null) {
          if (v <= 0) throw new Error("local");
          payload[f.key] = Math.round(cmFromDisplay(v, profile.units) * 10) / 10;
          any = true;
        }
      }
      if (!any) throw new Error("empty");
      return await api.logMeasurement({ token, loggedOn: date, ...payload });
    },
    onSuccess: (res) => {
      if (!res.ok) {
        setError(res.error ?? "Could not save measurements.");
        return;
      }
      setError(null);
      setSaved(true);
      void queryClient.invalidateQueries({ queryKey: ["progress"] });
    },
    onError: (e) =>
      setError(
        e instanceof Error && e.message === "empty"
          ? "Enter at least one measurement."
          : e instanceof Error && e.message === "local"
            ? "Measurements must be above zero."
            : "Could not reach the server.",
      ),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSaved(false);
        save.mutate();
      }}
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {MEASURE_FIELDS.map((f) => (
          <Field
            key={f.key}
            label={`${f.label} (${unitLabel})`}
            hint={
              latest?.[f.key] != null
                ? `Last: ${fmtCm(latest[f.key], profile.units)}`
                : undefined
            }
          >
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              min={0}
              value={values[f.key]}
              onChange={(e) =>
                setValues((v) => ({ ...v, [f.key]: e.target.value }))
              }
              placeholder={
                latest?.[f.key] != null
                  ? String(cmToDisplay(latest[f.key] as number, profile.units))
                  : ""
              }
              aria-label={`${f.label} measurement in ${unitLabel}`}
              className={inputCls}
            />
          </Field>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <Field label="Date">
          <input
            type="date"
            value={date}
            max={todayLocal()}
            onChange={(e) => setDate(e.target.value)}
            aria-label="Measurement date"
            className={inputCls}
          />
        </Field>
        <button type="submit" className={btnPrimary} disabled={save.isPending}>
          {I.check} Save measurements
        </button>
        {saved ? (
          <span className="pb-2.5 text-sm font-medium text-[var(--ok)]">
            Saved.
          </span>
        ) : null}
      </div>
      <div className="mt-2">
        <ErrorBox message={error} />
      </div>
    </form>
  );
}

function Progress({ token, profile }: { token: string; profile: Profile }) {
  const queryClient = useQueryClient();
  const [days, setDays] = useState(30);
  const q = useQuery({
    queryKey: ["progress", token, days],
    queryFn: () => api.getProgress({ token, today: todayLocal(), days }),
  });
  const data = q.data;
  const imperial = profile.units === "imperial";

  const delMeasurement = useMutation({
    mutationFn: async (id: number) => await api.deleteMeasurement({ token, id }),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: ["progress"] }),
  });

  const weightPoints =
    data?.weights.map((w) => ({
      date: w.loggedOn,
      value: imperial ? Math.round(kgToLb(w.weightKg) * 10) / 10 : w.weightKg,
    })) ?? [];
  const firstWeight = data?.weights[0];
  const lastWeight = data?.weights[data.weights.length - 1];
  const weightChange =
    firstWeight && lastWeight && data && data.weights.length > 1
      ? lastWeight.weightKg - firstWeight.weightKg
      : null;
  const latestMeasurement =
    data && data.measurements.length > 0
      ? data.measurements[data.measurements.length - 1]
      : null;

  return (
    <div>
      <h2 className="font-display text-4xl leading-none sm:text-5xl">Progress</h2>
      <div
        className="mt-5 flex flex-wrap gap-2"
        role="group"
        aria-label="Time range"
      >
        {RANGE_OPTIONS.map((o) => (
          <button
            key={o.days}
            type="button"
            aria-pressed={days === o.days}
            onClick={() => setDays(o.days)}
            className={`rounded-full border px-4 py-2 text-sm font-bold transition-colors ${
              days === o.days
                ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)]"
                : "border-[var(--border-strong)] text-[var(--dim)] hover:border-[var(--faint)]"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {q.isPending ? (
        <div className="mt-8">
          <ListSkeleton rows={5} />
        </div>
      ) : q.isError || !data?.ok ? (
        <div className="mt-8">
          <ErrorBox message="Could not load your progress. Try again." />
        </div>
      ) : (
        <div className="mt-2">
          <Section title="Weight">
            {data.weights.length === 0 ? (
              <EmptyNote>
                No weight logged in this range. Log weight on your dashboard
                and the trend will draw itself from your real entries.
              </EmptyNote>
            ) : data.weights.length === 1 ? (
              <p className="text-sm text-[var(--dim)]">
                One entry:{" "}
                <span className="font-bold text-[var(--text)]">
                  {fmtWeight(firstWeight?.weightKg ?? null, profile.units)}
                </span>{" "}
                on {prettyDate(firstWeight?.loggedOn ?? "")}. Log another to
                see the trend line.
              </p>
            ) : (
              <>
                <p className="mb-3 text-sm text-[var(--dim)]">
                  Latest{" "}
                  <span className="font-bold text-[var(--text)]">
                    {fmtWeight(lastWeight?.weightKg ?? null, profile.units)}
                  </span>
                  {weightChange != null ? (
                    <>
                      {" · "}
                      {weightChange > 0 ? "+" : ""}
                      {imperial
                        ? `${(Math.round(kgToLb(weightChange) * 10) / 10).toFixed(1)} lb`
                        : `${weightChange.toFixed(1)} kg`}{" "}
                      across this range
                    </>
                  ) : null}
                </p>
                <LineChart
                  points={weightPoints}
                  unit={imperial ? "lb" : "kg"}
                  ariaLabel={`Body weight trend over the last ${days} days, from ${data.weights.length} logged entries`}
                />
              </>
            )}
          </Section>

          <Section title="Calories">
            {data.macroAverages.daysLogged === 0 ? (
              <EmptyNote>
                No food logged in this range. Days without entries stay blank
                in the chart — nothing is filled in for you.
              </EmptyNote>
            ) : (
              <>
                <p className="mb-3 text-sm text-[var(--dim)]">
                  Logged {data.macroAverages.daysLogged} of {data.rangeDays}{" "}
                  days · average{" "}
                  <span className="font-bold text-[var(--text)]">
                    {Math.round(data.macroAverages.kcal).toLocaleString("en-IN")} kcal
                  </span>{" "}
                  on logged days
                </p>
                <BarChart
                  bars={data.calorieDays.map((d) => ({
                    date: d.date,
                    value: d.kcal,
                    filled: d.logged,
                  }))}
                  target={data.calorieTarget}
                  unit="kcal"
                  ariaLabel={`Daily calories over the last ${days} days`}
                />
                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  {(
                    [
                      ["Protein", data.macroAverages.protein, "var(--accent)"],
                      ["Carbs", data.macroAverages.carbs, "var(--amber)"],
                      ["Fat", data.macroAverages.fat, "var(--rose)"],
                    ] as const
                  ).map(([label, v, color]) => (
                    <div key={label} className="border-t-2 pt-2" style={{ borderColor: color }}>
                      <p className="font-display text-2xl leading-none">
                        {Math.round(v)}
                        <span className="text-sm"> g</span>
                      </p>
                      <p className="mt-1 text-xs text-[var(--dim)]">
                        {label} / logged day
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Section>

          <Section title="Training">
            {data.totalWorkouts === 0 ? (
              <EmptyNote>
                No finished workouts in this range. Finish a session and it
                counts here.
              </EmptyNote>
            ) : (
              <>
                <p className="mb-3 text-sm text-[var(--dim)]">
                  <span className="font-bold text-[var(--text)]">
                    {data.totalWorkouts}
                  </span>{" "}
                  workouts · about {data.workoutsPerWeek} per week
                </p>
                <BarChart
                  bars={data.workoutDays.map((d) => ({
                    date: d.date,
                    value: d.sessions,
                    filled: d.sessions > 0,
                  }))}
                  unit="sessions"
                  color="var(--rose)"
                  ariaLabel={`Workouts per day over the last ${days} days`}
                />
              </>
            )}
            {data.records.length > 0 ? (
              <div className="mt-5">
                <p className="kicker text-[var(--faint)]">Personal records</p>
                <ul className="mt-2 divide-y divide-[var(--border)]">
                  {data.records.map((pr) => (
                    <li
                      key={pr.exerciseId}
                      className="flex items-baseline justify-between gap-3 py-2.5 text-sm"
                    >
                      <span className="text-[var(--dim)]">{pr.exerciseName}</span>
                      <span className="text-right font-semibold">
                        {pr.heaviestLoadKg != null
                          ? `${fmtLoad(pr.heaviestLoadKg, profile.units)}${pr.heaviestReps != null ? ` × ${pr.heaviestReps}` : ""}`
                          : pr.longestSeconds != null
                            ? fmtClock(pr.longestSeconds)
                            : pr.bestReps != null
                              ? `${pr.bestReps} reps`
                              : "—"}
                        {pr.estimatedOneRmKg != null ? (
                          <span className="block text-xs font-medium text-[var(--faint)]">
                            Est. 1RM {fmtLoad(pr.estimatedOneRmKg, profile.units)} (Epley)
                          </span>
                        ) : null}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </Section>

          <Section title="Hydration">
            {data.waterDays.every((d) => d.totalMl === 0) ? (
              <EmptyNote>
                No water logged in this range. Quick-add from your dashboard.
              </EmptyNote>
            ) : (
              <BarChart
                bars={data.waterDays.map((d) => ({
                  date: d.date,
                  value: d.totalMl,
                  filled: d.totalMl > 0,
                }))}
                target={data.waterTargetMl}
                unit="ml"
                color="var(--amber)"
                ariaLabel={`Daily water over the last ${days} days`}
              />
            )}
          </Section>

          <Section title="Measurements">
            {latestMeasurement ? (
              <dl className="mb-5 grid grid-cols-3 gap-3 sm:grid-cols-6">
                {MEASURE_FIELDS.map((f) => (
                  <div key={f.key}>
                    <dt className="text-xs text-[var(--faint)]">{f.label}</dt>
                    <dd className="mt-0.5 text-base font-bold">
                      {fmtCm(latestMeasurement[f.key], profile.units)}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="mb-5">
                <EmptyNote>
                  No measurements yet. All optional — log only what you want
                  to track.
                </EmptyNote>
              </p>
            )}
            <MeasurementForm
              token={token}
              profile={profile}
              latest={latestMeasurement ?? null}
            />
            {data.measurements.length > 0 ? (
              <ul className="mt-5 divide-y divide-[var(--border)] border-t border-[var(--border)]">
                {[...data.measurements].reverse().slice(0, 8).map((m) => (
                  <li
                    key={m.id}
                    className="flex items-center justify-between gap-3 py-2.5 text-sm"
                  >
                    <span className="text-[var(--dim)]">
                      {prettyDate(m.loggedOn)}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="text-right font-medium">
                        {MEASURE_FIELDS.filter((f) => m[f.key] != null)
                          .map(
                            (f) =>
                              `${f.label} ${fmtCm(m[f.key], profile.units)}`,
                          )
                          .join(" · ")}
                      </span>
                      <button
                        type="button"
                        className="rounded-[4px] p-1.5 text-[var(--faint)] transition-colors hover:text-[var(--accent-text)]"
                        aria-label={`Delete measurements from ${prettyDate(m.loggedOn)}`}
                        onClick={() => delMeasurement.mutate(m.id)}
                      >
                        {I.trash}
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </Section>

          <Section title="Challenges">
            {data.challenges.length === 0 ? (
              <EmptyNote>
                No challenges yet. Start one from the Challenges page and your
                consistency will show here.
              </EmptyNote>
            ) : (
              <ul className="divide-y divide-[var(--border)]">
                {data.challenges.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-baseline justify-between gap-3 py-3 text-sm"
                  >
                    <span>
                      <span className="font-bold">{c.name}</span>
                      <span className="block text-xs text-[var(--faint)]">
                        Day {c.dayNumber} of {c.totalDays}
                        {c.status === "paused" ? " · Paused" : ""}
                        {c.finished ? " · Finished" : ""}
                      </span>
                    </span>
                    <span className="text-right">
                      <span className="font-display text-xl">{c.percent}%</span>
                      <span className="block text-xs text-[var(--dim)]">
                        {c.streak}-day full streak
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Progress photos">
            <EmptyNote>
              Not available: FITIND has no private photo storage connected,
              so photo uploads aren't offered rather than stored somewhere
              unsafe.
            </EmptyNote>
          </Section>
        </div>
      )}
    </div>
  );
}

// --------------------------------------------------------------- recipes

const RECIPE_CATEGORIES = [
  { key: "breakfast", label: "Breakfast" },
  { key: "lunch", label: "Lunch" },
  { key: "dinner", label: "Dinner" },
  { key: "snacks", label: "Snacks" },
] as const;

const WEEKDAY_LABELS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function DietChip({ flag }: { flag: string }) {
  return (
    <span className="rounded-full border border-[var(--border-strong)] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[var(--dim)]">
      {DIET_FLAG_LABELS[flag] ?? flag}
    </span>
  );
}

function RecipeDetailView({
  token,
  recipeId,
  onBack,
  onEdit,
}: {
  token: string;
  recipeId: number;
  onBack: () => void;
  onEdit: (r: RecipeDetailData) => void;
}) {
  const queryClient = useQueryClient();
  const q = useQuery({
    queryKey: ["recipe", token, recipeId],
    queryFn: () => api.getRecipe({ token, recipeId }),
  });
  const recipe = q.data?.recipe ?? null;
  const [cookServings, setCookServings] = useState<number | null>(null);
  const [diaryMeal, setDiaryMeal] = useState<MealKey>("lunch");
  const [diaryServings, setDiaryServings] = useState("1");
  const [planWeekday, setPlanWeekday] = useState(0);
  const [planMeal, setPlanMeal] = useState<MealKey>("dinner");
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["recipe", token, recipeId] });
    void queryClient.invalidateQueries({ queryKey: ["recipes"] });
    void queryClient.invalidateQueries({ queryKey: ["mealPlan"] });
  };

  const fav = useMutation({
    mutationFn: async () => await api.toggleFavouriteRecipe({ token, recipeId }),
    onSuccess: (res) => {
      if (!res.ok) setError(res.error ?? "Could not update favourite.");
      else refresh();
    },
    onError: () => setError("Could not reach the server."),
  });

  const addToDiary = useMutation({
    mutationFn: async () => {
      const s = num(diaryServings);
      if (s == null || s <= 0) throw new Error("local");
      return await api.addRecipeToDiary({
        token,
        recipeId,
        date: todayLocal(),
        meal: diaryMeal,
        servings: s,
        clientKey: newClientKey(),
      });
    },
    onSuccess: (res) => {
      if (!res.ok) {
        setError(res.error ?? "Could not add to diary.");
        return;
      }
      setError(null);
      setMsg(`Added to today's ${MEAL_LABELS[diaryMeal].toLowerCase()}.`);
      void queryClient.invalidateQueries({ queryKey: ["diary"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      void queryClient.invalidateQueries({ queryKey: ["progress"] });
    },
    onError: (e) =>
      setError(
        e instanceof Error && e.message === "local"
          ? "Enter servings above zero."
          : "Could not reach the server.",
      ),
  });

  const addToPlan = useMutation({
    mutationFn: async () =>
      await api.addMealPlanEntry({
        token,
        weekday: planWeekday,
        meal: planMeal,
        recipeId,
        servings: 1,
      }),
    onSuccess: (res) => {
      if (!res.ok) {
        setError(res.error ?? "Could not add to plan.");
        return;
      }
      setError(null);
      setMsg(
        `Planned for ${WEEKDAY_LABELS[planWeekday]} ${MEAL_LABELS[planMeal].toLowerCase()}.`,
      );
      refresh();
    },
    onError: () => setError("Could not reach the server."),
  });

  const del = useMutation({
    mutationFn: async () => await api.deleteRecipe({ token, recipeId }),
    onSuccess: (res) => {
      if (!res.ok) setError(res.error ?? "Could not delete recipe.");
      else {
        refresh();
        onBack();
      }
    },
    onError: () => setError("Could not reach the server."),
  });

  if (q.isPending) return <p className="pt-6 text-sm text-[var(--dim)]">Loading recipe…</p>;
  if (!recipe) {
    return (
      <div className="pt-6">
        <ErrorBox message={q.data?.error ?? "Recipe not found."} />
        <button type="button" className={`${linkBtn} mt-6`} onClick={onBack}>
          {I.chevronLeft} Back to recipes
        </button>
      </div>
    );
  }

  const servingsShown = cookServings ?? recipe.servings;
  const factor = servingsShown / recipe.servings;
  const ps = recipe.perServing;

  return (
    <div>
      <button type="button" className={linkBtn} onClick={onBack}>
        {I.chevronLeft} All recipes
      </button>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <h2 className="font-display max-w-xl text-4xl leading-none sm:text-5xl">
          {recipe.name}
        </h2>
        <button
          type="button"
          className={`flex items-center gap-1.5 rounded-[6px] border px-3.5 py-2 text-sm font-semibold transition-colors ${
            recipe.isFavourite
              ? "border-[var(--amber)] bg-[var(--accent-soft)]"
              : "border-[var(--border-strong)] hover:border-[var(--faint)]"
          }`}
          aria-pressed={recipe.isFavourite}
          aria-label={recipe.isFavourite ? "Remove from favourites" : "Save as favourite"}
          onClick={() => fav.mutate()}
          disabled={fav.isPending}
        >
          <span className={recipe.isFavourite ? "text-[var(--accent)]" : undefined}>
            {I.star}
          </span>
          {recipe.isFavourite ? "Saved" : "Save"}
        </button>
      </div>
      {recipe.description ? (
        <p className="mt-3 max-w-lg text-base text-[var(--dim)]">{recipe.description}</p>
      ) : null}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <DietChip flag={recipe.dietFlag} />
        {recipe.highProtein ? (
          <span className="rounded-full bg-[var(--accent-btn)] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
            High protein
          </span>
        ) : null}
        {recipe.budget ? (
          <span className="rounded-full border border-[var(--border-strong)] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[var(--dim)]">
            Budget
          </span>
        ) : null}
        {recipe.isOwn ? (
          <span className="rounded-full border border-[var(--border-strong)] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[var(--dim)]">
            Your recipe
          </span>
        ) : null}
        <span className="flex items-center gap-1.5 text-sm text-[var(--dim)]">
          {I.clock} {recipe.prepMinutes} min prep
          {recipe.cookMinutes != null ? ` · ${recipe.cookMinutes} min cook` : ""}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-5 gap-2 border-y border-[var(--border)] py-4 text-center">
        {(
          [
            ["kcal", Math.round(ps.kcal)],
            ["Protein", `${ps.protein} g`],
            ["Carbs", `${ps.carbs} g`],
            ["Fat", `${ps.fat} g`],
            ["Fibre", `${ps.fibre} g`],
          ] as const
        ).map(([label, v]) => (
          <div key={label}>
            <p className="font-display text-xl leading-none sm:text-2xl">{v}</p>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--faint)]">
              {label} / serving
            </p>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-[var(--faint)]">{recipe.methodNote}</p>

      <div className="mt-7 grid items-start gap-8 lg:grid-cols-2">
        <section>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="kicker text-[var(--dim)]">Ingredients</h3>
            <label className="flex items-center gap-2 text-sm text-[var(--dim)]">
              Cooking for
              <input
                type="number"
                inputMode="decimal"
                min={0.5}
                max={50}
                step={0.5}
                value={servingsShown}
                aria-label="Servings to cook"
                onChange={(e) => {
                  const v = num(e.target.value);
                  if (v != null && v > 0) setCookServings(v);
                }}
                className="w-16 rounded-[6px] border border-[var(--border-strong)] bg-[var(--input)] px-2 py-1.5 text-sm"
              />
              servings
            </label>
          </div>
          <ul className="mt-2 divide-y divide-[var(--border)] border-t border-[var(--border)]">
            {recipe.ingredients.map((ing) => (
              <li key={ing.id} className="flex items-baseline justify-between gap-3 py-2.5 text-sm">
                <span>{ing.name}</span>
                <span className="tnum font-semibold">
                  {Math.round(ing.quantityGrams * factor)} g
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="kicker text-[var(--dim)]">Method</h3>
          <ol className="mt-2 space-y-3 border-t border-[var(--border)] pt-3">
            {recipe.steps.map((s, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed">
                <span className="font-display text-lg leading-none text-[var(--accent-text)]">
                  {i + 1}
                </span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <div className="mt-8 grid items-start gap-4 sm:grid-cols-2">
        <Panel label="Add to today's diary">
          <div className="flex flex-wrap gap-2">
            <select
              value={diaryMeal}
              onChange={(e) => setDiaryMeal(e.target.value as MealKey)}
              aria-label="Meal for the diary entry"
              className="rounded-[6px] border border-[var(--border-strong)] bg-[var(--input)] px-3 py-2.5 text-sm"
            >
              {MEAL_ORDER.map((m) => (
                <option key={m} value={m}>
                  {MEAL_LABELS[m]}
                </option>
              ))}
            </select>
            <input
              type="number"
              inputMode="decimal"
              min={0.25}
              max={10}
              step={0.25}
              value={diaryServings}
              onChange={(e) => setDiaryServings(e.target.value)}
              aria-label="Servings to log"
              className="w-24 rounded-[6px] border border-[var(--border-strong)] bg-[var(--input)] px-3 py-2.5 text-sm"
            />
            <button
              type="button"
              className={btnPrimary}
              onClick={() => addToDiary.mutate()}
              disabled={addToDiary.isPending}
            >
              {I.plus} Log {diaryServings || "1"} serving
              {diaryServings === "1" ? "" : "s"}
            </button>
          </div>
          <p className="mt-2.5 text-xs text-[var(--faint)]">
            Logs {Math.round(ps.kcal)} kcal per serving, from the ingredients above.
          </p>
        </Panel>

        <Panel label="Add to meal plan">
          <div className="flex flex-wrap gap-2">
            <select
              value={planWeekday}
              onChange={(e) => setPlanWeekday(Number(e.target.value))}
              aria-label="Weekday for the meal plan"
              className="rounded-[6px] border border-[var(--border-strong)] bg-[var(--input)] px-3 py-2.5 text-sm"
            >
              {WEEKDAY_LABELS.map((d, i) => (
                <option key={d} value={i}>
                  {d}
                </option>
              ))}
            </select>
            <select
              value={planMeal}
              onChange={(e) => setPlanMeal(e.target.value as MealKey)}
              aria-label="Meal for the meal plan"
              className="rounded-[6px] border border-[var(--border-strong)] bg-[var(--input)] px-3 py-2.5 text-sm"
            >
              {MEAL_ORDER.map((m) => (
                <option key={m} value={m}>
                  {MEAL_LABELS[m]}
                </option>
              ))}
            </select>
            <button
              type="button"
              className={btnGhost}
              onClick={() => addToPlan.mutate()}
              disabled={addToPlan.isPending}
            >
              {I.plus} Plan it
            </button>
          </div>
        </Panel>
      </div>

      {msg ? (
        <p className="mt-4 flex items-center gap-1.5 text-sm font-medium text-[var(--ok)]">
          {I.check} {msg}
        </p>
      ) : null}
      <div className="mt-3">
        <ErrorBox message={error} />
      </div>

      {recipe.isOwn ? (
        <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-[var(--border)] pt-5">
          <button type="button" className={btnGhost} onClick={() => onEdit(recipe)}>
            {I.edit} Edit recipe
          </button>
          {confirmDelete ? (
            <>
              <span className="text-sm font-semibold">Delete this recipe for good?</span>
              <button
                type="button"
                className={btnDanger}
                onClick={() => del.mutate()}
                disabled={del.isPending}
              >
                Yes, delete
              </button>
              <button
                type="button"
                className="text-sm font-semibold text-[var(--dim)]"
                onClick={() => setConfirmDelete(false)}
              >
                Keep it
              </button>
            </>
          ) : (
            <button
              type="button"
              className="flex items-center gap-1.5 text-sm font-semibold text-[var(--accent-text)]"
              onClick={() => setConfirmDelete(true)}
            >
              {I.trash} Delete recipe
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}

type EditorIngredient = { food: Food; grams: string };

function IngredientPicker({
  token,
  onPick,
}: {
  token: string;
  onPick: (food: Food) => void;
}) {
  const [query, setQuery] = useState("");
  const results = useQuery({
    queryKey: ["foods", token, query],
    queryFn: () =>
      api.searchFoods({ token, query, highProtein: false, sort: "relevance" }),
    enabled: query.trim().length >= 2,
  });
  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search the food catalogue — try “paneer”"
        aria-label="Search foods to add as an ingredient"
        className={inputCls}
      />
      {query.trim().length >= 2 ? (
        results.isPending ? (
          <p className="mt-2 text-sm text-[var(--dim)]">Searching…</p>
        ) : results.data && results.data.foods.length > 0 ? (
          <ul className="mt-2 divide-y divide-[var(--border)] rounded-[6px] border border-[var(--border)]">
            {results.data.foods.slice(0, 8).map((f) => (
              <li key={f.id}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left text-sm transition-colors hover:bg-[var(--surface-2)]"
                  onClick={() => {
                    onPick(f);
                    setQuery("");
                  }}
                  aria-label={`Add ${f.name} as an ingredient`}
                >
                  <span className="font-medium">{f.name}</span>
                  <span className="text-xs text-[var(--faint)]">
                    {Math.round(f.kcalPer100)} kcal / 100 g
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-[var(--dim)]">No foods match.</p>
        )
      ) : null}
    </div>
  );
}

function RecipeEditor({
  token,
  recipe,
  onDone,
  onCancel,
}: {
  token: string;
  recipe: RecipeDetailData | null;
  onDone: (recipeId: number) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(recipe?.name ?? "");
  const [description, setDescription] = useState(recipe?.description ?? "");
  const [category, setCategory] = useState<string>(recipe?.category ?? "lunch");
  const [servings, setServings] = useState(String(recipe?.servings ?? 2));
  const [prep, setPrep] = useState(String(recipe?.prepMinutes ?? 10));
  const [cook, setCook] = useState(
    recipe?.cookMinutes != null ? String(recipe.cookMinutes) : "",
  );
  const [budget, setBudget] = useState(recipe?.budget ?? false);
  const [stepsText, setStepsText] = useState((recipe?.steps ?? []).join("\n"));
  const [ingredients, setIngredients] = useState<EditorIngredient[]>([]);
  const [ingredientsLoaded, setIngredientsLoaded] = useState(recipe == null);
  const [error, setError] = useState<string | null>(null);

  // When editing, the detail payload's ingredients carry food ids —
  // resolve them to catalogue foods so grams stay editable.
  useEffect(() => {
    if (!recipe || ingredientsLoaded) return;
    let cancelled = false;
    void (async () => {
      const resolved: EditorIngredient[] = [];
      for (const ing of recipe.ingredients) {
        if (ing.foodId == null) continue;
        const res = await api.searchFoods({
          token,
          query: ing.name,
          highProtein: false,
          sort: "relevance",
        });
        const food = res.foods.find((f) => f.id === ing.foodId);
        if (food)
          resolved.push({ food, grams: String(ing.quantityGrams) });
      }
      if (!cancelled) {
        setIngredients(resolved);
        setIngredientsLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [recipe, token, ingredientsLoaded]);

  const save = useMutation({
    mutationFn: async () => {
      const sv = num(servings);
      const pp = num(prep);
      const ck = cook.trim() === "" ? null : num(cook);
      const steps = stepsText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      const ings = ingredients.map((i) => ({
        foodId: i.food.id,
        quantityGrams: num(i.grams) ?? 0,
      }));
      if (name.trim() === "") throw new Error("name");
      if (sv == null || sv <= 0) throw new Error("servings");
      if (pp == null || pp < 0) throw new Error("prep");
      if (ings.length === 0) throw new Error("ingredients");
      if (ings.some((i) => i.quantityGrams <= 0)) throw new Error("grams");
      const payload = {
        name: name.trim(),
        description: description.trim(),
        category: category as "breakfast" | "lunch" | "dinner" | "snacks",
        servings: sv,
        prepMinutes: Math.round(pp),
        cookMinutes: ck != null ? Math.round(ck) : null,
        steps,
        budget,
        ingredients: ings,
      };
      if (recipe)
        return { res: await api.updateRecipe({ token, recipeId: recipe.id, ...payload }), id: recipe.id };
      const created = await api.createRecipe({ token, ...payload });
      return { res: created, id: created.recipeId ?? 0 };
    },
    onSuccess: ({ res, id }) => {
      if (!res.ok) {
        setError(res.error ?? "Could not save the recipe.");
        return;
      }
      onDone(id);
    },
    onError: (e) => {
      const m = e instanceof Error ? e.message : "";
      setError(
        m === "name"
          ? "Give the recipe a name."
          : m === "servings"
            ? "Servings must be above zero."
            : m === "prep"
              ? "Prep time can't be negative."
              : m === "ingredients"
                ? "Add at least one ingredient from the catalogue."
                : m === "grams"
                  ? "Every ingredient needs grams above zero."
                  : "Could not reach the server.",
      );
    },
  });

  return (
    <div>
      <button type="button" className={linkBtn} onClick={onCancel}>
        {I.chevronLeft} Back
      </button>
      <h2 className="font-display mt-4 text-4xl leading-none sm:text-5xl">
        {recipe ? "Edit recipe" : "New recipe"}
      </h2>
      <p className="mt-2 max-w-md text-sm text-[var(--dim)]">
        Ingredients come from the food catalogue, so the nutrition is
        calculated the same way as every library recipe. Only you can see it.
      </p>

      <form
        className="mt-7 space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <Field label="Name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            placeholder="e.g. Mum's sprouts sabzi"
            aria-label="Recipe name"
            className={inputCls}
          />
        </Field>
        <Field label="Short description (optional)">
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={300}
            aria-label="Recipe description"
            className={inputCls}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Field label="Category">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Recipe category"
              className={inputCls}
            >
              {RECIPE_CATEGORIES.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Servings">
            <input
              type="number"
              inputMode="decimal"
              min={0.5}
              step={0.5}
              value={servings}
              onChange={(e) => setServings(e.target.value)}
              aria-label="Number of servings"
              className={inputCls}
            />
          </Field>
          <Field label="Prep (min)">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={prep}
              onChange={(e) => setPrep(e.target.value)}
              aria-label="Preparation minutes"
              className={inputCls}
            />
          </Field>
          <Field label="Cook (min, optional)">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={cook}
              onChange={(e) => setCook(e.target.value)}
              aria-label="Cooking minutes"
              className={inputCls}
            />
          </Field>
        </div>

        <fieldset>
          <legend className="kicker mb-2 text-[var(--dim)]">Ingredients</legend>
          {!ingredientsLoaded ? (
            <p className="text-sm text-[var(--dim)]">Loading ingredients…</p>
          ) : (
            <>
              {ingredients.length > 0 ? (
                <ul className="mb-3 divide-y divide-[var(--border)] border-y border-[var(--border)]">
                  {ingredients.map((ing, idx) => (
                    <li key={`${ing.food.id}-${idx}`} className="flex items-center gap-2 py-2.5 text-sm">
                      <span className="min-w-0 flex-1 truncate font-medium">
                        {ing.food.name}
                      </span>
                      <input
                        type="number"
                        inputMode="decimal"
                        min={1}
                        value={ing.grams}
                        onChange={(e) =>
                          setIngredients((list) =>
                            list.map((x, i) =>
                              i === idx ? { ...x, grams: e.target.value } : x,
                            ),
                          )
                        }
                        aria-label={`Grams of ${ing.food.name}`}
                        className="w-24 rounded-[6px] border border-[var(--border-strong)] bg-[var(--input)] px-2.5 py-1.5 text-sm"
                      />
                      <span className="text-[var(--dim)]">g</span>
                      <button
                        type="button"
                        className="rounded-[4px] p-1.5 text-[var(--faint)] transition-colors hover:text-[var(--accent-text)]"
                        aria-label={`Remove ${ing.food.name}`}
                        onClick={() =>
                          setIngredients((list) => list.filter((_, i) => i !== idx))
                        }
                      >
                        {I.trash}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
              <IngredientPicker
                token={token}
                onPick={(food) =>
                  setIngredients((list) => [...list, { food, grams: "100" }])
                }
              />
            </>
          )}
        </fieldset>

        <Field label="Steps — one per line">
          <textarea
            value={stepsText}
            onChange={(e) => setStepsText(e.target.value)}
            rows={5}
            aria-label="Recipe steps, one per line"
            className={inputCls}
          />
        </Field>
        <Toggle
          label="Budget-friendly"
          hint="Mostly low-cost, everyday ingredients."
          checked={budget}
          onChange={setBudget}
        />
        <ErrorBox message={error} />
        <div className="flex gap-3">
          <button type="submit" className={btnPrimary} disabled={save.isPending}>
            {I.check} {recipe ? "Save changes" : "Create recipe"}
          </button>
          <button type="button" className={btnGhost} onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function MealPlanView({
  token,
  onOpenRecipe,
}: {
  token: string;
  onOpenRecipe: (id: number) => void;
}) {
  const queryClient = useQueryClient();
  const q = useQuery({
    queryKey: ["mealPlan", token],
    queryFn: () => api.getMealPlan({ token }),
  });
  const [loggedIds, setLoggedIds] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const logToday = useMutation({
    mutationFn: async (entry: {
      id: number;
      recipeId: number;
      meal: MealKey;
      servings: number;
    }) =>
      await api.addRecipeToDiary({
        token,
        recipeId: entry.recipeId,
        date: todayLocal(),
        meal: entry.meal,
        servings: entry.servings,
        clientKey: newClientKey(),
      }),
    onSuccess: (res, entry) => {
      if (!res.ok) {
        setError(res.error ?? "Could not log to diary.");
        return;
      }
      setLoggedIds((s) => new Set(s).add(entry.id));
      void queryClient.invalidateQueries({ queryKey: ["diary"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      void queryClient.invalidateQueries({ queryKey: ["progress"] });
    },
    onError: () => setError("Could not reach the server."),
  });

  const remove = useMutation({
    mutationFn: async (entryId: number) =>
      await api.removeMealPlanEntry({ token, entryId }),
    onSuccess: (res) => {
      if (!res.ok) setError(res.error ?? "Could not remove.");
      else void queryClient.invalidateQueries({ queryKey: ["mealPlan"] });
    },
    onError: () => setError("Could not reach the server."),
  });

  if (q.isPending) return <p className="pt-4 text-sm text-[var(--dim)]">Loading plan…</p>;
  if (!q.data?.ok)
    return (
      <div className="pt-4">
        <ErrorBox message="Could not load your meal plan." />
      </div>
    );
  const entries = q.data.entries;

  return (
    <div>
      <p className="max-w-lg text-sm text-[var(--dim)]">
        Your week at a glance. Open any recipe and use “Add to meal plan”, or
        log a planned serving straight into today's diary.
      </p>
      <div className="mt-3">
        <ErrorBox message={error} />
      </div>
      {entries.length === 0 ? (
        <p className="mt-6">
          <EmptyNote>Nothing planned yet — pick a recipe to start the week.</EmptyNote>
        </p>
      ) : (
        <div className="mt-4 space-y-6">
          {WEEKDAY_LABELS.map((label, weekday) => {
            const dayEntries = entries.filter((e) => e.weekday === weekday);
            if (dayEntries.length === 0) return null;
            return (
              <section key={label}>
                <h3 className="font-display text-lg tracking-wide">{label}</h3>
                <ul className="mt-1.5 divide-y divide-[var(--border)] border-t border-[var(--border)]">
                  {dayEntries.map((e) => (
                    <li key={e.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3 text-sm">
                      <span className="w-24 shrink-0 text-xs font-bold uppercase tracking-wide text-[var(--faint)]">
                        {MEAL_LABELS[e.meal]}
                      </span>
                      <button
                        type="button"
                        className="min-w-0 flex-1 text-left font-semibold underline decoration-[var(--border-strong)] underline-offset-4 hover:decoration-[var(--accent)]"
                        onClick={() => onOpenRecipe(e.recipeId)}
                      >
                        {e.recipeName}
                      </button>
                      <span className="text-[var(--dim)]">
                        {e.servings} × {Math.round(e.kcalPerServing)} kcal
                      </span>
                      <button
                        type="button"
                        className="rounded-[6px] border border-[var(--ink)] px-3 py-1.5 text-xs font-bold transition-colors hover:bg-[var(--ink)] hover:text-[var(--bg)] disabled:opacity-50"
                        disabled={logToday.isPending || loggedIds.has(e.id)}
                        onClick={() =>
                          logToday.mutate({
                            id: e.id,
                            recipeId: e.recipeId,
                            meal: e.meal,
                            servings: e.servings,
                          })
                        }
                        aria-label={`Log ${e.recipeName} to today's diary`}
                      >
                        {loggedIds.has(e.id) ? "Logged ✓" : "Log today"}
                      </button>
                      <button
                        type="button"
                        className="rounded-[4px] p-1.5 text-[var(--faint)] transition-colors hover:text-[var(--accent-text)]"
                        aria-label={`Remove ${e.recipeName} from ${label} ${MEAL_LABELS[e.meal]}`}
                        onClick={() => remove.mutate(e.id)}
                      >
                        {I.trash}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Recipes({ token }: { token: string }) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"library" | "plan">("library");
  const [screen, setScreen] = useState<
    | { kind: "list" }
    | { kind: "detail"; id: number }
    | { kind: "edit"; recipe: RecipeDetailData | null }
  >({ kind: "list" });
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [category, setCategory] = useState<string>("");
  const [diet, setDiet] = useState<string>("");
  const [highProteinOnly, setHighProteinOnly] = useState(false);
  const [favouritesOnly, setFavouritesOnly] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(query), 250);
    return () => window.clearTimeout(id);
  }, [query]);

  const list = useQuery({
    queryKey: [
      "recipes",
      token,
      debounced,
      category,
      diet,
      highProteinOnly,
      favouritesOnly,
    ],
    queryFn: () =>
      api.searchRecipes({
        token,
        query: debounced,
        category: (category || undefined) as
          | "breakfast"
          | "lunch"
          | "dinner"
          | "snacks"
          | undefined,
        dietFlag: (diet || undefined) as
          | "veg"
          | "vegan"
          | "eggetarian"
          | "non_veg"
          | undefined,
        highProteinOnly,
        favouritesOnly,
      }),
    enabled: screen.kind === "list" && tab === "library",
  });

  if (screen.kind === "detail") {
    return (
      <RecipeDetailView
        token={token}
        recipeId={screen.id}
        onBack={() => setScreen({ kind: "list" })}
        onEdit={(r) => setScreen({ kind: "edit", recipe: r })}
      />
    );
  }
  if (screen.kind === "edit") {
    return (
      <RecipeEditor
        token={token}
        recipe={screen.recipe}
        onDone={(id) => {
          void queryClient.invalidateQueries({ queryKey: ["recipes"] });
          void queryClient.invalidateQueries({ queryKey: ["recipe"] });
          void queryClient.invalidateQueries({ queryKey: ["mealPlan"] });
          setScreen({ kind: "detail", id });
        }}
        onCancel={() =>
          setScreen(
            screen.recipe
              ? { kind: "detail", id: screen.recipe.id }
              : { kind: "list" },
          )
        }
      />
    );
  }

  const filterChip = (
    active: boolean,
    label: string,
    onClick: () => void,
  ) => (
    <button
      key={label}
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-xs font-bold transition-colors ${
        active
          ? "border-[var(--accent-btn)] bg-[var(--accent-btn)] text-white"
          : "border-[var(--border-strong)] text-[var(--dim)] hover:border-[var(--faint)]"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-display text-4xl leading-none sm:text-5xl">Recipes</h2>
        <button
          type="button"
          className={btnPrimary}
          onClick={() => setScreen({ kind: "edit", recipe: null })}
        >
          {I.plus} Your recipe
        </button>
      </div>

      <div className="mt-5 flex gap-2" role="tablist" aria-label="Recipes sections">
        {(
          [
            ["library", "Library"],
            ["plan", "Meal plan"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={`border-b-2 px-1 pb-2 text-sm font-bold transition-colors ${
              tab === key
                ? "border-[var(--accent)] text-[var(--text)]"
                : "border-transparent text-[var(--faint)] hover:text-[var(--dim)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "plan" ? (
        <div className="mt-4">
          <MealPlanView
            token={token}
            onOpenRecipe={(id) => setScreen({ kind: "detail", id })}
          />
        </div>
      ) : (
        <>
          <div className="mt-4">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search recipes — try “soya” or “chilla”"
              aria-label="Search recipes"
              className={inputCls}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {filterChip(category === "", "All meals", () => setCategory(""))}
            {RECIPE_CATEGORIES.map((c) =>
              filterChip(category === c.key, c.label, () =>
                setCategory(category === c.key ? "" : c.key),
              ),
            )}
            {filterChip(diet === "vegan", "Vegan", () =>
              setDiet(diet === "vegan" ? "" : "vegan"),
            )}
            {filterChip(diet === "veg", "Veg", () =>
              setDiet(diet === "veg" ? "" : "veg"),
            )}
            {filterChip(highProteinOnly, "High protein", () =>
              setHighProteinOnly((v) => !v),
            )}
            {filterChip(favouritesOnly, "★ Saved", () =>
              setFavouritesOnly((v) => !v),
            )}
          </div>

          {list.isPending ? (
            <div className="mt-8">
              <ListSkeleton rows={5} />
            </div>
          ) : list.isError || !list.data?.ok ? (
            <div className="mt-8">
              <ErrorBox message="Could not load recipes. Try again." />
            </div>
          ) : list.data.recipes.length === 0 ? (
            <p className="mt-8">
              <EmptyNote>
                No recipes match. Loosen a filter — or add your own with the
                button above.
              </EmptyNote>
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-[var(--border)] border-t border-[var(--border)]">
              {list.data.recipes.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 py-4 text-left"
                    onClick={() => setScreen({ kind: "detail", id: r.id })}
                    aria-label={`Open ${r.name}`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-bold">
                        {r.name}
                        {r.isFavourite ? (
                          <span className="text-[var(--accent)]"> ★</span>
                        ) : null}
                      </span>
                      <span className="mt-1 flex flex-wrap items-center gap-1.5">
                        <DietChip flag={r.dietFlag} />
                        {r.highProtein ? (
                          <span className="rounded-full bg-[var(--accent-btn)] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
                            High protein
                          </span>
                        ) : null}
                        {r.budget ? (
                          <span className="rounded-full border border-[var(--border-strong)] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[var(--dim)]">
                            Budget
                          </span>
                        ) : null}
                        {r.isOwn ? (
                          <span className="rounded-full border border-[var(--border-strong)] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[var(--dim)]">
                            Yours
                          </span>
                        ) : null}
                        <span className="text-xs text-[var(--faint)]">
                          {RECIPE_CATEGORIES.find((c) => c.key === r.category)?.label}
                          {" · "}
                          {r.prepMinutes + (r.cookMinutes ?? 0)} min
                        </span>
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="font-display block text-2xl leading-none">
                        {Math.round(r.perServing.kcal)}
                      </span>
                      <span className="text-xs text-[var(--dim)]">
                        kcal · {r.perServing.protein} g protein
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

// ------------------------------------------------------------ challenges

const CHALLENGE_TEMPLATES = [
  {
    key: "reset30" as const,
    name: "30-Day Reset",
    days: 30,
    blurb: "One month of the basics, done daily.",
    tasks: [
      "Log every meal",
      "Hit your water target",
      "Move for 30 minutes",
      "In bed by 11 pm",
    ],
  },
  {
    key: "strong75" as const,
    name: "75-Day Strong",
    days: 75,
    blurb: "The hard one. Two workouts a day, no shortcuts.",
    tasks: [
      "Two 45-minute workouts",
      "Follow your meal plan",
      "Hit your water target",
      "Read 10 pages",
      "Write a progress note",
    ],
  },
];

function ChallengeDetailView({
  token,
  challengeId,
  onBack,
}: {
  token: string;
  challengeId: number;
  onBack: () => void;
}) {
  const queryClient = useQueryClient();
  const today = todayLocal();
  const [date, setDate] = useState(today);
  const [noteDraft, setNoteDraft] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<"restart" | "delete" | null>(null);

  const q = useQuery({
    queryKey: ["challenge", token, challengeId, date],
    queryFn: () => api.getChallenge({ token, challengeId, date, today }),
  });
  const data = q.data;
  const ch = data?.challenge ?? null;

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["challenge", token, challengeId] });
    void queryClient.invalidateQueries({ queryKey: ["challenges"] });
    void queryClient.invalidateQueries({ queryKey: ["progress"] });
  };

  const toggle = useMutation({
    mutationFn: async (v: { taskId: number; done: boolean }) =>
      await api.toggleChallengeCheck({
        token,
        challengeId,
        taskId: v.taskId,
        date,
        done: v.done,
      }),
    onSuccess: (res) => {
      if (!res.ok) setError(res.error ?? "Could not update the task.");
      else {
        setError(null);
        refresh();
      }
    },
    onError: () => setError("Could not reach the server."),
  });

  const saveNote = useMutation({
    mutationFn: async (note: string) =>
      await api.setChallengeDayNote({ token, challengeId, date, note }),
    onSuccess: (res) => {
      if (!res.ok) setError(res.error ?? "Could not save the note.");
      else {
        setNoteDraft(null);
        refresh();
      }
    },
    onError: () => setError("Could not reach the server."),
  });

  const setStatus = useMutation({
    mutationFn: async (status: "active" | "paused") =>
      await api.setChallengeStatus({ token, challengeId, status }),
    onSuccess: (res) => {
      if (!res.ok) setError(res.error ?? "Could not update.");
      else refresh();
    },
    onError: () => setError("Could not reach the server."),
  });

  const restart = useMutation({
    mutationFn: async () =>
      await api.restartChallenge({ token, challengeId, startedOn: today }),
    onSuccess: (res) => {
      if (!res.ok) setError(res.error ?? "Could not restart.");
      else {
        setConfirm(null);
        setDate(today);
        refresh();
      }
    },
    onError: () => setError("Could not reach the server."),
  });

  const del = useMutation({
    mutationFn: async () => await api.deleteChallenge({ token, challengeId }),
    onSuccess: (res) => {
      if (!res.ok) setError(res.error ?? "Could not delete.");
      else {
        void queryClient.invalidateQueries({ queryKey: ["challenges"] });
        void queryClient.invalidateQueries({ queryKey: ["progress"] });
        onBack();
      }
    },
    onError: () => setError("Could not reach the server."),
  });

  if (q.isPending) return <p className="pt-6 text-sm text-[var(--dim)]">Loading challenge…</p>;
  if (!data?.ok || !ch) {
    return (
      <div className="pt-6">
        <ErrorBox message={data?.error ?? "Challenge not found."} />
        <button type="button" className={`${linkBtn} mt-6`} onClick={onBack}>
          {I.chevronLeft} Back to challenges
        </button>
      </div>
    );
  }

  const paused = ch.status === "paused";
  const selectedDay = data.days.find((d) => d.date === date);
  const isToday = date === today;
  const isPast = date < today;
  const allDone =
    data.tasks.length > 0 && data.tasks.every((t) => t.done);
  const noteValue = noteDraft ?? data.note;

  return (
    <div>
      <button type="button" className={linkBtn} onClick={onBack}>
        {I.chevronLeft} All challenges
      </button>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-4xl leading-none sm:text-5xl">{ch.name}</h2>
          <p className="mt-2 text-sm text-[var(--dim)]">
            Day {Math.max(1, ch.dayNumber)} of {ch.totalDays} · Started{" "}
            {prettyDate(ch.startedOn)}
            {paused ? " · Paused" : ""}
            {ch.finished ? " · Finished" : ""}
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-5xl leading-none text-[var(--accent)]">
            {ch.percent}%
          </p>
          <p className="mt-1 text-xs text-[var(--dim)]">
            {ch.streak}-day full streak
          </p>
        </div>
      </div>
      <div
        className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[var(--surface-3)]"
        role="progressbar"
        aria-valuenow={ch.percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Challenge progress"
      >
        <div
          className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
          style={{ width: `${ch.percent}%` }}
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-xl">
          {isToday ? "Today" : prettyDate(date)}
          {selectedDay ? (
            <span className="ml-2 align-middle text-sm font-semibold text-[var(--dim)]">
              Day {selectedDay.dayNumber}
            </span>
          ) : null}
        </h3>
        <span className="flex gap-2">
          <button
            type="button"
            className="rounded-[6px] border border-[var(--border-strong)] px-3 py-2 text-xs font-bold disabled:opacity-40"
            disabled={!selectedDay || selectedDay.dayNumber <= 1}
            onClick={() => setDate(shiftDate(date, -1))}
            aria-label="Previous day"
          >
            {I.chevronLeft} Prev
          </button>
          <button
            type="button"
            className="rounded-[6px] border border-[var(--border-strong)] px-3 py-2 text-xs font-bold disabled:opacity-40"
            disabled={!selectedDay || selectedDay.dayNumber >= ch.totalDays}
            onClick={() => setDate(shiftDate(date, 1))}
            aria-label="Next day"
          >
            Next {I.chevronRight}
          </button>
          {!isToday ? (
            <button
              type="button"
              className="rounded-[6px] border border-[var(--ink)] px-3 py-2 text-xs font-bold"
              onClick={() => setDate(today)}
            >
              Today
            </button>
          ) : null}
        </span>
      </div>

      {paused ? (
        <p className="mt-4 rounded-[8px] bg-[var(--accent-soft)] px-3.5 py-2.5 text-sm">
          This challenge is paused — your ticks and notes are saved. Resume
          whenever you're ready.
        </p>
      ) : null}
      {isPast && !allDone && !paused ? (
        <p className="mt-4 text-sm text-[var(--dim)]">
          Some tasks unticked this day — that happens. Tick what you actually
          did, or just move on to today.
        </p>
      ) : null}
      {allDone ? (
        <p className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-[var(--ok)]">
          {I.check} Full day — every task done.
        </p>
      ) : null}

      <ul className="mt-3 divide-y divide-[var(--border)] border-y border-[var(--border)]">
        {data.tasks.map((t) => (
          <li key={t.id}>
            <label className="flex cursor-pointer items-center gap-3 py-3.5">
              <input
                type="checkbox"
                checked={t.done}
                disabled={paused || toggle.isPending}
                onChange={(e) =>
                  toggle.mutate({ taskId: t.id, done: e.target.checked })
                }
                aria-label={`${t.label} on ${prettyDate(date)}`}
                className="h-5 w-5 shrink-0 accent-[var(--accent)]"
              />
              <span
                className={`text-[15px] ${t.done ? "font-semibold text-[var(--dim)] line-through decoration-[var(--accent)]" : "font-medium"}`}
              >
                {t.label}
              </span>
            </label>
          </li>
        ))}
      </ul>

      <div className="mt-5">
        <Field label={`Note for ${isToday ? "today" : prettyDate(date)}`}>
          <textarea
            value={noteValue}
            onChange={(e) => setNoteDraft(e.target.value)}
            rows={2}
            maxLength={500}
            placeholder="How did it go? Anything to remember tomorrow?"
            aria-label="Day note"
            className={inputCls}
          />
        </Field>
        {noteDraft != null && noteDraft !== data.note ? (
          <button
            type="button"
            className={`${btnInk} mt-2`}
            onClick={() => saveNote.mutate(noteDraft)}
            disabled={saveNote.isPending}
          >
            {I.check} Save note
          </button>
        ) : null}
      </div>

      <div className="mt-7">
        <h3 className="kicker text-[var(--dim)]">Every day</h3>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {data.days.map((d) => {
            const complete = ch.taskCount > 0 && d.doneCount >= ch.taskCount;
            const partial = d.doneCount > 0 && !complete;
            const missed = d.date < today && d.doneCount === 0;
            const isFuture = d.date > today;
            return (
              <button
                key={d.date}
                type="button"
                onClick={() => setDate(d.date)}
                aria-pressed={date === d.date}
                aria-label={`Day ${d.dayNumber}, ${prettyDate(d.date)}: ${d.doneCount} of ${ch.taskCount} tasks done`}
                className={`flex h-9 w-9 items-center justify-center rounded-[6px] text-xs font-bold transition-all ${
                  date === d.date
                    ? "ring-2 ring-[var(--ink)] ring-offset-2 ring-offset-[var(--bg)]"
                    : ""
                } ${
                  complete
                    ? "bg-[var(--accent-btn)] text-white"
                    : partial
                      ? "bg-[var(--peach)] text-[var(--ink)]"
                      : missed
                        ? "bg-[var(--surface-3)] text-[var(--faint)]"
                        : isFuture
                          ? "border border-[var(--border)] text-[var(--faint)]"
                          : "border border-[var(--border-strong)] text-[var(--text)]"
                }`}
              >
                {d.dayNumber}
              </button>
            );
          })}
        </div>
        <p className="mt-2.5 text-xs text-[var(--faint)]">
          Red = full day · Peach = part done · Grey = a day that passed — it
          stays changeable, tick what you did.
        </p>
      </div>

      <div className="mt-3">
        <ErrorBox message={error} />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[var(--border)] pt-5">
        {paused ? (
          <button
            type="button"
            className={btnPrimary}
            onClick={() => setStatus.mutate("active")}
            disabled={setStatus.isPending}
          >
            {I.play} Resume challenge
          </button>
        ) : (
          <button
            type="button"
            className={btnGhost}
            onClick={() => setStatus.mutate("paused")}
            disabled={setStatus.isPending}
          >
            Pause
          </button>
        )}
        {confirm === "restart" ? (
          <>
            <span className="text-sm font-semibold">
              Restart from today? All ticks and notes clear.
            </span>
            <button
              type="button"
              className={btnDanger}
              onClick={() => restart.mutate()}
              disabled={restart.isPending}
            >
              Yes, restart
            </button>
            <button
              type="button"
              className="text-sm font-semibold text-[var(--dim)]"
              onClick={() => setConfirm(null)}
            >
              Keep going
            </button>
          </>
        ) : confirm === "delete" ? (
          <>
            <span className="text-sm font-semibold">Delete this challenge for good?</span>
            <button
              type="button"
              className={btnDanger}
              onClick={() => del.mutate()}
              disabled={del.isPending}
            >
              Yes, delete
            </button>
            <button
              type="button"
              className="text-sm font-semibold text-[var(--dim)]"
              onClick={() => setConfirm(null)}
            >
              Keep it
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="text-sm font-semibold text-[var(--dim)] underline decoration-[var(--border-strong)] underline-offset-4"
              onClick={() => setConfirm("restart")}
            >
              Restart
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 text-sm font-semibold text-[var(--accent-text)]"
              onClick={() => setConfirm("delete")}
            >
              {I.trash} Delete challenge
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Challenges({ token }: { token: string }) {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [customOpen, setCustomOpen] = useState(false);
  const [name, setName] = useState("");
  const [daysInput, setDaysInput] = useState("21");
  const [tasksText, setTasksText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const q = useQuery({
    queryKey: ["challenges", token],
    queryFn: () => api.getChallenges({ token, today: todayLocal() }),
    enabled: selectedId == null,
  });

  const create = useMutation({
    mutationFn: async (v: {
      name: string;
      template: "reset30" | "strong75" | null;
      totalDays: number;
      tasks: string[];
    }) =>
      await api.createChallenge({
        token,
        name: v.name,
        template: v.template,
        totalDays: v.totalDays,
        startedOn: todayLocal(),
        tasks: v.tasks,
      }),
    onSuccess: (res) => {
      if (!res.ok || res.challengeId == null) {
        setError(res.error ?? "Could not start the challenge.");
        return;
      }
      setError(null);
      setCustomOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["challenges"] });
      void queryClient.invalidateQueries({ queryKey: ["progress"] });
      setSelectedId(res.challengeId);
    },
    onError: () => setError("Could not reach the server."),
  });

  if (selectedId != null) {
    return (
      <ChallengeDetailView
        token={token}
        challengeId={selectedId}
        onBack={() => setSelectedId(null)}
      />
    );
  }

  const startCustom = () => {
    const d = num(daysInput);
    const tasks = tasksText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    if (name.trim() === "") return setError("Give your challenge a name.");
    if (d == null || d < 1 || d > 365)
      return setError("Length must be 1–365 days.");
    if (tasks.length === 0)
      return setError("Add at least one daily task, one per line.");
    if (tasks.length > 10) return setError("Up to 10 daily tasks.");
    create.mutate({
      name: name.trim(),
      template: null,
      totalDays: Math.round(d),
      tasks,
    });
  };

  return (
    <div>
      <h2 className="font-display text-4xl leading-none sm:text-5xl">Challenges</h2>

      {q.isPending ? (
        <div className="mt-8">
          <ListSkeleton rows={4} />
        </div>
      ) : q.data?.challenges && q.data.challenges.length > 0 ? (
        <ul className="mt-6 divide-y divide-[var(--border)] border-y border-[var(--border)]">
          {q.data.challenges.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                className="flex w-full items-center gap-3 py-4 text-left"
                onClick={() => setSelectedId(c.id)}
                aria-label={`Open ${c.name}`}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-bold">
                    {c.name}
                  </span>
                  <span className="mt-0.5 block text-xs text-[var(--faint)]">
                    Day {Math.max(1, c.dayNumber)} of {c.totalDays} ·{" "}
                    {c.todayDone} of {c.taskCount} tasks today
                    {c.status === "paused" ? " · Paused" : ""}
                    {c.finished ? " · Finished" : ""}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="font-display block text-2xl leading-none text-[var(--accent)]">
                    {c.percent}%
                  </span>
                  <span className="text-xs text-[var(--dim)]">
                    {c.streak}-day streak
                  </span>
                </span>
                {I.chevronRight}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6">
          <EmptyNote>No challenges yet. Pick a template or build your own below.</EmptyNote>
        </p>
      )}

      <h3 className="kicker mt-10 text-[var(--dim)]">Start a challenge</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {CHALLENGE_TEMPLATES.map((t) => (
          <div
            key={t.key}
            className="rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-5"
          >
            <p className="font-display text-2xl leading-none">{t.name}</p>
            <p className="mt-1.5 text-sm text-[var(--dim)]">{t.blurb}</p>
            <ul className="mt-3 space-y-1 text-sm text-[var(--dim)]">
              {t.tasks.map((task) => (
                <li key={task} className="flex gap-2">
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                  {task}
                </li>
              ))}
            </ul>
            <button
              type="button"
              className={`${btnPrimary} mt-4`}
              disabled={create.isPending}
              onClick={() =>
                create.mutate({
                  name: t.name,
                  template: t.key,
                  totalDays: t.days,
                  tasks: t.tasks,
                })
              }
              aria-label={`Start the ${t.name} challenge today`}
            >
              {I.play} Start today
            </button>
          </div>
        ))}
      </div>

      {customOpen ? (
        <form
          className="mt-6 space-y-4 rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-5"
          onSubmit={(e) => {
            e.preventDefault();
            startCustom();
          }}
        >
          <Field label="Challenge name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              placeholder="e.g. No sugar, full focus"
              aria-label="Custom challenge name"
              className={inputCls}
            />
          </Field>
          <Field label="Length (days)">
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={365}
              value={daysInput}
              onChange={(e) => setDaysInput(e.target.value)}
              aria-label="Challenge length in days"
              className={inputCls}
            />
          </Field>
          <Field label="Daily tasks — one per line (up to 10)">
            <textarea
              value={tasksText}
              onChange={(e) => setTasksText(e.target.value)}
              rows={4}
              placeholder={"Log every meal\nTrain once\nRead 10 pages"}
              aria-label="Daily tasks, one per line"
              className={inputCls}
            />
          </Field>
          <div className="flex gap-3">
            <button type="submit" className={btnPrimary} disabled={create.isPending}>
              {I.play} Start today
            </button>
            <button
              type="button"
              className={btnGhost}
              onClick={() => setCustomOpen(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          className={`${btnGhost} mt-6`}
          onClick={() => setCustomOpen(true)}
        >
          {I.plus} Build your own
        </button>
      )}
      <div className="mt-4">
        <ErrorBox message={error} />
      </div>
    </div>
  );
}

// ------------------------------------------------------------ build status

function StatusList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "ok" | "warn" | "dim" | "bad";
}) {
  const dot =
    tone === "ok"
      ? "bg-[var(--ok)]"
      : tone === "warn"
        ? "bg-[var(--warn)]"
        : tone === "bad"
          ? "bg-[var(--accent)]"
          : "bg-[var(--faint)]";
  return (
    <section className="border-t border-[var(--border)] py-6 first:border-t-0 first:pt-0">
      <h3 className="kicker text-[var(--dim)]">{title}</h3>
      <ul className="mt-3.5 space-y-2.5 text-sm leading-relaxed">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5">
            <span className={`mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
            <span className="text-[var(--dim)]">{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ------------------------------------------------------------- admin
// Phase 5 admin area. Every action here is re-checked on the server
// against the admin_roles table; this UI is only rendered when the
// session reports an admin role, and a server refusal is shown as-is.

type AdminFoodRow = ApiResponse<typeof api, "adminListFoods">["foods"][number];
type AdminExerciseRow =
  ApiResponse<typeof api, "adminListExercises">["exercises"][number];
type AdminRecipeRow =
  ApiResponse<typeof api, "adminListRecipes">["recipes"][number];

function AdminPanel({ token }: { token: string }) {
  const [tab, setTab] = useState<
    "overview" | "foods" | "exercises" | "recipes" | "custom" | "audit"
  >("overview");
  const overview = useQuery({
    queryKey: ["adminOverview", token],
    queryFn: () => api.adminOverview({ token }),
  });

  const tabBtn = (key: typeof tab, label: string) => (
    <button
      key={key}
      type="button"
      onClick={() => setTab(key)}
      aria-pressed={tab === key}
      className={`rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-colors ${
        tab === key
          ? "border-[var(--accent-btn)] bg-[var(--accent-btn)] text-white"
          : "border-[var(--border-strong)] text-[var(--dim)] hover:border-[var(--faint)]"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div>
      <p className="kicker text-[var(--accent-text)]">Admin</p>
      <h2 className="font-display mt-1.5 text-4xl leading-none sm:text-5xl">
        Content & site
      </h2>
      <p className="mt-2 max-w-lg text-sm text-[var(--dim)]">
        Manage the shared food, exercise and recipe libraries. Totals
        only — no individual user's private data appears here.
      </p>

      {overview.isPending ? (
        <div className="mt-8">
          <ListSkeleton rows={4} />
        </div>
      ) : !overview.data?.ok ? (
        <div className="mt-8">
          <ErrorBox
            message={
              overview.data?.error ??
              "Admin access required. If you are the site owner and no admin exists yet, claim access from Profile & settings."
            }
          />
        </div>
      ) : (
        <>
          <div
            className="mt-6 flex flex-wrap gap-1.5"
            role="group"
            aria-label="Admin sections"
          >
            {tabBtn("overview", "Overview")}
            {tabBtn("foods", "Foods")}
            {tabBtn("exercises", "Exercises")}
            {tabBtn("recipes", "Recipes")}
            {tabBtn("custom", "Custom foods")}
            {tabBtn("audit", "Audit log")}
          </div>
          <div className="mt-6">
            {tab === "overview" ? (
              <AdminOverview data={overview.data} />
            ) : tab === "foods" ? (
              <AdminFoods token={token} scope="catalogue" />
            ) : tab === "exercises" ? (
              <AdminExercises token={token} />
            ) : tab === "recipes" ? (
              <AdminRecipes token={token} />
            ) : tab === "custom" ? (
              <AdminFoods token={token} scope="custom" />
            ) : (
              <AdminAudit token={token} />
            )}
          </div>
        </>
      )}
    </div>
  );
}

function AdminOverview({
  data,
}: {
  data: ApiResponse<typeof api, "adminOverview">;
}) {
  const stats: { label: string; value: number }[] = [
    { label: "Users", value: data.users },
    { label: "Admins", value: data.admins },
    { label: "Catalogue foods", value: data.catalogueFoods },
    { label: "User custom foods", value: data.customFoods },
    { label: "Exercises", value: data.exercises },
    { label: "Library recipes", value: data.seededRecipes },
    { label: "User recipes", value: data.userRecipes },
    { label: "Diary entries", value: data.diaryEntries },
    { label: "Workout sessions", value: data.workoutSessions },
    { label: "Water entries", value: data.waterEntries },
    { label: "Challenges", value: data.challenges },
  ];
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-[10px] border border-[var(--border)] bg-[var(--surface)] px-4 py-4"
          >
            <p className="font-display tnum text-3xl leading-none">
              {s.value.toLocaleString("en-IN")}
            </p>
            <p className="mt-1.5 text-xs font-medium text-[var(--dim)]">
              {s.label}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-[var(--dim)]">
        Aggregate totals across the whole app. Individual accounts,
        diaries and workouts are never listed in admin.
      </p>
    </div>
  );
}

/* Shared admin list search box with the app's 250 ms debounce. */
function useDebounced(value: string, ms = 250): string {
  const [out, setOut] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setOut(value.trim()), ms);
    return () => window.clearTimeout(id);
  }, [value, ms]);
  return out;
}

function AdminFoods({
  token,
  scope,
}: {
  token: string;
  scope: "catalogue" | "custom";
}) {
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const query = useDebounced(input);
  const [limit, setLimit] = useState(60);
  const [editing, setEditing] = useState<AdminFoodRow | "new" | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const list = useQuery({
    queryKey: ["adminFoods", token, scope, query, limit],
    queryFn: () =>
      api.adminListFoods({ token, scope, query, limit, offset: 0 }),
  });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["adminFoods"] });
    void queryClient.invalidateQueries({ queryKey: ["adminOverview"] });
    void queryClient.invalidateQueries({ queryKey: ["foodSearch"] });
    void queryClient.invalidateQueries({ queryKey: ["foodLists"] });
  };

  const del = useMutation({
    mutationFn: async (foodId: number) =>
      await api.adminDeleteFood({ token, foodId }),
    onSuccess: (res) => {
      if (!res.ok) {
        setError(res.error ?? "Could not delete.");
        return;
      }
      setConfirmDeleteId(null);
      setError(null);
      setMsg("Food deleted.");
      refresh();
    },
    onError: () => setError("Could not reach the server."),
  });

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--faint)]">
            {I.search}
          </span>
          <input
            className={`${inputCls} pl-11`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              scope === "catalogue" ? "Search catalogue foods…" : "Search custom foods…"
            }
            aria-label="Search foods"
          />
        </div>
        {scope === "catalogue" ? (
          <button
            type="button"
            className={btnPrimary}
            onClick={() => {
              setError(null);
              setEditing("new");
            }}
          >
            {I.plus} New food
          </button>
        ) : null}
      </div>
      {scope === "custom" ? (
        <p className="mt-3 text-sm text-[var(--dim)]">
          Foods users created for themselves, shown for quality review
          without owner details. You can remove one that is wrong or
          abusive; editing belongs to its owner.
        </p>
      ) : null}
      <div className="mt-3">
        <ErrorBox message={error} />
      </div>
      {msg ? (
        <p className="mt-2 flex items-center gap-1 text-sm font-medium text-[var(--ok)]" role="status">
          {I.check} {msg}
        </p>
      ) : null}

      {editing ? (
        <AdminFoodEditor
          token={token}
          food={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            setMsg("Food saved.");
            refresh();
          }}
        />
      ) : null}

      {list.isPending ? (
        <div className="mt-4">
          <ListSkeleton rows={5} />
        </div>
      ) : list.data && list.data.foods.length > 0 ? (
        <>
          <ul className="mt-2 divide-y divide-[var(--border)]">
            {list.data.foods.map((f) => (
              <li key={f.id} className="py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[15px] font-bold leading-snug">{f.name}</p>
                    <p className="mt-0.5 text-xs text-[var(--faint)]">
                      {Math.round(f.kcalPer100)} kcal · P {f.proteinPer100} g ·
                      C {f.carbsPer100} g · F {f.fatPer100} g per 100 g ·{" "}
                      {f.category}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--faint)]">
                      {f.verification === "verified"
                        ? "Verified"
                        : f.verification === "user"
                          ? "User-submitted"
                          : "Estimate"}{" "}
                      · {f.source}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    {scope === "catalogue" ? (
                      <button
                        type="button"
                        className="rounded-[6px] border border-[var(--border-strong)] px-3 py-2 text-xs font-bold"
                        onClick={() => {
                          setError(null);
                          setEditing(f);
                        }}
                        aria-label={`Edit ${f.name}`}
                      >
                        Edit
                      </button>
                    ) : null}
                    {confirmDeleteId === f.id ? (
                      <button
                        type="button"
                        className="rounded-[6px] bg-[var(--accent-btn)] px-3 py-2 text-xs font-bold text-white"
                        onClick={() => del.mutate(f.id)}
                        disabled={del.isPending}
                      >
                        Confirm delete
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="rounded-[6px] border border-[var(--border-strong)] px-3 py-2 text-xs font-bold text-[var(--accent-text)]"
                        onClick={() => setConfirmDeleteId(f.id)}
                        aria-label={`Delete ${f.name}`}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {list.data.foods.length < list.data.total ? (
            <button
              type="button"
              className={`${btnGhost} mt-4 w-full`}
              onClick={() => setLimit((l) => l + 60)}
              disabled={list.isFetching}
            >
              {list.isFetching
                ? "Loading…"
                : `Load more (${list.data.total - list.data.foods.length} more)`}
            </button>
          ) : null}
        </>
      ) : (
        <p className="mt-4 text-sm text-[var(--dim)]">No foods match.</p>
      )}
    </div>
  );
}

function AdminFoodEditor({
  token,
  food,
  onClose,
  onSaved,
}: {
  token: string;
  food: AdminFoodRow | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: food?.name ?? "",
    aliases: food?.aliases ?? "",
    category: food?.category ?? FOOD_CATEGORIES[0] ?? "Breakfast",
    cuisine: food?.cuisine ?? FOOD_CUISINES[0] ?? "North Indian",
    dietFlag: (food?.dietFlag ?? "veg") as string,
    kcalPer100: food ? String(food.kcalPer100) : "",
    proteinPer100: food ? String(food.proteinPer100) : "",
    carbsPer100: food ? String(food.carbsPer100) : "",
    fatPer100: food ? String(food.fatPer100) : "",
    fibrePer100: food ? String(food.fibrePer100) : "",
    servingName: food?.servingName ?? "1 serving",
    servingGrams: food ? String(food.servingGrams) : "100",
    source: food?.source ?? "",
    verification: (food?.verification === "verified"
      ? "verified"
      : "estimate") as string,
    notes: food?.notes ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const set = (patch: Partial<typeof form>) =>
    setForm((f) => ({ ...f, ...patch }));

  const save = useMutation({
    mutationFn: async () => {
      const kcal = num(form.kcalPer100);
      const protein = num(form.proteinPer100);
      const carbs = num(form.carbsPer100);
      const fat = num(form.fatPer100);
      const fibre = num(form.fibrePer100);
      const servingGrams = num(form.servingGrams);
      if (
        kcal == null ||
        protein == null ||
        carbs == null ||
        fat == null ||
        fibre == null ||
        servingGrams == null
      )
        throw new Error("local");
      return await api.adminSaveFood({
        token,
        id: food?.id,
        name: form.name.trim(),
        aliases: form.aliases.trim(),
        category: form.category,
        cuisine: form.cuisine,
        dietFlag: form.dietFlag as "veg" | "vegan" | "eggetarian" | "non_veg",
        kcalPer100: kcal,
        proteinPer100: protein,
        carbsPer100: carbs,
        fatPer100: fat,
        fibrePer100: fibre,
        servingName: form.servingName.trim(),
        servingGrams,
        source: form.source.trim(),
        verification: form.verification as "estimate" | "verified",
        notes: form.notes.trim() === "" ? null : form.notes.trim(),
      });
    },
    onSuccess: (res) => {
      if (!res.ok) {
        setError(res.error ?? "Could not save.");
        return;
      }
      onSaved();
    },
    onError: (e) =>
      setError(
        e instanceof Error && e.message === "local"
          ? "Enter numbers for all nutrition values."
          : "Could not reach the server.",
      ),
  });

  const numField = (
    label: string,
    key: keyof typeof form,
    step = "0.1",
  ) => (
    <Field label={label}>
      <input
        className={inputCls}
        type="number"
        inputMode="decimal"
        min="0"
        step={step}
        value={form[key]}
        onChange={(e) => set({ [key]: e.target.value } as Partial<typeof form>)}
        required
      />
    </Field>
  );

  return (
    <form
      className="mt-4 rounded-[10px] border border-[var(--border-strong)] bg-[var(--surface)] p-4"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        save.mutate();
      }}
    >
      <h3 className="font-display text-xl">
        {food ? `Edit ${food.name}` : "New catalogue food"}
      </h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Name">
          <input
            className={inputCls}
            value={form.name}
            onChange={(e) => set({ name: e.target.value })}
            required
          />
        </Field>
        <Field label="Also known as" hint="Comma-separated local names for search.">
          <input
            className={inputCls}
            value={form.aliases}
            onChange={(e) => set({ aliases: e.target.value })}
          />
        </Field>
        <Field label="Category">
          <select
            className={inputCls}
            value={form.category}
            onChange={(e) => set({ category: e.target.value })}
            aria-label="Category"
          >
            {FOOD_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Cuisine">
          <select
            className={inputCls}
            value={form.cuisine}
            onChange={(e) => set({ cuisine: e.target.value })}
            aria-label="Cuisine"
          >
            {FOOD_CUISINES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Diet type">
          <select
            className={inputCls}
            value={form.dietFlag}
            onChange={(e) => set({ dietFlag: e.target.value })}
            aria-label="Diet type"
          >
            {Object.entries(DIET_FLAG_LABELS).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Verification">
          <select
            className={inputCls}
            value={form.verification}
            onChange={(e) => set({ verification: e.target.value })}
            aria-label="Verification"
          >
            <option value="estimate">Estimate (reference values)</option>
            <option value="verified">Verified (checked source)</option>
          </select>
        </Field>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {numField("Kcal / 100 g", "kcalPer100", "1")}
        {numField("Protein g / 100 g", "proteinPer100")}
        {numField("Carbs g / 100 g", "carbsPer100")}
        {numField("Fat g / 100 g", "fatPer100")}
        {numField("Fibre g / 100 g", "fibrePer100")}
        {numField("Serving grams", "servingGrams", "1")}
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Serving name" hint="e.g. 1 katori, 1 roti, 1 piece.">
          <input
            className={inputCls}
            value={form.servingName}
            onChange={(e) => set({ servingName: e.target.value })}
            required
          />
        </Field>
        <Field label="Source" hint="Where the values come from — shown to users.">
          <input
            className={inputCls}
            value={form.source}
            onChange={(e) => set({ source: e.target.value })}
            required
          />
        </Field>
      </div>
      <div className="mt-4">
        <Field label="Notes">
          <input
            className={inputCls}
            value={form.notes}
            onChange={(e) => set({ notes: e.target.value })}
          />
        </Field>
      </div>
      <div className="mt-4">
        <ErrorBox message={error} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="submit" className={btnPrimary} disabled={save.isPending}>
          {save.isPending ? "Saving…" : "Save food"}
        </button>
        <button type="button" className={btnGhost} onClick={onClose}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function AdminExercises({ token }: { token: string }) {
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const query = useDebounced(input);
  const [limit, setLimit] = useState(60);
  const [editing, setEditing] = useState<AdminExerciseRow | "new" | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const list = useQuery({
    queryKey: ["adminExercises", token, query, limit],
    queryFn: () => api.adminListExercises({ token, query, limit, offset: 0 }),
  });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["adminExercises"] });
    void queryClient.invalidateQueries({ queryKey: ["adminOverview"] });
    void queryClient.invalidateQueries({ queryKey: ["exerciseSearch"] });
  };

  const del = useMutation({
    mutationFn: async (exerciseId: number) =>
      await api.adminDeleteExercise({ token, exerciseId }),
    onSuccess: (res) => {
      if (!res.ok) {
        setError(res.error ?? "Could not delete.");
        return;
      }
      setConfirmDeleteId(null);
      setError(null);
      setMsg("Exercise deleted.");
      refresh();
    },
    onError: () => setError("Could not reach the server."),
  });

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--faint)]">
            {I.search}
          </span>
          <input
            className={`${inputCls} pl-11`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search exercises…"
            aria-label="Search exercises"
          />
        </div>
        <button
          type="button"
          className={btnPrimary}
          onClick={() => {
            setError(null);
            setEditing("new");
          }}
        >
          {I.plus} New exercise
        </button>
      </div>
      <div className="mt-3">
        <ErrorBox message={error} />
      </div>
      {msg ? (
        <p className="mt-2 flex items-center gap-1 text-sm font-medium text-[var(--ok)]" role="status">
          {I.check} {msg}
        </p>
      ) : null}

      {editing ? (
        <AdminExerciseEditor
          token={token}
          exercise={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            setMsg("Exercise saved.");
            refresh();
          }}
        />
      ) : null}

      {list.isPending ? (
        <div className="mt-4">
          <ListSkeleton rows={5} />
        </div>
      ) : list.data && list.data.exercises.length > 0 ? (
        <>
          <ul className="mt-2 divide-y divide-[var(--border)]">
            {list.data.exercises.map((ex) => (
              <li key={ex.id} className="py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[15px] font-bold leading-snug">{ex.name}</p>
                    <p className="mt-0.5 text-xs text-[var(--faint)]">
                      {ex.primaryMuscle} · {ex.equipment} ·{" "}
                      {DIFFICULTY_LABELS[ex.difficulty]} · {ex.kind} ·{" "}
                      {ex.suggestedSets} × {ex.suggestedReps}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <button
                      type="button"
                      className="rounded-[6px] border border-[var(--border-strong)] px-3 py-2 text-xs font-bold"
                      onClick={() => {
                        setError(null);
                        setEditing(ex);
                      }}
                      aria-label={`Edit ${ex.name}`}
                    >
                      Edit
                    </button>
                    {confirmDeleteId === ex.id ? (
                      <button
                        type="button"
                        className="rounded-[6px] bg-[var(--accent-btn)] px-3 py-2 text-xs font-bold text-white"
                        onClick={() => del.mutate(ex.id)}
                        disabled={del.isPending}
                      >
                        Confirm delete
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="rounded-[6px] border border-[var(--border-strong)] px-3 py-2 text-xs font-bold text-[var(--accent-text)]"
                        onClick={() => setConfirmDeleteId(ex.id)}
                        aria-label={`Delete ${ex.name}`}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {list.data.exercises.length < list.data.total ? (
            <button
              type="button"
              className={`${btnGhost} mt-4 w-full`}
              onClick={() => setLimit((l) => l + 60)}
              disabled={list.isFetching}
            >
              {list.isFetching
                ? "Loading…"
                : `Load more (${list.data.total - list.data.exercises.length} more)`}
            </button>
          ) : null}
        </>
      ) : (
        <p className="mt-4 text-sm text-[var(--dim)]">No exercises match.</p>
      )}
    </div>
  );
}

function AdminExerciseEditor({
  token,
  exercise,
  onClose,
  onSaved,
}: {
  token: string;
  exercise: AdminExerciseRow | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: exercise?.name ?? "",
    primaryMuscle: exercise?.primaryMuscle ?? MUSCLE_GROUPS[0] ?? "Chest",
    secondaryMuscles: exercise?.secondaryMuscles ?? "",
    equipment: exercise?.equipment ?? EQUIPMENT_LIST[0] ?? "Barbell",
    difficulty: (exercise?.difficulty ?? "beginner") as string,
    pattern: exercise?.pattern ?? "",
    kind: (exercise?.kind ?? "weighted") as string,
    instructions: exercise?.instructions ?? "",
    mistakes: exercise?.mistakes ?? "",
    suggestedSets: exercise ? String(exercise.suggestedSets) : "3",
    suggestedReps: exercise?.suggestedReps ?? "8-12",
    restSeconds: exercise ? String(exercise.restSeconds) : "90",
  });
  const [error, setError] = useState<string | null>(null);
  const set = (patch: Partial<typeof form>) =>
    setForm((f) => ({ ...f, ...patch }));

  const save = useMutation({
    mutationFn: async () => {
      const sets = num(form.suggestedSets);
      const rest = num(form.restSeconds);
      if (sets == null || rest == null) throw new Error("local");
      return await api.adminSaveExercise({
        token,
        id: exercise?.id,
        name: form.name.trim(),
        primaryMuscle: form.primaryMuscle,
        secondaryMuscles: form.secondaryMuscles.trim(),
        equipment: form.equipment,
        difficulty: form.difficulty as
          | "beginner"
          | "intermediate"
          | "advanced",
        pattern: form.pattern.trim(),
        kind: form.kind as "weighted" | "bodyweight" | "timed",
        instructions: form.instructions.trim(),
        mistakes: form.mistakes.trim(),
        suggestedSets: Math.round(sets),
        suggestedReps: form.suggestedReps.trim(),
        restSeconds: Math.round(rest),
      });
    },
    onSuccess: (res) => {
      if (!res.ok) {
        setError(res.error ?? "Could not save.");
        return;
      }
      onSaved();
    },
    onError: (e) =>
      setError(
        e instanceof Error && e.message === "local"
          ? "Sets and rest must be numbers."
          : "Could not reach the server.",
      ),
  });

  return (
    <form
      className="mt-4 rounded-[10px] border border-[var(--border-strong)] bg-[var(--surface)] p-4"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        save.mutate();
      }}
    >
      <h3 className="font-display text-xl">
        {exercise ? `Edit ${exercise.name}` : "New exercise"}
      </h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Name">
          <input
            className={inputCls}
            value={form.name}
            onChange={(e) => set({ name: e.target.value })}
            required
          />
        </Field>
        <Field label="Movement pattern" hint="e.g. Horizontal push, Squat, Hinge.">
          <input
            className={inputCls}
            value={form.pattern}
            onChange={(e) => set({ pattern: e.target.value })}
            required
          />
        </Field>
        <Field label="Primary muscle">
          <select
            className={inputCls}
            value={form.primaryMuscle}
            onChange={(e) => set({ primaryMuscle: e.target.value })}
            aria-label="Primary muscle"
          >
            {MUSCLE_GROUPS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Secondary muscles" hint="Comma-separated.">
          <input
            className={inputCls}
            value={form.secondaryMuscles}
            onChange={(e) => set({ secondaryMuscles: e.target.value })}
          />
        </Field>
        <Field label="Equipment">
          <select
            className={inputCls}
            value={form.equipment}
            onChange={(e) => set({ equipment: e.target.value })}
            aria-label="Equipment"
          >
            {EQUIPMENT_LIST.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Difficulty">
          <select
            className={inputCls}
            value={form.difficulty}
            onChange={(e) => set({ difficulty: e.target.value })}
            aria-label="Difficulty"
          >
            {Object.entries(DIFFICULTY_LABELS).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Kind">
          <select
            className={inputCls}
            value={form.kind}
            onChange={(e) => set({ kind: e.target.value })}
            aria-label="Kind"
          >
            <option value="weighted">Weighted (reps + load)</option>
            <option value="bodyweight">Bodyweight (reps)</option>
            <option value="timed">Timed (seconds)</option>
          </select>
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Sets">
            <input
              className={inputCls}
              type="number"
              min="1"
              max="10"
              value={form.suggestedSets}
              onChange={(e) => set({ suggestedSets: e.target.value })}
              required
            />
          </Field>
          <Field label="Reps">
            <input
              className={inputCls}
              value={form.suggestedReps}
              onChange={(e) => set({ suggestedReps: e.target.value })}
              required
            />
          </Field>
          <Field label="Rest (s)">
            <input
              className={inputCls}
              type="number"
              min="0"
              max="600"
              value={form.restSeconds}
              onChange={(e) => set({ restSeconds: e.target.value })}
              required
            />
          </Field>
        </div>
      </div>
      <div className="mt-4 grid gap-4">
        <Field label="How to do it">
          <textarea
            className={`${inputCls} min-h-24`}
            value={form.instructions}
            onChange={(e) => set({ instructions: e.target.value })}
            required
          />
        </Field>
        <Field label="Common mistakes">
          <textarea
            className={`${inputCls} min-h-20`}
            value={form.mistakes}
            onChange={(e) => set({ mistakes: e.target.value })}
            required
          />
        </Field>
      </div>
      <div className="mt-4">
        <ErrorBox message={error} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="submit" className={btnPrimary} disabled={save.isPending}>
          {save.isPending ? "Saving…" : "Save exercise"}
        </button>
        <button type="button" className={btnGhost} onClick={onClose}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function AdminRecipes({ token }: { token: string }) {
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const query = useDebounced(input);
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const list = useQuery({
    queryKey: ["adminRecipes", token, query],
    queryFn: () => api.adminListRecipes({ token, query }),
  });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["adminRecipes"] });
    void queryClient.invalidateQueries({ queryKey: ["adminOverview"] });
    void queryClient.invalidateQueries({ queryKey: ["recipes"] });
    void queryClient.invalidateQueries({ queryKey: ["recipe"] });
  };

  const del = useMutation({
    mutationFn: async (recipeId: number) =>
      await api.adminDeleteRecipe({ token, recipeId }),
    onSuccess: (res) => {
      if (!res.ok) {
        setError(res.error ?? "Could not delete.");
        return;
      }
      setConfirmDeleteId(null);
      setError(null);
      setMsg("Recipe deleted.");
      refresh();
    },
    onError: () => setError("Could not reach the server."),
  });

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--faint)]">
            {I.search}
          </span>
          <input
            className={`${inputCls} pl-11`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search library recipes…"
            aria-label="Search recipes"
          />
        </div>
        <button
          type="button"
          className={btnPrimary}
          onClick={() => {
            setError(null);
            setEditingId("new");
          }}
        >
          {I.plus} New recipe
        </button>
      </div>
      <div className="mt-3">
        <ErrorBox message={error} />
      </div>
      {msg ? (
        <p className="mt-2 flex items-center gap-1 text-sm font-medium text-[var(--ok)]" role="status">
          {I.check} {msg}
        </p>
      ) : null}

      {editingId !== null ? (
        <AdminRecipeEditor
          token={token}
          recipeId={editingId === "new" ? null : editingId}
          onClose={() => setEditingId(null)}
          onSaved={() => {
            setEditingId(null);
            setMsg("Recipe saved.");
            refresh();
          }}
        />
      ) : null}

      {list.isPending ? (
        <div className="mt-4">
          <ListSkeleton rows={5} />
        </div>
      ) : list.data && list.data.recipes.length > 0 ? (
        <ul className="mt-2 divide-y divide-[var(--border)]">
          {list.data.recipes.map((r) => (
            <li key={r.id} className="py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[15px] font-bold leading-snug">{r.name}</p>
                  <p className="mt-0.5 text-xs text-[var(--faint)]">
                    {r.category} · {DIET_FLAG_LABELS[r.dietFlag]} ·{" "}
                    {r.servings} servings · {r.ingredientCount} ingredients
                  </p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <button
                    type="button"
                    className="rounded-[6px] border border-[var(--border-strong)] px-3 py-2 text-xs font-bold"
                    onClick={() => {
                      setError(null);
                      setEditingId(r.id);
                    }}
                    aria-label={`Edit ${r.name}`}
                  >
                    Edit
                  </button>
                  {confirmDeleteId === r.id ? (
                    <button
                      type="button"
                      className="rounded-[6px] bg-[var(--accent-btn)] px-3 py-2 text-xs font-bold text-white"
                      onClick={() => del.mutate(r.id)}
                      disabled={del.isPending}
                    >
                      Confirm delete
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="rounded-[6px] border border-[var(--border-strong)] px-3 py-2 text-xs font-bold text-[var(--accent-text)]"
                      onClick={() => setConfirmDeleteId(r.id)}
                      aria-label={`Delete ${r.name}`}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-[var(--dim)]">No recipes match.</p>
      )}
    </div>
  );
}

type AdminRecipeForm = {
  name: string;
  description: string;
  category: string;
  dietFlag: string;
  servings: string;
  prepMinutes: string;
  cookMinutes: string;
  steps: string;
  budget: boolean;
  ingredients: { foodId: number; quantityGrams: string }[];
};

function AdminRecipeEditor({
  token,
  recipeId,
  onClose,
  onSaved,
}: {
  token: string;
  recipeId: number | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const detail = useQuery({
    queryKey: ["adminRecipeDetail", token, recipeId],
    queryFn: () => api.adminGetRecipe({ token, recipeId: recipeId ?? 0 }),
    enabled: recipeId != null,
  });
  const catalogue = useQuery({
    queryKey: ["adminFoodOptions", token],
    queryFn: () =>
      api.adminListFoods({ token, scope: "catalogue", query: "", limit: 300, offset: 0 }),
  });

  const [form, setForm] = useState<AdminRecipeForm | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (recipeId == null) {
      setForm({
        name: "",
        description: "",
        category: "breakfast",
        dietFlag: "veg",
        servings: "2",
        prepMinutes: "10",
        cookMinutes: "15",
        steps: "",
        budget: false,
        ingredients: [],
      });
      return;
    }
    const r = detail.data?.recipe;
    if (!r) return;
    setForm({
      name: r.name,
      description: r.description,
      category: r.category,
      dietFlag: r.dietFlag,
      servings: String(r.servings),
      prepMinutes: String(r.prepMinutes),
      cookMinutes: r.cookMinutes != null ? String(r.cookMinutes) : "",
      steps: r.steps,
      budget: r.budget,
      ingredients: r.ingredients
        .filter((i) => i.foodId != null)
        .map((i) => ({
          foodId: i.foodId as number,
          quantityGrams: String(i.quantityGrams),
        })),
    });
  }, [recipeId, detail.data]);

  const save = useMutation({
    mutationFn: async () => {
      if (!form) throw new Error("local");
      const servings = num(form.servings);
      const prep = num(form.prepMinutes);
      const cook = form.cookMinutes.trim() === "" ? null : num(form.cookMinutes);
      if (servings == null || prep == null) throw new Error("local");
      const ingredients = form.ingredients.map((i) => {
        const g = num(i.quantityGrams);
        if (g == null) throw new Error("local");
        return { foodId: i.foodId, quantityGrams: g };
      });
      if (ingredients.length === 0) throw new Error("ingredients");
      return await api.adminSaveRecipe({
        token,
        id: recipeId ?? undefined,
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category as "breakfast" | "lunch" | "dinner" | "snacks",
        dietFlag: form.dietFlag as "veg" | "vegan" | "eggetarian" | "non_veg",
        servings,
        prepMinutes: Math.round(prep),
        cookMinutes: cook == null ? null : Math.round(cook),
        steps: form.steps,
        budget: form.budget,
        ingredients,
      });
    },
    onSuccess: (res) => {
      if (!res.ok) {
        setError(res.error ?? "Could not save.");
        return;
      }
      onSaved();
    },
    onError: (e) =>
      setError(
        e instanceof Error && e.message === "ingredients"
          ? "Add at least one ingredient."
          : e instanceof Error && e.message === "local"
            ? "Servings, times and ingredient grams must be numbers."
            : "Could not reach the server.",
      ),
  });

  if (recipeId != null && (detail.isPending || !form)) {
    return (
      <div className="mt-4">
        <ListSkeleton rows={4} />
      </div>
    );
  }
  if (!form) return null;
  const set = (patch: Partial<AdminRecipeForm>) =>
    setForm((f) => (f ? { ...f, ...patch } : f));
  const foodOptions = catalogue.data?.foods ?? [];

  return (
    <form
      className="mt-4 rounded-[10px] border border-[var(--border-strong)] bg-[var(--surface)] p-4"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        save.mutate();
      }}
    >
      <h3 className="font-display text-xl">
        {recipeId ? `Edit ${form.name}` : "New library recipe"}
      </h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Name">
          <input
            className={inputCls}
            value={form.name}
            onChange={(e) => set({ name: e.target.value })}
            required
          />
        </Field>
        <Field label="Category">
          <select
            className={inputCls}
            value={form.category}
            onChange={(e) => set({ category: e.target.value })}
            aria-label="Category"
          >
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snacks">Snacks</option>
          </select>
        </Field>
        <Field label="Diet type">
          <select
            className={inputCls}
            value={form.dietFlag}
            onChange={(e) => set({ dietFlag: e.target.value })}
            aria-label="Diet type"
          >
            {Object.entries(DIET_FLAG_LABELS).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Description">
          <input
            className={inputCls}
            value={form.description}
            onChange={(e) => set({ description: e.target.value })}
          />
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Servings">
            <input
              className={inputCls}
              type="number"
              min="0.5"
              step="0.5"
              value={form.servings}
              onChange={(e) => set({ servings: e.target.value })}
              required
            />
          </Field>
          <Field label="Prep (min)">
            <input
              className={inputCls}
              type="number"
              min="0"
              value={form.prepMinutes}
              onChange={(e) => set({ prepMinutes: e.target.value })}
              required
            />
          </Field>
          <Field label="Cook (min)">
            <input
              className={inputCls}
              type="number"
              min="0"
              value={form.cookMinutes}
              onChange={(e) => set({ cookMinutes: e.target.value })}
            />
          </Field>
        </div>
        <div className="flex items-end pb-1">
          <Toggle
            label="Budget recipe"
            checked={form.budget}
            onChange={(v) => set({ budget: v })}
          />
        </div>
      </div>

      <div className="mt-5">
        <p className="kicker text-[var(--dim)]">Ingredients</p>
        <p className="mt-1 text-xs text-[var(--faint)]">
          Nutrition is calculated from these catalogue foods — pick the
          exact food and its grams for the whole recipe.
        </p>
        <ul className="mt-3 space-y-2">
          {form.ingredients.map((ing, idx) => (
            <li key={idx} className="flex items-center gap-2">
              <select
                className={`${inputCls} min-w-0 flex-1`}
                value={ing.foodId}
                onChange={(e) =>
                  set({
                    ingredients: form.ingredients.map((x, i) =>
                      i === idx
                        ? { ...x, foodId: Number(e.target.value) }
                        : x,
                    ),
                  })
                }
                aria-label={`Ingredient ${idx + 1} food`}
              >
                {foodOptions.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
              <input
                className={`${inputCls} w-24 shrink-0`}
                type="number"
                min="1"
                value={ing.quantityGrams}
                onChange={(e) =>
                  set({
                    ingredients: form.ingredients.map((x, i) =>
                      i === idx
                        ? { ...x, quantityGrams: e.target.value }
                        : x,
                    ),
                  })
                }
                aria-label={`Ingredient ${idx + 1} grams`}
              />
              <span className="shrink-0 text-xs text-[var(--faint)]">g</span>
              <button
                type="button"
                className="shrink-0 rounded-[6px] border border-[var(--border-strong)] px-2.5 py-2 text-xs font-bold text-[var(--accent-text)]"
                onClick={() =>
                  set({
                    ingredients: form.ingredients.filter((_, i) => i !== idx),
                  })
                }
                aria-label={`Remove ingredient ${idx + 1}`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className={`${btnGhost} mt-3`}
          disabled={foodOptions.length === 0}
          onClick={() => {
            const first = foodOptions[0];
            if (!first) return;
            set({
              ingredients: [
                ...form.ingredients,
                { foodId: first.id, quantityGrams: "100" },
              ],
            });
          }}
        >
          {I.plus} Add ingredient
        </button>
      </div>

      <div className="mt-5">
        <Field label="Steps" hint="One step per line.">
          <textarea
            className={`${inputCls} min-h-28`}
            value={form.steps}
            onChange={(e) => set({ steps: e.target.value })}
          />
        </Field>
      </div>
      <div className="mt-4">
        <ErrorBox message={error} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="submit" className={btnPrimary} disabled={save.isPending}>
          {save.isPending ? "Saving…" : "Save recipe"}
        </button>
        <button type="button" className={btnGhost} onClick={onClose}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function AdminAudit({ token }: { token: string }) {
  const audit = useQuery({
    queryKey: ["adminAudit", token],
    queryFn: () => api.adminListAudit({ token, limit: 50 }),
  });
  return (
    <div>
      <p className="max-w-lg text-sm text-[var(--dim)]">
        Every administrative change to shared content, newest first —
        who made it, when, and what changed.
      </p>
      {audit.isPending ? (
        <div className="mt-4">
          <ListSkeleton rows={5} />
        </div>
      ) : audit.data && audit.data.entries.length > 0 ? (
        <ul className="mt-4 divide-y divide-[var(--border)]">
          {audit.data.entries.map((e) => (
            <li key={e.id} className="py-3">
              <p className="text-sm leading-relaxed">{e.summary}</p>
              <p className="mt-0.5 text-xs text-[var(--faint)]">
                {e.action} · {e.adminEmail} ·{" "}
                {new Date(e.createdAt).toLocaleString("en-IN")}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-[var(--dim)]">
          No administrative changes recorded yet.
        </p>
      )}
    </div>
  );
}

function BuildStatus() {
  return (
    <div>
      <h2 className="font-display text-4xl leading-none sm:text-5xl">
        Build status
      </h2>
      <p className="mt-2 max-w-lg text-sm text-[var(--dim)]">
        What's actually built, what's next, and what's blocked — nothing
        listed as done until it works in this app.
      </p>

      <div className="mt-8">
        <StatusList
          title="Live — Phase 6 · End-to-end testing & production readiness (2026-11-17)"
          tone="ok"
          items={[
            "Full end-to-end suite run against the finished app — every journey below was executed for real (server actions plus live UI drives at 390 px and 1,440 px), with arithmetic hand-checked throughout. Auth: signup, duplicate-email refusal, wrong-password refusal, login/logout, session persistence across reload, log-out-other-sessions killing only the other token, and password change (old password dead, new one works). The expired-session path is enforced in code (expired tokens are deleted and refused); it was verified by code inspection because a live test would need a 30-day-old token.",
            "Onboarding math hand-checked for male and female profiles across every goal: male BMR 1,640 / TDEE 2,542 → gain 2,842, maintenance 2,542, fat loss 2,092, strength 2,742; female BMR 1,345 / TDEE 1,850 → fat loss 1,400 (safety floor applied), maintenance 1,850 — every macro split matched to the gram. A manual override of 2,000 kcal produced the exact manual split and was respected identically on the dashboard, in the diary and in Progress.",
            "Food & diary: alias search ('golgappa' → Pani Puri) and the high-protein filter verified; 150 g paneer = 397.5 kcal by grams and 2 rotis = 178.2 kcal by servings; duplicate submissions returned the existing entry; copy-yesterday copied once and refused into a non-empty day; diary totals equalled dashboard totals exactly (575.7, then 559.6 kcal after a recipe serving). Snapshot integrity proven live: an admin edited Paneer 265 → 300 kcal, Food Search showed 300 immediately, and an existing diary entry still read exactly 265 kcal.",
            "Workouts: template copy with edited targets (bench arrived with 3 sets, not 4), full routine CRUD, live session with add/edit/delete sets, substitute (original marked skipped, replacement inserted), skip, resume-instead-of-duplicate, and an in-progress session invisible to history and records. Finish produced exactly 1,320 kg volume (60 × 8/8/6), the bench record read 60 kg × 8 with Epley estimate 76 kg, and progression matched. Discarding a session left no trace.",
            "Water, recipes, challenges, progress: 250 + 500 ml = 750 ml, edit/delete/target all exact and identical on dashboard and Progress; two recipes (Besan Chilla, Khichdi with Kadhi) recomputed by hand from their ingredients to the decimal; a recipe serving raised the diary by exactly its per-serving values; a user recipe computed 282.5 kcal / 20 g protein with its diet flag derived; challenges from both templates plus a custom one — 4 hand ticks = 100% and a 1-day streak, pause refused ticking with a clear message, restart cleared checks and kept tasks; Progress showed only real logged days at 7 and 30 days (the 90/180/365 ranges share the same windowing code and their controls render), with macro averages over logged days only.",
            "Two-user isolation suite: a second account attacked the first account's diary entries, routines, sessions, sets, water, measurements, recipes, meal plan and challenges by direct ID calls — every read, edit and delete was refused by the server ('not found'), the second account's own views stayed empty, it could not even log the first account's custom food, and the first account's data was verified untouched afterwards.",
            "Admin & privacy: non-admins refused by every admin action; the first-admin claim worked once and was closed for the second user; delete guards refused a food used in recipes and an exercise used in history, with reasons; the audit log recorded the claim and every edit; the custom-food review list carries no owner identity. A data-rich export contained all 14 sections with real rows. Account deletion removed exactly that user's contributions from every aggregate (users 5→4, diary 4→3, water 2→1, custom foods 2→1) and left everyone else untouched.",
            "Two real bugs were found by the suite and fixed. (1) Finishing a workout rewrote the session's notes from a value loaded when the finish began, so a note saved moments earlier could be lost — the finish action now only writes notes it was actually given; re-verified (the note survives and is returned). (2) In the live workout screen, a set's value auto-save (on blur) carried the done state it had when typing started, so tapping the done tick right after typing could be undone by the slower save landing last — value saves no longer send the done state at all; only the tick sends it. Re-verified live: the set stays done at 480 kg volume, and editing the load afterwards (132 lb) updates the volume to exactly 1,056 lb without un-marking the set.",
            "Live UI drives: signup → all four onboarding steps → dashboard read exactly 2,887 kcal; the rest timer counted down in real time (2:00 → 1:35), +30 s added exactly 30 (→ 2:03), and the finished state showed the green REST DONE banner (the timer has no pause button by design — the spec's pause/restart applies to challenges, which implement both); imperial units converted both ways (132 lb entered → stored in kg → 1,056 lb volume; records showed 132.3 lb × 8 with Epley 167.6 lb); keyboard pass — the skip link is the first Tab stop and clearly visible, Escape closes the More panel; no console errors and no horizontal overflow on any page at either width; paged lists still capped (food search offset 140 returned the last 3 of 143 with the total).",
            "Production readiness: FITIND is complete and verified inside this platform. Public deployment is a separate step (see the Deployment list below) — it needs the owner's own hosting account and a small port of the platform layer; nothing about it is faked or half-connected here.",
          ]}
        />

        <StatusList
          title="Fix — landing band overlap (2026-11-17)"
          tone="ok"
          items={[
            "Bug reported from a phone screenshot: in the near-black TRACK. band, the 'Track progress →' link rendered on top of the giant heading, across the K and the full stop. Root cause: each band laid its heading and CTA in a single flex row — on a phone-width screen the heading's minimum size plus the non-shrinking CTA were wider than the row, so the CTA painted over the heading's overflow.",
            "Fix: the three bands (TRAIN. / EAT. / TRACK.) now stack on phones — heading first, CTA below it in normal document flow with clear spacing — and only sit in one row from the sm breakpoint up, where they always fit. Flipped bands right-align their stack on phones and mirror the row on larger screens, keeping the alternating rhythm. The EAT. pill's hover scale transform was also removed, so no transform can move a CTA over a heading at any width.",
            "Whole landing re-checked at 390 px (phone) and 1,440 px (desktop): hero wordmark and rotating line, ticker, top bar, all three bands with their 01/02/03 numerals, and the closing 'Your first week starts here.' section — no overlap or clipping anywhere; no colours, copy, features or data changed.",
          ]}
        />

        <StatusList
          title="Design — Redesign 4 (2026-11-17)"
          tone="ok"
          items={[
            "Palette reverted to the first design's basics at the user's request — the plum scheme is removed everywhere (landing, login/signup, onboarding, dashboard, every inside page and the admin area): warm cream #EBE9E1 canvas, near-black ink #16140F text, vivid red-orange #E43D12 accent, a near-black sidebar against the cream content, and the small palette accents #D6536D / #FFA286 / #EFB11D back where the first design used them (macro bars, small highlights). Flat colours only, still zero images anywhere.",
            "Landing writing removed: no paragraph or descriptive text anywhere on the first page. What remains is the top bar (wordmark, Train/Eat/Track links, Join free), the giant FITIND. / TRAIN. / EAT. / TRACK. headings, the rotating hero line, the heavy-word ticker and the CTA buttons/links. The band description lines and the 'How it works' section are deleted.",
            "First page made more attractive with craft instead of copy: a larger wordmark with a gently pulsing accent dot, the rotating line set bigger with an accent square marker, a near-black ticker band, and the three bands as flat colour steps — peach with ink type, red-orange with cream type and a near-black pill CTA, near-black with cream type and a peach CTA — with oversized index numerals, alternating alignment and generous spacing.",
            "Login and signup: split screen again with the first design's red-orange type panel (stacked Train. / Eat. / Track. in cream and ink) beside the clean form. Onboarding tiles keep their red-orange selected states on cream.",
            "Contrast re-measured numerically on the restored palette (WCAG relative-luminance formula): ink on cream 15.1:1, secondary text 6.6:1, faintest text 5.6:1 on cream and 4.9:1 on the deepest cream step. The pure #E43D12 (3.5:1 on cream) is kept for large display type, the calorie ring, bars and graphics; small accent-coloured text uses a deepened red-orange #AE2C07 (5.5:1 on cream); filled buttons use #C9330A so white button text measures 5.3:1; the rest-timer done banner is white on deep green (6.3:1); sidebar text steps on near-black measure 16.3 / 9.2 / 5.9:1.",
            "All Phase 1–5 behaviour, calculations and data are unchanged — this was a palette revert plus landing copy removal only, and the full flow was re-verified live afterwards (see Tests).",
          ]}
        />

        <StatusList
          title="Design — Redesign 3 (2026-11-17, superseded)"
          tone="dim"
          items={[
            "Back to the first design's language — editorial, type-led, no photographs anywhere — in the flat plum palette the user picked: deep plum base #2D142C, plum surfaces #510A32, burgundy #801336, deep red #C72C41 and coral #EE4540 as the primary accent. Flat colours only, no gradients. (The photo-led Redesign 2 direction was dropped at the user's request before it settled.) Superseded by Redesign 4 above — the user rejected the plum landing and asked for the basic palette back.",
            "Landing: minimal top bar, a giant heavy FITIND wordmark rising in on load, the rotating Train smart / Eat right / Track everything line, a slow heavy-word ticker on a plum band, then TRAIN / EAT / TRACK as three flat tonal-step bands with one short line and one link each. Motion stops for reduced-motion settings.",
            "Login and signup: split screen — a flat plum type panel (stacked Train / Eat / Track in the palette steps) beside a clean form. Onboarding keeps its steps and selectable tiles, now with coral selected states on plum.",
            "Interior restyled for clarity: plum sidebar on desktop, plum top bar and bottom nav on mobile, tonal-step cards with one clear focus per page, coral primary buttons, macro bars in the palette steps (protein coral, carbs deep red, fat a light burgundy tint), water and charts in the red steps, and tap targets of at least 44 px. Short labels only — no paragraphs, no phase badges.",
            "All Phase 1–4 behaviour, calculations and data are unchanged — this was a look-and-usability pass only, and the full flow was re-verified live afterwards (see Tests).",
          ]}
        />

        <StatusList
          title="Design — Redesign 2 (2026-11-17, superseded)"
          tone="dim"
          items={[
            "A clean light, photo-led direction (white surfaces, stock photo panels on the landing and login) shipped briefly and was then replaced the same day at the user's request — he preferred the first design's type-led look with no pictures. Superseded by Redesign 3 above; no behaviour or data changed in either pass.",
          ]}
        />

        <StatusList
          title="Live — Phase 1"
          tone="ok"
          items={[
            "Real accounts: email + password signup, login, logout. Passwords stored as PBKDF2-SHA256 hashes with per-user salts; sessions are hashed tokens, 30-day expiry, checked on the server for every action.",
            "Onboarding: 4 steps — about you, body & goal, training, food & units. Every field optional except name, all editable later in Settings.",
            "Calorie & macro targets: Mifflin–St Jeor BMR × activity (TDEE) with a goal adjustment and safety floor, from your saved profile, labelled as estimates. A manual override always wins.",
            "Weight logging: add and delete dated entries; your profile weight follows your latest log; distance to your goal weight comes from your real data.",
            "Dashboard reads only your own records, with honest empty states — no sample numbers anywhere.",
            "Data rights: export everything as JSON, change password (signs out other sessions), delete account with password confirmation.",
            "Per-user isolation: every action resolves your session and filters by your account — one user cannot read or modify another's records.",
            "Full UI redesign (2026-11-16): bold editorial print identity — warm cream canvas, vivid red-orange, oversized Archivo Black type (a giant FITIND wordmark is the landing hero), color-block statement sections, split-screen login with a red-orange type panel, near-black sidebar against cream content, calorie-ring dashboard with palette macro bars (red-orange / amber / rose) and a weight-trend sparkline, tile-based onboarding and settings. No phase badges or build narration on user-facing pages. All Phase 1 behaviour preserved; the end-to-end flow was re-verified live after the redesign (see Tests). Superseded by Redesign 3 (2026-11-17) — see the Design list above.",
          ]}
        />

        <StatusList
          title="Live — Phase 2 · Food"
          tone="ok"
          items={[
            "Indian food catalogue: 140+ foods across breakfast, breads & rice, dals, sabzis, South Indian, street food, dairy & eggs, meat & fish, fruits, vegetables, nuts & seeds, sweets, drinks and raw ingredients — each with kcal, protein, carbs, fat and fibre per 100 g, a household serving (1 roti = 30 g, 1 katori = 150 g…), local names for search, and a veg / vegan / eggetarian / non-veg flag.",
            "Honest values: every catalogue value is a standard reference estimate (IFCT-style), labelled 'Estimate' in the app with a note that home preparation varies. Nothing is presented as lab-verified. Raw vs cooked is separated where it matters (rice, dals, chana, soya).",
            "Food Search: debounced search by name or local name (try 'golgappa'), filters for category, cuisine and diet type, a high-protein filter, and sorting by protein or calories. Favourites (star) and recently logged foods come from your real history.",
            "Food Diary: breakfast, lunch, evening snacks, dinner and custom meals per day, with date navigation and copy-yesterday. Add by servings or grams; entries store a snapshot of the values at logging time, so totals never change retroactively. Quantities are editable, entries removable, and duplicate submissions are blocked by a per-add key.",
            "Custom foods: add your own with per-100 g values — marked as yours, visible only to you.",
            "Dashboard now runs on the diary: today's eaten calories and macros come from your real entries, remaining = target − eaten, the ring and macro bars fill from what you logged, and BMI is shown from your height and weight with a plain note that it is a rough screening measure.",
            "Landing motion: the hero line cycles Train smart / Eat right / Track everything over a slow word ticker, recoloured to the plum palette in Redesign 3 and back to the basic palette in Redesign 4 (both 2026-11-17), and still disabled for reduced-motion settings.",
          ]}
        />

        <StatusList
          title="Live — Phase 3 · Workouts"
          tone="ok"
          items={[
            "Exercise library: 61 exercises across chest, back, shoulders, biceps, triceps, legs, glutes, core and full body — each with primary and secondary muscles, equipment, difficulty, movement pattern, written form cues, common mistakes, suggested sets/reps and rest. Searchable and filterable by muscle, equipment and level. Text only: no exercise images or videos are licensed, so none are shown.",
            "Templates: Push / Pull / Legs, Upper / Lower, Full Body, three Bro Split days and a bodyweight Home session. Copy any template into your own routines, then edit it freely — rename, reorder, change target sets/reps/rest per exercise, add or remove exercises. Custom routines from scratch, duplicate and delete included. Routines are private to your account.",
            "Live workout: start from a routine or blank, log sets with reps and load (kg or lb, following your unit setting), bodyweight and timed exercises supported. Big tap targets for marking sets done, add/remove sets, skip or substitute an exercise (the original is marked skipped and its sets stop counting), session notes, and a rest timer that counts down, can add 30 seconds, and shows a clear finished state.",
            "An unfinished workout is never counted as history: it stays resumable until you finish or discard it. Finishing stamps the duration and saves every set.",
            "History & records: every finished workout with date, duration, exercises, sets and total volume, plus a full detail view. Personal records are computed only from your completed sets — heaviest load, best reps, longest hold, and an estimated 1RM labelled with its formula (Epley: load × (1 + reps ÷ 30)). Per-exercise progression shows your best set and volume session by session, with a load line when you have two or more sessions.",
            "Dashboard training summary is real now: workouts this week, day streak, total workouts, last workout and latest records all come from your finished sessions, with a Start workout button and a resume banner when a session is in progress.",
          ]}
        />

        <StatusList
          title="Live — Phase 4 · Progress, water, recipes, challenges"
          tone="ok"
          items={[
            "Progress: charts drawn only from your real records — weight points, daily calories with your target line, macro averages over the days you actually logged, workout frequency, personal records, hydration and challenge consistency. Ranges: 7 days to 1 year. Days with nothing logged stay blank; nothing is interpolated or filled in.",
            "Body measurements: waist, chest, arm, thigh, hip and neck — all optional, one entry per date, in your units (cm or inches), with history and delete.",
            "Water: quick-add 250 ml / 500 ml or any amount, editable and deletable entries, last-7-days view, and your own daily target. The 2,500 ml shown before you set one is a suggestion, labelled as such — no universal target is claimed. Your dashboard shows today's real total.",
            "Recipes: 26 Indian recipes (veg, vegan, eggetarian, non-veg; breakfast to snacks; budget and high-protein tags). Per-serving nutrition is calculated live from the catalogue values of each recipe's ingredients — the method is stated on every recipe. Save favourites, scale servings (ingredient amounts rescale), and log a serving straight into your food diary as a real snapshot entry.",
            "Your own recipes: create and edit private recipes from catalogue ingredients; their diet flag and nutrition are derived exactly like the library's. Nobody else can see them.",
            "Meal plan: assign recipes to weekdays and meals, see the week's calories per serving, and log a planned serving into today's diary in one tap.",
            "Challenges: a 30-day Reset and a 75-day Strong template, plus custom challenges with your own name, length and daily tasks. Tasks are ticked by you, by hand — nothing is ever auto-completed. Day notes, progress %, full-day streaks, a day grid that stays editable for past days, pause and restart. Missed days are shown plainly, never with shaming language.",
            "Data rights extended: export and account deletion now cover measurements, water, your recipes, meal plan and challenges too.",
          ]}
        />

        <StatusList
          title="Live — Phase 5 · Admin, privacy, accessibility, performance"
          tone="ok"
          items={[
            "Admin area (server-protected): admin status lives only in a dedicated roles table — it is never a profile or settings field, and every admin action re-checks the role on the server; a signed-in non-admin is refused by the server, not just hidden from the menu. The Admin section appears in navigation only for admins.",
            "First-admin setup: while no admin exists, a one-time claim card appears in Profile & settings so the site owner can claim admin for their own account. The claim closes permanently the moment any admin exists, and the claim itself is audit-logged. There is no other in-app way to grant admin.",
            "Admin overview shows aggregate totals only — users, catalogue and custom foods, exercises, recipes, diary entries, workouts, water, challenges. No individual user's private data is listed anywhere in admin.",
            "Content management: create, edit and delete shared foods (with source and estimate/verified fields), exercises and library recipes (ingredients picked from the catalogue, so recipe nutrition stays calculated, never typed in). A catalogue food used by a recipe, and an exercise used in routines or history, cannot be deleted — the refusal says why.",
            "Custom-food review: foods users created for themselves are listed for quality review with no owner identity attached; an admin can remove one, but editing a user's own food stays with its owner.",
            "Audit log: every admin change — food, exercise and recipe creates, edits and deletes, and the first-admin claim — is recorded with who, when and what, and is viewable in the admin area.",
            "Complete data export: the JSON download now covers everything — profile, goals, preferences, weight logs, measurements, the full diary (with servings), your custom foods, favourite foods and recipes, routines, workout sessions with every set, water entries, your recipes with ingredients and steps, the meal plan, and challenges with every task check and day note.",
            "Sessions in Settings: see every active sign-in with its recorded device and sign-in time, and log out all other sessions in one tap. Changing your password already signed out other sessions; now you can do it without changing the password.",
            "Account deletion verified to cascade to every table, including the admin role if the account held one; the audit log keeps only the admin's email snapshot as the record of changes to shared content.",
            "Accessibility pass: skip-to-main-content link on every screen, error messages announced (role=alert), the rest timer announces when rest finishes, charts keep their text summaries, the mobile More panel closes with Escape, and a contrast pass on the plum palette — the faintest text tint was lightened until it clears WCAG AA on every plum surface, filled buttons moved to a deepened coral so white button text clears AA, and the rest-done banner now uses dark text on green. Focus outlines and reduced-motion support were already in place and were re-checked. (Redesign 4 later reverted the palette to the first design's basics and re-ran the same numeric contrast pass on it — see Design — Redesign 4; the rest-done banner is now white on deep green.)",
            "Performance pass: food search, the exercise library, admin lists and workout history are paged with load-more instead of rendering everything; loading skeletons replace bare 'Loading…' text on the main lists; dashboard and progress numbers are aggregated on the server; frequent lookups (diary, weight, water and workouts by user and date) are indexed; the landing still ships zero images.",
          ]}
        />

        <StatusList
          title="Next — deployment (separate step, not started)"
          tone="dim"
          items={[
            "Public deployment and a public code repository happen outside this app, under the project owner's own accounts: a hosting account (a host with a persistent disk, or Vercel + a Postgres database), a GitHub repository for the code, and a small port of this platform's action/database layer to a standalone server. FITIND itself is finished and verified — nothing in the app is waiting on code.",
          ]}
        />

        <StatusList
          title="Blocked — exact reasons"
          tone="bad"
          items={[
            "Granting admin to a second person: deliberately no in-app path after the first-admin claim closes — admin can never be granted from any user-facing screen. A second admin would need a database-level change by whoever operates this deployment.",
            "Email verification and password-reset emails: no email service is configured for FITIND. The app says so instead of pretending to send mail.",
            "Push notifications: no notification service is configured. Reminder preferences are saved and will apply when delivery exists.",
            "Progress photos: no private file storage is configured, so uploads aren't offered rather than stored insecurely.",
            "Spec stack (Next.js + Supabase + Vercel): no Supabase project or Vercel keys exist in this environment. FITIND runs on this platform's real frontend, server and database with the same guarantees; the data model maps cleanly to Postgres if those services are provided later.",
          ]}
        />

        <section className="border-t border-[var(--border)] py-6">
          <h3 className="kicker text-[var(--dim)]">Tests</h3>
          <p className="mt-3.5 max-w-2xl text-sm leading-relaxed text-[var(--dim)]">
            Phase 6 (2026-11-17) ran the full end-to-end suite described
            in the Phase 6 list above — every area of the app, a scripted
            two-user isolation suite, and live UI drives at phone and
            desktop widths; two real bugs were found, fixed and
            re-verified, and no failed test is marked as passed. The
            earlier phases were verified as they were built: Phase 1 was verified manually in
            the live app: signup → onboarding → dashboard, profile edits
            persisting across logout and login, weight logging, two-user
            data isolation, and session protection. After the UI redesign
            the full flow was driven again end-to-end in the live app —
            signup, all four onboarding steps, dashboard targets, weight
            logging, logout and re-login with data intact — and passed.
            Phase 2 was verified against the server with hand-checked
            arithmetic: 150 g paneer (397.5 kcal) + 2 rotis (178.2 kcal)
            gave diary and dashboard totals of exactly 575.7 kcal with
            matching macros; a quantity edit to 100 g gave exactly
            265 kcal; a duplicate submission was rejected; a second user
            saw an empty diary and none of the first user's custom foods.
            Phase 3 was verified the same way: the Push template was
            copied and edited, a session logged bench press at 60 kg × 8,
            8 and 6 — while in progress it appeared in neither history
            nor records; after finishing, history showed exactly
            1,320 kg of volume, the bench record read 60 kg × 8 with an
            Epley estimate of 76 kg, the dashboard showed 1 workout this
            week and a 1-day streak, a substitute correctly marked the
            original exercise skipped, a discarded session vanished, and
            a second user's routines, history and records stayed empty
            with no access to the first user's data. The full flow was
            then driven in the live UI, including the rest timer.
            Phase 4 was verified against the server with hand-checked
            arithmetic: the Besan Chilla recipe's per-serving values were
            recomputed by hand from its ingredients' catalogue values
            and matched; logging one serving raised the day's diary
            total by exactly that serving's values; 250 ml + 500 ml of
            water totalled 750 ml in the day view and on the dashboard;
            a 30-day challenge ticked fully on day one read 100% with a
            1-day streak; and a second user's progress, water, recipes
            and challenges stayed empty throughout. Redesign 2
            (2026-11-17) changed look and layout only; afterwards the
            server flow was re-run end to end — signup, onboarding
            (targets again exactly 2,842 kcal), 150 g paneer logged at
            397.5 kcal on the dashboard, a Push session finished at
            exactly 1,320 kg volume with the 60 kg × 8 bench record,
            progress showing only the logged day, logout and re-login
            with everything intact, and a second user again fully
            isolated — and the new landing, login, dashboard and diary
            were inspected on desktop and phone screenshots.
            Redesign 3 (2026-11-17) also changed look only — the flat
            plum palette, no photographs — and the full flow was then
            driven live in the new UI: a fresh signup completed all
            four onboarding steps, 150 g of paneer logged 398 kcal in
            the diary and on the dashboard ring (2,490 kcal remaining
            of a 2,887 kcal target), 250 ml of water logged from the
            dashboard, a bench-press set of 60 kg × 8 finished a
            workout at exactly 480 kg of volume, Progress showed only
            the logged day with matching macro averages, and a second
            user again saw a completely empty diary and dashboard.
            Landing, login, onboarding, dashboard, diary, live workout
            and progress were inspected on phone and desktop
            screenshots in the new palette, with no console errors and
            no mobile overflow. Phase 5 was verified against the
            server: a non-admin was refused by every admin action; the
            one-time first-admin claim worked once and then closed for
            a second user; an admin edit of Paneer (265 → 300 kcal)
            appeared in another user's Food Search and in the audit
            log, and was restored; delete guards refused a food used
            in recipes and an exercise used in history, with reasons;
            a data-rich user's export contained every section,
            including challenge checks with dates and day notes; two
            real sessions were listed with their device strings and
            logging out the other session killed only that token; a
            deleted test account's rows vanished from every aggregate
            while another user's data stayed intact; and the full
            Phase 1–4 regression (targets 2,842 kcal, diary totals,
            480 kg workout volume, records) passed unchanged.
            Redesign 4 (2026-11-17) reverted the palette to the first
            design's basics and removed all landing paragraph text;
            afterwards the full flow was driven live again in the new
            look — a fresh signup completed all four onboarding steps
            (dashboard target again exactly 2,887 kcal), 150 g of
            paneer logged 398 kcal in the diary and on the dashboard
            ring (2,490 kcal remaining), a bench-press set of 60 kg × 8
            finished a workout at exactly 480 kg of volume, Progress
            showed only the logged day with matching macro averages, a
            signed-in non-admin saw no Admin section and was refused by
            the admin actions on the server, the one-time admin claim
            worked in the test sandbox and the admin area rendered in
            the basic palette, and the landing, login, onboarding,
            dashboard (mobile and desktop sidebar), diary, live
            workout, progress and admin screens were inspected on
            screenshots — no plum anywhere, zero images, no console
            errors and no mobile overflow. Two display bugs found
            during that drive (the sidebar wordmark inheriting ink on
            the near-black sidebar, and the login panel's scoped accent
            token overriding its own background) were fixed and
            re-verified on screenshots. Phase 6 then re-ran everything
            end to end on the finished app: the reference profile's
            targets were exact for both sexes and every goal; diary,
            dashboard and Progress totals agreed to the decimal; a
            finished Push session totalled exactly 1,320 kg with the
            60 kg × 8 bench record (Epley 76 kg); two recipes matched
            hand recomputation; a challenge read 100% from four hand
            ticks; twenty-plus cross-account ID attacks were all refused
            by the server; an admin's Paneer edit (265 → 300 kcal) left
            an old diary entry at exactly 265 kcal; a deleted account's
            rows vanished from every aggregate while other users were
            untouched; and the live UI drive covered signup →
            onboarding → a 2,887 kcal dashboard, the rest timer's full
            countdown to its REST DONE state, imperial conversion
            (132 lb → 1,056 lb volume), keyboard navigation and both
            viewport widths with no console errors. Details live in the
            project's BUILD_STATUS ledger.
          </p>
        </section>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------- app

type View =
  | "dashboard"
  | "diary"
  | "search"
  | "workouts"
  | "progress"
  | "recipes"
  | "challenges"
  | "profile"
  | "status"
  | "admin"
  | "onboarding";

const NAV: { key: View; label: string; icon: ReactNode }[] = [
  { key: "dashboard", label: "Dashboard", icon: I.home },
  { key: "diary", label: "Food Diary", icon: I.diary },
  { key: "search", label: "Food Search", icon: I.search },
  { key: "workouts", label: "Workouts", icon: I.dumbbell },
  { key: "progress", label: "Progress", icon: I.chart },
  { key: "recipes", label: "Recipes", icon: I.utensils },
  { key: "challenges", label: "Challenges", icon: I.trophy },
  { key: "profile", label: "Profile", icon: I.user },
];

const STATUS_ITEM: { key: View; label: string; icon: ReactNode } = {
  key: "status",
  label: "Build Status",
  icon: I.info,
};

/* Shown only when the server reports this user holds an admin role —
   and every admin action re-checks the role on the server anyway. */
const ADMIN_ITEM: { key: View; label: string; icon: ReactNode } = {
  key: "admin",
  label: "Admin",
  icon: I.shield,
};

const MOBILE_MAIN: View[] = ["dashboard", "diary", "workouts", "progress", "profile"];
const MOBILE_MORE: View[] = ["search", "recipes", "challenges", "status"];

export function App() {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(() => {
    try {
      return window.localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  });
  const [authScreen, setAuthScreen] = useState<"landing" | "login" | "signup">(
    "landing",
  );
  // Set when a signed-out visitor taps the header search icon: after
  // login they land on Food Search, not the dashboard.
  const [pendingView, setPendingView] = useState<View | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [view, setView] = useState<View>("dashboard");
  const [moreOpen, setMoreOpen] = useState(false);

  const session = useQuery({
    queryKey: ["session", token],
    queryFn: () => api.getSession({ token: token ?? "" }),
    enabled: token != null,
    retry: false,
  });

  useEffect(() => {
    if (token && session.data && !session.data.authenticated) {
      try {
        window.localStorage.removeItem(TOKEN_KEY);
      } catch {
        /* ignore */
      }
      setToken(null);
      setNotice(
        session.data.expired
          ? "Your session expired after 30 days. Please log in again — your data is saved."
          : null,
      );
      setAuthScreen("login");
    }
  }, [token, session.data]);

  // Escape closes the mobile "More" panel.
  useEffect(() => {
    if (!moreOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMoreOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [moreOpen]);

  const clearSession = () => {
    try {
      window.localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
    setToken(null);
    setView("dashboard");
    queryClient.clear();
  };

  const logout = useMutation({
    mutationFn: async () => (token ? await api.logout({ token }) : null),
    onSettled: () => {
      clearSession();
      setAuthScreen("landing");
    },
  });

  const handleAuthDone = (newToken: string, profile: Profile) => {
    try {
      window.localStorage.setItem(TOKEN_KEY, newToken);
    } catch {
      /* ignore */
    }
    setToken(newToken);
    setNotice(null);
    if (authScreen === "signup" && !profile.onboardingCompleted) {
      setPendingView(null);
      setView("onboarding");
    } else if (pendingView) {
      setView(pendingView);
      setPendingView(null);
    } else {
      setView("dashboard");
    }
  };

  // ---------------------------------------------------------- signed out
  if (!token) {
    return (
      <div className="min-h-screen bg-[var(--bg)]">
        <SafeAreaTopScrim backgroundColor="var(--bg)" />
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        <main id="main-content" tabIndex={-1} className="outline-none">
        {authScreen === "landing" ? (
          <Landing
            onLogin={() => setAuthScreen("login")}
            onSignup={() => setAuthScreen("signup")}
            onSearch={() => {
              setPendingView("search");
              setAuthScreen("login");
            }}
          />
        ) : (
          <AuthForm
            mode={authScreen}
            notice={notice}
            onDone={handleAuthDone}
            onSwitch={() =>
              setAuthScreen(authScreen === "login" ? "signup" : "login")
            }
            onBack={() => {
              setPendingView(null);
              setAuthScreen("landing");
            }}
          />
        )}
        </main>
      </div>
    );
  }

  // ------------------------------------------------------- session check
  if (session.isPending || !session.data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4">
        <div className="text-center">
          <Wordmark size="text-3xl" />
          <p className="mt-3 text-sm text-[var(--dim)]">
            {session.isError ? "Could not reach the server." : "Loading…"}
          </p>
          {session.isError ? (
            <div className="mt-4 flex justify-center gap-2">
              <button
                type="button"
                className={btnPrimary}
                onClick={() => void session.refetch()}
              >
                Retry
              </button>
              <button type="button" className={btnGhost} onClick={clearSession}>
                Log out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  const profile = session.data.profile;
  if (!session.data.authenticated || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
        <p className="text-sm text-[var(--dim)]">Signing you out…</p>
      </div>
    );
  }

  // ------------------------------------------------------------ onboarding
  if (view === "onboarding") {
    return (
      <div className="min-h-screen bg-[var(--bg)]">
        <SafeAreaTopScrim backgroundColor="var(--bg)" />
        <Onboarding
          token={token}
          profile={profile}
          onFinished={() => setView("dashboard")}
          onSkip={() => setView("dashboard")}
        />
      </div>
    );
  }

  // ---------------------------------------------------------------- shell
  const goView = (v: View) => {
    setView(v);
    setMoreOpen(false);
  };

  const isAdminUser = session.data.isAdmin;
  const navItems = isAdminUser ? [...NAV, ADMIN_ITEM] : NAV;
  const mobileMore: View[] = isAdminUser
    ? [...MOBILE_MORE, "admin"]
    : MOBILE_MORE;

  const sideItem = (item: { key: View; label: string; icon: ReactNode }) => {
    const active = view === item.key;
    return (
      <button
        key={item.key}
        type="button"
        onClick={() => goView(item.key)}
        aria-current={active ? "page" : undefined}
        className={`relative flex w-full items-center gap-3 rounded-[8px] px-3 py-2.5 text-sm transition-colors duration-150 ${
          active
            ? "bg-[var(--surface-2)] font-bold text-[var(--text)]"
            : "font-medium text-[var(--dim)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
        }`}
      >
        {active ? (
          <span
            className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-[var(--accent)]"
            aria-hidden="true"
          />
        ) : null}
        <span className={active ? "text-[var(--accent-text)]" : undefined}>
          {item.icon}
        </span>
        {item.label}
      </button>
    );
  };

  const tabItem = (item: { key: View; label: string; icon: ReactNode }) => {
    const active = view === item.key;
    return (
      <button
        key={item.key}
        type="button"
        onClick={() => goView(item.key)}
        aria-current={active ? "page" : undefined}
        className={`relative flex flex-1 flex-col items-center gap-1 pb-2 pt-2.5 text-[11px] transition-colors ${
          active
            ? "font-bold text-[var(--text)]"
            : "font-medium text-[var(--faint)]"
        }`}
      >
        {active ? (
          <span
            className="absolute inset-x-6 top-0 h-[2px] rounded-full bg-[var(--accent)]"
            aria-hidden="true"
          />
        ) : null}
        <span className={active ? "text-[var(--accent-text)]" : undefined}>
          {item.icon}
        </span>
        {item.label}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      {/* Desktop sidebar — near-black panel against the cream content,
          as the first design had it. Scoped tokens give the sidebar
          its own light-on-black text steps; everything inside keeps
          using the shared var() classes. */}
      <aside
        className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-[var(--border)] bg-[#16140f] text-[#f4f1e8] lg:flex"
        style={
          {
            "--surface-2": "#262219",
            "--text": "#f4f1e8",
            "--dim": "#bdb7a6",
            "--faint": "#97917f",
            "--border": "#2c2921",
            "--accent-text": "#e43d12",
          } as CSSProperties
        }
      >
        <div className="px-6 pb-2 pt-7">
          <Wordmark size="text-[26px]" />
          <p className="mt-1.5 text-xs text-[var(--faint)]">
            Train Smart. Eat Right. Track Everything.
          </p>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-5" aria-label="Main">
          {navItems.map(sideItem)}
        </nav>
        <div className="border-t border-[var(--border)] px-3 py-4">
          <button
            type="button"
            onClick={() => goView("status")}
            aria-current={view === "status" ? "page" : undefined}
            className={`mb-3 inline-flex items-center gap-1.5 px-3 text-xs font-medium transition-colors ${
              view === "status"
                ? "text-[var(--text)]"
                : "text-[var(--faint)] hover:text-[var(--dim)]"
            }`}
          >
            {I.info} Build Status
          </button>
          <div className="px-3">
            <p className="truncate text-sm font-bold">{profile.displayName}</p>
            <p className="truncate text-xs text-[var(--faint)]">{profile.email}</p>
            <button
              type="button"
              className="mt-3 flex items-center gap-2 text-sm font-medium text-[var(--dim)] transition-colors hover:text-[var(--text)]"
              onClick={() => logout.mutate()}
            >
              {I.logout} Log out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-4 pb-2.5 pt-safe lg:hidden">
        <Wordmark size="text-xl" />
        <button
          type="button"
          className="flex items-center gap-1.5 py-1 text-sm font-medium text-[var(--dim)]"
          onClick={() => logout.mutate()}
          aria-label="Log out"
        >
          {I.logout} <span className="hidden sm:inline">Log out</span>
        </button>
      </header>

      <div className="lg:pl-64">
        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto w-full max-w-4xl px-4 py-6 pb-28 outline-none sm:px-6 lg:pb-12 lg:pt-8"
        >
          {view === "dashboard" ? (
            <Dashboard token={token} profile={profile} go={setView} />
          ) : view === "diary" ? (
            <FoodDiary token={token} />
          ) : view === "search" ? (
            <FoodSearch token={token} />
          ) : view === "workouts" ? (
            <Workouts token={token} profile={profile} />
          ) : view === "progress" ? (
            <Progress token={token} profile={profile} />
          ) : view === "recipes" ? (
            <Recipes token={token} />
          ) : view === "challenges" ? (
            <Challenges token={token} />
          ) : view === "profile" ? (
            <ProfileSettings
              token={token}
              profile={profile}
              onSignedOut={clearSession}
              adminClaimAvailable={session.data.adminClaimAvailable}
            />
          ) : view === "admin" ? (
            <AdminPanel token={token} />
          ) : (
            <BuildStatus />
          )}
        </main>
      </div>

      {/* Mobile "more" panel */}
      {moreOpen ? (
        <div
          className="fixed inset-x-0 bottom-[60px] z-30 border-t border-[var(--border)] bg-[var(--surface)] p-3 pb-safe lg:hidden"
          role="group"
          aria-label="More sections"
        >
          <div className="grid grid-cols-2 gap-2">
            {[...navItems, STATUS_ITEM]
              .filter((i) => mobileMore.includes(i.key))
              .map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className={`flex items-center gap-2.5 rounded-[6px] border px-3.5 py-3 text-sm font-medium ${
                    view === item.key
                      ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                      : "border-[var(--border)]"
                  }`}
                  onClick={() => goView(item.key)}
                >
                  {item.icon} {item.label}
                </button>
              ))}
          </div>
        </div>
      ) : null}

      {/* Mobile bottom nav */}
      <nav
        className="fixed inset-x-0 bottom-0 z-20 flex border-t border-[var(--border)] bg-[var(--surface)] pb-safe lg:hidden"
        aria-label="Main"
      >
        {NAV.filter((i) => MOBILE_MAIN.includes(i.key)).map(tabItem)}
        <button
          type="button"
          className={`relative flex flex-1 flex-col items-center gap-1 pb-2 pt-2.5 text-[11px] transition-colors ${
            moreOpen || mobileMore.includes(view)
              ? "font-bold text-[var(--text)]"
              : "font-medium text-[var(--faint)]"
          }`}
          onClick={() => setMoreOpen((o) => !o)}
          aria-expanded={moreOpen}
          aria-label="More sections"
        >
          {moreOpen || mobileMore.includes(view) ? (
            <span
              className="absolute inset-x-6 top-0 h-[2px] rounded-full bg-[var(--accent)]"
              aria-hidden="true"
            />
          ) : null}
          <Icon>
            <circle cx="5" cy="12" r="1" />
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
          </Icon>
          More
        </button>
      </nav>
    </div>
  );
}
