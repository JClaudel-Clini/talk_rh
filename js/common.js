  let currentFilterUser = 'ALL';
  let currentFilterStatus = 'ALL';
  const today = new Date();
  let currentYear = today.getFullYear();
  let currentMonth = today.getMonth(); // 0-11
  let currentView = 'calendar'; // 'calendar' | 'list'

	const monthNamesFr = [
    t('talk_rh', 'Janvier'),
    t('talk_rh', 'Février'),
    t('talk_rh', 'Mars'),
    t('talk_rh', 'Avril'),
    t('talk_rh', 'Mai'),
    t('talk_rh', 'Juin'),
    t('talk_rh', 'Juillet'),
    t('talk_rh', 'Août'),
    t('talk_rh', 'Septembre'),
    t('talk_rh', 'Octobre'),
    t('talk_rh', 'Novembre'),
    t('talk_rh', 'Décembre')
  ];
	
  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function isoFromDate(d) { return d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate()); }

  // Presentational helper for capitalizing French long dates when needed
  function titleCaseFr(s) {
    if (!s) return s;
    return s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }
	
  function formatDateFr(iso) {
    if (!iso) return '';
    const parts = iso.split('-');
    if (parts.length !== 3) return iso;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  function formatDateLongFr(iso) {
    if (!iso) return '';
    try {
      const [y, m, d] = iso.split('-').map(x => parseInt(x, 10));
      const dt = new Date(y, (m - 1), d);
      return new Intl.DateTimeFormat(OC.getLanguage(), { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(dt);
    } catch (e) { return formatDateFr(iso); }
  }
	
	function eachDate(startIso, endIso) {
    const results = [];
    try {
      const start = new Date(startIso);
      const end = new Date(endIso);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const y = d.getFullYear();
        const m = (d.getMonth() + 1).toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        results.push(`${y}-${m}-${day}`);
      }
    } catch (_){ }
    return results;
  }

  function closeModal() {
    const backdrop = document.getElementById('talkrhModalBackdrop');
    if (backdrop) backdrop.style.display = 'none';
  }

		// Day-parts helpers
		function parseDayParts(dp) {
			// Accept map { 'YYYY-MM-DD': 'full|am|pm' } or array [{date, part}] or string
			if (!dp) return null;
			try {
				if (typeof dp === 'string') {
					const s = dp.trim();
					if (s && (s[0] === '{' || s[0] === '[')) {
						dp = JSON.parse(s);
					} else {
						// Single date string means that date (rare), ignore for map
						return null;
					}
				}
				if (dp && !Array.isArray(dp) && typeof dp === 'object') {
					// object map
					return dp;
				}
				if (Array.isArray(dp)) {
					const map = {};
					dp.forEach(item => {
						if (item && typeof item === 'object' && item.date) {
							map[item.date] = item.part || 'full';
						}
					});
					return map;
				}
			} catch (_) {}
			return null;
		}
	
		function getDayPartFor(leave, isoDate) {
			const map = parseDayParts(leave.day_parts);
			if (map && Object.prototype.hasOwnProperty.call(map, isoDate)) {
				const p = map[isoDate];
				if (p === 'am' || p === 'pm' || p === 'full') return p;
			}
			return 'full';
		}
	
		function labelForPart(p) {
			return p === 'am' ? t('talk_rh', 'Matin') : (p === 'pm' ? t('talk_rh', 'Après-midi') : t('talk_rh', 'Journée complète'));
		}
	
		function leavesFiltered() {
			let filtered = currentFilterUser === 'ALL' ? allLeaves : allLeaves.filter(l => l.uid === currentFilterUser);
			if (currentFilterStatus !== 'ALL') {
				filtered = filtered.filter(l => l.status === currentFilterStatus);
			}
			return filtered;
		}
		
			function populateFilter(leaves) {
				const sel = document.getElementById('filterUser');
				const selStatus = document.getElementById('filterStatus');
				if (!sel) return;
				const seen = new Set();
				const prev = sel.value || 'ALL';
				sel.innerHTML = '';
				const optAll = document.createElement('option');
				optAll.value = 'ALL';
				optAll.textContent = t('talk_rh', 'Tous les employés');
				sel.appendChild(optAll);
				leaves.forEach(l => {
					if (!seen.has(l.uid)) {
						seen.add(l.uid);
						const o = document.createElement('option');
						o.value = l.uid;
						o.textContent = l.uid;
						sel.appendChild(o);
					}
				});
				if ([...seen, 'ALL'].includes(prev)) {
					sel.value = prev;
					currentFilterUser = prev;
				} else {
					sel.value = 'ALL';
					currentFilterUser = 'ALL';
				}
				sel.onchange = () => {
					currentFilterUser = sel.value;
					render();
				};
				if (selStatus) {
					selStatus.onchange = () => {
						currentFilterStatus = selStatus.value;
						render();
					};
				}
			}
		
			function leavesForDate(iso) {
				let filtered = currentFilterUser === 'ALL' ? allLeaves : allLeaves.filter(l => l.uid === currentFilterUser);
				if (currentFilterStatus !== 'ALL') {
					filtered = filtered.filter(l => l.status === currentFilterStatus);
				}
				return filtered.filter(l => iso >= l.start_date && iso <= l.end_date);
			}
		
			function renderCalendar() {
				const grid = document.getElementById('calendarGrid');
				const label = document.getElementById('monthLabel');
				if (!grid || !label) return;
				grid.innerHTML = '';
				label.textContent = monthNamesFr[currentMonth] + ' ' + currentYear;
		
				// Compute first day (Mon-based) and total cells (6 weeks)
				const firstOfMonth = new Date(currentYear, currentMonth, 1);
				const startWeekdayMonBased = (firstOfMonth.getDay() + 6) % 7; // 0 = Monday
				const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
				const prevMonthDays = startWeekdayMonBased; // number of days from previous month to show
				const totalCells = 42; // 6 weeks x 7
				const startDate = new Date(currentYear, currentMonth, 1 - prevMonthDays);
		
				for (let i = 0; i < totalCells; i++) {
					const d = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
					const iso = isoFromDate(d);
					const inCurrent = d.getMonth() === currentMonth;
					const isToday = iso === isoFromDate(today);
		
					const cell = document.createElement('div');
					cell.className = 'day-cell' + (inCurrent ? '' : ' outside') + (isToday ? ' day-today' : '');
					const header = document.createElement('div');
					header.className = 'day-header';
					const num = document.createElement('div');
					num.className = 'day-number';
					num.textContent = d.getDate();
					header.appendChild(num);
					cell.appendChild(header);
		
					const events = document.createElement('div');
					events.className = 'events';
					const items = leavesForDate(iso);
					items.forEach(l => {
						const ev = document.createElement('div');
						ev.className = 'event-badge talkrh-badge badge-' + l.status;
						const typeLabel = l.type === 'paid' ? t('talk_rh', 'Soldé') : (l.type === 'unpaid' ? t('talk_rh', 'Sans Solde') : t('talk_rh', 'Récup.'));
						const statusLabel = l.status === 'pending' ? t('talk_rh', 'En attente') : (l.status === 'approved' ? t('talk_rh', 'Approuvée') : t('talk_rh', 'Refusée'));
						const who = currentFilterUser === 'ALL' ? (l.uid + ' • ') : '';
						const part = getDayPartFor(l, iso);
						const half = part !== 'full' ? ' · ½ ' + (part === 'am' ? t('talk_rh', 'matin') : t('talk_rh', 'après-midi')) : '';
						ev.textContent = who + typeLabel + ' · ' + statusLabel + half;
						events.appendChild(ev);
					});
					cell.appendChild(events);
		
					cell.addEventListener('click', () => openModalForDate(iso));
					grid.appendChild(cell);
				}
			}

  function bindMonthNav() {
    const prev = document.getElementById('prevMonth');
    const next = document.getElementById('nextMonth');
    if (prev) prev.onclick = () => { currentMonth -= 1; if (currentMonth < 0) { currentMonth = 11; currentYear -= 1; } renderCalendar(); };
    if (next) next.onclick = () => { currentMonth += 1; if (currentMonth > 11) { currentMonth = 0; currentYear += 1; } renderCalendar(); };
  }