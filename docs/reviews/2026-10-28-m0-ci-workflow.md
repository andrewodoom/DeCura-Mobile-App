# Council review — Continuous integration workflow (milestone 0)

| | |
|---|---|
| Item reviewed | `.github/workflows/ci.yml` on branch `change/m0-ci-workflow` (new file) |
| Requirements | DECURA-REL1-2026-001: SEC-01, SEC-07, SEC-14, QA-04 |
| Review date | 28 October 2026 |
| Reviewers | Quality assurance and validation; security and development operations, run independently and in parallel |
| Requested by | Andrew Kofi Odoom |
| Change classification | Minor: new supporting infrastructure, no change to system behaviour. In scope of the milestone 0 installation qualification under DECURA-CSV-VAL-MOB-2026-001. |
| Outcome | **Approve with conditions** from both advisers. C1, C2, C3, C5, C11 and C13 applied in this change (section 9); C4 and C6 closed after merge (section 10), with deviation DEV-M0-02 for the merge before C4. C7, C9 and C14 were closed on owner statements, then reopened when the screenshots were reviewed (section 10). The rest are open. |

## 1. Verdicts

| Adviser | Verdict | Grounds |
|---|---|---|
| Quality assurance and validation | Approve with conditions | Skip step fails open; header overstates traceability; no observed run or challenge test of the gates yet |
| Security and development operations | Approve with conditions | SEC-14 not met: `main` ruleset has no required status checks; push protection unconfirmed |

## 2. Findings closed before review

| Finding | Resolution |
|---|---|
| The `on:` block was indented by 3 spaces and `name` and `permissions` were duplicated, so the file did not parse | Fixed; the file parses with one key of each |
| `cancel-in-progress: true` could cancel a run on `main`, leaving a merge commit without a completed CI record | Now `${{ github.event_name == 'pull_request' }}`; runs on `main` are never cancelled. Both advisers confirmed. |

## 3. Verified by security and development operations

- `actions/checkout` v7.0.1 is `3d3c42e5aac5ba805825da76410c181273ba90b1` and `actions/setup-node` v7.1.0 is `949feb2413d6458794dcd2491c4babbbce0c15c1`, checked with `git ls-remote` against upstream tags.
- The gitleaks 8.30.1 `linux_x64` SHA-256 matches the official release checksums file and an independent download.
- The `main` ruleset (id 25983499) has deletion, non-fast-forward and pull request rules, and no required status checks.

Not verified: push protection and secret scanning settings, ruleset bypass actors, fork approval setting, and any real CI run.

## 4. Conditions before merge

| Number | Source | Condition |
|---|---|---|
| C1 | Quality assurance | Re-stage `ci.yml` so the committed file is the reviewed version; record the commit hash here |
| C2 | Quality assurance | Skip step fails the job when `package.json` exists without `package-lock.json` (`ci.yml`, "Look for the app project") |
| C3 | Quality assurance | Header reads "Contributes to SEC-01, SEC-07, SEC-14, QA-04" |
| C4 | Quality assurance | Record a green run of this pull request: run ID and commit |
| C5 | Quality assurance | Record temporary skip as deviation DEV-M0-01 (section 6) |

## 5. Conditions before milestone 0 closes

