-- Soft-archive for rehearsals
ALTER TABLE public.rehearsals
  ADD COLUMN IF NOT EXISTS is_archived  boolean    NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS archived_at  timestamptz,
  ADD COLUMN IF NOT EXISTS archived_by  uuid        REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Soft-archive for events
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS is_archived  boolean    NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS archived_at  timestamptz,
  ADD COLUMN IF NOT EXISTS archived_by  uuid        REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Index to speed up the common non-archived filter
CREATE INDEX IF NOT EXISTS idx_rehearsals_not_archived ON public.rehearsals (is_archived) WHERE NOT is_archived;
CREATE INDEX IF NOT EXISTS idx_events_not_archived     ON public.events     (is_archived) WHERE NOT is_archived;
