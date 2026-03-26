const baseUrl = import.meta.env.BASE_URL || '/'
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

  const run = (): void => {
    const src = c.createBufferSource()
    const g = c.createGain()
    g.gain.value = gain
    src.buffer = buffer
    src.connect(g)
    g.connect(c.destination)
    src.start(0)
  }

  if (c.state === 'suspended') {
    void c.resume().then(run)
  } else {
    run()
  }
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

let wrongSoundIndex = 0

export function playCorrect(): void {
  const url =
    CORRECT_SOUND_URLS[
      Math.floor(Math.random() * CORRECT_SOUND_URLS.length)
    ]!
  playSoundUrl(url, 0.95, () => playHtmlFallback(url, 0.95))
}

export function playWrong(): void {
  const i = wrongSoundIndex % 2
  wrongSoundIndex += 1
  const url = i === 0 ? wrongScreamUrl : wrongFallScreamUrl
  const fallback = () => playHtmlFallback(url, 1)
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
  stopPracticeGameMusic()
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

/** Under övning — lägre volym än menymusik (0.32). */
const practiceGameMusicUrl = `${baseUrl}sounds/practice-lobby-466014.mp3`
const PRACTICE_GAME_MUSIC_VOLUME = 0.22
let practiceGameAudio: HTMLAudioElement | null = null

export function startPracticeGameMusic(): void {
  if (typeof Audio === 'undefined') return
  stopHomeMenuMusic()
  if (practiceGameAudio) {
    void practiceGameAudio.play().catch(() => {})
    return
  }
  const a = new Audio(practiceGameMusicUrl)
  a.loop = true
  a.preload = 'auto'
  a.volume = PRACTICE_GAME_MUSIC_VOLUME
  a.setAttribute('playsinline', 'true')
  practiceGameAudio = a
  void a.play().catch(() => {})
}

export function pausePracticeGameMusic(): void {
  practiceGameAudio?.pause()
}

export function resumePracticeGameMusic(): void {
  if (!practiceGameAudio) return
  void practiceGameAudio.play().catch(() => {})
}

export function nudgePracticeGameMusic(): void {
  if (!practiceGameAudio) return
  if (practiceGameAudio.paused) void practiceGameAudio.play().catch(() => {})
}

export function stopPracticeGameMusic(): void {
  if (!practiceGameAudio) return
  practiceGameAudio.pause()
  practiceGameAudio.removeAttribute('src')
  practiceGameAudio.load()
  practiceGameAudio = null
}
