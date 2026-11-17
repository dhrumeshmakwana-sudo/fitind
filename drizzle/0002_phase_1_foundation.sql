DROP TABLE IF EXISTS entries;
--> statement-breakpoint
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  display_name TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE TABLE sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  token_hash TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE INDEX sessions_user_idx ON sessions(user_id);
--> statement-breakpoint
CREATE TABLE profiles (
  user_id INTEGER PRIMARY KEY REFERENCES users(id),
  display_name TEXT NOT NULL,
  date_of_birth TEXT,
  height_cm REAL,
  weight_kg REAL,
  sex TEXT,
  activity_level TEXT,
  experience TEXT,
  onboarding_completed INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE TABLE user_goals (
  user_id INTEGER PRIMARY KEY REFERENCES users(id),
  main_goal TEXT,
  target_weight_kg REAL,
  calorie_target_override INTEGER,
  updated_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE TABLE user_preferences (
  user_id INTEGER PRIMARY KEY REFERENCES users(id),
  diet_preference TEXT,
  diet_custom_note TEXT,
  allergies TEXT,
  training_days_per_week INTEGER,
  equipment TEXT,
  equipment_custom_note TEXT,
  units TEXT NOT NULL DEFAULT 'metric',
  notify_meals INTEGER NOT NULL DEFAULT 0,
  notify_water INTEGER NOT NULL DEFAULT 0,
  notify_workouts INTEGER NOT NULL DEFAULT 0,
  profile_private INTEGER NOT NULL DEFAULT 1,
  updated_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE TABLE weight_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  weight_kg REAL NOT NULL,
  logged_on TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE INDEX weight_logs_user_date_idx ON weight_logs(user_id, logged_on);
