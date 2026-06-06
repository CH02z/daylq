<script>
	import { getCategoryById } from '$lib/categories.js';
	import { addDays, utcDow } from '$lib/dateUtils.js';
	import { tap, success, warn } from '$lib/haptic.js';

	let {
		habit,
		countMap,                    // Map<date, count>
		today,
		userCategories = [],
		onCheckinAction,             // (habitId, action) -> Promise
		todayNote = '',
		onNote = null,
		weeks = 14                   // heatmap period (controlled by Dashboard)
	} = $props();

	const category = $derived(getCategoryById(habit.category, userCategories));
	const color = $derived(habit.color || category.color);
	const goal = $derived(Math.max(1, habit.dailyGoal || 1));
	const isMulti = $derived(goal > 1);

	const todayCount = $derived(countMap.get(today) ?? 0);
	const isFullyDone = $derived(todayCount >= goal);

	const streak = $derived.by(() => {
		let count = 0;
		let d = today;
		if ((countMap.get(d) ?? 0) < goal) d = addDays(d, -1);
		for (let i = 0; i < 365; i++) {
			if ((countMap.get(d) ?? 0) >= goal) {
				count++;
				d = addDays(d, -1);
			} else break;
		}
		return count;
	});

	const DAY_LABELS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
	const MONTHS_SHORT = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

	const heatmapData = $derived.by(() => {
		const WEEKS = Math.max(2, weeks);
		const dow = utcDow(today);
		let cur = addDays(today, -(dow + 7 * (WEEKS - 1)));
		const rows = [[], [], [], [], [], [], []];
		while (cur <= today) {
			const d = utcDow(cur);
			const c = countMap.get(cur) ?? 0;
			rows[d].push({ date: cur, count: c, phantom: false });
			cur = addDays(cur, 1);
		}
		const maxLen = Math.max(...rows.map((r) => r.length));
		for (const row of rows) {
			while (row.length < maxLen) row.push({ date: null, count: 0, phantom: true });
		}

		// Month labels: scan first row (Mondays) — emit short month name where it changes
		let lastMonth = -1;
		const monthLabels = rows[0].map((cell) => {
			if (cell.phantom || !cell.date) return '';
			const d = new Date(cell.date + 'T12:00:00Z');
			const m = d.getUTCMonth();
			if (m !== lastMonth) {
				lastMonth = m;
				return MONTHS_SHORT[m];
			}
			return '';
		});

		return { rows, monthLabels, cols: maxLen };
	});

	let busy = $state(false);
	let noteText = $state('');
	let saveTimer = $state(null);
	let justChecked = $state(false);

	$effect(() => { noteText = todayNote; });

	async function doAction(e, action) {
		if (e) { e.preventDefault(); e.stopPropagation(); }
		if (busy) return;
		busy = true;
		const wasFullyDone = todayCount >= goal;
		// Haptic feedback BEFORE the await — instant response
		if (action === 'dec') warn();
		else tap();
		await onCheckinAction(habit._id, action);
		// after await, todayCount reflects the optimistic update
		const isNowFullyDone = todayCount >= goal;
		if (!wasFullyDone && isNowFullyDone) {
			success(); // celebrate goal reached
			justChecked = true;
			setTimeout(() => (justChecked = false), 700);
		}
		busy = false;
	}

	function handleNoteInput(e) {
		noteText = e.target.value;
		if (saveTimer) clearTimeout(saveTimer);
		saveTimer = setTimeout(() => {
			onNote?.(habit._id, noteText);
		}, 700);
	}

	function cellBg(cell) {
		if (cell.phantom) return 'transparent';
		if (cell.count <= 0) return 'var(--surface-3)';
		// opacity based on fraction of goal
		const frac = Math.min(1, cell.count / goal);
		// Alpha 0.3 -> 1.0 mapped from 0..1
		const alpha = 0.35 + frac * 0.65;
		return `color-mix(in srgb, ${color} ${alpha * 100}%, transparent)`;
	}

	const progressPct = $derived(Math.min(100, (todayCount / goal) * 100));
