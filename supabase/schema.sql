-- Rode este arquivo inteiro no SQL Editor do Supabase.
-- Tudo deste app usa o prefixo sort_, para conviver com as outras tabelas do projeto.
-- O gatilho em auth.users só cria perfil quando o cadastro manda um login.
-- Contas do outro app, sem esse campo, seguem sem alteração.
-- Depois, em Authentication → Providers → Email, desligue "Confirm email"
-- só se o outro app também puder ficar sem confirmação.
-- O login da tela é um nome. A conta usa um e-mail interno só para o Supabase.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.sort_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  login text not null unique check (login ~ '^[a-z0-9_]{3,24}$'),
  created_at timestamptz not null default now()
);

create table if not exists public.sort_rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 40),
  password_hash text not null,
  owner_id uuid not null references public.sort_profiles (id) on delete cascade,
  drawn_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.sort_room_members (
  room_id uuid not null references public.sort_rooms (id) on delete cascade,
  user_id uuid not null references public.sort_profiles (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (room_id, user_id)
);

create index if not exists sort_room_members_user_idx on public.sort_room_members (user_id);

create table if not exists public.sort_assignments (
  room_id uuid not null references public.sort_rooms (id) on delete cascade,
  giver_id uuid not null references public.sort_profiles (id) on delete cascade,
  receiver_id uuid not null,
  primary key (room_id, giver_id),
  constraint sort_assignments_receiver_fk foreign key (receiver_id) references public.sort_profiles (id) on delete cascade,
  constraint sort_assignments_not_self check (giver_id <> receiver_id)
);

create or replace function public.sort_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  login_value text;
begin
  login_value := lower(trim(coalesce(new.raw_user_meta_data ->> 'login', '')));
  if login_value = '' then
    return new;
  end if;
  if login_value !~ '^[a-z0-9_]{3,24}$' then
    raise exception 'Login inválido.';
  end if;
  insert into public.sort_profiles (id, login)
  values (new.id, login_value);
  return new;
end;
$$;

drop trigger if exists sort_on_auth_user_created on auth.users;
create trigger sort_on_auth_user_created
after insert on auth.users
for each row execute function public.sort_handle_new_user();

create or replace function public.sort_is_room_member(target_room uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.sort_room_members
    where room_id = target_room
      and user_id = auth.uid()
  );
$$;

create or replace function public.sort_room_preview(target_room uuid)
returns table (id uuid, name text, drawn boolean)
language sql
security definer
stable
set search_path = public
as $$
  select sort_rooms.id, sort_rooms.name, sort_rooms.drawn_at is not null
  from public.sort_rooms
  where sort_rooms.id = target_room;
$$;

create or replace function public.sort_create_room(room_name text, room_password text)
returns uuid
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  clean_name text;
  new_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Faça login.';
  end if;

  clean_name := regexp_replace(trim(room_name), '\s+', ' ', 'g');
  if char_length(clean_name) < 2 or char_length(clean_name) > 40 then
    raise exception 'O nome da sala precisa ter entre 2 e 40 caracteres.';
  end if;
  if char_length(room_password) < 6 or char_length(room_password) > 72 then
    raise exception 'A senha da sala precisa ter entre 6 e 72 caracteres.';
  end if;

  insert into public.sort_rooms (name, password_hash, owner_id)
  values (clean_name, extensions.crypt(room_password, extensions.gen_salt('bf', 8)), auth.uid())
  returning id into new_id;

  insert into public.sort_room_members (room_id, user_id)
  values (new_id, auth.uid());

  return new_id;
end;
$$;

create or replace function public.sort_join_room(target_room uuid, room_password text)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  already timestamptz;
  stored_hash text;
begin
  if auth.uid() is null then
    raise exception 'Faça login.';
  end if;

  select drawn_at, password_hash
  into already, stored_hash
  from public.sort_rooms
  where id = target_room
  for update;

  if not found then
    raise exception 'Sala não encontrada.';
  end if;
  if stored_hash is distinct from extensions.crypt(room_password, stored_hash) then
    raise exception 'Senha incorreta.';
  end if;
  if already is not null then
    raise exception 'O sorteio desta sala já foi feito.';
  end if;

  insert into public.sort_room_members (room_id, user_id)
  values (target_room, auth.uid())
  on conflict do nothing;
end;
$$;

-- Um ciclo: a posição i aponta para a próxima e a última volta para a primeira.
create or replace function public.sort_draw_room(target_room uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  room_owner uuid;
  already_drawn timestamptz;
  member_ids uuid[];
  total_count integer;
  cursor integer;
  swap_index integer;
  current_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Faça login.';
  end if;

  select owner_id, drawn_at
  into room_owner, already_drawn
  from public.sort_rooms
  where id = target_room
  for update;

  if room_owner is null then
    raise exception 'Sala não encontrada.';
  end if;
  if room_owner <> auth.uid() then
    raise exception 'Só o dono pode sortear.';
  end if;
  if already_drawn is not null then
    raise exception 'Esta sala já foi sorteada.';
  end if;

  select coalesce(array_agg(user_id order by joined_at), '{}')
  into member_ids
  from public.sort_room_members
  where room_id = target_room;

  total_count := coalesce(array_length(member_ids, 1), 0);
  if total_count < 2 then
    raise exception 'É preciso de pelo menos duas pessoas na sala.';
  end if;

  for cursor in reverse total_count .. 2 loop
    swap_index := 1 + floor(random() * cursor)::integer;
    current_id := member_ids[cursor];
    member_ids[cursor] := member_ids[swap_index];
    member_ids[swap_index] := current_id;
  end loop;

  for cursor in 1 .. total_count loop
    insert into public.sort_assignments (room_id, giver_id, receiver_id)
    values (
      target_room,
      member_ids[cursor],
      member_ids[1 + (cursor % total_count)]
    );
  end loop;

  if (select count(*) from public.sort_assignments where room_id = target_room) <> total_count then
    raise exception 'O sorteio não fechou.';
  end if;

  update public.sort_rooms
  set drawn_at = now()
  where id = target_room;
end;
$$;

revoke all on function public.sort_handle_new_user() from public, anon, authenticated;
revoke all on function public.sort_is_room_member(uuid) from public;
revoke all on function public.sort_room_preview(uuid) from public;
revoke all on function public.sort_create_room(text, text) from public;
revoke all on function public.sort_join_room(uuid, text) from public;
revoke all on function public.sort_draw_room(uuid) from public;

grant execute on function public.sort_is_room_member(uuid) to authenticated;
grant execute on function public.sort_room_preview(uuid) to anon, authenticated;
grant execute on function public.sort_create_room(text, text) to authenticated;
grant execute on function public.sort_join_room(uuid, text) to authenticated;
grant execute on function public.sort_draw_room(uuid) to authenticated;

alter table public.sort_profiles enable row level security;
alter table public.sort_rooms enable row level security;
alter table public.sort_room_members enable row level security;
alter table public.sort_assignments enable row level security;

drop policy if exists sort_profiles_select_shared on public.sort_profiles;
create policy sort_profiles_select_shared
on public.sort_profiles
for select
to authenticated
using (
  id = auth.uid()
  or exists (
    select 1
    from public.sort_room_members mine
    join public.sort_room_members theirs on theirs.room_id = mine.room_id
    where mine.user_id = auth.uid()
      and theirs.user_id = sort_profiles.id
  )
);

drop policy if exists sort_rooms_select_member on public.sort_rooms;
create policy sort_rooms_select_member
on public.sort_rooms
for select
to authenticated
using (public.sort_is_room_member(id));

drop policy if exists sort_rooms_delete_owner on public.sort_rooms;
create policy sort_rooms_delete_owner
on public.sort_rooms
for delete
to authenticated
using (owner_id = auth.uid());

drop policy if exists sort_members_select on public.sort_room_members;
create policy sort_members_select
on public.sort_room_members
for select
to authenticated
using (public.sort_is_room_member(room_id));

drop policy if exists sort_members_delete_owner on public.sort_room_members;
create policy sort_members_delete_owner
on public.sort_room_members
for delete
to authenticated
using (
  user_id <> auth.uid()
  and exists (
    select 1
    from public.sort_rooms
    where sort_rooms.id = sort_room_members.room_id
      and sort_rooms.owner_id = auth.uid()
      and sort_rooms.drawn_at is null
  )
);

drop policy if exists sort_assignments_select_own on public.sort_assignments;
create policy sort_assignments_select_own
on public.sort_assignments
for select
to authenticated
using (giver_id = auth.uid() and public.sort_is_room_member(room_id));

revoke all on public.sort_profiles from anon, authenticated;
revoke all on public.sort_rooms from anon, authenticated;
revoke all on public.sort_room_members from anon, authenticated;
revoke all on public.sort_assignments from anon, authenticated;

grant select (id, login) on public.sort_profiles to authenticated;
grant select (id, name, owner_id, drawn_at, created_at) on public.sort_rooms to authenticated;
grant delete on public.sort_rooms to authenticated;
grant select (room_id, user_id, joined_at) on public.sort_room_members to authenticated;
grant delete on public.sort_room_members to authenticated;
grant select (room_id, giver_id, receiver_id) on public.sort_assignments to authenticated;

do $$
begin
  alter publication supabase_realtime add table public.sort_rooms;
exception
  when duplicate_object then null;
  when others then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.sort_room_members;
exception
  when duplicate_object then null;
  when others then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.sort_assignments;
exception
  when duplicate_object then null;
  when others then null;
end $$;
