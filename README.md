# AION 2 Daily Tracker

A personal, per-character daily and weekly task tracker for AION 2 (global). Plain HTML, CSS and vanilla JS. No build step, no backend, no accounts. All data lives in your browser's `localStorage`.

Unofficial fan tool, not affiliated with NCSoft. No game artwork is used.

## Run locally

Double-click `index.html`, or serve the folder (recommended):

```bash
python -m http.server 8000
```

Then open http://localhost:8000.

## Progress

Your progress is stored per browser and per site address. Use **Settings → Export JSON** to move it between devices or back it up.

## Reset time

The global reset is **07:00 UTC every day, and Wednesday 07:00 UTC for weekly counters**. The app defaults is also UTC.

You can choose any timezone in **Settings**: enter the same moment in it (for example 09:00 in Europe/Paris in winter). If your timezone has daylight saving time, use UTC 07:00 instead, because the reset itself stays at 07:00 UTC while your local hour shifts.

## Tasks, guides, videos and maps

- **Per server vs per character:** each task has a limit scope. Per-server tasks (Duty Missions, Shugo Festival keys, Daily Dungeon, Commands, ...) show a "shared" badge and are ticked once for all your characters.
- **One-time progression** tasks (Strongholds, Monolith, Crafting, Gathering) never reset and have a **How to complete** step list.
- **Guides:** each task has a primary **Guide** button, extra guide links, and **Video guides**. YouTube links are embedded (open the "Video guides" section; swipe or use the arrows to move between videos; they load only when opened). Add them in **Manage tasks → Edit**, one per line as `Label | URL` or just a URL.
- **📚 Resources** is an editable library of databases, maps, timers and guides, saved and included in exports.
- **Map tab:** shows third-party interactive maps in a frame (interactivemap.app, QuestLog, aion2t.com); aion2maps.com and aion2hub forbid framing, so they open in a new tab. Nothing is copied from those sites. **Find on map** searches a built-in index of interactivemap.app layers (for example "gems" gives Diamond, Sapphire and Ruby Gemstone) and loads the matching layer; switch between the Verteron (Elyos) and Altgard (Asmodian) maps. Some layers exist on one map only, and the app says so. Tasks with a map location (Strongholds, Monolith, Crafting, Gathering, Substance Morph, dungeons) have a **Map** button that opens the right layer; set it for any task under Manage tasks → Edit → Map layer.
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
js/maps.js        interactive-map layer index and search
js/app.js         UI
tests/            Node tests
```

## Disclaimer

- This is an unofficial, non-commercial fan project. It is **not affiliated with, endorsed by or related to NCSoft or any website** mentioned here (including metabot.gg, aion2maps.com, interactivemap.app, QuestLog, aion2hub, aion2t.com, Gamers4Life, games.gg, MeinMMO, KeenGamer, YouTube and their creators). All names and trademarks belong to their owners.
- Task information was gathered from public community guides and may be wrong or out of date. Each source is credited in `SOURCES.md`, and links point to the original sites.
- **If you own a site or video that is linked here and want it removed, message me** ([github.com/alioh](https://github.com/alioh) or open an issue on this repository) and I will take it down.

## Purpose and contributing

I built this for myself, as a casual player, to keep track of my daily and weekly tasks across my characters. It is not meant to be a complete or authoritative guide.

**Anyone can contribute.** Fixes to task data, new verified tasks, better guides and code improvements are welcome: open an issue or a pull request. If you change `js/seed.js`, keep `verified: false` for anything you cannot confirm, credit your source, bump `SEED_REV`, and run the tests.

## AI Disclosure

This application was built using AI assistance. 
While the logic and scaffolding were generated by AI, the architecture, prompt engineering, and final reviews were guided by a human.
