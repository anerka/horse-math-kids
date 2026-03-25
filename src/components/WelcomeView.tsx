import { useEffect, useState } from 'react'

const baseUrl = import.meta.env.BASE_URL || '/'

type Props = {
  onStart: () => void
}

export function WelcomeView({ onStart }: Props) {
  const [showStart, setShowStart] = useState(false)

  useEffect(() => {
    const t = window.setTimeout(() => setShowStart(true), 2000)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <div className="screen welcome-screen">
      <div className="welcome-inner">
        <h1 className="welcome-title">Välkommen till Hästmatte</h1>
        <div className="welcome-horse-wrap">
          <img
            className="welcome-horse"
            src={`${baseUrl}welcome-horse.svg`}
            alt=""
            width={200}
            height={248}
            decoding="async"
          />
        </div>
        {showStart && (
          <button
            type="button"
            className="primary-btn welcome-start-btn"
            onClick={onStart}
          >
            Börja
          </button>
        )}
      </div>
    </div>
  )
}
