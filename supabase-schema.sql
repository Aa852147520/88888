create table if not exists vip_users (
  id bigserial primary key,
  user_id text not null unique,
  expire_date date not null,
  status text not null default 'active',
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_vip_users_user_id on vip_users(user_id);
