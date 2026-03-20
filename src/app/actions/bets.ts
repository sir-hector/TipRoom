'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { isBetAllowed } from '@/lib/bet-validation'

export async function placeBet(
  _prev: unknown,
  formData: FormData,
): Promise<{ error: string } | { success: true }> {
  const roomId = formData.get('roomId') as string
  const roomSlug = formData.get('roomSlug') as string
  const matchId = formData.get('matchId') as string
  const predictedHome = parseInt(formData.get('predictedHome') as string)
  const predictedAway = parseInt(formData.get('predictedAway') as string)

  if (isNaN(predictedHome) || isNaN(predictedAway) || predictedHome < 0 || predictedAway < 0) {
    return { error: 'Please enter valid scores (0 or more).' }
  }

  const user = await getCurrentUser()

  const match = await db.match.findUnique({ where: { id: matchId } })
  if (!match) return { error: 'Match not found.' }
  if (!isBetAllowed(match.betsLockedAt)) return { error: 'Betting is closed for this match.' }

  const member = await db.roomMember.findUnique({
    where: { roomId_userId: { roomId, userId: user.id } },
  })
  if (!member) return { error: 'You are not a member of this room.' }

  await db.bet.upsert({
    where: { roomId_userId_matchId: { roomId, userId: user.id, matchId } },
    update: { predictedHome, predictedAway },
    create: { roomId, userId: user.id, matchId, predictedHome, predictedAway },
  })

  revalidatePath(`/rooms/${roomSlug}`)
  return { success: true }
}
