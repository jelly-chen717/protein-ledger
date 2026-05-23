create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  weight_kg numeric not null default 56.6,
  height_cm numeric not null default 165,
  created_at timestamp with time zone not null default now()
);

create table if not exists protein_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  record_date date not null default current_date,
  name text not null,
  protein_g numeric not null check (protein_g > 0),
  created_at timestamp with time zone not null default now()
);

create table if not exists ledger_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  record_date date not null default current_date,
  type text not null check (type in ('income', 'expense')),
  category text not null,
  amount numeric not null check (amount > 0),
  note text,
  created_at timestamp with time zone not null default now()
);

create index if not exists protein_records_user_date_idx
  on protein_records (user_id, record_date desc);

create index if not exists ledger_records_user_date_idx
  on ledger_records (user_id, record_date desc);

alter table profiles enable row level security;
alter table protein_records enable row level security;
alter table ledger_records enable row level security;

drop policy if exists "profiles_select_own" on profiles;
create policy "profiles_select_own"
  on profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on profiles;
create policy "profiles_insert_own"
  on profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on profiles;
create policy "profiles_update_own"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "protein_records_select_own" on protein_records;
create policy "protein_records_select_own"
  on protein_records for select
  using (auth.uid() = user_id);

drop policy if exists "protein_records_insert_own" on protein_records;
create policy "protein_records_insert_own"
  on protein_records for insert
  with check (auth.uid() = user_id);

drop policy if exists "protein_records_delete_own" on protein_records;
create policy "protein_records_delete_own"
  on protein_records for delete
  using (auth.uid() = user_id);

drop policy if exists "ledger_records_select_own" on ledger_records;
create policy "ledger_records_select_own"
  on ledger_records for select
  using (auth.uid() = user_id);

drop policy if exists "ledger_records_insert_own" on ledger_records;
create policy "ledger_records_insert_own"
  on ledger_records for insert
  with check (auth.uid() = user_id);

drop policy if exists "ledger_records_delete_own" on ledger_records;
create policy "ledger_records_delete_own"
  on ledger_records for delete
  using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, weight_kg, height_cm)
  values (new.id, 56.6, 165)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
