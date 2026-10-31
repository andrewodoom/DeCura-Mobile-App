-- SEC-02 safety net: every table created in an application schema starts with
-- row-level security enabled. A table with row-level security and no policies
-- denies all access through the Data API, so a forgotten policy fails closed
-- instead of exposing every row. This does not replace policies or the SEC-02
-- tests; each table still needs its own policies.
--
-- Application schemas are separate from public (release definition: reference,
-- app_user, community, staging), so this covers every schema that is not
-- PostgreSQL's or Supabase's own, not only Supabase's built-in public option.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create or replace function private.enable_rls_on_new_table()
returns event_trigger
language plpgsql
set search_path = ''
as $$
declare
  obj record;
begin
  for obj in
    select object_identity, schema_name
    from pg_event_trigger_ddl_commands()
    where command_tag in ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      and object_type = 'table'
  loop
    -- Every schema except PostgreSQL's and Supabase's own, so a schema added
    -- later is covered without anyone remembering to list it here.
    -- pgmq is deliberately not excluded: Supabase advises row-level security
    -- on queue tables. Temporary tables (pg_temp_N) start with pg_.
    if obj.schema_name not in (
      'information_schema', 'auth', 'storage', 'extensions', 'realtime',
      '_realtime', '_analytics', 'supabase_functions', 'supabase_migrations',
      'vault', 'graphql', 'graphql_public', 'pgsodium', 'pgsodium_masks',
      'pgbouncer', 'pgtle', 'net', 'cron', 'topology', 'tiger'
    ) and left(obj.schema_name, 3) <> 'pg_' then
      execute format('alter table %s enable row level security', obj.object_identity);
    end if;
  end loop;
end;
$$;

revoke all on function private.enable_rls_on_new_table() from public, anon, authenticated;

drop event trigger if exists enable_rls_on_new_table;
create event trigger enable_rls_on_new_table
  on ddl_command_end
  when tag in ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
  execute function private.enable_rls_on_new_table();
