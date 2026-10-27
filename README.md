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

## Reset time

The global reset is **07:00 UTC every day, and Wednesday 07:00 UTC for weekly counters**. It is confirmed by the app owner, by aion2maps.com (client data) and by other guides; no official NCSoft notice was found. The app defaults to **10:00 in Asia/Riyadh (KSA, UTC+3), which is the same moment**, and shows the UTC equivalent next to the timer.

You can choose any timezone in **Settings**: enter the same moment in it (for example 09:00 in Europe/Paris in winter). If your timezone has daylight saving time, use UTC 07:00 instead, because the reset itself stays at 07:00 UTC while your local hour shifts.

## Tasks, guides, videos and maps

- **Per server vs per character:** each task has a limit scope. Per-server tasks (Duty Missions, Shugo Festival keys, Daily Dungeon, Commands, ...) show a "shared" badge and are ticked once for all your characters.
- **One-time progression** tasks (Strongholds, Monolith, Crafting, Gathering) never reset and have a **How to complete** step list.
- **Guides:** each task has a primary **Guide** button, extra guide links, and **Video guides**. YouTube links are embedded (open the "Video guides" section; swipe or use the arrows to move between videos; they load only when opened). Add them in **Manage tasks → Edit**, one per line as `Label | URL` or just a URL.
- **📚 Resources** is an editable library of databases, maps, timers and guides, saved and included in exports.
- **Map tab:** shows third-party interactive maps (interactivemap.app, QuestLog, aion2t.com) in a frame. aion2maps.com and aion2hub forbid framing, so they open in a new tab. Nothing is copied from those sites.
- Only http(s) links are accepted.

## How resets work

Each completion is stored as the date of the reset period in which you ticked it. A task counts as done only while that period is still current, so resets happen exactly at the configured time with no timers, work while the tab is closed, and are DST-safe. Weekly tasks use the configured weekday at the same time of day.

## Editing the seed tasks

- In the app: switch on **Manage tasks** to edit, hide, delete and reorder (↑/↓). **+ Add task** creates your own. **Settings → Reset default tasks** restores the original list (your custom tasks are kept).
- In the code: edit `js/seed.js`. Each task has `id`, `title`, `description`, `location`, `guideUrl`, `category`, `resetType` (`"daily"`/`"weekly"`), `verified`, `scope` (`"character"`/`"server"`), `resetType` (`"daily"`/`"weekly"`/`"once"`), plus optional `source`, `steps`, `links` and `videos`. Leave a field empty if you cannot confirm it and set `verified: false`; the UI shows an "unverified" badge. Bump `SEED_REV` in `js/seed.js` after editing: on next load the app refreshes default tasks for existing users, adds new ones and removes retired ones (custom tasks, hidden flags and progress are kept; edits to default tasks are replaced).

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
