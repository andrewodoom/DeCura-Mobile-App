#!/usr/bin/env bash
# QA-01-T01: every identifier in the release definition has at least one row in
# the traceability matrix, the matrix names no unknown identifier, and every row
# follows the column rules in docs/validation/README.md.
set -euo pipefail

definition="docs/release/release-1-definition.md"
matrix="docs/validation/traceability-matrix.csv"
header="requirement,risk,test identifier,test type,result,evidence link"
id_pattern='REQ-[A-Z]{3}-[0-9]{2}[a-z]?|SEC-[0-9]{2}|PRIV-[0-9]{2}|QA-[0-9]{2}'

failed=0
fail() { echo "FAIL: $*" >&2; failed=1; }

[ "$(head -n 1 "$matrix")" = "$header" ] || fail "header is not: $header"

# Fields are plain text, so a quote would mean a comma inside a field.
if grep -n '"' "$matrix"; then fail "matrix fields must not contain quotes"; fi

# Identifiers are the first cell of a table row in the definition.
defined=$(grep -oE "^\| ($id_pattern) \|" "$definition" | tr -d '| ' | sort -u)
traced=$(tail -n +2 "$matrix" | cut -d, -f1 | sort -u)

missing=$(comm -23 <(echo "$defined") <(echo "$traced"))
unknown=$(comm -13 <(echo "$defined") <(echo "$traced"))
[ -z "$missing" ] || fail "identifiers with no test: $(echo $missing)"
[ -z "$unknown" ] || fail "identifiers not in the definition: $(echo $unknown)"

# Row rules: six columns, test identifier is <requirement>-T<nn> and unique,
# test type and result from the controlled vocabulary.
row_errors=$(tail -n +2 "$matrix" | awk -F, '
  BEGIN {
    split("unit,integration,end-to-end,static analysis,manual,inspection,performance qualification", t, ",")
    for (i in t) types[t[i]] = 1
    split("Not run,Pass,Fail,Skipped (justified)", r, ",")
    for (i in r) results[r[i]] = 1
  }
  {
    line = NR + 1
    if (NF != 6) { print "line " line ": " NF " columns, expected 6"; next }
    if ($3 !~ ("^" $1 "-T[0-9][0-9]$")) print "line " line ": test identifier " $3 " does not match " $1
    if (seen[$3]++) print "line " line ": duplicate test identifier " $3
    if (!($4 in types)) print "line " line ": unknown test type \"" $4 "\""
    if (!($5 in results)) print "line " line ": unknown result \"" $5 "\""
    if ($5 != "Not run" && $6 == "") print "line " line ": result " $5 " has no evidence link"
  }')
[ -z "$row_errors" ] || fail $'row errors:\n'"$row_errors"

if [ "$failed" -ne 0 ]; then exit 1; fi
echo "Traceability matrix: $(echo "$defined" | wc -l | tr -d ' ') identifiers, $(($(wc -l < "$matrix") - 1)) tests, all rules pass."
