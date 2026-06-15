create table if not exists vip_users (
  id bigserial primary key,
  user_id text not null unique,
  expire_date date not null,
  status text not null default 'active',
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists baccarat_roads (
  id bigserial primary key,
  user_id text not null,
  road_key text not null default 'MAIN_DEFAULT',
  road jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table baccarat_roads
add column if not exists road_key text not null default 'MAIN_DEFAULT';

do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'baccarat_roads_user_id_key'
  ) then
    alter table baccarat_roads drop constraint baccarat_roads_user_id_key;
  end if;
end $$;

create unique index if not exists idx_baccarat_roads_user_key
on baccarat_roads(user_id, road_key);

create index if not exists idx_vip_users_user_id on vip_users(user_id);
create index if not exists idx_vip_users_status on vip_users(status);
create index if not exists idx_vip_users_expire_date on vip_users(expire_date);
