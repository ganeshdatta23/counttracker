import type { JapaEntry } from './types';

// The supplied spreadsheet is intentionally part of the application configuration.
export const GOOGLE_SHEET_ID = '1XfHYgfnErpPPK9sMbsaJhEqPayel5sEL5VKeEReHw3E';
export const GOOGLE_SHEET_GID = '0';
// Apps Script deployments are account-specific. Set this once after deploying Code.gs.
const appsScriptEndpoint =
  'https://script.google.com/macros/s/AKfycby_QGi-g9n5oAoGvf7W6UhTdQEB_7vsr0z3PlyN7CmzaXC-2TSlbEMGM0Cv05Copiye/exec';
const token = '';
export const hasRemoteApi = Boolean(appsScriptEndpoint);
const sheetReadEndpoint = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:json&gid=${GOOGLE_SHEET_GID}`;

async function request(body?: Record<string, unknown>) {
  if (!appsScriptEndpoint) return null;
  const url = token
    ? `${appsScriptEndpoint}?token=${encodeURIComponent(token)}`
    : appsScriptEndpoint;
  const response = await fetch(
    url,
    body
      ? {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(body),
        }
      : undefined,
  );
  const result = await response.json();
  if (!response.ok || !result.ok) throw new Error(result.error || 'Sync failed');
  return result;
}

function normalizeDate(value: unknown) {
  const raw = String(value || '');
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw.slice(0, 10);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function normalizeRemoteEntry(entry: Record<string, unknown>): JapaEntry {
  const checklist = entry.checklist as Record<string, boolean> | undefined;
  return {
    ...entry,
    date: normalizeDate(entry.date),
    japa_count: Number(entry.japa_count || 0),
    total_count: Number(entry.japa_count || 0),
    checklist: checklist || {
      mantra: Boolean(entry.mantra_done),
      sahasranama: Boolean(entry.sahasranama_done),
      astottaranama: Boolean(entry.astottaranama_done),
      kavacham: Boolean(entry.kavacham_done),
      panjaram: Boolean(entry.panjaram_done),
      archana: Boolean(entry.archana_done),
    },
  } as JapaEntry;
}

export async function fetchRemoteEntries() {
  const entries = (await request())?.entries as Record<string, unknown>[] | undefined;
  return entries?.map(normalizeRemoteEntry);
}
export async function createRemote(entry: JapaEntry) {
  await request({ action: 'create', entry });
}
export async function updateRemote(entry: JapaEntry) {
  await request({ action: 'update', id: entry.id, entry });
}
export async function deleteRemote(id: string) {
  await request({ action: 'delete', id });
}

/** Reads the supplied sheet directly when it is published for viewing. */
export async function fetchPublishedSheet(): Promise<JapaEntry[]> {
  const response = await fetch(`${sheetReadEndpoint}&_=${Date.now()}`, { cache: 'no-store' });
  const text = await response.text();
  const json = text.replace(/^.*?\(/, '').replace(/\);?\s*$/, '');
  const payload = JSON.parse(json);
  const rows = payload.table.rows || [];
  return rows
    .map((row: { c: Array<{ v?: unknown } | null> }) => {
      const values = row.c.map((cell) => cell?.v ?? '');
      const isChecklistSchema = values.length > 6;
      const count = Number(values[2] || 0);
      const rawDate = String(isChecklistSchema ? values[1] : values[0]);
      const dateParts = rawDate.split('/');
      const date =
        dateParts.length === 3
          ? `${dateParts[2]}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}`
          : rawDate.slice(0, 10);
      return {
        id: String(isChecklistSchema ? values[0] : `${date}-${String(values[1])}-${count}`),
        date,
        japa_count: count,
        checklist: {
          mantra: isChecklistSchema ? Boolean(values[3]) : false,
          sahasranama: isChecklistSchema ? Boolean(values[4]) : false,
          astottaranama: isChecklistSchema ? Boolean(values[5]) : false,
          kavacham: isChecklistSchema ? Boolean(values[6]) : false,
          panjaram: isChecklistSchema ? Boolean(values[7]) : false,
          archana: isChecklistSchema ? Boolean(values[8]) : false,
        },
        description: String(isChecklistSchema ? values[9] : values[1] || 'Entry'),
        total_count: count,
        duration_min: 0,
        notes: '',
        created_at: '',
        updated_at: '',
      } as JapaEntry;
    })
    .filter((entry: JapaEntry) => entry.id && entry.date);
}
