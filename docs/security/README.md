# Security records

## Dependency audit waivers (SEC-07)

SEC-07 allows no unresolved critical or high vulnerability. An advisory is resolved by a fix, or by a waiver in `audit-waivers.json`. `scripts/check-audit.sh` enforces the rules below in continuous integration, including the weekly scheduled run.

A waiver is used only when no fixed version can be installed without breaking a supported dependency. Forcing a version with an npm override is not a substitute for review.

| Field | Rule |
|---|---|
| `advisory` | The GitHub advisory identifier, for example `GHSA-mrhx-c7xc-m3w5` |
| `package` | The vulnerable package |
| `severity` | As reported by `npm audit` |
| `dependents` | Every package that directly depends on the vulnerable one. The check fails if any other package starts depending on it, so a waiver never silently covers a new path, such as a runtime one. |
| `reason` | Where the package is used, why it is not reachable in the app bundle, and why no fix can be installed |
| `exit_condition` | The observable state that ends the waiver |
| `expires` | `YYYY-MM-DD`, at most 30 days after the day the check runs |
| `approved_by` | The owner, with date, and the security-devops review record |

- Every field is required. The check fails on an empty field, a malformed or too-distant date, an expired waiver, or a waiver that no longer matches an advisory.
- Renewing a waiver is a new change with a new security-devops review. Its expiry moves at most 30 days.
- When the exit condition is met, the change that removes the waiver records it in the review record.
- When a waiver expires, the scheduled run fails on purpose. The owner of the waiver renews or removes it.

## Dependency updates

Every version resolved in `package-lock.json`, direct or transitive, is adopted only through a reviewed change, and only once it has been published for at least 14 days. The publication date is the npm registry `time` entry for that version (`npm view <package> time`). The rule applies from 31 October 2026; the milestone 0 baseline, including expo 58.0.21, was taken before it existed and is recorded as such in `docs/reviews/2026-10-31-ci-expo-version-reminder.md`.

A version published more recently is adopted early only:
- to fix a high or critical advisory, recording the advisory, that the release comes from the expected publisher (npm provenance where available), and a look at its changelog or diff; or
- because a build or store submission requires it, recording the requirement.

Either way the security-devops review records why.

To adopt, resolve the whole tree as it stood 14 days ago, so a direct update cannot pull in younger transitive releases:

```sh
npm install <package>@<version> --before="<date 14 days ago, YYYY-MM-DDT00:00:00Z>"
```

Expo SDK packages move together in one change: `expo`, then the companions aligned to that `expo` with `EXPO_OFFLINE=1 npx expo install --fix` (the same `--before` date in `.npmrc` for that change), including `jest-expo`, `expo-status-bar`, `eslint-config-expo` and any package the SDK pins.

Continuous integration checks Expo in two ways:
- **Expo set consistency**, in the required job: every Expo package matches the versions bundled with the locked `expo` package. It runs offline, so its result depends only on the commit, and it blocks.
- **Expo version drift**, its own job on the weekly and manual runs only: Expo expects newer versions than the lockfile has. It warns while a newer version is under 14 days old, fails once one is old enough to adopt, and fails if the check cannot run.

## Install scripts

Continuous integration runs `npm ci --ignore-scripts`, and npm 11 blocks dependency install scripts locally unless approved. Three dev-only packages have install scripts. They are left unapproved because each has a working fallback:

| Package | Script | Fallback |
|---|---|---|
| `@parcel/watcher` | Builds from source | Prebuilt binary from an optional dependency |
| `fsevents` (macOS only) | Native build | Slower file watching |
| `unrs-resolver` | Fetches a native binary | Binary already provided by an optional dependency |

If a package ever needs its script, approve that one package only (`npm install-scripts approve <package>`), never all scripts, and record it here.

EAS Build runs `npm ci` with scripts enabled, so builds and CI install differently. The change that adds build profiles records whether scripts stay enabled there.

## Tests and published reports

CI uploads test and audit reports as run artifacts. In a public repository, anyone signed in to GitHub can download them, and failure messages appear in them. Tests and fixtures must therefore never contain real or realistic health data, tokens, keys or environment values.

## Local development server

`npx expo start` listens on the local network by default. On a network you do not control, start it with `--localhost`.
