#!/usr/bin/env bash
set -euo pipefail

title="${1:-}"
body="${2:-}"
base="${3:-main}"

if ! gh auth status >/dev/null 2>&1; then
  echo "Not authenticated. Run: gh auth login -h github.com -p https -w"
  exit 1
fi

current="$(git branch --show-current)"
if [[ -z "$current" ]]; then
  echo "Not on a branch. Aborting."
  exit 1
fi

if [[ "$current" == "main" ]]; then
  echo "On main. Switch to feature/*, chore/*, fix/*, docs/*, refactor/*, or test/* first."
  exit 1
fi

if [[ "$current" != feature/* && "$current" != chore/* && "$current" != fix/* && "$current" != docs/* && "$current" != refactor/* && "$current" != test/* ]]; then
  echo "Branch must be feature/*, chore/*, fix/*, docs/*, refactor/*, or test/* (current: $current)."
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Working tree is not clean. Commit changes first."
  exit 1
fi

git push -u origin "$current"

if gh pr view --head "$current" --json url >/dev/null 2>&1; then
  gh pr view --head "$current" --json url -q .url
  exit 0
fi

if [[ -z "$title" ]]; then
  short="${current#*/}"
  title="$(echo "$short" | tr '-' ' ' | sed -e 's/  */ /g' -e 's/^./\U&/')"
fi

if [[ -z "$body" ]]; then
  changes="$(git log --oneline --reverse "$base..$current" | sed 's/^/- /')"
  if [[ -n "$changes" ]]; then
    body="$changes"
  else
    body="- Updates in $current"
  fi
fi

gh pr create --base "$base" --head "$current" --title "$title" --body "$body"
