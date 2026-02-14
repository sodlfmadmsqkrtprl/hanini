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

## Git Workflow

- Work on `feature/*` branches
- Commit messages follow Conventional Commits
- PRs target `main`

## Quality Gates

- `pre-commit`: lint-staged + typecheck
- `commit-msg`: commitlint
- `pre-push`: tests
- GitHub Pages deploys on pushes to `main` via `.github/workflows/gh-pages.yml`

## Templates

- PR template: `.github/pull_request_template.md`
- Issue templates: `.github/ISSUE_TEMPLATE/*`
