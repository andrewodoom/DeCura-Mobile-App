# Environments (SEC-05)

Release 1 uses three separate Supabase projects, all in Frankfurt (eu-central-1), as the release definition requires.

| Environment | Supabase project | Reference | Plan | Status |
|---|---|---|---|---|
| Development | `decura-dev` | `fkqwophvgvprissnvumw` | Free | In use from milestone 0 |
| Staging | `decura-staging` | Not created | Pro | Created before operational qualification starts |
| Production | `decura-prod` | Not created | Pro | Created before the owner uses the production system. The Supabase data processing agreement is in place before it receives any data (PRIV-02). |

Until staging and production exist, SEC-05 is not met. SEC-05-T01 stays `Not run`.

Only the owner has access to each project. Two-factor authentication must be on for the owner's Supabase and GitHub accounts.

## Data in each environment

Development and staging hold made-up test data only. No real person's profile, journal, consent or community data, including the owner's, is entered into either. Test accounts use dedicated test email addresses controlled by the owner, never a tester's or anyone else's address. No data from the prototype projects or from production is copied into development or staging. The only real personal data in these projects is incidental technical data: the owner's IP address in Supabase logs and the owner's Supabase account details.

Catalogue data reaches any project only through the scripted import (REQ-FIN-06), never through `supabase/seed.sql` or edits in Supabase Studio. Seeding is off in `supabase/config.toml`. A change that turns it on adds made-up fixtures only. No export, dump or prototype data is ever committed: the repository is public.

Development uses Supabase's built-in email for one-time codes, sent to owner-controlled test addresses only. Staging and production never use it (PRIV-02).

Development is on the free plan: no backups, and the project pauses after a week without activity. Both are acceptable for made-up data.

## App configuration

The app reads two public values from `EXPO_PUBLIC_` variables:

| Variable | Value |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | `https://<reference>.supabase.co` |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | The project's publishable key (`sb_publishable_...`) |

Copy `.env.example` to `.env` and fill these in. `.env` is ignored by git and is used for local `expo start` only; build profiles get their values from EAS when they are added. The publishable key replaces the anonymous key named in SEC-01. Both are public by design; row-level security protects the data, not the key.

Expo builds every `EXPO_PUBLIC_` variable into the app bundle. A secret key (`sb_secret_...`), service_role key or database password must never be put in one, or anywhere in the repository (SEC-01). Server-side code reads secrets from Supabase's secret store. A secret key that is exposed anywhere, including a chat or a screenshot, is deleted at once and the exposure recorded.

## Command-line tool

The Supabase command-line tool is a pinned development dependency (`supabase` in `package.json`). Its binary comes from a platform package (`@supabase/cli-<platform>`), so it also installs under `npm ci --ignore-scripts`. Update the pin only through change control, to a version at least 14 days old, after reading its release notes.

The owner links a local copy to a project from the repository folder:

```sh
npx supabase login
npx supabase link --project-ref <reference>
```

`link` asks for the database password, which stays in the owner's password manager. The link is stored in `supabase/.temp/`, which git ignores. `db push` and `db query --linked` act on whichever project is linked, so check `supabase/.temp/project-ref` before each one.

`supabase/config.toml` configures the local stack (`supabase start`) only. It is never pushed to a hosted project (`supabase config push` is not used), because its authentication defaults are weaker than the release requires. Each hosted project's settings are set in the dashboard and evidenced by dated screenshots.

The local stack needs Docker. From a physical device or the Android emulator, `127.0.0.1` does not reach it; use the computer's network address or `10.0.2.2`.

## GitHub integration

`decura-dev` is connected to this repository through Supabase's GitHub integration. Automatic deployment of migrations must be off. Migrations reach a project only through the reviewed apply procedure below. Before `decura-prod` is created, a security-devops decision records which branch, if any, deploys to which project.

## Migrations

Schema changes are SQL files in `supabase/migrations/`, applied in file name order. Rules:
- Every migration is reviewed through change control before it is applied to any project.
- An applied migration is never edited. A fix is a new migration with a later timestamp, and no new migration may sort before one already applied.
- Every `create table` in an application schema is followed, in the same migration, by `alter table ... enable row level security`, the table's policies, explicit `grant` statements, and a comment naming the requirement it serves. The event trigger below is a safety net, not a substitute.
- A migration that adds a schema the app reads directly adds it to `[api] schemas` in `supabase/config.toml` and to the exposed schemas of each hosted project in the same change. `staging`, import and `private` schemas are never exposed.

### Apply procedure

1. Check the linked project: `cat supabase/.temp/project-ref`.
2. Preview: `npx supabase db push --dry-run`.
3. Apply: `npx supabase db push`.
4. Confirm local and remote match: `npx supabase migration list`.
5. Run the migration's test, if it has one, and keep the output.
6. Record the result below and in the change's review record.

### Applied migrations

| Migration | Purpose | Development | Staging | Production |
|---|---|---|---|---|
| `20261030152438_enable_rls_on_new_tables.sql` | SEC-02 safety net: switches on row-level security for every new table outside PostgreSQL's and Supabase's own schemas | Applied 31 October 2026 by the owner, from commit `892a68e`; SEC-02-T02 passed 7 of 7 as `postgres` | Not applied | Not applied |

Rollback for `20261030152438_enable_rls_on_new_tables.sql`, applied as a new migration only if needed. Tables created in the meantime keep row-level security on, which is the safe direction.

```sql
drop event trigger if exists enable_rls_on_new_table;
drop function if exists private.enable_rls_on_new_table();
drop schema if exists private;
```

## Database tests

`supabase/tests/SEC-02-T02_rls_event_trigger.sql` tests the event trigger and rolls back everything it creates. Until continuous integration runs it automatically, it is run by hand on each environment as supporting evidence; SEC-02-T02 passes only on an observed CI run. The trigger covers new tables only. SEC-02 still needs tests that one user cannot read or change another's data, and a check that no table in an application schema has row-level security off.
