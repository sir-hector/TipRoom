import { describe, it, expect } from 'vitest'
import { calculatePoints } from '@/lib/scoring'
import { ScoringMode } from '@prisma/client'

const oddsBase = {
  mode: ScoringMode.ODDS_BASED,
  homeOdds: 2.15,
  awayOdds: 3.5,
  drawOdds: 3.1,
  config: null,
}

describe('calculatePoints — ODDS_BASED', () => {
  it('exact score returns odds × 3', () => {
    expect(calculatePoints({ ...oddsBase, predictedHome: 3, predictedAway: 0, actualHome: 3, actualAway: 0 }))
      .toBeCloseTo(6.45)
  })

  it('correct winner wrong score returns odds × 1', () => {
    expect(calculatePoints({ ...oddsBase, predictedHome: 2, predictedAway: 0, actualHome: 3, actualAway: 0 }))
      .toBeCloseTo(2.15)
  })

  it('wrong result returns 0', () => {
    expect(calculatePoints({ ...oddsBase, predictedHome: 0, predictedAway: 1, actualHome: 3, actualAway: 0 }))
      .toBe(0)
  })

  it('exact draw returns draw_odds × 3', () => {
    expect(calculatePoints({ ...oddsBase, predictedHome: 1, predictedAway: 1, actualHome: 1, actualAway: 1 }))
      .toBeCloseTo(9.3)
  })

  it('correct draw wrong score returns draw_odds × 1', () => {
    expect(calculatePoints({ ...oddsBase, predictedHome: 1, predictedAway: 1, actualHome: 2, actualAway: 2 }))
      .toBeCloseTo(3.1)
  })

  it('defaults to odds 1.0 when not set', () => {
    expect(calculatePoints({ ...oddsBase, homeOdds: null, awayOdds: null, drawOdds: null, predictedHome: 2, predictedAway: 0, actualHome: 2, actualAway: 0 }))
      .toBeCloseTo(3.0) // 1.0 × 3
  })
})

describe('calculatePoints — FIXED', () => {
  const fixedBase = { mode: ScoringMode.FIXED, config: null }

  it('exact score = 5 pts', () => {
    expect(calculatePoints({ ...fixedBase, predictedHome: 3, predictedAway: 0, actualHome: 3, actualAway: 0 })).toBe(5)
  })

  it('correct winner = 2 pts', () => {
    expect(calculatePoints({ ...fixedBase, predictedHome: 1, predictedAway: 0, actualHome: 3, actualAway: 0 })).toBe(2)
  })

  it('correct draw wrong score = 3 pts', () => {
    expect(calculatePoints({ ...fixedBase, predictedHome: 1, predictedAway: 1, actualHome: 2, actualAway: 2 })).toBe(3)
  })

  it('wrong result = 0', () => {
    expect(calculatePoints({ ...fixedBase, predictedHome: 0, predictedAway: 1, actualHome: 3, actualAway: 0 })).toBe(0)
  })
})

describe('calculatePoints — HYBRID', () => {
  const hybridBase = { mode: ScoringMode.HYBRID, homeOdds: 2.0, awayOdds: 3.0, drawOdds: 3.0, config: null }

  it('exact score = base(2) + odds × 1.5', () => {
    expect(calculatePoints({ ...hybridBase, predictedHome: 1, predictedAway: 0, actualHome: 1, actualAway: 0 }))
      .toBeCloseTo(5.0) // 2 + 2.0 * 1.5
  })

  it('correct winner = base(2) only', () => {
    expect(calculatePoints({ ...hybridBase, predictedHome: 2, predictedAway: 0, actualHome: 1, actualAway: 0 }))
      .toBe(2)
  })
})
