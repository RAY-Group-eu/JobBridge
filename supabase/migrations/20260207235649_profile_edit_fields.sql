BEGIN;

-- Profile should be directly editable from the UI.
DROP TRIGGER IF EXISTS trg_profiles_lock_full_name ON public.profiles;
DROP FUNCTION IF EXISTS public.prevent_profile_identity_change();

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS headline text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS website text;

COMMIT;
