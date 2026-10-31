# Council review — Expo version check in continuous integration

| | |
|---|---|
| Item reviewed | Branch `change/ci-expo-version-reminder`, based on `be55cb6`: `.github/workflows/ci.yml` (step "Expo set consistency" and job "Expo version drift"), `scripts/check-expo-drift.sh`, `docs/security/README.md` ("Dependency updates") |
| Trigger | Pull request 12 (`change/m0-supabase-environments`, head `2b4e958`), run [41201994052](https://github.com/andrewodoom/DeCura-Mobile-App/actions/runs/41201994052), failed at "Expo dependency versions": `expo@58.0.21 - expected version: ~58.0.22`. expo 58.0.22 was published at 2026-10-31T10:33:20Z, about two hours before the run. The same commit had no change to dependencies. |
| Requirements | SEC-14 and QA-04 (required checks reproducible and not falsely red); SEC-07 (weekly audit not hidden); mobile F10 of `2026-10-29-m0-expo-project.md`, with its new scope |
| Review date | 31 October 2026 |
| Reviewers | Quality assurance and validation; security and development operations; mobile engineering, run independently and in parallel |
| Requested by | Andrew Kofi Odoom, who chose to make the online check a reminder rather than adopt a version three hours old |
| Change classification | Minor: a supporting CI tool; no change to system behaviour; required check name kept |
| Outcome | **Approve with conditions** from all three. Conditions applied (section 2). Evidence from CI runs to be added (section 4). |

## 1. Verdicts

| Adviser | Verdict | Main grounds |
|---|---|---|
| Quality assurance and validation | Approve with conditions | First version failed open on any error; gave up the reproducible half of the check; weekly failure with no allowed fix would hide the audit; evidence and record |
| Security and development operations | Approve with conditions | Pull requests changing Expo packages would merge on a warning; weekly red hiding SEC-07; the current baseline predates the rule; transitive versions and enforcement; misleading warning text |
| Mobile engineering | Approve with conditions | Use the offline check to keep a blocking consistency gate; separate drift; adoption procedure; build and store exception; runtime fingerprint note for EAS |

## 2. Conditions applied

| Source | Condition | Change |
|---|---|---|
| Mobile 1; QA F2; security 1 | Keep a blocking, reproducible check on pull requests | Step "Expo set consistency" in the required job runs `npx expo install --check` with `EXPO_OFFLINE=1`, comparing against the versions bundled with the locked `expo` package. Verified locally on SDK 58 (section 3). |
| Mobile 2; QA F3; security 2 | The weekly result must not hide the audit or fail when no fix is allowed | Online check moved to its own job, "Expo version drift", on schedule and manual runs only. `scripts/check-expo-drift.sh` warns while a newer version is under 14 days old and fails once one is old enough to adopt. |
| QA F1; security 6 | No failing open; accurate messages | The drift script fails if the check cannot run or its output is not a recognised drift report, and names the earliest adoption date in its warning |
| Security 3; QA F4 | Baseline predates the rule | README: the rule applies from 31 October 2026; the milestone 0 baseline (expo 58.0.21, adopted about one day after publication) predates it. No downgrade. |
| Security 4; mobile 3 | Transitive versions and procedure | README: the rule covers every version in the lockfile; adopt with `npm install … --before=<14 days ago>`; Expo SDK packages move together, aligned with `EXPO_OFFLINE=1 npx expo install --fix` |
| Security 5; mobile 4 | Exceptions | README: early adoption only for a high or critical advisory (with provenance and changelog check) or a build or store requirement, recorded in the security review |
| QA F4 | Publication date defined | README: the npm registry `time` entry |
| S2, S3 of `2026-10-28-m0-ci-workflow.md` | Required check and concurrency unchanged | Job "Audit, type check, lint and test" keeps its name; the new job is not a required check; no new concurrency group |

## 3. Observed locally (31 October 2026, coding agent)

- Offline check on the project as installed: exit 0 ("Dependencies are up to date"). Online check: exit 1 (`expo@58.0.21 - expected version: ~58.0.22`).
- Challenge: `expo-status-bar` temporarily set to 1.0.0 in `node_modules`, then restored to 58.0.4. Offline check: exit 1, `expo-status-bar@1.0.0 - expected version: ~58.0.4`. The offline check detects a mismatch introduced by a commit.
- `scripts/check-expo-drift.sh` with a stand-in `npx` and real npm publish dates: up to date, exit 0; drift to 58.0.22 (published 31 October), exit 0 with the warning "may be adopted from 2026-11-14"; drift to 58.0.2 (published 1 October), exit 1 with an error naming `expo@58.0.2`; command not found (exit 127), exit 1 with "could not run".
- The workflow file parses as valid YAML. actionlint was not run.

## 4. Evidence from continuous integration

| Case | Expected | Run |
|---|---|---|
| This pull request's run (pull request 13, head `ed93330`) | "Expo set consistency" passes; job "Expo version drift" does not run | [41203682292](https://github.com/andrewodoom/DeCura-Mobile-App/actions/runs/41203682292): success; drift job not run |
| Manual run on this branch (`ed93330`) | "Expo version drift" concludes success with the 58.0.22 warning (inside 14 days) | [41203848188](https://github.com/andrewodoom/DeCura-Mobile-App/actions/runs/41203848188): all three jobs success; annotation "expo 58.0.22 was published on 2026-10-31; it may be adopted from 2026-11-14." |
| Pull request 12 re-run after this merges into its branch | Required job passes | Recorded in `2026-10-30-m0-supabase-environments.md` |

## 5. Known issues and follow-ups

| Item | When |
|---|---|
| Adopt expo 58.0.22 and its companions | From 14 November 2026, through a reviewed change (owner) |
| Dependabot (follow-up C10): `cooldown` of 14 days for npm, Expo packages grouped, no `pull_request_target` | When C10 is set up |
| EAS profiles change: state the runtime policy; an Expo patch adoption needs a new build if the fingerprint policy is used (mobile 5) | Build-profile change |
| Pull-request artifact names to use the head commit (open item from `2026-10-29-m0-expo-project.md`) | Not taken up here |
| DECURA-CSV-VAL-MOB-2026-001: CI configuration as installed; section 4 cases as operational qualification cases; the adoption rule as a procedure | Owner |

## 6. Approval

Approved by the owner's merge of pull request 13 (`ed93330`, merge commit `073641a`) by `andrewodoom` on 31 October 2026 at 13:16:15 UTC, after its checks passed. The pull request description was the commit message.
