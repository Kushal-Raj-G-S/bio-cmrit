-- Fix FK constraint on field_batch_history to use ON DELETE CASCADE
-- Run this in Supabase SQL Editor

ALTER TABLE field_batch_history
  DROP CONSTRAINT IF EXISTS field_batch_history_field_batch_id_fkey;

ALTER TABLE field_batch_history
  ADD CONSTRAINT field_batch_history_field_batch_id_fkey
  FOREIGN KEY (field_batch_id)
  REFERENCES field_batches(id)
  ON DELETE CASCADE;

-- Same fix for crop_rotation_plans if it exists
ALTER TABLE crop_rotation_plans
  DROP CONSTRAINT IF EXISTS crop_rotation_plans_field_batch_id_fkey;

ALTER TABLE crop_rotation_plans
  ADD CONSTRAINT crop_rotation_plans_field_batch_id_fkey
  FOREIGN KEY (field_batch_id)
  REFERENCES field_batches(id)
  ON DELETE CASCADE;
