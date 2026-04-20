-- Add birthday to profiles (admin-managed, not user input)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS birthday date;

-- Prevent duplicate birthday push notifications on the same day
CREATE TABLE IF NOT EXISTS public.birthday_notifications (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  birthday_person_id uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  notification_date  date        NOT NULL,
  created_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE (birthday_person_id, notification_date)
);

ALTER TABLE public.birthday_notifications ENABLE ROW LEVEL SECURITY;

-- Only the service role (cron job) can access birthday_notifications
CREATE POLICY "service_role_birthday_notifications"
  ON public.birthday_notifications
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
