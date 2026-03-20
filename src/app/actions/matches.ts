'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { MatchStatus } from '@prisma/client'
import { isAppAdmin } from '@/lib/auth'
import { db } from '@/lib/db'
import { calculatePoints, getOddsUsed } from '@/lib/scoring'
import type { ScoringConfig } from '@/lib/scoring'

async function requireAdmin() {
  if (!(await isAppAdmin())) throw new Error('Unauthorized')
}

export async function createMatch(_prev: unknown, formData: FormData): Promise<{ error: string }> {
  await requireAdmin()

  const tournamentId = formData.get('tournamentId') as string
  const tournamentSlug = formData.get('tournamentSlug') as string
  const homeTeam = (formData.get('homeTeam') as string)?.trim()
  const awayTeam = (formData.get('awayTeam') as string)?.trim()
  const kickoffAt = new Date(formData.get('kickoffAt') as string)
  const homeOdds = formData.get('homeOdds') ? parseFloat(formData.get('homeOdds') as string) : null
  const awayOdds = formData.get('awayOdds') ? parseFloat(formData.get('awayOdds') as string) : null
  const drawOdds = formData.get('drawOdds') ? parseFloat(formData.get('drawOdds') as string) : null

  if (!homeTeam || !awayTeam) return { error: 'Both team names are required.' }
  if (isNaN(kickoffAt.getTime())) return { error: 'Invalid kickoff time.' }

  const betsLockedAt = new Date(kickoffAt.getTime() - 60 * 60 * 1000)

  await db.match.create({
    data: {
      tournamentId,
      homeTeam,
      awayTeam,
      kickoffAt,
      betsLockedAt,
      homeOdds,
      awayOdds,
      drawOdds,
    },
  })

  revalidatePath(`/admin/tournaments/${tournamentSlug}`)
  redirect(`/admin/tournaments/${tournamentSlug}`)
}

export async function updateMatchOdds(
  _prev: unknown,
  formData: FormData,
): Promise<{ error: string } | { success: true }> {
  await requireAdmin()

  const matchId = formData.get('matchId') as string
  const tournamentSlug = formData.get('tournamentSlug') as string
  const homeOdds = formData.get('homeOdds') ? parseFloat(formData.get('homeOdds') as string) : null
  const awayOdds = formData.get('awayOdds') ? parseFloat(formData.get('awayOdds') as string) : null
  const drawOdds = formData.get('drawOdds') ? parseFloat(formData.get('drawOdds') as string) : null

  await db.match.update({ where: { id: matchId }, data: { homeOdds, awayOdds, drawOdds } })

  revalidatePath(`/admin/tournaments/${tournamentSlug}`)
  return { success: true }
}

export async function enterMatchScore(
  _prev: unknown,
  formData: FormData,
): Promise<{ error: string }> {
  await requireAdmin()

  const matchId = formData.get('matchId') as string
  const homeScore = parseInt(formData.get('homeScore') as string)
  const awayScore = parseInt(formData.get('awayScore') as string)

  if (isNaN(homeScore) || isNaN(awayScore) || homeScore < 0 || awayScore < 0) {
    return { error: 'Please enter valid scores (0 or more).' }
  }

  const match = await db.match.findUnique({
    where: { id: matchId },
    include: {
      tournament: { select: { slug: true } },
      bets: {
        include: { room: { select: { scoringMode: true, scoringConfig: true } } },
      },
    },
  })

  if (!match) return { error: 'Match not found.' }

  await db.$transaction(async (tx) => {
    await tx.match.update({
      where: { id: matchId },
      data: { homeScore, awayScore, status: MatchStatus.FINISHED },
    })

    for (const bet of match.bets) {
      const oddsUsed = getOddsUsed(
        homeScore,
        awayScore,
        match.homeOdds,
        match.awayOdds,
        match.drawOdds,
      )
      const pointsEarned = calculatePoints({
        predictedHome: bet.predictedHome,
        predictedAway: bet.predictedAway,
        actualHome: homeScore,
        actualAway: awayScore,
        mode: bet.room.scoringMode,
        homeOdds: match.homeOdds,
        awayOdds: match.awayOdds,
        drawOdds: match.drawOdds,
        config: bet.room.scoringConfig as ScoringConfig | null,
      })

      await tx.bet.update({ where: { id: bet.id }, data: { pointsEarned, oddsUsed } })
    }
  })

  revalidatePath(`/admin/tournaments/${match.tournament.slug}`)
  redirect(`/admin/tournaments/${match.tournament.slug}`)
}

export async function updateMatchStatus(matchId: string, status: MatchStatus): Promise<void> {
  await requireAdmin()

  const match = await db.match.update({
    where: { id: matchId },
    data: { status },
    include: { tournament: { select: { slug: true } } },
  })

  revalidatePath(`/admin/tournaments/${match.tournament.slug}`)
}
