-- Learner pathway document. JSON payload keeps the domain model versioned in-app.
create table if not exists learner_state (
  learner_id text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

create index if not exists learner_state_updated_at_idx on learner_state (updated_at);
