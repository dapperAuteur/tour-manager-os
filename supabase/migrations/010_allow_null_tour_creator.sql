-- Allow NULL created_by on tours for demo/seed data.
-- Demo tours are created before demo auth users exist.
-- The demo login route sets created_by when the demo manager first logs in.
ALTER TABLE tours ALTER COLUMN created_by DROP NOT NULL;

-- Update trigger to skip auto-add-member when created_by is NULL
CREATE OR REPLACE FUNCTION add_tour_creator_as_manager()
RETURNS trigger AS $$
BEGIN
  IF new.created_by IS NOT NULL THEN
    INSERT INTO tour_members (tour_id, user_id, role, display_name)
    VALUES (
      new.id,
      new.created_by,
      'manager',
      coalesce(
        (SELECT raw_user_meta_data->>'display_name' FROM auth.users WHERE id = new.created_by),
        'Tour Manager'
      )
    );
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
