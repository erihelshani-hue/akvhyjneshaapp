-- Delete attendance records for rehearsals that no longer exist
DELETE FROM public.attendances
WHERE entity_type = 'rehearsal'
  AND entity_id NOT IN (SELECT id FROM public.rehearsals);

-- Delete attendance records for events that no longer exist
DELETE FROM public.attendances
WHERE entity_type = 'event'
  AND entity_id NOT IN (SELECT id FROM public.events);
