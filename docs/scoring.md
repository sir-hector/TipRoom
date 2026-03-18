# Scoring System

## Current Default: Odds-Based

| Prediction | Formula | Example (odds=2.15) |
|---|---|---|
| Exact score | odds × 3 | 2.15 × 3 = **6.45 pts** |
| Correct winner (wrong score) | odds × 1 | 2.15 × 1 = **2.15 pts** |
| Correct draw (wrong score) | odds × 1 | draw_odds × 1 |
| Wrong result | 0 | 0 pts |

The multiplier for exact score is always **3×** regardless of actual goals.

## Scoring Modes (configurable per room)

### ODDS_BASED (default)
- Rewards predicting upsets — higher odds = more points
- Requires odds to be set per match
- exact = odds × exactMultiplier (default 3)
- winner/draw = odds × 1

### FIXED
- No odds needed — pure skill
- Exact score = 5 pts
- Correct winner = 2 pts
- Correct draw result (any score) = 3 pts
- Wrong = 0

### HYBRID
- Everyone earns base points for correct winner (no odds dependency)
- Bonus on top for exact score

| Outcome | Points |
|---|---|
| Exact score | 2 (base) + odds × 1.5 (bonus) |
| Correct winner | 2 (base) |
| Wrong | 0 |

## Scoring Config JSON

Stored on the Room as `scoringConfig`. Overrides default multipliers:

```json
{
  "exactMultiplier": 3,
  "winnerMultiplier": 1,
  "drawMultiplier": 1,
  "fixedExact": 5,
  "fixedWinner": 2,
  "fixedDraw": 3
}
```

## Default Odds

When odds are not set for a match, **default to 1.0**. This means:
- Exact score = 1.0 × 3 = **3 pts**
- Correct winner = 1.0 × 1 = **1 pt**

Admin can update odds at any time before the match locks. Points are calculated at result entry time using whatever odds are stored then — not at bet submission time.

```typescript
const effectiveOdds = odds ?? 1.0
```

## Pure Scoring Function

```typescript
// lib/scoring.ts

type ScoringInput = {
  predictedHome: number
  predictedAway: number
  actualHome: number
  actualAway: number
  mode: ScoringMode
  odds: number           // relevant odds (home/away/draw depending on actual result)
  config?: ScoringConfig
}

export function calculatePoints(input: ScoringInput): number {
  const { predictedHome, predictedAway, actualHome, actualAway, mode, odds, config } = input

  const isExact = predictedHome === actualHome && predictedAway === actualAway
  const predictedWinner = getWinner(predictedHome, predictedAway)
  const actualWinner = getWinner(actualHome, actualAway)
  const isCorrectWinner = predictedWinner === actualWinner

  if (!isCorrectWinner) return 0

  if (mode === 'FIXED') {
    if (isExact) return config?.fixedExact ?? 5
    if (actualWinner === 'draw') return config?.fixedDraw ?? 3
    return config?.fixedWinner ?? 2
  }

  if (mode === 'ODDS_BASED') {
    if (isExact) return odds * (config?.exactMultiplier ?? 3)
    return odds * (config?.winnerMultiplier ?? 1)
  }

  if (mode === 'HYBRID') {
    const base = config?.fixedWinner ?? 2
    if (isExact) return base + odds * 1.5
    return base
  }

  return 0
}

function getWinner(home: number, away: number): 'home' | 'away' | 'draw' {
  if (home > away) return 'home'
  if (away > home) return 'away'
  return 'draw'
}
```

## Special Bets (Phase 3)

To keep things interesting beyond match predictions:

| Bet Type | Description | Points |
|---|---|---|
| Top scorer | Predict tournament's top goalscorer | Fixed bonus (e.g. 20 pts) |
| Tournament winner | Predict which team wins | odds × 5 |
| Group winner | Predict who tops a group | Fixed (e.g. 10 pts) |
| Group second | Predict runner-up in a group | Fixed (e.g. 7 pts) |
| Golden boot | Same as top scorer | — |

Special bets are stored in `SpecialBet` table and settled manually by admin.
These can be submitted once before the tournament starts and locked at tournament kickoff.
