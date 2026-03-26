'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { MatchStatus } from '@prisma/client'
import { z } from 'zod'
import { isAppAdmin } from '@/lib/auth'
import { db } from '@/lib/db'
import { calculatePoints, getOddsUsed } from '@/lib/scoring'
import type { ScoringConfig } from '@/lib/scoring'

const CreateMatchSchema = z.object({
  tournamentId: z.string().min(1),
  homeTeamId: z.string().min(1),
  awayTeamId: z.string().min(1),
  kickoffAt: z.string().datetime(),
  homeOdds: z.coerce.number().positive().optional(),
  awayOdds: z.coerce.number().positive().optional(),
  drawOdds: z.coerce.number().positive().optional(),
})

const UpdateOddsSchema = z.object({
  matchId: z.string().min(1),
  homeOdds: z.coerce.number().positive(),
  awayOdds: z.coerce.number().positive(),
  drawOdds: z.coerce.number().positive(),
})

const EnterScoreSchema = z.object({
  matchId: z.string().min(1),
  homeScore: z.coerce.number().int().min(0),
  awayScore: z.coerce.number().int().min(0),
})

async function requireAdmin() {
  if (!(await isAppAdmin())) throw new Error('Unauthorized')
}

export async function createMatch(_prev: unknown, formData: FormData): Promise<{ error: string }> {
  await requireAdmin()

  const parsed = CreateMatchSchema.safeParse({
    tournamentId: formData.get('tournamentId'),
    homeTeamId: formData.get('homeTeamId'),
    awayTeamId: formData.get('awayTeamId'),
    kickoffAt: formData.get('kickoffAt'),
    homeOdds: formData.get('homeOdds') || undefined,
    awayOdds: formData.get('awayOdds') || undefined,
    drawOdds: formData.get('drawOdds') || undefined,
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' }
  const { tournamentId, homeTeamId, awayTeamId, kickoffAt, homeOdds, awayOdds, drawOdds } =
    parsed.data

  if (homeTeamId === awayTeamId) return { error: 'Home and away teams must be different.' }

  const tournamentSlug = formData.get('tournamentSlug') as string

  // Validate both teams belong to this tournament
  const teamLinks = await db.tournamentTeam.findMany({
    where: { tournamentId, teamId: { in: [homeTeamId, awayTeamId] } },
    include: { team: { select: { id: true, name: true } } },
  })
  if (teamLinks.length !== 2) return { error: 'Invalid team selection.' }

  const homeTeamRecord = teamLinks.find((t) => t.teamId === homeTeamId)!.team
  const awayTeamRecord = teamLinks.find((t) => t.teamId === awayTeamId)!.team

  const kickoffDate = new Date(kickoffAt)
  const betsLockedAt = new Date(kickoffDate.getTime() - 60 * 60 * 1000)

  await db.match.create({
    data: {
      tournamentId,
      homeTeam: homeTeamRecord.name,
      awayTeam: awayTeamRecord.name,
      homeTeamId,
      awayTeamId,
      kickoffAt: kickoffDate,
      betsLockedAt,
      homeOdds: homeOdds ?? null,
      awayOdds: awayOdds ?? null,
      drawOdds: drawOdds ?? null,
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

  const parsed = UpdateOddsSchema.safeParse({
    matchId: formData.get('matchId'),
    homeOdds: formData.get('homeOdds'),
    awayOdds: formData.get('awayOdds'),
    drawOdds: formData.get('drawOdds'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' }
  const { matchId, homeOdds, awayOdds, drawOdds } = parsed.data

  const tournamentSlug = formData.get('tournamentSlug') as string

  const match = await db.match.findUnique({ where: { id: matchId } })
  if (!match) return { error: 'Match not found.' }

  await db.match.update({ where: { id: matchId }, data: { homeOdds, awayOdds, drawOdds } })

  revalidatePath(`/admin/tournaments/${tournamentSlug}`)
  return { success: true }
}

export async function enterMatchScore(
  _prev: unknown,
  formData: FormData,
): Promise<{ error: string }> {
  await requireAdmin()

  const parsed = EnterScoreSchema.safeParse({
    matchId: formData.get('matchId'),
    homeScore: formData.get('homeScore'),
    awayScore: formData.get('awayScore'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' }
  const { matchId, homeScore, awayScore } = parsed.data

  let tournamentSlug: string | undefined

  try {
    await db.$transaction(async (tx) => {
      const match = await tx.match.findUnique({
        where: { id: matchId },
        include: { tournament: { select: { slug: true } } },
      })
      if (!match) throw new Error('Match not found.')
      if (match.status === MatchStatus.FINISHED) throw new Error('Match already scored.')

      tournamentSlug = match.tournament.slug

      await tx.match.update({
        where: { id: matchId },
        data: { homeScore, awayScore, status: MatchStatus.FINISHED },
      })

      const bets = await tx.bet.findMany({
        where: { matchId },
        include: { room: { select: { scoringMode: true, scoringConfig: true } } },
      })

      await Promise.all(
        bets.map((bet) => {
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
          return tx.bet.update({ where: { id: bet.id }, data: { pointsEarned, oddsUsed } })
        }),
      )
    })
  } catch (err) {
    if (err instanceof Error) return { error: err.message }
    return { error: 'An unexpected error occurred.' }
  }

  if (tournamentSlug) {
    revalidatePath(`/admin/tournaments/${tournamentSlug}`)
    redirect(`/admin/tournaments/${tournamentSlug}`)
  }

  return { error: 'Match not found.' }
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
