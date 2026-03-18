# Features

## Product Decisions (answered)

| Question | Decision |
|---|---|
| Can users change their bet before the deadline? | Yes — last submission wins. Deadline is 1h before kickoff. |
| Cancelled / postponed matches? | Admin handles manually in v1 (mark as CANCELLED/POSTPONED, no points awarded) |
| Points unit | "Points" — no virtual coins |
| Rooms after tournament ends | Persist — historical view stays accessible |
| Special bets (top scorer, etc.) | Phase 3 feature |

---

## Phase 1 — MVP (before June 2026)

### Auth
- [ ] Sign up / log in via Clerk (Google OAuth + email magic link)
- [ ] User profile page (name, avatar)
- [ ] Protected routes middleware

### Rooms
- [ ] Create a room (name, pick tournament, pick scoring mode)
- [ ] Invite code generated on creation (8-char alphanumeric)
- [ ] Join a room via invite code
- [ ] Dashboard showing all rooms user belongs to
- [ ] Room admin panel

### Matches
- [ ] Admin manually adds matches (home team, away team, kickoff time)
- [ ] Admin sets odds per match (optional — required for ODDS_BASED mode)
- [ ] Matches auto-lock for betting 1h before kickoff (Vercel Cron)
- [ ] Admin manually enters final scores
- [ ] Points auto-calculated for all bets on result entry (Prisma transaction)
- [ ] Admin can mark match as CANCELLED or POSTPONED

### Betting
- [ ] List of upcoming matches sorted by kickoff time
- [ ] Submit bet (predicted score) for any unlocked match
- [ ] Edit bet — last submission wins, same validation
- [ ] Countdown timer showing time until bet locks
- [ ] View own past bets + earned points per match

### Leaderboard
- [ ] Room leaderboard sorted by total points
- [ ] Show position, name, points, number of correct predictions
- [ ] Highlight current user's row
- [ ] Refresh on focus (TanStack Query)

### Scheduling
- [ ] Vercel Cron job every 5 minutes: lock bets for matches starting within 1h

---

## Phase 2 — Automation & Polish

- [ ] Sports API integration — auto-import match schedule and kickoff times
- [ ] Auto-fetch scores every 5 minutes during live matches
- [ ] Odds API integration (optional — admin can still override)
- [ ] Public rooms — browsable without invite code
- [ ] Multiple rooms on dashboard with unread activity indicator
- [ ] Email notifications: bet deadline approaching, result entered, leaderboard change
- [ ] Mobile PWA (add to home screen)
- [ ] Regenerate invite code (admin action)

---

## Phase 3 — Growth

- [ ] Champions League, Euros, other tournaments
- [ ] Special bets: top scorer, tournament winner, group winners
- [ ] Configurable scoring mode per room (admin picks on creation)
- [ ] Room chat / match comments
- [ ] Historical archive browsing
- [ ] Global leaderboard across public rooms
- [ ] Admin dashboard for managing tournaments (add seasons, import fixtures)
