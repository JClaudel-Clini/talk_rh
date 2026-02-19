// common.js to load common utilities
import { titleCaseFr, formatDateLongFr, eachDate, closeModal, getDayPartFor, labelForPart, leavesFiltered, populateFilter, leavesForDate, renderCalendar, bindMonthNav } from './common.js';

(function() {
  // State
  let allLeaves = [];

  function renderList() {
    const listView = document.getElementById('adminListView');
    const tbody = document.querySelector('#adminListTable tbody');
    if (!listView || !tbody) return;
    tbody.innerHTML = '';
    const rows = leavesFiltered().slice().sort((a,b) => {
      // sort by start_date desc then id desc
      if (a.start_date === b.start_date) return (b.id || 0) - (a.id || 0);
      return a.start_date > b.start_date ? -1 : 1;
    });
    rows.forEach(l => {
      const tr = document.createElement('tr');
      // Add status-based class to the main row
      if (l.status === 'pending' || l.status === 'approved' || l.status === 'rejected') {
        tr.classList.add('row-' + l.status);
      }
      const tdId = document.createElement('td');
      tdId.textContent = '#' + l.id;
      const tdUser = document.createElement('td');
      tdUser.textContent = l.uid;
      const tdStart = document.createElement('td');
      tdStart.textContent = formatDateLongFr(l.start_date);
      const tdEnd = document.createElement('td');
      tdEnd.textContent = formatDateLongFr(l.end_date);
      const tdType = document.createElement('td');
      tdType.textContent = l.type === 'paid' ? t('talk_rh', 'Soldé') : (l.type === 'unpaid' ? t('talk_rh', 'Sans Solde') : t('talk_rh', 'Récup.'));
      const tdStatus = document.createElement('td');
      // Wrap status in a span with badge classes
      const statusSpan = document.createElement('span');
      statusSpan.className = 'talkrh-badge badge-' + l.status;
      statusSpan.textContent = l.status === 'pending' ? t('talk_rh', 'En attente') : (l.status === 'approved' ? t('talk_rh', 'Approuvée') : t('talk_rh', 'Refusée'));
      tdStatus.appendChild(statusSpan);
      const tdActions = document.createElement('td');
      if (l.status === 'pending') {
        const approve = document.createElement('button');
        approve.className = 'button icon-button approve';
        approve.title = t('talk_rh', 'Approuver');
        approve.textContent = '✓';
        approve.onclick = async () => {
          const form = new FormData();
          form.append('status', 'approved');
          try { if (window.talkrhLoader) window.talkrhLoader.show(); } catch(_) {}
          try {
            await fetch(OC.generateUrl('/apps/talk_rh/api/admin/leaves/' + l.id + '/status'), { method: 'POST', body: form });
          } finally {
            try { if (window.talkrhLoader) window.talkrhLoader.hide(); } catch(_) {}
          }
          await loadAll();
        };
        const reject = document.createElement('button');
        reject.className = 'button icon-button danger reject';
        reject.title = t('talk_rh', 'Refuser');
        reject.textContent = '✕';
        reject.onclick = async () => {
          const form = new FormData();
          form.append('status', 'rejected');
          await fetch(OC.generateUrl('/apps/talk_rh/api/admin/leaves/' + l.id + '/status'), { method: 'POST', body: form });
          await loadAll();
        };
        tdActions.appendChild(approve);
        tdActions.appendChild(reject);
      } else {
        tdActions.textContent = '—';
      }
      tr.appendChild(tdId);
      tr.appendChild(tdUser);
      tr.appendChild(tdStart);
      tr.appendChild(tdEnd);
      tr.appendChild(tdType);
      tr.appendChild(tdStatus);
      tr.appendChild(tdActions);
      tbody.appendChild(tr);

      // Details row (collapsed by default)
      const detailsTr = document.createElement('tr');
      const detailsTd = document.createElement('td');
      detailsTd.colSpan = 7;
      const details = document.createElement('div');
      details.className = 'talkrh-card list-detail';
      const ul = document.createElement('ul');
      ul.className = 'talkrh-list';
      eachDate(l.start_date, l.end_date).forEach(iso => {
        const li = document.createElement('li');
        const part = getDayPartFor(l, iso);
        const label = labelForPart(part);
        const dateTxt = titleCaseFr(formatDateLongFr(iso));
        li.textContent = dateTxt + (part !== 'full' ? ' - ' + label : '');
        ul.appendChild(li);
      });
      details.appendChild(ul);
      details.style.display = 'none';
      detailsTd.appendChild(details);
      detailsTr.appendChild(detailsTd);
      tbody.appendChild(detailsTr);

      // Toggle on row click (ignore clicks on buttons)
      tr.addEventListener('click', (e) => {
        if (e.target.closest('button')) return;
        details.style.display = details.style.display === 'none' ? '' : 'none';
      });
    });
  }

  function render() {
    if (currentView === 'calendar') {
      const cal = document.getElementsByClassName('talkrh-calendar')[0];
      const list = document.getElementById('adminListView');
      if (cal) cal.style.display = '';
      if (list) list.style.display = 'none';
      renderCalendar();
    } else {
      const cal = document.getElementsByClassName('talkrh-calendar')[0];
      const list = document.getElementById('adminListView');
      if (cal) cal.style.display = 'none';
      if (list) list.style.display = '';
      renderList();
    }
  }

  function openModalForDate(iso) {
    const backdrop = document.getElementById('talkrhModalBackdrop');
    const titleEl = document.getElementById('talkrhModalTitle');
    const bodyEl = document.getElementById('talkrhModalBody');
    if (!backdrop || !titleEl || !bodyEl) return;
    const items = leavesForDate(iso);
    if (!items.length) {
      closeModal();
      return;
    }
    titleEl.textContent = t('talk_rh', 'Détails du {date}', { date: titleCaseFr(formatDateLongFr(iso)) });
    bodyEl.innerHTML = '';
    items.forEach(l => {
      const card = document.createElement('div');
      card.className = 'talkrh-card';
      const head = document.createElement('div');
      head.className = 'title';
      head.textContent = `#${l.id} • ${l.uid}`;
      const meta = document.createElement('div');
      meta.className = 'talkrh-meta';
      meta.textContent = `${formatDateLongFr(l.start_date)} → ${formatDateLongFr(l.end_date)}` + (l.reason ? ' • ' + t('talk_rh', 'Raison: ') + l.reason : '');
      const badges = document.createElement('div');
      badges.className = 'talkrh-badges';
      const type = document.createElement('span');
      type.className = 'talkrh-badge';
      type.textContent = l.type === 'paid' ? t('talk_rh', 'Soldé') : (l.type === 'unpaid' ? t('talk_rh', 'Sans Solde') : t('talk_rh', 'Récup.'));
      const status = document.createElement('span');
      status.className = 'talkrh-badge badge-' + l.status;
      status.textContent = l.status === 'pending' ? t('talk_rh', 'En attente') : (l.status === 'approved' ? t('talk_rh', 'Approuvée') : t('talk_rh', 'Refusée'));
      badges.appendChild(type);
      badges.appendChild(status);
      if (l.admin_comment) {
        const comment = document.createElement('span');
        comment.className = 'talkrh-badge';
        comment.textContent = t('talk_rh', 'Commentaire: {comment}', { comment: l.admin_comment });
        badges.appendChild(comment);
      }
      // Collapsible details of days
      const toggle = document.createElement('button');
      toggle.className = 'button';
      toggle.textContent = t('talk_rh', 'Voir les jours');
      const details = document.createElement('div');
      details.style.display = 'none';
      const ul = document.createElement('ul');
      ul.className = 'talkrh-list';
      eachDate(l.start_date, l.end_date).forEach(iso => {
        const li = document.createElement('li');
        const part = getDayPartFor(l, iso);
        const dateTxt = titleCaseFr(formatDateLongFr(iso));
        li.textContent = dateTxt + (part !== 'full' ? ' - ' + labelForPart(part) : '');
        ul.appendChild(li);
      });
      details.appendChild(ul);
      toggle.addEventListener('click', () => {
        details.style.display = details.style.display === 'none' ? '' : 'none';
      });
      const actions = document.createElement('div');
      actions.className = 'talkrh-actions';
      if (l.status === 'pending') {
        const approve = document.createElement('button');
        approve.textContent = t('talk_rh', 'Approuver');
        approve.onclick = async () => {
          const comment = prompt(t('talk_rh', 'Commentaire (optionnel)')) || '';
          const form = new FormData();
          form.append('status', 'approved');
          if (comment) form.append('adminComment', comment);
          try { if (window.talkrhLoader) window.talkrhLoader.show(); } catch(_) {}
          try {
            await fetch(OC.generateUrl('/apps/talk_rh/api/admin/leaves/' + l.id + '/status'), { method: 'POST', body: form });
          } finally {
            try { if (window.talkrhLoader) window.talkrhLoader.hide(); } catch(_) {}
          }
          await loadAll();
          closeModal();
        };
        const reject = document.createElement('button');
        reject.className = 'danger';
        reject.textContent = t('talk_rh', 'Refuser');
        reject.onclick = async () => {
          const comment = prompt(t('talk_rh', 'Commentaire (optionnel)')) || '';
          const form = new FormData();
          form.append('status', 'rejected');
          if (comment) form.append('adminComment', comment);
          try { if (window.talkrhLoader) window.talkrhLoader.show(); } catch(_) {}
          try {
            await fetch(OC.generateUrl('/apps/talk_rh/api/admin/leaves/' + l.id + '/status'), { method: 'POST', body: form });
          } finally {
            try { if (window.talkrhLoader) window.talkrhLoader.hide(); } catch(_) {}
          }
          await loadAll();
          closeModal();
        };
        actions.appendChild(approve);
        actions.appendChild(reject);
      }
      card.appendChild(head);
      card.appendChild(meta);
      card.appendChild(badges);
      card.appendChild(toggle);
      card.appendChild(details);
      card.appendChild(actions);
      bodyEl.appendChild(card);
    });
    backdrop.style.display = 'block';
  }

  async function openSettingsModal() {
    const backdrop = document.getElementById('talkrhModalBackdrop');
    const titleEl = document.getElementById('talkrhModalTitle');
    const bodyEl = document.getElementById('talkrhModalBody');
    if (!backdrop || !titleEl || !bodyEl) return;

    titleEl.textContent = t('talk_rh', 'Paramètres · Groupe administrateur');
    bodyEl.innerHTML = '';

    const field = document.createElement('div');
    field.className = 'field';
    const label = document.createElement('label');
    label.textContent = t('talk_rh', 'Groupe admin');
    label.htmlFor = 'settingsGroupSelect';
    const select = document.createElement('select');
    select.id = 'settingsGroupSelect';
    select.className = '';
    field.appendChild(label);
    field.appendChild(select);

    const membersTitle = document.createElement('h4');
    membersTitle.textContent = t('talk_rh', 'Membres du groupe');
    const membersList = document.createElement('ul');
    membersList.id = 'settingsMembersList';
    membersList.className = 'talkrh-list';

    const actions = document.createElement('div');
    actions.className = 'talkrh-actions';
    const saveBtn = document.createElement('button');
    saveBtn.className = 'button primary';
    saveBtn.textContent = t('talk_rh', 'Enregistrer');
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'button';
    cancelBtn.textContent = t('talk_rh', 'Annuler');
    cancelBtn.onclick = () => closeModal();
    actions.appendChild(saveBtn);
    actions.appendChild(cancelBtn);

    bodyEl.appendChild(field);
    bodyEl.appendChild(membersTitle);
    bodyEl.appendChild(membersList);
    bodyEl.appendChild(actions);

    async function loadMembers(groupId) {
      membersList.innerHTML = '';
      try {
        const res = await fetch(OC.generateUrl('/apps/talk_rh/api/admin/settings/group/members') + '?groupId=' + encodeURIComponent(groupId));
        const data = await res.json();
        const mem = Array.isArray(data.members) ? data.members : [];
        if (mem.length === 0) {
          const li = document.createElement('li');
          li.textContent = t('talk_rh', 'Aucun membre dans ce groupe.');
          membersList.appendChild(li);
        } else {
          mem.forEach(u => {
            const li = document.createElement('li');
            li.textContent = `${u.displayName || u.uid} (${u.uid})`;
            membersList.appendChild(li);
          });
        }
      } catch (e) {
        const li = document.createElement('li');
        li.textContent = t('talk_rh', 'Erreur de chargement des membres.');
        membersList.appendChild(li);
      }
    }

    try {
      // Load current group id
      const currentRes = await fetch(OC.generateUrl('/apps/talk_rh/api/admin/settings/group'));
      const currentData = await currentRes.json();
      const currentGid = currentData.groupId || '';
      // Load groups
      const groupsRes = await fetch(OC.generateUrl('/apps/talk_rh/api/admin/settings/groups'));
      const groupsData = await groupsRes.json();
      const groups = Array.isArray(groupsData.groups) ? groupsData.groups : [];
      select.innerHTML = '';
      groups.forEach(g => {
        const opt = document.createElement('option');
        opt.value = g.id;
        opt.textContent = g.displayName || g.id;
        select.appendChild(opt);
      });
      if (currentGid && groups.some(g => g.id === currentGid)) {
        select.value = currentGid;
      }
      select.onchange = () => loadMembers(select.value);
      await loadMembers(select.value);

      saveBtn.onclick = async () => {
        const form = new FormData();
        form.append('groupId', select.value);
        await fetch(OC.generateUrl('/apps/talk_rh/api/admin/settings/group'), { method: 'POST', body: form });
        closeModal();
      };
    } catch (e) {
      const li = document.createElement('div');
      li.textContent = t('talk_rh', 'Erreur de chargement de la configuration.');
      bodyEl.appendChild(li);
    }

    backdrop.style.display = 'block';
  }

  async function loadAll() {
    try {
      try { if (window.talkrhLoader) window.talkrhLoader.show(); } catch(_) {}
      const res = await fetch(OC.generateUrl('/apps/talk_rh/api/admin/leaves'));
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      allLeaves = Array.isArray(data.leaves) ? data.leaves : [];
      populateFilter(allLeaves);
      render();
    } catch (e) {
      console.error('[talk_rh] admin.js: error fetching leaves', e);
    } finally {
      try { if (window.talkrhLoader) window.talkrhLoader.hide(); } catch(_) {}
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    bindMonthNav();
    // Modal close bindings
    const closeBtn = document.getElementById('talkrhModalClose');
    const backdrop = document.getElementById('talkrhModalBackdrop');
    if (closeBtn) closeBtn.onclick = closeModal;
    if (backdrop) backdrop.addEventListener('click', (e) => { if (e.target === backdrop) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
    const openSettingsBtn = document.getElementById('openSettings');
    if (openSettingsBtn) openSettingsBtn.onclick = openSettingsModal;
    const navViewCal = document.getElementById('navViewCalendar-admin');
    const navViewList = document.getElementById('navViewList-admin');

    // Initialize current view from URL param if provided
    try {
      const params = new URLSearchParams(window.location.search);
      const v = params.get('view');
      if (v === 'list' || v === 'calendar') {
        currentView = v;
      }
    } catch (e) { /* ignore */ }
    function updateTitle() {
      try {
        document.title = (currentView === 'list') ? t('talk_rh', 'Gestion des congés · Vue liste · Talk RH') : t('talk_rh', 'Gestion des congés · Vue calendrier · Talk RH');
      } catch(_) {}
    }

    if (navViewCal) {
      navViewCal.addEventListener('click', (e) => {
        e.preventDefault();
        currentView = 'calendar';
        // Persist view in URL
        try {
          const url = new URL(window.location.href);
          url.searchParams.set('view', 'calendar');
          window.history.replaceState(null, '', url);
        } catch (e) { /* ignore */ }
        updateActiveNav();
        updateTitle();
        render();
      });
    }
    if (navViewList) {
      navViewList.addEventListener('click', (e) => {
        e.preventDefault();
        currentView = 'list';
        // Persist view in URL
        try {
          const url = new URL(window.location.href);
          url.searchParams.set('view', 'list');
          window.history.replaceState(null, '', url);
        } catch (e) { /* ignore */ }
        updateActiveNav();
        updateTitle();
        render();
      });
    }

    function updateActiveNav() {
      // Ensure main admin entry stays active with more robust selector
      const adminEntry = document.querySelector('.app-navigation-entry-link[href="/apps/talk_rh/page"]');
      if (adminEntry && !adminEntry.closest('.app-navigation-entry__children')) {
        const navEntry = adminEntry.closest('.app-navigation-entry');
        if (navEntry) {
          navEntry.classList.add('active');
        }
      }

      // Remove active class from sub-menu items only
      document.querySelectorAll('#nav-calendar-supervisor, #nav-list-supervisor, #nav-calendar-admin, #nav-list-admin').forEach(el => el.classList.remove('active'));

      // Add active class to current view
      if (currentView === 'calendar') {
        const calEl = document.getElementById('nav-calendar-admin');
        if (calEl) calEl.classList.add('active');
      } else if (currentView === 'list') {
        const listEl = document.getElementById('nav-list-admin');
        if (listEl) listEl.classList.add('active');
      }

    }

    // Set initial active state (after possibly reading URL param)
    updateActiveNav();
    // Initial title
    updateTitle();
    loadAll();
  });
})();
