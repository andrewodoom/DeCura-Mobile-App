# Council review — Continuous integration workflow (milestone 0)

| | |
|---|---|
| Item reviewed | `.github/workflows/ci.yml` on branch `change/m0-ci-workflow` (new file) |
| Requirements | DECURA-REL1-2026-001: SEC-01, SEC-07, SEC-14, QA-04 |
| Review date | 28 October 2026 |
| Reviewers | Quality assurance and validation; security and development operations, run independently and in parallel |
| Requested by | Andrew Kofi Odoom |
| Change classification | Minor: new supporting infrastructure, no change to system behaviour. In scope of the milestone 0 installation qualification under DECURA-CSV-VAL-MOB-2026-001. |
| Outcome | **Approve with conditions** from both advisers. C1, C2, C3, C5, C11 and C13 applied in this change (section 9); the rest are open. |

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

At the owner's request, the concurrency group is now `ci-${{ github.ref }}-${{ github.event_name == 'push' && github.sha || 'pr' }}`. Each push to `main` gets its own group, so a run on `main` can be neither cancelled nor replaced while it waits in the queue. This goes further than the reviewed fix in section 2. Pull request runs still cancel older runs on the same pull request. Scheduled and manual runs share the group of their ref, are never cancelled, and at most one waits at a time. This change has not been re-reviewed by either adviser.
