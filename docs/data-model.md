# Data Model

## Schema

```prisma
model User {
  id          String   @id @default(cuid())
  clerkId     String   @unique
  name        String
  email       String   @unique
  avatarUrl   String?
  createdAt   DateTime @default(now())

  roomMembers RoomMember[]
  bets        Bet[]
}

model Tournament {
  id        String   @id @default(cuid())
  name      String                              // "FIFA World Cup 2026"
  slug      String   @unique                   // "world-cup-2026"
  type      String                              // "world_cup" | "champions_league" | "euros"
  season    String                              // "2026"
  startDate DateTime
  endDate   DateTime
  logoUrl   String?
  isActive  Boolean  @default(true)

  matches   Match[]
  rooms     Room[]
}

model Match {
  id           String      @id @default(cuid())
  tournamentId String
  homeTeam     String
  awayTeam     String
  kickoffAt    DateTime                         // stored in UTC
  betsLockedAt DateTime                         // kickoffAt - 1 hour
  homeScore    Int?                             // null until result entered
  awayScore    Int?
  status       MatchStatus @default(SCHEDULED)
  homeOdds     Float?                           // set by admin or API
  awayOdds     Float?
  drawOdds     Float?

  tournament   Tournament  @relation(fields: [tournamentId], references: [id])
  bets         Bet[]
}

enum MatchStatus {
  SCHEDULED
  LOCKED        // bets closed, match not started yet
  LIVE
  FINISHED
  CANCELLED
  POSTPONED
}

model Room {
  id            String      @id @default(cuid())
  name          String
  slug          String      @unique
  tournamentId  String
  createdBy     String                          // userId
  scoringMode   ScoringMode @default(ODDS_BASED)
  scoringConfig Json?                           // overrides for multipliers etc.
  inviteCode    String      @unique
  isPublic      Boolean     @default(false)
  createdAt     DateTime    @default(now())

  tournament    Tournament  @relation(fields: [tournamentId], references: [id])
  members       RoomMember[]
  bets          Bet[]
}

enum ScoringMode {
  FIXED         // exact=5pts, winner=2pts, correct_draw=3pts
  ODDS_BASED    // exact=odds*3, winner=odds*1
  HYBRID        // winner=2pts flat + odds bonus on exact
}

model RoomMember {
  id       String   @id @default(cuid())
  roomId   String
  userId   String
  role     Role     @default(MEMBER)
  joinedAt DateTime @default(now())

  room     Room     @relation(fields: [roomId], references: [id])
  user     User     @relation(fields: [userId], references: [id])

  @@unique([roomId, userId])
}

enum Role {
  ADMIN
  MEMBER
}

model Bet {
  id             String   @id @default(cuid())
  roomId         String
  userId         String
  matchId        String
  predictedHome  Int
  predictedAway  Int
  pointsEarned   Float?                         // null until match finished
  oddsUsed       Float?                         // snapshot of odds at calculation time
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  room           Room     @relation(fields: [roomId], references: [id])
  user           User     @relation(fields: [userId], references: [id])
  match          Match    @relation(fields: [matchId], references: [id])

  @@unique([roomId, userId, matchId])           // one bet per user per match per room
}

// v2: special bets (top scorer, group winners, etc.)
model SpecialBet {
  id           String  @id @default(cuid())
  roomId       String
  userId       String
  type         String  // "top_scorer" | "group_winner" | "tournament_winner"
  prediction   String  // flexible JSON or plain string
  pointsEarned Float?
  createdAt    DateTime @default(now())
}
```

## Key Constraints

- A bet can only be placed or updated while `Match.betsLockedAt > now()` — enforced server-side, never client-side
- `Bet.pointsEarned` is null until the admin submits the result
- `Bet.oddsUsed` snapshots the odds at calculation time — odds can change but earned points stay stable
- Rooms persist after tournament ends (historical view)
- `ScoringConfig` JSON allows overriding multipliers without schema changes:
  ```json
  { "exactMultiplier": 3, "winnerMultiplier": 1 }
  ```

## Leaderboard Query

No separate leaderboard table needed in v1. Compute on demand:

```sql
SELECT
  u.name, u.avatarUrl,
  SUM(b.pointsEarned) as totalPoints,
  COUNT(CASE WHEN b.pointsEarned > 0 THEN 1 END) as correctPredictions
FROM Bet b
JOIN User u ON b.userId = u.id
WHERE b.roomId = $roomId AND b.pointsEarned IS NOT NULL
GROUP BY u.id
ORDER BY totalPoints DESC
```

Add a database index on `(roomId, userId)` on the Bet table.
