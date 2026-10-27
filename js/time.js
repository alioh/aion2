/* Reset-period maths. Pure functions, no DOM; works in browser and Node (tests).
 *
 * A task is "done" when its stored period key equals the CURRENT period key.
 * Period key = local date (in the chosen timezone) of the most recent reset boundary,
 * so resets need no timers or cleanup and are DST-safe. */
(function (root) {
  'use strict';

  const fmtCache = {};
  function fmt(tz) {
    if (!fmtCache[tz]) {
      fmtCache[tz] = new Intl.DateTimeFormat('en-CA', {
        timeZone: tz, hourCycle: 'h23',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      });
    }
    return fmtCache[tz];
  }

  function partsIn(ms, tz) {
    const o = {};
    for (const p of fmt(tz).formatToParts(new Date(ms))) o[p.type] = p.value;
    return { y: +o.year, mo: +o.month, d: +o.day, h: +o.hour % 24, mi: +o.minute, s: +o.second };
  }

  function asUtc(p) { return Date.UTC(p.y, p.mo - 1, p.d, p.h, p.mi, p.s); }

  /** Wall-clock time in `tz` -> UTC epoch ms. */
  function zonedToUtc(y, mo, d, h, mi, tz) {
    const guess = Date.UTC(y, mo - 1, d, h, mi);
    let t = guess - (asUtc(partsIn(guess, tz)) - guess);
    const off2 = asUtc(partsIn(t, tz)) - t;
    t = guess - off2;
    return t;
  }

  function addDays(date, n) {
    const t = new Date(Date.UTC(date.y, date.mo - 1, date.d + n));
    return { y: t.getUTCFullYear(), mo: t.getUTCMonth() + 1, d: t.getUTCDate() };
  }

  function dow(date) { return new Date(Date.UTC(date.y, date.mo - 1, date.d)).getUTCDay(); }

  function key(date) {
    return date.y + '-' + String(date.mo).padStart(2, '0') + '-' + String(date.d).padStart(2, '0');
  }

  function parseTime(str) {
    const m = /^(\d{1,2}):(\d{2})$/.exec(str || '');
    if (!m) return { h: 5, mi: 0 };
    return { h: Math.min(23, +m[1]), mi: Math.min(59, +m[2]) };
  }

  /** Local date of the last daily reset boundary. */
  function lastDailyBoundary(nowMs, s) {
    const p = partsIn(nowMs, s.timezone);
    const rt = parseTime(s.resetTime);
    const before = p.h * 60 + p.mi < rt.h * 60 + rt.mi;
    const today = { y: p.y, mo: p.mo, d: p.d };
    return before ? addDays(today, -1) : today;
  }

  /** Local date of the last weekly reset boundary. */
  function lastWeeklyBoundary(nowMs, s) {
    const b = lastDailyBoundary(nowMs, s);
    return addDays(b, -((dow(b) - s.weeklyDay + 7) % 7));
  }

  function periodKey(type, nowMs, s) {
    return key(type === 'weekly' ? lastWeeklyBoundary(nowMs, s) : lastDailyBoundary(nowMs, s));
  }

  /** UTC ms of the next reset of the given type. */
  function nextReset(type, nowMs, s) {
    const rt = parseTime(s.resetTime);
    const base = type === 'weekly' ? lastWeeklyBoundary(nowMs, s) : lastDailyBoundary(nowMs, s);
    const n = addDays(base, type === 'weekly' ? 7 : 1);
    return zonedToUtc(n.y, n.mo, n.d, rt.h, rt.mi, s.timezone);
  }

  function formatCountdown(ms) {
    if (ms < 0) ms = 0;
    const t = Math.floor(ms / 1000);
    const d = Math.floor(t / 86400);
    const h = Math.floor((t % 86400) / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = t % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return (d ? d + 'd ' : '') + pad(h) + ':' + pad(m) + ':' + pad(s);
  }

  const api = { partsIn, zonedToUtc, periodKey, nextReset, formatCountdown, parseTime };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.AionTime = api;
})(typeof window !== 'undefined' ? window : globalThis);
