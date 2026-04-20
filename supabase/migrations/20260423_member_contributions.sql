-- Monthly member contributions
CREATE TABLE IF NOT EXISTS public.member_contributions (
  id                  uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid          NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  contribution_month  date          NOT NULL,   -- always first day of month: 2026-04-01
  amount_due          numeric(10,2) NOT NULL DEFAULT 0,
  amount_paid         numeric(10,2) NOT NULL DEFAULT 0,
  paid_at             timestamptz,
  notes               text,
  created_at          timestamptz   NOT NULL DEFAULT now(),
  updated_at          timestamptz   NOT NULL DEFAULT now(),
  UNIQUE (user_id, contribution_month)
);

ALTER TABLE public.member_contributions ENABLE ROW LEVEL SECURITY;

-- Members can only read their own contribution records
CREATE POLICY "members_read_own_contributions"
  ON public.member_contributions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Service role (admin API / server actions) has full access
CREATE POLICY "service_role_all_contributions"
  ON public.member_contributions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Index for fast per-user lookups
CREATE INDEX IF NOT EXISTS idx_contributions_user ON public.member_contributions (user_id);
-- Index for fast per-month admin overview
CREATE INDEX IF NOT EXISTS idx_contributions_month ON public.member_contributions (contribution_month);
