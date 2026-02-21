-- Create upload sessions table to track CSV uploads per user
CREATE TABLE IF NOT EXISTS upload_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) DEFAULT auth.uid(),
  name text NOT NULL,
  path text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE upload_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
  ON upload_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON upload_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS upload_sessions_user_id_idx ON upload_sessions(user_id);
CREATE INDEX IF NOT EXISTS upload_sessions_created_at_idx ON upload_sessions(created_at DESC);
