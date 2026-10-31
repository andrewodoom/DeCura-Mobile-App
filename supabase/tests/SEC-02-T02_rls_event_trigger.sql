-- SEC-02-T02: the event trigger from 20261030152438_enable_rls_on_new_tables.sql
-- switches on row-level security for each kind of new table it covers, and
-- leaves temporary tables alone. Expected results are fixed below, before the
-- test is run, and the same file is run unchanged against every environment.
--
-- Run as the role that applies migrations (postgres), from the repository:
--   npx supabase db query --linked -f supabase/tests/SEC-02-T02_rls_event_trigger.sql
--
-- The block always ends by raising an exception, so PostgreSQL rolls back
-- every object the test created and nothing is left behind. The exception
-- message is the result:
--   "SEC-02-T02 PASS (7 of 7 cases passed) as role postgres; ..."
--   "SEC-02-T02 FAIL (...) ...; failed: <case names>; ..."
-- Any other error means the test did not run, which is not a result.
--
-- Not covered here: SELECT INTO, which PL/pgSQL cannot run as a statement. It
-- reaches the trigger with its own tag and is covered by the automated CI
-- version of this test. Supabase skips user event triggers for its own
-- reserved roles (supautils); that is expected and not tested here.

do $$
declare
  r record;
  failed text[] := '{}';
  total int := 0;
begin
  create schema sec02_t02;
  create table sec02_t02.plain (id int);
  create table public.sec02_t02_public (id int);
  create table sec02_t02.created_as as select 1 as id;
  create table sec02_t02.parent (id int) partition by range (id);
  create table sec02_t02.child partition of sec02_t02.parent for values from (0) to (10);
  create temp table sec02_t02_temp (id int);

  for r in
    select * from (values
      ('plain table in a new schema', 'sec02_t02.plain',         true),
      ('table in public',             'public.sec02_t02_public', true),
      ('CREATE TABLE AS',             'sec02_t02.created_as',    true),
      ('partitioned table',           'sec02_t02.parent',        true),
      ('partition',                   'sec02_t02.child',         true),
      ('temporary table, excluded',   'pg_temp.sec02_t02_temp',  false)
    ) as t(name, relation, expected)
  loop
    total := total + 1;
    if (select c.relrowsecurity from pg_class c where c.oid = r.relation::regclass)
        is distinct from r.expected then
      failed := failed || r.name::text;
    end if;
  end loop;

  total := total + 1;
  if not exists (
    select 1 from pg_event_trigger
    where evtname = 'enable_rls_on_new_table' and evtenabled = 'O'
  ) then
    failed := failed || 'event trigger installed and enabled'::text;
  end if;

  raise exception 'SEC-02-T02 % (% of % cases passed) as role %; failed: %; all test objects rolled back',
    case when cardinality(failed) = 0 then 'PASS' else 'FAIL' end,
    total - cardinality(failed), total, current_user,
    coalesce(nullif(array_to_string(failed, ', '), ''), 'none');
end;
$$;
