# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**TipRoom** — a football tournament prediction app for groups of friends. World Cup 2026 is the first supported tournament. Built tournament-agnostic from day one.

Full plan and architecture docs are in `docs/`. Start there before making changes.

## Commands

```bash
# Development
npm run dev

# Tests
npx vitest                        # unit tests
npx vitest --coverage             # with coverage
npx playwright test               # e2e tests
npx playwright test --ui          # e2e interactive mode

# Database
npx prisma migrate dev            # apply migrations
npx prisma studio                 # browse data
npx prisma generate               # regenerate client after schema change
```

## Architecture

- **Next.js App Router** — Server Components by default, Client Components only for interactivity
- **Clerk** — auth (`auth()` from `@clerk/nextjs/server` in server code)
- **Prisma + Supabase** — PostgreSQL database
- **TanStack Query** — client-side data fetching and caching

Key files:
- `lib/scoring.ts` — pure scoring functions, no DB calls. The most critical business logic.
- `lib/bet-validation.ts` — deadline enforcement (always server-side)
- `docs/data-model.md` — full Prisma schema with constraints
- `docs/scoring.md` — scoring formulas, modes, default odds

## Git Workflow

- Commit after each meaningful iteration (feature complete, bug fixed, config changed)
- Use `/commit` (custom skill) to commit — it enforces the rules below
- **Never include Claude Code attribution** in commits — no `Co-Authored-By` lines, no mentions of AI tools in commit messages
- Use [Conventional Commits](https://www.conventionalcommits.org/) format: `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`

## Critical Rules

- Bet deadline enforcement is **always server-side**. Never trust the client. Check `match.betsLockedAt > new Date()` in every API route that touches bets.
- Use **Prisma transactions** when calculating and storing points.
- `lib/scoring.ts` must stay as pure functions — no DB or network calls inside.
- When odds are not set on a match, **default to 1.0**.
- Validate all API inputs with **Zod** before touching the database.

## MCP Servers (global)

| Server | Purpose | Usage |
|---|---|---|
| `context7` | Up-to-date docs for Next.js, Prisma, Clerk, shadcn | Mention "use context7" in your prompt |
| `chrome-devtools` | Inspect DOM, console, network, screenshots | Run `chrome-dev` in terminal first, then ask Claude to inspect |

`chrome-dev` alias launches Chrome with remote debugging on port 9222 — required before using the chrome-devtools MCP.

## Agents

Custom agents in `.claude/agents/` have full project context baked in:
- `developer` — feature implementation
- `tester` — Vitest unit tests and Playwright e2e
- `ui-designer` — Tailwind/shadcn, mobile-first football UI
- `manager` — prioritization and docs
