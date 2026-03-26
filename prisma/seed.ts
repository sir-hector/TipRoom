import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const db = new PrismaClient({ adapter })

const WC2026_TEAMS = [
  // Hosts
  'USA',
  'Canada',
  'Mexico',
  // CONMEBOL
  'Argentina',
  'Brazil',
  'Colombia',
  'Uruguay',
  'Ecuador',
  'Venezuela',
  // UEFA
  'France',
  'England',
  'Germany',
  'Spain',
  'Portugal',
  'Netherlands',
  'Italy',
  'Switzerland',
  'Denmark',
  'Austria',
  'Serbia',
  'Croatia',
  'Turkey',
  'Scotland',
  'Slovakia',
  'Hungary',
  // CONCACAF (non-host)
  'Panama',
  'Costa Rica',
  'Honduras',
  // CAF
  'Morocco',
  'Senegal',
  'Egypt',
  'Nigeria',
  'Ivory Coast',
  'South Africa',
  'DR Congo',
  'Ghana',
  'Cameroon',
  // AFC
  'Japan',
  'South Korea',
  'Australia',
  'Saudi Arabia',
  'Iran',
  'Iraq',
  'Jordan',
  'Uzbekistan',
  // OFC
  'New Zealand',
  // Playoff spots (placeholders)
  'Romania',
  'Ukraine',
]

async function main() {
  const tournament = await db.tournament.upsert({
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
  process.stdout.write(`Seeded tournament: ${tournament.name}\n`)

  for (const name of WC2026_TEAMS) {
    await db.team.upsert({
      where: { name },
      update: {},
      create: { name, type: 'NATIONAL' },
    })
  }
  process.stdout.write(`Seeded ${WC2026_TEAMS.length} teams\n`)

  const teams = await db.team.findMany({
    where: { name: { in: WC2026_TEAMS } },
    select: { id: true },
  })

  for (const team of teams) {
    await db.tournamentTeam.upsert({
      where: { tournamentId_teamId: { tournamentId: tournament.id, teamId: team.id } },
      update: {},
      create: { tournamentId: tournament.id, teamId: team.id },
    })
  }
  process.stdout.write(`Linked ${teams.length} teams to ${tournament.name}\n`)
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
