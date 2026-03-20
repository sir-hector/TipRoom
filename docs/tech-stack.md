# Tech Stack

## Decisions

| Concern        | Choice                   | Reason                                                                         |
| -------------- | ------------------------ | ------------------------------------------------------------------------------ |
| Framework      | Next.js 14+ (App Router) | Frontend + API routes + SSR in one codebase                                    |
| Styling        | Tailwind CSS + shadcn/ui | Fast, accessible, widely documented                                            |
| Auth           | Clerk                    | Near-zero setup, handles sessions/social login/magic links, generous free tier |
| Database       | Supabase (PostgreSQL)    | Free tier, row-level security, Realtime ready for v2                           |
| ORM            | Prisma                   | Type-safe queries, easy migrations, great Next.js DX                           |
| Data fetching  | TanStack Query           | Server state, caching, background refetch for leaderboard                      |
| Deployment     | Vercel                   | Native Next.js support, free tier, Cron Jobs built in                          |
| Testing (unit) | Vitest                   | Fast, compatible with Next.js, great TypeScript support                        |
| Testing (e2e)  | Playwright               | Best-in-class, cross-browser, good CI integration                              |

## Project Structure

```
src/
  app/
    (auth)/                 # login, signup — Clerk handles these
    (app)/
      dashboard/            # all user's rooms
      rooms/
        [slug]/             # room overview + leaderboard
        [slug]/bets/        # user's bets for this room
        [slug]/admin/       # admin: matches, scores, odds
      tournaments/          # browse available tournaments
    api/
      cron/
        lock-bets/          # runs every 5min, locks bets 1h before kickoff
        fetch-scores/       # v2: auto-fetch results from sports API
      rooms/
      matches/
      bets/
  components/
    ui/                     # shadcn components (do not edit directly)
    match-card.tsx
    bet-form.tsx
    leaderboard-table.tsx
    countdown-timer.tsx     # shows time until bet locks
  lib/
    db.ts                   # Prisma client singleton
    scoring.ts              # pure scoring functions — unit tested
    bet-validation.ts       # deadline and state checks
    clerk.ts                # auth helpers
  types/
    index.ts                # shared TypeScript types
```

## Key Principles

- All bet deadline enforcement happens server-side. Never trust the client.
- `lib/scoring.ts` must be pure functions with no side effects — easy to test and swap scoring modes.
- Use Prisma transactions when calculating + storing points to avoid partial writes.
