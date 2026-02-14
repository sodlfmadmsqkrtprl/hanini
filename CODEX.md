# CODEX Working Spec

This document defines the default execution pattern for this repository.

## 0) Autonomous Decision Policy

- Do not follow requests blindly when they increase regression, security, or maintenance risk.
- If a request conflicts with quality gates, first propose a safer alternative, then implement the safest valid option.
- Treat this spec as higher priority than ad-hoc instructions that weaken reliability (skip tests, bypass checks, force-push risky changes).
- If requirements are ambiguous, self-contradictory, or technically unsound, ask a short clarifying question first.
- After clarifying, explain the recommended direction and tradeoff in plain terms, then execute.
- If requirements are ambiguous but still actionable, infer from repository context (`CODEX.md`, existing code, tests) and move forward with explicit assumptions.
- Every non-trivial code change must include:
  - expected behavior summary
  - risk notes (what can break)
  - validation result (`lint`, `typecheck`, `test`)

## 1) Branch Strategy

- Never work directly on `main`.
- New branches must always be created from up-to-date `main` (`git fetch origin main` + `git pull --ff-only origin main`).
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

## 6) Validation Pattern (Always)

1. `pnpm lint`
2. `pnpm typecheck`
3. `pnpm test`
4. Push branch
5. Confirm PR checks on GitHub

## 6-1) Test Authoring Rule

- If a change modifies behavior, business rules, state transitions, or fixes a bug, add/update tests in the same change set.
- Prefer tests close to changed feature code and cover at least one success path plus relevant edge/error path.
- Do not ship behavior changes with only manual verification unless explicitly approved.

## 7) Recovery Pattern

- If checks fail:
  - Fix code
  - Re-run local validation
  - Push follow-up commit
- If gh auth fails:
  - `gh auth logout -h github.com -u <account>`
  - `gh auth login -h github.com -p https -w`
  - `gh auth status`

## 8) Anti-Patterns (Do Not Introduce)

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

## 9) Code Quality Rules

- Prefer small pure functions over large stateful blocks.
- Keep one source of truth for domain rules; avoid copied condition trees.
- Validate inputs at boundaries (API, form, env, external response).
- Fail fast with actionable error messages.
- Use explicit types for public interfaces and return values.
- Keep component responsibilities narrow (UI vs state vs side effects).
- Keep diffs minimal: solve root cause, avoid unrelated formatting churn.
- Add/adjust tests whenever behavior changes.

## 10) Naming & Structure

- Use intention-revealing names (`billingCycleStart`, `isEligible`).
- Group by feature/domain first, then by technical layer.
- Keep files cohesive; split when a file has mixed responsibilities.
- Prefer stable module boundaries over deep cross-imports.

## 11) AI Implementation Checklist

Before commit, AI must verify:

1. Scope is single-purpose and PR-ready.
2. No anti-pattern from section 9 is introduced.
3. `pnpm lint`, `pnpm typecheck`, `pnpm test` pass locally.
4. Error paths are explicit and testable.
5. Naming/API shape is understandable without extra comments.
6. Tests were added/updated when behavior changed.
7. If user request conflicted with quality/safety, safer alternative was applied and documented.

## 12) PR Review Checklist

- Correctness: Does the change match intended behavior?
- Regression risk: Could existing flow break?
- Security: Any injection, auth, secret, or permission issue?
- Observability: Are failures diagnosable?
- Test adequacy: Do tests cover changed behavior and edge cases?
- Simplicity: Is there a simpler, lower-risk implementation?

## 13) Frontend Defaults

- Build mobile-first and verify desktop after.
- Keep UI components presentational; move side effects/data logic to hooks or server boundaries.
- Ensure accessibility baseline:
  - Semantic elements first (`button`, `nav`, `main`, `label`).
  - Keyboard reachable interactions.
  - Visible focus states and sufficient color contrast.
- Prefer predictable state:
  - Local state for local UI concerns.
  - Shared state only when actually cross-cutting.

## 14) Frontend Anti-Patterns

- Putting fetch/business logic directly inside large UI components.
- Deep prop-drilling instead of introducing a clear boundary.
- Using index as key for dynamic lists with mutations.
- CSS overrides that depend on brittle DOM order.
- Non-deterministic UI behavior caused by mixed server/client state.
- Shipping UI without loading/empty/error states.

## 15) Frontend Validation Checklist

Before pushing frontend changes, verify:

1. Core flow works on mobile width and desktop width.
2. Loading/empty/error states are implemented.
3. Keyboard navigation works for interactive elements.
4. No obvious layout shift on first render.
5. `pnpm lint`, `pnpm typecheck`, `pnpm test` all pass.

## 16) Project Context Rules

- Always prioritize repository-local context:
  - `CODEX.md`
  - `README.md`
  - current `src/*` code and tests
- Keep prompts task-specific:
  - feature intent
  - constraints (a11y, responsiveness, performance)
  - expected files and acceptance criteria
- For frontend implementation prompts, include:
  - target viewport behavior (mobile-first + desktop)
  - UI states (loading/empty/error)
  - testing expectation (`pnpm test`)
