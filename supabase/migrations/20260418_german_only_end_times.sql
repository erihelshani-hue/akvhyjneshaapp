-- German-only app cleanup and schedule end times.
-- The production DB may already have the legacy *_sq columns removed, so
-- every legacy-column change is guarded by information_schema checks.

alter table public.rehearsals
  add column if not exists end_time time;

alter table public.events
  add column if not exists end_time time;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'rehearsals' and column_name = 'title_sq'
  ) then
    alter table public.rehearsals alter column title_sq drop not null;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'rehearsals' and column_name = 'notes_sq'
  ) then
    alter table public.rehearsals alter column notes_sq drop not null;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'events' and column_name = 'title_sq'
  ) then
    alter table public.events alter column title_sq drop not null;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'events' and column_name = 'notes_sq'
  ) then
    alter table public.events alter column notes_sq drop not null;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'announcements' and column_name = 'title_sq'
  ) then
    alter table public.announcements alter column title_sq drop not null;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'announcements' and column_name = 'body_sq'
  ) then
    alter table public.announcements alter column body_sq drop not null;
  end if;
end $$;

alter table public.rehearsals
  drop constraint if exists rehearsals_end_after_start,
  add constraint rehearsals_end_after_start
    check (end_time is null or end_time > time);

alter table public.events
  drop constraint if exists events_end_after_start,
  add constraint events_end_after_start
    check (end_time is null or end_time > time);
