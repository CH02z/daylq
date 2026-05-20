<script>
	import HabitTile from '$lib/components/HabitTile.svelte';
	import { getCategoryById } from '$lib/categories.js';
	import { addDays } from '$lib/dateUtils.js';
	import { getEarnedBadges, getNextBadge, STREAK_BADGES, TOTAL_BADGES } from '$lib/badges.js';
	import { onMount } from 'svelte';

	let { data } = $props();

	const hour = new Date().getHours();
	const greeting = hour < 12 ? 'Guten Morgen' : hour < 18 ? 'Guten Tag' : 'Guten Abend';

	// Reactive checkin state — key: habitId, value: Set of dates
	let checkinsByHabit = $state(new Map());
	// Today's notes — key: habitId, value: note string
	let todayNotes = $state(new Map());

	// Sync local state whenever server data changes (e.g. after navigation/invalidation)
	$effect(() => { checkinsByHabit = buildCheckinMap(data.checkins); });
	$effect(() => { todayNotes = buildNoteMap(data.todayCheckins); });

	function buildCheckinMap(checkins) {
		const map = new Map();
		for (const c of checkins) {
			if (!map.has(c.habitId)) map.set(c.habitId, new Set());
			map.get(c.habitId).add(c.date);
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

	function getCheckinSet(habitId) {
		return checkinsByHabit.get(habitId) ?? new Set();
	}

	function getTodayNote(habitId) {
		return todayNotes.get(habitId) ?? '';
	}

	async function toggleCheckin(habitId) {
		const today = data.today;
		const set = new Set(checkinsByHabit.get(habitId) ?? []);
		if (set.has(today)) {
			set.delete(today);
			todayNotes = new Map(todayNotes);
			todayNotes.delete(habitId);
		} else {
			set.add(today);
		}
		checkinsByHabit = new Map(checkinsByHabit).set(habitId, set);

		try {
			await fetch('/api/checkin', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ habitId })
			});
		} catch {
			// Revert on error
			const revert = new Set(checkinsByHabit.get(habitId) ?? []);
			if (revert.has(today)) revert.delete(today);
			else revert.add(today);
			checkinsByHabit = new Map(checkinsByHabit).set(habitId, revert);
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
		data.habits.filter((h) => checkinsByHabit.get(h._id)?.has(data.today)).length
	);

	function calcStreak(habitId) {
		const set = checkinsByHabit.get(habitId) ?? new Set();
		let count = 0;
		let d = data.today;
		if (!set.has(d)) d = addDays(d, -1);
		for (let i = 0; i < 365; i++) {
			if (set.has(d)) { count++; d = addDays(d, -1); }
			else break;
		}
		return count;
	}

	const bestStreak = $derived(Math.max(0, ...data.habits.map((h) => calcStreak(h._id))));

	// Account-level earned badges (based on total completions)
	const accountBadges = $derived(
		TOTAL_BADGES.filter((b) => data.totalCheckinCount >= b.count)
	);
	const nextTotalBadge = $derived(
		TOTAL_BADGES.find((b) => data.totalCheckinCount < b.count)
	);

	// Last 7 days completion rate
	const weekData = $derived.by(() => {
		const SHORT = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
		return Array.from({ length: 7 }, (_, i) => {
			const ds = addDays(data.today, i - 6);
			const dow = new Date(ds + 'T12:00:00Z').getUTCDay();
			const done = data.habits.filter((h) => checkinsByHabit.get(h._id)?.has(ds)).length;
			return { label: SHORT[dow], done, isToday: ds === data.today };
		});
	});
	const maxDone = $derived(Math.max(1, ...weekData.map((d) => d.done)));

	// Weekday stats (last 90 days)
	const weekdayStats = $derived.by(() => {
		const LABELS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
		const counts = new Array(7).fill(0);
		for (const c of data.checkins) {
			const dow = new Date(c.date + 'T12:00:00Z').getUTCDay();
			counts[dow]++;
		}
		const maxCount = Math.max(1, ...counts);
		// Reorder Mo–So (index 1→6, then 0)
		return [1, 2, 3, 4, 5, 6, 0].map((i) => ({
			label: LABELS[i],
			count: counts[i],
			pct: counts[i] / maxCount
		}));
	});
	const topWeekday = $derived(
		weekdayStats.reduce((best, d) => (d.count > best.count ? d : best), weekdayStats[0])
	);

	// Category breakdown
	const catStats = $derived.by(() => {
		const map = new Map();
		for (const h of data.habits) {
			const cat = getCategoryById(h.category, data.userCategories);
			const key = cat.id ?? cat._id;
			if (!map.has(key)) map.set(key, { cat, count: 0, done: 0 });
			const entry = map.get(key);
			entry.count++;
			if (checkinsByHabit.get(h._id)?.has(data.today)) entry.done++;
		}
		return [...map.values()];
	});

	// Reminder scheduling (browser Notifications API)
	onMount(() => {
		scheduleReminders();
	});

	function scheduleReminders() {
		if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
		const now = new Date();
		for (const habit of data.habits) {
			if (!habit.reminderTime) continue;
			const [h, m] = habit.reminderTime.split(':').map(Number);
			const reminderDate = new Date();
			reminderDate.setHours(h, m, 0, 0);
			if (checkinsByHabit.get(habit._id)?.has(data.today)) continue;
			const msUntil = reminderDate.getTime() - now.getTime();
			if (msUntil > 0 && msUntil < 86_400_000) {
				setTimeout(() => {
					if (Notification.permission === 'granted' && !checkinsByHabit.get(habit._id)?.has(data.today)) {
						new Notification(`daylq – ${habit.name}`, {
							body: 'Vergiss deinen Habit heute nicht! ✅',
							icon: '/favicon.svg'
						});
					}
				}, msUntil);
			}
		}
	}
