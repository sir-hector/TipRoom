// Pentagon + 5 petal paths — each petal is a closed shape:
// M vertex → L circle-edge → arc-to-next-edge → L next-vertex → Z (closes along pentagon edge)
// Pentagon radius 5.5, circle radius 13, centre (20,20)
// Vertices at angles -90°, -18°, 54°, 126°, 198° (pointing up)

export const BALL_PENTAGON = 'M 20,14.5 L 25.23,18.3 L 23.23,24.45 L 16.77,24.45 L 14.77,18.3 Z'

export const BALL_PETALS = [
  'M 20,14.5    L 20,7          A 13,13 0 0,1 32.36,15.98  L 25.23,18.3  Z',
  'M 25.23,18.3  L 32.36,15.98  A 13,13 0 0,1 27.64,30.52  L 23.23,24.45 Z',
  'M 23.23,24.45 L 27.64,30.52  A 13,13 0 0,1 12.36,30.52  L 16.77,24.45 Z',
  'M 16.77,24.45 L 12.36,30.52  A 13,13 0 0,1 7.64,15.98   L 14.77,18.3  Z',
  'M 14.77,18.3  L 7.64,15.98   A 13,13 0 0,1 20,7         L 20,14.5     Z',
]

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
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
        />
      ))}

      <path d={BALL_PENTAGON} fill="#0f172a" />
    </svg>
  )
}
