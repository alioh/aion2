// Run: node --test tests/
const test = require('node:test');
const assert = require('node:assert');
const T = require('../js/time.js');
const S = require('../js/store.js');
const SEED = require('../js/seed.js');
const MAPS = require('../js/maps.js');

const utc = (s) => Date.parse(s);
const base = { resetTime: '07:00', timezone: 'UTC', weeklyDay: 3 }; // Wednesday

test('daily key flips exactly at reset time', () => {
  assert.equal(T.periodKey('daily', utc('2026-10-27T06:59:59Z'), base), '2026-10-26');
  assert.equal(T.periodKey('daily', utc('2026-10-27T07:00:00Z'), base), '2026-10-27');
  assert.equal(T.periodKey('daily', utc('2026-10-27T23:59:59Z'), base), '2026-10-27');
});

test('weekly key flips on the configured weekday at reset time', () => {
  // 2026-10-28 is a Wednesday
  assert.equal(T.periodKey('weekly', utc('2026-10-28T06:59:59Z'), base), '2026-10-21');
  assert.equal(T.periodKey('weekly', utc('2026-10-28T07:00:00Z'), base), '2026-10-28');
  assert.equal(T.periodKey('weekly', utc('2026-11-03T23:00:00Z'), base), '2026-10-28');
  assert.equal(T.periodKey('weekly', utc('2026-11-04T07:00:00Z'), base), '2026-11-04');
});

test('weekday setting is respected', () => {
  const mon = { ...base, weeklyDay: 1 };
  assert.equal(T.periodKey('weekly', utc('2026-10-26T07:00:00Z'), mon), '2026-10-26');
  assert.equal(T.periodKey('weekly', utc('2026-10-26T06:00:00Z'), mon), '2026-10-19');
});

test('next reset and countdown', () => {
  const now = utc('2026-10-27T05:00:00Z');
  assert.equal(T.nextReset('daily', now, base), utc('2026-10-27T07:00:00Z'));
  assert.equal(T.nextReset('weekly', now, base), utc('2026-10-28T07:00:00Z'));
  assert.equal(T.nextReset('daily', utc('2026-10-27T07:00:00Z'), base), utc('2026-10-28T07:00:00Z'));
  assert.equal(T.formatCountdown(2 * 3600e3 + 5e3), '02:00:05');
  assert.equal(T.formatCountdown(26 * 3600e3), '1d 02:00:00');
});

test('timezone: Asia/Seoul 16:00 == 07:00 UTC', () => {
  const kr = { resetTime: '16:00', timezone: 'Asia/Seoul', weeklyDay: 3 };
  assert.equal(T.nextReset('daily', utc('2026-10-27T06:00:00Z'), kr), utc('2026-10-27T07:00:00Z'));
  assert.equal(T.periodKey('daily', utc('2026-10-27T07:00:00Z'), kr), '2026-10-27');
  assert.equal(T.periodKey('daily', utc('2026-10-27T06:59:00Z'), kr), '2026-10-26');
});

test('DST: reset stays at 05:00 local across the US fall-back (2026-11-01)', () => {
  const ny = { resetTime: '05:00', timezone: 'America/New_York', weeklyDay: 3 };
  // 05:00 EDT = 09:00Z (Oct 31), 05:00 EST = 10:00Z (Nov 1 and later)
  assert.equal(T.nextReset('daily', utc('2026-10-31T10:00:00Z'), ny), utc('2026-11-01T10:00:00Z'));
  assert.equal(T.periodKey('daily', utc('2026-11-01T09:30:00Z'), ny), '2026-10-31');
  assert.equal(T.periodKey('daily', utc('2026-11-01T10:00:00Z'), ny), '2026-11-01');
});

test('export/import round-trip is lossless', () => {
  const st = S.defaultState(SEED);
  st.characters.push({ id: 'ch-b', name: 'Cleric' });
  st.completions[st.characters[0].id] = { 'duty-missions': '2026-10-27' };
  st.completions['ch-b'] = { nightmare: '2026-10-27', 'daily-dungeon': '2026-10-21' };
  st.tasks.push(S.cleanTask({ id: 'c-x', title: 'Mine', category: 'Quests', resetType: 'weekly', guideUrl: 'https://example.com/a' }, true));
  st.tasks[0].hidden = true;
  st.settings.resetTime = '07:00'; st.settings.theme = 'light'; st.settings.resetConfirmed = true;
  st.activeCharId = 'ch-b';
  const back = S.normalize(JSON.parse(JSON.stringify(st, null, 2)), SEED);
  assert.deepStrictEqual(back, st);
});

