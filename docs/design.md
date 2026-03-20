# Design System

## Reference Sites

Study these for specific purposes — don't copy one blindly, take the best from each:

| Site                                        | What to steal                                                                                                                                                             |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [superbru.com](https://www.superbru.com)    | UX flows only — how predictions are structured, leaderboard layout, deadline warnings. Their visual design is outdated; use their product thinking, not their aesthetics. |
| [sofascore.com](https://www.sofascore.com)  | Match card design — how to show home/away teams, score, status, time. Best-in-class for this.                                                                             |
| [fotmob.com](https://www.fotmob.com)        | Mobile-first layout, typography hierarchy, live match feel                                                                                                                |
| [onefoootball.com](https://onefootball.com) | Color philosophy: neutral grays as base, one strong accent used sparingly. Don't overuse the brand color.                                                                 |

---

## Color Palette

### Philosophy

- **Neutral base** — most of the UI is white/slate gray. Clean, readable, not overwhelming.
- **One strong accent** — green (football). Used sparingly: active states, CTAs, status badges.
- **Gold for winners** — leaderboard #1, correct predictions, achievements.
- **Semantic colors** — red/amber/green for match statuses. Never use accent green for statuses.

### Palette

```css
/* globals.css — change these to retheme the whole app */
:root {
  /* Brand */
  --color-primary: #16a34a; /* green-600 — CTAs, active nav, key accents */
  --color-primary-dark: #15803d; /* green-700 — hover states */
  --color-primary-light: #dcfce7; /* green-100 — backgrounds, badges */

  /* Gold — winners, highlights */
  --color-gold: #f59e0b; /* amber-500 */
  --color-gold-light: #fef3c7; /* amber-100 */

  /* Neutrals */
  --color-background: #f8fafc; /* slate-50 — page background */
  --color-surface: #ffffff; /* card backgrounds */
  --color-border: #e2e8f0; /* slate-200 */
  --color-text: #0f172a; /* slate-900 — body text */
  --color-text-muted: #64748b; /* slate-500 — secondary text */

  /* Match status (semantic — never use primary green here) */
  --color-status-scheduled: #3b82f6; /* blue-500 */
  --color-status-locked: #f59e0b; /* amber-500 */
  --color-status-live: #22c55e; /* green-500 — different shade than primary */
  --color-status-finished: #94a3b8; /* slate-400 */
  --color-status-cancelled: #ef4444; /* red-500 */
  --color-status-postponed: #f97316; /* orange-500 */
}

/* Dark mode — add later with next-themes */
.dark {
  --color-background: #0f172a; /* slate-900 */
  --color-surface: #1e293b; /* slate-800 */
  --color-border: #334155; /* slate-700 */
  --color-text: #f8fafc;
  --color-text-muted: #94a3b8;
  --color-primary-light: #14532d; /* green-900 */
}
```

### Tailwind config

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          dark: 'var(--color-primary-dark)',
          light: 'var(--color-primary-light)',
        },
        gold: {
          DEFAULT: 'var(--color-gold)',
          light: 'var(--color-gold-light)',
        },
        surface: 'var(--color-surface)',
        border: 'var(--color-border)',
        muted: 'var(--color-text-muted)',
      },
    },
  },
}
```

With this setup, changing the entire color scheme in the future = **edit globals.css only**.

---

## Typography

```css
/* Font stack — Inter is clean and widely used in sports apps */
font-family: 'Inter', system-ui, sans-serif;

/* Score numbers need tabular (monospaced) digits for alignment */
.score,
.odds,
.points {
  font-variant-numeric: tabular-nums;
}
```

Install Inter via `next/font/google` — zero layout shift, no external request.

---

## Component Design Patterns

### Match Card

```
┌─────────────────────────────────────────┐
│  [LOCKED]                    Sat 14 Jun │
│                                         │
│  🇵🇱 Poland      vs      Ukraine 🇺🇦     │
│                                         │
│  Odds: 2.15 / 3.40 / 3.10             │
│                                         │
│  Your bet: [ 2 ] - [ 1 ]               │
│                              [Edit bet] │
└─────────────────────────────────────────┘
```

- Teams centered, large text
- Status badge top-left, date top-right
- Odds displayed in muted text (not prominent)
- User's bet shown inline — no separate page needed for most bets
- Finished cards show actual result + points earned

### Leaderboard Row

```
┌─────────────────────────────────────────┐
│ #1  🥇  [avatar] Karol          47.3 pts│
│ #2      [avatar] Marek          38.1 pts│  ← you (highlighted row)
│ #3      [avatar] Anna           35.0 pts│
└─────────────────────────────────────────┘
```

- Medal emoji for top 3 (🥇🥈🥉)
- Current user row highlighted with `primary-light` background
- Points right-aligned with tabular-nums

### Bet Form

- Two large number inputs side by side (home score — away score)
- No keyboard on desktop: use `+` / `−` buttons (easier on mobile too)
- Countdown timer shows time until deadline — turns amber at 2h, red at 30min
- Disabled state when locked: show "Betting closed" instead of form

---

## Dark Mode

Add dark mode support from the start using `next-themes`. shadcn/ui supports it out of the box.
Switching is a one-line change per component when CSS variables are used correctly.

```bash
npm install next-themes
```

Provide a toggle in the nav — many users prefer dark mode for evening match watching.

---

## Mobile-First Rules

- All layouts start at 375px width
- Match cards: full width on mobile, 2-col grid on `md:`
- Bet inputs: large touch targets (min 48px height)
- Bottom nav on mobile (Home, My Bets, Leaderboard, Room)
- No horizontal scroll anywhere
