#!/usr/bin/env bash
# SEC-07-T01: the dependency audit shows no unresolved critical or high
# vulnerability. An advisory is resolved only by a fix or by a current entry in
# docs/security/audit-waivers.json (rules in docs/security/README.md). Reads an
# `npm audit --json` report; needs node_modules for the dependents check.
set -euo pipefail
export LC_ALL=C

waivers="docs/security/audit-waivers.json"
report="${1:-reports/npm-audit.json}"
max_days=30

failed=0
fail() { echo "FAIL: $*" >&2; failed=1; }

# An empty, truncated or error report must never count as a clean audit.
if ! jq -e '(.auditReportVersion == 2) and (.vulnerabilities | type == "object") and (.error == null)' \
    "$report" >/dev/null 2>&1; then
  echo "FAIL: $report is not a valid npm audit report" >&2
  exit 1
fi

today=$(jq -nr 'now | strftime("%Y-%m-%d")')
latest=$(jq -nr --argjson d "$max_days" 'now + $d * 86400 | strftime("%Y-%m-%d")')

# Every waiver is complete, dated YYYY-MM-DD, and expires within $max_days days.
field_errors=$(jq -r --arg latest "$latest" '.[] | . as $w
  | (["advisory", "package", "reason", "exit_condition", "approved_by"][]
     | select((($w[.] // "") | tostring) == "") | "\($w.advisory // "?"): \(.) is empty"),
    (select((($w.expires // "") | tostring | test("^[0-9]{4}-[0-9]{2}-[0-9]{2}$")) | not)
     | "\($w.advisory // "?"): expires is not YYYY-MM-DD"),
    (select((($w.expires // "") | tostring) > $latest)
     | "\($w.advisory // "?"): expires after \($latest), more than '"$max_days"' days ahead"),
    (select(($w.dependents // []) | length == 0) | "\($w.advisory // "?"): dependents is empty")' "$waivers")
[ -z "$field_errors" ] || fail $'invalid waivers:\n'"$field_errors"

found=$(jq -r '[.vulnerabilities[].via[] | objects
  | select(.severity == "high" or .severity == "critical")
  | .url | sub(".*/"; "")] | unique[]' "$report")
waived=$(jq -r --arg today "$today" '.[] | select(.expires >= $today) | .advisory' "$waivers" | sort -u)
expired=$(jq -r --arg today "$today" '.[] | select(.expires < $today) | "\(.advisory) (expired \(.expires))"' "$waivers")
listed=$(jq -r '.[].advisory' "$waivers" | sort -u)

unresolved=$(comm -23 <(echo "$found" | sed '/^$/d') <(echo "$waived" | sed '/^$/d'))
stale=$(comm -13 <(echo "$found" | sed '/^$/d') <(echo "$listed" | sed '/^$/d'))

[ -z "$unresolved" ] || fail "unresolved high or critical advisories: $(echo $unresolved)"
[ -z "$expired" ] || fail "expired waivers: $expired"
[ -z "$stale" ] || fail "waivers no longer needed, remove them: $(echo $stale)"

# A waiver covers only the dependency paths it names. A new direct dependent of
# the waived package (for example a runtime one) is not covered.
while IFS=$'\t' read -r package allowed; do
  [ -n "$package" ] || continue
  actual=$(npm explain "$package" --json 2>/dev/null | jq -r '[.[].dependents[].from.name] | unique[]')
  extra=$(comm -23 <(echo "$actual" | sed '/^$/d') <(echo "$allowed" | tr ' ' '\n' | sed '/^$/d' | sort -u))
  [ -z "$extra" ] || fail "$package has dependents not named in its waiver: $(echo $extra)"
done < <(jq -r '.[] | "\(.package)\t\((.dependents // []) | join(" "))"' "$waivers")

if [ "$failed" -ne 0 ]; then exit 1; fi
echo "Dependency audit: $(echo "$found" | sed '/^$/d' | wc -l | tr -d ' ') high or critical advisories, all covered by current waivers."
