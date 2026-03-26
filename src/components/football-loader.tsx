'use client'

import { BALL_PENTAGON, BALL_PETALS } from './logo'

// Each petal lights up in sequence: green pulse travels clockwise around the ball.
// Total cycle: 2 s — each petal is active for 2/5 = 0.4 s, delayed by 0.4 s per step.

const CYCLE = 2 // seconds

export function FootballLoader({ size = 64 }: { size?: number }) {
  return (
    <>
      <style>{`
        @keyframes football-petal {
          0%, 100% { fill: white; }
          10%       { fill: #22c55e; }
          20%       { fill: white; }
        }
      `}</style>

      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Loading"
        role="img"
      >
        <rect width="40" height="40" rx="10" fill="#0f172a" />

        {BALL_PETALS.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="white"
            stroke="#0f172a"
            strokeWidth="1.5"
            strokeLinejoin="round"
            style={{
              animation: `football-petal ${CYCLE}s ease-in-out infinite`,
              animationDelay: `${(i * CYCLE) / 5}s`,
            }}
          />
        ))}

        <path d={BALL_PENTAGON} fill="#0f172a" />
      </svg>
    </>
  )
}
