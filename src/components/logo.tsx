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
      <defs>
        <linearGradient id="logo-bg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="40" height="40" rx="10" fill="url(#logo-bg)" />

      {/* Football outer circle */}
      <circle cx="20" cy="20" r="11.5" stroke="white" strokeWidth="1.5" strokeOpacity="0.35" />

      {/* Centre pentagon */}
      <polygon
        points="20,14.5 23.8,17 23.8,21.5 20,24 16.2,21.5 16.2,17"
        fill="white"
        fillOpacity="0.15"
      />

      {/* Top-right arm */}
      <line
        x1="23.8"
        y1="17"
        x2="27.5"
        y2="14.5"
        stroke="white"
        strokeWidth="1.2"
        strokeOpacity="0.25"
      />
      {/* Top-left arm */}
      <line
        x1="16.2"
        y1="17"
        x2="12.5"
        y2="14.5"
        stroke="white"
        strokeWidth="1.2"
        strokeOpacity="0.25"
      />
      {/* Bottom-right arm */}
      <line
        x1="23.8"
        y1="21.5"
        x2="27"
        y2="24.5"
        stroke="white"
        strokeWidth="1.2"
        strokeOpacity="0.25"
      />
      {/* Bottom-left arm */}
      <line
        x1="16.2"
        y1="21.5"
        x2="13"
        y2="24.5"
        stroke="white"
        strokeWidth="1.2"
        strokeOpacity="0.25"
      />
      {/* Top arm */}
      <line
        x1="20"
        y1="14.5"
        x2="20"
        y2="10"
        stroke="white"
        strokeWidth="1.2"
        strokeOpacity="0.25"
      />

      {/* Checkmark — bold, centred */}
      <path
        d="M13 20.5L17.5 25L27 15"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