test('import rejects junk and strips unsafe URLs', () => {
  assert.throws(() => S.normalize({ nope: 1 }, SEED));
  assert.throws(() => S.normalize(null, SEED));
  const st = S.defaultState(SEED);
  st.tasks[0].guideUrl = 'javascript:alert(1)';
  assert.equal(S.normalize(JSON.parse(JSON.stringify(st)), SEED).tasks[0].guideUrl, '');
});

test('seed integrity: unique ids, https guide URLs, valid reset types', () => {
  const ids = new Set();
  for (const t of SEED) {
    assert.ok(!ids.has(t.id), 'dup ' + t.id); ids.add(t.id);
    assert.match(t.guideUrl, /^https:\/\//);
    assert.ok(['daily', 'weekly', 'once'].includes(t.resetType));
    assert.ok(['character', 'server'].includes(t.scope), t.id);
    for (const v of t.videos) assert.ok(S.youtubeId(v.url), 'bad video ' + t.id);
    assert.equal(typeof t.verified, 'boolean');
  }
});

test('links: parsing, YouTube label, unsafe URLs dropped', () => {
  const l = S.parseLinks('Vid | https://www.youtube.com/watch?v=abc\nhttps://youtu.be/xyz\nbad | javascript:alert(1)\nhttps://games.gg/x');
  assert.deepStrictEqual(l.map((x) => x.label), ['Vid', 'YouTube video', 'games.gg']);
  assert.equal(S.linksToText(l).split('\n').length, 3);
});

test('round-trip keeps links and resources; old backups get seed links', () => {
  const st = S.defaultState(SEED, SEED.RESOURCES);
  assert.ok(st.resources.length > 10);
  st.tasks[0].links.push({ label: 'Mine', url: 'https://example.com/v' });
  assert.deepStrictEqual(S.normalize(JSON.parse(JSON.stringify(st)), SEED, SEED.RESOURCES), st);
  const old = JSON.parse(JSON.stringify(st));
  delete old.resources; old.tasks.forEach((t) => delete t.links);
  const mig = S.normalize(old, SEED, SEED.RESOURCES);
  assert.ok(mig.resources.length === st.resources.length);
  assert.ok(mig.tasks.find((t) => t.id === 'duty-missions').links.length >= 1);
});

test('youtubeId parses common URL shapes', () => {
  assert.equal(S.youtubeId('https://www.youtube.com/watch?v=hAl6c_LwE3M&t=5'), 'hAl6c_LwE3M');
  assert.equal(S.youtubeId('https://youtu.be/hAl6c_LwE3M'), 'hAl6c_LwE3M');
  assert.equal(S.youtubeId('https://www.youtube.com/shorts/hAl6c_LwE3M'), 'hAl6c_LwE3M');
  assert.equal(S.youtubeId('https://evil.com/watch?v=hAl6c_LwE3M'), '');
});

test('defaults: confirmed 07:00 UTC reset', () => {
  const st = S.defaultState(SEED, SEED.RESOURCES);
  assert.deepStrictEqual([st.settings.resetTime, st.settings.timezone, st.settings.weeklyDay, st.settings.resetConfirmed], ['07:00', 'UTC', 3, true]);
  assert.equal(T.nextReset('daily', utc('2026-10-27T05:00:00Z'), st.settings), utc('2026-10-27T07:00:00Z'));
  assert.equal(T.nextReset('weekly', utc('2026-10-27T05:00:00Z'), st.settings), utc('2026-10-28T07:00:00Z'));
});

test('old placeholder settings are upgraded; user-confirmed ones are kept', () => {
  const old = S.defaultState(SEED, SEED.RESOURCES);
  old.settings = { resetTime: '05:00', timezone: 'UTC', weeklyDay: 3, theme: 'light', resetConfirmed: false };
  const up = S.normalize(JSON.parse(JSON.stringify(old)), SEED, SEED.RESOURCES).settings;
  assert.deepStrictEqual([up.resetTime, up.timezone, up.resetConfirmed, up.theme], ['07:00', 'UTC', true, 'light']);
  old.settings = { resetTime: '08:30', timezone: 'Europe/Paris', weeklyDay: 2, theme: 'dark', resetConfirmed: true, resetUtc: true };
  assert.equal(S.normalize(JSON.parse(JSON.stringify(old)), SEED, SEED.RESOURCES).settings.resetTime, '08:30');
});

test('legacy wall-clock reset in a timezone is converted once to UTC (KSA 10:00 -> 07:00 UTC)', () => {
  const old = S.defaultState(SEED, SEED.RESOURCES);
  old.settings = { resetTime: '10:00', timezone: 'Asia/Riyadh', weeklyDay: 3, theme: 'dark', resetConfirmed: true };
  const s1 = S.normalize(JSON.parse(JSON.stringify(old)), SEED, SEED.RESOURCES).settings;
  assert.deepStrictEqual([s1.resetTime, s1.timezone, s1.resetUtc], ['07:00', 'Asia/Riyadh', true]);
  // already-converted state is not converted again
  const s2 = S.normalize(JSON.parse(JSON.stringify({ ...old, settings: s1 })), SEED, SEED.RESOURCES).settings;
  assert.equal(s2.resetTime, '07:00');
});

test('display timezone never moves the reset instant', () => {
  const cfg = { resetTime: '07:00', weeklyDay: 3, timezone: 'UTC' };
  const now = utc('2026-10-27T05:00:00Z');
  assert.equal(T.nextReset('daily', now, cfg), utc('2026-10-27T07:00:00Z'));
  const p = T.partsIn(T.nextReset('daily', now, cfg), 'Asia/Riyadh');
  assert.deepStrictEqual([p.h, p.mi], [10, 0]);
});

test('server-scope and one-time completions survive round trip', () => {
  const st = S.defaultState(SEED, SEED.RESOURCES);
  st.completions[S.SERVER_KEY] = { 'duty-missions': '2026-10-27' };
  st.completions[st.characters[0].id] = { monolith: 'once' };
  assert.deepStrictEqual(S.normalize(JSON.parse(JSON.stringify(st)), SEED, SEED.RESOURCES).completions, st.completions);
  assert.equal(T.periodKey('once', 0, base), 'once');
});

test('syncSeed: refreshes defaults, adds new, drops retired, keeps custom/hidden', () => {
  const st = S.defaultState(SEED, SEED.RESOURCES);
  st.tasks = st.tasks.filter((t) => t.id !== 'monolith');
  st.tasks.push(S.cleanTask({ id: 'old-retired', title: 'Retired', category: 'X' }, false));
  st.tasks.push(S.cleanTask({ id: 'c-mine', title: 'Mine', category: 'X' }, true));
  st.tasks.find((t) => t.id === 'nightmare').hidden = true;
  st.tasks.find((t) => t.id === 'duty-missions').description = 'edited';
  S.syncSeed(st, SEED, SEED.REV, SEED.RESOURCES);
  const ids = st.tasks.map((t) => t.id);
  assert.ok(ids.includes('monolith') && ids.includes('c-mine') && !ids.includes('old-retired'));
  assert.equal(st.tasks.find((t) => t.id === 'nightmare').hidden, true);
  assert.notEqual(st.tasks.find((t) => t.id === 'duty-missions').description, 'edited');
  assert.equal(st.seedRev, SEED.REV);
});

test('map search: "gems" finds the gemstone layers; plurals and misses behave', () => {
  assert.deepStrictEqual(MAPS.search('gems').map((l) => l.id), ['diamond-gemstone', 'sapphire-gemstone', 'ruby-gemstone']);
  assert.ok(MAPS.search('monolith').some((l) => l.id === 'empyrean-trace'));
  assert.ok(MAPS.search('hidden cubes').some((l) => l.id === 'hidden-cube'));
  assert.deepStrictEqual(MAPS.search('zzzz'), []);
  assert.deepStrictEqual(MAPS.search('  '), []);
});

test('map urls: faction-aware, missing layers return null, seed map layers exist', () => {
  const g = MAPS.byId['diamond-gemstone'];
  assert.equal(MAPS.layerUrl(g, 'altgard'), 'https://interactivemap.app/aion2/maps/altgard/diamond-gemstone');
  assert.equal(MAPS.layerUrl(MAPS.byId['yggdrasil-log'], 'altgard'), null);
  assert.equal(MAPS.layerUrl(MAPS.byId['blacksmithing'], 'altgard'), 'https://interactivemap.app/aion2/maps/altgard/svc-blacksmithing-altgard');
  for (const t of SEED) if (t.mapLayer) assert.ok(MAPS.byId[t.mapLayer], t.id);
});

test('every map layer has an icon drawn from our own shapes', () => {
  for (const l of MAPS.LAYERS) assert.match(MAPS.iconSvg(l.id), /^<svg viewBox="0 0 24 24"/, l.id);
  assert.equal(MAPS.iconSvg('nope'), '');
});
