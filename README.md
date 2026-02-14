# hanini

Next.js toy project.

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- ESLint + Prettier
- Vitest + Testing Library
- Husky + lint-staged + Commitlint

## Frontend Defaults

- Mobile-first UI with desktop verification
- Accessibility baseline (semantic markup, keyboard reachability, focus visibility)
- Required UI states: loading / empty / error
- Keep presentational components separate from data/side-effect logic
- Source of truth for detailed rules: `CODEX.md`

## Project AI Setup

- Primary project context files:
  - `CODEX.md` (implementation rules and checklists)
  - `README.md` (workflow and commands)
- Before AI-assisted changes, provide clear intent in prompt:
  - feature goal
  - constraints (UI/UX, performance, accessibility)
  - expected output files
- For frontend tasks, require:
  - mobile + desktop behavior
  - loading/empty/error states
  - keyboard accessibility and focus visibility

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
- `pnpm deploy:pr` Trigger deploy for current branch PR
- `pnpm deploy:pr -- <pr-number>` Trigger deploy for a specific PR
- `pnpm release:pr` Check pass -> merge current branch PR to `main` -> deploy `main`
- `pnpm release:pr -- <pr-number> [squash|merge|rebase]` Release specific PR

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
- Agent spec: `AGENTS.md`

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

# Deploy current PR branch
pnpm deploy:pr

# Release PR (checks -> merge main -> deploy main)
pnpm release:pr
```
