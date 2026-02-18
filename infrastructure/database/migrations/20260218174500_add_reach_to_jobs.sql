-- Add reach column to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS reach text DEFAULT 'internal_rheinbach';

-- Add check constraint for valid values
ALTER TABLE jobs ADD CONSTRAINT jobs_reach_check CHECK (reach IN ('internal_rheinbach', 'extended'));
