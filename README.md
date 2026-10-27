# AION 2 Daily Tracker

A personal, per-character daily and weekly task tracker for AION 2 (global). Plain HTML, CSS and vanilla JS. No build step, no backend, no accounts. All data lives in your browser's `localStorage`.

Unofficial fan tool, not affiliated with NCSoft. No game artwork is used.

## Run locally

Double-click `index.html`, or serve the folder (recommended):

```bash
python -m http.server 8000
```

Then open http://localhost:8000.

## Deploy to GitHub Pages (free)

1. Create a new GitHub repository and push this folder to it (the files must be at the repo root).
2. In the repo go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**, branch `main`, folder `/ (root)`, and save.
4. After a minute the site is live at `https://<your-user>.github.io/<repo>/`.

Your progress is stored per browser and per site address. Use **Settings → Export JSON** to move it between devices or back it up.

## Reset time: placeholder, and where to find the real one

The default daily reset is **05:00 UTC, which is only a placeholder**. I found no official NCSoft statement of the global reset time. Community guides (metabot.gg, playnews.gg, games.gg and others) report **07:00 UTC = 16:00 server time (UTC+9), with the weekly reset on Wednesday**. metabot.gg itself labels this "community-confirmed, not an official statement".

To confirm it yourself: in game, hover an entry-counter tooltip (it shows "Daily recharge in" / "Weekly recharge in"), compare with the current time, then set the time, timezone and weekday in **Settings**. A button there applies the community value (07:00 UTC, Wednesday). Tick "I confirmed this reset time in-game" to hide the placeholder warning. Also check the official AION 2 site's notices.

## Links, videos and resources

- Every task has a primary **Guide** button plus any number of extra link chips. In **Manage tasks → Edit**, add one per line as `Label | URL` (or just a URL). YouTube links get a ▶ icon.
- The **📚 Resources** button opens a library of databases, maps, timers and guides you can add to or remove from. It is saved and included in exports.
- Only http(s) links are accepted.

## How resets work

Each completion is stored as the date of the reset period in which you ticked it. A task counts as done only while that period is still current, so resets happen exactly at the configured time with no timers, work while the tab is closed, and are DST-safe. Weekly tasks use the configured weekday at the same time of day.

## Editing the seed tasks

- In the app: switch on **Manage tasks** to edit, hide, delete and reorder (↑/↓). **+ Add task** creates your own. **Settings → Reset default tasks** restores the original list (your custom tasks are kept).
- In the code: edit `js/seed.js`. Each task has `id`, `title`, `description`, `location`, `guideUrl`, `category`, `resetType` (`"daily"`/`"weekly"`), `verified`, plus an optional `source` note. Leave a field empty if you cannot confirm it and set `verified: false`; the UI shows an "unverified" badge. Existing users keep their saved tasks, so use **Reset default tasks** (or Erase all data) to pick up seed changes.

## Tests

```bash
node --test tests/logic.test.js
```

Covers reset boundaries (daily and weekly), weekday setting, timezones, a DST change, export/import round-trip, import validation and seed integrity.

For manual reset testing in the browser console: `window.__AION_NOW = Date.parse('2026-10-28T07:00:01Z')` simulates the clock; `delete window.__AION_NOW` restores it.

## Files

```
index.html        page and dialogs
css/style.css     mobile-first styles, dark default, light theme
js/seed.js        default tasks (edit me)
js/time.js        reset-period maths
js/store.js       state shape, validation, import sanitising
js/app.js         UI
tests/            Node tests
```
