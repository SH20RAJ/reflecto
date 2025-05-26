-- Migration to add embedding column to notebooks table if it doesn't exist
ALTER TABLE notebooks ADD COLUMN IF NOT EXISTS embedding TEXT;