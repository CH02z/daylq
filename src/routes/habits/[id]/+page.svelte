<script>
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';
	import { CATEGORIES, ICON_GROUPS, getCategoryById } from '$lib/categories.js';
	import { addDays, utcDow } from '$lib/dateUtils.js';
	import { getEarnedBadges, getNextBadge } from '$lib/badges.js';
	import { checkinCount } from '$lib/checkinUtils.js';
	import { tap, strongTap, warn } from '$lib/haptic.js';

	let { data, form } = $props();

	const allCategories = $derived([...CATEGORIES, ...data.userCategories]);
	const category = $derived(getCategoryById(data.habit.category, data.userCategories));
	const color = $derived(data.habit.color || category.color);
	const goal = $derived(Math.max(1, data.habit.dailyGoal || 1));
	const isMulti = $derived(goal > 1);

	// Map<date, count>; legacy docs treated as count = goal
	const countByDate = $derived.by(() => {
		const m = new Map();
		for (const c of data.checkins) m.set(c.date, checkinCount(c, goal));
		return m;
	});
	const notesByDate = $derived(new Map(data.checkins.filter((c) => c.note).map((c) => [c.date, c.note])));
	const doneDates = $derived(
		new Set([...countByDate.entries()].filter(([, c]) => c >= goal).map(([d]) => d))
	);
	const totalCompletions = $derived([...countByDate.values()].reduce((s, c) => s + c, 0));
	const totalDays = $derived(doneDates.size);

	const currentStreak = $derived.by(() => {
		let count = 0;
		let d = data.today;
		if (!doneDates.has(d)) d = addDays(d, -1);
		for (let i = 0; i < 365; i++) {
			if (doneDates.has(d)) { count++; d = addDays(d, -1); }
			else break;
		}
		return count;
	});

	const bestStreak = $derived.by(() => {
		const sorted = [...doneDates].sort();
		let best = 0, run = 0;
		for (let i = 0; i < sorted.length; i++) {
			if (i === 0) { run = 1; best = 1; continue; }
			const prev = new Date(sorted[i - 1] + 'T12:00:00Z');
			const curr = new Date(sorted[i] + 'T12:00:00Z');
			const diff = Math.round((curr - prev) / 86400000);
			run = diff === 1 ? run + 1 : 1;
			if (run > best) best = run;
		}
		return best;
	});

	const createdAt = $derived(
		data.habit.createdAt
			? new Date(data.habit.createdAt).toLocaleDateString('de-CH', { day: 'numeric', month: 'long', year: 'numeric' })
			: '–'
	);

	const earnedBadges = $derived(getEarnedBadges(currentStreak, totalCompletions));
	const nextBadges = $derived(getNextBadge(currentStreak, totalCompletions));

	const PERIODS = [
		{ id: '4w',  label: '4 Wochen',  weeks: 4  },
		{ id: '8w',  label: '8 Wochen',  weeks: 8  },
		{ id: '13w', label: '3 Monate',  weeks: 13 },
		{ id: '26w', label: '6 Monate',  weeks: 26 },
		{ id: '52w', label: '1 Jahr',    weeks: 52 },
		{ id: 'all', label: 'Alles',     weeks: null },
	];
	let selectedPeriod = $state('52w');

	const weeksToShow = $derived.by(() => {
		const p = PERIODS.find((x) => x.id === selectedPeriod);
		if (p?.weeks != null) return p.weeks;
		if (!data.habit.createdAt) return 52;
		const diffDays = Math.ceil(
			(new Date(data.today + 'T12:00:00Z') - new Date(data.habit.createdAt)) / 86_400_000
		);
		return Math.max(4, Math.ceil(diffDays / 7) + 1);
	});

	const MONTHS_SHORT = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
	const DAY_LABELS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

	const heatmapData = $derived.by(() => {
		const WEEKS = weeksToShow;
		const dow = utcDow(data.today);
		let cur = addDays(data.today, -(dow + 7 * (WEEKS - 1)));

		const rows = [[], [], [], [], [], [], []];
		while (cur <= data.today) {
			const d = utcDow(cur);
			const c = countByDate.get(cur) ?? 0;
			rows[d].push({ date: cur, count: c, phantom: false });
			cur = addDays(cur, 1);
		}
		const maxLen = Math.max(...rows.map((r) => r.length));
		for (const row of rows) {
			while (row.length < maxLen) row.push({ date: null, count: 0, phantom: true });
		}

		let lastMonth = -1;
		let lastYear = -1;
		const colLabels = rows[0].map((cell) => {
			if (cell.phantom || !cell.date) return '';
			const d = new Date(cell.date + 'T12:00:00Z');
			const m = d.getUTCMonth();
			const y = d.getUTCFullYear();
			if (m !== lastMonth) {
				const label = y !== lastYear
					? `${MONTHS_SHORT[m]} '${String(y).slice(2)}`
					: MONTHS_SHORT[m];
				lastMonth = m;
				lastYear = y;
				return label;
			}
			return '';
		});

		return { rows, colLabels };
	});

	let scrollWrap = $state(null);

	$effect(() => {
		const _ = heatmapData;
		if (!scrollWrap) return;
		queueMicrotask(() => { if (scrollWrap) scrollWrap.scrollLeft = scrollWrap.scrollWidth; });
	});

	onMount(() => {
		if (!scrollWrap) return;
		function handleWheel(e) {
			const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
			if (delta === 0) return;
			e.preventDefault();
			scrollWrap.scrollLeft += delta;
		}
		scrollWrap.addEventListener('wheel', handleWheel, { passive: false });
		return () => scrollWrap.removeEventListener('wheel', handleWheel);
	});

	// Edit state
	let editing = $state(false);
	let editCatId = $state('');
	let editIcon = $state('');
	let editName = $state('');
	let editReminderTime = $state('');
	let editDailyGoal = $state(1);
	let saving = $state(false);
	let editIconSearch = $state('');
	let notifPermission = $state('default');

	const editCat = $derived(getCategoryById(editCatId, data.userCategories));
	const editColor = $derived(editCat.color);

	const editFilteredGroups = $derived.by(() => {
		const q = editIconSearch.trim().toLowerCase();
		if (!q) return ICON_GROUPS;
		return ICON_GROUPS.map((g) => ({
			...g,
			icons: g.icons.filter((ic) => ic.replace('bi-', '').includes(q))
		})).filter((g) => g.icons.length > 0);
	});

	const QUICK_TIMES = [
		{ value: '07:00', label: '☀ Morgens' },
		{ value: '12:00', label: '🌤 Mittag' },
		{ value: '18:00', label: '🌆 Abend' },
		{ value: '21:00', label: '🌙 Spät' }
	];
	const QUICK_GOALS = [1, 2, 3, 5, 8, 10];

	function openEdit() {
		tap();
		editCatId = data.habit.category;
		editIcon = data.habit.icon;
		editName = data.habit.name;
		editReminderTime = data.habit.reminderTime ?? '';
		editDailyGoal = Math.max(1, data.habit.dailyGoal || 1);
		editIconSearch = '';
		if (typeof Notification !== 'undefined') notifPermission = Notification.permission;
		editing = true;
	}
	function pickEditCat(cat) { tap(); editCatId = cat.id ?? cat._id; }
	function pickEditIcon(icon) { tap(); editIcon = icon; }
	function pickEditGoal(g) { tap(); editDailyGoal = g; }
	function bumpEditGoal(delta) {
		tap();
		editDailyGoal = Math.max(1, Math.min(20, editDailyGoal + delta));
	}

	async function pickEditQuickTime(value) {
		tap();
		editReminderTime = value;
		await maybeRequestPermission();
	}
	async function onEditTimeInput(e) {
		editReminderTime = e.target.value;
		if (editReminderTime) await maybeRequestPermission();
	}
	async function maybeRequestPermission() {
		if (typeof Notification === 'undefined') return;
		if (Notification.permission !== 'default') {
			notifPermission = Notification.permission;
			return;
		}
		try {
			const result = await Notification.requestPermission();
			notifPermission = result;
		} catch {
			// ignore
		}
	}

	let confirmDelete = $state(false);
	let deleting = $state(false);
