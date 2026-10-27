(function () {
  'use strict';

  const T = window.AionTime;
  const S = window.AionStore;
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const $ = (id) => document.getElementById(id);

  // Debug hook for testing resets: set window.__AION_NOW = <epoch ms> in the console.
  const nowMs = () => (typeof window.__AION_NOW === 'number' ? window.__AION_NOW : Date.now());

  function h(tag, props, ...kids) {
    const el = document.createElement(tag);
    for (const k in props || {}) {
      const v = props[k];
      if (v === false || v == null) continue;
      if (k === 'class') el.className = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid);
    return el;
  }

  // ---------- state ----------
  let state;
  let saveError = false;

  function load() {
    try {
      const raw = localStorage.getItem(S.STORAGE_KEY);
      if (raw) return S.normalize(JSON.parse(raw), window.SEED_TASKS, window.SEED_RESOURCES);
    } catch (e) { /* fall through to defaults */ }
    return S.defaultState(window.SEED_TASKS, window.SEED_RESOURCES);
  }

  function save() {
    try { localStorage.setItem(S.STORAGE_KEY, JSON.stringify(state)); saveError = false; }
    catch (e) { saveError = true; }
  }

  state = load();
  S.syncSeed(state, window.SEED_TASKS, window.SEED_REV, window.SEED_RESOURCES);
  save();

  const activeChar = () => state.characters.find((c) => c.id === state.activeCharId) || state.characters[0];
  // The reset moment is fixed in UTC; the chosen timezone only changes how times are displayed.
  const cfg = () => ({ resetTime: state.settings.resetTime, weeklyDay: state.settings.weeklyDay, timezone: 'UTC' });
  const key = (type) => T.periodKey(type, nowMs(), cfg());
  const owner = (task) => (task.scope === 'server' ? S.SERVER_KEY : activeChar().id);
  const isDone = (task) => ((state.completions[owner(task)] || {})[task.id]) === key(task.resetType);

  function setDone(task, done) {
    const cid = owner(task);
    const m = (state.completions[cid] = state.completions[cid] || {});
    if (done) m[task.id] = key(task.resetType); else delete m[task.id];
    save();
    render();
  }

  // ---------- theme ----------
  function applyTheme() {
    document.documentElement.dataset.theme = state.settings.theme;
    $('themeBtn').textContent = state.settings.theme === 'dark' ? '🌙' : '☀️';
  }

  // ---------- filtering ----------
  function matches(task, q) {
    if (!q) return true;
    const hay = (task.title + ' ' + task.description + ' ' + task.location).toLowerCase();
    return hay.includes(q);
  }

  function visibleTasks(manage) {
    const q = $('search').value.trim().toLowerCase();
    const { category, status, hideCompleted } = state.ui;
    return state.tasks.filter((t) => {
      if (t.hidden && !manage) return false;
      if (category !== 'all' && t.category !== category) return false;
      if (!matches(t, q)) return false;
      const done = isDone(t);
      if (status === 'todo' && done) return false;
      if (status === 'done' && !done) return false;
      if (hideCompleted && done) return false;
      return true;
    });
  }

  // ---------- render ----------
  function categories() {
    return [...new Set(state.tasks.map((t) => t.category))].sort((a, b) => a.localeCompare(b));
  }

  function renderControls() {
    const sel = $('charSelect');
    sel.replaceChildren(...state.characters.map((c) => h('option', { value: c.id }, c.name)));
    sel.value = activeChar().id;

    const cats = categories();
    if (state.ui.category !== 'all' && !cats.includes(state.ui.category)) state.ui.category = 'all';
    $('fCategory').replaceChildren(h('option', { value: 'all' }, 'All categories'),
      ...cats.map((c) => h('option', { value: c }, c)));
    $('fCategory').value = state.ui.category;
    $('fStatus').value = state.ui.status;
    $('fHide').checked = state.ui.hideCompleted;
    $('catList').replaceChildren(...cats.map((c) => h('option', { value: c })));
  }

  function renderProgress() {
    const live = state.tasks.filter((t) => !t.hidden);
    for (const type of ['daily', 'weekly', 'once']) {
      const group = live.filter((t) => t.resetType === type);
      const done = group.filter(isDone).length;
      const pct = group.length ? Math.round((done / group.length) * 100) : 0;
      $(type + 'Txt').textContent = done + ' of ' + group.length + ' done';
      $(type + 'Bar').style.width = pct + '%';
      $(type + 'Bar').parentElement.setAttribute('role', 'progressbar');
      $(type + 'Bar').parentElement.setAttribute('aria-valuenow', pct);
      $(type + 'Bar').parentElement.setAttribute('aria-label', type + ' progress');
    }
    const chips = categories().map((cat) => {
      const g = live.filter((t) => t.category === cat);
      if (!g.length) return null;
      const d = g.filter(isDone).length;
      return h('span', { class: 'chip' + (d === g.length ? ' full' : '') }, cat + ' ', h('b', {}, d + '/' + g.length));
    });
    $('catChips').replaceChildren(...chips.filter(Boolean));
  }

  function taskCard(task, manage) {
    const done = isDone(task);
    const idx = state.tasks.indexOf(task);
    const sameType = state.tasks.filter((t) => t.resetType === task.resetType);
    const pos = sameType.indexOf(task);

    const check = h('input', {
      type: 'checkbox', checked: done, 'aria-label': 'Mark "' + task.title + '" done',
      onchange: (e) => setDone(task, e.target.checked),
    });
    check.checked = done;

    const badges = h('div', { class: 'badges' },
      h('span', { class: 'badge cat' }, task.category),
      !task.verified && h('span', { class: 'badge warn', title: task.source ? 'Source note: ' + task.source : 'Not confirmed against a source' }, 'unverified'),
      task.scope === 'server' && h('span', { class: 'badge', title: 'This limit is shared by all your characters on the server' }, 'shared'),
      task.resetType === 'once' && h('span', { class: 'badge' }, 'one-time'),
      task.hidden && h('span', { class: 'badge' }, 'hidden'));

    const loc = task.location
      ? h('p', { class: 'loc' }, '📍 ', task.location)
      : h('p', { class: 'loc missing' }, '📍 location not confirmed');

    const guide = task.guideUrl
      ? h('a', { class: 'btn guide', href: task.guideUrl, target: '_blank', rel: 'noopener noreferrer' }, 'Guide ↗')
      : h('span', { class: 'btn guide disabled', 'aria-disabled': 'true' }, 'No guide');

    const extra = task.links.length > 0 && h('div', { class: 'links' },
      ...task.links.map((l) => h('a', { class: 'linkchip', href: l.url, target: '_blank', rel: 'noopener noreferrer' },
        /youtu/.test(l.url) ? '▶ ' : '🔗 ', l.label)));

    const layer = task.mapLayer && M_.byId[task.mapLayer];
    const mapBtn = layer && h('button', { class: 'btn', type: 'button', title: 'Show on the interactive map',
      onclick: () => { setView('map'); $('mapFaction').value = state.ui.mapFaction; openLayer(layer, state.ui.mapFaction); window.scrollTo(0, 0); } },
      '\uD83D\uDDFA ' + layer.label.replace(/ \(.*\)$/, ''));

    const tools = manage && h('div', { class: 'tools' },
      h('button', { class: 'btn sm', type: 'button', disabled: pos === 0, 'aria-label': 'Move up', onclick: () => move(task, -1) }, '↑'),
      h('button', { class: 'btn sm', type: 'button', disabled: pos === sameType.length - 1, 'aria-label': 'Move down', onclick: () => move(task, 1) }, '↓'),
      h('button', { class: 'btn sm', type: 'button', onclick: () => openTask(task) }, 'Edit'),
      h('button', { class: 'btn sm', type: 'button', onclick: () => { task.hidden = !task.hidden; save(); render(); } }, task.hidden ? 'Unhide' : 'Hide'),
      h('button', { class: 'btn sm danger', type: 'button', onclick: () => delTask(task) }, 'Delete'));

    const isOpen = manage || openIds.has(task.id); // manage mode shows everything so the tools are reachable
    const body = h('div', { class: 'tbody', hidden: !isOpen },
      task.description && h('p', { class: 'desc' }, task.description),
      loc,
      h('div', { class: 'row-actions' }, guide, mapBtn, tools),
      extra,
      stepsSection(task),
      videoSection(task));
    const toggle = h('button', { class: 'ttitle', type: 'button', 'aria-expanded': String(isOpen) },
      h('span', { class: 'chev', 'aria-hidden': 'true' }, '▶'), h('span', { class: 'ttext' }, task.title));
    const card = h('article', { class: 'task' + (isOpen ? ' open' : '') + (done ? ' done' : '') + (task.hidden ? ' is-hidden' : ''), 'data-id': task.id, 'data-idx': idx },
      h('div', { class: 'thead' }, h('label', { class: 'tick' }, check), toggle, badges), body);
    toggle.addEventListener('click', () => {
      const open = !card.classList.contains('open');
      card.classList.toggle('open', open);
      body.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
      if (open) openIds.add(task.id); else openIds.delete(task.id);
      updateToggleAll();
    });
    return card;
  }

  const openIds = new Set(); // expanded cards survive re-renders (ticking a box re-renders the list)

  function updateToggleAll() {
    const vis = visibleTasks($('manage').checked);
    $('toggleAll').textContent = vis.length && vis.every((t) => openIds.has(t.id)) ? 'Collapse all' : 'Expand all';
  }

  function stepsSection(task) {
    if (!task.steps.length) return null;
    return h('details', { class: 'steps' }, h('summary', {}, 'How to complete (' + task.steps.length + ' steps)'),
      h('ol', {}, ...task.steps.map((x) => h('li', {}, x))));
  }

  function videoSection(task) {
    if (!task.videos.length) return null;
    const det = h('details', { class: 'vids-wrap' }, h('summary', {}, 'Video guides (' + task.videos.length + ')'));
    let built = false;
    det.addEventListener('toggle', () => { // build iframes lazily so closed cards load nothing from YouTube
      if (!det.open || built) return;
      built = true;
      det.append(carousel(task.videos));
    });
    return det;
  }

  function carousel(videos) {
    const track = h('div', { class: 'vids', tabindex: '0', 'aria-label': 'Videos, scroll sideways' },
      ...videos.map((v) => {
        const id = S.youtubeId(v.url);
        return h('figure', { class: 'vid' },
          id ? h('iframe', {
            src: 'https://www.youtube-nocookie.com/embed/' + id, title: v.label, loading: 'lazy', allowfullscreen: true,
            allow: 'accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share',
            referrerpolicy: 'strict-origin-when-cross-origin',
          }) : h('a', { class: 'vid-link', href: v.url, target: '_blank', rel: 'noopener noreferrer' }, 'Open video in a new tab'),
          h('figcaption', {}, v.label, ' ', id && h('a', { href: v.url, target: '_blank', rel: 'noopener noreferrer' }, '\u2197')));
      }));
    const nav = (dir, label, txt) => h('button', { class: 'btn sm car', type: 'button', 'aria-label': label,
      onclick: () => track.scrollBy({ left: dir * track.clientWidth * 0.9, behavior: 'smooth' }) }, txt);
    return h('div', { class: 'carousel' }, videos.length > 1 && nav(-1, 'Previous video', '\u2039'), track, videos.length > 1 && nav(1, 'Next video', '\u203A'));
  }

  function renderList() {
    const manage = $('manage').checked;
    const tasks = visibleTasks(manage);
    const root = $('list');
    root.replaceChildren();
    for (const [type, label] of [['daily', 'Daily tasks'], ['weekly', 'Weekly tasks'], ['once', 'One-time progression']]) {
      const g = tasks.filter((t) => t.resetType === type);
      if (!g.length) continue;
      root.append(h('section', { class: 'group' }, h('h2', {}, label), ...g.map((t) => taskCard(t, manage))));
    }
    if (!tasks.length) root.append(h('p', { class: 'empty' }, 'No tasks match. Clear the filters or search.'));
    updateToggleAll();
  }

  /** Describes the reset moment in the display timezone, e.g. "10:00 Asia/Riyadh (07:00 UTC), weekly on Wednesday". */
  function resetSummary() {
    const s = state.settings;
    const hhmm = (p) => String(p.h).padStart(2, '0') + ':' + String(p.mi).padStart(2, '0');
    const daily = T.partsIn(T.nextReset('daily', nowMs(), cfg()), s.timezone);
    const weekly = T.partsIn(T.nextReset('weekly', nowMs(), cfg()), s.timezone);
    const wd = DAYS[new Date(Date.UTC(weekly.y, weekly.mo - 1, weekly.d)).getUTCDay()];
    const utc = s.resetTime.padStart(5, '0') + ' UTC';
    return 'Resets daily at ' + hhmm(daily) + ' ' + s.timezone + (s.timezone === 'UTC' ? '' : ' (' + utc + ')') +
      ', weekly on ' + wd + '.';
  }

  function renderNote() {
    $('resetNote').replaceChildren(resetSummary());
    if (saveError) $('resetNote').append(h('br'), '⚠ Could not save to browser storage. Export a backup.');
  }

  function render() {
    renderControls();
    renderProgress();
    renderList();
    renderNote();
    tick();
  }

  // ---------- countdown ----------
  let lastKeys = '';
  function tick() {
    const n = nowMs();
    $('dailyCd').textContent = T.formatCountdown(T.nextReset('daily', n, cfg()) - n);
    $('weeklyCd').textContent = T.formatCountdown(T.nextReset('weekly', n, cfg()) - n);
    const k = key('daily') + '|' + key('weekly');
    if (lastKeys && k !== lastKeys) { lastKeys = k; render(); return; }
    lastKeys = k;
  }

  // ---------- task management ----------
  function move(task, dir) {
    const same = state.tasks.filter((t) => t.resetType === task.resetType);
    const other = same[same.indexOf(task) + dir];
    if (!other) return;
    const a = state.tasks.indexOf(task), b = state.tasks.indexOf(other);
    [state.tasks[a], state.tasks[b]] = [state.tasks[b], state.tasks[a]];
    save(); render();
  }

  function delTask(task) {
    if (!confirm('Delete "' + task.title + '"? Its completion history is removed too.')) return;
    state.tasks = state.tasks.filter((t) => t !== task);
    for (const cid in state.completions) delete state.completions[cid][task.id];
    save(); render();
  }

  let editing = null;
  function openTask(task) {
    editing = task || null;
    const f = $('taskForm');
    $('taskDlgTitle').textContent = task ? 'Edit task' : 'Add task';
    const t = task || { title: '', description: '', location: '', guideUrl: '', category: '', resetType: 'daily', source: '', verified: false };
    for (const k of ['title', 'description', 'location', 'guideUrl', 'category', 'resetType', 'source']) f.elements[k].value = t[k] || '';
    f.elements.links.value = S.linksToText(t.links);
    f.elements.videos.value = S.linksToText(t.videos);
    f.elements.steps.value = (t.steps || []).join('\n');
    f.elements.scope.value = t.scope || 'character';
    f.elements.mapLayer.value = t.mapLayer || '';
    f.elements.verified.checked = !!t.verified;
    $('taskDlg').showModal();
  }

  $('taskForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target.elements;
    const url = f.guideUrl.value.trim();
    if (url && !S.safeUrl(url)) { f.guideUrl.setCustomValidity('Enter a full http(s) URL'); f.guideUrl.reportValidity(); f.guideUrl.setCustomValidity(''); return; }
    const data = {
      title: f.title.value, description: f.description.value, location: f.location.value, guideUrl: url,
      category: f.category.value, resetType: f.resetType.value, source: f.source.value, verified: f.verified.checked, links: S.parseLinks(f.links.value),
      videos: S.parseLinks(f.videos.value), steps: f.steps.value.split(/\r?\n/), scope: f.scope.value, mapLayer: f.mapLayer.value,
    };
    if (editing) Object.assign(editing, S.cleanTask({ ...editing, ...data }));
    else state.tasks.push(S.cleanTask({ ...data, id: S.uid('c'), custom: true }, true));
    save(); $('taskDlg').close(); render();
  });

  // ---------- characters ----------
  function renderChars() {
    $('charList').replaceChildren(...state.characters.map((c) => h('li', {},
      h('span', { class: 'cname' }, c.name),
      h('button', { class: 'btn sm', type: 'button', onclick: () => renameChar(c) }, 'Rename'),
      h('button', { class: 'btn sm danger', type: 'button', disabled: state.characters.length < 2, onclick: () => delChar(c) }, 'Delete'))));
  }
  function renameChar(c) {
    const name = prompt('Rename character', c.name);
    if (name && name.trim()) { c.name = name.trim().slice(0, 60); save(); renderChars(); render(); }
  }
  function delChar(c) {
    if (state.characters.length < 2) return;
    if (!confirm('Delete "' + c.name + '" and all its progress?')) return;
    state.characters = state.characters.filter((x) => x !== c);
    delete state.completions[c.id];
    if (state.activeCharId === c.id) state.activeCharId = state.characters[0].id;
    save(); renderChars(); render();
  }
  $('charAddForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('charNew').value.trim();
    if (!name) return;
    const c = { id: S.uid('ch'), name: name.slice(0, 60) };
    state.characters.push(c);
    state.activeCharId = c.id;
    $('charNew').value = '';
    save(); renderChars(); render();
  });
  $('charsBtn').addEventListener('click', () => { renderChars(); $('charDlg').showModal(); });
  $('charSelect').addEventListener('change', (e) => { state.activeCharId = e.target.value; save(); render(); });

  // ---------- resources ----------
  function renderResources() {
    $('resList').replaceChildren(...state.resources.map((r, i) => h('li', {},
      h('a', { href: r.url, target: '_blank', rel: 'noopener noreferrer' }, (/youtu/.test(r.url) ? '▶ ' : '🔗 ') + r.label),
      h('button', { class: 'btn sm danger', type: 'button', 'aria-label': 'Remove ' + r.label,
        onclick: () => { state.resources.splice(i, 1); save(); renderResources(); } }, '✕'))));
    if (!state.resources.length) $('resList').append(h('li', { class: 'note' }, 'No resources yet.'));
  }
  $('resBtn').addEventListener('click', () => { renderResources(); $('resDlg').showModal(); });
  $('resAddForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const url = S.safeUrl($('resUrl').value);
    if (!url) { $('resUrl').setCustomValidity('Enter a full http(s) URL'); $('resUrl').reportValidity(); $('resUrl').setCustomValidity(''); return; }
    state.resources.push(S.cleanLinks([{ label: $('resLabel').value, url }])[0]);
    $('resLabel').value = ''; $('resUrl').value = '';
    save(); renderResources();
  });
  $('resRestore').addEventListener('click', () => {
    if (!confirm('Add back any default resources you removed?')) return;
    const have = new Set(state.resources.map((r) => r.url));
    state.resources.push(...S.cleanLinks(window.SEED_RESOURCES, 200).filter((r) => !have.has(r.url)));
    save(); renderResources();
  });

  // ---------- settings ----------
  function timezones() {
    let list = [];
    try { list = Intl.supportedValuesOf('timeZone'); } catch (e) { /* older browsers */ }
    const local = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return [...new Set(['UTC', 'Asia/Riyadh', 'Asia/Seoul', local, ...list, state.settings.timezone])];
  }

  function openSettings() {
    const s = state.settings;
    $('sTime').value = s.resetTime.padStart(5, '0');
    $('sDay').replaceChildren(...DAYS.map((d, i) => h('option', { value: i }, d)));
    $('sDay').value = s.weeklyDay;
    const local = Intl.DateTimeFormat().resolvedOptions().timeZone;
    $('sTz').replaceChildren(...timezones().map((z) => h('option', { value: z }, z === local ? z + ' (this device)' : z)));
    $('sTz').value = s.timezone;
    $('sResetEdit').hidden = true;      // the reset moment stays locked until the button is pressed
    $('sUnlock').hidden = false;
    $('sResetInfo').textContent = resetSummary();
    $('sMsg').textContent = '';
    $('settingsDlg').showModal();
  }
  function applySettings() {
    const s = state.settings;
    if ($('sTime').value) s.resetTime = $('sTime').value;
    s.weeklyDay = +$('sDay').value;
    s.timezone = $('sTz').value;
    s.resetConfirmed = true;
    save(); render();
    $('sResetInfo').textContent = resetSummary();
  }
  for (const id of ['sTime', 'sDay', 'sTz']) $(id).addEventListener('change', applySettings);
  $('sUnlock').addEventListener('click', () => { $('sResetEdit').hidden = false; $('sUnlock').hidden = true; });
  $('sRestoreReset').addEventListener('click', () => {
    $('sTime').value = '07:00'; $('sDay').value = 3; applySettings();
  });
  $('settingsBtn').addEventListener('click', openSettings);
  $('themeBtn').addEventListener('click', () => {
    state.settings.theme = state.settings.theme === 'dark' ? 'light' : 'dark';
    save(); applyTheme();
  });

  $('exportBtn').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = h('a', { href: URL.createObjectURL(blob), download: 'aion2-tracker-' + new Date().toISOString().slice(0, 10) + '.json' });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    $('sMsg').textContent = 'Exported.';
  });
  $('importBtn').addEventListener('click', () => $('importFile').click());
  $('importFile').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    try {
      const next = S.normalize(JSON.parse(await file.text()), window.SEED_TASKS, window.SEED_RESOURCES);
      if (!confirm('Replace ALL current data with the contents of "' + file.name + '"?')) return;
      state = S.syncSeed(next, window.SEED_TASKS, window.SEED_REV, window.SEED_RESOURCES); save(); applyTheme(); openSettings();
      $('sMsg').textContent = 'Imported ' + state.characters.length + ' character(s) and ' + state.tasks.length + ' task(s).';
      render();
    } catch (err) { $('sMsg').textContent = 'Import failed: ' + err.message; }
  });
  $('restoreSeed').addEventListener('click', () => {
    if (!confirm('Restore the default tasks? Edits to default tasks are lost, hidden ones return, and order is reset. Your own custom tasks are kept.')) return;
    state.tasks = [...S.seedTasks(window.SEED_TASKS), ...state.tasks.filter((t) => t.custom)];
    state.seedRev = window.SEED_REV;
    save(); render(); $('sMsg').textContent = 'Default tasks restored.';
  });
  $('wipeBtn').addEventListener('click', () => {
    if (!confirm('Erase ALL data (characters, progress, tasks, settings)?')) return;
    state = S.defaultState(window.SEED_TASKS, window.SEED_RESOURCES); state.seedRev = window.SEED_REV; save(); applyTheme(); openSettings(); render();
  });

  // ---------- map view ----------
  // Third-party maps shown in a frame (not copied). embed:false = the site refuses to be framed.
  const M_ = window.AionMaps;
  const MAPS = [
    { label: 'interactivemap.app: Verteron (Elyos)', url: 'https://interactivemap.app/aion2/maps/verteron', embed: true },
    { label: 'interactivemap.app: Altgard (Asmodian)', url: 'https://interactivemap.app/aion2/maps/altgard', embed: true },
    { label: 'QuestLog map', url: 'https://questlog.gg/aion-2/en/map', embed: true },
    { label: 'aion2t.com map', url: 'https://aion2t.com/map', embed: true },
    { label: 'aion2maps.com 3D map (opens in a tab)', url: 'https://aion2maps.com/', embed: false },
    { label: 'aion2hub maps (opens in a tab)', url: 'https://aion2hub.com/maps', embed: false },
  ];
  let mapBuilt = false;
  let currentMap = MAPS[0];

  function loadMap(m) {
    currentMap = m;
    $('mapOpen').href = m.url;
    const wrap = $('mapFrameWrap');
    if (!m.embed) {
      $('mapNote').textContent = 'This site does not allow being shown inside other pages. Use the button to open it.';
      wrap.replaceChildren();
      return;
    }
    $('mapNote').textContent = m.note || 'If the map stays blank, the site may be blocking embedding: use "Open in new tab".';
    wrap.replaceChildren(h('iframe', { src: m.url, title: m.label, loading: 'lazy', referrerpolicy: 'no-referrer',
      sandbox: 'allow-scripts allow-same-origin allow-popups allow-forms' }));
  }
  function showMap() { loadMap(MAPS[+$('mapSel').value] || MAPS[0]); }

  /** Show one interactivemap.app layer for a faction. Falls back to the faction's base map if the layer is missing there. */
  function openLayer(layer, faction) {
    const url = M_.layerUrl(layer, faction);
    const other = Object.keys(layer.slugs).map((f) => M_.FACTIONS[f]).join(' / ');
    const m = url
      ? { label: layer.label + ' - ' + M_.FACTIONS[faction], url, embed: true,
          note: 'Showing: ' + layer.label + ' on ' + M_.FACTIONS[faction] + '. Use the map\'s own sidebar to toggle other layers.' }
      : { label: layer.label, url: M_.baseUrl(faction), embed: true,
          note: layer.label + ' has no layer on ' + M_.FACTIONS[faction] + ' (only on ' + other + '). Showing the base map: use its sidebar to look for it.' };
    let opt = [...$('mapSel').options].find((o) => o.value === 'found');
    if (!opt) { opt = h('option', { value: 'found' }); $('mapSel').append(opt); }
    opt.textContent = 'Search: ' + m.label;
    $('mapSel').value = 'found';
    loadMap(m);
  }

  function renderMapResults() {
    const q = $('mapQ').value;
    const box = $('mapResults');
    const faction = $('mapFaction').value;
    const hits = M_.search(q);
    if (!q.trim()) { box.replaceChildren(); return; }
    if (!hits.length) {
      box.replaceChildren(h('span', { class: 'note' }, 'No layer matches "' + q.trim() + '". Try the other maps in the list above, or the site\'s own search.'));
      return;
    }
    box.replaceChildren(...hits.map((l) => {
      const ok = !!M_.layerUrl(l, faction);
      return h('button', { class: 'chip pick' + (ok ? '' : ' other'), type: 'button',
        title: ok ? 'Show on the map' : 'Not on this faction map: opens the base map',
        onclick: () => openLayer(l, faction) },
        l.label, ok ? '' : ' (' + Object.keys(l.slugs).map((f) => M_.FACTIONS[f].split(' ')[0]).join('/') + ' only)');
    }));
    if (hits.length === 1) openLayer(hits[0], faction);
  }
  function setView(v) {
    const map = v === 'map';
    $('trackerView').hidden = map;
    $('mapView').hidden = !map;
    $('tabTracker').classList.toggle('active', !map);
    $('tabMap').classList.toggle('active', map);
    if (map && !mapBuilt) {
      mapBuilt = true;
      $('mapSel').replaceChildren(...MAPS.map((m, i) => h('option', { value: i }, m.label)));
      $('mapFaction').value = state.ui.mapFaction;
      showMap();
    }
  }
  $('tabTracker').addEventListener('click', () => setView('tracker'));
  $('tabMap').addEventListener('click', () => setView('map'));
  $('mapSel').addEventListener('change', showMap);
  $('mapQ').addEventListener('input', renderMapResults);
  $('mapFaction').addEventListener('change', () => { state.ui.mapFaction = $('mapFaction').value; save(); renderMapResults(); render(); });

  // ---------- wiring ----------
  $('mapLayerSel').replaceChildren(h('option', { value: '' }, 'None'), ...M_.LAYERS.map((l) => h('option', { value: l.id }, l.label)));
  document.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => b.closest('dialog').close()));
  $('addTask').addEventListener('click', () => openTask(null));
  $('toggleAll').addEventListener('click', () => {
    const vis = visibleTasks($('manage').checked);
    const allOpen = vis.every((t) => openIds.has(t.id));
    for (const t of vis) { if (allOpen) openIds.delete(t.id); else openIds.add(t.id); }
    renderList();
  });
  $('search').addEventListener('input', renderList);
  $('manage').addEventListener('change', renderList);
  $('fCategory').addEventListener('change', (e) => { state.ui.category = e.target.value; save(); renderList(); });
  $('fStatus').addEventListener('change', (e) => { state.ui.status = e.target.value; save(); renderList(); });
  $('fHide').addEventListener('change', (e) => { state.ui.hideCompleted = e.target.checked; save(); renderList(); });
  window.addEventListener('storage', (e) => { if (e.key === S.STORAGE_KEY) { state = load(); applyTheme(); render(); } });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });

  applyTheme();
  render();
  setInterval(tick, 1000);
})();
