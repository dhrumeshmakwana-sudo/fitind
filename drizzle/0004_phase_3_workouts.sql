CREATE TABLE `exercises` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `name` text NOT NULL,
  `primary_muscle` text NOT NULL,
  `secondary_muscles` text DEFAULT '' NOT NULL,
  `equipment` text NOT NULL,
  `difficulty` text NOT NULL,
  `pattern` text NOT NULL,
  `kind` text DEFAULT 'weighted' NOT NULL,
  `instructions` text NOT NULL,
  `mistakes` text NOT NULL,
  `suggested_sets` integer NOT NULL,
  `suggested_reps` text NOT NULL,
  `rest_seconds` integer NOT NULL,
  `created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `exercises_name` ON `exercises` (`name`);
--> statement-breakpoint
CREATE TABLE `routines` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `user_id` integer NOT NULL REFERENCES `users`(`id`),
  `name` text NOT NULL,
  `notes` text,
  `source_template` text,
  `created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
  `updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `routine_exercises` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `routine_id` integer NOT NULL REFERENCES `routines`(`id`),
  `exercise_id` integer NOT NULL REFERENCES `exercises`(`id`),
  `position` integer NOT NULL,
  `target_sets` integer NOT NULL,
  `target_reps` text NOT NULL,
  `rest_seconds` integer NOT NULL,
  `notes` text
);
--> statement-breakpoint
CREATE TABLE `workout_sessions` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `user_id` integer NOT NULL REFERENCES `users`(`id`),
  `routine_id` integer REFERENCES `routines`(`id`),
  `title` text NOT NULL,
  `status` text DEFAULT 'in_progress' NOT NULL,
  `started_on` text NOT NULL,
  `started_at` integer NOT NULL,
  `ended_at` integer,
  `duration_seconds` integer,
  `notes` text,
  `created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `session_exercises` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `session_id` integer NOT NULL REFERENCES `workout_sessions`(`id`),
  `exercise_id` integer NOT NULL REFERENCES `exercises`(`id`),
  `position` integer NOT NULL,
  `exercise_name` text NOT NULL,
  `primary_muscle` text NOT NULL,
  `kind` text NOT NULL,
  `rest_seconds` integer NOT NULL,
  `skipped` integer DEFAULT 0 NOT NULL,
  `notes` text
);
--> statement-breakpoint
CREATE TABLE `workout_sets` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `session_exercise_id` integer NOT NULL REFERENCES `session_exercises`(`id`),
  `set_number` integer NOT NULL,
  `reps` integer,
  `load_kg` real,
  `duration_seconds` integer,
  `completed` integer DEFAULT 0 NOT NULL,
  `created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
