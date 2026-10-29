#!/usr/bin/env bash
# Contributes to QA-04-T01: no test is skipped without documented justification.
# Reads the Jest JSON report and fails on any test that did not run (skip, todo)
# unless its full name is listed in docs/validation/skipped-tests.json with a
# reason. An entry for a test that now runs or no longer exists must be removed.
set -euo pipefail
export LC_ALL=C

allowlist="docs/validation/skipped-tests.json"
report="${1:-reports/jest.json}"

failed=0
fail() { echo "FAIL: $*" >&2; failed=1; }

if ! jq -e '(.testResults | type == "array") and (.numTotalTests > 0)' "$report" >/dev/null 2>&1; then
  echo "FAIL: $report is not a Jest report with at least one test" >&2
  exit 1
fi

not_run=$(jq -r '[.testResults[].assertionResults[]
  | select(.status != "passed" and .status != "failed") | .fullName] | unique[]' "$report")
allowed=$(jq -r '.[] | select((.justification // "") != "") | .test' "$allowlist" | sort -u)
listed=$(jq -r '.[].test' "$allowlist" | sort -u)

unjustified=$(comm -23 <(echo "$not_run" | sed '/^$/d') <(echo "$allowed" | sed '/^$/d'))
stale=$(comm -13 <(echo "$not_run" | sed '/^$/d') <(echo "$listed" | sed '/^$/d'))

[ -z "$unjustified" ] || fail $'tests skipped without justification in '"$allowlist"$':\n'"$unjustified"
[ -z "$stale" ] || fail $'allowlist entries for tests that are not skipped, remove them:\n'"$stale"

if [ "$failed" -ne 0 ]; then exit 1; fi
echo "Skipped tests: $(echo "$not_run" | sed '/^$/d' | wc -l | tr -d ' '), all justified."
