<script>
	import { getCategoryById } from '$lib/categories.js';
	import { addDays, utcDow } from '$lib/dateUtils.js';

	let { habit, checkinDates, today, userCategories = [], onToggle, todayNote = '', onNote = null } = $props();

	const category = $derived(getCategoryById(habit.category, userCategories));
	const color = $derived(habit.color || category.color);

	const isCheckedToday = $derived(checkinDates.has(today));

	const streak = $derived.by(() => {
		let count = 0;
		let d = today;
		if (!checkinDates.has(d)) d = addDays(d, -1);
		for (let i = 0; i < 365; i++) {
			if (checkinDates.has(d)) { count++; d = addDays(d, -1); }
			else break;
		}
		return count;
	});

	// 16-week heatmap
	const heatmapRows = $derived.by(() => {
		const dow = utcDow(today);
		let cur = addDays(today, -(dow + 7 * 15));
		const rows = [[], [], [], [], [], [], []];
		while (cur <= today) {
			const d = utcDow(cur);
			rows[d].push({ date: cur, done: checkinDates.has(cur), phantom: false });
			cur = addDays(cur, 1);
		}
		const maxLen = Math.max(...rows.map((r) => r.length));
		for (const row of rows) {
			while (row.length < maxLen) row.push({ date: null, done: false, phantom: true });
		}
		return rows;
	});

	const DAY_LABELS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

	let toggling = $state(false);
	let noteText = $state('');
	let saveTimer = $state(null);

	$effect(() => { noteText = todayNote; });

	async function handleToggle(e) {
		e.preventDefault();
		e.stopPropagation();
		if (toggling) return;
		toggling = true;
		await onToggle(habit._id);
		toggling = false;
	}

	function handleNoteInput(e) {
		noteText = e.target.value;
		if (saveTimer) clearTimeout(saveTimer);
		saveTimer = setTimeout(() => {
			onNote?.(habit._id, noteText);
		}, 700);
	}
</script>

<style>
	.habit-tile {
		border-radius: 16px;
		background: var(--bs-card-bg, #1a1f2e);
		border: 1px solid var(--bs-border-color, #2a3148);
		overflow: hidden;
		transition: transform 0.15s, box-shadow 0.15s;
		display: flex;
		flex-direction: column;
		height: 100%;
	}
	.habit-tile:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
	}
	.tile-link {
		text-decoration: none;
		color: inherit;
		display: flex;
		flex-direction: column;
		flex-grow: 1;
		cursor: pointer;
	}
	.tile-link:hover { color: inherit; }
	.tile-accent {
		height: 3px;
		width: 100%;
		flex-shrink: 0;
	}
	.tile-body {
		padding: 0.875rem;
		flex-grow: 1;
		display: flex;
		flex-direction: column;
	}
	.habit-icon {
		width: 38px;
		height: 38px;
		border-radius: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.1rem;
		flex-shrink: 0;
	}
	.heatmap {
		display: flex;
		flex-direction: column;
		gap: 2px;
		margin: 0.75rem 0;
	}
	.heatmap-row {
		display: flex;
		align-items: center;
		gap: 2px;
	}
	.day-label {
		font-size: 8px;
		color: var(--bs-secondary-color, #6b7280);
		width: 14px;
		flex-shrink: 0;
		text-align: right;
		align-self: center;
	}
	.hm-cell {
		flex: 1;
		aspect-ratio: 1;
		min-width: 0;
		border-radius: 2px;
		transition: background 0.2s;
	}
	.checkin-btn {
		border-radius: 10px;
		font-size: 0.9rem;
		font-weight: 600;
		padding: 0.55rem 0.75rem;
		min-height: 44px;
		transition: all 0.15s;
		border: none;
		cursor: pointer;
		margin: 0 0.75rem 0.75rem;
		width: calc(100% - 1.5rem);
	}
	.checkin-btn.done { color: white; }
	.checkin-btn.undone {
		background: rgba(255, 255, 255, 0.07);
		color: var(--bs-body-color, #e2e8f0);
	}
	.checkin-btn.undone:hover { background: rgba(255, 255, 255, 0.12); }
	.streak-badge {
		font-size: 0.7rem;
		font-weight: 700;
		padding: 2px 7px;
		border-radius: 20px;
	}
	.note-area {
		margin: 0 0.75rem 0.75rem;
	}
	.note-input {
		width: 100%;
		border-radius: 8px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		background: rgba(255, 255, 255, 0.04);
		color: var(--bs-body-color, #e2e8f0);
		font-size: 0.82rem;
		padding: 0.4rem 0.6rem;
		resize: none;
		outline: none;
		transition: border-color 0.15s;
		font-family: inherit;
	}
	.note-input:focus {
		border-color: rgba(139, 92, 246, 0.5);
		background: rgba(139, 92, 246, 0.05);
	}
	.note-input::placeholder { color: rgba(136, 146, 164, 0.5); }
</style>

<div class="habit-tile">
	<a href="/habits/{habit._id}" class="tile-link">
		<div class="tile-accent" style="background:{color}"></div>
		<div class="tile-body">
			<!-- Header -->
			<div class="d-flex align-items-center gap-2 mb-1">
				<div class="habit-icon" style="background:{color}22;color:{color}">
					<i class="bi {habit.icon}"></i>
				</div>
				<div class="flex-grow-1 overflow-hidden">
					<div class="fw-semibold text-truncate" style="font-size:0.9rem;">{habit.name}</div>
					<div style="font-size:0.72rem;color:var(--bs-secondary-color,#6b7280);">
						{category.label}
					</div>
				</div>
				{#if streak > 0}
					<span class="streak-badge" style="background:{color}22;color:{color}">
						🔥 {streak}
					</span>
				{/if}
			</div>

			<!-- Heatmap -->
			<div class="heatmap">
				{#each heatmapRows as row, i}
					<div class="heatmap-row">
						<span class="day-label">{DAY_LABELS[i]}</span>
						{#each row as cell}
							<div
								class="hm-cell"
								style="background:{cell.phantom
									? 'transparent'
									: cell.done
										? color + 'cc'
										: 'rgba(255,255,255,0.05)'}"
								title={cell.phantom ? '' : cell.date}
							></div>
						{/each}
					</div>
				{/each}
			</div>
		</div>
	</a>

	<!-- Check-in button — outside the link so click doesn't navigate -->
	<button
		class="checkin-btn {isCheckedToday ? 'done' : 'undone'}"
		style={isCheckedToday ? `background:${color}` : ''}
		onclick={handleToggle}
		disabled={toggling}
	>
		{#if isCheckedToday}
			<i class="bi bi-check-lg me-1"></i>Heute erledigt
		{:else}
			<i class="bi bi-circle me-1"></i>Heute abhaken
		{/if}
	</button>

	<!-- Optional note (only when checked in today) -->
	{#if isCheckedToday && onNote}
		<div class="note-area">
			<textarea
				class="note-input"
				rows="2"
				placeholder="Notiz hinzufügen… (optional)"
				value={noteText}
				oninput={handleNoteInput}
			></textarea>
		</div>
	{/if}
</div>
