<script>
	import HabitTile from '$lib/components/HabitTile.svelte';
	import { getCategoryById } from '$lib/categories.js';
	import { addDays } from '$lib/dateUtils.js';
	import { TOTAL_BADGES } from '$lib/badges.js';
	import { checkinCount } from '$lib/checkinUtils.js';
	import { tap } from '$lib/haptic.js';
	import { onMount } from 'svelte';

	let { data } = $props();

	const hour = new Date().getHours();
	const greeting = hour < 5 ? 'Gute Nacht' : hour < 12 ? 'Guten Morgen' : hour < 18 ? 'Guten Tag' : 'Guten Abend';

	// Map<habitId, Map<date, count>>
	let countsByHabit = $state(new Map());
	let todayNotes = $state(new Map());

	$effect(() => { countsByHabit = buildCountMap(data.checkins, data.habits); });
	$effect(() => { todayNotes = buildNoteMap(data.todayCheckins); });

	function buildCountMap(checkins, habits) {
		const goalById = new Map(habits.map((h) => [h._id, Math.max(1, h.dailyGoal || 1)]));
		const map = new Map();
		for (const c of checkins) {
			const goal = goalById.get(c.habitId) ?? 1;
			if (!map.has(c.habitId)) map.set(c.habitId, new Map());
			map.get(c.habitId).set(c.date, checkinCount(c, goal));
		}
		return map;
	}

	function buildNoteMap(todayCheckins) {
		const map = new Map();
		for (const c of todayCheckins) {
			map.set(c.habitId, c.note ?? '');
		}
		return map;
	}

	function getCountMap(habitId) {
		return countsByHabit.get(habitId) ?? new Map();
	}

	function getTodayNote(habitId) {
		return todayNotes.get(habitId) ?? '';
	}

	function getGoal(habit) {
		return Math.max(1, habit.dailyGoal || 1);
	}

	async function handleCheckinAction(habitId, action) {
		const habit = data.habits.find((h) => h._id === habitId);
		if (!habit) return;
		const goal = getGoal(habit);
		const today = data.today;
		const current = countsByHabit.get(habitId)?.get(today) ?? 0;

		let next;
		if (action === 'inc') next = Math.min(goal, current + 1);
		else if (action === 'dec') next = Math.max(0, current - 1);
		else next = current > 0 ? 0 : goal;

		// optimistic
		const habitMap = new Map(countsByHabit.get(habitId) ?? []);
		if (next === 0) habitMap.delete(today);
		else habitMap.set(today, next);
		countsByHabit = new Map(countsByHabit).set(habitId, habitMap);
		if (next === 0) {
			todayNotes = new Map(todayNotes);
			todayNotes.delete(habitId);
		}

		try {
			const res = await fetch('/api/checkin', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ habitId, action })
			});
			const body = await res.json();
			// reconcile with server
			const reconciled = new Map(countsByHabit.get(habitId) ?? []);
			if (body.count === 0) reconciled.delete(today);
			else reconciled.set(today, body.count);
			countsByHabit = new Map(countsByHabit).set(habitId, reconciled);
		} catch {
			const revert = new Map(countsByHabit.get(habitId) ?? []);
			if (current === 0) revert.delete(today);
			else revert.set(today, current);
			countsByHabit = new Map(countsByHabit).set(habitId, revert);
		}
	}

	async function updateNote(habitId, note) {
		todayNotes = new Map(todayNotes).set(habitId, note);
		await fetch('/api/checkin/note', {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ habitId, note })
		});
	}

	// Stats
	const doneToday = $derived(
		data.habits.filter((h) => {
			const c = countsByHabit.get(h._id)?.get(data.today) ?? 0;
			return c >= getGoal(h);
		}).length
	);
	const totalHabits = $derived(data.habits.length);
	const completionPct = $derived(totalHabits === 0 ? 0 : Math.round((doneToday / totalHabits) * 100));

	function calcStreak(habit) {
		const map = countsByHabit.get(habit._id) ?? new Map();
		const goal = getGoal(habit);
		let count = 0;
		let d = data.today;
		if ((map.get(d) ?? 0) < goal) d = addDays(d, -1);
		for (let i = 0; i < 365; i++) {
			if ((map.get(d) ?? 0) >= goal) {
				count++;
				d = addDays(d, -1);
			} else break;
		}
		return count;
	}

	const bestStreak = $derived(Math.max(0, ...data.habits.map((h) => calcStreak(h))));

	const accountBadges = $derived(TOTAL_BADGES.filter((b) => data.totalCheckinCount >= b.count));
	const nextTotalBadge = $derived(TOTAL_BADGES.find((b) => data.totalCheckinCount < b.count));

	const weekData = $derived.by(() => {
		const SHORT = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
		return Array.from({ length: 7 }, (_, i) => {
			const ds = addDays(data.today, i - 6);
			const dow = new Date(ds + 'T12:00:00Z').getUTCDay();
			const done = data.habits.filter((h) => {
				const c = countsByHabit.get(h._id)?.get(ds) ?? 0;
				return c >= getGoal(h);
			}).length;
			return { label: SHORT[dow], done, isToday: ds === data.today };
		});
	});
	const maxDone = $derived(Math.max(1, ...weekData.map((d) => d.done)));

	const weekdayStats = $derived.by(() => {
		const LABELS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
		const counts = new Array(7).fill(0);
		for (const c of data.checkins) {
			const dow = new Date(c.date + 'T12:00:00Z').getUTCDay();
			counts[dow]++;
		}
		const maxCount = Math.max(1, ...counts);
		return [1, 2, 3, 4, 5, 6, 0].map((i) => ({
			label: LABELS[i],
			count: counts[i],
			pct: counts[i] / maxCount
		}));
	});
	const topWeekday = $derived(
		weekdayStats.reduce((best, d) => (d.count > best.count ? d : best), weekdayStats[0])
	);

	const catStats = $derived.by(() => {
		const map = new Map();
		for (const h of data.habits) {
			const cat = getCategoryById(h.category, data.userCategories);
			const key = cat.id ?? cat._id;
			if (!map.has(key)) map.set(key, { cat, count: 0, done: 0 });
			const entry = map.get(key);
			entry.count++;
			const c = countsByHabit.get(h._id)?.get(data.today) ?? 0;
			if (c >= getGoal(h)) entry.done++;
		}
		return [...map.values()];
	});

	// ── Category filter ──
	let selectedFilter = $state('all');
	function pickFilter(key) { tap(); selectedFilter = key; }

	// ── Heatmap period (controlled globally for all tiles) ──
	const HEATMAP_PERIODS = [
		{ id: '4w',  label: '4 W',  weeks: 4  },
		{ id: '8w',  label: '8 W',  weeks: 8  },
		{ id: '14w', label: '14 W', weeks: 14 },
		{ id: '26w', label: '6 M',  weeks: 26 }
	];
	let heatmapPeriodId = $state('14w');
	const heatmapWeeks = $derived(
		HEATMAP_PERIODS.find((p) => p.id === heatmapPeriodId)?.weeks ?? 14
	);

	function pickPeriod(id) {
		tap();
		heatmapPeriodId = id;
		try {
			localStorage.setItem('daylq:heatmap-period', id);
		} catch { /* ignore */ }
	}

	onMount(() => {
		try {
			const saved = localStorage.getItem('daylq:heatmap-period');
			if (saved && HEATMAP_PERIODS.some((p) => p.id === saved)) {
				heatmapPeriodId = saved;
			}
		} catch { /* ignore */ }
	});
	const filterOptions = $derived.by(() => {
		// build from habits that exist
		const used = new Map();
		for (const h of data.habits) {
			const cat = getCategoryById(h.category, data.userCategories);
			const key = cat.id ?? cat._id;
			if (!used.has(key)) used.set(key, cat);
		}
		return [...used.values()];
	});
	const filteredHabits = $derived.by(() => {
		if (selectedFilter === 'all') return data.habits;
		return data.habits.filter((h) => {
			const cat = getCategoryById(h.category, data.userCategories);
			const key = cat.id ?? cat._id;
			return key === selectedFilter;
		});
	});

	const RING_R = 54;
	const RING_C = 2 * Math.PI * RING_R;
	const ringOffset = $derived(RING_C - (completionPct / 100) * RING_C);

	onMount(() => {
		const timers = scheduleReminders();
		return () => timers.forEach(clearTimeout);
	});

	function scheduleReminders() {
		const timers = [];
		if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return timers;
		const now = new Date();
		for (const habit of data.habits) {
			if (!habit.reminderTime) continue;
			const parts = habit.reminderTime.split(':').map(Number);
			if (parts.length !== 2 || parts.some(Number.isNaN)) continue;
			const [h, m] = parts;
			const reminderDate = new Date();
			reminderDate.setHours(h, m, 0, 0);
			const c = countsByHabit.get(habit._id)?.get(data.today) ?? 0;
			if (c >= getGoal(habit)) continue;
			const msUntil = reminderDate.getTime() - now.getTime();
			if (msUntil > 0 && msUntil < 86_400_000) {
				const id = setTimeout(() => {
					const cNow = countsByHabit.get(habit._id)?.get(data.today) ?? 0;
					if (Notification.permission === 'granted' && cNow < getGoal(habit)) {
						new Notification(`daylq – ${habit.name}`, {
							body: 'Vergiss deinen Habit heute nicht.',
							icon: '/favicon.svg'
						});
					}
				}, msUntil);
				timers.push(id);
			}
		}
		return timers;
	}

	const todayLabel = new Date().toLocaleDateString('de-CH', {
		weekday: 'long',
		day: 'numeric',
		month: 'long'
	});
