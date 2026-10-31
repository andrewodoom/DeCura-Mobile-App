-- Read-only inventory of a project's database objects that are not
-- PostgreSQL's or Supabase's own. Used as installation evidence, and after an
-- exposed key, to show nothing was added (Supabase change 1 review, section 4).
-- Changes nothing. Run from the repository:
--   npx supabase db query --linked -f supabase/checks/project-inventory.sql
--
-- Expected on a project with no application migrations: no rows, except the
-- "auth users" and "storage buckets" counts, which should both be 0. After a
-- migration, the rows match what that migration created.

with platform(nspname) as (
  values ('information_schema'), ('auth'), ('storage'), ('extensions'),
    ('realtime'), ('_realtime'), ('_analytics'), ('supabase_functions'),
    ('supabase_migrations'), ('vault'), ('graphql'), ('graphql_public'),
    ('pgsodium'), ('pgsodium_masks'), ('pgbouncer'), ('pgtle'), ('net'),
    ('cron'), ('topology'), ('tiger')
),
app_ns as (
  select n.oid, n.nspname from pg_namespace n
  where n.nspname not in (select nspname from platform)
    and left(n.nspname, 3) <> 'pg_'
)
select 'schema' as kind, nspname as name from app_ns
  where nspname <> 'public'
union all
select 'relation', format('%s.%s (%s)', a.nspname, c.relname, c.relkind)
  from pg_class c join app_ns a on a.oid = c.relnamespace
  where c.relkind in ('r', 'p', 'v', 'm', 'f')
union all
select 'function', format('%s.%s', a.nspname, p.proname)
  from pg_proc p join app_ns a on a.oid = p.pronamespace
union all
select 'event trigger', evtname from pg_event_trigger
union all
select 'role', rolname from pg_roles
  where rolname not like 'pg\_%' escape '\'
    and rolname not in ('postgres', 'anon', 'authenticated', 'service_role',
      'authenticator', 'dashboard_user', 'supabase_admin', 'supabase_auth_admin',
      'supabase_storage_admin', 'supabase_functions_admin',
      'supabase_realtime_admin', 'supabase_replication_admin',
      'supabase_read_only_user', 'supabase_etl_admin', 'supabase_privileged_role',
      'pgbouncer', 'pgsodium_keyholder', 'pgsodium_keyiduser',
      'pgsodium_keymaker', 'pgtle_admin', 'cli_login_postgres')
union all
select 'auth users', count(*)::text from auth.users
union all
select 'storage buckets', count(*)::text from storage.buckets
order by 1, 2;