| Number | Source | Condition | Owner |
|---|---|---|---|
| C6 | Security | Ruleset on `main` requires "Secret scan (full history)" and "Audit, type check, lint and test" to pass, branches up to date, no bypass actors or a recorded justified exception (SEC-14) | Kofi, in GitHub settings |
| C7 | Security | Secret scanning and push protection on, with a screenshot or API output as evidence (SEC-01) | Kofi, in GitHub settings |
| C8 | Quality assurance | Challenge test: a throwaway branch with a fake, rule-matching key makes the secret scan fail; branch deleted, never on `main` | Primary agent, observed by Kofi |
| C9 | Quality assurance | Branch protection evidence (screenshot or API export) for SEC-14 | Kofi |
| C10 | Security | Dependabot for `github-actions` and `npm`, weekly; recurring manual check of the gitleaks version and checksum | Primary agent |
| C11 | Security | Weekly `schedule:` trigger so new advisories are caught between pull requests (SEC-07) | Primary agent |
| C12 | Security | `.gitleaks.toml` extending the default rules with no path allowlists; any `.gitleaksignore` entry names one fingerprint with a justification | Primary agent |
| C13 | Security | Extract gitleaks into its own folder under `$RUNNER_TEMP` and add only that folder to `PATH` | Primary agent |
| C14 | Security | Require approval for fork pull request workflows from outside collaborators | Kofi, in GitHub settings |
| C15 | Quality assurance | Create `docs/validation/traceability-matrix.csv` with rows for SEC-01, SEC-07, SEC-14 and QA-04 | Primary agent |

## 6. Deviation DEV-M0-01: app checks conditional on lockfile

The `app-checks` job skips audit, type check, lint and test while there is no `package-lock.json`, and passes with a warning. Accepted as "not applicable" while no app project exists. A green result from this job is not SEC-07 or QA-04 evidence until the deviation is closed.

- **Exit condition:** the Expo project change (milestone 0, part 1, item 3) deletes the "Look for the app project" step and every `if:` that reads it.
- **Tracked in:** this record and the milestone 0 installation qualification record as an open known issue.
- **Milestone 0 cannot close while it is open.**
- **Closed 29 October 2026** by the Expo project change, on run 40915437424. See `2026-10-29-m0-expo-project.md` section 5.

Conditions carried to the Expo project change, checked in its review:
- Removal of the skip step and its conditions (quality assurance).
- Fail the build on skipped or todo tests unless each is listed with a justification in a checked-in allowlist (QA-04).
- Upload test report, audit output and gitleaks summary with `actions/upload-artifact`, pinned by hash, with a retention period; record how release candidate evidence is copied to the private validation store (QA-04, QA-10, QA-11).
- Challenge tests for the audit, lint and test gates.
- Commit `.nvmrc` and `package-lock.json`; define `typecheck`, `lint` and `test` scripts. If install scripts are needed, run them explicitly rather than dropping `--ignore-scripts`.

## 7. Suggestions not adopted as conditions

- Lint the workflow with `actionlint` and `zizmor`, pinned (security).
- Custom gitleaks rule for the Supabase `service_role` JWT claim once the Expo project exists (security).
- Define how an accepted npm advisory is recorded before the first one is needed (quality assurance, SEC-07).

## 8. Governance updates

- DECURA-CSV-VAL-MOB-2026-001: milestone 0 installation and operational qualification records get the CI configuration as installed (runner, gitleaks version and checksum, action hashes, `ci.yml` commit), DEV-M0-01, and C8 as an operational qualification case. No plan revision needed; list CI as a supporting tool at the next revision if it is not already.
- No update to DECURA-CSV-VAD-2026-001, DECURA-DQF-2026-001 or `docs/governance/README.md`.

## 9. Applied in this change (28 October 2026)

| Condition | Change |
|---|---|
| C1 | `ci.yml` and this record re-staged and committed together on `change/m0-ci-workflow`. The commit hash is recorded with the run ID under C4. |
| C2 | "Look for the app project" fails with an error when `package.json` exists without `package-lock.json` |
| C3 | Header reads "Contributes to DECURA-REL1-2026-001: SEC-01, SEC-07, SEC-14, QA-04" |
| C5 | DEV-M0-01 logged in section 6 and named in the comment on the skip step |
| C11 | `schedule:` trigger, Mondays 06:00 UTC |
| C13 | gitleaks extracted into `$RUNNER_TEMP/gitleaks-bin`; only that folder is added to `PATH` |

Still open before merge: **C4** (record a green run of this pull request with its run ID and commit).

### Owner change after review

