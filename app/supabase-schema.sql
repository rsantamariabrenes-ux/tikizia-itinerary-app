-- Run this in Supabase dashboard → SQL Editor

CREATE TABLE access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  generations_remaining INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

-- Index for fast token lookups
CREATE INDEX idx_access_tokens_token ON access_tokens(token);

-- Atomic generation decrement (prevents race conditions)
-- Run this in Supabase dashboard → SQL Editor after creating the table
CREATE OR REPLACE FUNCTION decrement_generation(p_token uuid)
RETURNS TABLE (generations_remaining integer) AS $$
  UPDATE access_tokens
  SET generations_remaining = access_tokens.generations_remaining - 1,
      last_used_at = now()
  WHERE token = p_token
    AND access_tokens.generations_remaining > 0
  RETURNING access_tokens.generations_remaining;
$$ LANGUAGE sql;
