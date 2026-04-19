-- Add optional end dates for rehearsals and events.

alter table public.rehearsals
  add column if not exists end_date date;

alter table public.events
  add column if not exists end_date date;

alter table public.rehearsals
  drop constraint if exists rehearsals_end_after_start,
  add constraint rehearsals_end_after_start
    check (
      end_time is null
      or (coalesce(end_date, date), end_time) > (date, time)
    );

alter table public.events
  drop constraint if exists events_end_after_start,
  add constraint events_end_after_start
    check (
      end_time is null
      or (coalesce(end_date, date), end_time) > (date, time)
    );
