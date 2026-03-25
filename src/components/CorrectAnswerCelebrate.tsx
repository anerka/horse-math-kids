const baseUrl = import.meta.env.BASE_URL || '/'

const STAR_SLOTS = [
  { className: 's1', delay: '0s' },
  { className: 's2', delay: '-0.35s' },
  { className: 's3', delay: '-0.7s' },
  { className: 's4', delay: '-1.1s' },
  { className: 's5', delay: '-0.55s' },
  { className: 's6', delay: '-1.4s' },
] as const

/** HappyHorse-bild + flytande stjärnor (samma stämning som gamla firande-SVG:n). */
export function CorrectAnswerCelebrate() {
  return (
    <div className="correct-celebrate-visual">
      <div className="correct-celebrate-stars-layer" aria-hidden>
        {STAR_SLOTS.map(({ className, delay }) => (
          <span
            key={className}
            className={`correct-celebrate-star ${className}`}
            style={{ animationDelay: delay }}
          >
            ★
          </span>
        ))}
      </div>
      <img
        className="correct-celebrate-horse-img"
        src={`${baseUrl}happy-horse.png`}
        alt=""
        width={1024}
        height={1024}
        decoding="async"
      />
    </div>
  )
}
