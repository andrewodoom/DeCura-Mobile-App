# Council review — Expo project (milestone 0, part 1, item 3)

| | |
|---|---|
| Item reviewed | Branch `change/m0-expo-project`: Expo project at the repository root, app checks switched on in `.github/workflows/ci.yml` |
| Requirements | DECURA-REL1-2026-001: SEC-07, QA-01, QA-04, QA-10; closes the conditions carried from `2026-10-28-m0-ci-workflow.md` section 6 |
| Review date | 29 October 2026 |
| Reviewers | Quality assurance and validation; mobile engineering; security and development operations, run independently and in parallel |
| Requested by | Andrew Kofi Odoom |
| Change classification | Major: new codebase baseline. No app logic, data handling or user-facing feature. |
| Outcome | **Approve with conditions** from all three advisers. Conditions applied (section 3) or deferred with reasons (section 4). DEV-M0-01 closed after merge on the observed run (section 5). |

## 1. Verdicts

| Adviser | Verdict | Grounds |
|---|---|---|
| Quality assurance and validation | Approve with conditions | No observed CI run yet; artifact procedure and challenge tests incomplete; test naming against QA-01; waiver procedure not written |
| Mobile engineering | Approve with conditions | iPad support on by default; web target not installed; lint would walk generated native folders; version drift unchecked |
| Security and development operations | Approve with conditions | Audit gate passed on an empty report; waiver named one dependent where there are three; waiver matched on advisory only; expiry format and horizon unchecked |

## 2. Baseline

| Item | Version |
|---|---|
| Node.js | 24.22.2 (`.nvmrc`; `engines` `>=24.22.2 <25`) |
| Expo SDK | 58.0.21, blank TypeScript template |
| React Native / React | 0.88.1 / 19.3.0 |
| TypeScript | 6.0.3 |
| Jest / jest-expo / Testing Library | 30.5 / 58.0.13 / 14.1 |
| ESLint | 9.39, `eslint-config-expo/flat` |
| actions/upload-artifact | v7.0.2, `cf430e030ddbb5b0abf93d22962f4752f3646cd9` (verified by security) |

