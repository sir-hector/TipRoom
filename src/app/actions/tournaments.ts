'use server'

import { db } from '@/lib/db'
import { isAppAdmin } from '@/lib/auth'

async function requireAdmin() {
  if (!(await isAppAdmin())) throw new Error('Unauthorized')
}

export async function getAdminTournaments() {
  await requireAdmin()
  return db.tournament.findMany({
    where: { isActive: true },
    include: { _count: { select: { matches: true } } },
    orderBy: { startDate: 'asc' },
  })
}

export async function getTournamentWithMatches(slug: string) {
  await requireAdmin()
  return db.tournament.findUnique({
    where: { slug },
    include: {
      matches: {
        orderBy: { kickoffAt: 'asc' },
      },
    },
  })
}

export async function getMatchForEdit(id: string) {
  await requireAdmin()
  return db.match.findUnique({
    where: { id },
    include: { tournament: { select: { slug: true, name: true } } },
  })
}
