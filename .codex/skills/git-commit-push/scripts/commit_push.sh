#!/usr/bin/env bash
set -euo pipefail

msg="${1:-}"
branch_arg="${2:-}"

usage() {
  echo "Usage: ./scripts/commit_push.sh \"<message>\" [feature/<short-desc>]"
}

current="$(git branch --show-current)"
if [[ -z "$current" ]]; then
  echo "Not on a branch. Aborting."
  exit 1
fi

if [[ "$current" == "main" ]]; then
  if [[ -z "$branch_arg" ]]; then
    echo "On main. Provide a feature branch name: feature/<short-desc>."
    exit 1
  fi
  git checkout -b "$branch_arg"
  current="$branch_arg"
fi

if [[ "$current" != feature/* ]]; then
  echo "Branch must be feature/* (current: $current)."
  exit 1
fi

git status -sb

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
