import type { AppSettings, Operation } from '../lib/settings'
import { enabledOperationList } from '../lib/settings'
import { opLabel } from '../lib/problems'
import { LongPressButton } from './LongPressButton'

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
          Slå på minst två räknesätt i inställningar för att använda blandat.
        </p>
      )}
      {enabled.length === 0 && (
        <p className="hint-text warn">
          Alla räknesätt är avstängda. Be en vuxen öppna inställningar.
        </p>
      )}

      <LongPressButton
        className="settings-entry"
        label="Inställningar"
        hint="Håll intryck i 2 sekunder (för vuxna)"
        onComplete={onOpenSettings}
      />
    </div>
  )
}
