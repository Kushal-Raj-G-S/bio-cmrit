-- Dev Session Tracking Table
-- This table tracks login sessions for development number to avoid repeated OTP costs
-- Session is valid for 24 hours only

CREATE TABLE IF NOT EXISTS dev_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(15) UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  last_login_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  session_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  otp_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_dev_sessions_phone ON dev_sessions(phone);
CREATE INDEX IF NOT EXISTS idx_dev_sessions_expires ON dev_sessions(session_expires_at);

-- Insert the dev number session tracker
INSERT INTO dev_sessions (phone, user_id, last_login_at, session_expires_at, otp_count)
VALUES ('919686293233', '485625cc-7f8d-48f3-b293-9b47cb9f6a62', NOW(), NOW() + INTERVAL '24 hours', 0)
ON CONFLICT (phone) 
DO UPDATE SET 
  updated_at = NOW();

-- Enable RLS
ALTER TABLE dev_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read dev sessions (for checking if session is valid)
CREATE POLICY "Allow public read access to dev_sessions"
  ON dev_sessions
  FOR SELECT
  USING (true);

-- Policy: Anyone can update dev sessions (for updating login time)
CREATE POLICY "Allow public update access to dev_sessions"
  ON dev_sessions
  FOR UPDATE
  USING (true);

COMMENT ON TABLE dev_sessions IS 'Tracks development login sessions to avoid repeated OTP costs. Session valid for 24 hours.';
