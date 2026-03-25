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

/** Kort luft / fnysning i början av ett gnägg. */
function playBreathNoise(t0: number, duration: number, gain: number): void {
  const c = ensureCtx()
  if (!c) return
  const buf = c.createBuffer(
    1,
    Math.ceil(c.sampleRate * duration),
    c.sampleRate,
  )
  const data = buf.getChannelData(0)
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.5
  }
  const src = c.createBufferSource()
  src.buffer = buf
  const hp = c.createBiquadFilter()
  hp.type = 'highpass'
  hp.frequency.value = 400
  const bp = c.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 1400
  bp.Q.value = 0.9
  const g = c.createGain()
  g.gain.setValueAtTime(0, t0)
  g.gain.linearRampToValueAtTime(gain, t0 + 0.008)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  src.connect(hp)
  hp.connect(bp)
  bp.connect(g)
  g.connect(c.destination)
  src.start(t0)
  src.stop(t0 + duration + 0.02)
}

/**
 * Ett hovslag: låg duns (simulerar mark + hov) + kort brus för “klack”.
 */
function singleHoofHit(t: number, intensity: number): void {
  const c = ensureCtx()
  if (!c) return

  const thud = c.createOscillator()
  thud.type = 'sine'
  thud.frequency.value = 62 + Math.random() * 8
  const tg = c.createGain()
  tg.gain.setValueAtTime(0, t)
  tg.gain.linearRampToValueAtTime(0.22 * intensity, t + 0.003)
  tg.gain.exponentialRampToValueAtTime(0.0001, t + 0.12)
  thud.connect(tg)
  tg.connect(c.destination)
  thud.start(t)
  thud.stop(t + 0.14)

  const buf = c.createBuffer(1, Math.ceil(c.sampleRate * 0.04), c.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.45
  }
  const n = c.createBufferSource()
  n.buffer = buf
  const nf = c.createBiquadFilter()
  nf.type = 'bandpass'
  nf.frequency.value = 280 + Math.random() * 120
  nf.Q.value = 1.4
  const ng = c.createGain()
  ng.gain.setValueAtTime(0, t)
  ng.gain.linearRampToValueAtTime(0.14 * intensity, t + 0.001)
  ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.035)
  n.connect(nf)
  nf.connect(ng)
  ng.connect(c.destination)
  n.start(t)
  n.stop(t + 0.045)
}

/** Ett eller två hovslag med lite mänsklig oregelbundenhet. */
function playClipClop(delayMs: number, pairs = 1): void {
  const c = ensureCtx()
  if (!c) return
  const base = c.currentTime + delayMs / 1000
  for (let p = 0; p < pairs; p++) {
    const off = p * 0.11 + (Math.random() - 0.5) * 0.02
    singleHoofHit(base + off, 0.85)
    singleHoofHit(base + off + 0.07 + Math.random() * 0.02, 0.75)
  }
}

/**
 * Gnägg / gnäggning: svepande grundton, nasal klang (formanter), vibrato,
 * harmonisk kropp — närmare ett riktigt gnägg än en ren sinus.
 */