</script>

<svelte:head>
	<title>{data.habit.name} – daylq</title>
</svelte:head>

<style>
	.page { padding: 1.4rem 1rem 0; }
	@media (min-width: 768px) { .page { padding: 2rem 1rem 0; } }

	.wrap { max-width: 820px; margin: 0 auto; }

	.head {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 1.5rem;
	}
	.back-btn {
		width: 40px;
		height: 40px;
		border-radius: var(--radius-pill);
		display: grid;
		place-items: center;
		background: var(--surface-3);
		border: 1px solid var(--hairline);
		color: var(--bs-body-color);
		text-decoration: none;
		transition: transform 0.18s var(--ease-spring), background 0.18s var(--ease-soft);
	}
	.back-btn:hover { background: var(--surface-2); color: var(--bs-body-color); }
	.back-btn:active { transform: scale(0.94); }
	h1.title {
		font-size: 1.25rem;
		font-weight: 700;
		letter-spacing: -0.025em;
		margin: 0;
		flex: 1;
		color: var(--bs-secondary-color);
	}
	.edit-btn {
		padding: 8px 16px;
		border-radius: var(--radius-pill);
		background: var(--surface-3);
		border: 1px solid var(--hairline);
		color: var(--bs-body-color);
		font-size: 0.85rem;
		font-weight: 600;
		display: inline-flex;
		gap: 6px;
		align-items: center;
		cursor: pointer;
		transition: all 0.18s var(--ease-soft);
	}
	.edit-btn:hover {
		background: var(--brand-gradient-soft);
		border-color: rgba(139, 92, 246, 0.3);
	}

	/* Hero card */
	.hero-card {
		position: relative;
		padding: 2.2rem 1.8rem 1.8rem;
		border-radius: var(--radius-xl);
		background: var(--surface-1);
		border: 1px solid var(--hairline);
		backdrop-filter: blur(24px) saturate(180%);
		overflow: hidden;
		margin-bottom: 1.2rem;
	}
	.hero-card::before {
		content: '';
		position: absolute;
		inset: -50% -20% auto auto;
		width: 80%;
		height: 100%;
		background: radial-gradient(circle, color-mix(in srgb, var(--c) 28%, transparent), transparent 65%);
		filter: blur(40px);
		pointer-events: none;
	}
	.hero-content { position: relative; z-index: 1; }

	.hero-top {
		display: flex;
		align-items: center;
		gap: 18px;
		margin-bottom: 1.8rem;
	}
	.h-icon {
		width: 72px;
		height: 72px;
		border-radius: 22px;
		display: grid;
		place-items: center;
		font-size: 1.85rem;
		background: color-mix(in srgb, var(--c) 18%, transparent);
		color: var(--c);
		flex-shrink: 0;
		position: relative;
	}
	.h-icon::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: 22px;
		border: 1px solid color-mix(in srgb, var(--c) 30%, transparent);
	}
	.h-name {
		font-size: clamp(1.4rem, 4vw, 2rem);
		font-weight: 800;
		letter-spacing: -0.03em;
		line-height: 1.1;
	}
	.h-meta {
		display: flex;
		gap: 12px;
		flex-wrap: wrap;
		font-size: 0.82rem;
		color: var(--bs-secondary-color);
		margin-top: 6px;
	}
	.h-meta span {
		display: inline-flex;
		align-items: center;
		gap: 5px;
	}
	.cat-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--c);
	}

	.stat-row {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.75rem;
	}
	.stat-box {
		padding: 1rem 0.6rem;
		border-radius: var(--radius-md);
		background: var(--surface-3);
		text-align: center;
		border: 1px solid var(--hairline);
	}
	.stat-num {
		font-size: clamp(1.2rem, 4vw, 1.7rem);
		font-weight: 800;
		letter-spacing: -0.025em;
		line-height: 1;
	}
	.stat-lbl {
		font-size: 0.68rem;
		color: var(--bs-secondary-color);
		margin-top: 4px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 600;
	}

	/* Achievements */
	.ach-card {
		padding: 1.4rem;
		border-radius: var(--radius-lg);
		background: var(--surface-1);
		border: 1px solid var(--hairline);
		backdrop-filter: blur(24px) saturate(180%);
		margin-bottom: 1rem;
	}
	.card-title {
		font-size: 0.78rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--bs-secondary-color);
		margin-bottom: 0.9rem;
	}
	.badges-row {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-bottom: 0.7rem;
	}
	.badge-chip {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		padding: 5px 12px;
		border-radius: var(--radius-pill);
		font-size: 0.76rem;
		font-weight: 700;
		border: 1px solid;
		white-space: nowrap;
	}
	.next-badge {
		font-size: 0.82rem;
		color: var(--bs-secondary-color);
		margin-top: 4px;
	}

	/* Heatmap */
	.heatmap-card {
		padding: 1.4rem;
		border-radius: var(--radius-lg);
		background: var(--surface-1);
		border: 1px solid var(--hairline);
		backdrop-filter: blur(24px) saturate(180%);
		margin-bottom: 1rem;
	}
	.heatmap-head {
		display: flex;
		align-items: center;
		gap: 14px;
		margin-bottom: 1.1rem;
		flex-wrap: wrap;
	}
	.period-select {
		background: var(--surface-3);
		border: 1px solid var(--hairline);
		border-radius: var(--radius-pill);
		color: var(--bs-body-color);
		font-size: 0.82rem;
		font-weight: 600;
		padding: 6px 30px 6px 14px;
		cursor: pointer;
		outline: none;
		appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%238892a4'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 12px center;
		transition: border-color 0.18s var(--ease-soft);
	}
	.period-select:focus { border-color: rgba(139, 92, 246, 0.55); }

	.heatmap-scroll {
		overflow-x: auto;
		padding-bottom: 8px;
		touch-action: pan-x;
		-webkit-overflow-scrolling: touch;
	}
	.heatmap-inner {
		display: flex;
		flex-direction: column;
		gap: 4px;
		width: max-content;
	}
	.heatmap-col-headers {
		display: flex;
		gap: 4px;
		padding-left: 22px;
		padding-right: 22px;
	}
	.col-header {
		width: 13px;
		flex-shrink: 0;
		font-size: 0.62rem;
		color: var(--bs-tertiary-color);
		white-space: nowrap;
		overflow: visible;
		line-height: 1;
		font-weight: 600;
	}
	.heatmap-row {
		display: flex;
		align-items: center;
		gap: 4px;
	}
	.day-label {
		font-size: 0.6rem;
		color: var(--bs-tertiary-color);
		width: 18px;
		flex-shrink: 0;
		text-align: right;
		font-weight: 600;
	}
	.day-label-right {
		text-align: left;
		padding-left: 4px;
	}
	.hm-cell {
		width: 13px;
		height: 13px;
		border-radius: 3px;
		flex-shrink: 0;
		transition: background 0.2s, transform 0.15s;
	}
	.hm-cell:hover { transform: scale(1.4); }

	.legend {
		display: flex;
		align-items: center;
		gap: 8px;
		justify-content: flex-end;
		font-size: 0.72rem;
		color: var(--bs-tertiary-color);
		margin-top: 6px;
	}
	.legend-cell {
		width: 11px;
		height: 11px;
		border-radius: 3px;
	}

	/* Edit sheet (modal-ish) */
	.edit-sheet {
		padding: 1.4rem;
		border-radius: var(--radius-lg);
		background: var(--surface-1);
		border: 1px solid var(--hairline);
		backdrop-filter: blur(24px) saturate(180%);
		margin-bottom: 1rem;
	}
	.sheet-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.1rem;
	}
	.sheet-title {
		font-size: 1rem;
		font-weight: 700;
		letter-spacing: -0.02em;
	}
	.close-btn {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: var(--surface-3);
		border: 1px solid var(--hairline);
		color: var(--bs-body-color);
		display: grid;
		place-items: center;
		cursor: pointer;
		transition: background 0.18s var(--ease-soft);
	}
	.close-btn:hover { background: var(--surface-2); }

	.field-lbl {
		font-size: 0.74rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--bs-secondary-color);
		margin: 1rem 0 0.5rem;
	}
	.field-lbl:first-child { margin-top: 0; }

	.text-input {
		width: 100%;
		padding: 12px 16px;
		background: var(--surface-input);
		border: 1px solid var(--hairline);
		border-radius: var(--radius-md);
		color: var(--bs-body-color);
		font-size: 1rem;
		font-weight: 600;
		outline: none;
		transition: border-color 0.18s var(--ease-soft);
	}
	.text-input:focus { border-color: rgba(139, 92, 246, 0.55); }

	.cat-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.cat-chip {
		--cc: var(--brand-2);
		padding: 8px 14px;
		border-radius: var(--radius-pill);
		font-size: 0.82rem;
		font-weight: 600;
		background: var(--surface-3);
		border: 1px solid var(--hairline);
		color: var(--bs-secondary-color);
		cursor: pointer;
		transition: all 0.2s var(--ease-soft);
	}
	.cat-chip.active {
		background: color-mix(in srgb, var(--cc) 18%, transparent);
		border-color: color-mix(in srgb, var(--cc) 50%, transparent);
		color: var(--cc);
	}

	.icon-search-wrap {
		position: relative;
		margin-bottom: 0.7rem;
	}
	.icon-search-wrap i {
		position: absolute;
		left: 14px;
		top: 50%;
		transform: translateY(-50%);
		color: var(--bs-tertiary-color);
	}
	.icon-search {
		width: 100%;
		padding: 10px 14px 10px 38px;
		background: var(--surface-input);
		border: 1px solid var(--hairline);
		border-radius: var(--radius-md);
		color: var(--bs-body-color);
		font-size: 1rem;
		outline: none;
	}
	.icon-search:focus { border-color: rgba(139, 92, 246, 0.55); }

	.icon-scroll {
		max-height: 240px;
		overflow-y: auto;
	}
	.group-lbl {
		font-size: 0.66rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--bs-tertiary-color);
		margin: 1rem 0 0.4rem;
	}
	.group-lbl:first-child { margin-top: 0; }
	.icon-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(44px, 1fr));
		gap: 6px;
	}
	.icon-btn {
		--cc: var(--brand-2);
		aspect-ratio: 1;
		border-radius: 12px;
		display: grid;
		place-items: center;
		font-size: 1.15rem;
		cursor: pointer;
		background: var(--surface-3);
		border: 1px solid var(--hairline);
		color: var(--bs-body-color);
		transition: all 0.18s var(--ease-soft);
	}
	.icon-btn.active {
		background: color-mix(in srgb, var(--cc) 20%, transparent);
		border-color: color-mix(in srgb, var(--cc) 50%, transparent);
		color: var(--cc);
	}

	.goal-row {
		display: flex;
		align-items: stretch;
		gap: 10px;
		margin-bottom: 0.6rem;
	}
	.goal-btn {
		width: 44px;
		height: 44px;
		border-radius: var(--radius-md);
		background: var(--surface-3);
		border: 1px solid var(--hairline);
		color: var(--bs-body-color);
		font-size: 1.1rem;
		display: grid;
		place-items: center;
		cursor: pointer;
		transition: transform 0.18s var(--ease-spring), background 0.18s var(--ease-soft);
	}
	.goal-btn:hover:not(:disabled) { background: var(--surface-2); }
	.goal-btn:active:not(:disabled) { transform: scale(0.94); }
	.goal-btn:disabled { opacity: 0.35; cursor: not-allowed; }
	.goal-display {
		flex: 1;
		border-radius: var(--radius-md);
		background: var(--surface-3);
		border: 1px solid var(--hairline);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1rem;
		font-weight: 700;
		gap: 6px;
		font-variant-numeric: tabular-nums;
		letter-spacing: -0.02em;
	}
	.goal-display .x { font-weight: 500; color: var(--bs-secondary-color); }
	.goal-quick { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 0.4rem; }
	.goal-pill {
		padding: 5px 12px;
		border-radius: var(--radius-pill);
		background: var(--surface-3);
		border: 1px solid var(--hairline);
		font-size: 0.78rem;
		font-weight: 600;
		cursor: pointer;
		color: var(--bs-secondary-color);
		transition: all 0.18s var(--ease-soft);
	}
	.goal-pill:hover { color: var(--brand-2); border-color: rgba(139, 92, 246, 0.35); }
	.goal-pill.active {
		background: var(--brand-gradient-soft);
		border-color: rgba(139, 92, 246, 0.45);
		color: var(--bs-body-color);
	}

	.quick-times { display: flex; flex-wrap: wrap; gap: 6px; }
	.qt-pill {
		padding: 6px 12px;
		border-radius: var(--radius-pill);
		background: var(--surface-3);
		border: 1px solid var(--hairline);
		font-size: 0.78rem;
		font-weight: 600;
		cursor: pointer;
		color: var(--bs-secondary-color);
		transition: all 0.18s var(--ease-soft);
	}
	.qt-pill:hover { color: var(--brand-2); border-color: rgba(139, 92, 246, 0.35); }
	.qt-pill.active {
		background: var(--brand-gradient-soft);
		border-color: rgba(139, 92, 246, 0.45);
		color: var(--bs-body-color);
	}

	.notif-info {
		font-size: 0.78rem;
		margin-top: 0.5rem;
		padding: 8px 12px;
		border-radius: var(--radius-sm);
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.notif-info.granted {
		background: rgba(52, 211, 153, 0.08);
		border: 1px solid rgba(52, 211, 153, 0.25);
		color: var(--accent-green);
	}
	.notif-info.denied {
		background: rgba(244, 63, 94, 0.08);
		border: 1px solid rgba(244, 63, 94, 0.25);
		color: var(--accent-rose);
	}
	.notif-info.default {
		background: var(--surface-3);
		border: 1px solid var(--hairline);
		color: var(--bs-secondary-color);
	}

	.reminder-row {
		display: flex;
		align-items: center;
		gap: 12px;
		flex-wrap: wrap;
	}
	input[type="time"].time-input {
		width: 150px;
		padding: 10px 14px;
		background: var(--surface-input);
		border: 1px solid var(--hairline);
		border-radius: var(--radius-md);
		color: var(--bs-body-color);
		font-size: 1rem;
		outline: none;
	}
	input[type="time"].time-input:focus { border-color: rgba(139, 92, 246, 0.55); }

	.actions-row {
		display: flex;
		gap: 10px;
		margin-top: 1.4rem;
	}
	.cancel-btn {
		flex: 1;
		padding: 12px 18px;
		border-radius: var(--radius-md);
		background: var(--surface-3);
		border: 1px solid var(--hairline);
		color: var(--bs-body-color);
		font-weight: 600;
		cursor: pointer;
		transition: background 0.18s var(--ease-soft);
	}
	.cancel-btn:hover { background: var(--surface-2); }
	.save-btn {
		flex: 1;
		padding: 12px 18px;
		border-radius: var(--radius-md);
		background: var(--brand-gradient);
		color: #fff;
		border: none;
		font-weight: 700;
		cursor: pointer;
		box-shadow: var(--shadow-brand);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		transition: filter 0.18s var(--ease-soft);
	}
	.save-btn:hover { filter: brightness(1.08); }
	.save-btn:disabled { opacity: 0.5; }

	/* Delete zone */
	.delete-zone {
		padding: 1.3rem;
		border-radius: var(--radius-lg);
		background: rgba(244, 63, 94, 0.04);
		border: 1px solid rgba(244, 63, 94, 0.18);
		margin-bottom: 1rem;
	}
	.dz-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}
	.dz-title {
		font-size: 0.95rem;
		font-weight: 700;
		color: var(--accent-rose);
	}
	.dz-sub {
		font-size: 0.8rem;
		color: var(--bs-secondary-color);
		margin-top: 2px;
	}
	.danger-btn {
		padding: 8px 16px;
		border-radius: var(--radius-pill);
		background: rgba(244, 63, 94, 0.1);
		border: 1px solid rgba(244, 63, 94, 0.3);
		color: var(--accent-rose);
		font-size: 0.85rem;
		font-weight: 600;
		display: inline-flex;
		gap: 6px;
		align-items: center;
		cursor: pointer;
		transition: background 0.18s var(--ease-soft);
		flex-shrink: 0;
	}
	.danger-btn:hover { background: rgba(244, 63, 94, 0.18); }
	.danger-btn-solid {
		padding: 12px 18px;
		border-radius: var(--radius-md);
		background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%);
		border: none;
		color: #fff;
		font-weight: 700;
		cursor: pointer;
		box-shadow: 0 10px 28px rgba(244, 63, 94, 0.35);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		flex: 1;
	}

	.alert-error {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 12px 14px;
		border-radius: var(--radius-sm);
		background: rgba(244, 63, 94, 0.1);
		border: 1px solid rgba(244, 63, 94, 0.25);
		color: var(--accent-rose);
		font-size: 0.85rem;
		margin-bottom: 1rem;
	}