</script>

<svelte:head>
	<title>Dashboard – daylq</title>
</svelte:head>

<style>
	.page { padding: 1.5rem 1rem 0; }
	@media (min-width: 768px) { .page { padding: 2.2rem 1rem 0; } }

	.hero {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}
	@media (min-width: 768px) { .hero { grid-template-columns: 1.4fr 1fr; gap: 1.25rem; } }

	.hero-main {
		padding: 1.6rem 1.6rem 1.4rem;
		border-radius: var(--radius-xl);
		background: var(--surface-1);
		border: 1px solid var(--hairline);
		backdrop-filter: blur(24px) saturate(180%);
		position: relative;
		overflow: hidden;
	}
	.hero-main::before {
		content: '';
		position: absolute;
		inset: -40% -10% auto auto;
		width: 60%;
		height: 80%;
		background: radial-gradient(circle, rgba(139, 92, 246, 0.18), transparent 65%);
		filter: blur(40px);
		pointer-events: none;
	}
	.hero-main-content { position: relative; z-index: 1; }

	.greeting {
		font-size: 0.78rem;
		font-weight: 600;
		color: var(--bs-secondary-color);
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}
	.user-name {
		font-size: clamp(1.8rem, 4.5vw, 2.4rem);
		font-weight: 800;
		letter-spacing: -0.035em;
		line-height: 1.05;
		margin: 0.4rem 0 0.3rem;
	}
	.date-line {
		font-size: 0.88rem;
		color: var(--bs-secondary-color);
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}

	.ring-card {
		padding: 1.6rem;
		border-radius: var(--radius-xl);
		background: var(--surface-1);
		border: 1px solid var(--hairline);
		backdrop-filter: blur(24px) saturate(180%);
		display: flex;
		align-items: center;
		gap: 1.4rem;
		position: relative;
		overflow: hidden;
	}
	.ring-card::before {
		content: '';
		position: absolute;
		inset: -50% -30% auto auto;
		width: 80%;
		height: 100%;
		background: radial-gradient(circle, rgba(236, 72, 153, 0.16), transparent 65%);
		filter: blur(40px);
		pointer-events: none;
	}
	.ring-svg { width: 130px; height: 130px; flex-shrink: 0; position: relative; z-index: 1; }
	.ring-track { stroke: var(--surface-3); }
	.ring-fill {
		stroke: url(#ring-grad);
		transition: stroke-dashoffset 0.7s var(--ease-spring);
		filter: drop-shadow(0 0 10px rgba(139, 92, 246, 0.35));
	}
	.ring-center { position: relative; z-index: 1; flex: 1; min-width: 0; }
	.ring-pct {
		font-size: 2.2rem; font-weight: 800; letter-spacing: -0.03em; line-height: 1;
		background: var(--brand-gradient);
		-webkit-background-clip: text; background-clip: text; color: transparent;
	}
	.ring-label { font-size: 0.78rem; color: var(--bs-secondary-color); margin-top: 4px; font-weight: 500; }
	.ring-frac {
		display: inline-flex; align-items: center; gap: 4px; margin-top: 8px;
		font-size: 0.82rem; font-weight: 600; color: var(--bs-body-color);
		padding: 4px 10px; border-radius: var(--radius-pill);
		background: var(--surface-3); border: 1px solid var(--hairline);
	}

	.stat-row {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.75rem;
		margin-bottom: 1.5rem;
	}
	@media (min-width: 640px) { .stat-row { grid-template-columns: repeat(4, 1fr); gap: 1rem; } }

	.stat-tile {
		padding: 1.1rem 1.2rem;
		border-radius: var(--radius-lg);
		background: var(--surface-1);
		border: 1px solid var(--hairline);
		backdrop-filter: blur(20px) saturate(180%);
		transition: transform 0.2s var(--ease-spring);
	}
	.stat-tile:hover { transform: translateY(-2px); }
	.stat-icon {
		width: 34px; height: 34px; border-radius: 10px;
		display: grid; place-items: center;
		font-size: 0.95rem; margin-bottom: 0.6rem; color: #fff;
	}
	.stat-value { font-size: 1.65rem; font-weight: 800; letter-spacing: -0.025em; line-height: 1; }
	.stat-label { font-size: 0.74rem; color: var(--bs-secondary-color); margin-top: 4px; font-weight: 500; }

	.achievements {
		display: flex; flex-wrap: wrap; gap: 8px; align-items: center;
		margin-bottom: 1.4rem;
	}
	.ach-pill {
		display: inline-flex; align-items: center; gap: 6px;
		padding: 6px 12px; border-radius: var(--radius-pill);
		font-size: 0.78rem; font-weight: 700; border: 1px solid; white-space: nowrap;
		transition: transform 0.2s var(--ease-spring);
	}
	.ach-pill:hover { transform: translateY(-1px); }
	.ach-progress { font-size: 0.78rem; color: var(--bs-secondary-color); display: inline-flex; gap: 6px; align-items: center; }

	.section-header {
		display: flex; justify-content: space-between; align-items: end; margin-bottom: 1rem;
	}
	.section-title { font-size: 1.3rem; font-weight: 800; letter-spacing: -0.025em; }
	.section-sub { font-size: 0.85rem; color: var(--bs-secondary-color); margin-top: 2px; }
	.btn-add {
		display: inline-flex; align-items: center; gap: 6px;
		padding: 8px 14px; border-radius: var(--radius-pill);
		background: var(--brand-gradient); color: #fff;
		font-size: 0.85rem; font-weight: 600; text-decoration: none;
		box-shadow: var(--shadow-brand);
		transition: transform 0.18s var(--ease-spring), filter 0.18s var(--ease-soft);
	}
	.btn-add:hover { filter: brightness(1.08); color: #fff; }
	.btn-add:active { transform: scale(0.96); }

	/* Period segmented control */
	.period-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		margin-bottom: 1rem;
		flex-wrap: wrap;
	}
	.period-lbl {
		font-size: 0.78rem;
		font-weight: 600;
		color: var(--bs-secondary-color);
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}
	.period-segmented {
		display: inline-flex;
		gap: 3px;
		padding: 3px;
		background: var(--surface-3);
		border: 1px solid var(--hairline);
		border-radius: var(--radius-pill);
	}
	.period-seg {
		padding: 6px 14px;
		font-size: 0.78rem;
		font-weight: 600;
		border: none;
		background: transparent;
		color: var(--bs-secondary-color);
		border-radius: var(--radius-pill);
		cursor: pointer;
		min-height: 32px;
		transition: color 0.18s var(--ease-soft), background 0.18s var(--ease-soft), transform 0.18s var(--ease-spring);
		font-variant-numeric: tabular-nums;
	}
	.period-seg:hover { color: var(--bs-body-color); }
	.period-seg:active { transform: scale(0.96); }
	.period-seg.active {
		background: var(--bs-body-bg);
		color: var(--bs-body-color);
		box-shadow: var(--shadow-md);
	}

	/* Filter chips */
	.filter-row {
		display: flex;
		gap: 8px;
		margin-bottom: 1.1rem;
		overflow-x: auto;
		padding-bottom: 4px;
		scrollbar-width: none;
		scroll-snap-type: x proximity;
		-webkit-overflow-scrolling: touch;
		scroll-padding-inline: 0.5rem;
	}
	.filter-row::-webkit-scrollbar { display: none; }
	.filter-row > * { scroll-snap-align: start; }
	.filter-chip {
		--cc: var(--brand-2);
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 7px 14px;
		border-radius: var(--radius-pill);
		background: var(--surface-3);
		border: 1px solid var(--hairline);
		color: var(--bs-secondary-color);
		font-size: 0.82rem;
		font-weight: 600;
		cursor: pointer;
		white-space: nowrap;
		flex-shrink: 0;
		transition: all 0.2s var(--ease-soft);
	}
	.filter-chip:hover {
		color: var(--cc);
		border-color: color-mix(in srgb, var(--cc) 30%, var(--hairline));
	}
	.filter-chip.active {
		background: color-mix(in srgb, var(--cc) 18%, transparent);
		border-color: color-mix(in srgb, var(--cc) 45%, transparent);
		color: var(--cc);
	}
	.filter-chip .dot {
		width: 8px; height: 8px; border-radius: 50%; background: var(--cc);
	}

	.habits-grid {
		display: grid; grid-template-columns: 1fr; gap: 1rem; margin-bottom: 2rem;
	}
	@media (min-width: 640px) { .habits-grid { grid-template-columns: repeat(2, 1fr); } }
	@media (min-width: 1100px) { .habits-grid { grid-template-columns: repeat(3, 1fr); } }

	.empty {
		padding: 3rem 1.5rem; border-radius: var(--radius-xl); text-align: center;
		background: var(--surface-1); border: 1px dashed var(--hairline);
		backdrop-filter: blur(20px) saturate(180%);
	}
	.empty-icon {
		width: 64px; height: 64px; border-radius: 18px;
		display: grid; place-items: center; margin: 0 auto 1rem;
		background: var(--brand-gradient-soft); color: var(--brand-2); font-size: 1.6rem;
	}

	/* Hero empty-state with floating mockup-cards */
	.empty-hero {
		position: relative;
		padding: 2.4rem 1.5rem 2.6rem;
		border-radius: var(--radius-xl);
		background: var(--surface-1);
		border: 1px solid var(--hairline);
		backdrop-filter: blur(24px) saturate(180%);
		overflow: hidden;
		margin-bottom: 2rem;
	}
	.empty-hero::before {
		content: '';
		position: absolute;
		inset: -30% -10% auto -10%;
		height: 80%;
		background:
			radial-gradient(450px 220px at 80% 0%, rgba(236, 72, 153, 0.16), transparent 65%),
			radial-gradient(450px 220px at 20% 30%, rgba(99, 102, 241, 0.14), transparent 65%);
		filter: blur(40px);
		pointer-events: none;
	}
	.empty-mockups {
		display: flex;
		justify-content: center;
		gap: 12px;
		margin-bottom: 1.8rem;
		position: relative;
		z-index: 1;
	}
	.mock-card {
		flex: 1;
		max-width: 130px;
		padding: 0.85rem 0.7rem;
		border-radius: var(--radius-md);
		background: var(--surface-2);
		border: 1px solid var(--hairline);
		text-align: center;
		animation: floaty-mock 5s ease-in-out infinite;
	}
	.mock-card-1 { --rot: -3deg; --ty: 6px; animation-delay: 0s; }
	.mock-card-2 { --rot: 0deg; --ty: -4px; animation-delay: -1.5s; }
	.mock-card-3 { --rot: 3deg; --ty: 6px; animation-delay: -3s; }
	@keyframes floaty-mock {
		0%, 100% { transform: rotate(var(--rot, 0deg)) translateY(var(--ty, 0px)); }
		50% { transform: rotate(var(--rot, 0deg)) translateY(calc(var(--ty, 0px) - 8px)); }
	}
	.mock-icon {
		width: 36px;
		height: 36px;
		border-radius: 10px;
		display: grid;
		place-items: center;
		font-size: 1.1rem;
		margin: 0 auto 0.5rem;
	}
	.mock-name {
		font-size: 0.78rem;
		font-weight: 700;
		letter-spacing: -0.015em;
		margin-bottom: 2px;
	}
	.mock-streak {
		font-size: 0.7rem;
		color: var(--bs-secondary-color);
		font-weight: 600;
	}
	.empty-content {
		text-align: center;
		position: relative;
		z-index: 1;
	}
	.empty-emoji {
		font-size: 2.3rem;
		margin-bottom: 0.6rem;
		display: inline-block;
		animation: shimmer-emoji 3s ease-in-out infinite;
	}
	@keyframes shimmer-emoji {
		0%, 100% { transform: scale(1) rotate(0deg); }
		50% { transform: scale(1.08) rotate(-4deg); }
	}
	.empty-title {
		font-size: clamp(1.3rem, 4vw, 1.6rem);
		font-weight: 800;
		letter-spacing: -0.03em;
		margin: 0 0 0.5rem;
	}
	.empty-sub {
		font-size: 0.92rem;
		color: var(--bs-secondary-color);
		max-width: 380px;
		margin: 0 auto 1.5rem;
		line-height: 1.5;
	}
	.empty-suggestions {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		justify-content: center;
		margin-bottom: 1.8rem;
	}
	.suggestion-pill {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 8px 14px;
		border-radius: var(--radius-pill);
		background: var(--surface-3);
		border: 1px solid var(--hairline);
		color: var(--bs-body-color);
		font-size: 0.82rem;
		font-weight: 600;
		text-decoration: none;
		transition: transform 0.18s var(--ease-spring), background 0.18s var(--ease-soft);
	}
	.suggestion-pill:hover {
		background: var(--surface-2);
		transform: translateY(-2px);
		color: var(--bs-body-color);
	}
	.suggestion-pill:active { transform: scale(0.96); }
	.empty-cta {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 14px 24px;
		border-radius: var(--radius-pill);
		background: var(--brand-gradient);
		color: #fff !important;
		font-weight: 700;
		font-size: 0.95rem;
		text-decoration: none;
		box-shadow: var(--shadow-brand);
		transition: transform 0.18s var(--ease-spring), filter 0.18s var(--ease-soft);
	}
	.empty-cta:hover { filter: brightness(1.08); color: #fff; }
	.empty-cta:active { transform: scale(0.97); }

	.analytics-grid {
		display: grid; grid-template-columns: 1fr; gap: 1rem; margin-bottom: 2rem;
	}
	@media (min-width: 640px) { .analytics-grid { grid-template-columns: repeat(2, 1fr); } }
	@media (min-width: 1100px) { .analytics-grid { grid-template-columns: repeat(4, 1fr); } }

	.an-card {
		padding: 1.3rem; border-radius: var(--radius-lg);
		background: var(--surface-1); border: 1px solid var(--hairline);
		backdrop-filter: blur(20px) saturate(180%);
		display: flex; flex-direction: column; min-height: 200px;
	}
	.an-title {
		display: flex; align-items: center; gap: 8px;
		font-size: 0.78rem; font-weight: 700; letter-spacing: 0.04em;
		text-transform: uppercase; color: var(--bs-secondary-color); margin-bottom: 1rem;
	}
	.an-title i { font-size: 0.92rem; }
	.an-body { flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
	.bars { display: flex; align-items: flex-end; gap: 6px; height: 90px; }
	.bar-col {
		flex: 1; display: flex; flex-direction: column; align-items: center;
		gap: 5px; height: 100%; justify-content: flex-end;
	}
	.bar {
		width: 100%; border-radius: 5px 5px 2px 2px; min-height: 4px;
		background: var(--brand-gradient); opacity: 0.55;
		transition: height 0.5s var(--ease-spring), opacity 0.3s var(--ease-soft);
	}
	.bar.active { opacity: 1; }
	.bar-lbl { font-size: 0.66rem; color: var(--bs-tertiary-color); font-weight: 600; }
	.bar-lbl.top { color: var(--accent-amber); }
	.foot-line { margin-top: 0.7rem; font-size: 0.78rem; color: var(--bs-secondary-color); }

	.cat-list { display: flex; flex-direction: column; gap: 10px; }
	.cat-row { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; }
	.cat-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
	.cat-name {
		flex: 1; min-width: 0; white-space: nowrap; overflow: hidden;
		text-overflow: ellipsis; font-weight: 500;
	}
	.cat-frac { font-size: 0.78rem; color: var(--bs-secondary-color); font-variant-numeric: tabular-nums; }
	.cat-bar {
		width: 56px; height: 5px; border-radius: 5px;
		background: var(--surface-3); overflow: hidden; flex-shrink: 0;
	}
	.cat-bar-fill { height: 100%; border-radius: 5px; transition: width 0.5s var(--ease-spring); }

	.rank-list { display: flex; flex-direction: column; gap: 8px; }
	.rank-row { display: flex; align-items: center; gap: 10px; font-size: 0.85rem; padding: 6px 0; }
	.rank-pos {
		font-size: 0.72rem; color: var(--bs-secondary-color);
		font-weight: 700; width: 16px; font-variant-numeric: tabular-nums;
	}
	.rank-name {
		flex: 1; min-width: 0; white-space: nowrap; overflow: hidden;
		text-overflow: ellipsis; font-weight: 500;
	}
	.rank-streak { font-size: 0.82rem; font-weight: 700; color: var(--accent-amber); }
	.muted-empty { font-size: 0.82rem; color: var(--bs-tertiary-color); text-align: center; padding: 1.5rem 0; }
</style>

<div class="app-container page page-pad-bottom">
	<div class="hero fade-up">
		<div class="hero-main">
			<div class="hero-main-content">
				<div class="greeting">{greeting}</div>
				<h1 class="user-name"><span class="gradient-text">{data.user.username}</span></h1>
				<div class="date-line"><i class="bi bi-calendar3"></i> {todayLabel}</div>
			</div>
		</div>

		<div class="ring-card">
			<svg class="ring-svg" viewBox="0 0 130 130">
				<defs>
					<linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stop-color="#6366f1" />
						<stop offset="50%" stop-color="#8b5cf6" />
						<stop offset="100%" stop-color="#ec4899" />
					</linearGradient>
				</defs>
				<circle class="ring-track" cx="65" cy="65" r={RING_R} stroke-width="10" fill="none" />
				<circle
					class="ring-fill"
					cx="65" cy="65" r={RING_R}
					stroke-width="10" fill="none" stroke-linecap="round"
					stroke-dasharray={RING_C} stroke-dashoffset={ringOffset}
					transform="rotate(-90 65 65)"
				/>
			</svg>
			<div class="ring-center">
				<div class="ring-pct">{completionPct}%</div>
				<div class="ring-label">heute geschafft</div>
				<div class="ring-frac">{doneToday} von {totalHabits} Habits</div>
			</div>
		</div>
	</div>

	<div class="stat-row fade-up">
		<div class="stat-tile">
			<div class="stat-icon" style="background:linear-gradient(135deg,#6366f1,#8b5cf6);">
				<i class="bi bi-check2-circle"></i>
			</div>
			<div class="stat-value">{doneToday}/{totalHabits}</div>
			<div class="stat-label">Heute erledigt</div>
		</div>
		<div class="stat-tile">
			<div class="stat-icon" style="background:linear-gradient(135deg,#fb923c,#f59e0b);">
				<i class="bi bi-fire"></i>
			</div>
			<div class="stat-value">{bestStreak}</div>
			<div class="stat-label">Beste Streak</div>
		</div>
		<div class="stat-tile">
			<div class="stat-icon" style="background:linear-gradient(135deg,#34d399,#10b981);">
				<i class="bi bi-bullseye"></i>
			</div>
			<div class="stat-value">{data.totalCheckinCount}</div>
			<div class="stat-label">Completions gesamt</div>
		</div>
		<div class="stat-tile">
			<div class="stat-icon" style="background:linear-gradient(135deg,#ec4899,#f43f5e);">
				<i class="bi bi-stars"></i>
			</div>
			<div class="stat-value">{totalHabits}</div>
			<div class="stat-label">Aktive Habits</div>
		</div>
	</div>

	{#if accountBadges.length > 0 || nextTotalBadge}
		<div class="achievements">
			{#each accountBadges as badge}
				<span
					class="ach-pill"
					style="color:{badge.color};border-color:{badge.color}44;background:{badge.color}1f;"
				>
					<i class="bi {badge.icon}"></i>{badge.label}
				</span>
			{/each}
			{#if nextTotalBadge}
				<span class="ach-progress">
					<i class="bi bi-arrow-right"></i>
					Nächster Badge: <strong style="color:var(--bs-body-color)">{nextTotalBadge.label}</strong>
					({nextTotalBadge.count - data.totalCheckinCount} noch)
				</span>
			{/if}
		</div>
	{/if}

	<div class="section-header">
		<div>
			<div class="section-title">Deine Habits</div>
			<div class="section-sub">Tap zum Check-in. Tap auf eine Tile für Details.</div>
		</div>
		<a href="/habits/new" class="btn-add"><i class="bi bi-plus-lg"></i> Neu</a>
	</div>

	{#if data.habits.length > 0}
		<div class="period-bar">
			<span class="period-lbl"><i class="bi bi-calendar-range"></i> Heatmap-Zeitraum</span>
			<div class="period-segmented" role="tablist">
				{#each HEATMAP_PERIODS as p}
					<button
						class="period-seg {heatmapPeriodId === p.id ? 'active' : ''}"
						onclick={() => pickPeriod(p.id)}
						aria-pressed={heatmapPeriodId === p.id}
						role="tab"
					>{p.label}</button>
				{/each}
			</div>
		</div>
	{/if}

	{#if data.habits.length === 0}
		<div class="empty-hero">
			<div class="empty-mockups" aria-hidden="true">
				<div class="mock-card mock-card-1">
					<div class="mock-icon" style="background:rgba(239,68,68,0.16);color:#ef4444;">
						<i class="bi bi-droplet-fill"></i>
					</div>
					<div class="mock-name">2 Liter Wasser</div>
					<div class="mock-streak">🔥 12 Tage</div>
				</div>
				<div class="mock-card mock-card-2">
					<div class="mock-icon" style="background:rgba(59,130,246,0.16);color:#3b82f6;">
						<i class="bi bi-book-fill"></i>
					</div>
					<div class="mock-name">30 Min lesen</div>
					<div class="mock-streak">🔥 7 Tage</div>
				</div>
				<div class="mock-card mock-card-3">
					<div class="mock-icon" style="background:rgba(16,185,129,0.16);color:#10b981;">
						<i class="bi bi-peace"></i>
					</div>
					<div class="mock-name">Meditation</div>
					<div class="mock-streak">🔥 23 Tage</div>
				</div>
			</div>

			<div class="empty-content">
				<div class="empty-emoji">✨</div>
				<h3 class="empty-title">Bereit für deinen ersten Habit?</h3>
				<p class="empty-sub">
					Wähle ein Symbol, eine Farbe und ein tägliches Ziel.
					Tracking startet heute — in unter 30 Sekunden.
				</p>
				<div class="empty-suggestions">
					<a href="/habits/new" class="suggestion-pill" onclick={tap}>
						<i class="bi bi-droplet-fill" style="color:#ef4444"></i> Wasser trinken
					</a>
					<a href="/habits/new" class="suggestion-pill" onclick={tap}>
						<i class="bi bi-book-fill" style="color:#3b82f6"></i> Lesen
					</a>
					<a href="/habits/new" class="suggestion-pill" onclick={tap}>
						<i class="bi bi-peace" style="color:#10b981"></i> Meditation
					</a>
					<a href="/habits/new" class="suggestion-pill" onclick={tap}>
						<i class="bi bi-trophy-fill" style="color:#f59e0b"></i> Sport
					</a>
				</div>
				<a href="/habits/new" class="empty-cta" onclick={tap}>
					<i class="bi bi-plus-lg"></i> Ersten Habit erstellen
					<i class="bi bi-arrow-right" style="margin-left: 2px;"></i>
				</a>
			</div>
		</div>
	{:else}
		{#if filterOptions.length > 1}
			<div class="filter-row" role="tablist">
				<button
					class="filter-chip {selectedFilter === 'all' ? 'active' : ''}"
					style="--cc: var(--brand-2)"
					onclick={() => pickFilter('all')}
					role="tab"
				>
					<i class="bi bi-grid-fill" style="font-size:.85rem;"></i>
					Alle ({data.habits.length})
				</button>
				{#each filterOptions as cat}
					{@const key = cat.id ?? cat._id}
					{@const n = data.habits.filter((h) => {
						const k = (getCategoryById(h.category, data.userCategories).id ?? getCategoryById(h.category, data.userCategories)._id);
						return k === key;
					}).length}
					<button
						class="filter-chip {selectedFilter === key ? 'active' : ''}"
						style="--cc: {cat.color}"
						onclick={() => pickFilter(key)}
						role="tab"
					>
						<span class="dot"></span>
						{cat.label} ({n})
					</button>
				{/each}
			</div>
		{/if}

		{#if filteredHabits.length === 0}
			<div class="empty" style="margin-bottom: 2rem;">
				<div class="empty-icon"><i class="bi bi-funnel"></i></div>
				<h3 style="font-size:1.05rem;font-weight:700;margin:0 0 .4rem;">Keine Habits in dieser Kategorie</h3>
				<p style="font-size:.88rem;color:var(--bs-secondary-color);max-width:320px;margin:0 auto 1rem;">
					Wechsle die Kategorie oben oder erstelle einen neuen Habit.
				</p>
				<button class="btn-add" onclick={() => (selectedFilter = 'all')} style="border:none;">
					<i class="bi bi-grid-fill"></i> Alle anzeigen
				</button>
			</div>
		{:else}
			<div class="habits-grid">
				{#each filteredHabits as habit (habit._id)}
					<HabitTile
						{habit}
						countMap={getCountMap(habit._id)}
						today={data.today}
						userCategories={data.userCategories}
						onCheckinAction={handleCheckinAction}
						todayNote={getTodayNote(habit._id)}
						onNote={updateNote}
						weeks={heatmapWeeks}
					/>
				{/each}
			</div>
		{/if}
	{/if}

	<div class="section-header" style="margin-bottom:1rem;">
		<div>
			<div class="section-title">Analytics</div>
			<div class="section-sub">Erkenntnisse aus deinen letzten 90 Tagen.</div>
		</div>
	</div>

	<div class="analytics-grid">
		<div class="an-card">
			<div class="an-title">
				<i class="bi bi-bar-chart-fill" style="color:var(--brand-2);"></i> Letzte 7 Tage
			</div>
			<div class="an-body">
				<div class="bars">
					{#each weekData as day}
						<div class="bar-col">
							<div class="bar {day.isToday ? 'active' : ''}" style="height:{(day.done / maxDone) * 100}%;"></div>
							<span class="bar-lbl">{day.label}</span>
						</div>
					{/each}
				</div>
				<div class="foot-line">Habits abgehakt pro Tag</div>
			</div>
		</div>

		<div class="an-card">
			<div class="an-title">
				<i class="bi bi-calendar-week" style="color:var(--accent-amber);"></i> Beste Wochentage
			</div>
			<div class="an-body">
				<div class="bars">
					{#each weekdayStats as day}
						<div class="bar-col">
							<div
								class="bar {day.label === topWeekday.label ? 'active' : ''}"
								style="height:{day.pct * 100}%; background: {day.label === topWeekday.label ? 'linear-gradient(180deg,#fbbf24,#f59e0b)' : ''};"
							></div>
							<span class="bar-lbl {day.label === topWeekday.label ? 'top' : ''}">{day.label}</span>
						</div>
					{/each}
				</div>
				<div class="foot-line">
					{#if topWeekday.count > 0}
						Stärkster Tag: <strong style="color:var(--accent-amber);">{topWeekday.label}</strong> ({topWeekday.count}×)
					{:else}
						Noch keine Daten
					{/if}
				</div>
			</div>
		</div>

		<div class="an-card">
			<div class="an-title">
				<i class="bi bi-grid-fill" style="color:var(--accent-green);"></i> Kategorien heute
			</div>
			<div class="an-body">
				{#if catStats.length === 0}
					<div class="muted-empty">Keine Habits</div>
				{:else}
					<div class="cat-list">
						{#each catStats as { cat, count, done }}
							<div class="cat-row">
								<div class="cat-dot" style="background:{cat.color}"></div>
								<span class="cat-name">{cat.label}</span>
								<span class="cat-frac">{done}/{count}</span>
								<div class="cat-bar">
									<div class="cat-bar-fill" style="background:{cat.color};width:{count > 0 ? (done / count) * 100 : 0}%;"></div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>

		<div class="an-card">
			<div class="an-title">
				<i class="bi bi-fire" style="color:var(--accent-amber);"></i> Streak Ranking
			</div>
			<div class="an-body">
				{#if data.habits.length === 0}
					<div class="muted-empty">Keine Habits</div>
				{:else}
					<div class="rank-list">
						{#each data.habits
							.map((h) => ({ ...h, streak: calcStreak(h) }))
							.sort((a, b) => b.streak - a.streak)
							.slice(0, 5) as h, i}
							<div class="rank-row">
								<span class="rank-pos">{i + 1}.</span>
								<i class="bi {h.icon}" style="color:{h.color};font-size:.95rem;"></i>
								<span class="rank-name">{h.name}</span>
								<span class="rank-streak">🔥 {h.streak}</span>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