Not copied from the template: `AGENTS.md` and `.claude/settings.json` (agent configuration is set by the owner, not a template), and `LICENSE` (Expo's copyright; the app's licence is the owner's decision).

## 3. Conditions applied

| Source | Condition | Change |
|---|---|---|
| Security C1 | Audit gate must fail on an empty, truncated or error report | `scripts/check-audit.sh` rejects any report that is not a valid `npm audit` version 2 report |
| Security C2 | Waiver names every dependent | `audit-waivers.json` lists `@expo/cli`, `eslint-plugin-react-hooks` and `zod-validation-error`; exit condition is "no installed package resolves a zod version below 4.6.6" |
| Security C3 | Waiver must not silently cover a new path | Waivers carry `dependents`; the check fails if the package gains any other direct dependent |
| Security C4, QA 6 | Field, date-format and horizon checks; `LC_ALL=C` | Check fails on an empty field, a date not `YYYY-MM-DD`, or an expiry more than 30 days ahead (QA's 30 days, stricter than security's 90) |
| QA 6 | Written waiver procedure | `docs/security/README.md` |
| QA 7 | Skipped-test allowlist staleness | `scripts/check-skipped-tests.sh` fails on an entry for a test that is not skipped, and on a report with no tests |
| QA 2 | gitleaks report kept; copy procedure written | `secret-scan` job writes and uploads a redacted JSON report; procedure in `docs/validation/README.md` |
| QA 3 | Challenge tests for every gate | Section 6 |
| QA 4 | Test naming against QA-01 | Test renamed `QA-04-T02 test tooling`; matrix row `QA-04,,QA-04-T02,unit,Not run,` added |
| QA 5 | Script comment matches the matrix | `check-skipped-tests.sh` "contributes to QA-04-T01" |
| Mobile F1 | iPad not in release 1 scope | `ios.supportsTablet` set to `false`. product-design-science to confirm scope; stricter position applied meanwhile. |
| Mobile F2 | Web is not a target | `web` script, `web` block and `assets/favicon.png` removed |
| Mobile F4 | Lint ignores generated folders | `ios/*`, `android/*`, `.expo/*` ignored |
| Mobile F5 | Install-script decision recorded | `docs/security/README.md` |
| Mobile F8, F9 | Version ranges | `engines` range; `@types/jest` `~30.0.0` |
| Mobile F10 | Expo version drift checked | CI step "Expo dependency versions" (`npx expo install --check`) |
| Found in challenge tests | Jest passed with no tests | `jest-expo` sets `passWithNoTests: true`; overridden to `false` in `package.json` |
| Security point 3 | No sensitive data in tests | Rule in `docs/security/README.md` |

## 4. Deferred or not adopted

| Source | Item | Reason |
|---|---|---|
| Security C5 | CODEOWNERS with required code-owner review | **Not adopted for now.** The owner is the only contributor. GitHub does not let an author approve their own pull request, so required code-owner review would block every merge. Revisit when a second contributor joins. Fork pull requests cannot reach secrets or write to the repository (verified by security). |
| Mobile F3 | App slug `decura` | Owner to confirm before `eas init`; recorded in the build-profiles change |
| Mobile F6 | Separate `tsconfig.test.json` | Optional; revisit if test globals leak into app code |
| Mobile F7 | tsconfig `include` for typed routes | With the Expo Router change |
| Mobile F11 | Placeholder smoke test | Replaced with the first real screen |
| Mobile hand-off | Storage interface that tests can swap for a fake | A testability requirement of the REQ-ARC-01 data layer change |
| QA 8 | Waiver expires 2026-11-28, so the scheduled run fails then | Known issue, owner Andrew Kofi Odoom. Renew under a new review or remove when the exit condition is met. |

## 5. Deviation DEV-M0-01: closure

The skip step and every condition that read it are removed (`ci.yml`, job "Audit, type check, lint and test", name unchanged). DEV-M0-01 closes when a GitHub run of this pull request is observed with every app-checks step executed. Record the run identifier and commit here, and close DEV-M0-01 in the milestone 0 installation qualification record.

| Item | Value |
|---|---|
| Run | 40915437424 (`pull_request`, pull request 7): https://github.com/andrewodoom/DeCura-Mobile-App/actions/runs/40915437424 |
| Commit | `0b4fafa` (pull request head). GitHub tested the temporary merge commit `e6d40ad`, which names the artifacts. |
| Result | Both jobs success. Every app-checks step concluded success and none was skipped: Set up Node.js, Install exact locked dependencies, Traceability matrix, Dependency audit, Expo dependency versions, Type check, Lint, Test, Skipped tests, Upload reports. |
| After merge | Run 40915624905 (`push`, `8f21ad4`) success, 2026-10-29 16:52 UTC |
| Observed | Primary agent, from the public GitHub API, 29 October 2026 |
| Status | **DEV-M0-01 closed**, 29 October 2026 |

## 6. Challenge tests (29 October 2026)

Run locally by the primary agent on macOS, Node 24.22.2, after `rm -rf node_modules && npm ci --ignore-scripts`. Full output kept in the private validation store as `2026-10-29-m0-expo-project-challenge-tests.txt`.

| Gate | Case | Expected | Observed |
|---|---|---|---|
| All seven app-check steps | Change as committed | Pass | Pass |
| Dependency audit | Empty, truncated and error reports | Fail | Fail |
| Dependency audit | No waiver; expired; malformed date; beyond 30 days; empty `reason`; missing `approved_by`; unlisted dependent; stale waiver | Fail | Fail |
| Lint | `var` and an unused variable | Fail | Fail |
| Type check | String assigned to a number | Fail | Fail |
| Test | A failing test | Fail | Fail |
| Test | No tests | Fail | **Passed at first** (`jest-expo` preset); fails after the override in section 3 |
| Skipped tests | Report with no tests; unjustified skip; stale allowlist entry | Fail | Fail |

Not covered here: C8, the secret-scan challenge with a planted fake key, remains open from `2026-10-28-m0-ci-workflow.md`.

## 7. Traceability matrix

No result changes in this change, because no CI run has been observed. After a green run of this pull request:
- `QA-01-T01` can move to Pass, linked to that run's "Traceability matrix" step.
- `SEC-07-T01` can move to Pass, linked to the run and this record, noting that the result relies on the zod waiver. Security to confirm.
- `QA-04-T01`, `QA-10-T01` and `QA-11-T01` stay Not run until the release candidate.
- `QA-04-T02` (new) can move to Pass, linked to the run's "Test" step.

### After merge (29 October 2026)

- **QA-01-T01:** Pass, linked to run 40915437424.
- **QA-04-T02:** Pass, linked to run 40915437424.
- **SEC-07-T01:** stays Not run until security confirms that a pass relying on the zod waiver is acceptable.

Run artifacts, kept by GitHub until 27 January 2027, are to be copied to the private validation store under the procedure in `docs/validation/README.md`:

| Artifact | Size | GitHub digest |
|---|---|---|
| `app-check-reports-e6d40add0cec84306eb8e01b5a00aa12dd79cb43` | 1,985 bytes | `sha256:0195067f2df88c97dda89ea0d3f35d93a64d6c45f78c24a29b9b4398f6f0e79d` |
| `secret-scan-report-e6d40add0cec84306eb8e01b5a00aa12dd79cb43` | 145 bytes | `sha256:cb63f1b1b4160af0440349f29c63d8377d520c5ff9681c851a07f5653c0f8cba` |

Open item: on pull requests, artifact names carry the temporary merge commit rather than the pull request head. Name them with `github.event.pull_request.head.sha || github.sha` in the next workflow change.

## 8. Governance updates

- DECURA-CSV-VAL-MOB-2026-001, milestone 0 installation qualification record:
  - the baseline in section 2;
  - DEV-M0-01 closure;
  - the zod waiver as an open known issue with its expiry;
  - the waiver and skipped-test procedures;
  - the challenge test output.
- Describe the SEC-07 waiver process in the plan at its next revision.
- DECURA-CSV-VAD-2026-001 change log: a major change (new codebase baseline). None of the 44 documented prototype test cases (QA-05) is mapped yet.
- No update to DECURA-DQF-2026-001 or `docs/governance/README.md`.
