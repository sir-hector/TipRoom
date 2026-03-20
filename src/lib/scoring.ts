import { ScoringMode } from '@prisma/client'

export type ScoringConfig = {
  exactMultiplier?: number
  winnerMultiplier?: number
  fixedExact?: number
  fixedWinner?: number
  fixedDraw?: number
}

type Winner = 'home' | 'away' | 'draw'

function getWinner(home: number, away: number): Winner {
  if (home > away) return 'home'
  if (away > home) return 'away'
  return 'draw'
}

function getRelevantOdds(
  winner: Winner,
  homeOdds: number,
  awayOdds: number,
  drawOdds: number,
): number {
  if (winner === 'home') return homeOdds
  if (winner === 'away') return awayOdds
  return drawOdds
}

export type CalculatePointsInput = {
  predictedHome: number
  predictedAway: number
  actualHome: number
  actualAway: number
  mode: ScoringMode
  homeOdds?: number | null
  awayOdds?: number | null
  drawOdds?: number | null
  config?: ScoringConfig | null
}

export function calculatePoints(input: CalculatePointsInput): number {
  const {
    predictedHome,
    predictedAway,
    actualHome,
    actualAway,
    mode,
    homeOdds,
    awayOdds,
    drawOdds,
    config,
  } = input

  const isExact = predictedHome === actualHome && predictedAway === actualAway
  const actualWinner = getWinner(actualHome, actualAway)
  const predictedWinner = getWinner(predictedHome, predictedAway)
  const isCorrectWinner = predictedWinner === actualWinner

  if (!isCorrectWinner) return 0

  if (mode === ScoringMode.FIXED) {
    if (isExact) return config?.fixedExact ?? 5
    if (actualWinner === 'draw') return config?.fixedDraw ?? 3
    return config?.fixedWinner ?? 2
  }

  const effectiveHomeOdds = homeOdds ?? 1.0
  const effectiveAwayOdds = awayOdds ?? 1.0
  const effectiveDrawOdds = drawOdds ?? 1.0
  const odds = getRelevantOdds(
    actualWinner,
    effectiveHomeOdds,
    effectiveAwayOdds,
    effectiveDrawOdds,
  )

  if (mode === ScoringMode.ODDS_BASED) {
    if (isExact) return odds * (config?.exactMultiplier ?? 3)
    return odds * (config?.winnerMultiplier ?? 1)
  }

  if (mode === ScoringMode.HYBRID) {
    const base = config?.fixedWinner ?? 2
    if (isExact) return base + odds * 1.5
    return base
  }

  return 0
}

export function getOddsUsed(
  actualHome: number,
  actualAway: number,
  homeOdds?: number | null,
  awayOdds?: number | null,
  drawOdds?: number | null,
): number {
  const winner = getWinner(actualHome, actualAway)
  return getRelevantOdds(winner, homeOdds ?? 1.0, awayOdds ?? 1.0, drawOdds ?? 1.0)
}
