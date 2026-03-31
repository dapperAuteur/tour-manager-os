-- Add user_type to user_profiles for onboarding role selection.
-- Separate from org_members.role (which is org-level permission).
-- user_type is "who are you" — tailors experience and tracked in admin.
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS user_type text
  CHECK (user_type IN ('artist', 'tour_manager', 'band_member', 'crew', 'venue_contact', 'fan'));