At the owner's request, the concurrency group is now `ci-${{ github.ref }}-${{ github.event_name == 'push' && github.sha || 'pr' }}`. Each push to `main` gets its own group, so a run on `main` can be neither cancelled nor replaced while it waits in the queue. This goes further than the reviewed fix in section 2. Pull request runs still cancel older runs on the same pull request. Scheduled and manual runs share the group of their ref. A running scheduled or manual run is never cancelled; a waiting one is replaced by a newer run in the same group. (Corrected 29 October 2026 after quality assurance re-review; the earlier text said these runs are never cancelled.)

## 10. After merge (29 October 2026)

All times UTC. Run and ruleset data retrieved by the primary agent from the public GitHub API on 29 October 2026, after both merges.

| Event | Time |
|---|---|
| Run 40682457576 (`pull_request`, `da02bec`) completed, both jobs success | 2026-10-28 11:45:55 |
| Pull request 5 merged as `aacd548` | 2026-10-29 15:19:27 |
| Run 40900389285 (`push`, `aacd548`) ran, both jobs success | 15:19:31 to 15:19:39 |
| Pull request 4 merged as `25c52d9` | 15:20:09 |
| Run 40900505549 (`push`, `25c52d9`) ran, both jobs success | 15:20:12 to 15:20:22 |
| Ruleset "Protect main" last updated (required checks added, C6) | 15:34:46 |

Run links:
- https://github.com/andrewodoom/DeCura-Mobile-App/actions/runs/40682457576
- https://github.com/andrewodoom/DeCura-Mobile-App/actions/runs/40900389285
- https://github.com/andrewodoom/DeCura-Mobile-App/actions/runs/40900505549

Both merges came before the required checks were added, so neither needed a bypass. The trees of `da02bec` and `aacd548` are identical, so run 40682457576 tested exactly what merged.

| Item | Outcome |
|---|---|
| C4 | **Closed after merge** (see DEV-M0-02). Run 40682457576 concluded success at 2026-10-28 11:45:55, before the merge. "Secret scan (full history)" passed; "Audit, type check, lint and test" passed with the DEV-M0-01 skip. Confirmed from the GitHub API by the primary agent on 29 October 2026, after the merge. |
| Concurrency on `main` | Runs 40900389285 and 40900505549 did not overlap: the first finished before the second started. Neither was cancelled, but the per-commit groups were not exercised. |
| C6 | **Closed.** Required checks observed by the primary agent through `GET /repos/andrewodoom/DeCura-Mobile-App/rules/branches/main`, 29 October 2026. They are "Secret scan (full history)" and "Audit, type check, lint and test" from GitHub Actions (integration 15368), with branches up to date before merging. The API response, with its retrieval time, was saved by the primary agent for the owner to file in the private validation store. Bypass list: owner statement (Andrew Kofi Odoom, 29 October 2026), not independently inspected; screenshot under C9. |
| C7 | **Reopened 29 October 2026.** Push protection on, owner statement (Andrew Kofi Odoom, 29 October 2026). No push protection screenshot was among those filed (see C9 correction). Closes when the screenshot is filed. |
| C9 | **Reopened 29 October 2026.** Five screenshots taken at 16:37 and filed in the private validation store, reviewed by the primary agent. They show the ruleset (active, bypass list empty, required status checks, blocked force pushes and deletions) and the Actions settings. They do not include push protection. |
| C14 | **Reopened 29 October 2026.** The Actions settings screenshot (16:37) shows "Require approval for first-time contributors", not "Require approval for all external contributors" as stated. Closes when the setting is changed and a new screenshot is filed. |
| Concurrency change | Re-reviewed by quality assurance on 29 October 2026 and accepted, with the section 9 correction. Accepted by the owner (Andrew Kofi Odoom), 29 October 2026. Security and development operations content with the owner's acceptance, no re-review needed (29 October 2026). |

### Traceability matrix: unchanged

