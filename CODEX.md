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

## 9) Anti-Patterns (Do Not Introduce)

- Hidden side effects in render paths or utility functions.
- `any` type without a clear boundary reason.
- Dead code, unused variables, commented-out legacy blocks.
- Broad `catch` that swallows errors without context/logging.
- Silent fallback behavior that hides failures from users/operators.
- Large PRs mixing unrelated concerns (feature + refactor + tooling).
- Hardcoded secrets, tokens, endpoints, or environment-specific values.
- Duplicate business logic across components/hooks/utils.
- Ambiguous names (`data`, `temp`, `value`) for domain-critical fields.
- Skipping tests for bug fixes or behavior changes.

## 10) Code Quality Rules

- Prefer small pure functions over large stateful blocks.
- Keep one source of truth for domain rules; avoid copied condition trees.
- Validate inputs at boundaries (API, form, env, external response).
- Fail fast with actionable error messages.
- Use explicit types for public interfaces and return values.
- Keep component responsibilities narrow (UI vs state vs side effects).
- Keep diffs minimal: solve root cause, avoid unrelated formatting churn.
- Add/adjust tests whenever behavior changes.

## 11) Naming & Structure

- Use intention-revealing names (`billingCycleStart`, `isEligible`).
- Group by feature/domain first, then by technical layer.
- Keep files cohesive; split when a file has mixed responsibilities.
- Prefer stable module boundaries over deep cross-imports.

## 12) AI Implementation Checklist

Before commit, AI must verify:

1. Scope is single-purpose and PR-ready.
2. No anti-pattern from section 9 is introduced.
3. `pnpm lint`, `pnpm typecheck`, `pnpm test` pass locally.
4. Error paths are explicit and testable.
5. Naming/API shape is understandable without extra comments.

## 13) PR Review Checklist

- Correctness: Does the change match intended behavior?
- Regression risk: Could existing flow break?
- Security: Any injection, auth, secret, or permission issue?
- Observability: Are failures diagnosable?
- Test adequacy: Do tests cover changed behavior and edge cases?
- Simplicity: Is there a simpler, lower-risk implementation?
