#!/usr/bin/env bash
set -euo pipefail

if ! command -v gh >/dev/null 2>&1; then
  echo "gh CLI not found. Install GitHub CLI first."
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "gh auth is not ready. Run: gh auth login -h github.com -p https -w"
  exit 1
fi

pr_arg="${1:-}"

if [[ -n "$pr_arg" ]]; then
  branch="$(gh pr view "$pr_arg" --json headRefName -q .headRefName)"
  pr_url="$(gh pr view "$pr_arg" --json url -q .url)"
else
  branch="$(git branch --show-current)"
  if [[ -z "$branch" ]]; then
    echo "Not on a branch. Aborting."
    exit 1
  fi
  if ! gh pr view --head "$branch" --json url >/dev/null 2>&1; then
    echo "No open PR found for branch: $branch"
    echo "Use: pnpm deploy:pr -- <pr-number>"
    exit 1
  fi
  pr_url="$(gh pr view --head "$branch" --json url -q .url)"
fi

echo "Deploy target PR: $pr_url"
echo "Deploying branch: $branch"
bash ./scripts/deploy-pages.sh "$branch"
