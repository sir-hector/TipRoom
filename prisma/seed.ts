import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const db = new PrismaClient({ adapter })

async function main() {
  await db.tournament.upsert({
    where: { slug: 'world-cup-2026' },
    update: {},
    create: {
      name: 'FIFA World Cup 2026',
      slug: 'world-cup-2026',
      type: 'world_cup',
      season: '2026',
      startDate: new Date('2026-06-11'),
      endDate: new Date('2026-07-19'),
      isActive: true,
    },
  })
  process.stdout.write('Seeded: FIFA World Cup 2026\n')
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
