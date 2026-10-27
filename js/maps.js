/* Map layer index for the Map tab: every layer below was checked to exist as a category page on
 * interactivemap.app (the page title lists its marker count). Nothing is copied from the site; we only link/frame it.
 * `slugs` maps a faction map to the URL slug, so a layer can exist on one map only. */
(function (root) {
  'use strict';

  const BASE = 'https://interactivemap.app/aion2/maps/';
  const FACTIONS = { verteron: 'Verteron (Elyos)', altgard: 'Altgard (Asmodian)' };

  const both = (slug) => ({ verteron: slug, altgard: slug });
  const V = (slug) => ({ verteron: slug });
  const A = (slug) => ({ altgard: slug });

  const LAYERS = [
    { id: 'stronghold', label: 'Strongholds', kw: 'stronghold strongholds fortress belt', slugs: both('stronghold') },
    { id: 'empyrean-trace', label: 'Empyrean Traces (for the Monolith)', kw: 'empyrean trace traces monolith amulet', slugs: V('empyrean-trace') },
    { id: 'dungeon', label: 'Dungeons', kw: 'dungeon dungeons expedition instance entrance krao cave draupnir', slugs: V('dungeon') },
    { id: 'sealed-dungeon', label: 'Sealed Dungeons', kw: 'sealed dungeon solo', slugs: both('sealed-dungeon') },
    { id: 'hidden-cube', label: 'Hidden Cubes', kw: 'hidden cube cubes chest key', slugs: both('hidden-cube') },
    { id: 'rift', label: 'Spacetime Rifts', kw: 'spacetime rift rifts portal', slugs: both('rift') },
    { id: 'boss', label: 'Bosses', kw: 'boss bosses field boss', slugs: both('boss') },
    { id: 'named-bosses', label: 'Named bosses', kw: 'named boss bosses elite', slugs: both('named-bosses') },
    { id: 'story-quests', label: 'Story quests', kw: 'story quest quests main', slugs: both('story-quests') },
    { id: 'regional-quest', label: 'Regional quests', kw: 'regional district quest quests', slugs: both('regional-quest') },
    { id: 'kibelisk', label: 'Kibelisk', kw: 'kibelisk', slugs: both('kibelisk') },
    { id: 'updraft', label: 'Updrafts', kw: 'updraft updrafts wind glide flight', slugs: both('updraft') },
    { id: 'odyle', label: 'Odyle (gathering nodes)', kw: 'odyle energy gathering node nodes extraction', slugs: both('odyle') },
    { id: 'orichalcum-ore', label: 'Orichalcum Ore', kw: 'orichalcum orihalum ore mining metal resource gathering', slugs: both('orihalum-ore') },
    { id: 'diamond-gemstone', label: 'Diamond Gemstone', kw: 'diamond gem gems gemstone gemstones jewel resource gathering', slugs: both('diamond-gemstone') },
    { id: 'sapphire-gemstone', label: 'Sapphire Gemstone', kw: 'sapphire gem gems gemstone gemstones jewel resource gathering', slugs: both('sapphire-gemstone') },
    { id: 'ruby-gemstone', label: 'Ruby Gemstone', kw: 'ruby gem gems gemstone gemstones jewel resource gathering', slugs: both('ruby-gemstone') },
    { id: 'yggdrasil-log', label: 'Yggdrasil Log', kw: 'yggdrasil log logs wood tree resource gathering', slugs: V('yggdrasil-log') },
    { id: 'aria', label: 'Aria (resource)', kw: 'aria resource gathering', slugs: V('aria') },
    { id: 'targena', label: 'Targena (resource)', kw: 'targena resource gathering', slugs: V('targena') },
    { id: 'coriolus', label: 'Coriolus (resource)', kw: 'coriolus resource gathering', slugs: V('coriolus') },
    { id: 'kukuru', label: 'Kukuru (resource)', kw: 'kukuru resource gathering', slugs: V('kukuru') },
    { id: 'mela', label: 'Mela (resource)', kw: 'mela resource gathering', slugs: V('mela') },
    { id: 'inina', label: 'Inina (resource)', kw: 'inina resource gathering', slugs: V('inina') },
    { id: 'cypri', label: 'Cypri (resource)', kw: 'cypri resource gathering', slugs: V('cypri') },
    { id: 'blacksmithing', label: 'Blacksmithing stations', kw: 'blacksmithing blacksmith crafting craft station weapons', slugs: A('svc-blacksmithing-altgard') },
    { id: 'armorsmithing', label: 'Armorsmithing stations', kw: 'armorsmithing armor crafting craft station', slugs: A('svc-armorsmithing-altgard') },
    { id: 'handicrafting', label: 'Handicrafting stations', kw: 'handicrafting handicraft crafting craft station accessories', slugs: A('svc-handicrafting-altgard') },
    { id: 'alchemy', label: 'Alchemy stations', kw: 'alchemy alchemist crafting craft station potions', slugs: A('svc-alchemy-altgard') },
    { id: 'cooking', label: 'Cooking stations', kw: 'cooking cook crafting craft station food', slugs: A('svc-cooking-altgard') },
  ];

  const byId = Object.fromEntries(LAYERS.map((l) => [l.id, l]));

  function baseUrl(faction) { return BASE + (FACTIONS[faction] ? faction : 'verteron'); }

  /** URL of a layer on a faction map, or null when that map has no such layer. */
  function layerUrl(layer, faction) {
    const slug = layer && layer.slugs[faction];
    return slug ? baseUrl(faction) + '/' + slug : null;
  }

  function norm(t) {
    return t.length > 3 && t.endsWith('s') ? t.slice(0, -1) : t;
  }

  /** Layers whose label/keywords contain every typed word (plural-insensitive). */
  function search(query) {
    const tokens = String(query || '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean).map(norm);
    if (!tokens.length) return [];
    return LAYERS.filter((l) => {
      const hay = (l.label + ' ' + l.kw).toLowerCase();
      return tokens.every((t) => hay.includes(t));
    });
  }

  // Own simple line icons (24x24, drawn for this project; no game or map artwork is used).
  const SHAPES = {
    fire: '<path d="M12 3c1 3 4 4.5 4 8a4 4 0 0 1-8 0c0-1.5.6-2.4 1.4-3.4.3 1.1 1 1.7 1.8 1.9C11 7.5 11.2 5 12 3z" fill="currentColor" stroke="none"/><path d="M4 16l16 4M4 20l16-4"/>',
    crystal: '<path d="M12 3l6 7-6 11-6-11z"/><path d="M6 10h12"/>',
    door: '<path d="M5 21V10a7 7 0 0 1 14 0v11z"/><path d="M9 21v-6a3 3 0 0 1 6 0v6"/>',
    sealed: '<path d="M5 21V10a7 7 0 0 1 14 0v11z"/><rect x="9.5" y="12" width="5" height="5" rx="1"/><path d="M10.5 12v-1.5a1.5 1.5 0 0 1 3 0V12"/>',
    cube: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12l8-4.5M12 12L4 7.5M12 12v9"/>',
    portal: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
    skull: '<path d="M12 3a7 7 0 0 0-7 7c0 2.5 1.3 4 3 5v3h8v-3c1.7-1 3-2.5 3-5a7 7 0 0 0-7-7z"/><circle cx="9.5" cy="10.5" r="1.3" fill="currentColor"/><circle cx="14.5" cy="10.5" r="1.3" fill="currentColor"/><path d="M10.5 18v2M13.5 18v2"/>',
    crown: '<path d="M3 18L4 8l5 4 3-7 3 7 5-4 1 10z"/>',
    alert: '<circle cx="12" cy="12" r="9"/><path d="M12 7v6"/><circle cx="12" cy="16.5" r="1" fill="currentColor"/>',
    flag: '<path d="M6 21V4M6 5h11l-2.5 3.5L17 12H6"/>',
    obelisk: '<path d="M9 21l1-14 2-4 2 4 1 14z"/><path d="M8 21h8"/>',
    updraft: '<path d="M7 11l5-5 5 5M7 18l5-5 5 5"/>',
    drop: '<path d="M12 3c3.5 4.5 6 7.5 6 11a6 6 0 0 1-12 0c0-3.5 2.5-6.5 6-11z"/><path d="M9.5 15a2.5 2.5 0 0 0 2.5 2.5"/>',
    ore: '<path d="M4 17l3-8 5-4 6 3 2 7-5 5H8z"/><path d="M7 9l5 3 6-3M12 12v8"/>',
    gem: '<path d="M7 4h10l4 5-9 12L3 9z"/><path d="M3 9h18M9 4l-1 5 4 12M15 4l1 5-4 12"/>',
    log: '<rect x="3" y="8" width="18" height="9" rx="2"/><ellipse cx="18" cy="12.5" rx="2" ry="4.5"/><path d="M6 11h6M6 14h4"/>',
    leaf: '<path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15z"/><path d="M5 19c3-5 6-8 10-10"/>',
    anvil: '<path d="M3 8h14c0 2-1.5 4-4 4h-3l-1 3h6v4H8v-4l1-3c-2 0-4-1-6-4z"/>',
    shield: '<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/>',
    ring: '<circle cx="12" cy="15" r="6"/><path d="M9 5h6l2 3-5 2-5-2z"/>',
    flask: '<path d="M9 3h6M10 3v6L5 19a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-10V3"/><path d="M8 15h8"/>',
    pot: '<path d="M4 10h16v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M3 10h18M8 6c0-2 2-1 2-3M13 6c0-2 2-1 2-3"/>',
  };
  const LOOK = {
    'stronghold': ['fire', '#e0a93a'], 'empyrean-trace': ['crystal', '#8fd6ff'], 'dungeon': ['door', '#b59cff'],
    'sealed-dungeon': ['sealed', '#b59cff'], 'hidden-cube': ['cube', '#ffb86b'], 'rift': ['portal', '#7ee0c3'],
    'boss': ['skull', '#ff7a85'], 'named-bosses': ['crown', '#ff9d6b'], 'story-quests': ['alert', '#f2d36b'],
    'regional-quest': ['flag', '#f2d36b'], 'kibelisk': ['obelisk', '#b0b6d6'], 'updraft': ['updraft', '#7ee0c3'],
    'odyle': ['drop', '#7ee0c3'], 'orichalcum-ore': ['ore', '#c0a27a'], 'diamond-gemstone': ['gem', '#bfe9ff'],
    'sapphire-gemstone': ['gem', '#6f9bff'], 'ruby-gemstone': ['gem', '#ff6b81'], 'yggdrasil-log': ['log', '#c58b5a'],
    'aria': ['leaf', '#8fd98f'], 'targena': ['leaf', '#8fd98f'], 'coriolus': ['leaf', '#8fd98f'], 'kukuru': ['leaf', '#8fd98f'],
    'mela': ['leaf', '#8fd98f'], 'inina': ['leaf', '#8fd98f'], 'cypri': ['leaf', '#8fd98f'],
    'blacksmithing': ['anvil', '#e0a93a'], 'armorsmithing': ['shield', '#e0a93a'], 'handicrafting': ['ring', '#e0a93a'],
    'alchemy': ['flask', '#e0a93a'], 'cooking': ['pot', '#e0a93a'],
  };

  /** Inline SVG markup for a layer id ('' if unknown). Static, trusted strings only. */
  function iconSvg(id) {
    const look = LOOK[id];
    if (!look) return '';
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" style="color:' + look[1] + '">' + SHAPES[look[0]] + '</svg>';
  }

  const api = { BASE, FACTIONS, LAYERS, byId, baseUrl, layerUrl, search, iconSvg, LOOK };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.AionMaps = api;
})(typeof window !== 'undefined' ? window : globalThis);
