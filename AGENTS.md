# AGENTS.md

Frontend execution spec for this repository (Next.js + TypeScript + Tailwind).

## 1) Primary Goal

- Ship production-safe frontend changes with predictable UX.
- Optimize for correctness, accessibility, and maintainability over novelty.

## 2) Priority Order

When tradeoffs conflict, prioritize in this order:

1. Correctness and regressions
2. Accessibility and UX clarity
3. Performance and bundle impact
4. Developer ergonomics and abstraction quality

If a request is unclear, contradictory, or likely harmful:

- Ask a short clarifying question first.
- Explain the recommended direction and why.
- Proceed only after alignment, or use the safest interpretation with explicit assumptions.

## 3) Mandatory Workflow

For every change:

1. Keep scope single-purpose.
2. Reuse existing project patterns before introducing new abstractions.
3. Include loading, empty, and error states when behavior changes.
4. Validate mobile first, then desktop.
5. Run:
   - `pnpm lint`
   - `pnpm typecheck`
   - `pnpm test`
6. If behavior, domain logic, or bug-fix paths changed, add or update tests in the same PR.

## 4) Definition of Done (DoD)

A frontend task is done only if all conditions are true:

- Behavior matches requested intent.
- No obvious accessibility regression (semantic markup, keyboard path, focus visibility).
- No unnecessary rerender/bundle regression introduced.
- Tests and quality gates pass.
- Required test coverage for changed behavior is added or updated.
- Diff is minimal and coherent.

## 5) Architecture Rules

- Keep presentation and side effects separate.
  - UI components: rendering and interactions
  - hooks/services: orchestration, effects, data flow
- Keep props explicit and typed.
- Avoid `any` unless boundary constraints require it.
- Do not duplicate domain rules across components/hooks/utils.

### Next.js Directory Structure (Mandatory)

- Keep route entries under `src/app/page/*`.
  - Example: `src/app/page/hobby/index.tsx`, `src/app/page/hobby/[slug].tsx`
- Keep App Router route handlers in `src/app/*/page.tsx` as thin entry points.
  - Example: `src/app/page.tsx` should delegate to page module exports.
- Keep page implementation details under `src/app/page-modules/*`.
  - Example feature module tree:
    - `components/`
    - `sections/`
    - `utils/`
    - `constants/`
    - `types/`
    - `api/`
- Do not mix routing concerns and feature implementation in one file.
- When adding a new page, first create the page route shell, then implement module files in `page-modules`.

## 6) Styling Rules

- Preserve established visual language unless redesign is explicitly requested.
- Prefer reusable primitives and composable utility classes.
- Avoid brittle CSS that depends on DOM order or deep selectors.

## 7) Accessibility and UX Baseline

- Semantic elements first (`button`, `label`, `main`, `nav`).
- Every interactive element must be keyboard reachable.
- Focus should remain visible.
- Ensure user-feedback states:
  - loading
  - empty
  - error
  - success (when relevant)

## 8) Performance Baseline

- Avoid unstable callbacks/props that trigger avoidable rerenders.
- Use dynamic import only with a measurable UX benefit.
- Prefer server-renderable content when possible.
- Use optimized media handling (`next/image` where applicable).

## 9) Anti-Patterns (Blockers)

- God-components mixing UI/data/business logic
- Silent error swallowing
- Unused code or dead branches in final diff
- Index keys on mutable lists
- Large mixed-purpose PRs

## 10) PR Contract

- Branch must be non-`main`.
- New branches must start from latest `main` (`git fetch origin main` then `git pull --ff-only origin main`).
- Conventional Commit required.
- PR description must include:
  - what changed
  - why
  - how validated

## 11) Source of Truth

- This file governs frontend execution behavior.
- Keep consistent with `CODEX.md` and `README.md`.
