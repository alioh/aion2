# AION 2 Daily Tracker

A personal, per-character daily and weekly task tracker for AION 2 (Global). Plain HTML, CSS and vanilla JS. No build step, no backend, no accounts. All data lives in your browser's `localStorage`.

Unofficial fan tool, not affiliated with NCSoft. No game artwork is used. Live site: https://alioh.com/aion2/ (see also the in-app **About** page).

## Run locally

Double-click `index.html`, or serve the folder (recommended):

```bash
python -m http.server 8000
```

Then open http://localhost:8000.

## Progress

Your progress is stored per browser and per site address. Use **Settings → Export JSON** to move it between devices or back it up.

## Reset time and server time

- The global reset is **07:00 UTC every day, and Wednesday 07:00 UTC for weekly counters**, the same moment on every Global server. It is fixed: the reset time fields in Settings stay locked behind a button.
- **Display timezone** (Settings) only changes how times are shown (for example the reset reads 10:00 in Saudi Arabia). It never moves the reset.
- **My server region / My server** (Settings) picks your region (Europe, North America East or West, Latin America, Asia) and server. The region sets the server clock in the top bar and the clock the **event timeline** follows (Spacetime Rift, Shugo Festival, Dimensional Invasion, Battlefield, Watcher Kaira). Event times come from [shugo.gg/timers](https://shugo.gg/timers), not from an official NCSoft schedule.
- Live server status cannot be loaded into this page (the status sites do not allow it), so the top bar has a **status ↗** link. Pick which status page it opens under Settings → Server status page.

## Tasks, guides, videos and maps

- **Per server vs per character:** each task has a limit scope. Per-server tasks (Duty Missions, Shugo Festival keys, Daily Dungeon, Region Commands, ...) show a "shared" badge and are ticked once for all your characters.
- **PvE / PvP:** every task has a PvE, PvP or PvE + PvP badge, and a filter in the toolbar.
- **One-time progression** tasks (Strongholds, Monolith, Crafting, Gathering, Fire Temple, ...) never reset and have a **How to complete** step list.
- **Event timeline:** the card at the top shows the next 12, 24 or 48 hours of recurring events on your server clock. Click an event for its schedule and next times, hover a block for its start and end, and untick **Show countdown** to hide the time left. On phones it scrolls sideways.
- **Arranging tasks:** drag a task by its ⋮⋮ grip (or focus it and use the up/down arrow keys) to reorder it inside its group. Manage mode also has ↑/↓ buttons.
- **Icons:** put your own image in `icons/` named after the task id (see `icons/README.md`) and it shows next to the task title. Only add images you have the right to use; the repository is public.
- **Guides:** each task has a primary **Guide** button, extra guide links, and **Video guides**. YouTube links are embedded (open the "Video guides" section; swipe or use the arrows to move between videos; they load only when opened). Add them in **Manage tasks → Edit**, one per line as `Label | URL` or just a URL.
- **📚 Resources** is an editable library of databases, maps, timers and guides, saved and included in exports.
- **Map tab:** shows third-party interactive maps in a frame (interactivemap.app, QuestLog, aion2t.com); aion2maps.com and aion2hub forbid framing, so they open in a new tab. Nothing is copied from those sites. **Find on map** searches a built-in index of interactivemap.app layers (for example "gems" gives Diamond, Sapphire and Ruby Gemstone) and loads the matching layer; switch between the Verteron (Elyos) and Altgard (Asmodian) maps. Some layers exist on one map only, and the app says so. Tasks with a map location have a **Map** button that opens the right layer; set it for any task under Manage tasks → Edit → Map layer.
- Only http(s) links are accepted.

## How resets work

Each completion is stored as the date of the reset period in which you ticked it. A task counts as done only while that period is still current, so resets happen exactly at 07:00 UTC with no timers, work while the tab is closed, and are not affected by daylight saving. Weekly tasks use Wednesday at the same time.

## Editing the seed tasks

- In the app: switch on **Manage tasks** to edit, hide, delete and reorder. **+ Add task** creates your own. **Settings → Reset default tasks** restores the original list (your custom tasks are kept).
- In the code: edit `js/seed.js`. Each task has `id`, `title`, `description`, `location`, `guideUrl`, `category`, `resetType` (`"daily"`/`"weekly"`/`"once"`), `scope` (`"character"`/`"server"`), `verified`, and optionally `mode` (`"pve"` default, `"pvp"` or `"both"`), `mapLayer`, `source`, `steps`, `links` and `videos`. Leave a field empty if you cannot confirm it and set `verified: false` (a note for maintainers; the page shows no badge for it). Bump `SEED_REV` in `js/seed.js` after editing: on next load the app refreshes default tasks for existing users, adds new ones and removes retired ones (custom tasks, hidden flags and progress are kept; edits to default tasks are replaced).
- The server list in the settings is `js/servers.js`; the event schedule is at the top of `js/timeline.js`.

## Tests

```bash
node --test tests/logic.test.js
```

Covers reset boundaries (daily and weekly), weekday setting, timezones, a DST change, export/import round-trip, import validation, seed integrity, server lists and the PvE/PvP field.

For manual reset testing in the browser console: `window.__AION_NOW = Date.parse('2026-10-28T07:00:01Z')` simulates the clock; `delete window.__AION_NOW` restores it.

## Files

```
index.html        tracker page and dialogs
about.html        about page (what it is, what it stores, disclaimers)
css/style.css     mobile-first styles, dark default, light theme
css/timeline.css  event timeline styles
js/seed.js        default tasks and resources (edit me)
js/servers.js     Global server list by region, status page links
js/time.js        reset-period maths
js/store.js       state shape, validation, import sanitising
js/maps.js        interactive-map layer index, search and own task icons
js/timeline.js    event timeline
js/app.js         UI
icons/            your own task icons (see icons/README.md)
tests/            Node tests
SOURCES.md        where the task information came from
```

## Disclaimer

- This is an unofficial, non-commercial fan project. It is **not affiliated with, endorsed by or related to NCSoft or any website** mentioned here (including metabot.gg, aion2maps.com, interactivemap.app, QuestLog, aion2hub, aion2t.com, Gamers4Life, games.gg, MeinMMO, KeenGamer, RaidRelay, AION 2 Helper, shugo.gg, Gaming Tools, YouTube and their creators). All names and trademarks belong to their owners.
- Task information was gathered from public community guides and may be wrong or out of date. Each source is credited in `SOURCES.md`, and links point to the original sites.
- **If you own a site or video that is linked here and want it removed, message me** ([github.com/alioh](https://github.com/alioh) or open an issue on this repository) and I will take it down.

## Purpose and contributing

I built this for myself, as a casual player, to keep track of my daily and weekly tasks across my characters. It is not meant to be a complete or authoritative guide.

**Anyone can contribute.** Fixes to task data, new tasks, better guides and code improvements are welcome: open an issue or a pull request. If you change `js/seed.js`, keep `verified: false` for anything you cannot confirm, credit your source, bump `SEED_REV`, and run the tests.

## AI Disclosure

This application was built using AI assistance.
While the logic and scaffolding were generated by AI, the architecture, prompt engineering, and final reviews were guided by a human.
