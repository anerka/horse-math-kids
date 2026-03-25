export type Preset = 'easy' | 'medium' | 'hard' | 'custom'

export type Operation = 'add' | 'sub' | 'mul' | 'div'

export interface EnabledOps {
  add: boolean
  sub: boolean
  mul: boolean
  div: boolean
}

export interface AppSettings {
  preset: Preset
  addSubMax: number
  mulDivMax: number
  includeZero: boolean
  enabledOps: EnabledOps
  soundEnabled: boolean
}

export const STORAGE_KEY = 'hastmatte-settings-v1'

export const defaultSettings: AppSettings = {
  preset: 'medium',
  addSubMax: 20,
  mulDivMax: 10,
  includeZero: true,
  enabledOps: { add: true, sub: true, mul: true, div: true },
  soundEnabled: true,
}

export function presetValues(
  preset: Exclude<Preset, 'custom'>,
): Pick<AppSettings, 'addSubMax' | 'mulDivMax'> {
  switch (preset) {
    case 'easy':
      return { addSubMax: 10, mulDivMax: 5 }
    case 'medium':
      return { addSubMax: 20, mulDivMax: 10 }
    case 'hard':
      return { addSubMax: 50, mulDivMax: 12 }
  }
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...defaultSettings }
    const parsed = JSON.parse(raw) as Partial<AppSettings>
    return {
      ...defaultSettings,
      ...parsed,
      enabledOps: {
        ...defaultSettings.enabledOps,
        ...parsed.enabledOps,
      },
      addSubMax: clamp(
        Number(parsed.addSubMax ?? defaultSettings.addSubMax),
        2,
        99,
      ),
      mulDivMax: clamp(
        Number(parsed.mulDivMax ?? defaultSettings.mulDivMax),
        2,
        20,
      ),
    }
  } catch {
    return { ...defaultSettings }
  }
}

export function saveSettings(s: AppSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
}

export function enabledOperationList(ops: EnabledOps): Operation[] {
  const out: Operation[] = []
  if (ops.add) out.push('add')
  if (ops.sub) out.push('sub')
  if (ops.mul) out.push('mul')
  if (ops.div) out.push('div')
  return out
}