</style>

<div class="app-container page page-pad-bottom">
	<div class="wrap fade-up">
		<div class="head">
			<a href="/dashboard" class="back-btn" aria-label="Zurück">
				<i class="bi bi-arrow-left"></i>
			</a>
			<h1 class="title">Habit Details</h1>
			<button class="edit-btn" onclick={openEdit}>
				<i class="bi bi-pencil-fill"></i> Bearbeiten
			</button>
		</div>

		<!-- Hero card -->
		<div class="hero-card" style="--c: {color};">
			<div class="hero-content">
				<div class="hero-top">
					<div class="h-icon"><i class="bi {data.habit.icon}"></i></div>
					<div style="min-width:0;">
						<div class="h-name">{data.habit.name}</div>
						<div class="h-meta">
							<span><span class="cat-dot"></span>{category.label}</span>
							{#if isMulti}
								<span><i class="bi bi-bullseye"></i>{goal}×/Tag</span>
							{/if}
							<span><i class="bi bi-calendar3"></i>Seit {createdAt}</span>
							{#if data.habit.reminderTime}
								<span><i class="bi bi-bell-fill"></i>{data.habit.reminderTime}</span>
							{/if}
						</div>
					</div>
				</div>

				<div class="stat-row">
					<div class="stat-box">
						<div class="stat-num" style="color: {color};">
							{isMulti ? totalCompletions : totalDays}
						</div>
						<div class="stat-lbl">{isMulti ? 'Completions' : 'Erfolgreiche Tage'}</div>
					</div>
					<div class="stat-box">
						<div class="stat-num">🔥 {currentStreak}</div>
						<div class="stat-lbl">Aktuelle Streak</div>
					</div>
					<div class="stat-box">
						<div class="stat-num" style="color: var(--accent-amber);">{bestStreak}</div>
						<div class="stat-lbl">Beste Streak</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Badges -->
		{#if earnedBadges.length > 0}
			<div class="ach-card">
				<div class="card-title">Achievements</div>
				<div class="badges-row">
					{#each earnedBadges as badge}
						<span
							class="badge-chip"
							style="color:{badge.color};border-color:{badge.color}55;background:{badge.color}20;"
						>
							<i class="bi {badge.icon}"></i>{badge.label}
						</span>
					{/each}
				</div>
				{#if nextBadges.nextStreak || nextBadges.nextTotal}
					<div class="next-badge">
						<i class="bi bi-arrow-right me-1"></i>
						{#if nextBadges.nextStreak}
							Nächster Streak-Badge: <strong style="color:var(--bs-body-color);">{nextBadges.nextStreak.label}</strong>
							({nextBadges.nextStreak.days - currentStreak} Tage noch)
						{/if}
						{#if nextBadges.nextTotal}
							{#if nextBadges.nextStreak} · {/if}
							<strong style="color:var(--bs-body-color);">{nextBadges.nextTotal.label}</strong>
							({nextBadges.nextTotal.count - totalCompletions}× noch)
						{/if}
					</div>
				{/if}
			</div>
		{/if}

		<!-- Heatmap -->
		<div class="heatmap-card">
			<div class="heatmap-head">
				<div class="card-title" style="margin-bottom:0;">Verlauf</div>
				<select class="period-select" bind:value={selectedPeriod}>
					{#each PERIODS as p}
						<option value={p.id}>{p.label}</option>
					{/each}
				</select>
			</div>
			<div class="heatmap-scroll" bind:this={scrollWrap}>
				<div class="heatmap-inner">
					<div class="heatmap-col-headers">
						{#each heatmapData.colLabels as label}
							<div class="col-header">{label}</div>
						{/each}
					</div>
					{#each heatmapData.rows as row, i}
						<div class="heatmap-row">
							<span class="day-label">{DAY_LABELS[i]}</span>
							{#each row as cell}
								{@const frac = cell.phantom || cell.count <= 0 ? 0 : Math.min(1, cell.count / goal)}
								{@const alpha = frac === 0 ? 0 : 0.35 + frac * 0.65}
								<div
									class="hm-cell"
									style="background:{cell.phantom
										? 'transparent'
										: frac === 0
											? 'var(--surface-3)'
											: `color-mix(in srgb, ${color} ${alpha * 100}%, transparent)`};"
									title={cell.phantom
										? ''
										: `${cell.date}${isMulti ? ` · ${cell.count}/${goal}` : ''}${notesByDate.has(cell.date) ? ` · ${notesByDate.get(cell.date)}` : ''}`}
								></div>
							{/each}
							<span class="day-label day-label-right">{DAY_LABELS[i]}</span>
						</div>
					{/each}
				</div>
			</div>
			<div class="legend">
				<span>Weniger</span>
				<div class="legend-cell" style="background:var(--surface-3);"></div>
				<div class="legend-cell" style="background:{color}55;"></div>
				<div class="legend-cell" style="background:{color}aa;"></div>
				<div class="legend-cell" style="background:{color};"></div>
				<span>Mehr</span>
			</div>
		</div>

		<!-- Edit form -->
		{#if editing}
			<div class="edit-sheet fade-up">
				<div class="sheet-head">
					<span class="sheet-title">Habit bearbeiten</span>
					<button class="close-btn" onclick={() => (editing = false)} aria-label="Schließen">
						<i class="bi bi-x-lg"></i>
					</button>
				</div>

				{#if form?.editError}
					<div class="alert-error">
						<i class="bi bi-exclamation-circle-fill"></i>
						<span>{form.editError}</span>
					</div>
				{/if}

				<form
					method="POST"
					action="?/edit"
					use:enhance={() => {
						strongTap();
						saving = true;
						return async ({ update, result }) => {
							await update();
							saving = false;
							if (result.type === 'redirect' || result.type === 'success') {
								editing = false;
							}
						};
					}}
				>
					<input type="hidden" name="category" value={editCatId} />
					<input type="hidden" name="icon" value={editIcon} />
					<input type="hidden" name="color" value={editColor} />
					<input type="hidden" name="reminderTime" value={editReminderTime} />
					<input type="hidden" name="dailyGoal" value={editDailyGoal} />

					<div class="field-lbl">Name</div>
					<input
						type="text"
						name="name"
						class="text-input"
						maxlength="50"
						required
						bind:value={editName}
					/>

					<div class="field-lbl">Tagesziel</div>
					<div class="goal-row">
						<button
							type="button"
							class="goal-btn"
							onclick={() => bumpEditGoal(-1)}
							disabled={editDailyGoal <= 1}
							aria-label="Tagesziel verringern"
						>
							<i class="bi bi-dash"></i>
						</button>
						<div class="goal-display">{editDailyGoal} <span class="x">×/Tag</span></div>
						<button
							type="button"
							class="goal-btn"
							onclick={() => bumpEditGoal(1)}
							disabled={editDailyGoal >= 20}
							aria-label="Tagesziel erhöhen"
						>
							<i class="bi bi-plus"></i>
						</button>
					</div>
					<div class="goal-quick">
						{#each QUICK_GOALS as g}
							<button
								type="button"
								class="goal-pill {editDailyGoal === g ? 'active' : ''}"
								onclick={() => pickEditGoal(g)}
							>
								{g}×
							</button>
						{/each}
					</div>

					<div class="field-lbl">Kategorie</div>
					<div class="cat-grid">
						{#each allCategories as cat}
							{@const catId = cat.id ?? cat._id}
							<button
								type="button"
								class="cat-chip {editCatId === catId ? 'active' : ''}"
								style="--cc: {cat.color}"
								onclick={() => pickEditCat(cat)}
							>
								{cat.label}
							</button>
						{/each}
					</div>

					<div class="field-lbl">Icon</div>
					<div class="icon-search-wrap">
						<i class="bi bi-search"></i>
						<input
							type="text"
							class="icon-search"
							placeholder="Icon suchen…"
							bind:value={editIconSearch}
						/>
					</div>
					<div class="icon-scroll">
						{#each editFilteredGroups as group}
							<div class="group-lbl">{group.label}</div>
							<div class="icon-grid">
								{#each group.icons as icon}
									<button
										type="button"
										class="icon-btn {editIcon === icon ? 'active' : ''}"
										style="--cc: {editColor}"
										onclick={() => pickEditIcon(icon)}
										aria-label={icon.replace('bi-', '')}
									>
										<i class="bi {icon}"></i>
									</button>
								{/each}
							</div>
						{/each}
					</div>

					<div class="field-lbl">Erinnerung <span style="font-weight:500;text-transform:none;letter-spacing:0;color:var(--bs-tertiary-color);">(optional)</span></div>
					<div class="quick-times" style="margin-bottom:0.6rem;">
						{#each QUICK_TIMES as qt}
							<button
								type="button"
								class="qt-pill {editReminderTime === qt.value ? 'active' : ''}"
								onclick={() => pickEditQuickTime(qt.value)}
							>
								{qt.label} · {qt.value}
							</button>
						{/each}
					</div>
					<div class="reminder-row">
						<input
							type="time"
							class="time-input"
							value={editReminderTime}
							oninput={onEditTimeInput}
						/>
						{#if editReminderTime}
							<button type="button" class="close-btn" onclick={() => (editReminderTime = '')} aria-label="Erinnerung entfernen">
								<i class="bi bi-x"></i>
							</button>
						{/if}
					</div>
					{#if editReminderTime}
						{#if notifPermission === 'granted'}
							<div class="notif-info granted">
								<i class="bi bi-check-circle-fill"></i>
								Benachrichtigungen aktiv — du wirst um {editReminderTime} erinnert.
							</div>
						{:else if notifPermission === 'denied'}
							<div class="notif-info denied">
								<i class="bi bi-bell-slash-fill"></i>
								Benachrichtigungen blockiert. Aktiviere sie in den Browser-Einstellungen.
							</div>
						{:else}
							<div class="notif-info default">
								<i class="bi bi-bell-fill"></i>
								Beim Speichern wird dein Browser nach Berechtigung fragen.
							</div>
						{/if}
					{/if}

					<div class="actions-row">
						<button type="button" class="cancel-btn" onclick={() => (editing = false)}>
							Abbrechen
						</button>
						<button type="submit" class="save-btn" disabled={saving || !editName.trim()}>
							{#if saving}
								<span class="spinner-border spinner-border-sm" style="border-width:2px;"></span>
							{:else}
								<i class="bi bi-check2"></i>
							{/if}
							Speichern
						</button>
					</div>
				</form>
			</div>
		{/if}

		<!-- Delete -->
		<div class="delete-zone">
			<div class="dz-row">
				<div>
					<div class="dz-title">Habit löschen</div>
					<div class="dz-sub">Löscht den Habit und alle Einträge unwiderruflich.</div>
				</div>
				{#if !confirmDelete}
					<button class="danger-btn" onclick={() => { warn(); confirmDelete = true; }}>
						<i class="bi bi-trash3-fill"></i> Löschen
					</button>
				{/if}
			</div>

			{#if confirmDelete}
				<div style="margin-top:1rem;padding-top:1rem;border-top:1px solid rgba(244,63,94,0.2);">
					<p style="font-size:.88rem;margin-bottom:1rem;">
						Bist du sicher? <strong>{data.habit.name}</strong> und alle
						<strong>{totalCompletions} Einträge</strong> werden dauerhaft gelöscht.
					</p>
					<form method="POST" action="?/delete" use:enhance={() => { strongTap(); deleting = true; }}>
						<div class="actions-row" style="margin-top:0;">
							<button type="button" class="cancel-btn" onclick={() => (confirmDelete = false)}>
								Abbrechen
							</button>
							<button type="submit" class="danger-btn-solid" disabled={deleting}>
								{#if deleting}
									<span class="spinner-border spinner-border-sm" style="border-width:2px;"></span>
								{:else}
									<i class="bi bi-trash3-fill"></i>
								{/if}
								Ja, löschen
							</button>
						</div>
					</form>
				</div>
			{/if}
		</div>
	</div>
</div>
