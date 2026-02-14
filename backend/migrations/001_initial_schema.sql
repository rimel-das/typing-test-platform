/**
 * Database Schema for Typing Test Platform
 * PostgreSQL Schema Design
 * 
 * Tables:
 * - users: User authentication and profile data
 * - typing_tests: Individual typing test records
 * - test_statistics: Aggregated stats for users
 * - leaderboard: Cached leaderboard data
 * - multiplayer_rooms: Active multiplayer race rooms
 * - user_preferences: User theme and settings
 * - word_lists: Different difficulty word pools
 */

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(32) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  -- Profile info
  display_name VARCHAR(100),
  avatar_url TEXT,
  bio TEXT,
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  -- Account status
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  -- Indices
  CONSTRAINT username_length CHECK (length(username) >= 3),
  CONSTRAINT email_format CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- User preferences (settings, theme, etc.)
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  theme VARCHAR(20) DEFAULT 'dark', -- 'dark', 'light', 'custom'
  custom_theme_config JSONB,
  enable_sounds BOOLEAN DEFAULT true,
  enable_animations BOOLEAN DEFAULT true,
  language VARCHAR(10) DEFAULT 'en',
  notification_email BOOLEAN DEFAULT true,
  -- Typing preferences
  font_size INT DEFAULT 16,
  font_family VARCHAR(50) DEFAULT 'monospace',
  caret_style VARCHAR(20) DEFAULT 'line', -- 'line', 'block', 'underline'
  show_live_wpm BOOLEAN DEFAULT true,
  show_live_accuracy BOOLEAN DEFAULT true,
  -- Test defaults
  default_test_duration INT DEFAULT 60, -- seconds
  default_difficulty VARCHAR(20) DEFAULT 'normal', -- 'easy', 'normal', 'hard'
  default_language VARCHAR(20) DEFAULT 'english',
  -- Privacy
  profile_public BOOLEAN DEFAULT false,
  show_on_leaderboard BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Typing tests (individual test attempts)
CREATE TABLE typing_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  -- Test metadata
  duration INT NOT NULL, -- seconds
  difficulty VARCHAR(20) NOT NULL, -- 'easy', 'normal', 'hard'
  language VARCHAR(20) DEFAULT 'english',
  mode VARCHAR(20) DEFAULT 'time', -- 'time', 'words', 'quote', 'zen'
  test_type VARCHAR(20) DEFAULT 'normal', -- 'normal', 'punctuation', 'numbers'
  -- Results
  wpm DECIMAL(10, 2) NOT NULL,
  accuracy DECIMAL(5, 2) NOT NULL, -- 0-100
  raw_wpm DECIMAL(10, 2) NOT NULL, -- before accuracy adjustment
  -- Stats
  characters_typed INT NOT NULL,
  correct_characters INT NOT NULL,
  incorrect_characters INT NOT NULL,
  extra_characters INT NOT NULL,
  missed_characters INT NOT NULL,
  consistency DECIMAL(5, 2), -- consistency percentage
  -- Multiplayer
  race_id UUID, -- if part of multiplayer
  position_in_race INT, -- finishing position
  -- Input events
  input_history JSONB, -- { timestamp, char, correct } array
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  duration_actual INT -- actual time taken (might be less than duration)
);

CREATE INDEX idx_typing_tests_user_id ON typing_tests(user_id);
CREATE INDEX idx_typing_tests_created_at ON typing_tests(created_at);
CREATE INDEX idx_typing_tests_wpm ON typing_tests(wpm);
CREATE INDEX idx_typing_tests_difficulty ON typing_tests(difficulty);
CREATE INDEX idx_typing_tests_race_id ON typing_tests(race_id);

-- Test statistics (aggregated per user)
CREATE TABLE test_statistics (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_tests INT DEFAULT 0,
  total_time_typing INT DEFAULT 0, -- seconds
  -- WPM stats
  avg_wpm DECIMAL(10, 2) DEFAULT 0,
  max_wpm DECIMAL(10, 2) DEFAULT 0,
  min_wpm DECIMAL(10, 2) DEFAULT 0,
  -- Accuracy stats
  avg_accuracy DECIMAL(5, 2) DEFAULT 0,
  -- Consistency
  avg_consistency DECIMAL(5, 2) DEFAULT 0,
  -- Difficulty breakdown
  tests_easy INT DEFAULT 0,
  tests_normal INT DEFAULT 0,
  tests_hard INT DEFAULT 0,
  -- Streak
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  -- Last updated
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leaderboard (cached for performance)
CREATE TABLE leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  username VARCHAR(32) NOT NULL,
  -- Rankings
  rank INT,
  wpm DECIMAL(10, 2) NOT NULL,
  accuracy DECIMAL(5, 2) NOT NULL,
  tests_completed INT NOT NULL,
  avg_consistency DECIMAL(5, 2),
  -- Period
  period VARCHAR(20) DEFAULT 'all_time', -- 'daily', 'weekly', 'monthly', 'all_time'
  -- Metadata
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_leaderboard_rank ON leaderboard(rank);
CREATE INDEX idx_leaderboard_wpm ON leaderboard(wpm DESC);
CREATE INDEX idx_leaderboard_period ON leaderboard(period);
CREATE INDEX idx_leaderboard_user_id ON leaderboard(user_id);

-- Multiplayer rooms
CREATE TABLE multiplayer_races (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code VARCHAR(8) UNIQUE NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  -- Room state
  status VARCHAR(20) DEFAULT 'waiting', -- 'waiting', 'in_progress', 'completed'
  duration INT DEFAULT 60, -- seconds
  difficulty VARCHAR(20) DEFAULT 'normal',
  max_participants INT DEFAULT 10,
  -- Participants
  participants JSONB DEFAULT '[]', -- array of {user_id, username, wpm, finished_at}
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  expires_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '1 hour'
);

CREATE INDEX idx_multiplayer_races_room_code ON multiplayer_races(room_code);
CREATE INDEX idx_multiplayer_races_status ON multiplayer_races(status);
CREATE INDEX idx_multiplayer_races_expires_at ON multiplayer_races(expires_at);

-- Word lists (for different languages and difficulties)
CREATE TABLE word_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  language VARCHAR(20) NOT NULL,
  difficulty VARCHAR(20) NOT NULL, -- 'easy', 'normal', 'hard'
  words TEXT[] NOT NULL, -- array of words
  word_count INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(language, difficulty)
);

CREATE INDEX idx_word_lists_language_difficulty ON word_lists(language, difficulty);

-- User achievements/badges
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_type VARCHAR(50) NOT NULL, -- 'wpm_100', 'accuracy_100', 'streak_10', etc.
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, achievement_type)
);

CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);

-- Personal best records
CREATE TABLE personal_bests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  difficulty VARCHAR(20) NOT NULL,
  mode VARCHAR(20) NOT NULL, -- 'time', 'words', 'quote'
  duration INT, -- for time mode, null for others
  wpm DECIMAL(10, 2) NOT NULL,
  accuracy DECIMAL(5, 2) NOT NULL,
  test_id UUID REFERENCES typing_tests(id) ON DELETE SET NULL,
  set_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, difficulty, mode, duration)
);

CREATE INDEX idx_personal_bests_user_id ON personal_bests(user_id);
CREATE INDEX idx_personal_bests_wpm ON personal_bests(wpm DESC);

-- Refresh tokens for auth
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  revoked_at TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- Update timestamps trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_test_statistics_updated_at BEFORE UPDATE ON test_statistics
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
