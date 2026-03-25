/** Tecknad firande-häst (vektor i appen — ingen extern bildfil). */
export function CelebrationHorse() {
  return (
    <svg
      className="celebration-horse-svg"
      viewBox="0 0 220 200"
      aria-hidden
    >
      <defs>
        <linearGradient id="ch-coat" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#d4a84b" />
          <stop offset="100%" stopColor="#9a7320" />
        </linearGradient>
        <linearGradient id="ch-mane" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6b4a3a" />
          <stop offset="100%" stopColor="#3d2a22" />
        </linearGradient>
      </defs>

      <g className="celebration-horse-stars" fill="#ffc93c">
        <path d="M32 36l4 9 9 1-7 6 2 9-8-4-8 4 2-9-7-6 9-1z" />
        <path d="M188 32l3 7 7 1-5 5 2 7-6-3-6 3 2-7-5-5 7-1z" />
        <path d="M196 148l2 5 5 1-4 4 1 5-4-3-4 3 1-5-4-4 5-1z" />
      </g>

      <circle cx="28" cy="118" r="4" fill="#e85d4c" opacity="0.9" />
      <circle cx="192" cy="92" r="3.5" fill="#2d6a4f" opacity="0.85" />
      <circle cx="48" cy="172" r="3" fill="#8b7cf6" opacity="0.8" />

      {/* Kropp */}
      <ellipse
        cx="110"
        cy="130"
        rx="58"
        ry="40"
        fill="url(#ch-coat)"
        stroke="#5c4033"
        strokeWidth="3"
      />

      {/* Bakben */}
      <path
        d="M68 155 L58 188"
        stroke="#5c4033"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M152 155 L162 188"
        stroke="#5c4033"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <ellipse cx="58" cy="192" rx="11" ry="7" fill="#3d2a22" />
      <ellipse cx="162" cy="192" rx="11" ry="7" fill="#3d2a22" />

      {/* Framben i “hurra”-läge */}
      <path
        d="M88 118 L72 52"
        stroke="#5c4033"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M132 118 L148 50"
        stroke="#5c4033"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <ellipse cx="72" cy="48" rx="10" ry="8" fill="#3d2a22" transform="rotate(-15 72 48)" />
      <ellipse cx="148" cy="46" rx="10" ry="8" fill="#3d2a22" transform="rotate(15 148 46)" />

      {/* Hals */}
      <path
        d="M95 105 Q85 70 95 45 Q105 25 130 28 Q155 32 165 55 Q175 85 155 105"
        fill="url(#ch-coat)"
        stroke="#5c4033"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* Man */}
      <path
        d="M100 48 Q88 35 92 18 Q100 8 118 12 Q132 18 128 38 Q120 52 108 58"
        fill="url(#ch-mane)"
        stroke="#3d2a22"
        strokeWidth="1.5"
      />

      {/* Öron */}
      <path
        d="M138 22 L132 42 L148 36 Z"
        fill="#b8926a"
        stroke="#5c4033"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M162 28 L154 46 L172 42 Z"
        fill="#b8926a"
        stroke="#5c4033"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Nosse */}
      <ellipse cx="168" cy="78" rx="26" ry="20" fill="#f8ecd4" stroke="#5c4033" strokeWidth="2.5" />
      <ellipse cx="182" cy="76" rx="4" ry="5" fill="#2d1f18" />

      {/* Ögon */}
      <ellipse cx="142" cy="62" rx="13" ry="15" fill="#fff" stroke="#5c4033" strokeWidth="2" />
      <ellipse cx="142" cy="64" rx="6" ry="8" fill="#2d1f18" />
      <circle cx="145" cy="60" r="3" fill="#fff" />

      <ellipse cx="118" cy="58" rx="11" ry="14" fill="#fff" stroke="#5c4033" strokeWidth="2" />
      <ellipse cx="118" cy="60" rx="5" ry="7" fill="#2d1f18" />
      <circle cx="120" cy="56" r="2.5" fill="#fff" />

      {/* Leende */}
      <path
        d="M128 92 Q150 108 172 88"
        fill="none"
        stroke="#5c4033"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Partyhatt */}
      <path
        d="M118 38 L100 4 L82 38 Z"
        fill="#e85d4c"
        stroke="#9a3f28"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <ellipse cx="100" cy="40" rx="24" ry="7" fill="#fff" stroke="#5c4033" strokeWidth="2" />
      <circle cx="100" cy="6" r="5" fill="#ffc93c" />
    </svg>
  )
}
