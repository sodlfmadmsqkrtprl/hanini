# hanini

Next.js toy project.

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- ESLint + Prettier
- Vitest + Testing Library
- Husky + lint-staged + Commitlint

## Scripts

- `pnpm dev` Start dev server
- `pnpm build` Build
- `pnpm start` Start production server
- `pnpm lint` Lint
- `pnpm typecheck` Type check
- `pnpm test` Test once
- `pnpm test:watch` Watch tests
- `pnpm cp -- "<commit message>" [branch-if-on-main]` Commit and push
- `pnpm pr -- "<title>" "<body>" [base]` Create PR
- `pnpm ship -- [base] [branch-if-on-main]` Auto-generate commit/PR message and run commit+PR
- `pnpm deploy` Trigger GitHub Pages deploy workflow (`main` by default)
- `pnpm deploy -- <branch>` Trigger deploy workflow for a specific branch

## Git Workflow

- Work on `feature/*`, `chore/*`, `fix/*`, `docs/*`, `refactor/*`, `test/*` branches
- Commit messages follow Conventional Commits
- PRs target `main`
- Prefer PR merge instead of direct push to `main` to keep review history

## Quality Gates

- `pre-commit`: lint-staged + typecheck
- `commit-msg`: commitlint
- `pre-push`: tests
- GitHub Pages deploys on pushes to `main` via `.github/workflows/gh-pages.yml`

## Templates

- PR template: `.github/pull_request_template.md`
- Issue templates: `.github/ISSUE_TEMPLATE/*`
- Working spec: `CODEX.md`

## PR Auto Review

- Workflow: `.github/workflows/pr-review.yml`
- Trigger: `pull_request` (`opened`, `synchronize`, `reopened`, `ready_for_review`)
- `reviewdog` runs ESLint and leaves inline PR comments
- `typecheck` and `test` run as PR checkers

## GitHub Auth (gh CLI)

If `gh` token expires or becomes invalid:

```bash
gh auth logout -h github.com -u sodlfmadmsqkrtprl
gh auth login -h github.com -p https -w
gh auth status
```

Recommended scopes:

- `repo`
- `workflow`
- `read:org`
- `gist`

For `pnpm ship`, set `OPENAI_API_KEY` to enable AI-generated commit/PR text.

```bash
export OPENAI_API_KEY="<YOUR_KEY>"
```

## Deploy Command

`pnpm deploy` uses `scripts/deploy-pages.sh` and does:

1. Check `gh` availability and auth status
2. Trigger `.github/workflows/gh-pages.yml` with `gh workflow run`
3. Print recent deploy workflow runs

## Quick Command Examples

```bash
# Commit + push
pnpm cp -- "feat: add dashboard filters"

# Create PR to main
pnpm pr -- "feat: add dashboard filters" "- Add filter UI\n- Add tests"

# AI message generation + commit + PR
pnpm ship
```
