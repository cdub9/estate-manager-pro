ALTER TABLE inventory ADD COLUMN IF NOT EXISTS state text NOT NULL DEFAULT 'active';
UPDATE inventory SET state = 'archived' WHERE archived_at IS NOT NULL;