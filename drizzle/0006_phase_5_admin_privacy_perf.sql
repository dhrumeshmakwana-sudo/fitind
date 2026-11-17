CREATE TABLE `admin_roles` (
	`user_id` integer PRIMARY KEY NOT NULL,
	`grant_method` text NOT NULL,
	`granted_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `admin_audit_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`admin_user_id` integer NOT NULL,
	`admin_email` text NOT NULL,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` integer,
	`summary` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `sessions` ADD `user_agent` text;
--> statement-breakpoint
CREATE INDEX `idx_sessions_user` ON `sessions` (`user_id`);
--> statement-breakpoint
CREATE INDEX `idx_diary_user_date` ON `diary_entries` (`user_id`, `logged_on`);
--> statement-breakpoint
CREATE INDEX `idx_weight_user_date` ON `weight_logs` (`user_id`, `logged_on`);
--> statement-breakpoint
CREATE INDEX `idx_water_user_date` ON `water_entries` (`user_id`, `logged_on`);
--> statement-breakpoint
CREATE INDEX `idx_workouts_user_status` ON `workout_sessions` (`user_id`, `status`, `started_at`);
--> statement-breakpoint
CREATE INDEX `idx_foods_name` ON `foods` (`name`);
--> statement-breakpoint
CREATE INDEX `idx_audit_created` ON `admin_audit_log` (`created_at`);
