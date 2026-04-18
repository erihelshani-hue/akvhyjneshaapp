-- Allow authenticated members to see RSVP statuses for participant lists.
drop policy if exists "attendances: own select" on public.attendances;
drop policy if exists "attendances: authenticated select" on public.attendances;

create policy "attendances: authenticated select"
  on public.attendances for select
  to authenticated
  using (true);
