import { useCallback, useRef, useState, type ReactNode } from 'react'

const HOLD_MS = 2000

type Props = {
  onComplete: () => void
  /** Endast skärmläsare — inget synligt barnetikett. */
  ariaLabel: string
  children: ReactNode
  className?: string
  /** Visuell fyllnadsindikator (kan stängas av för extra diskret läge). */
  showProgress?: boolean
}

export function LongPressButton({
  onComplete,
  ariaLabel,
  children,
  className,
  showProgress = true,
}: Props) {
  const [progress, setProgress] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const doneRef = useRef(false)

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setProgress(0)
    doneRef.current = false
  }, [])

  const start = useCallback(() => {
    clear()
    const startAt = Date.now()
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startAt
      const p = Math.min(1, elapsed / HOLD_MS)
      setProgress(p)
      if (p >= 1 && !doneRef.current) {
        doneRef.current = true
        clear()
        onComplete()
      }
    }, 32)
  }, [clear, onComplete])

  return (
    <button
      type="button"
      className={['long-press-btn', className].filter(Boolean).join(' ')}
      aria-label={ariaLabel}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId)
        start()
      }}
      onPointerUp={clear}
      onPointerCancel={clear}
      onPointerLeave={(e) => {
        if (e.pressure === 0) clear()
      }}
    >
      {showProgress ? (
        <span
          className="long-press-fill"
          style={{ transform: `scaleX(${progress})` }}
          aria-hidden
        />
      ) : null}
      <span className="long-press-inner">{children}</span>
    </button>
  )
}
