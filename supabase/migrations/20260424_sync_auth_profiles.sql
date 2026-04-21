-- Backfill and keep public.profiles in sync for manually-created Auth users.
-- The app lists members from public.profiles, while Supabase "Add user"
-- only creates rows in auth.users.

INSERT INTO public.profiles (
  id,
  full_name,
  email,
  role,
  avatar_url,
  language_preference,
  birthday,
  favorite_dance,
  member_since,
  available_for_rehearsals,
  available_for_events
)
SELECT
  auth_user.id,
  COALESCE(
    NULLIF(auth_user.raw_user_meta_data ->> 'full_name', ''),
    split_part(auth_user.email, '@', 1),
    'Member'
  ),
  auth_user.email,
  'member',
  NULLIF(auth_user.raw_user_meta_data ->> 'avatar_url', ''),
  COALESCE(NULLIF(auth_user.raw_user_meta_data ->> 'language_preference', ''), 'de'),
  NULL,
  NULL,
  NULL,
  true,
  true
FROM auth.users AS auth_user
LEFT JOIN public.profiles AS profile ON profile.id = auth_user.id
WHERE profile.id IS NULL
  AND auth_user.email IS NOT NULL
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    role,
    avatar_url,
    language_preference,
    birthday,
    favorite_dance,
    member_since,
    available_for_rehearsals,
    available_for_events
  )
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''),
      split_part(NEW.email, '@', 1),
      'Member'
    ),
    NEW.email,
    'member',
    NULLIF(NEW.raw_user_meta_data ->> 'avatar_url', ''),
    COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'language_preference', ''), 'de'),
    NULL,
    NULL,
    NULL,
    true,
    true
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();
