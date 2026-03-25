import { useCallback, useEffect, useState } from 'react'
import type { AppSettings, Operation } from './lib/settings'
import { loadSettings, saveSettings } from './lib/settings'
import { loadStats } from './lib/stats'
import { warmupSounds } from './lib/sound'
import { HomeView } from './components/HomeView'
import { PracticeView } from './components/PracticeView'
import { SettingsView } from './components/SettingsView'

type Screen =
  | { name: 'home' }
  | { name: 'practice'; mode: Operation | 'mixed' }
  | { name: 'settings' }

function App() {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings())
  const [statsCarrots, setStatsCarrots] = useState(() => loadStats().carrots)
  const [screen, setScreen] = useState<Screen>({ name: 'home' })

  const persist = useCallback((s: AppSettings) => {
    saveSettings(s)
    setSettings(s)
  }, [])

  const refreshStats = useCallback(() => {
    setStatsCarrots(loadStats().carrots)
  }, [])

  useEffect(() => {
    const onFirstInteract = () => {
      warmupSounds()
      window.removeEventListener('pointerdown', onFirstInteract, true)
      window.removeEventListener('touchstart', onFirstInteract, true)
    }
    window.addEventListener('pointerdown', onFirstInteract, { capture: true })
    window.addEventListener('touchstart', onFirstInteract, {
      capture: true,
      passive: true,
    })
    return () => {
      window.removeEventListener('pointerdown', onFirstInteract, true)
      window.removeEventListener('touchstart', onFirstInteract, true)
    }
  }, [])

  if (screen.name === 'settings') {
    return (
      <SettingsView
        initial={settings}
        onSave={persist}
        onClose={() => setScreen({ name: 'home' })}
      />
    )
  }

  if (screen.name === 'practice') {
    return (
      <PracticeView
        settings={settings}
        mode={screen.mode}
        onExit={() => {
          refreshStats()
          setScreen({ name: 'home' })
        }}
      />
    )
  }

  return (
    <HomeView
      settings={settings}
      statsCarrots={statsCarrots}
      onStart={(mode) => setScreen({ name: 'practice', mode })}
      onOpenSettings={() => setScreen({ name: 'settings' })}
      onToggleSound={() =>
        persist({ ...settings, soundEnabled: !settings.soundEnabled })
      }
    />
  )
}

export default App
