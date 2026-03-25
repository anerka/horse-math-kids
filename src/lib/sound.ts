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

/** Kort syntetisk "fart": brus i basregistret + liten ton-svaj. */
let wrongFartAudio: HTMLAudioElement | null = null

function playFart(): void {
  // Preferera den riktiga ljudfilen (kort och tydlig).
  try {
    if (typeof Audio !== 'undefined') {
      if (!wrongFartAudio) {
        wrongFartAudio = new Audio('/sounds/wrong-fart.wav')
        wrongFartAudio.preload = 'auto'
        wrongFartAudio.volume = 0.85
      }
      wrongFartAudio.currentTime = 0
      void wrongFartAudio.play().catch(() => {
        // Om autoplay/blockering händer: kör fallback-syntes.
      })
      return
    }
  } catch {
    // Kör fallback.
  }

  // Fallback: syntetisk fart om filen inte kan spelas.
  const c = ensureCtx()
  if (!c) return

  const t0 = c.currentTime
  const dur = 0.28

  // Basigt brus med svepande "formant" som ger fartkänsla.
  const buf = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.55
  }
  const src = c.createBufferSource()
  src.buffer = buf

  const bp = c.createBiquadFilter()
  bp.type = 'bandpass'
  bp.Q.value = 7.5
  bp.frequency.setValueAtTime(230, t0)
  bp.frequency.exponentialRampToValueAtTime(110, t0 + dur * 0.75)

  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(0.09, t0 + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)

  src.connect(bp)
  bp.connect(g)
  g.connect(c.destination)
  src.start(t0)
  src.stop(t0 + dur + 0.02)

  // Liten "ton-svank" under bruset.
  const osc = c.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(140, t0 + 0.01)
  osc.frequency.exponentialRampToValueAtTime(85, t0 + dur * 0.9)

  const of = c.createBiquadFilter()
  of.type = 'lowpass'
  of.frequency.value = 360

  const og = c.createGain()
  og.gain.setValueAtTime(0.0001, t0)
  og.gain.exponentialRampToValueAtTime(0.03, t0 + 0.03)
  og.gain.exponentialRampToValueAtTime(0.0001, t0 + dur * 0.85)

  osc.connect(of)
  of.connect(og)
  og.connect(c.destination)
  osc.start(t0)
  osc.stop(t0 + dur)
}

/** Kort glad tvåton — tydlig bekräftelse utan “hästljud”. */
export function playCorrect(): void {
  beep(784, 85, 'sine', 0.055)
  setTimeout(() => beep(1047, 110, 'sine', 0.042), 70)
}

export function playWrong(): void {
  playFart()
  beep(220, 200, 'triangle', 0.055)
}

/** Liten uppåtgående sekvens när omgången är klar. */
export function playComplete(): void {
  beep(523, 100, 'sine', 0.05)
  setTimeout(() => beep(659, 100, 'sine', 0.045), 120)
  setTimeout(() => beep(784, 160, 'sine', 0.038), 240)
}
