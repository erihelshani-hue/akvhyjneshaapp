create table public.push_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  endpoint    text not null,
  p256dh      text not null,
  auth        text not null,
  created_at  timestamptz not null default now(),
  unique (user_id, endpoint)
);

alter table public.push_subscriptions enable row level security;

-- Each user manages only their own subscriptions
create policy "Users manage own push subscriptions"
  on public.push_subscriptions for all
  to authenticated
  using  (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Service role can read all (needed for sending notifications)
create policy "Service role reads all subscriptions"
  on public.push_subscriptions for select
  to service_role
  using (true);
