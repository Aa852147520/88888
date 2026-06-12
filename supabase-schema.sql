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
  user_id text not null unique,
  road jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_vip_users_user_id on vip_users(user_id);
create index if not exists idx_vip_users_status on vip_users(status);
create index if not exists idx_vip_users_expire_date on vip_users(expire_date);
create index if not exists idx_baccarat_roads_user_id on baccarat_roads(user_id);