`SEC-01-T01`, `SEC-07-T01`, `SEC-14-T01` and `QA-04-T01` stay `Not run` with no evidence link.
- **SEC-01-T01:** the scanner has not been tested against a planted secret (C8), so a clean result can't be told apart from a broken check. It becomes Pass once C8 passes and is observed.
- **SEC-07-T01 and QA-04-T01:** under DEV-M0-01 the audit and tests did not run. They change when the Expo project change closes DEV-M0-01.
- **SEC-14-T01:** waiting until the evidence in the private store is cited from a pass entry.

### Open items

- **QA-01-T01 evidence:** `docs/validation/README.md` said `scripts/check-traceability.sh` runs in continuous integration. It does not; `ci.yml` never calls it. The README now says it will, and a CI step needs its own change and review.
- **Authenticated bypass-list evidence** (security condition S1 below), needed before `SEC-14-T01` can be marked Pass.
- C8, C10, C12 and C15 remain open (section 5). DEV-M0-01 remains open (section 6).
- The first pull request to run under C6 is this records change; its run ID goes into the milestone 0 installation qualification record.

A run that passes is not yet SEC-07 or QA-04 evidence while DEV-M0-01 is open (section 6).

### Deviation DEV-M0-02: pull request 5 merged with a before-merge condition open

- **What happened:** Pull request 5 merged as `aacd548` at 2026-10-29 15:19:27 while C4 (section 4) was still open. `main` had no required status checks yet, so nothing blocked the merge. (C6 was a condition before milestone 0 closes, not before merge, so merging before C6 is not part of this deviation.)
- **Impact:** None on the merged content. Run 40682457576 on `da02bec` concluded success at 2026-10-28 11:45:55, before the merge, and `da02bec` and `aacd548` have identical trees. Push run 40900389285 on `aacd548` passed. No change to system behaviour. DEV-M0-01 still applies.
- **Root cause:** Before-merge conditions were tracked only in the review record. Nothing in GitHub enforced them.
- **Correction:** C4 closed after merge (above).
- **Prevention:** C6 now enforces both CI checks. For conditions CI cannot check, the pull request description lists each before-merge condition and the record section that closes it, before the owner is asked to merge.
- **Status:** Closed on the owner's merge of this records change.
- Add to the milestone 0 installation qualification record, alongside DEV-M0-01 (section 8).

### Quality assurance re-review (29 October 2026)

Approve with conditions. The conditions were: record DEV-M0-02; reword who observed the run and when; correct the concurrency claim; attribute the bypass-list statement; correct the scheduled-run wording in section 9; state the matrix is unchanged; and list the README claim as open. All are applied above.

### Security and development operations confirmation (29 October 2026)

Approve with conditions. Security re-queried the public API independently and got the same result as the saved response. Both required check names match the job `name:` values in `ci.yml` exactly.
- **C6:** closed and independently verified.
- **C7 and C14:** closed. Both are owner-attested with screenshots on file, not verified by security. The independent penetration test should check both settings.
- **Concurrency change:** no re-review needed.

| Number | Condition | Owner |
|---|---|---|
| S1 | Save an authenticated `GET /repos/andrewodoom/DeCura-Mobile-App/rulesets/25983499` response showing `"bypass_actors": []`, with its retrieval time, in the private validation store beside the screenshot. Cite it from the `SEC-14-T01` pass entry. Re-capture it whenever the ruleset's `updated_at` changes. | Kofi |
| S2 | Change-control rule for any new or changed workflow: no other workflow may use the job names "Secret scan (full history)" or "Audit, type check, lint and test". A required check is tied to GitHub Actions (integration 15368), not to `ci.yml`, so a reused name could satisfy it without `ci.yml` running. | Every reviewer of a workflow change |
| S3 | Change-control rule for any new workflow: its concurrency group must not start with `ci-`, or `github.workflow` goes back into the `ci.yml` group. Otherwise the two workflows could cancel each other's pull request runs. | Every reviewer of a workflow change |

S2 and S3 go on the quality assurance change-control checklist for workflow changes.
