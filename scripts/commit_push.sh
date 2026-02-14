#!/usr/bin/env bash
set -euo pipefail

msg="${1:-}"
branch_arg="${2:-}"

current="$(git branch --show-current)"
if [[ -z "$current" ]]; then
  echo "Not on a branch. Aborting."
  exit 1
fi

if [[ "$current" == "main" ]]; then
  if [[ -z "$branch_arg" ]]; then
    echo "On main. Provide a branch name like feature/<desc> or chore/<desc>."
    exit 1
  fi
  git checkout -b "$branch_arg"
  current="$branch_arg"
fi

if [[ "$current" != feature/* && "$current" != chore/* && "$current" != fix/* && "$current" != docs/* && "$current" != refactor/* && "$current" != test/* ]]; then
  echo "Branch must be feature/*, chore/*, fix/*, docs/*, refactor/*, or test/* (current: $current)."
  exit 1
fi

git add -A

if [[ -z "$msg" ]]; then
  files="$(git diff --cached --name-only | head -n 3 | tr '\n' ' ')"
  if [[ -z "$files" ]]; then
    echo "No staged changes to commit."
    exit 1
  fi
  msg="Update ${files%% }"
fi

git commit -m "$msg"
git push -u origin "$current"
