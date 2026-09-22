-- Emails for pilot follow-up live apart from the answers. There is no key
-- between the two tables, and only the day is kept, so a lead cannot be
-- matched back to a response.
create table if not exists pilot_leads (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  cohort      text,
  created_on  date not null default current_date
);

insert into pilot_leads (email, cohort, created_on)
  select email, cohort, created_at::date from responses where email is not null and email <> '';

alter table responses drop column if exists email;
