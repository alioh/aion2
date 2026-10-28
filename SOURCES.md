# Research summary (updated 2026-10-27)

## Sources used
- aion2maps.com guides (updated Oct 23-26 2026; cites client data, NC statements and streams): daily-and-weekly, whats-bound, dungeons-and-raids, expeditions-and-odyle, abyss, crafting, unlocks, what-to-do-at-45. https://aion2maps.com/guides/all/
- metabot.gg checklist and weekly-reset page; mein-mmo.de checklist; keengamer.com checklist, crafting and leveling guides; allthings.how Monolith map; aion2hub.com patch note 2026-09-02.
- Owner confirmation (in game): reset 07:00 UTC; Duty Missions per server; 3 Shugo Festival keys per day at reset.
- gamers4.life, aion2hub.com, interactivemap.app, aion2t.com: databases/maps/timers, used for links and to confirm that Monoliths, Strongholds and crafting exist. They state no reset times or routines.
- questlog.gg and aion2.app could not be read; they are only linked.
- No official NCSoft notice for the reset time was found.

## Reset time
07:00 UTC daily, Wednesday 07:00 UTC weekly (owner, aion2maps.com, metabot.gg, playnews.gg and others). KSA (UTC+3) = 10:00.

## Verified (2+ sources, or owner-confirmed)
Duty Missions (per server), Nightmare, Odyle Energy, Shugo Festival keys (3/day), Dimensional Invasion key, Daily Dungeon (per server), Ascension Trial, Exploration, Ludra, Transcendence, Abyss time (7 h; membership bonus disputed), Commands, Substance Morph, Strongholds, Monolith, Crafting, Gathering.

## Unverified (badge shown)
- Growth dungeons: metabot.gg only; aion2maps does not mention them.
- Daeva Pass weekly EXP limit: metabot.gg only (per-character purchase and season dates are from aion2maps).

## Removed after the second pass
- Subjugation, Corroded Decontamination Facility, Chalice of Muspel: listed by metabot.gg, but aion2maps.com says Global launched with one raid (Ludra) and no Subjugation at launch.
- Shugo Festival count disagreement is resolved at 3/day.

## Notes
- Ludra was removed at the 5 October launch and returns on 4 November (NC written, per aion2maps), so it is unavailable until then.
- Monolith level sync across characters is an Asian-release rule per aion2maps; the task is marked per server on that basis.
- Videos: YouTube ids were taken from the source lists on aion2maps.com and matched to their titles; they were not watched. Some are non-English (marked in the title).
- Monolith and Stronghold have no daily/weekly routine, so they are one-time progression tasks. The Rift of Time and Space Stronghold contest (level 50, item level 4,500, weekly event key, Korean patch note) is an event, not tracked.
- Locations: Daeva Pass has none confirmed.

## Third pass
- Growth dungeons: confirmed by the owner and metabot.gg's dungeon guide (level 45, 7 hours each per week, only while inside). aion2.gg returned 403, so it is linked, not read.
- Daeva Pass: per-character, free and premium tracks, Shop Coins (owner, aion2maps). The weekly EXP limit (50,000) is still metabot.gg only and is flagged in the task text.
- Map layers: every layer in js/maps.js was probed on interactivemap.app and kept only if its page title listed a marker count. There is no Monolith layer slug (only Empyrean Traces), no Empyrean/Dungeon layer on Altgard, and no Lower Reshanta map, so those fall back to the base map.

## Fourth pass (28 Oct 2026): RaidRelay and AION 2 Helper

- **RaidRelay** (raidrelay.com/aion-2-guides, checklist and guide pages). It is a boosting-service site, so everything taken only from it is marked unverified. New tasks: Hidden Cube keys, Emergency and Weekly Supply Requests, Abyss Commands (Latesran Root, split from Region Commands), Arena and Battlefield goals, Season Missions, Wind Breeze Odyle and Soul Crystals (members), Abyss Trade Shop limits, Halloween event (ends 3 Nov), Fire Temple weapon route. Existing Duty Missions, Shugo Festival, Commands, Transcendence and Substance Morph cards gained its details and guide links.
- **AION 2 Helper** (aion2helper.com, checked 28 Oct, plus the linked NCSOFT patch notes of 27/28 Oct). New: Attendance and mail rewards (Atreia's Call to 2 Dec, daily Odyle mail to 11 Nov), Subjugation tickets (conflicts with the earlier finding that it was not on Global; marked unverified), Nightmare Trade Shop and Shugo shop weekly stock, Twitch Drops (claim by 30 Oct). Updated: Odylium Repository daily dungeon, Hard Expedition levels, Prelude to Flight pass (weekly EXP 15,000), Wind Breeze limits after the transfer period.
- **Server status:** aion2helper.com/status lists every Global server (106) by region. Its API replies only to its own pages ("This API is only for aion2helper.com pages"), so the tracker does not call it. The server list in the settings (`js/servers.js`) is copied from that page; the tracker links to the status page instead of showing live status.
- **Other status pages checked (28 Oct):** QuestLog (`questlog.gg/aion-2/en/server-status`) has a public JSON feed but sends no CORS header, so a page on another site cannot read it. Gaming Tools (`aion2.gaming.tools/server-status`) is behind a Cloudflare bot check and has no open data feed. The settings offer all three as links ("Server status page").
