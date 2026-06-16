<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Agent conventions for pipeline-demo-app

This is a Next.js 16 app with TypeScript, Tailwind CSS, and the App Router.

## Project structure

- `src/app/` — Next.js App Router pages and layouts
- `src/lib/` — Shared utility functions (pure TypeScript, no React)
- `src/components/` — Shared React components
- `src/lib/__tests__/` — Unit tests for lib utilities (Vitest)
- `src/components/__tests__/` — Unit tests for components (Vitest + Testing Library)

## Code conventions

- **TypeScript strict mode** is on. Every function must have explicit return types.
- Use named exports, not default exports, for utilities and components.
- Tailwind for all styling — no inline styles, no CSS modules.
- File names: `kebab-case.ts` for utilities, `PascalCase.tsx` for components.
- Keep `src/lib/` functions pure (no side effects, no React imports).

## Testing rules

- Every new utility function in `src/lib/` must have tests in `src/lib/__tests__/<filename>.test.ts`.
- Every new component in `src/components/` must have tests in `src/components/__tests__/<ComponentName>.test.tsx`.
- Use `describe` + `it` blocks. Test the public contract, not internals.
- Run tests with `npm test`. All tests must pass before opening a PR.

## What NOT to do

- Do not install new dependencies without a clear reason.
- Do not modify `src/app/layout.tsx` or `src/app/page.tsx` unless the ticket explicitly targets them.
- Do not use `any` type.
- Do not leave `console.log` statements in committed code.
