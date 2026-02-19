document.addEventListener('DOMContentLoaded', async () => {
  const groupSelect = document.getElementById('settingsGroupSelect');
  const membersList = document.getElementById('settingsMembersList');
  const saveBtn = document.getElementById('saveSettingsBtn');
  const talkToggle = document.getElementById('talkToggle');
  const saveTalkBtn = document.getElementById('saveTalkBtn');
  const talkChannelSelect = document.getElementById('talkChannelSelect');
  const saveTalkChannelBtn = document.getElementById('saveTalkChannelBtn');
  if (!groupSelect || !membersList || !saveBtn) return;
  try { document.title = t('talk_rh', 'Paramètres · Talk RH'); } catch(_) {}

  async function loadMembers(groupId) {
    membersList.innerHTML = '<li>' + t('talk_rh', 'Chargement...') + '</li>';
    try {
      const res = await fetch(OC.generateUrl('/apps/talk_rh/api/admin/settings/group/members') + '?groupId=' + encodeURIComponent(groupId));
      const data = await res.json();
      const members = Array.isArray(data.members) ? data.members : [];
      membersList.innerHTML = '';
      if (members.length === 0) {
        const li = document.createElement('li');
        li.textContent = t('talk_rh', 'Aucun membre dans ce groupe.');
        membersList.appendChild(li);
      } else {
        members.forEach(user => {
          const li = document.createElement('li');
          li.className = 'settings-user-card';
          li.innerHTML = `
            <div class="title">${user.displayName || user.uid}</div>
            <div class="talkrh-meta">${user.uid}</div>
          `;
          membersList.appendChild(li);
        });
      }

  if (saveTalkChannelBtn && talkChannelSelect) {
    saveTalkChannelBtn.addEventListener('click', async () => {
      try {
        saveTalkChannelBtn.disabled = true;
        saveTalkChannelBtn.textContent = t('talk_rh', 'Enregistrement...');
        const form = new FormData();
        form.append('token', talkChannelSelect.value || '');
        await fetch(OC.generateUrl('/apps/talk_rh/api/admin/settings/talk/channel'), { method: 'POST', body: form });
        saveTalkChannelBtn.textContent = t('talk_rh', 'Enregistré !');
        setTimeout(() => {
          saveTalkChannelBtn.textContent = t('talk_rh', 'Enregistrer le canal');
          saveTalkChannelBtn.disabled = false;
        }, 2000);
      } catch (e) {
        saveTalkChannelBtn.textContent = t('talk_rh', 'Erreur');
        setTimeout(() => {
          saveTalkChannelBtn.textContent = t('talk_rh', 'Enregistrer le canal');
          saveTalkChannelBtn.disabled = false;
        }, 2000);
      }
    });
  }
    } catch (e) {
      membersList.innerHTML = '<li>' + t('talk_rh', 'Erreur de chargement des membres.') + '</li>';
    }
  }

  try {
    // Load current group
    const currentRes = await fetch(OC.generateUrl('/apps/talk_rh/api/admin/settings/group'));
    const currentData = await currentRes.json();
    const currentGroupId = currentData.groupId || '';

    // Load all groups
    const groupsRes = await fetch(OC.generateUrl('/apps/talk_rh/api/admin/settings/groups'));
    const groupsData = await groupsRes.json();
    const groups = Array.isArray(groupsData.groups) ? groupsData.groups : [];

    groupSelect.innerHTML = '';
    groups.forEach(group => {
      const option = document.createElement('option');
      option.value = group.id;
      option.textContent = group.displayName || group.id;
      groupSelect.appendChild(option);
    });

    if (currentGroupId && groups.some(g => g.id === currentGroupId)) {
      groupSelect.value = currentGroupId;
    }

    groupSelect.addEventListener('change', () => {
      if (groupSelect.value) {
        loadMembers(groupSelect.value);
      }
    });

    if (groupSelect.value) {
      await loadMembers(groupSelect.value);
    }

    // Load Talk setting
    try {
      const talkRes = await fetch(OC.generateUrl('/apps/talk_rh/api/admin/settings/talk'));
      const talkData = await talkRes.json();
      if (talkToggle) talkToggle.checked = !!talkData.talkEnabled;
    } catch (e) {
      // ignore
    }

    // Load Talk channels and current selection
    try {
      if (talkChannelSelect) {
        // Load channels
        const chanRes = await fetch(OC.generateUrl('/apps/talk_rh/api/admin/settings/talk/channels'));
        const chanData = await chanRes.json();
        const channels = Array.isArray(chanData.channels) ? chanData.channels : [];
        talkChannelSelect.innerHTML = '';
        const noneOpt = document.createElement('option');
        noneOpt.value = '';
        noneOpt.textContent = '— ' + t('talk_rh', 'Aucun') + ' —';
        talkChannelSelect.appendChild(noneOpt);
        channels.forEach(ch => {
          const opt = document.createElement('option');
          opt.value = ch.token;
          opt.textContent = ch.name || ch.token;
          talkChannelSelect.appendChild(opt);
        });
        // Load current selection
        const curRes = await fetch(OC.generateUrl('/apps/talk_rh/api/admin/settings/talk/channel'));
        const curData = await curRes.json();
        if (curData && typeof curData.token === 'string') {
          talkChannelSelect.value = curData.token;
        }
      }
    } catch (e) {
      if (talkChannelSelect) {
        talkChannelSelect.innerHTML = '<option>' + t('talk_rh', 'Erreur de chargement') + '</option>';
      }
    }

    saveBtn.addEventListener('click', async () => {
      try {
        saveBtn.disabled = true;
        saveBtn.textContent = t('talk_rh', 'Enregistrement...');
        const form = new FormData();
        form.append('groupId', groupSelect.value);
        await fetch(OC.generateUrl('/apps/talk_rh/api/admin/settings/group'), { method: 'POST', body: form });
        saveBtn.textContent = t('talk_rh', 'Enregistré !');
        setTimeout(() => {
          saveBtn.textContent = t('talk_rh', 'Enregistrer');
          saveBtn.disabled = false;
        }, 2000);
      } catch (e) {
        saveBtn.textContent = t('talk_rh', 'Erreur');
        setTimeout(() => {
          saveBtn.textContent = t('talk_rh', 'Enregistrer');
          saveBtn.disabled = false;
        }, 2000);
      }
    });

  } catch (e) {
    groupSelect.innerHTML = '<option>' + t('talk_rh', 'Erreur de chargement') + '</option>';
    membersList.innerHTML = '<li>' + t('talk_rh', 'Erreur de chargement de la configuration.') + '</li>';
  }

  if (saveTalkBtn && talkToggle) {
    // Auto-save on switch change for better UX
    talkToggle.addEventListener('change', async () => {
      try {
        if (saveTalkBtn) {
          saveTalkBtn.disabled = true;
          saveTalkBtn.textContent = t('talk_rh', 'Enregistrement...');
        }
        const desired = talkToggle.checked ? '1' : '0';
        const form = new FormData();
        form.append('enabled', desired);
        const res = await fetch(OC.generateUrl('/apps/talk_rh/api/admin/settings/talk'), { method: 'POST', body: form });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        // verify
        try {
          const verifyRes = await fetch(OC.generateUrl('/apps/talk_rh/api/admin/settings/talk'));
          if (verifyRes.ok) {
            const verifyData = await verifyRes.json();
            const serverVal = verifyData && verifyData.talkEnabled ? '1' : '0';
            if (serverVal !== desired) {
              console.warn('[talk_rh] Talk setting verification mismatch after change. desired=', desired, 'serverVal=', serverVal);
            }
          }
        } catch (_) {}
        if (saveTalkBtn) {
          saveTalkBtn.textContent = t('talk_rh', 'Enregistré !');
          setTimeout(() => {
            saveTalkBtn.textContent = t('talk_rh', 'Sauvegarder');
            saveTalkBtn.disabled = false;
          }, 1500);
        }
      } catch (e) {
        if (saveTalkBtn) {
          saveTalkBtn.textContent = t('talk_rh', 'Erreur');
          setTimeout(() => {
            saveTalkBtn.textContent = t('talk_rh', 'Sauvegarder');
            saveTalkBtn.disabled = false;
          }, 1500);
        }
      }
    });

    saveTalkBtn.addEventListener('click', async () => {
      try {
        saveTalkBtn.disabled = true;
        saveTalkBtn.textContent = t('talk_rh', 'Enregistrement...');
        const form = new FormData();
        const desired = talkToggle.checked ? '1' : '0';
        form.append('enabled', desired);
        const res = await fetch(OC.generateUrl('/apps/talk_rh/api/admin/settings/talk'), { method: 'POST', body: form });
        if (!res.ok) {
          throw new Error('HTTP ' + res.status);
        }
        // Confirm by reloading the setting
        try {
          const verifyRes = await fetch(OC.generateUrl('/apps/talk_rh/api/admin/settings/talk'));
          if (verifyRes.ok) {
            const verifyData = await verifyRes.json();
            const serverVal = verifyData && verifyData.talkEnabled ? '1' : '0';
            if (serverVal !== desired) {
              console.warn('[talk_rh] Talk setting verification mismatch. desired=', desired, 'serverVal=', serverVal);
            }
          }
        } catch (_) {}
        saveTalkBtn.textContent = t('talk_rh', 'Enregistré !');
        setTimeout(() => {
          saveTalkBtn.textContent = t('talk_rh', 'Sauvegarder');
          saveTalkBtn.disabled = false;
        }, 2000);
      } catch (e) {
        saveTalkBtn.textContent = t('talk_rh', 'Erreur');
        setTimeout(() => {
          saveTalkBtn.textContent = t('talk_rh', 'Sauvegarder');
          saveTalkBtn.disabled = false;
        }, 2000);
      }
    });
  }
});
