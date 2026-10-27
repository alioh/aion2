/* Experimental event timeline. Reads the server region from the tracker's saved settings
 * (read-only) and draws the next 12/24/48 hours of recurring events on the server clock. */
(function () {
  'use strict';
  const T = window.AionTime;
  const MIN = 60000, H = 3600000;
  const $ = (id) => document.getElementById(id);

  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (k === 'class') el.className = v;
      else if (k === 'style') el.style.cssText = v;
      else el.setAttribute(k, v);
    }
    for (const kid of kids.flat()) if (kid != null) el.append(kid);
    return el;
  }

  // ---------- config (pushed in by the tracker) ----------
  let tz = 'Europe/Berlin', resetTime = '07:00', weeklyDay = 3;
  let resetCfg = { resetTime, weeklyDay, timezone: 'UTC' };
  let city = 'Berlin';
  const nowMs = () => (typeof window.__AION_NOW === 'number' ? window.__AION_NOW : Date.now());
  function configure(c) {
    tz = c.tz || tz; resetTime = c.resetTime || resetTime;
    weeklyDay = Number.isInteger(c.weeklyDay) ? c.weeklyDay : weeklyDay;
    resetCfg = { resetTime, weeklyDay, timezone: 'UTC' };
    city = tz.split('/').pop().replace('_', ' ');
    tick();
  }

  // ---------- events ----------
  // Windows are [start minute of day, length in minutes] on the server region's clock (shugo.gg/timers).
  const EVERY = (from, step, dur, off = 0) => { const a = []; for (let m = from * 60; m < 1440; m += step * 60) a.push([m + off, dur]); return a; };
  const EVENTS = [
    { id: 'battlefield', name: 'Battlefield', glyph: '⚔', tag: 'PVP', days: 'Daily', win: [[11 * 60, 180], [19 * 60, 120]],
      text: 'The Arena of Tactics, 10 vs 10 on the Odyle Shard Cradle. Matchmaking opens twice a day, 11:00 to 14:00 and 19:00 to 21:00.' },
    { id: 'invasion', name: 'Dimensional Invasion', glyph: '⚡', tag: 'EVENT', days: 'Hourly at :30', win: EVERY(0, 1, 15, 30),
      text: 'A short invasion event every hour at half past, lasting 15 minutes.' },
    { id: 'rift', name: 'Spacetime Rift', glyph: '◎', tag: 'PVP', days: 'Every 3 hours', win: EVERY(2, 3, 10),
      text: 'Portal to the opposing faction\'s continent. The portal stays open about 10 minutes; once through you get roughly an hour there. Level 45.' },
    { id: 'shugo', name: 'Shugo Festival', glyph: '✦', tag: 'EVENT', days: 'Hourly', win: EVERY(0, 1, 10),
      text: 'Short event at the top of every hour, lasting 10 minutes.' },
    { id: 'kaira', name: 'Watcher Kaira', glyph: '◉', tag: 'BOSS', days: 'Every 3 hours', win: EVERY(1, 3, 30),
      text: 'Lower Abyss field boss that appears at a random spot and leaves 30 minutes later.' },
  ];

  // ---------- occurrences ----------
  const pad = (n) => String(n).padStart(2, '0');
  function hm(ms) {
    const p = T.partsIn(ms, tz);
    return pad(p.h) + ':' + pad(p.mi);
  }
  function occurrences(ev, now) {
    const p = T.partsIn(now, tz), out = [];
    for (let d = -1; d <= 4; d++) {
      const day = new Date(Date.UTC(p.y, p.mo - 1, p.d + d));
      for (const [m, dur] of ev.win) {
        const s = T.zonedToUtc(day.getUTCFullYear(), day.getUTCMonth() + 1, day.getUTCDate(), Math.floor(m / 60), m % 60, tz);
        out.push({ s, e: s + dur * MIN });
      }
    }
    return out.sort((a, b) => a.s - b.s);
  }
  function dayDiff(ms, now) {
    const a = T.partsIn(ms, tz), b = T.partsIn(now, tz);
    return Math.round((Date.UTC(a.y, a.mo - 1, a.d) - Date.UTC(b.y, b.mo - 1, b.d)) / 86400000);
  }
  const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  function dayLabel(ms, now) {
    const d = dayDiff(ms, now);
    if (d === 0) return 'Today';
    if (d === 1) return 'Tomorrow';
    return WD[new Date(Date.UTC(...(([y, m, dd]) => [y, m - 1, dd])((() => { const p = T.partsIn(ms, tz); return [p.y, p.mo, p.d]; })()))).getUTCDay()];
  }
  const fmtCd = (ms) => T.formatCountdown(ms).replace(/^00:/, '');

  // ---------- UI state ----------
  let range = 24, openId = null, showCd = true;
  try { showCd = localStorage.getItem('aion2-timeline-cd') !== '0'; } catch (e) { /* ignore */ }
  try { const r = +localStorage.getItem('aion2-timeline-range'); if ([12, 24, 48].includes(r)) range = r; } catch (e) { /* ignore */ }

  const rowsEl = $('rows'), axisEl = $('axis');
  const refs = {};

  function buildRows() {
    rowsEl.replaceChildren();
    for (const ev of EVENTS) {
      const r = refs[ev.id] = {};
      r.dot = h('i', { class: 'dot off' });
      r.status = h('span', { class: 'st' });
      r.icon = h('span', { class: 'ico', 'aria-hidden': 'true' }, ev.glyph);
      r.track = h('div', { class: 'tl-track' });
      r.detail = h('div', { class: 'tl-detail', hidden: '' });
      const head = h('button', { class: 'tl-row', type: 'button', 'aria-expanded': 'false' },
        h('span', { class: 'tl-info' }, r.icon, h('span', { class: 'tl-name' }, h('b', null, ev.name), h('small', null, r.dot, r.status))),
        r.track, h('span', { class: 'chev', 'aria-hidden': 'true' }));
      head.addEventListener('click', () => { openId = openId === ev.id ? null : ev.id; syncOpen(); drawDetail(ev, nowMs()); });
      r.head = head;
      rowsEl.append(h('div', { class: 'tl-item', id: 'it-' + ev.id }, head, r.detail));
    }
    rowsEl.append(h('div', { class: 'tl-lines', id: 'lines' }));
  }

  function syncOpen() {
    for (const ev of EVENTS) {
      const r = refs[ev.id], open = openId === ev.id;
      r.detail.hidden = !open;
      r.head.setAttribute('aria-expanded', String(open));
      r.head.parentElement.classList.toggle('open', open);
    }
  }

  function drawDetail(ev, now) {
    const r = refs[ev.id];
    if (openId !== ev.id) return;
    const times = ev.win.map(([m]) => pad(Math.floor(m / 60)) + ':' + pad(m % 60));
    const shown = times.length > 8 ? times.slice(0, 8).join(', ') + ', …' : times.join(', ');
    const next = occurrences(ev, now).filter((o) => o.e > now).slice(0, 3);
    r.detail.replaceChildren(
      h('div', { class: 'tl-meta' }, h('span', { class: 'tag' }, ev.tag), h('span', null, ev.days + ' · ' + shown + ' ' + city)),
      h('p', null, ev.text),
      h('div', { class: 'tl-cards' }, next.map((o) => {
        const live = o.s <= now;
        return h('div', { class: 'tl-card' + (live ? ' live' : '') },
          h('b', null, hm(o.s), h('span', null, '–' + hm(o.e))),
          h('small', null, live ? 'now' : dayLabel(o.s, now)));
      })));
  }

  // ---------- drawing ----------
  function tick() {
    const now = nowMs(), span = range * H, end = now + span;
    const pct = (t) => ((t - now) / span) * 100;

    $('rangeTxt').textContent = range;

    // axis ticks on whole hours of the server clock
    const lp = T.partsIn(now, tz), localNow = Date.UTC(lp.y, lp.mo - 1, lp.d, lp.h, lp.mi, lp.s), off = localNow - now;
    const step = range <= 12 ? 2 : range <= 24 ? 4 : 8;
    const ticks = [];
    for (let l = Math.ceil(localNow / (step * H)) * step * H; l - off < end; l += step * H) {
      const t = l - off;
      if (l % (24 * H) === 0) continue;   // midnight is labelled by the "Tomorrow" guide
      if (pct(t) > 4 && pct(t) < 97) ticks.push(h('span', { class: 'tick', style: 'left:' + pct(t) + '%' }, hm(t)));
    }
    axisEl.replaceChildren(h('span', { class: 'tick now', style: 'left:0%' }, 'NOW'), ...ticks);

    // vertical lines: midnight (server clock) and next reset
    const lines = [];
    for (let l = Math.ceil(localNow / (24 * H)) * 24 * H; l - off < end; l += 24 * H) {
      lines.push(h('span', { class: 'vline mid', style: 'left:' + pct(l - off) + '%' }, h('em', null, 'Tomorrow')));
    }
    const nd = T.nextReset('daily', now, resetCfg), nw = T.nextReset('weekly', now, resetCfg);
    if (nd < end) lines.push(h('span', { class: 'vline reset', style: 'left:' + pct(nd) + '%' }, h('em', null, (nd === nw ? 'Daily + Weekly reset ' : 'Daily reset ') + hm(nd))));
    lines.unshift(h('span', { class: 'vline nowline', style: 'left:0%' }));
    $('lines').replaceChildren(...lines);

    for (const ev of EVENTS) {
      const r = refs[ev.id], occ = occurrences(ev, now);
      const cur = occ.find((o) => o.s <= now && o.e > now), nxt = occ.find((o) => o.s > now);
      const open = !!cur;
      r.dot.className = 'dot ' + (open ? 'on' : 'off');
      r.head.parentElement.classList.toggle('live', open);
      r.status.replaceChildren(...(showCd
        ? [open ? 'Ends in ' : 'Next in ', h('b', { class: open ? 'closes' : '' }, fmtCd(open ? cur.e - now : nxt.s - now))]
        : [open ? 'Open' : 'Closed']));
      r.track.replaceChildren(...occ.filter((o) => o.e > now && o.s < end).map((o) => {
        const l = Math.max(0, pct(o.s)), w = Math.min(100, pct(o.e)) - l;
        return h('span', { class: 'blk' + (o.s <= now ? ' run' : ''), style: 'left:' + l + '%;width:max(' + w + '%,6px)' });
      }));
      drawDetail(ev, now);
    }
  }

  for (const b of document.querySelectorAll('.seg button')) {
    b.addEventListener('click', () => {
      range = +b.dataset.range;
      try { localStorage.setItem('aion2-timeline-range', String(range)); } catch (e) { /* ignore */ }
      markRange(); tick();
    });
  }
  function markRange() { for (const b of document.querySelectorAll('.seg button')) b.classList.toggle('on', +b.dataset.range === range); }

  const cd = $('cdToggle');
  cd.checked = showCd;
  cd.addEventListener('change', () => {
    showCd = cd.checked;
    try { localStorage.setItem('aion2-timeline-cd', showCd ? '1' : '0'); } catch (e) { /* ignore */ }
    tick();
  });

  buildRows(); markRange(); syncOpen(); tick();
  setInterval(tick, 1000);
  window.AionTimeline = { configure };
})();
