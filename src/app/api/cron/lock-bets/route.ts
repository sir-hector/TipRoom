import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)

  const { count } = await db.match.updateMany({
    where: {
      status: 'SCHEDULED',
      betsLockedAt: {
        gte: fiveMinutesAgo,
        lte: now,
      },
    },
    data: {
      status: 'LOCKED',
    },
  })

  return NextResponse.json({ locked: count })
}
