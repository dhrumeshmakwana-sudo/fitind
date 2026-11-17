CREATE TABLE `measurements` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `user_id` integer NOT NULL REFERENCES `users`(`id`),
  `logged_on` text NOT NULL,
  `waist_cm` real,
  `chest_cm` real,
  `arm_cm` real,
  `thigh_cm` real,
  `hip_cm` real,
  `neck_cm` real,
  `created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `water_entries` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `user_id` integer NOT NULL REFERENCES `users`(`id`),
  `logged_on` text NOT NULL,
  `amount_ml` integer NOT NULL,
  `client_key` text,
  `created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
ALTER TABLE `user_preferences` ADD COLUMN `water_target_ml` integer;
--> statement-breakpoint
CREATE TABLE `recipes` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `name` text NOT NULL,
  `description` text NOT NULL DEFAULT '',
  `category` text NOT NULL,
  `diet_flag` text NOT NULL,
  `servings` real NOT NULL,
  `prep_minutes` integer NOT NULL,
  `cook_minutes` integer,
  `steps` text NOT NULL DEFAULT '',
  `budget` integer DEFAULT 0 NOT NULL,
  `owner_user_id` integer REFERENCES `users`(`id`),
  `created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `recipe_ingredients` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `recipe_id` integer NOT NULL REFERENCES `recipes`(`id`),
  `food_id` integer REFERENCES `foods`(`id`),
  `name` text NOT NULL,
  `quantity_grams` real NOT NULL,
  `position` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `favourite_recipes` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `user_id` integer NOT NULL REFERENCES `users`(`id`),
  `recipe_id` integer NOT NULL REFERENCES `recipes`(`id`),
  `created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `meal_plan_entries` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `user_id` integer NOT NULL REFERENCES `users`(`id`),
  `weekday` integer NOT NULL,
  `meal` text NOT NULL,
  `recipe_id` integer NOT NULL REFERENCES `recipes`(`id`),
  `servings` real NOT NULL DEFAULT 1,
  `created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `challenges` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `user_id` integer NOT NULL REFERENCES `users`(`id`),
  `name` text NOT NULL,
  `template` text,
  `total_days` integer NOT NULL,
  `started_on` text NOT NULL,
  `status` text DEFAULT 'active' NOT NULL,
  `created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `challenge_tasks` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `challenge_id` integer NOT NULL REFERENCES `challenges`(`id`),
  `label` text NOT NULL,
  `position` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `challenge_checks` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `challenge_id` integer NOT NULL REFERENCES `challenges`(`id`),
  `task_id` integer NOT NULL REFERENCES `challenge_tasks`(`id`),
  `logged_on` text NOT NULL,
  `created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `challenge_day_notes` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `challenge_id` integer NOT NULL REFERENCES `challenges`(`id`),
  `logged_on` text NOT NULL,
  `note` text NOT NULL,
  `created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
