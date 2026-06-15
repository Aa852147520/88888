alter table vip_users add column if not exists display_name text;
create index if not exists idx_vip_users_display_name on vip_users(display_name);

create table if not exists baccarat_roads (
  id bigserial primary key,
  user_id text not null,
  road_key text not null default 'MAIN_DEFAULT',
  road jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table baccarat_roads add column if not exists road_key text not null default 'MAIN_DEFAULT';

do $$
begin
  if exists (select 1 from pg_constraint where conname = 'baccarat_roads_user_id_key') then
    alter table baccarat_roads drop constraint baccarat_roads_user_id_key;
  end if;
end $$;

create unique index if not exists idx_baccarat_roads_user_key on baccarat_roads(user_id, road_key);

create table if not exists user_room_sessions (
  id bigserial primary key,
  user_id text not null unique,
  room_type text not null,
  room_code text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_user_room_sessions_user_id on user_room_sessions(user_id);
