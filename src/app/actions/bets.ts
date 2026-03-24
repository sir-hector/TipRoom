'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { isBetAllowed } from '@/lib/bet-validation'

const PlaceBetSchema = z.object({
  matchId: z.string().min(1),
  roomId: z.string().min(1),
  predictedHome: z.coerce.number().int().min(0),
  predictedAway: z.coerce.number().int().min(0),
})

export async function placeBet(
  _prev: unknown,
  formData: FormData,
): Promise<{ error: string } | { success: true }> {
  const parsed = PlaceBetSchema.safeParse({
    matchId: formData.get('matchId'),
    roomId: formData.get('roomId'),
    predictedHome: formData.get('predictedHome'),
    predictedAway: formData.get('predictedAway'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' }
  const { matchId, roomId, predictedHome, predictedAway } = parsed.data

  const roomSlug = formData.get('roomSlug') as string

  const user = await getCurrentUser()

  const [match, room] = await Promise.all([
    db.match.findUnique({ where: { id: matchId } }),
    db.room.findUnique({ where: { id: roomId } }),
  ])

  if (!match) return { error: 'Match not found.' }
  if (!room) return { error: 'Room not found.' }
  if (!isBetAllowed(match.betsLockedAt)) return { error: 'Betting is closed for this match.' }

  // cross-tournament validation
  if (match.tournamentId !== room.tournamentId) return { error: 'Invalid bet.' }

  const membership = await db.roomMember.findUnique({
    where: { roomId_userId: { roomId, userId: user.id } },
  })
  if (!membership) return { error: 'You are not a member of this room.' }

  await db.bet.upsert({
    where: { roomId_userId_matchId: { roomId, userId: user.id, matchId } },
    update: { predictedHome, predictedAway },
    create: { roomId, userId: user.id, matchId, predictedHome, predictedAway },
  })

  revalidatePath(`/rooms/${roomSlug}`)
  return { success: true }
}