</script>

<svelte:head>
	<title>Dashboard – daylq</title>
</svelte:head>

<style>
	.page {
		min-height: calc(100vh - 57px);
		padding: 1.5rem 1rem;
		max-width: 1200px;
		margin: 0 auto;
	}
	@media (max-width: 575px) {
		.page { padding: 1rem 0.75rem; }
	}
	.stat-tile {
		border-radius: 14px;
		padding: 1.1rem 1.2rem;
		background: var(--bs-card-bg, #1a1f2e);
		border: 1px solid var(--bs-border-color, #2a3148);
		transition: transform 0.15s;
	}
	.stat-tile:hover { transform: translateY(-1px); }
	.stat-value {
		font-size: 2rem;
		font-weight: 700;
		line-height: 1.1;
	}
	.section-title {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--bs-secondary-color, #6b7280);
		margin-bottom: 1rem;
	}
	.analytics-tile {
		border-radius: 14px;
		padding: 1.2rem;
		background: var(--bs-card-bg, #1a1f2e);
		border: 1px solid var(--bs-border-color, #2a3148);
		height: 100%;
	}
	.bar-wrap {
		display: flex;
		align-items: flex-end;
		gap: 4px;
		height: 56px;
	}
	.bar-col {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 3px;
		height: 100%;
		justify-content: flex-end;
	}
	.bar {
		width: 100%;
		border-radius: 4px 4px 0 0;
		min-height: 3px;
		transition: height 0.3s;
	}
	.bar-label {
		font-size: 9px;
		color: var(--bs-secondary-color, #6b7280);
	}
	.bar-label.top {
		color: #f59e0b;
		font-weight: 700;
	}
	.empty-state {
		border-radius: 14px;
		border: 2px dashed var(--bs-border-color, #2a3148);
		padding: 3rem 1.5rem;
		text-align: center;
	}
	.cat-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
	}
	/* Badges */
	.badge-chip {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		padding: 4px 10px;
		border-radius: 20px;
		font-size: 0.72rem;
		font-weight: 700;
		border: 1px solid;
		white-space: nowrap;
	}
	.badge-progress {
		font-size: 0.72rem;
		color: var(--bs-secondary-color, #6b7280);
	}
</style>

<div class="page">
	<!-- Header -->
	<div class="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-2">
		<div>
			<p class="mb-0" style="font-size:0.85rem;color:var(--bs-secondary-color,#6b7280);">
				{greeting},
			</p>
			<h3 class="fw-bold mb-0" style="color:#8b5cf6;">{data.user.username}</h3>
		</div>
		<div style="font-size:0.8rem;color:var(--bs-secondary-color,#6b7280);">
			<i class="bi bi-calendar3 me-1"></i>
			{new Date().toLocaleDateString('de-CH', { weekday: 'long', day: 'numeric', month: 'long' })}
		</div>
	</div>

	<!-- Stats row -->
	<div class="row g-3 mb-4">
		<div class="col-6 col-lg-3">
			<div class="stat-tile">
				<div class="stat-value" style="color:#8b5cf6;">{doneToday}/{data.habits.length}</div>
				<div style="font-size:0.75rem;color:var(--bs-secondary-color,#6b7280);">Heute erledigt</div>
			</div>
		</div>
		<div class="col-6 col-lg-3">
			<div class="stat-tile">
				<div class="stat-value">🔥 {bestStreak}</div>
				<div style="font-size:0.75rem;color:var(--bs-secondary-color,#6b7280);">Beste Streak</div>
			</div>
		</div>
		<div class="col-6 col-lg-3">
			<div class="stat-tile">
				<div class="stat-value" style="color:#10b981;">{data.totalCheckinCount}</div>
				<div style="font-size:0.75rem;color:var(--bs-secondary-color,#6b7280);">Completions gesamt</div>
			</div>
		</div>
		<div class="col-6 col-lg-3">
			<div class="stat-tile">
				<div class="stat-value" style="color:#f59e0b;">{data.habits.length}</div>
				<div style="font-size:0.75rem;color:var(--bs-secondary-color,#6b7280);">Aktive Habits</div>
			</div>
		</div>
	</div>

	<!-- Achievements -->
	{#if accountBadges.length > 0 || nextTotalBadge}
		<div class="mb-4">
			<span class="section-title d-block mb-2">
				<i class="bi bi-trophy-fill me-1" style="color:#f59e0b;"></i>Achievements
			</span>
			<div class="d-flex flex-wrap gap-2 align-items-center">
				{#each accountBadges as badge}
					<span
						class="badge-chip"
						style="color:{badge.color};border-color:{badge.color}33;background:{badge.color}18;"
					>
						<i class="bi {badge.icon}"></i>{badge.label}
					</span>
				{/each}
				{#if nextTotalBadge}
					<span class="badge-progress">
						Nächstes: {nextTotalBadge.label} –
						{nextTotalBadge.count - data.totalCheckinCount} Completions noch
					</span>
				{/if}
			</div>
		</div>
	{/if}

	<!-- Habits -->
	<div class="d-flex justify-content-between align-items-center mb-3">
		<span class="section-title mb-0">Deine Habits</span>
		<a href="/habits/new" class="btn btn-primary btn-sm text-white">
			<i class="bi bi-plus-lg me-1"></i>Neu
		</a>
	</div>

	{#if data.habits.length === 0}
		<div class="empty-state mb-4">
			<i class="bi bi-clipboard-heart fs-1 d-block mb-3" style="color:#8b5cf6;opacity:0.5;"></i>
			<h6 class="fw-semibold mb-2">Noch keine Habits</h6>
			<p style="font-size:0.85rem;color:var(--bs-secondary-color,#6b7280);" class="mb-3">
				Erstelle deinen ersten Habit und starte heute.
			</p>
			<a href="/habits/new" class="btn btn-primary btn-sm text-white">
				<i class="bi bi-plus-lg me-1"></i>Ersten Habit erstellen
			</a>
		</div>
	{:else}
		<div class="row g-3 mb-4">
			{#each data.habits as habit (habit._id)}
				<div class="col-sm-6 col-xl-4">
					<HabitTile
						{habit}
						checkinDates={getCheckinSet(habit._id)}
						today={data.today}
						userCategories={data.userCategories}
						onToggle={toggleCheckin}
						todayNote={getTodayNote(habit._id)}
						onNote={updateNote}
					/>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Analytics -->
	<span class="section-title d-block mb-3">Analytics</span>
	<div class="row g-3">
		<!-- Weekly bar chart -->
		<div class="col-md-6 col-xl-3">
			<div class="analytics-tile">
				<div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:var(--bs-secondary-color,#6b7280);">
					<i class="bi bi-bar-chart-fill me-1" style="color:#8b5cf6;"></i>Letzte 7 Tage
				</div>
				<div class="bar-wrap mt-3">
					{#each weekData as day}
						<div class="bar-col">
							<div
								class="bar"
								style="height:{(day.done / maxDone) * 100}%;background:{day.isToday ? '#8b5cf6' : '#8b5cf666'};"
							></div>
							<span class="bar-label">{day.label}</span>
						</div>
					{/each}
				</div>
				<div class="mt-2" style="font-size:0.72rem;color:var(--bs-secondary-color,#6b7280);">
					Habits abgehakt pro Tag
				</div>
			</div>
		</div>

		<!-- Best weekdays -->
		<div class="col-md-6 col-xl-3">
			<div class="analytics-tile">
				<div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:var(--bs-secondary-color,#6b7280);">
					<i class="bi bi-calendar-week me-1" style="color:#f59e0b;"></i>Beste Wochentage
				</div>
				<div class="bar-wrap mt-3">
					{#each weekdayStats as day}
						<div class="bar-col">
							<div
								class="bar"
								style="height:{day.pct * 100}%;background:{day.label === topWeekday.label ? '#f59e0b' : '#f59e0b55'};"
							></div>
							<span class="bar-label {day.label === topWeekday.label ? 'top' : ''}">{day.label}</span>
						</div>
					{/each}
				</div>
				<div class="mt-2" style="font-size:0.72rem;color:var(--bs-secondary-color,#6b7280);">
					{#if topWeekday.count > 0}
						Stärkster Tag: <strong style="color:#f59e0b;">{topWeekday.label}</strong>
						({topWeekday.count}×)
					{:else}
						Noch keine Daten
					{/if}
				</div>
			</div>
		</div>

		<!-- Category breakdown -->
		<div class="col-md-6 col-xl-3">
			<div class="analytics-tile">
				<div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:var(--bs-secondary-color,#6b7280);">
					<i class="bi bi-grid me-1" style="color:#10b981;"></i>Kategorien
				</div>
				{#if catStats.length === 0}
					<p class="text-muted small mt-3 mb-0">Keine Habits vorhanden</p>
				{:else}
					<div class="d-flex flex-column gap-2 mt-3">
						{#each catStats as { cat, count, done }}
							<div class="d-flex align-items-center gap-2">
								<div class="cat-dot" style="background:{cat.color}"></div>
								<span style="font-size:0.8rem;flex:1;">{cat.label}</span>
								<span style="font-size:0.75rem;color:var(--bs-secondary-color,#6b7280);">{done}/{count}</span>
								<div style="width:60px;height:4px;border-radius:4px;background:rgba(255,255,255,0.08);">
									<div style="height:100%;border-radius:4px;background:{cat.color};width:{count > 0 ? (done / count) * 100 : 0}%;"></div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>

		<!-- Streak leaderboard -->
		<div class="col-md-6 col-xl-3">
			<div class="analytics-tile">
				<div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:var(--bs-secondary-color,#6b7280);">
					<i class="bi bi-fire me-1" style="color:#f59e0b;"></i>Streak Ranking
				</div>
				{#if data.habits.length === 0}
					<p class="text-muted small mt-3 mb-0">Keine Habits vorhanden</p>
				{:else}
					<div class="d-flex flex-column gap-2 mt-3">
						{#each data.habits
							.map((h) => ({ ...h, streak: calcStreak(h._id) }))
							.sort((a, b) => b.streak - a.streak)
							.slice(0, 5) as h, i}
							<div class="d-flex align-items-center gap-2">
								<span style="font-size:0.7rem;color:var(--bs-secondary-color,#6b7280);width:14px;">{i + 1}.</span>
								<i class="bi {h.icon}" style="color:{h.color};font-size:0.9rem;"></i>
								<span style="font-size:0.82rem;flex:1;" class="text-truncate">{h.name}</span>
								<span style="font-size:0.8rem;font-weight:600;color:#f59e0b;">🔥 {h.streak}</span>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
