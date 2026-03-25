let ctx: AudioContext | null = null

const baseUrl = import.meta.env.BASE_URL || '/'
const wrongFartUrl = `${baseUrl}sounds/wrong-fart.wav`
const wrongScreamUrl = `${baseUrl}sounds/wrong-scream.wav`
const wrongFallScreamUrl = `${baseUrl}sounds/wrong-fall-scream-392.wav`
const roundApplauseUrl = `${baseUrl}sounds/round-applause-510.wav`
const roundCheerUrl = `${baseUrl}sounds/round-cheer-515.wav`
const correctSparkleUrl = `${baseUrl}sounds/correct-sparkle-866.wav`
const correctVictoryUrl = `${baseUrl}sounds/correct-victory-2012.wav`

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

/** Kort syntetisk "fart" för fallback. */
let wrongFartAudio: HTMLAudioElement | null = null
let wrongScreamAudio: HTMLAudioElement | null = null
let wrongFallAudio: HTMLAudioElement | null = null
/** Roterar mellan tre fel-ljud. */
let wrongSoundIndex = 0

function playFartSynth(): void {
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

function playFart(): void {
  try {
    if (typeof Audio === 'undefined') {
      playFartSynth()
      return
    }
    if (!wrongFartAudio) {
      wrongFartAudio = new Audio(wrongFartUrl)
      wrongFartAudio.preload = 'auto'
      wrongFartAudio.volume = 1
      wrongFartAudio.setAttribute('playsinline', 'true')
    }
    wrongFartAudio.currentTime = 0
    const p = wrongFartAudio.play()
    if (p && typeof p.catch === 'function') {
      void p.catch(() => {
        playFartSynth()
      })
    }
  } catch {
    playFartSynth()
  }
}

function playScream(): void {
  try {
    if (typeof Audio === 'undefined') return
    if (!wrongScreamAudio) {
      wrongScreamAudio = new Audio(wrongScreamUrl)
      wrongScreamAudio.preload = 'auto'
      wrongScreamAudio.volume = 1
      wrongScreamAudio.setAttribute('playsinline', 'true')
    }
    wrongScreamAudio.currentTime = 0
    const p = wrongScreamAudio.play()
    if (p && typeof p.catch === 'function') {
      void p.catch(() => {
        playFartSynth()
      })
    }
  } catch {
    playFartSynth()
  }
}

function playFallScream(): void {
  try {
    if (typeof Audio === 'undefined') return
    if (!wrongFallAudio) {
      wrongFallAudio = new Audio(wrongFallScreamUrl)
      wrongFallAudio.preload = 'auto'
      wrongFallAudio.volume = 1
      wrongFallAudio.setAttribute('playsinline', 'true')
    }
    wrongFallAudio.currentTime = 0
    const p = wrongFallAudio.play()
    if (p && typeof p.catch === 'function') {
      void p.catch(() => {
        playFartSynth()
      })
    }
  } catch {
    playFartSynth()
  }
}

/** Ett Audio-element som byter källa — mer tillförlitligt på mobil än två separata instanser. */
let correctAudio: HTMLAudioElement | null = null

/** Slumpa mellan två Mixkit-ljud vid rätt svar. */
export function playCorrect(): void {
  try {
    if (typeof Audio === 'undefined') return
    void ensureCtx()?.resume()
    const url =
      Math.random() < 0.5 ? correctSparkleUrl : correctVictoryUrl
    if (!correctAudio) {
      correctAudio = new Audio()
      correctAudio.preload = 'auto'
      correctAudio.setAttribute('playsinline', 'true')
    }
    correctAudio.volume = 0.95
    correctAudio.src = url

    const tryPlay = () => {
      if (!correctAudio) return
      correctAudio.currentTime = 0
      const p = correctAudio.play()
      if (p && typeof p.catch === 'function') {
        void p.catch(() => {
          requestAnimationFrame(() => {
            void correctAudio?.play().catch(() => {})
          })
        })
      }
    }

    correctAudio.load()
    if (correctAudio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      tryPlay()
    } else {
      correctAudio.addEventListener('canplay', tryPlay, { once: true })
    }
  } catch {
    // tyst
  }
}

export function playWrong(): void {
  const i = wrongSoundIndex % 3
  wrongSoundIndex += 1
  if (i === 0) playFart()
  else if (i === 1) playScream()
  else playFallScream()
}

let roundApplauseAudio: HTMLAudioElement | null = null
let roundCheerAudio: HTMLAudioElement | null = null

function playRoundAudio(audio: HTMLAudioElement | null, url: string): void {
  try {
    if (typeof Audio === 'undefined') return
    const a = audio ?? new Audio(url)
    a.preload = 'auto'
    a.volume = 0.85
    a.currentTime = 0
    const p = a.play()
    if (p && typeof p.catch === 'function') {
      void p.catch(() => {
        // Fallback om spelning blockeras.
        playRoundCompleteFallback()
      })
    }
    return
  } catch {
    playRoundCompleteFallback()
  }
}

function playRoundCompleteFallback(): void {
  // Tyst fallback om WAV-laddning skulle blockeras.
}

/**
 * Spelas när omgången är slut.
 * - `allCorrect === true` => 10/10: publik-апplause.
 * - Annars => crowd cheer/scream/applause.
 */
export function playComplete(allCorrect: boolean): void {
  if (allCorrect) {
    if (!roundApplauseAudio) {
      roundApplauseAudio = new Audio(roundApplauseUrl)
      roundApplauseAudio.setAttribute('playsinline', 'true')
    }
    playRoundAudio(roundApplauseAudio, roundApplauseUrl)
  } else {
    if (!roundCheerAudio) {
      roundCheerAudio = new Audio(roundCheerUrl)
      roundCheerAudio.setAttribute('playsinline', 'true')
    }
    playRoundAudio(roundCheerAudio, roundCheerUrl)
  }
}
