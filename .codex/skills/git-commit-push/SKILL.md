---
name: git-commit-push
description: 'Stage, commit, and push changes with feature/* branching and safety checks. Use when the user asks to commit, push, save, or publish local changes to GitHub, or wants a standard commit workflow in this project.'
---

# Git Commit + Push

Follow this workflow to commit and push changes safely with the project's feature-branch rule.

## Workflow

1. Confirm repository root and show status.
2. Ensure the working tree is clean after staging.
3. Enforce branch policy:

- If current branch is `main`, create or request a `feature/*` branch before committing.
- Prefer `feature/<short-desc>` naming.

4. Stage changes with `git add -A`.
5. Create a commit with a clear message.
6. Push with upstream tracking: `git push -u origin <branch>`.

## Preferred Commands

- Status: `git status -sb`
- Branch: `git branch --show-current`
- Create feature branch: `git checkout -b feature/<short-desc>`
- Stage: `git add -A`
- Commit: `git commit -m "<message>"`
- Push: `git push -u origin <branch>`

## Bundled Script

Use `scripts/commit_push.sh` for a consistent flow:

```
./scripts/commit_push.sh ["<message>"] [feature/<short-desc>]
```

Behavior:

- If on `main`, requires a feature branch name as the second argument.
- Enforces `feature/*` naming.
- Stages, commits, and pushes.
- If message is omitted, generates one from staged file names.

## Notes

- If there are no changes to commit, stop and report.
- If push fails, surface the error and suggest `git pull --rebase` only when needed.
