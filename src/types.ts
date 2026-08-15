export type Mood = 'Focused' | 'Distracted' | 'Blissful' | 'Tired'

export type Checklist = {
  mantra: boolean
  sahasranama: boolean
  astottaranama: boolean
  kavacham: boolean
  panjaram: boolean
  archana: boolean
}

export type JapaEntry = {
  id: string
  date: string
  japa_count: number
  checklist: Checklist
  description?: string
  // Legacy fields are retained only so existing cached rows can be read safely.
  mantra?: string
  malas?: number
  extra_beads: number
  total_count: number
  duration_min?: number
  mood?: Mood
  notes?: string
  created_at: string
  updated_at: string
}

export type Settings = { dailyGoal: number; sound: boolean; theme: 'light' | 'dark' }
