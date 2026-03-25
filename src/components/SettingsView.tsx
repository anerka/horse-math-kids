import { useState } from 'react'
import type { AppSettings } from '../lib/settings'
import { presetValues } from '../lib/settings'

type Props = {
  initial: AppSettings
  onSave: (s: AppSettings) => void
  onClose: () => void
}

export function SettingsView({ initial, onSave, onClose }: Props) {
  const [s, setS] = useState<AppSettings>(() => ({ ...initial }))

  const setPreset = (p: Exclude<Preset, 'custom'>) => {
    const v = presetValues(p)
    setS((prev) => ({
      ...prev,
      preset: p,
      addSubMax: v.addSubMax,
      mulDivMax: v.mulDivMax,
    }))
  }

  const markCustom = () => setS((prev) => ({ ...prev, preset: 'custom' }))

  return (
    <div className="screen settings">
      <header className="settings-head">
        <h1>Inställningar</h1>
        <button type="button" className="text-btn" onClick={onClose}>
          Stäng
        </button>
      </header>

      <section className="settings-section">
        <h2>Svårighetsgrad</h2>
        <div className="chip-row">
          {(
            [
              ['easy', 'Lätt'],
              ['medium', 'Medel'],
              ['hard', 'Svår'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={
                s.preset === key ? 'chip active' : 'chip'
              }
              onClick={() => setPreset(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="hint-text">
          Förval styr hur stora tal som används. Du kan finjustera nedan.
        </p>
      </section>

      <section className="settings-section">
        <h2>Avancerat — talstorlek</h2>
        <label className="field">
          <span>Addition &amp; subtraktion: max {s.addSubMax}</span>
          <input
            type="range"
            min={2}
            max={99}
            value={s.addSubMax}
            onChange={(e) => {
              markCustom()
              setS((p) => ({
                ...p,
                addSubMax: Number(e.target.value),
              }))
            }}
          />
        </label>
        <label className="field">
          <span>Multiplikation &amp; division: max {s.mulDivMax}</span>
          <input
            type="range"
            min={2}
            max={20}
            value={s.mulDivMax}
            onChange={(e) => {
              markCustom()
              setS((p) => ({
                ...p,
                mulDivMax: Number(e.target.value),
              }))
            }}
          />
        </label>
      </section>

      <section className="settings-section">
        <h2>Räknesätt</h2>
        <div className="toggle-list">
          {(
            [
              ['add', 'Plus'],
              ['sub', 'Minus'],
              ['mul', 'Gånger'],
              ['div', 'Division'],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="toggle-row">
              <span>{label}</span>
              <input
                type="checkbox"
                checked={s.enabledOps[key]}
                onChange={(e) =>
                  setS((p) => ({
                    ...p,
                    enabledOps: {
                      ...p.enabledOps,
                      [key]: e.target.checked,
                    },
                  }))
                }
              />
            </label>
          ))}
        </div>
      </section>

      <section className="settings-section">
        <h2>Övrigt</h2>
        <label className="toggle-row">
          <span>Inkludera 0 i talen</span>
          <input
            type="checkbox"
            checked={s.includeZero}
            onChange={(e) =>
              setS((p) => ({ ...p, includeZero: e.target.checked }))
            }
          />
        </label>
        <label className="toggle-row">
          <span>Ljud</span>
          <input
            type="checkbox"
            checked={s.soundEnabled}
            onChange={(e) =>
              setS((p) => ({ ...p, soundEnabled: e.target.checked }))
            }
          />
        </label>
      </section>

      <div className="settings-actions">
        <button
          type="button"
          className="primary-btn"
          onClick={() => {
            onSave(s)
            onClose()
          }}
        >
          Spara
        </button>
      </div>
    </div>
  )
}
