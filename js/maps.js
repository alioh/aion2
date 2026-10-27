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

  const api = { BASE, FACTIONS, LAYERS, byId, baseUrl, layerUrl, search };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.AionMaps = api;
})(typeof window !== 'undefined' ? window : globalThis);
