
-- SIS schema (minimal)
create table if not exists sis_inventory(
  area text, page text, component text,
  resource_type text, resource_ref text,
  criticality text, owner_role text
);

create table if not exists sis_checks(
  id bigint primary key,
  area text, page text, component text,
  name text,
  resource_type text, resource_ref text,
  expectation_json jsonb,
  severity text
);

create table if not exists sis_runs(
  id bigserial primary key,
  started_at timestamptz default now(),
  actor uuid,
  environment text,
  result text,
  duration_ms integer
);

create table if not exists sis_results(
  run_id bigint references sis_runs(id),
  check_id bigint references sis_checks(id),
  status text,
  latency_ms integer,
  sample_count integer,
  message text
);
