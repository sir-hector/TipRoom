# Testing Strategy

## Tools

| Type               | Tool                                   | Config                                           |
| ------------------ | -------------------------------------- | ------------------------------------------------ |
| Unit / Integration | **Vitest**                             | Fast, native TypeScript, compatible with Next.js |
| E2E                | **Playwright**                         | Cross-browser, great CI support                  |
| Test DB            | Supabase local or separate test schema | Never run tests against production               |

## Setup

```bash
npm install -D vitest @vitejs/plugin-react playwright @playwright/test
npx playwright install
```

`vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node', // 'jsdom' for component tests
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
})
```

---

## Unit Tests — What to Test

### 1. Scoring logic (highest priority)

`lib/scoring.ts` is pure functions — test exhaustively.

```typescript
// tests/unit/scoring.test.ts
import { describe, it, expect } from 'vitest'
import { calculatePoints } from '@/lib/scoring'

describe('calculatePoints — ODDS_BASED', () => {
  const base = { mode: 'ODDS_BASED' as const, odds: 2.15, config: undefined }

  it('exact score returns odds × 3', () => {
    expect(
      calculatePoints({
        ...base,
        predictedHome: 3,
        predictedAway: 0,
        actualHome: 3,
        actualAway: 0,
      }),
    ).toBeCloseTo(6.45)
  })

  it('correct winner wrong score returns odds × 1', () => {
    expect(
      calculatePoints({
        ...base,
        predictedHome: 2,
        predictedAway: 0,
        actualHome: 3,
        actualAway: 0,
      }),
    ).toBeCloseTo(2.15)
  })

  it('wrong result returns 0', () => {
    expect(
      calculatePoints({
        ...base,
        predictedHome: 0,
        predictedAway: 1,
        actualHome: 3,
        actualAway: 0,
      }),
    ).toBe(0)
  })

  it('correct draw returns draw_odds × 1', () => {
    expect(
      calculatePoints({
        ...base,
        odds: 3.1,
        predictedHome: 1,
        predictedAway: 1,
        actualHome: 2,
        actualAway: 2,
      }),
    ).toBeCloseTo(3.1)
  })

  it('exact draw returns draw_odds × 3', () => {
    expect(
      calculatePoints({
        ...base,
        odds: 3.1,
        predictedHome: 1,
        predictedAway: 1,
        actualHome: 1,
        actualAway: 1,
      }),
    ).toBeCloseTo(9.3)
  })
})

describe('calculatePoints — FIXED', () => {
  const base = { mode: 'FIXED' as const, odds: 2.15, config: undefined }

  it('exact score = 5 pts', () => {
    expect(
      calculatePoints({
        ...base,
        predictedHome: 3,
        predictedAway: 0,
        actualHome: 3,
        actualAway: 0,
      }),
    ).toBe(5)
  })

  it('correct winner = 2 pts', () => {
    expect(
      calculatePoints({
        ...base,
        predictedHome: 1,
        predictedAway: 0,
        actualHome: 3,
        actualAway: 0,
      }),
    ).toBe(2)
  })

  it('correct draw (wrong score) = 3 pts', () => {
    expect(
      calculatePoints({
        ...base,
        predictedHome: 1,
        predictedAway: 1,
        actualHome: 2,
        actualAway: 2,
      }),
    ).toBe(3)
  })
})
```

### 2. Bet validation

```typescript
// tests/unit/bet-validation.test.ts
import { isBetAllowed } from '@/lib/bet-validation'

it('rejects bet when match is locked', () => {
  const lockedAt = new Date(Date.now() - 1000) // 1 second ago
  expect(isBetAllowed(lockedAt)).toBe(false)
})

it('allows bet when match is not yet locked', () => {
  const lockedAt = new Date(Date.now() + 60_000) // 1 minute from now
  expect(isBetAllowed(lockedAt)).toBe(true)
})
```

### 3. Invite code generation

```typescript
it('generates 8-character alphanumeric code', () => {
  const code = generateInviteCode()
  expect(code).toMatch(/^[A-Z0-9]{8}$/)
})

it('generates unique codes', () => {
  const codes = new Set(Array.from({ length: 100 }, generateInviteCode))
  expect(codes.size).toBe(100)
})
```

---

## E2E Tests — Critical Flows

All E2E tests run against a test database with seeded data.

### Flow 1: User registration and room creation

```
1. Visit /
2. Click "Sign up"
3. Complete Clerk signup
4. Redirected to /dashboard
5. Click "Create room"
6. Fill: name="Friends WC", tournament="World Cup 2026", mode="ODDS_BASED"
7. Submit → redirected to /rooms/friends-wc
8. Invite code visible on page
```

### Flow 2: Join a room and place a bet

```
1. Sign in as second user
2. Visit /join, enter invite code
3. Redirected to room page
4. See upcoming matches list
5. Click "Bet" on an unlocked match
6. Enter predicted score: 2-1
7. Submit → bet saved, confirmation shown
8. Edit bet to 3-0 → updated successfully
```

### Flow 3: Admin enters result and leaderboard updates

```
1. Sign in as room admin
2. Go to /rooms/[slug]/admin
3. Find finished match, enter score: 2-1
4. Submit → success
5. Navigate to leaderboard
6. Users who predicted 2-1 have points earned
7. Users who predicted correct winner (e.g. 1-0) have lesser points
8. Users who predicted wrong have 0
```

### Flow 4: Bet locked before kickoff (critical)

```
1. Match has betsLockedAt = 30 minutes ago
2. User visits match
3. Bet form is disabled / shows "Betting closed"
4. API POST /api/bets with that matchId returns 403
```

---

## Running Tests

```bash
# Unit tests
npx vitest

# Unit tests with coverage
npx vitest --coverage

# E2E tests
npx playwright test

# E2E tests with UI
npx playwright test --ui

# Single test file
npx vitest tests/unit/scoring.test.ts
```

## CI

Run unit tests on every PR. Run E2E tests on merge to main.
