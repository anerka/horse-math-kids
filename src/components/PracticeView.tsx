import { useCallback, useEffect, useMemo, useState } from 'react'
import type { AppSettings, Operation } from '../lib/settings'
import {
  generateProblems,
  opLabel,
  opSymbol,
  type Problem,
} from '../lib/problems'
import { CelebrationHorse } from './CelebrationHorse'
import {
  nudgePracticeGameMusic,
  pausePracticeGameMusic,
  playComplete,
  playCorrect,
  playWrong,
  resumePracticeGameMusic,
  startPracticeGameMusic,
  stopHomeMenuMusic,
  stopPracticeGameMusic,
  warmupSounds,
} from '../lib/sound'
import { addRoundReward } from '../lib/stats'

const baseUrl = import.meta.env.BASE_URL || '/'

const ROUND_LEN = 10

type Props = {
  settings: AppSettings
  mode: Operation | 'mixed'
  onExit: () => void
}

function starsForScore(score: number): 1 | 2 | 3 {
  if (score >= 10) return 3
  if (score >= 8) return 2
  return 1
}

export function PracticeView({ settings, mode, onExit }: Props) {
  const problems = useMemo(
    () => generateProblems(settings, mode, ROUND_LEN),
    [settings, mode],
  )

  useEffect(() => {
    stopHomeMenuMusic()
    warmupSounds()
  }, [])

  useEffect(() => {
    const nudge = () => nudgePracticeGameMusic()
    window.addEventListener('pointerdown', nudge, { capture: true })
    window.addEventListener('touchstart', nudge, {
      capture: true,
      passive: true,
    })
    return () => {
      window.removeEventListener('pointerdown', nudge, true)
      window.removeEventListener('touchstart', nudge, true)
      stopPracticeGameMusic()
    }
  }, [])

  const [index, setIndex] = useState(0)
  const [input, setInput] = useState('')
  const [score, setScore] = useState(0)
  const [phase, setPhase] = useState<'answer' | 'feedback' | 'done'>('answer')
  const [lastOk, setLastOk] = useState<boolean | null>(null)
  const [rewardTotal, setRewardTotal] = useState<number | null>(null)
  const [roundStars, setRoundStars] = useState<1 | 2 | 3>(1)

  useEffect(() => {
    if (!settings.soundEnabled || problems.length === 0) {
      stopPracticeGameMusic()
      return
    }
    if (phase === 'done') {
      stopPracticeGameMusic()
      return
    }
    if (phase === 'feedback' && lastOk === false) {
      pausePracticeGameMusic()
      return
    }
    startPracticeGameMusic()
    resumePracticeGameMusic()
  }, [settings.soundEnabled, problems.length, phase, lastOk])

  const p: Problem | undefined = problems[index]

  const onSubmit = useCallback(() => {
    if (!p || phase !== 'answer') return
    const n = Number.parseInt(input.trim(), 10)
    if (Number.isNaN(n)) return
    const ok = n === p.answer
    setLastOk(ok)
    if (ok) {
      setScore((s) => s + 1)
      if (settings.soundEnabled) playCorrect()
    } else if (settings.soundEnabled) {
      playWrong()
    }
    setPhase('feedback')
  }, [input, p, phase, settings.soundEnabled])

  const goNext = useCallback(() => {
    if (index + 1 >= problems.length) {
      const stars = starsForScore(score)
      setRoundStars(stars)
      if (settings.soundEnabled) playComplete(score === ROUND_LEN)
      const st = addRoundReward(stars)
      setRewardTotal(st.carrots)
      setPhase('done')
    } else {
      setIndex((i) => i + 1)
      setInput('')
      setPhase('answer')
      setLastOk(null)
    }
  }, [index, problems.length, score, settings.soundEnabled])

  if (problems.length === 0) {
    return (
      <div className="screen practice">
        <p>Inga räknesätt är påslagna.</p>
        <button type="button" className="secondary-btn" onClick={onExit}>
          Tillbaka
        </button>
      </div>
    )
  }

  if (phase === 'done') {
    return (
      <div className="screen practice done-screen">
        <div className="done-horse-wrap" aria-hidden>
          <img
            className="done-horse"
            src={`${baseUrl}thumbsup-horse.png`}
            alt=""
            width={930}
            height={1024}
            decoding="async"
          />
        </div>
        <h2>Bra jobbat!</h2>
        <p className="score-line">
          Du fick <strong>{score}</strong> av {ROUND_LEN} rätt.
        </p>
        <div className="stars" aria-label={`${roundStars} stjärnor av tre`}>
          {[1, 2, 3].map((i) => (
            <span key={i} className={i <= roundStars ? 'star on' : 'star'}>
              ★
            </span>
          ))}
        </div>
        {rewardTotal !== null && (
          <p className="carrot-reward">
            Du fick {roundStars} morötter! 🥕 Totalt: {rewardTotal}
          </p>
        )}
        <button type="button" className="primary-btn" onClick={onExit}>
          Till start
        </button>
      </div>
    )
  }

  return (
    <div className="screen practice">
      <div className="practice-top">
        <button type="button" className="text-btn" onClick={onExit}>
          Avsluta
        </button>
        <div className="progress">
          Fråga {index + 1} / {ROUND_LEN}
        </div>
      </div>

      {p && phase === 'answer' && (
        <>
          <div className="mode-pill">
            {mode === 'mixed' ? 'Blandat' : opLabel(mode)}
          </div>
          <div className="question" aria-live="polite">
            <span className="q-num">{p.left}</span>
            <span className="q-op">{opSymbol(p.op)}</span>
            <span className="q-num">{p.right}</span>
            <span className="q-eq">=</span>
            <span className="q-placeholder">?</span>
          </div>

          <div className="answer-display" aria-label="Ditt svar">
            {input || '…'}
          </div>

          <div className="numpad">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'ok'].map(
              (k) => (
                <button
                  key={k}
                  type="button"
                  className={
                    k === 'ok'
                      ? 'num-btn ok'
                      : k === 'clear'
                        ? 'num-btn clear'
                        : 'num-btn'
                  }
                  onClick={() => {
                    if (k === 'clear') {
                      setInput('')
                      return
                    }
                    if (k === 'ok') {
                      onSubmit()
                      return
                    }
                    if (input.length >= 4) return
                    setInput((s) => s + k)
                  }}
                >
                  {k === 'clear' ? 'Rensa' : k === 'ok' ? 'Kolla' : k}
                </button>
              ),
            )}
          </div>
        </>
      )}

      {p && phase === 'feedback' && (
        <div className="feedback-panel">
          {lastOk ? (
            <div className="correct-celebrate">
              <div className="correct-celebrate-art" aria-hidden>
                <CelebrationHorse />
              </div>
              <p className="fb ok correct-celebrate-msg">Rätt, bra räknat!</p>
            </div>
          ) : (
            <div className="wrong-feedback-block">
              <div className="wrong-feedback-horse-art" aria-hidden>
                <img
                  className="wrong-feedback-horse"
                  src={`${baseUrl}error-horse.png`}
                  alt=""
                  width={993}
                  height={1024}
                  decoding="async"
                />
              </div>
              <p className="fb no">
                Inte riktigt. Rätt svar är {p.answer}.
              </p>
            </div>
          )}
          <button type="button" className="primary-btn" onClick={goNext}>
            {index + 1 >= ROUND_LEN ? 'Visa resultat' : 'Nästa fråga'}
          </button>
        </div>
      )}
    </div>
  )
}
