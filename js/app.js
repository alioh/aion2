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

  const activeChar = () => state.characters.find((c) => c.id === state.activeCharId) || state.characters[0];
  const key = (type) => T.periodKey(type, nowMs(), state.settings);
  const isDone = (task) => ((state.completions[activeChar().id] || {})[task.id]) === key(task.resetType);

  function setDone(task, done) {
    const cid = activeChar().id;
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
    for (const type of ['daily', 'weekly']) {
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
      task.hidden && h('span', { class: 'badge' }, 'hidden'));

    const loc = task.location
      ? h('p', { class: 'loc' }, '📍 ', task.location)
      : h('p', { class: 'loc missing' }, '📍 location not confirmed');

    const guide = task.guideUrl
      ? h('a', { class: 'btn guide', href: task.guideUrl, target: '_blank', rel: 'noopener noreferrer' }, 'Guide ↗')
      : h('span', { class: 'btn guide disabled', 'aria-disabled': 'true' }, 'No guide');

    const extra = task.links.length && h('div', { class: 'links' },
      ...task.links.map((l) => h('a', { class: 'linkchip', href: l.url, target: '_blank', rel: 'noopener noreferrer' },
        /youtu/.test(l.url) ? '▶ ' : '🔗 ', l.label)));

    const tools = manage && h('div', { class: 'tools' },
      h('button', { class: 'btn sm', type: 'button', disabled: pos === 0, 'aria-label': 'Move up', onclick: () => move(task, -1) }, '↑'),
      h('button', { class: 'btn sm', type: 'button', disabled: pos === sameType.length - 1, 'aria-label': 'Move down', onclick: () => move(task, 1) }, '↓'),
      h('button', { class: 'btn sm', type: 'button', onclick: () => openTask(task) }, 'Edit'),
      h('button', { class: 'btn sm', type: 'button', onclick: () => { task.hidden = !task.hidden; save(); render(); } }, task.hidden ? 'Unhide' : 'Hide'),
      h('button', { class: 'btn sm danger', type: 'button', onclick: () => delTask(task) }, 'Delete'));

    return h('article', { class: 'task' + (done ? ' done' : '') + (task.hidden ? ' is-hidden' : ''), 'data-id': task.id, 'data-idx': idx },
      h('label', { class: 'tick' }, check),
      h('div', { class: 'body' },
        h('h3', {}, task.title),
        badges,
        task.description && h('p', { class: 'desc' }, task.description),
        loc,
        h('div', { class: 'row-actions' }, guide, tools),
        extra));
  }

  function renderList() {
    const manage = $('manage').checked;
    const tasks = visibleTasks(manage);
    const root = $('list');
    root.replaceChildren();
    for (const [type, label] of [['daily', 'Daily tasks'], ['weekly', 'Weekly tasks']]) {
      const g = tasks.filter((t) => t.resetType === type);
      if (!g.length) continue;
      root.append(h('section', { class: 'group' }, h('h2', {}, label), ...g.map((t) => taskCard(t, manage))));
    }
    if (!tasks.length) root.append(h('p', { class: 'empty' }, 'No tasks match. Clear the filters or search.'));
  }

  function renderNote() {
    const s = state.settings;
    const wd = DAYS[s.weeklyDay];
    $('resetNote').replaceChildren(
      s.resetConfirmed
        ? 'Resets daily at ' + s.resetTime + ' (' + s.timezone + '), weekly on ' + wd + '.'
        : h('span', {}, h('span', { class: 'badge warn' }, 'placeholder'), ' Reset time ' + s.resetTime + ' ' + s.timezone +
          ' is not confirmed. Community guides report 07:00 UTC (16:00 server time). Verify it in-game in Settings.'));
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
    $('dailyCd').textContent = T.formatCountdown(T.nextReset('daily', n, state.settings) - n);
    $('weeklyCd').textContent = T.formatCountdown(T.nextReset('weekly', n, state.settings) - n);
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
    return [...new Set(['UTC', 'Asia/Seoul', local, ...list, state.settings.timezone])];
  }

  function openSettings() {
    const s = state.settings;
    $('sTime').value = s.resetTime.padStart(5, '0');
    $('sDay').replaceChildren(...DAYS.map((d, i) => h('option', { value: i }, d)));
    $('sDay').value = s.weeklyDay;
    const local = Intl.DateTimeFormat().resolvedOptions().timeZone;
    $('sTz').replaceChildren(...timezones().map((z) => h('option', { value: z }, z === local ? z + ' (this device)' : z)));
    $('sTz').value = s.timezone;
    $('sConfirmed').checked = s.resetConfirmed;
    $('sNote').textContent = 'The default 05:00 is only a placeholder. Community guides (not NCSoft) report 07:00 UTC, i.e. 16:00 server time (UTC+9), with the weekly reset on Wednesday. Check the in-game "Daily recharge in" countdown on a ticket tooltip and set it here.';
    $('sMsg').textContent = '';
    $('settingsDlg').showModal();
  }
  function applySettings() {
    const s = state.settings;
    if ($('sTime').value) s.resetTime = $('sTime').value;
    s.weeklyDay = +$('sDay').value;
    s.timezone = $('sTz').value;
    s.resetConfirmed = $('sConfirmed').checked;
    save(); render();
  }
  for (const id of ['sTime', 'sDay', 'sTz', 'sConfirmed']) $(id).addEventListener('change', applySettings);
  $('sUseCommunity').addEventListener('click', () => {
    $('sTime').value = '07:00'; $('sTz').value = 'UTC'; $('sDay').value = 3; applySettings();
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
      state = next; save(); applyTheme(); openSettings();
      $('sMsg').textContent = 'Imported ' + state.characters.length + ' character(s) and ' + state.tasks.length + ' task(s).';
      render();
    } catch (err) { $('sMsg').textContent = 'Import failed: ' + err.message; }
  });
  $('restoreSeed').addEventListener('click', () => {
    if (!confirm('Restore the default tasks? Edits to default tasks are lost, hidden ones return, and order is reset. Your own custom tasks are kept.')) return;
    state.tasks = [...S.seedTasks(window.SEED_TASKS), ...state.tasks.filter((t) => t.custom)];
    save(); render(); $('sMsg').textContent = 'Default tasks restored.';
  });
  $('wipeBtn').addEventListener('click', () => {
    if (!confirm('Erase ALL data (characters, progress, tasks, settings)?')) return;
    state = S.defaultState(window.SEED_TASKS, window.SEED_RESOURCES); save(); applyTheme(); openSettings(); render();
  });

  // ---------- wiring ----------
  document.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => b.closest('dialog').close()));
  $('addTask').addEventListener('click', () => openTask(null));
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
