CREATE TABLE `foods` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `name` text NOT NULL,
  `aliases` text DEFAULT '' NOT NULL,
  `category` text NOT NULL,
  `cuisine` text NOT NULL,
  `diet_flag` text NOT NULL,
  `kcal_per100` real NOT NULL,
  `protein_per100` real NOT NULL,
  `carbs_per100` real NOT NULL,
  `fat_per100` real NOT NULL,
  `fibre_per100` real NOT NULL,
  `serving_name` text NOT NULL,
  `serving_grams` real NOT NULL,
  `source` text NOT NULL,
  `verification` text DEFAULT 'estimate' NOT NULL,
  `notes` text,
  `owner_user_id` integer REFERENCES `users`(`id`),
  `created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `diary_entries` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `user_id` integer NOT NULL REFERENCES `users`(`id`),
  `food_id` integer REFERENCES `foods`(`id`),
  `logged_on` text NOT NULL,
  `meal` text NOT NULL,
  `quantity_grams` real NOT NULL,
  `servings` real,
  `food_name` text NOT NULL,
  `kcal_per100` real NOT NULL,
  `protein_per100` real NOT NULL,
  `carbs_per100` real NOT NULL,
  `fat_per100` real NOT NULL,
  `fibre_per100` real NOT NULL,
  `serving_name` text NOT NULL,
  `serving_grams` real NOT NULL,
  `client_key` text,
  `created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `diary_entries_user_client_key` ON `diary_entries` (`user_id`, `client_key`);
--> statement-breakpoint
CREATE TABLE `favourite_foods` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `user_id` integer NOT NULL REFERENCES `users`(`id`),
  `food_id` integer NOT NULL REFERENCES `foods`(`id`),
  `created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `favourite_foods_user_food` ON `favourite_foods` (`user_id`, `food_id`);
