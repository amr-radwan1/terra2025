-- Create sessions table for tracking exercise sessions
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email TEXT NOT NULL REFERENCES user_profiles(email) ON DELETE CASCADE,
    session_date DATE NOT NULL,
    session_day TEXT NOT NULL, -- 'Tuesday' or 'Friday'
    exercises JSONB NOT NULL, -- Array of exercise objects
    completed BOOLEAN DEFAULT false,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    total_exercises INTEGER NOT NULL DEFAULT 0,
    session_type TEXT DEFAULT 'weekly_routine',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_sessions_email_date ON user_sessions(user_email, session_date);
CREATE INDEX IF NOT EXISTS idx_user_sessions_completed ON user_sessions(user_email, completed);
CREATE INDEX IF NOT EXISTS idx_user_sessions_date_range ON user_sessions(session_date);

-- Create trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_sessions_updated_at
    BEFORE UPDATE ON user_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_sessions_updated_at();

-- Grant permissions
GRANT ALL ON user_sessions TO authenticated;
GRANT ALL ON user_sessions TO service_role;
