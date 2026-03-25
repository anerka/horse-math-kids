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

/** Kort “hovslag” — två mjuka dunsar. */
function playClipClop(delayMs: number): void {
  const c = ensureCtx()
  if (!c) return
  const now = c.currentTime + delayMs / 1000

  for (let i = 0; i < 2; i++) {
    const t = now + i * 0.09
    const osc = c.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = 88 + i * 6
    const g = c.createGain()
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(0.11, t + 0.004)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.055)
    osc.connect(g)
    g.connect(c.destination)
    osc.start(t)
    osc.stop(t + 0.065)
  }
}

/**
 * Enkel syntetisk “gnäggning”: svept ton + vibrato + lätt brus i början.
 * Ingen extern ljudfil — fungerar offline i PWA.
 */
function playNeigh(): void {
  const c = ensureCtx()
  if (!c) return
  const t0 = c.currentTime

  const breath = c.createBufferSource()
  const noiseDur = 0.045
  const buf = c.createBuffer(1, Math.ceil(c.sampleRate * noiseDur), c.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.35
  }
  breath.buffer = buf
  const bp = c.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 1200
  bp.Q.value = 0.7
  const bg = c.createGain()
  bg.gain.setValueAtTime(0, t0)
  bg.gain.linearRampToValueAtTime(0.06, t0 + 0.012)
  bg.gain.exponentialRampToValueAtTime(0.0001, t0 + noiseDur)
  breath.connect(bp)
  bp.connect(bg)
  bg.connect(c.destination)
  breath.start(t0)
  breath.stop(t0 + noiseDur + 0.01)

  const osc = c.createOscillator()
  osc.type = 'triangle'
  const filter = c.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(2200, t0)
  filter.frequency.exponentialRampToValueAtTime(900, t0 + 0.28)
  const g = c.createGain()
  g.gain.setValueAtTime(0, t0)
  g.gain.linearRampToValueAtTime(0.1, t0 + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.34)

  osc.frequency.setValueAtTime(780, t0)
  osc.frequency.exponentialRampToValueAtTime(340, t0 + 0.16)
  osc.frequency.linearRampToValueAtTime(520, t0 + 0.26)

  const lfo = c.createOscillator()
  lfo.type = 'sine'
  lfo.frequency.value = 6.5
  const lfoGain = c.createGain()
  lfoGain.gain.value = 38
  lfo.connect(lfoGain)
  lfoGain.connect(osc.frequency)

  osc.connect(filter)
  filter.connect(g)
  g.connect(c.destination)
  lfo.start(t0)
  osc.start(t0)
  lfo.stop(t0 + 0.35)
  osc.stop(t0 + 0.36)

  const osc2 = c.createOscillator()
  osc2.type = 'sawtooth'
  osc2.frequency.setValueAtTime(390, t0)
  osc2.frequency.exponentialRampToValueAtTime(170, t0 + 0.18)
  const f2 = c.createBiquadFilter()
  f2.type = 'bandpass'
  f2.frequency.value = 700
  f2.Q.value = 1.2
  const g2 = c.createGain()
  g2.gain.setValueAtTime(0, t0)
  g2.gain.linearRampToValueAtTime(0.035, t0 + 0.03)
  g2.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.3)
  osc2.connect(f2)
  f2.connect(g2)
  g2.connect(c.destination)
  osc2.start(t0)
  osc2.stop(t0 + 0.32)
}

export function playCorrect(): void {
  playNeigh()
  playClipClop(260)
  setTimeout(() => beep(1174, 90, 'sine', 0.035), 320)
}

export function playWrong(): void {
  beep(220, 200, 'triangle', 0.07)
}

export function playComplete(): void {
  playNeigh()
  setTimeout(() => playClipClop(40), 180)
  setTimeout(() => beep(523, 100, 'sine', 0.05), 400)
  setTimeout(() => beep(659, 100, 'sine', 0.045), 500)
  setTimeout(() => beep(784, 160, 'sine', 0.04), 600)
}
