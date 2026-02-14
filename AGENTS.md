# AGENTS.md

This file defines how AI agents should work in this repository.

## Scope

- This project is frontend-first (Next.js + TypeScript + Tailwind).
- Optimize for product UI quality, accessibility, and predictable behavior.

## Execution Rules

- Make small, focused changes with clear intent.
- Avoid mixing unrelated concerns in one change.
- Prefer updating existing files/patterns over introducing new abstractions.
- Keep architecture simple unless complexity is required.

## Frontend Architecture

- Keep presentational UI separate from side effects and data orchestration.
- Prefer feature-oriented grouping over flat utility sprawl.
- Keep component props explicit and typed.
- Avoid `any`; use narrow types and discriminated unions when useful.
- Do not duplicate domain logic across components/hooks.

## UX and Accessibility Baseline

- Build mobile-first, then validate desktop behavior.
- Provide loading, empty, error, and success states for user-facing flows.
- Use semantic HTML elements first.
- Ensure keyboard navigation for all interactive controls.
- Keep visible focus styles and acceptable contrast.

## Performance Baseline

- Avoid unnecessary rerenders from unstable props/closures.
- Use dynamic imports only where they improve real UX.
- Avoid large client bundles for static or server-renderable content.
- Keep image/media usage optimized (`next/image` where appropriate).

## Styling Rules

- Follow existing design language and utility conventions.
- Avoid brittle selector coupling and DOM-order-dependent CSS.
- Prefer reusable UI primitives for repeated patterns.

## Testing and Validation

Before finalizing changes, run:

1. `pnpm lint`
2. `pnpm typecheck`
3. `pnpm test`

For UI behavior changes, verify:

1. Mobile viewport behavior
2. Desktop viewport behavior
3. Keyboard and focus behavior
4. Empty/loading/error states

## Git and PR Conventions

- Work on non-`main` branches only.
- Use Conventional Commit messages.
- Keep PR title and body aligned with actual diff.
- Include what changed, why, and how it was validated.

## Anti-Patterns to Avoid

- Large god-components with mixed responsibilities
- Hidden side effects in rendering paths
- Silent error swallowing
- Unused code and dead branches
- Index keys in mutable list rendering
- Shipping without tests for behavior changes

## Priority on Conflict

- Follow this file for frontend execution behavior.
- Keep consistency with `CODEX.md` and `README.md`.
