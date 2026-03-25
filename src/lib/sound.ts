const baseUrl = import.meta.env.BASE_URL || '/'
const wrongFartUrl = `${baseUrl}sounds/wrong-fart.wav`
const wrongScreamUrl = `${baseUrl}sounds/wrong-scream.wav`
const wrongFallScreamUrl = `${baseUrl}sounds/wrong-fall-scream-392.wav`
const roundApplauseUrl = `${baseUrl}sounds/round-applause-510.wav`
const roundCheerUrl = `${baseUrl}sounds/round-cheer-515.wav`
const correctSparkleUrl = `${baseUrl}sounds/correct-sparkle-866.wav`
const correctVictoryUrl = `${baseUrl}sounds/correct-victory-2012.wav`
const correctClappingUrl = `${baseUrl}sounds/correct-clapping-479.wav`

const CORRECT_SOUND_URLS: readonly string[] = [
  correctSparkleUrl,
  correctVictoryUrl,
  correctClappingUrl,
]

const ALL_SOUND_URLS: readonly string[] = [
  wrongFartUrl,
  wrongScreamUrl,
  wrongFallScreamUrl,
  roundApplauseUrl,
  roundCheerUrl,
  ...CORRECT_SOUND_URLS,
]

let ctx: AudioContext | null = null
const bufferCache = new Map<string, AudioBuffer>()
const decodePromises = new Map<string, Promise<AudioBuffer | null>>()

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

/**
 * Förhandsladda alla WAV till AudioBuffer (låg latens på mobil).
 * Anropa efter första användartryck (pointer/touch).
 */
export function warmupSounds(): void {
  void ensureCtx()?.resume()
  for (const url of ALL_SOUND_URLS) void decodeSound(url)
}

async function decodeSound(url: string): Promise<AudioBuffer | null> {
  const c = ensureCtx()
  if (!c) return null
  const cached = bufferCache.get(url)
  if (cached) return cached

  let p = decodePromises.get(url)
  if (!p) {
    p = (async () => {
      try {
        const res = await fetch(url)
        if (!res.ok) return null
        const raw = await res.arrayBuffer()
        const copy = raw.slice(0)
        return await c.decodeAudioData(copy)
      } catch {
        return null
      }
    })()
    decodePromises.set(url, p)
  }

  const buf = await p
  decodePromises.delete(url)
  if (buf) bufferCache.set(url, buf)
  return buf
}

function playDecodedBuffer(buffer: AudioBuffer, gain: number): void {
  const c = ensureCtx()
  if (!c) return
  void c.resume()
  const src = c.createBufferSource()
  const g = c.createGain()
  g.gain.value = gain
  src.buffer = buffer
  src.connect(g)
  g.connect(c.destination)
  src.start(0)
}

function playHtmlFallback(url: string, volume: number): void {
  try {
    if (typeof Audio === 'undefined') return
    const a = new Audio(url)
    a.volume = volume
    a.setAttribute('playsinline', 'true')
    void a.play().catch(() => {})
  } catch {
    // tyst
  }
}

/**
 * Spela URL med minimal fördröjning om bufferten redan är dekodad
 * (t.ex. efter warmupSounds). Annars dekodar asynkront eller HTMLAudio-fallback.
 */
function playSoundUrl(
  url: string,
  volume: number,
  onDecodeFail?: () => void,
): void {
  void ensureCtx()?.resume()
  const cached = bufferCache.get(url)
  if (cached) {
    playDecodedBuffer(cached, volume)
    return
  }
  void decodeSound(url).then((buf) => {
    if (buf) playDecodedBuffer(buf, volume)
    else if (onDecodeFail) onDecodeFail()
    else playHtmlFallback(url, volume)
  })
}

/** Kort syntetisk "fart" för fallback. */
let wrongSoundIndex = 0

function playFartSynth(): void {
  const c = ensureCtx()
  if (!c) return

  const t0 = c.currentTime
  const dur = 0.28

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

export function playCorrect(): void {
  const url =
    CORRECT_SOUND_URLS[
      Math.floor(Math.random() * CORRECT_SOUND_URLS.length)
    ]!
  playSoundUrl(url, 0.95, () => playHtmlFallback(url, 0.95))
}

export function playWrong(): void {
  const i = wrongSoundIndex % 3
  wrongSoundIndex += 1
  const url =
    i === 0 ? wrongFartUrl : i === 1 ? wrongScreamUrl : wrongFallScreamUrl
  const fallback =
    i === 0
      ? () => playFartSynth()
      : () => playHtmlFallback(url, 1)
  playSoundUrl(url, 1, fallback)
}

export function playComplete(allCorrect: boolean): void {
  const url = allCorrect ? roundApplauseUrl : roundCheerUrl
  playSoundUrl(url, 0.85, () => playHtmlFallback(url, 0.85))
}

const homeMenuMusicUrl = `${baseUrl}sounds/menu-lobby-466008.mp3`
let homeMenuAudio: HTMLAudioElement | null = null

/** Loopande bakgrund på startskärmen (MP3 via HTMLAudio). */
export function startHomeMenuMusic(): void {
  if (typeof Audio === 'undefined') return
  if (homeMenuAudio) {
    void homeMenuAudio.play().catch(() => {})
    return
  }
  const a = new Audio(homeMenuMusicUrl)
  a.loop = true
  a.preload = 'auto'
  a.volume = 0.32
  a.setAttribute('playsinline', 'true')
  homeMenuAudio = a
  void a.play().catch(() => {})
}

/** Efter första tryck/touch (t.ex. iOS) om autoplay blockerats. */
export function nudgeHomeMenuMusic(): void {
  if (!homeMenuAudio) return
  if (homeMenuAudio.paused) void homeMenuAudio.play().catch(() => {})
}

export function stopHomeMenuMusic(): void {
  if (!homeMenuAudio) return
  homeMenuAudio.pause()
  homeMenuAudio.removeAttribute('src')
  homeMenuAudio.load()
  homeMenuAudio = null
}
