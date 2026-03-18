# TipRoom — Project Plan

A tournament prediction app for groups of friends. Starts with World Cup 2026, built tournament-agnostic from day one.

**App name:** TipRoom
**Domain:** tiproom.app or tiproom.io (check availability)

---

## Documentation

| File | Contents |
|---|---|
| [docs/tech-stack.md](docs/tech-stack.md) | Framework, auth, database, deployment decisions |
| [docs/data-model.md](docs/data-model.md) | Database schema, relationships, constraints |
| [docs/scoring.md](docs/scoring.md) | Scoring system, modes, special bets |
| [docs/features.md](docs/features.md) | All features by phase, answered product decisions |
| [docs/testing.md](docs/testing.md) | Unit and E2E testing strategy and examples |
| [docs/design.md](docs/design.md) | Colors, typography, component patterns, reference sites |

## Claude Agents

| Agent | Purpose |
|---|---|
| `.claude/agents/developer.md` | Next.js / TypeScript / Prisma implementation |
| `.claude/agents/tester.md` | Unit (Vitest) and E2E (Playwright) tests |
| `.claude/agents/ui-designer.md` | Tailwind + shadcn/ui, mobile-first football UI |
| `.claude/agents/manager.md` | Feature planning, updating docs, task breakdown |

---

## Current Focus: Phase 1 (ship before June 2026)

1. Scaffold — Next.js + Tailwind + shadcn + Clerk + Supabase + Prisma
2. Auth — sign in/up, protected routes
3. Prisma schema + migrations
4. Room create/join with invite codes
5. Match management — admin adds matches manually
6. Betting UI — submit/edit bet, server-side deadline enforcement
7. Score entry + points calculation
8. Leaderboard
9. Vercel Cron — auto-lock bets 1h before kickoff
