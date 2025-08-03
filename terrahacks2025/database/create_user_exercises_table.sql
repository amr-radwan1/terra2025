-- Create user_exercises table
CREATE TABLE IF NOT EXISTS user_exercises (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL REFERENCES user_profiles(email) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sets INTEGER NOT NULL DEFAULT 3,
    reps INTEGER NOT NULL DEFAULT 10,
    rest_seconds INTEGER NOT NULL DEFAULT 60,
    difficulty_level VARCHAR(20) NOT NULL DEFAULT 'BEGINNER' CHECK (difficulty_level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
    body_part VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_exercises_email ON user_exercises(email);
CREATE INDEX IF NOT EXISTS idx_user_exercises_created_at ON user_exercises(created_at);
CREATE INDEX IF NOT EXISTS idx_user_exercises_difficulty ON user_exercises(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_user_exercises_body_part ON user_exercises(body_part);

-- Create trigger to update updated_at on row updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_exercises_updated_at
    BEFORE UPDATE ON user_exercises
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
