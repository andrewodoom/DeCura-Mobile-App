# Council review — Supabase environments (milestone 0, Supabase change 1)

| | |
|---|---|
| Item reviewed | Branch `change/m0-supabase-environments`: Supabase command-line tool, `supabase/` folder, first migration (row-level security event trigger), its test, `.env.example`, `docs/environments.md` |
| Requirements | DECURA-REL1-2026-001: SEC-01, SEC-02 (safety net only), SEC-05 (partial), SEC-07, QA-01 |
| Review date | 30 October 2026 |
| Reviewers | Security and development operations; quality assurance and validation; data engineering; mobile engineering; privacy and regulatory, run independently and in parallel |
| Requested by | Andrew Kofi Odoom |
| Change classification | Major: new environment and a database-level security control. No user data, app logic or user-facing copy. |
| Outcome | **Approve with conditions** from all five advisers. Conditions applied (section 3), owner actions open (section 4), deferred (section 5). |

## 1. Verdicts

| Adviser | Verdict | Grounds |
|---|---|---|
| Security and development operations | Approve with conditions | Exposed secret key not yet revoked (C1); GitHub integration settings not captured (C2); no Supabase rule in secret scanning; trigger covers creation only |
| Quality assurance and validation | Approve with conditions | Migration not executed; challenge test not pre-approved; matrix row missing; documentation gaps |
| Data engineering | Approve with conditions | Migration not executed; views and later `ALTER ... DISABLE` not covered; `user` is a reserved word; documentation |
| Mobile engineering | Approve with conditions | `config.toml` is local-only and undocumented as such; seed file missing; local stack undocumented; plan for change 2 |
| Privacy and regulatory | Approve with conditions | Development data rule could not be met literally; data processing agreement timing; prototype projects need a disposition plan; GitHub integration integrity |

## 2. Baseline

| Item | Version or value |
|---|---|
| Supabase command-line tool | 2.121.0, exact pin (2.122.0 was under 14 days old) |
| Development project | `decura-dev`, reference `fkqwophvgvprissnvumw`, eu-central-1 (from the linked project record and pooler host `aws-1-eu-central-1`), free plan |
| PostgreSQL on development | 17.11.0.011; matches `[db] major_version = 17` |

Observed on 30 October 2026, before commit: traceability check passes (95 identifiers, 108 tests), type check, lint and Jest pass. Security and QA each ran the audit gate themselves: pass, covered by the existing zod waiver; the new packages add no advisory. Security ran `npm ci --ignore-scripts` on a clean copy: the tool installs and reports 2.121.0.

## 3. Conditions applied

| Source | Condition | Change |
|---|---|---|
| Data 7, QA 2, Security, Mobile 13 | Complete the schema exclusion list | Added `supabase_migrations`, `pgbouncer`, `_realtime`, `_analytics`, `pgsodium_masks`, `pgtle`, `topology`, `tiger`. `pgmq` deliberately not excluded (Supabase advises row-level security on queue tables; stricter position). |
| Security 11 | Pattern must not depend on `standard_conforming_strings` | `left(schema_name, 3) <> 'pg_'` |
| QA 3, Data 1, Security 5 | Scripted test, expected results fixed before execution, leaves nothing behind | `supabase/tests/SEC-02-T02_rls_event_trigger.sql`: seven cases, rolled back by a final exception that carries the result and the role that ran it |
| QA 4 | Matrix row | `SEC-02,,SEC-02-T02,integration,Not run,`. A manual run on development is supporting evidence; SEC-02-T02 passes only on an observed CI run. |
| Privacy 1 | Development data rule | Replaced with the privacy adviser's wording, covering staging, test addresses and incidental technical data |
| Privacy 2 | Agreement before production data | Stated on the production row |
| Privacy 4b, Data 6, Mobile 2 | Seed data | Seeding switched off in `config.toml`; rule written |
| Privacy 7 | Built-in email | Recorded as development-only |
| Mobile 1, Security 7, QA 6 | `config.toml` is local-only | Documented; `config push` not used |
| Mobile 3 | CLI binary under `--ignore-scripts` | **Not upheld.** The package has no install script; the binary comes from `@supabase/cli-<platform>` optional packages, which install under `--ignore-scripts` (checked locally; security confirmed on a clean install) |
| Mobile 4 | Local stack | Documented, including device networking |
| Data 5, 9, 10; QA 1, 6 | Migration rules, apply procedure, applied record, rollback | Documented in `docs/environments.md` |
| QA 6 | Free-plan limits, access | Documented |
| Security 3 (part), QA 5d | Automatic deployment off | Stated as a rule; owner to set and evidence (section 4) |
| Data 3, Mobile | Schema `user` is a reserved word in PostgreSQL | Owner decided on 30 October 2026 to rename it `app_user`. DECURA-REL1-2026-001 version 1.2 (minor change, section 3.8 and change history); migration comment updated. Approved by the owner's merge of this change. |

## 4. Open before merge (owner)

