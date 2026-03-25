import { useCallback, useRef, useState } from 'react'

const HOLD_MS = 2000

type Props = {
  label: string
  hint: string
  onComplete: () => void
  className?: string
}

export function LongPressButton({
  label,
  hint,
  onComplete,
  className,
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
      <span
        className="long-press-fill"
        style={{ transform: `scaleX(${progress})` }}
        aria-hidden
      />
      <span className="long-press-label">{label}</span>
      <span className="long-press-hint">{hint}</span>
    </button>
  )
}
