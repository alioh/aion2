/* State shape, validation and persistence helpers (no DOM). */
(function (root) {
  'use strict';

  const STORAGE_KEY = 'aion2-daily-tracker-v1';
  const VERSION = 1;
  const RESET_TYPES = ['daily', 'weekly'];

  function uid(prefix) {
    return (prefix || 'id') + '-' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
  }

  function str(v, max) { return typeof v === 'string' ? v.slice(0, max || 2000) : ''; }

  /** Only http(s) links are allowed so imported data cannot smuggle javascript: URLs. */
  function safeUrl(v) {
    const s = str(v, 1000).trim();
    if (!s) return '';
    try {
      const u = new URL(s);
      return u.protocol === 'http:' || u.protocol === 'https:' ? u.href : '';
    } catch (e) { return ''; }
  }

  function cleanLinks(arr, max) {
    if (!Array.isArray(arr)) return [];
    const out = [];
    for (const l of arr) {
      if (!l || typeof l !== 'object') continue;
      const url = safeUrl(l.url);
      if (!url) continue;
      out.push({ label: str(l.label, 100).trim() || linkLabel(url), url });
      if (out.length >= (max || 20)) break;
    }
    return out;
  }

  function linkLabel(url) {
    try {
      const host = new URL(url).hostname.replace(/^www\./, '');
      return /(^|\.)(youtube\.com|youtu\.be)$/.test(host) ? 'YouTube video' : host;
    } catch (e) { return 'Link'; }
  }

  /** "Label | URL" or bare URL, one per line. */
  function parseLinks(text) {
    return cleanLinks(String(text || '').split(/\r?\n/).map((line) => {
      const i = line.lastIndexOf('|');
      return i >= 0 ? { label: line.slice(0, i), url: line.slice(i + 1).trim() } : { label: '', url: line.trim() };
    }));
  }

  function linksToText(links) {
    return (links || []).map((l) => l.label + ' | ' + l.url).join('\n');
  }

  function cleanTask(t, custom) {
    return {
      id: str(t.id, 100) || uid('c'),
      title: str(t.title, 200).trim() || 'Untitled task',
      description: str(t.description, 1000),
      location: str(t.location, 300),
      guideUrl: safeUrl(t.guideUrl),
      category: str(t.category, 60).trim() || 'Other',
      resetType: RESET_TYPES.includes(t.resetType) ? t.resetType : 'daily',
      verified: t.verified === true,
      source: str(t.source, 300),
      links: cleanLinks(t.links),
      hidden: t.hidden === true,
      custom: custom === undefined ? t.custom === true : custom,
    };
  }

  function seedTasks(seed) { return seed.map((t) => cleanTask(t, false)); }

  function defaultState(seed, resources) {
    const c = { id: uid('ch'), name: 'Character 1' };
    return {
      version: VERSION,
      settings: { resetTime: '05:00', timezone: 'UTC', weeklyDay: 3, theme: 'dark', resetConfirmed: false },
      characters: [c],
      activeCharId: c.id,
      tasks: seedTasks(seed),
      completions: {},
      resources: cleanLinks(resources, 200),
      ui: { category: 'all', status: 'all', hideCompleted: false },
    };
  }

  /** Coerce any parsed JSON into a valid state. Throws on unusable input. */
  function normalize(raw, seed, resources) {
    if (!raw || typeof raw !== 'object' || !Array.isArray(raw.tasks) || !Array.isArray(raw.characters)) {
      throw new Error('Not an AION 2 tracker backup.');
    }
    const d = defaultState(seed, resources);
    const rs = raw.settings || {};
    const settings = {
      resetTime: /^\d{1,2}:\d{2}$/.test(rs.resetTime) ? rs.resetTime : d.settings.resetTime,
      timezone: str(rs.timezone, 100) || d.settings.timezone,
      weeklyDay: Number.isInteger(rs.weeklyDay) && rs.weeklyDay >= 0 && rs.weeklyDay <= 6 ? rs.weeklyDay : d.settings.weeklyDay,
      theme: rs.theme === 'light' ? 'light' : 'dark',
      resetConfirmed: rs.resetConfirmed === true,
    };
    try { new Intl.DateTimeFormat('en', { timeZone: settings.timezone }); } catch (e) { settings.timezone = 'UTC'; }

    const seen = new Set();
    const characters = [];
    for (const c of raw.characters) {
      if (!c || typeof c !== 'object') continue;
      const id = str(c.id, 100);
      if (!id || seen.has(id)) continue;
      seen.add(id);
      characters.push({ id, name: str(c.name, 60).trim() || 'Character' });
    }
    if (!characters.length) characters.push(d.characters[0]);

    const tseen = new Set();
    const tasks = [];
    for (const t of raw.tasks) {
      if (!t || typeof t !== 'object') continue;
      const ct = cleanTask(t);
      // Backups from before links existed: fill default tasks' links from the seed.
      if (!Array.isArray(t.links) && !ct.custom) {
        const sd = seed.find((x) => x.id === ct.id);
        if (sd) ct.links = cleanLinks(sd.links);
      }
      if (tseen.has(ct.id)) continue;
      tseen.add(ct.id);
      tasks.push(ct);
    }

    const completions = {};
    const rc = raw.completions && typeof raw.completions === 'object' ? raw.completions : {};
    for (const c of characters) {
      const m = rc[c.id];
      if (!m || typeof m !== 'object') continue;
      completions[c.id] = {};
      for (const tid of Object.keys(m)) {
        if (typeof m[tid] === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(m[tid])) completions[c.id][tid] = m[tid];
      }
    }

    const resList = Array.isArray(raw.resources) ? cleanLinks(raw.resources, 200) : d.resources;

    const ru = raw.ui || {};
    const ui = {
      category: str(ru.category, 60) || 'all',
      status: ['all', 'todo', 'done'].includes(ru.status) ? ru.status : 'all',
      hideCompleted: ru.hideCompleted === true,
    };
    const activeCharId = characters.some((c) => c.id === raw.activeCharId) ? raw.activeCharId : characters[0].id;
    return { version: VERSION, settings, characters, activeCharId, tasks, completions, resources: resList, ui };
  }

  const api = { STORAGE_KEY, VERSION, uid, safeUrl, cleanLinks, parseLinks, linksToText, cleanTask, seedTasks, defaultState, normalize };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.AionStore = api;
})(typeof window !== 'undefined' ? window : globalThis);