</script>

<style>
	.tile {
		--c: var(--brand-2);
		position: relative;
		display: flex;
		flex-direction: column;
		height: 100%;
		border-radius: var(--radius-lg);
		background: var(--surface-1);
		border: 1px solid var(--hairline);
		backdrop-filter: blur(20px) saturate(180%);
		-webkit-backdrop-filter: blur(20px) saturate(180%);
		overflow: hidden;
		transition:
			transform 0.3s var(--ease-spring),
			border-color 0.3s var(--ease-soft),
			box-shadow 0.3s var(--ease-soft);
	}
	.tile:hover {
		transform: translateY(-3px);
		border-color: color-mix(in srgb, var(--c) 35%, var(--hairline));
		box-shadow: 0 14px 40px rgba(0, 0, 0, 0.18), 0 0 0 1px color-mix(in srgb, var(--c) 20%, transparent);
	}

	.glow {
		position: absolute;
		top: -50%;
		right: -30%;
		width: 70%;
		height: 130%;
		background: radial-gradient(circle, color-mix(in srgb, var(--c) 30%, transparent) 0%, transparent 60%);
		filter: blur(40px);
		pointer-events: none;
		opacity: 0.6;
	}

	.tile-link {
		text-decoration: none;
		color: inherit;
		display: flex;
		flex-direction: column;
		flex-grow: 1;
		padding: 1.1rem;
		position: relative;
		z-index: 1;
	}
	.tile-link:hover { color: inherit; }

	.head {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 1rem;
	}
	.icon {
		width: 44px;
		height: 44px;
		border-radius: 13px;
		display: grid;
		place-items: center;
		font-size: 1.2rem;
		background: color-mix(in srgb, var(--c) 18%, transparent);
		color: var(--c);
		flex-shrink: 0;
		position: relative;
	}
	.icon::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: 13px;
		border: 1px solid color-mix(in srgb, var(--c) 25%, transparent);
		pointer-events: none;
	}

	.meta { min-width: 0; flex: 1; }
	.name {
		font-size: 0.96rem;
		font-weight: 700;
		letter-spacing: -0.018em;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.cat {
		font-size: 0.74rem;
		color: var(--bs-secondary-color);
		margin-top: 1px;
		font-weight: 500;
		display: flex;
		gap: 6px;
		align-items: center;
	}
	.goal-tag {
		font-size: 0.66rem;
		font-weight: 700;
		padding: 1px 6px;
		border-radius: var(--radius-pill);
		background: var(--surface-3);
		color: var(--bs-tertiary-color);
	}

	.streak {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-size: 0.74rem;
		font-weight: 700;
		padding: 4px 9px;
		border-radius: var(--radius-pill);
		background: color-mix(in srgb, var(--c) 16%, transparent);
		color: var(--c);
		flex-shrink: 0;
	}

	.heatmap-wrap {
		--cell-max: 22px;
		display: flex;
		flex-direction: column;
		gap: 3px;
		width: 100%;
	}
	.month-row {
		display: grid;
		grid-template-columns: 18px repeat(var(--cols, 14), minmax(0, var(--cell-max)));
		gap: 3px;
		padding-bottom: 2px;
		justify-content: start;
	}
	.month-lbl {
		font-size: 0.6rem;
		font-weight: 600;
		color: var(--bs-tertiary-color);
		white-space: nowrap;
		overflow: visible;
		line-height: 1;
		grid-column: span 1;
	}
	.day-row {
		display: grid;
		grid-template-columns: 18px 1fr;
		gap: 4px;
		align-items: center;
	}
	.day-lbl {
		font-size: 0.58rem;
		color: var(--bs-tertiary-color);
		font-weight: 600;
		text-align: right;
		line-height: 1;
	}
	.cells {
		display: grid;
		grid-template-columns: repeat(var(--cols, 14), minmax(0, var(--cell-max)));
		gap: 3px;
		justify-content: start;
	}
	.cell {
		aspect-ratio: 1;
		width: 100%;
		border-radius: 3px;
		transition: background 0.25s var(--ease-soft);
	}

	/* Toggle (goal=1) */
	.toggle-cta {
		margin: 0 1.1rem 1.1rem;
		position: relative;
		z-index: 1;
		padding: 14px 16px;
		border-radius: var(--radius-md);
		font-size: 0.92rem;
		font-weight: 700;
		letter-spacing: -0.01em;
		cursor: pointer;
		border: 1px solid transparent;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		min-height: 48px;
		transition:
			transform 0.18s var(--ease-spring),
			background 0.18s var(--ease-soft),
			border-color 0.18s var(--ease-soft),
			box-shadow 0.18s var(--ease-soft);
	}
	.toggle-cta:active { transform: scale(0.97); }
	.toggle-cta.undone {
		background: var(--surface-3);
		color: var(--bs-body-color);
		border-color: var(--hairline);
	}
	.toggle-cta.undone:hover {
		background: color-mix(in srgb, var(--c) 12%, var(--surface-3));
		border-color: color-mix(in srgb, var(--c) 40%, var(--hairline));
		color: var(--c);
	}
	.toggle-cta.done {
		background: var(--c);
		color: #fff;
		border-color: transparent;
		box-shadow: 0 8px 24px color-mix(in srgb, var(--c) 35%, transparent);
	}
	.toggle-cta.done:hover { filter: brightness(1.08); }
	.toggle-cta.just-checked {
		animation: pulse-success 0.7s ease-out;
	}
	@keyframes pulse-success {
		0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--c) 60%, transparent); }
		100% {
			box-shadow:
				0 0 0 14px color-mix(in srgb, var(--c) 0%, transparent),
				0 8px 24px color-mix(in srgb, var(--c) 35%, transparent);
		}
	}

	/* Multi-counter (goal>1) */
	.counter {
		margin: 0 1.1rem 1.1rem;
		position: relative;
		z-index: 1;
		display: flex;
		gap: 8px;
		align-items: stretch;
	}
	.counter-btn {
		flex-shrink: 0;
		width: 48px;
		min-height: 48px;
		border-radius: var(--radius-md);
		background: var(--surface-3);
		border: 1px solid var(--hairline);
		color: var(--bs-body-color);
		font-size: 1.2rem;
		cursor: pointer;
		display: grid;
		place-items: center;
		transition: transform 0.18s var(--ease-spring), background 0.18s var(--ease-soft), border-color 0.18s var(--ease-soft);
	}
	.counter-btn:hover:not(:disabled) {
		background: color-mix(in srgb, var(--c) 10%, var(--surface-3));
		border-color: color-mix(in srgb, var(--c) 40%, var(--hairline));
		color: var(--c);
	}
	.counter-btn:active:not(:disabled) { transform: scale(0.94); }
	.counter-btn:disabled { opacity: 0.4; cursor: not-allowed; }

	.counter-center {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 4px;
		justify-content: center;
		padding: 0 0.6rem;
		border-radius: var(--radius-md);
		background: var(--surface-3);
		border: 1px solid var(--hairline);
		position: relative;
		overflow: hidden;
		min-height: 48px;
	}
	.counter-center.full {
		background: var(--c);
		border-color: transparent;
		box-shadow: 0 8px 24px color-mix(in srgb, var(--c) 35%, transparent);
	}
	.counter-center.full .count-num,
	.counter-center.full .count-label { color: #fff; }
	.counter-center.just-checked { animation: pulse-success 0.7s ease-out; }

	.count-progress {
		position: absolute;
		left: 0; bottom: 0; right: 0;
		height: 3px;
		background: var(--c);
		transition: width 0.4s var(--ease-spring);
		opacity: 0.7;
	}
	.counter-center.full .count-progress { display: none; }
	.count-num {
		font-size: 1.05rem;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		line-height: 1;
		text-align: center;
		letter-spacing: -0.01em;
	}
	.count-num .of {
		font-size: 0.78rem;
		font-weight: 500;
		color: var(--bs-secondary-color);
	}
	.counter-center.full .count-num .of { color: rgba(255, 255, 255, 0.75); }
	.count-label {
		font-size: 0.66rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-weight: 600;
		color: var(--bs-secondary-color);
		text-align: center;
	}

	.note-area {
		margin: -0.4rem 1.1rem 1.1rem;
		position: relative;
		z-index: 1;
	}
	.note-input {
		width: 100%;
		border-radius: var(--radius-sm);
		border: 1px solid var(--hairline);
		background: var(--surface-3);
		color: var(--bs-body-color);
		font-size: 0.85rem;
		padding: 8px 12px;
		resize: none;
		outline: none;
		transition: border-color 0.18s var(--ease-soft), background 0.18s var(--ease-soft);
		font-family: inherit;
	}
	.note-input:focus {
		border-color: color-mix(in srgb, var(--c) 40%, var(--hairline));
		background: color-mix(in srgb, var(--c) 6%, var(--surface-3));
	}
	.note-input::placeholder { color: var(--bs-tertiary-color); }
</style>

<div class="tile" style="--c: {color}">
	<div class="glow" aria-hidden="true"></div>

	<a href="/habits/{habit._id}" class="tile-link">
		<div class="head">
			<div class="icon">
				<i class="bi {habit.icon}"></i>
			</div>
			<div class="meta">
				<div class="name">{habit.name}</div>
				<div class="cat">
					<span>{category.label}</span>
					{#if isMulti}<span class="goal-tag">{goal}×/Tag</span>{/if}
				</div>
			</div>
			{#if streak > 0}
				<span class="streak">
					<i class="bi bi-fire" style="font-size:.85rem;"></i>{streak}
				</span>
			{/if}
		</div>

		<div class="heatmap-wrap" style="--cols: {heatmapData.cols};" aria-hidden="true">
			<div class="month-row">
				<span></span>
				{#each heatmapData.monthLabels as lbl}
					<span class="month-lbl">{lbl}</span>
				{/each}
			</div>
			{#each heatmapData.rows as row, i}
				<div class="day-row">
					<span class="day-lbl">{DAY_LABELS[i]}</span>
					<div class="cells">
						{#each row as cell}
							<div class="cell" style="background: {cellBg(cell)};" title={cell.phantom ? '' : cell.date}></div>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</a>

	{#if isMulti}
		<div class="counter">
			<button
				class="counter-btn"
				onclick={(e) => doAction(e, 'dec')}
				disabled={busy || todayCount === 0}
				aria-label="Eins weniger"
			>
				<i class="bi bi-dash"></i>
			</button>
			<div class="counter-center {isFullyDone ? 'full' : ''} {justChecked ? 'just-checked' : ''}">
				<div class="count-num">{todayCount} <span class="of">/ {goal}</span></div>
				<div class="count-label">
					{#if isFullyDone}Heute geschafft{:else}heute{/if}
				</div>
				<div class="count-progress" style="width: {progressPct}%;"></div>
			</div>
			<button
				class="counter-btn"
				onclick={(e) => doAction(e, 'inc')}
				disabled={busy || todayCount >= goal}
				aria-label="Eins mehr"
			>
				<i class="bi bi-plus"></i>
			</button>
		</div>
	{:else}
		<button
			class="toggle-cta {isFullyDone ? 'done' : 'undone'} {justChecked ? 'just-checked' : ''}"
			onclick={(e) => doAction(e, 'toggle')}
			disabled={busy}
			aria-pressed={isFullyDone}
		>
			{#if isFullyDone}
				<i class="bi bi-check2-circle" style="font-size:1.1rem;"></i>
				Heute erledigt
			{:else}
				<i class="bi bi-circle" style="font-size:1.05rem;"></i>
				Heute abhaken
			{/if}
		</button>
	{/if}

	{#if isFullyDone && onNote}
		<div class="note-area">
			<textarea
				class="note-input"
				rows="2"
				placeholder="Notiz hinzufügen…"
				value={noteText}
				oninput={handleNoteInput}
			></textarea>
		</div>
	{/if}
</div>
