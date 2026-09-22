-- Lobby discovery research: one row per survey response or interview.
create extension if not exists pgcrypto;

create table if not exists responses (
  id            uuid primary key default gen_random_uuid(),
  instrument    text not null check (instrument in ('parents', 'kids')),
  cohort        text,
  family_code   text,
  status        text not null default 'complete' check (status in ('draft', 'complete')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  completed_at  timestamptz,
  answers       jsonb not null default '{}'::jsonb,
  email         text,            -- parents only, optional
  interviewer   text,            -- kids only: 'helen' | 'parent'
  child_age     smallint,        -- kids only, 5–14; the only thing stored about the child
  consent       boolean          -- kids only
);

create index if not exists responses_instrument_status_idx on responses (instrument, status);
create index if not exists responses_family_code_idx on responses (lower(btrim(family_code)));
