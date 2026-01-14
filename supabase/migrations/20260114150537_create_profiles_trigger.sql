-- Fonction appelée à chaque création d'utilisateur Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, pseudo)
  values (
    new.id,
    coalesce(new.email, 'user_' || left(new.id::text, 8))
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Trigger branché sur auth.users
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
