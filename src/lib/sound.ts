let ctx: AudioContext | null = null

function ensureCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    if (!AC) return null
    if (!ctx) ctx = new AC()
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

function beep(
  frequency: number,
  durationMs: number,
  type: OscillatorType,
  gain: number,
): void {
  const c = ensureCtx()
  if (!c) return
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.value = frequency
  g.gain.value = gain
  osc.connect(g)
  g.connect(c.destination)
  const now = c.currentTime
  osc.start(now)
  g.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000)
  osc.stop(now + durationMs / 1000 + 0.02)
}

export function playCorrect(): void {
  beep(880, 120, 'sine', 0.06)
  setTimeout(() => beep(1174, 140, 'sine', 0.05), 80)
}

export function playWrong(): void {
  beep(220, 200, 'triangle', 0.07)
}

export function playComplete(): void {
  beep(523, 100, 'sine', 0.06)
  setTimeout(() => beep(659, 100, 'sine', 0.055), 90)
  setTimeout(() => beep(784, 160, 'sine', 0.05), 180)
}
