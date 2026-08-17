import type { Checklist, JapaEntry } from './types';

export const checklistLabels: Array<[keyof Checklist, string]> = [
  ['mantra', 'Mantras'],
  ['sahasranama', 'Sahasranamas'],
  ['astottaranama', 'Ashtottaranamas'],
  ['kavacham', 'Kavacham'],
  ['panjaram', 'Panjaram'],
  ['archana', 'Archana'],
];
export const quotes = [
  ['“The name of God is the most powerful medicine.”', 'Swami Sivananda'],
  ['“Be steady in yoga, O Arjuna.”', 'Bhagavad Gita 2.48'],
  ['“Wherever you are, be there fully.”', 'A gentle reminder'],
  ['“The quieter you become, the more you are able to hear.”', 'Ram Dass'],
];

const ago = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
};
const emptyChecklist = (): Checklist => ({
  mantra: false,
  sahasranama: false,
  astottaranama: false,
  kavacham: false,
  panjaram: false,
  archana: false,
});
const make = (days: number, count: number, description = 'Japa'): JapaEntry => ({
  id: `seed-${days}-${count}`,
  date: ago(days),
  japa_count: count,
  checklist: emptyChecklist(),
  description,
  total_count: count,
  duration_min: 0,
  mood: undefined,
  notes: '',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

export const seedEntries: JapaEntry[] = [
  make(6, 3360, 'D1'),
  make(6, 6635, 'D2'),
  make(6, 6040, 'D3'),
  make(6, 7800, 'D4'),
  make(6, 6000, 'D5'),
  make(6, 5472, 'Entry'),
  make(6, 8360, 'D6'),
  make(5, 16000, 'Entry'),
  make(4, 8860, 'Entry'),
  make(3, 4407, 'Entry'),
  make(2, 7150, 'Entry'),
  make(1, 4475, 'Entry'),
  make(0, 9938, 'Entry'),
];
