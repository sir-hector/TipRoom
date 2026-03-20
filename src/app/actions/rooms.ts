'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { ScoringMode } from '@prisma/client'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { generateInviteCode } from '@/lib/invite'

function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

async function ensureUniqueSlug(base: string): Promise<string> {
  let slug = base
  let i = 1
  while (await db.room.findUnique({ where: { slug } })) {
    slug = `${base}-${i++}`
  }
  return slug
}

export async function getUserRooms() {
  const user = await getCurrentUser()

  return db.room.findMany({
    where: { members: { some: { userId: user.id } } },
    include: {
      tournament: { select: { name: true, slug: true } },
      _count: { select: { members: true } },
      members: {
        where: { userId: user.id },
        select: { role: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function createRoom(_prev: unknown, formData: FormData): Promise<{ error: string }> {
  const name = formData.get('name') as string
  const tournamentId = formData.get('tournamentId') as string
  const scoringMode = (formData.get('scoringMode') as ScoringMode) ?? ScoringMode.ODDS_BASED

  if (!name?.trim()) return { error: 'Room name is required.' }
  if (!tournamentId) return { error: 'Please select a tournament.' }

  const user = await getCurrentUser()

  const slug = await ensureUniqueSlug(createSlug(name.trim()))
  const inviteCode = generateInviteCode()

  const room = await db.room.create({
    data: {
      name: name.trim(),
      slug,
      tournamentId,
      scoringMode,
      inviteCode,
      createdBy: user.id,
      members: {
        create: { userId: user.id, role: 'ADMIN' },
      },
    },
  })

  revalidatePath('/dashboard')
  redirect(`/rooms/${room.slug}`)
}

export async function joinRoom(_prev: unknown, formData: FormData): Promise<{ error: string }> {
  const inviteCode = (formData.get('inviteCode') as string)?.trim().toUpperCase()
  if (!inviteCode) return { error: 'Please enter an invite code.' }

  const user = await getCurrentUser()

  const room = await db.room.findUnique({ where: { inviteCode } })
  if (!room) return { error: 'Room not found. Check the invite code and try again.' }

  const existing = await db.roomMember.findUnique({
    where: { roomId_userId: { roomId: room.id, userId: user.id } },
  })

  if (!existing) {
    await db.roomMember.create({
      data: { roomId: room.id, userId: user.id, role: 'MEMBER' },
    })
    revalidatePath('/dashboard')
  }

  redirect(`/rooms/${room.slug}`)
}

export async function getTournaments() {
  return db.tournament.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { startDate: 'asc' },
  })
}

export async function getRoomData(slug: string) {
  const user = await getCurrentUser()

  const room = await db.room.findUnique({
    where: { slug },
    include: {
      tournament: { select: { id: true, name: true, slug: true } },
      members: {
        where: { userId: user.id },
        select: { role: true },
      },
    },
  })

  if (!room || room.members.length === 0) return null

  const matches = await db.match.findMany({
    where: { tournamentId: room.tournamentId },
    orderBy: { kickoffAt: 'asc' },
  })

  const bets = await db.bet.findMany({
    where: { roomId: room.id, userId: user.id },
    select: {
      matchId: true,
      predictedHome: true,
      predictedAway: true,
      pointsEarned: true,
      oddsUsed: true,
    },
  })

  return {
    room: {
      id: room.id,
      name: room.name,
      slug: room.slug,
      inviteCode: room.inviteCode,
      scoringMode: room.scoringMode,
      tournament: room.tournament,
    },
    userRole: room.members[0]!.role,
    matches: matches.map((m) => ({
      ...m,
      bet: bets.find((b) => b.matchId === m.id) ?? null,
    })),
  }
}
