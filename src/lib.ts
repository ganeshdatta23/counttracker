import type { JapaEntry, Settings } from './types'

const ENTRIES = 'japa-sadhana-entries'
const SETTINGS = 'japa-sadhana-settings'
export const today = () => new Date().toISOString().slice(0, 10)
export const readEntries = (): JapaEntry[] => { const raw = localStorage.getItem(ENTRIES); return raw ? JSON.parse(raw) : [] }
export const saveEntries = (entries: JapaEntry[]) => localStorage.setItem(ENTRIES, JSON.stringify(entries))
export const readSettings = (): Settings => { const raw = localStorage.getItem(SETTINGS); return raw ? JSON.parse(raw) : { dailyGoal: 16, sound: true, theme: 'light' } }
export const saveSettings = (settings: Settings) => localStorage.setItem(SETTINGS, JSON.stringify(settings))
export const entryCount = (entry: Pick<JapaEntry, 'malas' | 'extra_beads'>) => Math.max(0, Math.floor(entry.malas || 0)) * 108 + Math.max(0, Math.min(107, Math.floor(entry.extra_beads || 0)))
export const getCount = (entry: Pick<JapaEntry, 'japa_count' | 'malas' | 'extra_beads'>) => Math.max(0, Math.floor(entry.japa_count ?? entryCount(entry)))
export const formatCount = (count: number) => new Intl.NumberFormat('en-IN').format(count)
export const formatDate = (value: string) => new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(`${value}T12:00:00`))
export const sum = (entries: JapaEntry[]) => entries.reduce((a, e) => a + getCount(e), 0)
export const malas = (count: number) => Math.floor(count / 108)
export const getStreak = (entries: JapaEntry[]) => {
  const dates = new Set(entries.filter(e => e.total_count > 0).map(e => e.date)); let current = 0; const cursor = new Date(`${today()}T12:00:00`)
  while (dates.has(cursor.toISOString().slice(0, 10))) { current++; cursor.setDate(cursor.getDate() - 1) }
  const sorted = [...dates].sort(); let longest = 0; let run = 0; let previous = ''
  sorted.forEach(date => { const d = new Date(`${date}T12:00:00`); const p = previous ? new Date(`${previous}T12:00:00`) : null; if (p && (d.getTime() - p.getTime()) / 86400000 === 1) run++; else run = 1; longest = Math.max(longest, run); previous = date })
  return { current, longest }
}
