'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { ScoringMode } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { generateInviteCode } from '@/lib/invite'

const CreateRoomSchema = z.object({
  name: z.string().min(1).max(100),
  tournamentId: z.string().min(1),
  scoringMode: z.enum(['ODDS_BASED', 'FIXED']),
})

const JoinRoomSchema = z.object({
  inviteCode: z.string().min(1).max(20),
})

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
  const parsed = CreateRoomSchema.safeParse({
    name: formData.get('name'),
    tournamentId: formData.get('tournamentId'),
    scoringMode: formData.get('scoringMode') ?? 'ODDS_BASED',
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' }
  const { name, tournamentId, scoringMode } = parsed.data

  const user = await getCurrentUser()

  const slug = createSlug(name.trim())
  if (slug === '') return { error: 'Room name must contain at least one letter or number.' }

  const uniqueSlug = await ensureUniqueSlug(slug)
  const inviteCode = generateInviteCode()

  try {
    const room = await db.room.create({
      data: {
        name: name.trim(),
        slug: uniqueSlug,
        tournamentId,
        scoringMode: scoringMode as ScoringMode,
        inviteCode,
        createdBy: user.id,
        members: {
          create: { userId: user.id, role: 'ADMIN' },
        },
      },
    })

    revalidatePath('/dashboard')
    redirect(`/rooms/${room.slug}`)
  } catch (err) {
    if (
      err instanceof PrismaClientKnownRequestError &&
      err.code === 'P2002' &&
      Array.isArray(err.meta?.target) &&
      (err.meta.target as string[]).includes('slug')
    ) {
      const suffix = Math.floor(1000 + Math.random() * 9000)
      const retrySlug = `${uniqueSlug}-${suffix}`
      const room = await db.room.create({
        data: {
          name: name.trim(),
          slug: retrySlug,
          tournamentId,
          scoringMode: scoringMode as ScoringMode,
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
    throw err
  }
}

export async function joinRoom(_prev: unknown, formData: FormData): Promise<{ error: string }> {
  const parsed = JoinRoomSchema.safeParse({
    inviteCode: (formData.get('inviteCode') as string)?.trim().toUpperCase(),
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' }
  const { inviteCode } = parsed.data

  const user = await getCurrentUser()

  const room = await db.room.findUnique({ where: { inviteCode } })
  if (!room) return { error: 'Room not found. Check the invite code and try again.' }

  await db.roomMember.upsert({
    where: { roomId_userId: { roomId: room.id, userId: user.id } },
    update: {},
    create: { roomId: room.id, userId: user.id, role: 'MEMBER' },
  })
  revalidatePath('/dashboard')

  redirect(`/rooms/${room.slug}`)
}

export async function getTournaments() {
  await getCurrentUser()

  return db.tournament.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { startDate: 'asc' },
  })
}

export async function getLeaderboard(roomId: string) {
  const user = await getCurrentUser()

  // verify caller is a member
  const membership = await db.roomMember.findUnique({
    where: { roomId_userId: { roomId, userId: user.id } },
  })
  if (!membership) throw new Error('Not a member of this room')

  const members = await db.roomMember.findMany({
    where: { roomId },
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
  })

  const grouped = await db.bet.groupBy({
    by: ['userId'],
    where: { roomId, pointsEarned: { not: null } },
    _sum: { pointsEarned: true },
    _count: { _all: true },
  })

  // count correct predictions (pointsEarned > 0)
  const correct = await db.bet.groupBy({
    by: ['userId'],
    where: { roomId, pointsEarned: { gt: 0 } },
    _count: { _all: true },
  })

  const correctMap = new Map(correct.map((r) => [r.userId, r._count._all]))
  const pointsMap = new Map(grouped.map((r) => [r.userId, r._sum.pointsEarned ?? 0]))

  const rows = members.map((m) => ({
    userId: m.userId,
    name: m.user.name,
    avatarUrl: m.user.avatarUrl,
    totalPoints: pointsMap.get(m.userId) ?? 0,
    correctPredictions: correctMap.get(m.userId) ?? 0,
  }))

  return rows.sort((a, b) => b.totalPoints - a.totalPoints)
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

  const [matches, bets] = await Promise.all([
    db.match.findMany({
      where: { tournamentId: room.tournamentId },
      orderBy: { kickoffAt: 'asc' },
    }),
    db.bet.findMany({
      where: { roomId: room.id, userId: user.id },
      select: {
        matchId: true,
        predictedHome: true,
        predictedAway: true,
        pointsEarned: true,
        oddsUsed: true,
      },
    }),
  ])

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
