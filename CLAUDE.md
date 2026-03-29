# Project Rules

## Monorepo Structure
- This is a pnpm + Turborepo monorepo with one app:
  - `apps/web` — Next.js dashboard app
- Root `.env.local` is the single source of truth for all env vars
- `apps/web/.env.local` is a symlink to the root `.env.local`

## Language
- All UI text, error messages, emails, and notifications must be in **Portuguese (pt-BR)**
- No i18n library — hardcode Portuguese strings directly

## UI Components
- Always use shadcn/ui components instead of raw HTML elements
- When a component has visual variants, always use `class-variance-authority` (CVA)
- Use `iconoir-react` for all icons in custom components — `lucide-react` is only for shadcn internals

## Color Tokens & Opacity
- `brand` is a custom deep blue palette. `gold` is a secondary accent palette.
- Neutral overrides Tailwind's built-in neutral with a slate-based palette.
- Use red for error/destructive, amber for warning, green for success.
- For opacity, use Tailwind's native `/` syntax (e.g., `bg-brand-300/25`).

## Theme Token Values
- Reference CSS custom properties from `@theme` (e.g., `var(--color-brand-500)`) instead of hardcoded hex.
- When opacity is needed in raw CSS, use `color-mix(in srgb, var(--color-brand-200) 20%, transparent)`.

## React State Management
- Minimize `useState` calls. Use discriminated union state for multiple dialogs/modals.
- Shared utilities (`cn`, `slugify`, `getErrorMessage`) live in `src/lib/utils.ts`.

## Data Access Layer
- All database queries go through entity helpers in `src/data/` — never import `db` directly in pages or API routes.
- One file per entity.
- Helpers return plain objects or `null` — no HTTP concerns.

## Auth
- BetterAuth with Google OAuth only (no email/password)
- Organization plugin for invite-based access
- Roles: "owner"/"admin" = `luz` (admin), "member" = `user`
- Invite-only: no public signup

## Domain
- System manages a single Masonic Lodge (single-tenant)
- Users have a `grau` (degree: 1, 2, 3) and optional `cargo` (position)
- Content access is filtered by `grauMinimo` — degree 3 sees all, degree 1 sees only grau_minimo=1

## Commands
- `pnpm dev` — start dev server
- `pnpm build` — build all
- `pnpm db:push` — push schema to database
- `pnpm db:studio` — open Drizzle Studio
- `docker compose up -d` — start Postgres
