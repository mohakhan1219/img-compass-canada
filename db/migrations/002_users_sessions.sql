-- Individual accounts. Passwords are stored as PBKDF2 hashes only.
create table if not exists app_user (
  id text primary key,
  email text not null unique,
  password_hash text,
  cognito_sub text unique,
  created_at timestamptz not null default now(),
  reset_token_hash text,
  reset_expires_at timestamptz
);

create table if not exists app_session (
  id text primary key,
  user_id text not null,
  kind text not null default 'account',
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists app_session_user_idx on app_session (user_id);
create index if not exists app_session_expires_idx on app_session (expires_at);
