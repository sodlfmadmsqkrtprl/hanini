---
name: gh-pr-create
description: 'Create GitHub pull requests from conventional branches (feature/chore/fix/docs/refactor/test) to main using the gh CLI. Use when the user asks to open/create/submit a PR, or wants to publish a branch for review.'
---

# GitHub PR Create

Create a PR from a conventional branch to `main` using GitHub CLI.

## Workflow

1. Confirm `gh` authentication: `gh auth status`.
2. Confirm current branch and policy:

- Must be on `feature/*`, `chore/*`, `fix/*`, `docs/*`, `refactor/*`, or `test/*` (not `main`).

3. Ensure the branch is pushed: `git push -u origin <branch>`.
4. Create PR targeting `main`.
5. Return the PR URL to the user.

## Preferred Commands

- Status: `git status -sb`
- Branch: `git branch --show-current`
- Push: `git push -u origin <branch>`
- PR create (auto-fill): `gh pr create --base main --head <branch> --title "<title>" --fill`
- PR create (explicit body): `gh pr create --base main --head <branch> --title "<title>" --body "<body>"`

## Bundled Script

Use `scripts/pr_create.sh` for a consistent flow:

```
./scripts/pr_create.sh ["<title>"] ["<body>"] [base]
```

Behavior:

- Enforces conventional branch prefixes.
- Pushes the current branch if needed.
- Defaults base to `main`.
- If title/body are omitted, generates them from branch name and commits.

## Notes

- If `gh auth status` fails, run `gh auth login` first.
- If there are uncommitted changes, stop and ask the user to commit.
