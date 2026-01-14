create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  pseudo text not null
);

alter table public.profiles enable row level security;

-- lecture publique (vous pouvez mettre "authenticated" si vous préférez)
create policy "profiles are readable"
on public.profiles for select
using (true);

-- chaque utilisateur peut écrire/modifier son profil
create policy "users manage own profile"
on public.profiles for insert
with check (auth.uid() = id);

create policy "users update own profile"
on public.profiles for update
using (auth.uid() = id);
