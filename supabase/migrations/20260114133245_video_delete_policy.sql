alter table public.video enable row level security;

create policy "creator can delete own videos"
on public.video for delete
using (auth.uid() = id_creator);
