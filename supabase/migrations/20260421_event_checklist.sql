CREATE TABLE IF NOT EXISTS public.event_checklist_items (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id    uuid        NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  label       text        NOT NULL,
  is_done     boolean     NOT NULL DEFAULT false,
  sort_order  int         NOT NULL DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE public.event_checklist_items ENABLE ROW LEVEL SECURITY;

-- All authenticated members can read
CREATE POLICY "members can read checklist items"
  ON public.event_checklist_items FOR SELECT
  TO authenticated USING (true);

-- Only admins can insert/update/delete
CREATE POLICY "admins can manage checklist items"
  ON public.event_checklist_items FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
