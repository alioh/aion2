// Run: node --test tests/
const test = require('node:test');
const assert = require('node:assert');
const T = require('../js/time.js');
const S = require('../js/store.js');
const SEED = require('../js/seed.js');

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
    assert.ok(['daily', 'weekly'].includes(t.resetType));
    assert.equal(typeof t.verified, 'boolean');
  }
});
