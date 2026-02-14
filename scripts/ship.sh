#!/usr/bin/env bash
set -euo pipefail

base="${1:-main}"
branch_if_main="${2:-}"

current="$(git branch --show-current)"
if [[ -z "$current" ]]; then
  echo "Not on a branch. Aborting."
  exit 1
fi

if [[ "$current" == "main" && -z "$branch_if_main" ]]; then
  branch_if_main="chore/auto-$(date +%Y%m%d-%H%M%S)"
fi

changed_files="$(git status --porcelain | awk '{print $2}' | tr '\n' ' ')"
diff_preview="$(git diff -- . ':(exclude)pnpm-lock.yaml' | head -c 12000)"
commit_log="$(git log --oneline -n 8)"

fallback_commit="chore: update project files"
if [[ -n "$changed_files" ]]; then
  first_file="$(echo "$changed_files" | awk '{print $1}')"
  fallback_commit="chore: update ${first_file}"
fi
fallback_title="chore: update project configuration"
fallback_body="- Automated update from branch workflow command\n- Includes commit and PR creation"

commit_msg="$fallback_commit"
pr_title="$fallback_title"
pr_body="$fallback_body"

if [[ -n "${OPENAI_API_KEY:-}" ]] && command -v curl >/dev/null 2>&1 && command -v jq >/dev/null 2>&1; then
  payload="$(jq -n \
    --arg branch "$current" \
    --arg files "$changed_files" \
    --arg diff "$diff_preview" \
    --arg log "$commit_log" \
    '{
      model: "gpt-5-mini",
      input: [
        {
          role: "system",
          content: "You generate git commit and PR messages. Respond ONLY valid JSON with keys: commit, title, body. commit must follow Conventional Commits (type: subject). Keep it concise and practical."
        },
        {
          role: "user",
          content: ("Branch: " + $branch + "\nChanged files: " + $files + "\nRecent commits:\n" + $log + "\nDiff preview:\n" + $diff)
        }
      ]
    }'
  )"

  if response="$(curl -fsS https://api.openai.com/v1/responses \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -H "Content-Type: application/json" \
    -d "$payload")"; then
    text="$(echo "$response" | jq -r '.output_text // ([.output[]?.content[]? | select(.type == "output_text") | .text] | join("\n"))')"
    clean="$(printf '%s\n' "$text" | sed -e 's/^```json$//' -e 's/^```$//')"
    if echo "$clean" | jq -e . >/dev/null 2>&1; then
      ai_commit="$(echo "$clean" | jq -r '.commit // empty')"
      ai_title="$(echo "$clean" | jq -r '.title // empty')"
      ai_body="$(echo "$clean" | jq -r '.body // empty')"
      if [[ -n "$ai_commit" ]]; then commit_msg="$ai_commit"; fi
      if [[ -n "$ai_title" ]]; then pr_title="$ai_title"; fi
      if [[ -n "$ai_body" ]]; then pr_body="$ai_body"; fi
    fi
  fi
fi

if [[ -n "$(git status --porcelain)" ]]; then
  bash ./scripts/commit_push.sh "$commit_msg" "$branch_if_main"
else
  echo "No local changes to commit. Skipping commit step."
fi

bash ./scripts/pr_create.sh "$pr_title" "$pr_body" "$base"
