#!/usr/bin/env bash
set -euo pipefail

if ! command -v gh >/dev/null 2>&1; then
  echo "gh CLI not found. Install GitHub CLI first."
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  if command -v curl >/dev/null 2>&1; then
    if ! curl -fsS --connect-timeout 5 https://api.github.com >/dev/null 2>&1; then
      echo "GitHub API is unreachable (network/VPN/firewall issue)."
      echo "Please check network access to api.github.com and retry."
      exit 1
    fi
  fi
  echo "gh auth is not ready. Run: gh auth login -h github.com -p https -w"
  exit 1
fi

repo="$(gh repo view --json nameWithOwner -q .nameWithOwner)"
branch="${1:-main}"

echo "Triggering GitHub Pages deploy workflow on ${repo} (${branch})..."
gh workflow run gh-pages.yml --ref "$branch"

echo "Triggered. Recent runs:"
gh run list --workflow gh-pages.yml --limit 3
