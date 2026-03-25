import type { AppSettings, Operation } from './settings'
import { enabledOperationList } from './settings'

export interface Problem {
  op: Operation
  left: number
  right: number
  answer: number
}

function randInt(min: number, max: number): number {
  if (max < min) return min
  return min + Math.floor(Math.random() * (max - min + 1))
}

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]!
}

function operandMin(settings: AppSettings): number {
  return settings.includeZero ? 0 : 1
}

function genAdd(settings: AppSettings): Problem {
  const lo = operandMin(settings)
  const hi = settings.addSubMax
  const a = randInt(lo, hi)
  const b = randInt(lo, hi)
  return { op: 'add', left: a, right: b, answer: a + b }
}

function genSub(settings: AppSettings): Problem {
  const lo = operandMin(settings)
  const hi = settings.addSubMax
  const a = randInt(lo, hi)
  const b = randInt(lo, a)
  return { op: 'sub', left: a, right: b, answer: a - b }
}

function genMul(settings: AppSettings): Problem {
  const lo = operandMin(settings)
  const hi = settings.mulDivMax
  const a = randInt(lo, hi)
  const b = randInt(lo, hi)
  return { op: 'mul', left: a, right: b, answer: a * b }
}

function genDiv(settings: AppSettings): Problem {
  const loQ = settings.includeZero ? 0 : 1
  const hi = settings.mulDivMax
  const divisor = randInt(1, hi)
  const quotient = randInt(loQ, hi)
  const dividend = quotient * divisor
  return { op: 'div', left: dividend, right: divisor, answer: quotient }
}

function genForOp(settings: AppSettings, op: Operation): Problem {
  switch (op) {
    case 'add':
      return genAdd(settings)
    case 'sub':
      return genSub(settings)
    case 'mul':
      return genMul(settings)
    case 'div':
      return genDiv(settings)
  }
}

export function generateProblems(
  settings: AppSettings,
  mode: Operation | 'mixed',
  count: number,
): Problem[] {
  const enabled = enabledOperationList(settings.enabledOps)
  if (enabled.length === 0) return []

  const pool: Operation[] =
    mode === 'mixed' ? enabled : enabled.includes(mode) ? [mode] : enabled

  const problems: Problem[] = []
  for (let i = 0; i < count; i++) {
    const op = pick(pool)
    problems.push(genForOp(settings, op))
  }
  return problems
}

export function opLabel(op: Operation): string {
  switch (op) {
    case 'add':
      return 'Plus'
    case 'sub':
      return 'Minus'
    case 'mul':
      return 'Gånger'
    case 'div':
      return 'Delat'
  }
}

export function opSymbol(op: Operation): string {
  switch (op) {
    case 'add':
      return '+'
    case 'sub':
      return '−'
    case 'mul':
      return '×'
    case 'div':
      return '÷'
  }
}
