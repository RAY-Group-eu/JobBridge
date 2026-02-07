BEGIN;

CREATE OR REPLACE FUNCTION public.prevent_profile_identity_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  old_name text := nullif(trim(coalesce(OLD.full_name, '')), '');
  new_name text := nullif(trim(coalesce(NEW.full_name, '')), '');
  old_city text := nullif(trim(coalesce(OLD.city, '')), '');
  new_city text := nullif(trim(coalesce(NEW.city, '')), '');
BEGIN
  -- No change (or cosmetic whitespace-only differences) -> allow.
  IF new_name IS NOT DISTINCT FROM old_name
     AND new_city IS NOT DISTINCT FROM old_city THEN
    RETURN NEW;
  END IF;

  -- Allow support/internal updates (service role / SQL editor).
  IF auth.role() = 'service_role' OR current_user = 'postgres' THEN
    RETURN NEW;
  END IF;

  -- Allow initial one-time fill for legacy rows where values are still empty.
  -- If an old value already exists, direct user-side changes are blocked.
  IF (new_name IS DISTINCT FROM old_name AND old_name IS NOT NULL)
     OR (new_city IS DISTINCT FROM old_city AND old_city IS NOT NULL) THEN
    RAISE EXCEPTION 'Profilname und Stadt/Ort sind fixiert. Bitte Support kontaktieren.'
      USING ERRCODE = 'P0001';
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_lock_full_name ON public.profiles;

CREATE TRIGGER trg_profiles_lock_full_name
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_profile_identity_change();

COMMIT;
