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
merge_method="${2:-squash}" # squash|merge|rebase

if [[ "$merge_method" != "squash" && "$merge_method" != "merge" && "$merge_method" != "rebase" ]]; then
  echo "Invalid merge method: $merge_method (use squash|merge|rebase)"
  exit 1
fi

if [[ -n "$pr_arg" ]]; then
  pr_number="$pr_arg"
else
  branch="$(git branch --show-current)"
  if [[ -z "$branch" ]]; then
    echo "Not on a branch. Aborting."
    exit 1
  fi
  pr_number="$(gh pr list --state open --head "$branch" --json number -q '.[0].number')"
  if [[ -z "$pr_number" || "$pr_number" == "null" ]]; then
    if gh pr view --head "$branch" --json number >/dev/null 2>&1; then
      pr_number="$(gh pr view --head "$branch" --json number -q .number)"
    fi
  fi
  if [[ -z "$pr_number" || "$pr_number" == "null" ]]; then
    echo "No open PR found for branch: $branch"
    echo "Use: pnpm release:pr -- <pr-number> [squash|merge|rebase]"
    exit 1
  fi
fi

pr_json="$(gh pr view "$pr_number" --json number,url,state,isDraft,baseRefName,headRefName,statusCheckRollup)"

state="$(echo "$pr_json" | jq -r .state)"
is_draft="$(echo "$pr_json" | jq -r .isDraft)"
base_ref="$(echo "$pr_json" | jq -r .baseRefName)"
pr_url="$(echo "$pr_json" | jq -r .url)"

if [[ "$state" != "OPEN" ]]; then
  echo "PR #$pr_number is not OPEN (state: $state)"
  exit 1
fi

if [[ "$is_draft" == "true" ]]; then
  echo "PR #$pr_number is draft. Mark it ready first."
  exit 1
fi

if [[ "$base_ref" != "main" ]]; then
  echo "PR #$pr_number base is '$base_ref'. Expected 'main'."
  exit 1
fi

non_success_checks="$(echo "$pr_json" | jq -r '
  [.statusCheckRollup[]?
    | select(.status != "COMPLETED" or .conclusion != "SUCCESS")
    | .name] | join(",")
')"

if [[ -n "$non_success_checks" ]]; then
  echo "PR #$pr_number has non-passing checks: $non_success_checks"
  echo "Wait for checks to pass, then retry."
  exit 1
fi

echo "Merging PR: $pr_url"
case "$merge_method" in
  squash) gh pr merge "$pr_number" --squash --delete-branch=false ;;
  merge) gh pr merge "$pr_number" --merge --delete-branch=false ;;
  rebase) gh pr merge "$pr_number" --rebase --delete-branch=false ;;
esac

echo "Merged PR #$pr_number to main. Triggering deploy..."
bash ./scripts/deploy-pages.sh main
