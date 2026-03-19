-- Amplify AI MVP schema (run in Supabase SQL editor or via migrations tooling)

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'lead_status') then
    create type public.lead_status as enum ('hot', 'warm', 'cold');
  end if;
  if not exists (select 1 from pg_type where typname = 'message_direction') then
    create type public.message_direction as enum ('inbound', 'outbound');
  end if;
  if not exists (select 1 from pg_type where typname = 'follow_up_status') then
    create type public.follow_up_status as enum ('due', 'done', 'cancelled');
  end if;
end $$;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  status public.lead_status not null default 'warm',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lead_messages (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  direction public.message_direction not null,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.follow_ups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  due_at timestamptz not null,
  status public.follow_up_status not null default 'due',
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.response_templates (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  system_prompt text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists leads_owner_id_idx on public.leads(owner_id);
create index if not exists lead_messages_lead_id_created_at_idx on public.lead_messages(lead_id, created_at);
create index if not exists follow_ups_owner_id_due_at_idx on public.follow_ups(owner_id, due_at);
create index if not exists response_templates_owner_id_idx on public.response_templates(owner_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

alter table public.leads enable row level security;
alter table public.lead_messages enable row level security;
alter table public.follow_ups enable row level security;
alter table public.response_templates enable row level security;

-- Leads: owner only
drop policy if exists "leads_select_own" on public.leads;
create policy "leads_select_own"
on public.leads for select
using (owner_id = auth.uid());

drop policy if exists "leads_insert_own" on public.leads;
create policy "leads_insert_own"
on public.leads for insert
with check (owner_id = auth.uid());

drop policy if exists "leads_update_own" on public.leads;
create policy "leads_update_own"
on public.leads for update
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "leads_delete_own" on public.leads;
create policy "leads_delete_own"
on public.leads for delete
using (owner_id = auth.uid());

-- Messages: owner only + must belong to an owned lead
drop policy if exists "lead_messages_select_own" on public.lead_messages;
create policy "lead_messages_select_own"
on public.lead_messages for select
using (
  owner_id = auth.uid()
  and exists (
    select 1 from public.leads l
    where l.id = lead_messages.lead_id and l.owner_id = auth.uid()
  )
);

drop policy if exists "lead_messages_insert_own" on public.lead_messages;
create policy "lead_messages_insert_own"
on public.lead_messages for insert
with check (
  owner_id = auth.uid()
  and exists (
    select 1 from public.leads l
    where l.id = lead_messages.lead_id and l.owner_id = auth.uid()
  )
);

drop policy if exists "lead_messages_delete_own" on public.lead_messages;
create policy "lead_messages_delete_own"
on public.lead_messages for delete
using (owner_id = auth.uid());

-- Follow-ups: owner only + must belong to an owned lead
drop policy if exists "follow_ups_select_own" on public.follow_ups;
create policy "follow_ups_select_own"
on public.follow_ups for select
using (owner_id = auth.uid());

drop policy if exists "follow_ups_insert_own" on public.follow_ups;
create policy "follow_ups_insert_own"
on public.follow_ups for insert
with check (
  owner_id = auth.uid()
  and exists (
    select 1 from public.leads l
    where l.id = follow_ups.lead_id and l.owner_id = auth.uid()
  )
);

drop policy if exists "follow_ups_update_own" on public.follow_ups;
create policy "follow_ups_update_own"
on public.follow_ups for update
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "follow_ups_delete_own" on public.follow_ups;
create policy "follow_ups_delete_own"
on public.follow_ups for delete
using (owner_id = auth.uid());

-- Templates: owner only
drop policy if exists "templates_select_own" on public.response_templates;
create policy "templates_select_own"
on public.response_templates for select
using (owner_id = auth.uid());

drop policy if exists "templates_insert_own" on public.response_templates;
create policy "templates_insert_own"
on public.response_templates for insert
with check (owner_id = auth.uid());

drop policy if exists "templates_update_own" on public.response_templates;
create policy "templates_update_own"
on public.response_templates for update
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "templates_delete_own" on public.response_templates;
create policy "templates_delete_own"
on public.response_templates for delete
using (owner_id = auth.uid());

