# CODEX Working Spec

This document defines the default execution pattern for this repository.

## 1) Branch Strategy

- Never work directly on `main`.
- Use one of:
  - `feature/<short-desc>`
  - `chore/<short-desc>`
  - `fix/<short-desc>`
  - `docs/<short-desc>`
  - `refactor/<short-desc>`
  - `test/<short-desc>`

## 2) Commit/PR Commands

- Commit and push:
  - `pnpm cp -- "<commit message>" [branch-if-on-main]`
- Create PR:
  - `pnpm pr -- "<title>" "<body>" [base]`
- End-to-end auto flow (AI message generation + commit + PR):
  - `pnpm ship -- [base] [branch-if-on-main]`
- Manual deploy workflow trigger:
  - `pnpm deploy`

## 3) Commit Message Rules

- Follow Conventional Commits:
  - `feat: ...`
  - `fix: ...`
  - `chore: ...`
  - `docs: ...`
  - `refactor: ...`
  - `test: ...`
- Keep subject short and action-oriented.

## 4) PR Rules

- Base branch: `main`
- Keep PR scope focused.
- Include:
  - What changed
  - Why
  - How validated

## 5) Quality Gates

- Local hooks:
  - `pre-commit`: `lint-staged` + `pnpm typecheck`
  - `commit-msg`: `commitlint`
  - `pre-push`: `pnpm test`
- PR checks (`.github/workflows/pr-review.yml`):
  - ESLint reviewdog comment
  - `pnpm typecheck`
  - `pnpm test`
  - AI PR review comment (Korean, if `OPENAI_API_KEY` exists)

## 6) AI Review Requirements

- Review language: Korean.
- Priority order:
  - Bugs/regressions
  - Security risks
  - Missing tests
- If no major issue:
  - `치명적인 이슈를 찾지 못했습니다.`

## 7) Validation Pattern (Always)

1. `pnpm lint`
2. `pnpm typecheck`
3. `pnpm test`
4. Push branch
5. Confirm PR checks on GitHub

## 8) Recovery Pattern

- If checks fail:
  - Fix code
  - Re-run local validation
  - Push follow-up commit
- If gh auth fails:
  - `gh auth logout -h github.com -u <account>`
  - `gh auth login -h github.com -p https -w`
  - `gh auth status`
