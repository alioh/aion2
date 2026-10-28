/* AION 2 Global server list by region, used by the "My server" setting.
 * Source: the server lists shown on https://aion2helper.com/status/ (27 Oct 2026). Each server is one faction.
 * `tz` is the clock the region's events follow (see shugo.gg/timers). Live status is NOT fetched: aion2helper's API
 * answers only its own pages, so the app links to their status page instead. */
(function (root) {
  'use strict';

  const REGIONS = [
    { id: 'europe', label: 'Europe', tz: 'Europe/Berlin',
      elyos: ['Ariel', 'Bakarma', 'Daminu', 'Fregion', 'Gauss', 'Hithanya', 'Ishtar', 'Kaisinel', 'Kasaka', 'Kochi', 'Lamuatan', 'Luteros',
        'Meslamtaeda', 'Nania', 'Nathara', 'Nezekan', 'Phernos', 'Siel', 'Tahavatha', 'Tiamat', 'Tsenka', 'Vaizel', 'Yustiel'],
      asmodian: ['Agnita', 'Atiel', 'Azphel', 'Baba', 'Beritra', 'Ereshkigal', 'Fafnir', 'Hadala', 'Indnath', 'Israphel', 'Kromede', 'Ludra',
        'Lumiel', 'Marchutan', 'Munin', 'Nemon', 'Odar', 'Quai', 'Tassin', 'Triniel', 'Ulgorn', 'Zemurru', 'Zikel'] },
    { id: 'na-east', label: 'North America East', tz: 'America/New_York',
      elyos: ['Ariel', 'Fregion', 'Hithanya', 'Kaisinel', 'Meslamtaeda', 'Nezekan', 'Siel', 'Vaizel', 'Yustiel'],
      asmodian: ['Azphel', 'Beritra', 'Ereshkigal', 'Israphel', 'Lumiel', 'Marchutan', 'Nemon', 'Triniel', 'Zikel'] },
    { id: 'na-west', label: 'North America West', tz: 'America/Los_Angeles',
      elyos: ['Kaisinel', 'Nezekan', 'Siel', 'Vaizel', 'Yustiel'],
      asmodian: ['Israphel', 'Lumiel', 'Marchutan', 'Triniel', 'Zikel'] },
    { id: 'latam', label: 'Latin America', tz: 'America/Sao_Paulo',
      elyos: ['Ariel', 'Kaisinel', 'Nezekan', 'Siel', 'Vaizel', 'Yustiel'],
      asmodian: ['Azphel', 'Israphel', 'Lumiel', 'Marchutan', 'Triniel', 'Zikel'] },
    { id: 'asia', label: 'Asia', tz: 'Asia/Seoul',
      elyos: ['Ariel', 'Fregion', 'Hithanya', 'Kaisinel', 'Meslamtaeda', 'Nania', 'Nezekan', 'Siel', 'Vaizel', 'Yustiel'],
      asmodian: ['Azphel', 'Beritra', 'Ereshkigal', 'Hadala', 'Israphel', 'Lumiel', 'Marchutan', 'Nemon', 'Triniel', 'Zikel'] },
  ];

  const STATUS_URL = 'https://aion2helper.com/status/';
  const byId = (id) => REGIONS.find((r) => r.id === id);
  const byTz = (tz) => REGIONS.find((r) => r.tz === tz);
  /** 'Elyos' or 'Asmodian' for a server name in a region, or '' when unknown. */
  function factionOf(regionId, name) {
    const r = byId(regionId);
    if (!r) return '';
    return r.elyos.includes(name) ? 'Elyos' : r.asmodian.includes(name) ? 'Asmodian' : '';
  }

  const api = { REGIONS, STATUS_URL, byId, byTz, factionOf };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.AionServers = api;
})(typeof window !== 'undefined' ? window : globalThis);
