#!/usr/bin/env bash
# Reports Expo packages behind the versions Expo currently expects for this SDK.
# Fails only when an expected version has been published for at least
# $min_days days, so a failure means "adopt it now" (docs/security/README.md).
# A newer release still inside that period warns. A check that cannot run fails.
set -euo pipefail
export LC_ALL=C

min_days=14
warn() { echo "::warning title=Expo version drift::$*"; }

set +e
output=$(npx expo install --check 2>&1)
status=$?
set -e
echo "$output"
if [ "$status" -eq 0 ]; then
  echo "Expo versions: current."
  exit 0
fi

# Drift lines look like "  expo@58.0.21 - expected version: ~58.0.22".
drift=$(echo "$output" | sed -nE 's/^ *(@?[^@ ]+)@[^ ]+ - expected version: [~^]?([0-9][^ ]*)$/\1 \2/p')
if [ -z "$drift" ]; then
  echo "::error title=Expo version drift::The version check could not run or gave unexpected output (exit $status); see the step log."
  exit 1
fi

today=$(date -u +%Y-%m-%d)
due=""
while read -r pkg expected; do
  published=$(npm view "$pkg" time --json 2>/dev/null | jq -r --arg v "$expected" '.[$v] // empty')
  if [ -z "$published" ]; then
    warn "$pkg $expected: publish date not found; see the step log."
    continue
  fi
  eligible=$(jq -nr --arg p "$published" --argjson d "$min_days" \
    '($p | sub("\\.[0-9]+Z$"; "Z") | fromdateiso8601) + $d * 86400 | strftime("%Y-%m-%d")')
  if [[ "$today" < "$eligible" ]]; then
    warn "$pkg $expected was published on ${published%%T*}; it may be adopted from $eligible."
  else
    due="$due $pkg@$expected"
  fi
done <<< "$drift"

if [ -n "$due" ]; then
  echo "::error title=Expo version drift::Published at least $min_days days ago and not yet adopted:$due. Adopt them through a reviewed change (docs/security/README.md)."
  exit 1
fi