| Source | Action | Status |
|---|---|---|
| Security C1 | Delete the exposed secret key (section 6); confirm no other unused secret keys; check API and Postgres logs from the time of exposure Closed 31 October 2026. Key deleted (reported 10:48 UTC); the owner confirmed no other secret keys remain; integrity inventory clean (section 6); logs for the last 60 minutes show only Supabase dashboard and platform calls, no data, authentication, storage or function requests. Free-plan log retention is short and may not reach back to the exposure, so the inventory is the primary evidence. Evidence and SHA-256 in the private store. |
| Security C2, QA 5d | Screenshot the GitHub integration settings (directory, production branch, deploy toggle); set automatic deployment off | Done 31 October 2026, 12:06 Europe/Berlin: repository connected, working directory `.`, Deploy to production off, no production branch, automatic branching off. Migrations reach the project only through the reviewed `db push` procedure, so the integration path needs no separate trigger test. Screenshot and SHA-256 in the private store. |
| QA 1, 3; Data 1 | Apply the migration to development and run SEC-02-T02 (procedure in `docs/environments.md`); record the output here | Done 31 October 2026, after the key incident closed. Test and expected results committed first (`892a68e`). Dry run listed only this migration; push applied it; `migration list` shows it local and remote. SEC-02-T02 output: "SEC-02-T02 PASS (7 of 7 cases passed) as role postgres; failed: none; all test objects rolled back". Supporting evidence for development only: SEC-02-T02 stays Not run in the matrix until an observed CI run. Full record with file SHA-256 values in the private store. |
| Security 6, Privacy 6 | Confirm the eu-west-1 test project is deleted; organisation lists only eu-central-1 projects | Open |
| QA 5 | Development set-up evidence: general settings, plan, members and two-factor authentication, exposed schemas, `migration list` output. No secret in any screenshot. Copied to the private store with SHA-256 checksums. | Open |
| QA 5 | Decide whether the development installation qualification is formal or supporting (QA recommends supporting) and state it in DECURA-CSV-VAL-MOB-2026-001 | Owner decision |
| Security 8 | Two-factor authentication on Supabase and GitHub; expire or revoke the command-line access token after use | Open |
| Privacy 2 | Accept Supabase's data processing agreement; check it covers the free plan and names the transfer mechanism | Open |

## 5. Deferred

| Source | Item | When |
|---|---|---|
| Security 9, QA 7, Mobile | SEC-01 says "anonymous key"; the publishable key is its replacement | Next controlled revision of DECURA-REL1-2026-001 |
| Security 2 | `.gitleaks.toml` with rules for `sb_secret_`, the service_role claim and connection strings (also follow-up C12 of the CI review) | Own change, before staging exists |
| QA 1, Security 4, Data 2 | Run SEC-02-T02 in CI against a clean database; add an end-state check that no relation in an application schema lacks row-level security, no materialised or foreign table is exposed, and every view uses `security_invoker` | Before staging exists |
| Privacy 5 | Prototype projects: contain, inventory without copying, breach check, disposition, close out | Inventory and breach check by 13 November 2026; disposition by 29 November 2026 |
| Privacy 2, 3 | Draft record of processing (PRIV-05); environments, transfer risk and deployment path as inputs to the PRIV-01 re-assessment | Milestone 5 |
| Mobile 5 to 12 | Typed config module, environment check, EAS environments, update channels, app identifiers, redirect URLs, schema exposure, session storage | Change 2 and the build-profile change |
| Data 4 | Grants and policies per schema; submissions held apart from import tables | Each schema migration |

## 6. Incidents

**Exposed secret key, 30 October 2026.** While setting up `decura-dev`, the owner pasted a secret key (`sb_secret_` type) into the chat with the coding agent. The agent did not store, use or repeat it, and asked the owner to delete it. Exposure: the chat transcript, held by the model provider and in local transcript files. Development holds no data, so no personal data was at risk; privacy to confirm. Cause: the difference between public and secret values was not explained before keys were requested. Prevention: `docs/environments.md` lists which values may be shared; the agent asks only for the project address and the publishable key. Revocation: the owner deleted the key in the Supabase dashboard and reported it to the agent on 31 October 2026 at 10:48 UTC (the deletion itself was shortly before). Integrity inventory (`supabase/checks/project-inventory.sql`), run by the owner on 31 October 2026 after the deletion, before any migration: 0 auth users, 0 storage buckets, no application schema, relation or role. The only non-default objects are the `ensure_rls` event trigger and `public.rls_auto_enable` function, which Supabase creates when "Enable automatic RLS" is chosen at project creation (the owner chose it); the other six event triggers are Supabase platform defaults. No sign of use of the key. Output and SHA-256 in the private store (M0 Installation Qualification, "2026-10-31 decura-dev integrity inventory"). Log check: Supabase dashboard and platform calls only (section 4). Incident closed 31 October 2026.

**Link written to the home folder, 30 October 2026.** A `cd` instruction quoted `~`, so `supabase link` ran in the home folder and wrote `~/supabase/.temp/`. The files held the project reference, pooler address (no password) and versions. The agent copied them to `supabase/.temp/` (ignored by git), confirmed the copies matched, and removed the stray folder.

## 7. Document impact

- DECURA-CSV-VAL-MOB-2026-001: development installation qualification record; which environments need formal installation qualification; SEC-02-T02 in the operational qualification protocol; migrations applied through change control and immutable once applied.
- DECURA-CSV-VAD-2026-001: change log entry, major change.
- DECURA-DPIA-2026-001: no re-assessment triggered; inputs to PRIV-01 as in section 5; prototype disposition recorded against the prototype edition.
- DECURA-MDM-SPEC-2026-001: schema layout and import lineage, when the reference schema is designed.
- DECURA-REL1-2026-001: version 1.2 renames schema `user` to `app_user` (section 3); SEC-01 key wording at the next revision (section 5).
