/* Default task list. Edit this file to change the defaults (see README).
 *
 * verified = true  -> essentials confirmed by 2+ independent sources.
 * verified = false -> single source, or sources disagree (see `source`). Shown with an "unverified" badge.
 * An empty field means it could not be confirmed. Nothing here is invented.
 * Sources: M = metabot.gg checklist (fetched 2026-10-27), MM = mein-mmo.de checklist,
 *          K = keengamer.com checklist (search summary), P = playnews.gg (search summary). */
(function (root) {
  const M = 'https://metabot.gg/en/aion-2/';
  const MM = 'https://mein-mmo.de/en/aion-2-daily-weekly-checklist-perfect-start,1589979/';

  const SEED_TASKS = [
    // ---- Daily ----
    { id: 'duty-missions', title: 'Duty Missions', category: 'Duties', resetType: 'daily', verified: true,
      description: 'Complete up to 5 Duty Missions (Wanted bounties) per day; each pays 50,000 bound Kinah and 1,000 Abyss Points. Unlocks at level 45. Sources disagree whether the limit is per character or shared per server.',
      location: 'Quest journal', guideUrl: M + 'guides/daily-weekly-checklist', source: 'M, MM, P' },
    { id: 'nightmare', title: 'Nightmare boss challenge', category: 'Dungeons', resetType: 'daily', verified: true,
      description: 'Use your 2 daily Nightmare attempts (banked up to 14) on the lowest boss tier you have not cleared. Attempts are only spent on a clear. Rewards Phantasmal Fragments.',
      location: 'Nightmare boss ladder (starts at Gatekeeper Pinopi, tier 1)', guideUrl: M + 'bosses', source: 'M, MM' },
    { id: 'odyle-energy', title: 'Spend Odyle Energy', category: 'Dungeons', resetType: 'daily', verified: true,
      description: 'Odyle Energy refills 15 every 3 hours (120/day) and is lost once capped. Spend it on Conquest cubes (40 energy each; Expedition cubes cost 20).',
      location: 'Conquest dungeons, e.g. Draupnir or Ferocious Horn Den', guideUrl: M + 'items/odyle-energy', source: 'M, MM, P' },
    { id: 'invasion-key', title: 'Dimensional Invasion reward key', category: 'Events', resetType: 'daily', verified: true,
      description: 'You get 1 Dimensional Invasion reward key per day (stores up to 7). Use it to open the reward box when an invasion event happens.',
      location: 'Dimensional Invasion (random event)', guideUrl: M + 'guides/daily-weekly-checklist', source: 'M, MM' },
    { id: 'shugo-festival', title: 'Shugo Festival reward keys', category: 'Events', resetType: 'daily', verified: false,
      description: 'Spend your Shugo Festival reward keys to claim festival rewards. Sources disagree on the daily refill (2 vs 3 keys), so check the in-game counter.',
      location: 'Shugo Festival', guideUrl: M + 'events', source: 'M says 3/day, MM says 2/day' },

    // ---- Weekly ----
    { id: 'daily-dungeon', title: 'Daily Dungeon (Unknown Fissure)', category: 'Dungeons', resetType: 'weekly', verified: true,
      description: 'Enter Daeva Bio-Research Base. You have 14 entries per week (about 2 per day). Sources say the pool is per server rather than per character.',
      location: 'Unknown Fissure: Daeva Bio-Research Base', guideUrl: M + 'dungeons/daeva-bio-research-base', source: 'M, MM, K' },
    { id: 'ascension-trial', title: 'Ascension Trial', category: 'Dungeons', resetType: 'weekly', verified: true,
      description: 'Solo entries into Nightmare Altar and its five sister dungeons. 3 entries per week, spent on entry, per character.',
      location: 'Nightmare Altar and its sister dungeons', guideUrl: M + 'dungeons/nightmare-altar', source: 'M, MM' },
    { id: 'exploration', title: 'Exploration (Expedition dungeons)', category: 'Dungeons', resetType: 'weekly', verified: true,
      description: 'Run Expedition dungeons for reward counts: 7 per dungeon per week, no carry-over. Krao Cave and Urugugu Canyon cubes cost 20 Odyle Energy each.',
      location: 'Expedition dungeons, e.g. Krao Cave, Urugugu Canyon', guideUrl: M + 'dungeons/krao-cave', source: 'M, K' },
    { id: 'subjugation', title: 'Subjugation', category: 'Dungeons', resetType: 'weekly', verified: false,
      description: '4-player dungeons such as Subjugation Closed. 3 tickets per week, spent on entry.',
      location: 'Subjugation dungeons, e.g. Subjugation Closed', guideUrl: M + 'dungeons/subjugation-closed', source: 'M only' },
    { id: 'raid-ludra', title: 'Raid: Abyssal Forge: Ludra', category: 'Dungeons', resetType: 'weekly', verified: false,
      description: '4 attempts per week (spent on entry) and 1 final-boss reward kill per week.',
      location: 'Abyssal Forge: Ludra', guideUrl: M + 'dungeons/abyssal-forge-ludra', source: 'M only' },
    { id: 'raid-decon', title: 'Raid: Corroded Decontamination Facility', category: 'Dungeons', resetType: 'weekly', verified: false,
      description: '4 attempts per week (spent on entry) and 2 final-boss reward kills per week.',
      location: 'Corroded Decontamination Facility', guideUrl: M + 'dungeons/corroded-decontamination-facility', source: 'M only' },
    { id: 'raid-muspel', title: 'Raid: Chalice of Muspel', category: 'Dungeons', resetType: 'weekly', verified: false,
      description: '4 attempts per week (spent on entry) and 2 final-boss reward kills per week.',
      location: 'Chalice of Muspel', guideUrl: M + 'dungeons/chalice-of-muspel', source: 'M only' },
    { id: 'transcendence', title: 'Transcendence dungeons', category: 'Dungeons', resetType: 'weekly', verified: false,
      description: 'Run Deus Research Base or Shattered Arkanis once you reach the 1,600 item level gate. Up to 28 final-boss kills per week; cubes cost 40 Odyle Energy.',
      location: 'Deus Research Base, Shattered Arkanis', guideUrl: M + 'dungeons/deus-research-base', source: 'M only' },
    { id: 'abyss-time', title: 'Abyss time', category: 'Abyss', resetType: 'weekly', verified: false,
      description: 'Weekly time allowance in the Abyss layers: 7 hours per layer (14 hours for Lower and Middle with a subscription).',
      location: 'Chaotic Lower Reshanta, Chaotic Middle Reshanta, Upper Reshanta', guideUrl: M + 'map/chaotic-lower-reshanta', source: 'M only' },
    { id: 'growth-dungeons', title: 'Growth dungeons', category: 'Dungeons', resetType: 'weekly', verified: false,
      description: 'Weekly time allowance of 7 hours each in Silent Graveyard and Fafnite Amphitheater. Time only counts while inside.',
      location: 'Silent Graveyard, Fafnite Amphitheater', guideUrl: M + 'dungeons/silent-graveyard', source: 'M only' },
    { id: 'daeva-pass', title: 'Daeva Pass weekly EXP', category: 'Events', resetType: 'weekly', verified: false,
      description: 'Reach the weekly pass EXP limit (50,000 on the Season 1 pass at time of research; the limit may change each season).',
      location: '', guideUrl: M + 'daeva-pass', source: 'M only' },
  ];

  // Extra reference links per task (all URLs seen in fetched/search results; no videos could be confirmed).
  const H = 'https://aion2hub.com/database/';
  const EXTRA = {
    'duty-missions': [
      { label: 'games.gg Duty Missions guide', url: 'https://games.gg/aion-2/guides/aion-2-duty-missions-guide/' },
      { label: 'MeinMMO checklist', url: MM },
    ],
    'nightmare': [{ label: 'aion2hub Nightmare database', url: H + 'nightmare' }],
    'odyle-energy': [
      { label: 'aion2hub: Draupnir', url: H + 'instance/draupnir' },
      { label: 'aion2hub: Ferocious Horn Den', url: H + 'instance/ferocious-horn-den' },
    ],
    'exploration': [
      { label: 'aion2hub: Krao Cave', url: H + 'instance/krao-cave' },
      { label: 'aion2hub: Urugugu Canyon', url: H + 'instance/urugugu-canyon' },
    ],
    'raid-ludra': [{ label: 'aion2hub: Abyssal Forge: Ludra', url: H + 'instance/abyssal-forge-ludra' }],
    'daily-dungeon': [{ label: 'MeinMMO checklist', url: MM }],
    'ascension-trial': [{ label: 'MeinMMO checklist', url: MM }],
  };
  for (const t of SEED_TASKS) t.links = EXTRA[t.id] || [];

  // General reference library (editable in the app under "Resources").
  const SEED_RESOURCES = [
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
    { label: 'Interactive map: Verteron', url: 'https://interactivemap.app/aion2/maps/verteron' },
    { label: 'aion2t.com: Guides', url: 'https://aion2t.com/guides' },
    { label: 'aion2t.com: Crafting', url: 'https://aion2t.com/crafting' },
    { label: 'QuestLog AION 2 (added by request; could not be read for research)', url: 'https://questlog.gg/aion-2/en' },
    { label: 'aion2.app (added by request)', url: 'https://aion2.app/' },
  ];

  root.SEED_TASKS = SEED_TASKS;
  root.SEED_RESOURCES = SEED_RESOURCES;
  if (typeof module !== 'undefined' && module.exports) { module.exports = SEED_TASKS; module.exports.RESOURCES = SEED_RESOURCES; }
})(typeof window !== 'undefined' ? window : globalThis);
