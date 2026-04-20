ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS favorite_dance text
    CHECK (favorite_dance IN ('lirik', 'perdrin', 'rugove', 'kollazh', 'librazhd', 'tropoje')),
  ADD COLUMN IF NOT EXISTS member_since date,
  ADD COLUMN IF NOT EXISTS available_for_rehearsals boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS available_for_events boolean NOT NULL DEFAULT true;
