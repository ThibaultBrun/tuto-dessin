-- s'assurer que profiles.id est bien uuid (PK) et référence auth.users(id)
-- (si vous l'avez déjà, ignorez)

alter table public.video
  add constraint video_id_creator_fkey
  foreign key (id_creator)
  references public.profiles(id)
  on delete set null;
