import { useEffect } from 'react'
import type { AppSettings, Operation } from '../lib/settings'
import { enabledOperationList } from '../lib/settings'
import { opLabel } from '../lib/problems'
import {
  nudgeHomeMenuMusic,
  startHomeMenuMusic,
  stopHomeMenuMusic,
} from '../lib/sound'
import { LongPressButton } from './LongPressButton'

/** Ser ut som en liten grästuva — inte uppenbart klickbar. */
function GrassTuftGlyph() {
  return (
    <svg
      className="parent-hotspot-glyph"
      viewBox="0 0 40 40"
      width="30"
      height="30"
      aria-hidden
    >
      <path
        d="M8 28c2-12 4-18 6-20s3 2 2 8c2-10 5-16 7-16s3 6 2 16c3-9 6-14 8-12s1 8-3 20"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

type Props = {
  settings: AppSettings
  statsCarrots: number
  onStart: (mode: Operation | 'mixed') => void
  onOpenSettings: () => void
  onToggleSound: () => void
}

export function HomeView({
  settings,
  statsCarrots,
  onStart,
  onOpenSettings,
  onToggleSound,
}: Props) {
  const enabled = enabledOperationList(settings.enabledOps)
  const canMixed = enabled.length >= 2

  const menuMusicOn =
    settings.soundEnabled && settings.menuMusicEnabled

  useEffect(() => {
    if (!menuMusicOn) {
      stopHomeMenuMusic()
      return
    }
    startHomeMenuMusic()
    const onInteract = () => nudgeHomeMenuMusic()
    window.addEventListener('pointerdown', onInteract, { capture: true })
    window.addEventListener('touchstart', onInteract, {
      capture: true,
      passive: true,
    })
    return () => {
      window.removeEventListener('pointerdown', onInteract, true)
      window.removeEventListener('touchstart', onInteract, true)
      stopHomeMenuMusic()
    }
  }, [menuMusicOn])

  return (
    <div className="screen home">
      <header className="top-bar">
        <button
          type="button"
          className="icon-btn"
          onClick={onToggleSound}
          aria-pressed={settings.soundEnabled}
          aria-label={
            settings.soundEnabled ? 'Stäng av ljud' : 'Slå på ljud'
          }
        >
          {settings.soundEnabled ? '🔊' : '🔇'}
        </button>
        <div className="carrot-badge" title="Morötter du samlat">
          🥕 {statsCarrots}
        </div>
      </header>

      <div className="hero-block">
        <div className="horse-emoji" aria-hidden>
          🐴
        </div>
        <h1>Hästmatte</h1>
        <p className="tagline">Välj vad du vill öva — tio frågor per omgång.</p>
      </div>

      <div className="btn-grid">
        {(['add', 'sub', 'mul', 'div'] as const).map((op) => {
          const on = settings.enabledOps[op]
          return (
            <button
              key={op}
              type="button"
              className="primary-btn"
              disabled={!on}
              onClick={() => on && onStart(op)}
            >
              {opLabel(op)}
            </button>
          )
        })}
        <button
          type="button"
          className="primary-btn mixed"
          disabled={!canMixed}
          onClick={() => canMixed && onStart('mixed')}
        >
          Blandat
        </button>
      </div>

      {!canMixed && enabled.length > 0 && (
        <p className="hint-text">
          Be en vuxen om du vill öva flera sätt i samma omgång.
        </p>
      )}
      {enabled.length === 0 && (
        <p className="hint-text warn">
          Be en vuxen — det finns inget att öva just nu.
        </p>
      )}

      <LongPressButton
        className="parent-settings-hotspot"
        ariaLabel="Föräldrainställningar. Håll intryck i två sekunder."
        onComplete={onOpenSettings}
        showProgress
      >
        <GrassTuftGlyph />
      </LongPressButton>
    </div>
  )
}