function playNeigh(): void {
  const c = ensureCtx()
  if (!c) return
  const t0 = c.currentTime
  const dur = 0.52

  playBreathNoise(t0, 0.055, 0.07)

  const body = c.createOscillator()
  body.type = 'sawtooth'
  const bodyFilt = c.createBiquadFilter()
  bodyFilt.type = 'lowpass'
  bodyFilt.Q.value = 2.8
  bodyFilt.frequency.setValueAtTime(2400, t0)
  bodyFilt.frequency.exponentialRampToValueAtTime(520, t0 + dur * 0.92)

  body.frequency.setValueAtTime(920, t0)
  body.frequency.exponentialRampToValueAtTime(410, t0 + dur * 0.38)
  body.frequency.linearRampToValueAtTime(580, t0 + dur * 0.72)
  body.frequency.exponentialRampToValueAtTime(320, t0 + dur)

  const vib = c.createOscillator()
  vib.type = 'sine'
  vib.frequency.setValueAtTime(11, t0)
  vib.frequency.exponentialRampToValueAtTime(5.5, t0 + dur * 0.5)
  const vibDepth = c.createGain()
  vibDepth.gain.setValueAtTime(22, t0)
  vibDepth.gain.linearRampToValueAtTime(38, t0 + dur * 0.35)
  vibDepth.gain.linearRampToValueAtTime(18, t0 + dur)
  vib.connect(vibDepth)
  vibDepth.connect(body.frequency)

  const bodyGain = c.createGain()
  bodyGain.gain.setValueAtTime(0, t0)
  bodyGain.gain.linearRampToValueAtTime(0.11, t0 + 0.028)
  bodyGain.gain.setValueAtTime(0.1, t0 + dur * 0.55)
  bodyGain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur + 0.04)

  body.connect(bodyFilt)
  bodyFilt.connect(bodyGain)
  bodyGain.connect(c.destination)
  vib.start(t0)
  body.start(t0)
  vib.stop(t0 + dur + 0.05)
  body.stop(t0 + dur + 0.06)

  const nasal = c.createOscillator()
  nasal.type = 'square'
  nasal.frequency.setValueAtTime(460, t0)
  nasal.frequency.exponentialRampToValueAtTime(205, t0 + dur * 0.42)
  nasal.frequency.linearRampToValueAtTime(290, t0 + dur * 0.78)
  const nFilt = c.createBiquadFilter()
  nFilt.type = 'bandpass'
  nFilt.frequency.value = 1100
  nFilt.Q.value = 4.2
  const nGain = c.createGain()
  nGain.gain.setValueAtTime(0, t0)
  nGain.gain.linearRampToValueAtTime(0.045, t0 + 0.04)
  nGain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur * 0.95)
  nasal.connect(nFilt)
  nFilt.connect(nGain)
  nGain.connect(c.destination)
  nasal.start(t0)
  nasal.stop(t0 + dur + 0.02)

  const grunt = c.createOscillator()
  grunt.type = 'triangle'
  grunt.frequency.setValueAtTime(180, t0 + 0.06)
  grunt.frequency.exponentialRampToValueAtTime(95, t0 + dur * 0.65)
  const gF = c.createBiquadFilter()
  gF.type = 'lowpass'
  gF.frequency.value = 420
  const gG = c.createGain()
  gG.gain.setValueAtTime(0, t0 + 0.05)
  gG.gain.linearRampToValueAtTime(0.055, t0 + 0.09)
  gG.gain.exponentialRampToValueAtTime(0.0001, t0 + dur * 0.88)
  grunt.connect(gF)
  gF.connect(gG)
  gG.connect(c.destination)
  grunt.start(t0)
  grunt.stop(t0 + dur + 0.02)
}

/** Liten bekräftande “nicker” efter rätt svar (ingen musikpip). */
function playSoftNicker(delayMs: number): void {
  const c = ensureCtx()
  if (!c) return
  const t0 = c.currentTime + delayMs / 1000
  const d = 0.2

  const osc = c.createOscillator()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(520, t0)
  osc.frequency.exponentialRampToValueAtTime(380, t0 + d)
  const f = c.createBiquadFilter()
  f.type = 'lowpass'
  f.frequency.setValueAtTime(1600, t0)
  f.frequency.exponentialRampToValueAtTime(700, t0 + d)
  const g = c.createGain()
  g.gain.setValueAtTime(0, t0)
  g.gain.linearRampToValueAtTime(0.05, t0 + 0.015)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + d + 0.02)
  osc.connect(f)
  f.connect(g)
  g.connect(c.destination)
  osc.start(t0)
  osc.stop(t0 + d + 0.03)
}

export function playCorrect(): void {
  playNeigh()
  playClipClop(280, 1)
  playSoftNicker(520)
}

export function playWrong(): void {
  const c = ensureCtx()
  if (!c) return
  const t0 = c.currentTime
  const osc = c.createOscillator()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(165, t0)
  osc.frequency.exponentialRampToValueAtTime(95, t0 + 0.18)
  const f = c.createBiquadFilter()
  f.type = 'lowpass'
  f.frequency.value = 380
  const g = c.createGain()
  g.gain.setValueAtTime(0, t0)
  g.gain.linearRampToValueAtTime(0.06, t0 + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.22)
  osc.connect(f)
  f.connect(g)
  g.connect(c.destination)
  osc.start(t0)
  osc.stop(t0 + 0.25)
}

export function playComplete(): void {
  playNeigh()
  setTimeout(() => playClipClop(0, 1), 200)
  setTimeout(() => playClipClop(0, 1), 420)
  setTimeout(() => playSoftNicker(100), 620)
}
