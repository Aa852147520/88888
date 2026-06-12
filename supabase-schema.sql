create table if not exists baccarat_roads (
id bigserial primary key,
user_id text not null unique,
road jsonb not null default '[]'::jsonb,
created_at timestamptz not null default now(),
updated_at timestamptz not null default now()
);

create index if not exists idx_baccarat_roads_user_id
on baccarat_roads(user_id);
