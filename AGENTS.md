# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Next.js App Router routes (e.g., `app/page.tsx`, `app/api/**/route.ts`).
- `components/`: Reusable React components (`PascalCase.tsx`).
- `hooks/`: Custom React hooks (`use*.ts`).
- `lib/`: Utilities, services, and shared logic (`*.ts`).
- `public/`: Static assets served at `/`.
- `styles/`: Tailwind/PostCSS styles.
- Config: `.eslintrc.json`, `next.config.mjs`, `tsconfig.json`, `postcss.config.mjs`.

## Build, Test, and Development Commands
- `pnpm dev`: Run the Next.js dev server locally.
- `pnpm build`: Create a production build.
- `pnpm start`: Start the production server (after `build`).
- `pnpm lint`: Lint the codebase using Next/ESLint.

Requirements: pnpm 10 and Node 18+ are recommended.

## Coding Style & Naming Conventions
- Language: TypeScript + React 19, Next.js App Router.
- Components: `PascalCase` filenames in `components/` (e.g., `DatePicker.tsx`).
- Hooks/Utils: `camelCase` exports; hooks start with `use`.
- Routes: App Router patterns (e.g., `app/tools/sunrise/page.tsx`, API `app/api/foo/route.ts`).
- Styling: Tailwind CSS (prefer utility classes); use `clsx`/`tailwind-merge` for conditionals.
- Linting: `pnpm lint` (ESLint with `eslint-config-next`). Fixes welcome via `--fix`.

## Testing Guidelines
- No test runner is configured yet. If adding tests:
  - Unit: prefer Vitest or Jest (`*.test.ts` / `*.test.tsx`).
  - E2E: prefer Playwright for routes and UI flows.
  - Place tests colocated or under `__tests__/` near sources.
  - Aim for meaningful coverage on `lib/` and critical components.

## Commit & Pull Request Guidelines
- Commits: short, imperative summaries (e.g., `fix deploy`, `refactor sunrise tool`).
- Scope optional; batch related changes. Reference issues with `#id` when relevant.
- PRs must include:
  - Purpose and high-level changes.
  - Testing notes (steps to verify locally).
  - Screenshots/GIFs for UI changes.
  - Any migration/config notes (`.env` keys, scripts).

## Security & Configuration Tips
- Secrets: use `.env.local` (not committed). Access via `process.env.*` in server code.
- Validate user input in API routes under `app/api/**`.
- Keep static assets in `public/`; avoid leaking private files.
