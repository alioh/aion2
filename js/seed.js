/* Default task list. Edit this file to change the defaults (see README), then bump SEED_REV so
 * existing users get the refreshed defaults on next load.
 *
 * verified = true  -> essentials confirmed by 2+ independent sources (or by the user in game).
 * verified = false -> single source, or sources disagree (see `source`). Shown with an "unverified" badge.
 * An empty field means it could not be confirmed. Nothing here is invented.
 * scope: "character" (own limit per character) or "server" (shared by every character on the server).
 * resetType: "daily" | "weekly" | "once" (one-time/ongoing progression, never resets).
 * Sources: A = aion2maps.com guides (updated Oct 23-26 2026), M = metabot.gg checklist, MM = mein-mmo.de,
 *          K = keengamer.com, U = confirmed by the app owner. Video ids come from the source lists on aion2maps.com. */
(function (root) {
  const M = 'https://metabot.gg/en/aion-2/';
  const MM = 'https://mein-mmo.de/en/aion-2-daily-weekly-checklist-perfect-start,1589979/';
  const A = 'https://aion2maps.com/guides/';
  const H = 'https://aion2hub.com/database/';
  const yt = (id, label) => ({ label, url: 'https://www.youtube.com/watch?v=' + id });

  const SEED_REV = 5;

  const SEED_TASKS = [
    // ---- Daily ----
    { id: 'duty-missions', title: 'Duty Missions', category: 'Duties', resetType: 'daily', scope: 'server', verified: true,
      description: 'Complete up to 5 Duty Missions (Wanted bounties) per day, from level 45. The limit is per server: all your characters share it, so do them on your main. Each quest offers 5 random rewards; refreshing costs Kina (1,000 first). Each pays 50,000 bound Kinah and 1,000 Abyss Points.',
      location: 'Journal / map: Duty tab', guideUrl: A + 'daily-and-weekly/', source: 'A, M, MM, U (per server confirmed by owner)',
      links: [
        { label: 'games.gg Duty Missions guide', url: 'https://games.gg/aion-2/guides/aion-2-duty-missions-guide/' },
        { label: 'MeinMMO checklist', url: MM },
      ],
      videos: [yt('cQzf-1a0sX0', 'Aragon: Stop picking the wrong duty quest rewards')] },
    { id: 'nightmare', title: 'Nightmare boss challenge', category: 'Dungeons', resetType: 'daily', scope: 'character', verified: true,
      description: 'Use your 2 daily Nightmare entries (banked up to 14) on the lowest boss you have not cleared, from level 45. Attempts are only spent on a clear. Rewards Phantasmal Fragments (Daevanion Crystals, Stigma Shards, Pantheon statues).',
      location: 'Nightmare boss ladder (starts at Gatekeeper Pinopi, tier 1)', guideUrl: A + 'nightmare/', source: 'A, M, MM',
      links: [{ label: 'aion2hub Nightmare database', url: H + 'nightmare' }, { label: 'metabot.gg bosses', url: M + 'bosses' }],
      videos: [yt('DOkdiksIxB4', 'BoredAF: Complete Nightmare Boss Guide, Season 1')] },
    { id: 'odyle-energy', mapLayer: 'dungeon', title: 'Spend Odyle Energy', category: 'Dungeons', resetType: 'daily', scope: 'character', verified: true,
      description: 'Odyle Energy refills 15 every 3 hours (120/day) per character and stops at the cap (560, or 840 with membership), so spend it. Energy pays for the reward cube, not entry: 40 per claim (20 in Krao Cave/Urugugu Canyon Exploration, 30 in Fire Temple Exploration).',
      location: 'Expedition / Conquest dungeons, e.g. Draupnir or Ferocious Horn Den', guideUrl: A + 'expeditions-and-odyle/', source: 'A, M, MM',
      links: [{ label: 'aion2hub: Draupnir', url: H + 'instance/draupnir' }, { label: 'aion2hub: Ferocious Horn Den', url: H + 'instance/ferocious-horn-den' }],
      videos: [yt('yShlY0zlQNc', 'Madsin: Draupnir Cave guide'), yt('FcMN6hw65sU', 'MistaWigglez: AION 2 Odyle Energy Explained')] },
    { id: 'shugo-festival', title: 'Shugo Festival reward keys', category: 'Events', resetType: 'daily', scope: 'server', verified: true,
      description: 'You get 3 Shugo Festival Reward Keys every day at the daily reset (07:00 UTC). They stop at 12 (21 with membership), so spend them before they cap. Shared across your characters on the server.',
      location: 'Shugo Festival', guideUrl: A + 'daily-and-weekly/', source: 'U (3 keys/day at reset), A, M; MM said 2/day',
      links: [{ label: 'metabot.gg events', url: M + 'events' }], videos: [yt('2Xw7aF3SlgQ', 'MistaWigglez: AION 2 Jump Jump Guide, Shugo Festival tips'), yt('AYFt7XcbQTs', 'MistaWigglez: AION 2 Shugo Festival guide')] },
    { id: 'invasion-key', title: 'Dimensional Invasion reward key', category: 'Events', resetType: 'daily', scope: 'server', verified: true,
      description: 'You get 1 Dimensional Invasion reward key per day (stores up to 7), shared across your characters. An invasion can start at :30 of some hours: press Enter on the button beside the minimap within its 3-minute countdown to join the 6-player map.',
      location: 'Dimensional Invasion (random event)', guideUrl: A + 'daily-and-weekly/', source: 'A, M, MM', links: [], videos: [] },

    // ---- Weekly ----
    { id: 'daily-dungeon', title: 'Daily Dungeon (Unknown Fissure)', category: 'Dungeons', resetType: 'weekly', scope: 'server', verified: true,
      description: 'Enter Daeva Bio-Research Base: 14 runs per week (about 2 a day), shared across your characters on the server. It pays Enhance Stones; the top reward tier needs a score of 10,000.',
      location: 'Unknown Fissure: Daeva Bio-Research Base', guideUrl: M + 'dungeons/daeva-bio-research-base', source: 'A, M, MM, K',
      links: [{ label: 'MeinMMO checklist', url: MM }], videos: [yt('yptf3C8792k', 'MistaWigglez: AION 2 Daily Dungeons Guide')] },
    { id: 'ascension-trial', title: 'Ascension Trial', category: 'Dungeons', resetType: 'weekly', scope: 'character', verified: true,
      description: 'Solo entries, 3 per week per character, from item level 1,000. Difficulties open at item level 1,000 / 1,500 / 2,000 / 2,500; entering on the last day before the reset puts you in the highest difficulty your item level reached that week.',
      location: 'Nightmare Altar and its sister dungeons', guideUrl: M + 'dungeons/nightmare-altar', source: 'A, M, MM',
      links: [{ label: 'MeinMMO checklist', url: MM }], videos: [] },
    { id: 'exploration', mapLayer: 'dungeon', title: 'Exploration (Expedition dungeons)', category: 'Dungeons', resetType: 'weekly', scope: 'character', verified: true,
      description: 'Run Expedition dungeons in Exploration mode for reward counts: 7 per dungeon per week, no carry-over. Krao Cave and Urugugu Canyon claims cost 20 Odyle Energy each.',
      location: 'Expedition dungeons, e.g. Krao Cave, Urugugu Canyon', guideUrl: M + 'dungeons/krao-cave', source: 'M, K',
      links: [{ label: 'aion2hub: Krao Cave', url: H + 'instance/krao-cave' }, { label: 'aion2hub: Urugugu Canyon', url: H + 'instance/urugugu-canyon' }], videos: [] },
    { id: 'raid-ludra', title: 'Raid: Ludra', category: 'Dungeons', resetType: 'weekly', scope: 'character', verified: true,
      description: 'Global\'s only raid at launch (10 players). 1 rewarded kill per week at 40 Odyle Energy, Normal from item level 2,800. It was removed at launch and returns on 4 November (NC announcement), so it is not available before then.',
      location: 'Abyssal Forge: Ludra (Sanctuary)', guideUrl: A + 'ludra/', source: 'A, M',
      links: [{ label: 'aion2hub: Abyssal Forge: Ludra', url: H + 'instance/abyssal-forge-ludra' }],
      videos: [yt('b7TwvT6mgS4', 'Madsin: Sanctuary Eternal Ludra guide')] },
    { id: 'transcendence', title: 'Transcendence dungeons', category: 'Dungeons', resetType: 'weekly', scope: 'character', verified: true,
      description: 'Run Deus Research Base or Shattered Arkanis from item level 1,600 (2 to 5 players). Claims cost 40 Odyle Energy. Leaving without claiming the cube uses one of your 10 unclaimed runs per week (shared per server).',
      location: 'Deus Research Base, Shattered Arkanis', guideUrl: A + 'transcendence/', source: 'A, M',
      links: [{ label: 'metabot.gg: Deus Research Base', url: M + 'dungeons/deus-research-base' }, { label: 'metabot.gg: Shattered Arkanis', url: M + 'dungeons/shattered-arkanis' }],
      videos: [yt('VIJGZG8XrNc', 'selegames: Transcendence guide, Deus Research Base and Shattered Arkanis (Japanese)')] },
    { id: 'abyss-time', title: 'Abyss time', category: 'Abyss', resetType: 'weekly', scope: 'character', verified: true,
      description: 'Weekly time allowance in the Abyss: 7 hours, resetting Wednesday with no carry-over. Global opens with Lower Reshanta only. One source says members get 14 hours; another says membership gives no extra Abyss time, so check in game.',
      location: 'Lower Reshanta (Abyss)', guideUrl: A + 'abyss/', source: 'A, M (membership bonus disputed)',
      links: [{ label: 'metabot.gg: Chaotic Lower Reshanta', url: M + 'map/chaotic-lower-reshanta' }], videos: [] },
    { id: 'growth-dungeons', title: 'Growth dungeons', category: 'Dungeons', resetType: 'weekly', scope: 'character', verified: true,
      description: 'Timed zones rather than runs: Silent Graveyard and Fafnite Amphitheater both need level 45 and give 7 hours of usage time each per week (reset Wednesday), deducted only while you are inside. Loot includes a Soul Crystal, Enhance Stones and the Shulak Loot Bundle, so they suit alts and crafters more than mains.',
      location: 'Silent Graveyard, Fafnite Amphitheater', guideUrl: M + 'guides/dungeon-guide', source: 'U, M dungeon guide, aion2.gg database',
      links: [{ label: 'aion2.gg: Growth dungeons database', url: 'https://aion2.gg/database/dungeons?type=Growth' }, { label: 'metabot.gg: Silent Graveyard', url: M + 'dungeons/silent-graveyard' }, { label: 'metabot.gg: Fafnite Amphitheater', url: M + 'dungeons/fafnite-amphitheater' }], videos: [] },
    { id: 'daeva-pass', title: 'Daeva Pass weekly EXP', category: 'Events', resetType: 'weekly', scope: 'character', verified: true,
      description: 'The Daeva Pass is a seasonal battle pass with a free and a premium track, tracked per character (not account-wide). Levelling it pays currency, gear-enhancement materials and Daeva Pass Shop Coins (spend them before the season ends). Season 1 runs 30 Sep to 16 Dec 2026. metabot.gg lists a weekly pass EXP limit of 50,000; confirm the exact figure in game.',
      location: '', guideUrl: A + 'whats-bound/', source: 'U, A (per character, season dates), M (weekly EXP limit, single source)',
      links: [{ label: 'metabot.gg: Daeva Pass', url: M + 'daeva-pass' }, { label: 'aion2maps: Membership and the shop', url: A + 'membership-and-shop/' }], videos: [yt('R0gWF-F-aq8', 'MistaWigglez: Is AION 2 Membership and Pass worth it?')] },
    { id: 'commands', title: 'Commands (weekly quests)', category: 'Quests', resetType: 'weekly', scope: 'server', verified: true,
      description: 'Buy and complete weekly Commands: up to 12 from the Command Merchant in your capital (15,000 Kina each) and up to 20 from the Lower Abyss. The limits are per server, shared by your characters.',
      location: 'Command Merchant in your capital; Lower Abyss', guideUrl: A + 'daily-and-weekly/', source: 'A, MM', links: [{ label: 'MeinMMO checklist', url: MM }], videos: [] },
    { id: 'substance-morph', mapLayer: 'odyle', title: 'Substance Morph (Odyle Energy)', category: 'Crafting', resetType: 'weekly', scope: 'character', verified: true,
      description: 'Craft Odyle Energy: two recipes, 40 energy each, from gathered Odyle and 50,000 Kina. Limit 4 per character plus 16 per server each week (up to 20 on your main). Unlocks at level 10.',
      location: 'Crafting menu', guideUrl: A + 'daily-and-weekly/', source: 'A, MM', links: [{ label: 'MeinMMO checklist', url: MM }], videos: [yt('FcMN6hw65sU', 'MistaWigglez: AION 2 Odyle Energy Explained')] },

    // ---- One-time / ongoing progression (never reset) ----
    { id: 'strongholds', mapLayer: 'stronghold', title: 'Clear your region\'s Strongholds', category: 'Progression', resetType: 'once', scope: 'character', verified: true,
      description: 'Each region (Verteron for Elyos, Altgard for Asmodians) has 15 Strongholds. Clearing them pays Noble Belt Enhance Scrolls for your belt. On Global, the other faction\'s Strongholds pay no belt scrolls.',
      location: 'Verteron (Elyos) / Altgard (Asmodian) open world', guideUrl: A + 'what-to-do-at-45/', source: 'A, K',
      steps: [
        'Open the 3D map or the in-game Navigator (it starts pointing you at Strongholds from about level 12-13).',
        'Find the 15 Strongholds in your own faction\'s region and group nearby ones into one route.',
        'Clear every Stronghold on that route.',
        'Use the Noble Belt Enhance Scroll rewards on your progression belt.',
        'Skip the other faction\'s Strongholds: on Global they give no belt scrolls.',
      ],
      links: [
        { label: 'Interactive map: Verteron strongholds', url: 'https://interactivemap.app/aion2/maps/verteron/stronghold' },
        { label: 'KeenGamer leveling guide', url: 'https://www.keengamer.com/articles/guides/aion-2-leveling-progression-guide-level-1-to-endgame/' },
      ],
      videos: [yt('zaTPBotP5ZI', 'Aragon: Ultimate progression guide, 12 steps to the endgame raid'), yt('u5PM7x0KzZk', 'jenny plays games: What to do at level 45'), yt('1zcLpHN84q0', 'MistaWigglez: AION 2 Strongholds Explained')] },
    { id: 'monolith', mapLayer: 'empyrean-trace', title: 'Monolith: Empyrean Traces', category: 'Progression', resetType: 'once', scope: 'server', verified: true,
      description: 'Collect Empyrean Traces and turn them in at your region\'s Monolith. Each Monolith level gives an amulet enhance scroll (30 in all): 80 Traces reach level 10, 255 reach level 20, 560 reach level 30. Do it on one character; levels sync across your characters on the server.',
      location: 'Monoliths near the Dawn Legion Base / Zumion Village (Verteron) or Safe Haven / Nornir Assembly (Altgard) statues', guideUrl: A + 'what-to-do-at-45/', source: 'A, K, allthings.how (level sync is an Asian-release rule)',
      steps: [
        'Open the 3D map\'s Collect panel: it shows every Empyrean Trace and the Monolith.',
        'Collect Traces placed along your normal quest routes; use flight and gliding for elevated ones. Do hard or isolated ones later.',
        'Teleport to the statue named after the Monolith\'s area and walk to it (about 20 to 150 m).',
        'Turn the Traces in at the Monolith. Aim for level 10 (80 Traces) first, then 20 (255) and 30 (560).',
        'Take the amulet enhance scroll for each level and use it on your amulet.',
        'In the Abyss, Lower Reshanta holds 200 Traces: turning them in at its Monolith gives 36 Daevanion Crystal: Azphel. Your other characters can sync the levels instead of collecting again.',
        'Note: on Global the Monolith pays no skill points.',
      ],
      links: [
        { label: 'allthings.how: Monolith locations', url: 'https://allthings.how/aion-2/map/monoliths/' },
        { label: 'aion2hub: Monoliths database', url: H + 'monoliths' },
        { label: 'Gamers4Life: World objects', url: 'https://gamers4.life/aion-2/database/en/world-objects/' },
      ],
      videos: [yt('zaTPBotP5ZI', 'Aragon: Ultimate progression guide, 12 steps to the endgame raid'), yt('u5PM7x0KzZk', 'jenny plays games: What to do at level 45'), yt('2jJOXpWb0AU', 'MistaWigglez: AION 2 Empyrean Traces full guide')] },
    { id: 'crafting-start', mapLayer: 'blacksmithing', title: 'Crafting: start and level up', category: 'Crafting', resetType: 'once', scope: 'character', verified: true,
      description: 'Pick one of five professions (Blacksmithing, Armorsmithing, Handicrafting, Alchemy, Cooking), level it to 50, do its promotion quest, then craft gear. Crafted gear binds to the crafter, so craft for the character who will wear it.',
      location: 'Crafting menu (Alt + G); Crafting Table in a town', guideUrl: A + 'crafting/', source: 'A, K',
      steps: [
        'Crafting opens at level 10. Choose a profession that matches your class\'s main gear: Blacksmithing for Gladiator, Templar, Assassin, Cleric; Handicrafting for Ranger, Chanter; Alchemy for Sorcerer, Spiritmaster.',
        'Open the Crafting menu (Alt + G) and go to a Crafting Table: Dawn Legion Base or Zumion Village in Verteron (Elyos), Safe Haven or Nornir Assembly in Altgard (Asmodians).',
        'Craft cheap Common recipes (e.g. Orichalcum Ingots) to raise proficiency; check the Expected Probability tab first. The success gauge must fill before the failure gauge.',
        'At proficiency 50, complete the profession\'s promotion (Professional) quest to go further; each craft levels separately up to 100.',
        'At about proficiency 55, craft True Dragon Lord gear (item level 62), the only direct Unique craft, then upcraft it step by step to 102 (upcrafts always succeed). Craft a ring first.',
        'Craft on the character that will wear the gear, put enhancement into crafted gear, and do not take damage mid-craft (it counts as a failure).',
      ],
      links: [
        { label: 'KeenGamer crafting guide', url: 'https://www.keengamer.com/articles/guides/aion-2-crafting-guide-professions-gear-materials/' },
        { label: 'Gamers4Life: Crafting calculator', url: 'https://gamers4.life/aion-2/database/en/crafting-calculator/' },
        { label: 'aion2hub: Crafting calculator', url: 'https://aion2hub.com/tools/crafting-calculator' },
      ],
      videos: [yt('hTdSVmtl00U', 'aLuckyRO: Drop or craft gear? Gear progression for Global beginners'), yt('xwrSp65-Cig', 'Deathweaver: the five professions and the Market (Portuguese)'), yt('95JFX0rtf3w', 'MistaWigglez: How to Craft in AION 2, complete crafting guide')] },
    { id: 'gathering-start', mapLayer: 'orichalcum-ore', title: 'Gathering (Essence Extraction)', category: 'Crafting', resetType: 'once', scope: 'character', verified: true,
      description: 'Gathering opens at level 10 and has no daily cap. Nodes give ore, gems, logs, herbs, cooking ingredients and Odyle (Odyle only in flight). Each node allows 3 attempts, then disappears. You can max two gathering specialties.',
      location: 'Open-world gathering nodes', guideUrl: A + 'crafting/', source: 'A, K',
      steps: [
        'Reach level 10 and gather from nodes while you level. Odyle nodes can only be extracted while flying.',
        'Each node uses a success gauge versus a failure gauge and allows 3 attempts, success or failure.',
        'Spend Common skill points on Proficient Handling and Delicate Touch (aim for 10 each), then Lady Luck.',
        'Gathering proficiency runs to 100 and pays 14 Specialty points: each material type costs 7 to max (Seeker 1, Plentiful Harvest 3, Appraiser 3). You can max two.',
        'At gathering level 50, start the quest: talk to Korius in Verteron\'s Dawn Legion Base (Asmodians: Alzirr in Altgard\'s Safe Haven) and extract Ruby nodes until you get one Splendent Ruby.',
        'Resetting skill points costs 50,000 Kina.',
      ],
      links: [
        { label: 'Interactive map: Verteron gathering (Orichalcum Ore)', url: 'https://interactivemap.app/aion2/maps/verteron/orihalum-ore' },
        { label: 'KeenGamer crafting guide', url: 'https://www.keengamer.com/articles/guides/aion-2-crafting-guide-professions-gear-materials/' },
      ],
      videos: [yt('xwrSp65-Cig', 'Deathweaver: the five professions and the Market (Portuguese)'), yt('J6AUJdR8NLU', 'MistaWigglez: How to Gather in AION 2 (Essence Extraction)')] },
  ];

  // General reference library (editable in the app under "Resources").
  const SEED_RESOURCES = [
    { label: 'MistaWigglez (YouTube channel, many AION 2 guides)', url: 'https://www.youtube.com/@MistaWigglez/videos' },
    { label: 'MistaWigglez: How to find Hidden Cubes in AION 2 (YouTube)', url: 'https://www.youtube.com/watch?v=p8_rnAHnsFg' },
    { label: 'MistaWigglez: AION 2 Sealed Dungeons Explained (YouTube)', url: 'https://www.youtube.com/watch?v=hXOoIAa-xio' },
    { label: 'MistaWigglez: AION 2 Draupnir Episode Quest Guide (YouTube)', url: 'https://www.youtube.com/watch?v=lcT54hJhZYY' },
    { label: 'MistaWigglez: Fastest ways to max Kina in AION 2 (YouTube)', url: 'https://www.youtube.com/watch?v=hif_HtC-YqA' },
    { label: 'MistaWigglez: AION 2 Power Shards Explained (YouTube)', url: 'https://www.youtube.com/watch?v=N3HCdnj6HwA' },
    { label: 'MistaWigglez: AION 2 Daevanion Guide (YouTube)', url: 'https://www.youtube.com/watch?v=LWv2c7N_oxA' },
    { label: 'MistaWigglez playlist: AION 2 Beginner Guides', url: 'https://www.youtube.com/playlist?list=PLJ7Y6xbdQq5o' },
    { label: 'MistaWigglez playlist: AION 2 Videos (all)', url: 'https://www.youtube.com/playlist?list=PLd61oUYBORJM' },
    { label: 'MistaWigglez playlist: AION 2 Customization Guides', url: 'https://www.youtube.com/playlist?list=PLXELoiCX-C10' },
    { label: 'MistaWigglez: How to hit max level fast, leveling guide (YouTube)', url: 'https://www.youtube.com/watch?v=A0hpQaWDYgs' },
    { label: 'MistaWigglez: 17 mistakes you need to avoid, beginner tips (YouTube)', url: 'https://www.youtube.com/watch?v=82h7MBZVVQk' },
    { label: 'MistaWigglez: Ascension Gauge explained, how to reach 100% (YouTube)', url: 'https://www.youtube.com/watch?v=nr3jbVduSAg' },
    { label: 'MistaWigglez: Gear Enhancement guide (YouTube)', url: 'https://www.youtube.com/watch?v=DtgiUo83XnM' },
    { label: 'MistaWigglez: Inventory and storage guide (YouTube)', url: 'https://www.youtube.com/watch?v=NL2V9vhcElQ' },
    { label: 'MistaWigglez: How to get more potions (YouTube)', url: 'https://www.youtube.com/watch?v=7UZeyFk08Vk' },
    { label: 'MistaWigglez: How to unlock new wings (YouTube)', url: 'https://www.youtube.com/watch?v=g-f3CaQGcZ4' },
    { label: 'MistaWigglez: How to max out pet levels (YouTube)', url: 'https://www.youtube.com/watch?v=YdUqEg5Yzok' },
    { label: 'MistaWigglez: Connect your Twitch account to claim Twitch Drops (YouTube)', url: 'https://www.youtube.com/watch?v=nBqmp2NCUwU' },
    { label: 'MistaWigglez: How to redeem coupon codes (YouTube)', url: 'https://www.youtube.com/watch?v=sH92X_NVJ-g' },
    { label: 'aion2maps.com: All guides', url: A + 'all/' },
    { label: 'aion2maps.com: Daily and weekly', url: A + 'daily-and-weekly/' },
    { label: 'aion2maps.com: What to do at 45', url: A + 'what-to-do-at-45/' },
    { label: 'aion2maps.com: What\'s tied to character, server or account', url: A + 'whats-bound/' },
    { label: 'aion2maps.com: 3D map', url: 'https://aion2maps.com/' },
    { label: 'Grobs: Daily and weekly checklist and a week-one plan (YouTube)', url: 'https://www.youtube.com/watch?v=hAl6c_LwE3M' },
    { label: 'metabot.gg: Daily & weekly checklist', url: M + 'guides/daily-weekly-checklist' },
    { label: 'metabot.gg: Weekly reset times', url: M + 'weekly-reset' },
    { label: 'games.gg: Daily & weekly checklist', url: 'https://games.gg/aion-2/guides/aion-2-daily-weekly-checklist/' },
    { label: 'MeinMMO: Daily & weekly checklist', url: MM },
    { label: 'SkyCoach: Checklist guide', url: 'https://skycoach.gg/blog/aion-2/articles/checklist-guide' },
    { label: 'KeenGamer: What to do before each reset', url: 'https://www.keengamer.com/articles/guides/aion-2-daily-and-weekly-checklist-what-to-do-before-each-reset/' },
    { label: 'playnews.gg: Reset time guide', url: 'https://www.playnews.gg/en/guides/aion-2-daily-and-weekly-reset-what-time-is-it-for-you-and-what-does-it-refill' },
    { label: 'aion2hub: Event / Rift timer', url: 'https://aion2hub.com/tools/event-timer' },
    { label: 'aion2hub: World boss timers', url: 'https://aion2hub.com/tools/world-bosses' },
    { label: 'aion2hub: Season calendar', url: 'https://aion2hub.com/tools/seasons' },
    { label: 'aion2hub: Monoliths database', url: 'https://aion2hub.com/database/monoliths' },
    { label: 'aion2hub: Patch note 2026-09-02 (Stronghold / Monolith contest)', url: 'https://aion2hub.com/updates/aion-2-update-2026-09-02' },
    { label: 'aion2hub: Crafting calculator', url: 'https://aion2hub.com/tools/crafting-calculator' },
    { label: 'Gamers4Life: Quests database', url: 'https://gamers4.life/aion-2/database/en/quests/' },
    { label: 'Gamers4Life: Dungeons database', url: 'https://gamers4.life/aion-2/database/en/dungeons/' },
    { label: 'Gamers4Life: World objects (incl. Monoliths)', url: 'https://gamers4.life/aion-2/database/en/world-objects/' },
    { label: 'Gamers4Life: Crafting calculator', url: 'https://gamers4.life/aion-2/database/en/crafting-calculator/' },
    { label: 'Interactive map: Verteron strongholds', url: 'https://interactivemap.app/aion2/maps/verteron/stronghold' },
    { label: 'Interactive map: Altgard strongholds', url: 'https://interactivemap.app/aion2/maps/altgard/stronghold' },
    { label: 'aion2.gg: Growth dungeons', url: 'https://aion2.gg/database/dungeons?type=Growth' },
    { label: 'metabot.gg: Dungeon guide', url: M + 'guides/dungeon-guide' },
    { label: 'aion2t.com: Guides', url: 'https://aion2t.com/guides' },
    { label: 'aion2t.com: Crafting', url: 'https://aion2t.com/crafting' },
    { label: 'QuestLog AION 2 (added by request; could not be read for research)', url: 'https://questlog.gg/aion-2/en' },
    { label: 'aion2.app (added by request)', url: 'https://aion2.app/' },
  ];

  root.SEED_TASKS = SEED_TASKS;
  root.SEED_RESOURCES = SEED_RESOURCES;
  root.SEED_REV = SEED_REV;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = SEED_TASKS; module.exports.RESOURCES = SEED_RESOURCES; module.exports.REV = SEED_REV;
  }
})(typeof window !== 'undefined' ? window : globalThis);
