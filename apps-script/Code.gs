/**
 * Japa Sadhana Tracker backend.
 * Deploy this script as a Web app, executing as the spreadsheet owner.
 * Writes use POST actions because Apps Script web apps expose doGet/doPost.
 */
// The supplied spreadsheet currently contains a tab named "Sheet1".
// Rename it to "JapaLog" if preferred, or change this value before deploying.
const SHEET_NAME = 'Sheet1';
const HEADERS = ['id', 'date', 'japa_count', 'mantra_done', 'sahasranama_done', 'astottaranama_done', 'kavacham_done', 'panjaram_done', 'archana_done', 'description', 'created_at', 'updated_at'];
const TOKEN = ''; // Optional: set a shared token and send it as `token` in every request.

function sheet_() {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('Missing sheet tab: ' + SHEET_NAME);
  if (sheet.getLastRow() === 0) sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  const firstRow = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  if (firstRow.every(value => value === '')) sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  return sheet;
}

function json_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}

function authorized_(request) {
  return !TOKEN || (request && request.parameter && request.parameter.token === TOKEN);
}

function doGet(request) {
  try {
    if (!authorized_(request)) return json_({ ok: false, error: 'Unauthorized' });
    const values = sheet_().getDataRange().getValues();
    const rows = values.slice(1).filter(row => row[0]).map(row_);
    const params = request.parameter || {};
    const filtered = rows.filter(item => (!params.from || item.date >= params.from) && (!params.to || item.date <= params.to) && (!params.mantra || item.mantra === params.mantra));
    return json_({ ok: true, entries: filtered });
  } catch (error) { return json_({ ok: false, error: error.message }); }
}

function doPost(request) {
  try {
    if (!authorized_(request)) return json_({ ok: false, error: 'Unauthorized' });
    const body = JSON.parse(request.postData.contents || '{}');
    const action = body.action;
    if (action === 'create') return json_({ ok: true, entry: create_(body.entry || {}) });
    if (action === 'update') return json_({ ok: true, entry: update_(body.id, body.entry || {}) });
    if (action === 'delete') { delete_(body.id); return json_({ ok: true }); }
    throw new Error('Unknown action');
  } catch (error) { return json_({ ok: false, error: error.message }); }
}

function validate_(entry) {
  const count = Number(entry.japa_count || 0);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.date || '')) throw new Error('Date must be YYYY-MM-DD');
  if (!Number.isFinite(count) || count < 0 || !Number.isInteger(count)) throw new Error('Japa count must be a nonnegative integer');
  return { ...entry, japa_count: count };
}

function create_(input) {
  const entry = validate_(input); const now = new Date().toISOString();
  const result = { id: Utilities.getUuid(), date: entry.date, japa_count: entry.japa_count, mantra_done: Boolean(entry.checklist?.mantra), sahasranama_done: Boolean(entry.checklist?.sahasranama), astottaranama_done: Boolean(entry.checklist?.astottaranama), kavacham_done: Boolean(entry.checklist?.kavacham), panjaram_done: Boolean(entry.checklist?.panjaram), archana_done: Boolean(entry.checklist?.archana), description: String(entry.description || 'Entry'), created_at: now, updated_at: now };
  sheet_().appendRow(HEADERS.map(header => result[header])); return result;
}

function findRow_(id) { const values = sheet_().getRange(2, 1, Math.max(sheet_().getLastRow() - 1, 1), 1).getValues(); for (let i = 0; i < values.length; i++) if (String(values[i][0]) === String(id)) return i + 2; throw new Error('Entry not found'); }
function update_(id, input) { const row = findRow_(id); const old = row_(sheet_().getRange(row, 1, 1, HEADERS.length).getValues()[0]); const checked = validate_({ ...old, ...input }); const result = { id: old.id, date: checked.date, japa_count: checked.japa_count, mantra_done: Boolean(checked.checklist?.mantra), sahasranama_done: Boolean(checked.checklist?.sahasranama), astottaranama_done: Boolean(checked.checklist?.astottaranama), kavacham_done: Boolean(checked.checklist?.kavacham), panjaram_done: Boolean(checked.checklist?.panjaram), archana_done: Boolean(checked.checklist?.archana), description: String(checked.description || 'Entry'), created_at: old.created_at, updated_at: new Date().toISOString() }; sheet_().getRange(row, 1, 1, HEADERS.length).setValues([HEADERS.map(header => result[header])]); return result; }
function delete_(id) { sheet_().deleteRow(findRow_(id)); }
function row_(row) { return { id: String(row[0]), date: String(row[1]), japa_count: Number(row[2] || 0), checklist: { mantra: Boolean(row[3]), sahasranama: Boolean(row[4]), astottaranama: Boolean(row[5]), kavacham: Boolean(row[6]), panjaram: Boolean(row[7]), archana: Boolean(row[8]) }, description: String(row[9] || 'Entry'), created_at: row[10], updated_at: row[11] }; }
