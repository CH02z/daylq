<script>
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';
	import { CATEGORIES, ICON_GROUPS, getCategoryById } from '$lib/categories.js';
	import { addDays, utcDow } from '$lib/dateUtils.js';
	import { getEarnedBadges, getNextBadge } from '$lib/badges.js';

	let { data, form } = $props();

	const allCategories = $derived([...CATEGORIES, ...data.userCategories]);
	const category = $derived(getCategoryById(data.habit.category, data.userCategories));
	const color = $derived(data.habit.color || category.color);

	// --- Stats ---
	const checkinDates = $derived(new Set(data.checkins.map((c) => c.date)));
	const notesByDate = $derived(new Map(data.checkins.filter((c) => c.note).map((c) => [c.date, c.note])));
	const totalCompletions = $derived(checkinDates.size);

	const currentStreak = $derived.by(() => {
		let count = 0;
		let d = data.today;
		if (!checkinDates.has(d)) d = addDays(d, -1);
		for (let i = 0; i < 365; i++) {
			if (checkinDates.has(d)) { count++; d = addDays(d, -1); }
			else break;
		}
		return count;
	});

	const bestStreak = $derived.by(() => {
		const sorted = [...checkinDates].sort();
		let best = 0, run = 0;
		for (let i = 0; i < sorted.length; i++) {
			if (i === 0) { run = 1; best = 1; continue; }
			// Use noon UTC to avoid DST issues
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

	// --- Heatmap (timeline dropdown) ---
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
			rows[d].push({ date: cur, done: checkinDates.has(cur), phantom: false });
			cur = addDays(cur, 1);
		}
		const maxLen = Math.max(...rows.map((r) => r.length));
		for (const row of rows) {
			while (row.length < maxLen) row.push({ date: null, done: false, phantom: true });
		}

		// Column labels from the Monday row — use UTC month/year
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

	// Scroll to the right (most recent dates) whenever the period changes
	$effect(() => {
		const _ = heatmapData; // reactive dep — re-run when period changes
		if (!scrollWrap) return;
		queueMicrotask(() => { if (scrollWrap) scrollWrap.scrollLeft = scrollWrap.scrollWidth; });
	});

	// Wire up mouse-wheel → horizontal scroll (natural direction)
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

	// --- Edit form state (populated by openEdit()) ---
	let editing = $state(false);
	let editCatId = $state('');
	let editIcon = $state('');
	let editName = $state('');
	let editReminderTime = $state('');
	let saving = $state(false);
	let editIconSearch = $state('');

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

	function openEdit() {
		editCatId = data.habit.category;
		editIcon = data.habit.icon;
		editName = data.habit.name;
		editReminderTime = data.habit.reminderTime ?? '';
		editIconSearch = '';
		editing = true;
	}

	function pickEditCat(cat) {
		editCatId = cat.id ?? cat._id;
	}

	// --- Delete confirm ---
	let confirmDelete = $state(false);
	let deleting = $state(false);
</script>

<svelte:head>
	<title>{data.habit.name} – daylq</title>
</svelte:head>

<style>
	.page {
		min-height: calc(100vh - 57px);
		padding: 1.25rem 0.75rem;
		max-width: 720px;
		margin: 0 auto;
	}
	@media (min-width: 576px) {
		.page {
			padding: 1.5rem 1rem;
		}
	}
	.detail-card {
		border-radius: 16px;
		background: var(--bs-card-bg, #1a1f2e);
		border: 1px solid var(--bs-border-color, #2a3148);
		overflow: hidden;
	}
	.accent-bar {
		height: 4px;
		width: 100%;
	}
	.habit-icon {
		width: 52px;
		height: 52px;
		border-radius: 14px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.4rem;
		flex-shrink: 0;
	}
	.stat-box {
		flex: 1;
		min-width: 0;
		text-align: center;
		padding: 0.9rem 0.4rem;
		border-radius: 12px;
		background: rgba(255, 255, 255, 0.04);
	}
	.stat-num {
		font-size: clamp(1.1rem, 4vw, 1.6rem);
		font-weight: 700;
		line-height: 1;
		white-space: nowrap;
	}
	.stat-lbl {
		font-size: 0.65rem;
		color: var(--bs-secondary-color, #6b7280);
		margin-top: 3px;
		white-space: nowrap;
	}
	.heatmap-scroll {
		overflow-x: auto;
		padding-bottom: 6px;
		scrollbar-width: thin;
		scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
		touch-action: pan-x;
		-webkit-overflow-scrolling: touch;
	}
	.heatmap-scroll::-webkit-scrollbar {
		height: 5px;
	}
	.heatmap-scroll::-webkit-scrollbar-track {
		background: transparent;
	}
	.heatmap-scroll::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.15);
		border-radius: 3px;
	}
	.heatmap-inner {
		display: flex;
		flex-direction: column;
		gap: 3px;
		width: max-content;
	}
	.heatmap-col-headers {
		display: flex;
		gap: 3px;
		padding-left: 17px;  /* left day-label width (14px) + gap (3px) */
		padding-right: 17px; /* right day-label width (14px) + gap (3px) */
	}
	.col-header {
		width: 11px;
		flex-shrink: 0;
		font-size: 7px;
		color: var(--bs-secondary-color, #6b7280);
		white-space: nowrap;
		overflow: visible;
		line-height: 1;
	}
	.heatmap-row {
		display: flex;
		align-items: center;
		gap: 3px;
	}
	.day-label {
		font-size: 8px;
		color: var(--bs-secondary-color, #6b7280);
		width: 14px;
		flex-shrink: 0;
		text-align: right;
	}
	.day-label-right {
		text-align: left;
		position: sticky;
		right: 0;
		background: var(--bs-card-bg, #1a1f2e);
		padding-left: 2px;
	}
	.hm-cell {
		width: 11px;
		height: 11px;
		border-radius: 2px;
		flex-shrink: 0;
		transition: background 0.2s;
	}
	.section-label {
		font-size: 0.72rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.07em;
		color: var(--bs-secondary-color, #6b7280);
		margin-bottom: 0.6rem;
	}
	.cat-btn {
		border-radius: 10px;
		border: 2px solid transparent;
		padding: 0.45rem 0.7rem;
		font-size: 0.78rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.15s;
		background: rgba(255, 255, 255, 0.05);
		color: var(--bs-body-color);
	}
	.cat-btn.active {
		border-color: var(--cat-color);
		background: color-mix(in srgb, var(--cat-color) 15%, transparent);
		color: var(--cat-color);
	}
	.icon-btn {
		width: 44px;
		height: 44px;
		border-radius: 11px;
		border: 2px solid transparent;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.2rem;
		cursor: pointer;
		transition: all 0.15s;
		background: rgba(255, 255, 255, 0.05);
		color: var(--bs-body-color);
	}
	.icon-btn.active {
		border-color: var(--cat-color);
		background: color-mix(in srgb, var(--cat-color) 20%, transparent);
		color: var(--cat-color);
	}
	.icon-scroll {
		max-height: 200px;
		overflow-y: auto;
		scrollbar-width: thin;
		scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
	}
	.icon-scroll::-webkit-scrollbar { width: 4px; }
	.icon-scroll::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.15);
		border-radius: 2px;
	}
	.group-label {
		font-size: 0.62rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.07em;
		color: var(--bs-secondary-color, #6b7280);
		padding: 0.4rem 0 0.25rem;
	}
	.icon-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 5px;
		margin-bottom: 0.2rem;
	}
	.period-select {
		background: rgba(255, 255, 255, 0.06);
		border: 1px solid var(--bs-border-color, #252540);
		border-radius: 8px;
		color: var(--bs-body-color);
		font-size: 0.78rem;
		padding: 3px 24px 3px 8px;
		cursor: pointer;
		outline: none;
		appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%238892a4'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 7px center;
		transition: border-color 0.15s;
	}
	.period-select:focus { border-color: #8b5cf6; }
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
	.badge-next {
		font-size: 0.72rem;
		color: var(--bs-secondary-color, #6b7280);
	}
	.delete-zone {
		border-radius: 14px;
		border: 1px solid rgba(239, 68, 68, 0.25);
		background: rgba(239, 68, 68, 0.05);
		padding: 1.2rem;
	}
</style>

<div class="page">
	<!-- Back + Title -->
	<div class="d-flex align-items-center gap-3 mb-4">
		<a href="/dashboard" class="btn btn-sm btn-outline-secondary" aria-label="Zurück zum Dashboard">
			<i class="bi bi-arrow-left"></i>
		</a>
		<h4 class="fw-bold mb-0 flex-grow-1">Habit Detail</h4>
		<button class="btn btn-sm btn-outline-primary" onclick={openEdit}>
			<i class="bi bi-pencil-fill me-1"></i>Bearbeiten
		</button>
	</div>

	<!-- Habit header card -->
	<div class="detail-card mb-3">
		<div class="accent-bar" style="background:{color}"></div>
		<div class="p-4">
			<div class="d-flex align-items-center gap-3 mb-4">
				<div class="habit-icon" style="background:{color}22;color:{color}">
					<i class="bi {data.habit.icon}"></i>
				</div>
				<div>
					<div class="fw-bold" style="font-size:1.15rem;">{data.habit.name}</div>
					<div style="font-size:0.8rem;color:var(--bs-secondary-color,#6b7280);">
						<i class="bi bi-tag-fill me-1" style="color:{color};opacity:0.7;"></i>{category.label}
					</div>
					<div style="font-size:0.75rem;color:var(--bs-secondary-color,#6b7280);">
						<i class="bi bi-calendar3 me-1"></i>Erstellt {createdAt}
					</div>
				</div>
			</div>

			<!-- Stats -->
			<div class="d-flex gap-2 mb-4">
				<div class="stat-box">
					<div class="stat-num" style="color:{color};">{totalCompletions}</div>
					<div class="stat-lbl">Completions</div>
				</div>
				<div class="stat-box">
					<div class="stat-num">🔥 {currentStreak}</div>
					<div class="stat-lbl">Aktuelle Streak</div>
				</div>
				<div class="stat-box">
					<div class="stat-num" style="color:#f59e0b;">{bestStreak}</div>
					<div class="stat-lbl">Beste Streak</div>
				</div>
			</div>

			<!-- Badges -->
			{#if earnedBadges.length > 0}
				<div class="mb-4">
					<p class="section-label mb-2">Achievements</p>
					<div class="d-flex flex-wrap gap-2">
						{#each earnedBadges as badge}
							<span
								class="badge-chip"
								style="color:{badge.color};border-color:{badge.color}44;background:{badge.color}18;"
							>
								<i class="bi {badge.icon}"></i>{badge.label}
							</span>
						{/each}
					</div>
					{#if nextBadges.nextStreak || nextBadges.nextTotal}
						<div class="badge-next mt-2">
							{#if nextBadges.nextStreak}
								<i class="bi bi-arrow-right me-1"></i>Nächster Streak-Badge: <strong>{nextBadges.nextStreak.label}</strong>
								({nextBadges.nextStreak.days - currentStreak} Tage noch)
							{/if}
							{#if nextBadges.nextTotal}
								{#if nextBadges.nextStreak} · {/if}
								<strong>{nextBadges.nextTotal.label}</strong> ({nextBadges.nextTotal.count - totalCompletions}× noch)
							{/if}
						</div>
					{/if}
				</div>
			{/if}

			<!-- Heatmap -->
			<div class="d-flex align-items-center gap-2 mb-2">
				<p class="section-label mb-0">Verlauf</p>
				<select class="period-select" bind:value={selectedPeriod}>
					{#each PERIODS as p}
						<option value={p.id}>{p.label}</option>
					{/each}
				</select>
			</div>
			<div class="heatmap-scroll" bind:this={scrollWrap}>
				<div class="heatmap-inner">
					<!-- Month labels -->
					<div class="heatmap-col-headers">
						{#each heatmapData.colLabels as label}
							<div class="col-header">{label}</div>
						{/each}
					</div>
					<!-- Day rows -->
					{#each heatmapData.rows as row, i}
						<div class="heatmap-row">
							<span class="day-label">{DAY_LABELS[i]}</span>
							{#each row as cell}
								<div
									class="hm-cell"
									style="background:{cell.phantom
										? 'transparent'
										: cell.done
											? color + 'cc'
											: 'rgba(255,255,255,0.06)'}"
									title={cell.phantom
										? ''
										: notesByDate.has(cell.date)
											? `${cell.date} · ${notesByDate.get(cell.date)}`
											: cell.date}
								></div>
							{/each}
							<span class="day-label day-label-right">{DAY_LABELS[i]}</span>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>

	<!-- Edit form (inline, collapsible) -->
	{#if editing}
		<div class="detail-card mb-3">
			<div class="p-4">
				<div class="d-flex justify-content-between align-items-center mb-3">
					<span class="fw-semibold">Habit bearbeiten</span>
					<button class="btn btn-sm btn-outline-secondary" aria-label="Schließen" onclick={() => (editing = false)}>
						<i class="bi bi-x-lg"></i>
					</button>
				</div>

				{#if form?.editError}
					<div class="alert alert-danger py-2 px-3 mb-3 small">
						<i class="bi bi-exclamation-circle-fill me-1"></i>{form.editError}
					</div>
				{/if}

				<form
					method="POST"
					action="?/edit"
					use:enhance={() => {
						saving = true;
						return async ({ update }) => {
							await update();
							saving = false;
						};
					}}
				>
					<input type="hidden" name="category" value={editCatId} />
					<input type="hidden" name="icon" value={editIcon} />
					<input type="hidden" name="color" value={editColor} />
					<input type="hidden" name="reminderTime" value={editReminderTime} />

					<!-- Name -->
					<p class="section-label">Name</p>
					<input
						type="text"
						name="name"
						class="form-control mb-3"
						maxlength="50"
						required
						bind:value={editName}
						style="font-size:1rem;font-weight:600;"
					/>

					<!-- Category -->
					<p class="section-label">Kategorie</p>
					<div class="d-flex flex-wrap gap-2 mb-3">
						{#each allCategories as cat}
							{@const catId = cat.id ?? cat._id}
							<button
								type="button"
								class="cat-btn {editCatId === catId ? 'active' : ''}"
								style="--cat-color:{cat.color}"
								onclick={() => pickEditCat(cat)}
							>
								{cat.label}
							</button>
						{/each}
					</div>

					<!-- Icon with search -->
					<p class="section-label">Icon</p>
					<input
						type="text"
						class="form-control form-control-sm mb-2"
						placeholder="Suchen… (z.B. heart, book)"
						bind:value={editIconSearch}
					/>
					<div class="icon-scroll mb-4">
						{#each editFilteredGroups as group}
							<div class="group-label">{group.label}</div>
							<div class="icon-grid">
								{#each group.icons as icon}
									<button
										type="button"
										class="icon-btn {editIcon === icon ? 'active' : ''}"
										style="--cat-color:{editColor}"
										onclick={() => (editIcon = icon)}
										aria-label={icon.replace('bi-', '')}
									>
										<i class="bi {icon}"></i>
									</button>
								{/each}
							</div>
						{/each}
					</div>

					<!-- Reminder time -->
					<p class="section-label">Erinnerung <span style="font-weight:400;text-transform:none;letter-spacing:0;font-size:0.75rem;color:var(--bs-secondary-color,#6b7280);">(optional)</span></p>
					<div class="d-flex align-items-center gap-3 mb-4">
						<input
							type="time"
							class="form-control"
							style="max-width:140px;"
							bind:value={editReminderTime}
						/>
						<span style="font-size:0.78rem;color:var(--bs-secondary-color,#6b7280);">
							Tägliche Browser-Benachrichtigung
						</span>
						{#if editReminderTime}
							<button
								type="button"
								class="btn btn-sm btn-outline-secondary ms-auto"
								aria-label="Erinnerung entfernen"
								onclick={() => (editReminderTime = '')}
							>
								<i class="bi bi-x"></i>
							</button>
						{/if}
					</div>

					<div class="d-flex gap-2">
						<button
							type="button"
							class="btn btn-outline-secondary flex-grow-1"
							onclick={() => (editing = false)}
						>
							Abbrechen
						</button>
						<button
							type="submit"
							class="btn btn-primary flex-grow-1 fw-semibold"
							disabled={saving || !editName.trim()}
						>
							{#if saving}
								<span class="spinner-border spinner-border-sm me-1"></span>
							{/if}
							<i class="bi bi-check2 me-1"></i>Speichern
						</button>
					</div>
				</form>
			</div>
		</div>
	{/if}

	<!-- Delete section -->
	<div class="delete-zone">
		<div class="d-flex justify-content-between align-items-center">
			<div>
				<div class="fw-semibold" style="font-size:0.9rem;color:#ef4444;">Habit löschen</div>
				<div style="font-size:0.78rem;color:var(--bs-secondary-color,#6b7280);">
					Löscht den Habit und alle Check-in Daten unwiderruflich.
				</div>
			</div>
			{#if !confirmDelete}
				<button
					class="btn btn-sm btn-outline-danger ms-3 flex-shrink-0"
					onclick={() => (confirmDelete = true)}
				>
					<i class="bi bi-trash3-fill me-1"></i>Löschen
				</button>
			{/if}
		</div>

		{#if confirmDelete}
			<div class="mt-3 pt-3 border-top" style="border-color:rgba(239,68,68,0.2)!important;">
				<p style="font-size:0.83rem;" class="mb-3">
					Bist du sicher? <strong>{data.habit.name}</strong> und alle
					<strong>{totalCompletions} Einträge</strong> werden dauerhaft gelöscht.
				</p>
				<form method="POST" action="?/delete" use:enhance={() => { deleting = true; }}>
					<div class="d-flex gap-2">
						<button
							type="button"
							class="btn btn-outline-secondary btn-sm flex-grow-1"
							onclick={() => (confirmDelete = false)}
						>
							Abbrechen
						</button>
						<button type="submit" class="btn btn-danger btn-sm flex-grow-1 fw-semibold" disabled={deleting}>
							{#if deleting}
								<span class="spinner-border spinner-border-sm me-1"></span>
							{/if}
							<i class="bi bi-trash3-fill me-1"></i>Ja, löschen
						</button>
					</div>
				</form>
			</div>
		{/if}
	</div>
</div>
