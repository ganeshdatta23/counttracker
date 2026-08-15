# Japa Sadhana Tracker

A calm, mobile-first japa practice tracker backed by the supplied Google Sheet. Local storage is only a temporary offline cache; the deployed Apps Script endpoint is the source of truth.

## Run locally

```bash
npm install
npm run dev
```

The production build is `npm run build` and can be deployed to Vercel, Netlify, or any static host.

## Google Sheets setup

1. Open the supplied spreadsheet: `https://docs.google.com/spreadsheets/d/1XfHYgfnErpPPK9sMbsaJhEqPayel5sEL5VKeEReHw3E/edit`
2. The supplied file currently has a `Sheet1` tab. Keep that name, or rename it to `JapaLog` and update `SHEET_NAME` in `apps-script/Code.gs`.
3. Put this header row in row 1:

   `id | date | japa_count | mantra_done | sahasranama_done | astottaranama_done | kavacham_done | panjaram_done | archana_done | description | created_at | updated_at`

4. Open **Extensions > Apps Script** and paste `apps-script/Code.gs` into the editor.
5. If desired, set the `TOKEN` constant in that file. Do not put sensitive service-account credentials in frontend code.
6. Deploy with **Deploy > New deployment > Web app**.
7. Select **Execute as me** and choose an access level appropriate for your single-user app. Copy the web app URL.
8. Paste the deployed URL into `appsScriptEndpoint` in `src/api.ts`. This project keeps the supplied spreadsheet ID hardcoded, so no frontend `.env` file is required.

The Apps Script endpoint supports `GET` reads and `POST` actions for create, update, and delete. This is the reliable REST shape available to Apps Script web apps:

```json
{ "action": "create", "entry": { "date": "2026-08-15", "japa_count": 9938, "description": "Entry", "checklist": { "mantra": false, "sahasranama": false, "astottaranama": false, "kavacham": false, "panjaram": false, "archana": false } } }
```

The UI is local-first: it renders immediately from its offline cache, then reads the supplied Google Sheet's published `Sheet1` tab directly. Full create/edit/delete sync becomes active after the Apps Script deployment URL is pasted into `src/api.ts`. If the network is unavailable, the app remains usable and visibly reports `Offline`.

## Product behavior

- Entries validate nonnegative raw japa counts and always recompute total count.
- The live practice screen increments one raw japa count at a time.
- History supports search, edit, and delete confirmation.
- Theme preference, goal, entries, and seed replacement persist locally.
- Dashboard charts, streaks, monthly totals, quotes, and recent offerings derive from the same entry collection.

## Deployment

For Vercel, import the repository, use the default Vite settings, and add `VITE_JAPA_API_URL` and `VITE_JAPA_API_TOKEN` under project environment variables. Netlify uses `npm run build` and `dist` as the publish directory.
