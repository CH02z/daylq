<script>
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import { CATEGORIES, ICON_GROUPS, getCategoryById } from '$lib/categories.js';
	import { tap, strongTap } from '$lib/haptic.js';

	let { data, form } = $props();

	const allCategories = $derived([...CATEGORIES, ...data.userCategories]);

	let selectedCatId = $state(CATEGORIES[4].id);
	let selectedIcon = $state(ICON_GROUPS[4].icons[0]);
	let selectedColor = $state(CATEGORIES[4].color);
	let habitName = $state('');
	let reminderTime = $state('');
	let dailyGoal = $state(1);
	let loading = $state(false);

	let notifPermission = $state('default');

	onMount(() => {
		if (typeof Notification !== 'undefined') notifPermission = Notification.permission;
	});

	const selectedCat = $derived(getCategoryById(selectedCatId, data.userCategories));

	function pickCategory(cat) {
		tap();
		selectedCatId = cat.id ?? cat._id;
		selectedColor = cat.color;
	}

	function pickIcon(icon) {
		tap();
		selectedIcon = icon;
	}

	function pickGoal(g) {
		tap();
		dailyGoal = g;
	}

	function bumpGoal(delta) {
		tap();
		dailyGoal = Math.max(1, Math.min(20, dailyGoal + delta));
	}

	let iconSearch = $state('');
	const filteredGroups = $derived.by(() => {
		const q = iconSearch.trim().toLowerCase();
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

	async function pickQuickTime(value) {
		tap();
		reminderTime = value;
		await maybeRequestPermission();
	}

	async function onTimeInput(e) {
		reminderTime = e.target.value;
		if (reminderTime) await maybeRequestPermission();
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

	const QUICK_GOALS = [1, 2, 3, 5, 8, 10];
</script>

<svelte:head>
	<title>Neuer Habit – daylq</title>
</svelte:head>

<style>
	.page { padding: 1.4rem 1rem 0; }
	@media (min-width: 768px) { .page { padding: 2rem 1rem 0; } }

	.wrap { max-width: 720px; margin: 0 auto; }

	.head {
		display: flex; align-items: center; gap: 12px; margin-bottom: 1.5rem;
	}
	.back-btn {
		width: 40px; height: 40px; border-radius: var(--radius-pill);
		display: grid; place-items: center;
		background: var(--surface-3); border: 1px solid var(--hairline);
		color: var(--bs-body-color); text-decoration: none;
		transition: transform 0.18s var(--ease-spring), background 0.18s var(--ease-soft);
	}
	.back-btn:hover { background: var(--surface-2); color: var(--bs-body-color); }
	.back-btn:active { transform: scale(0.94); }
	h1.title { font-size: 1.5rem; font-weight: 800; letter-spacing: -0.03em; margin: 0; flex: 1; }

	.preview {
		padding: 1.6rem 1.4rem; border-radius: var(--radius-xl);
		background: var(--surface-1); border: 1px solid var(--hairline);
		backdrop-filter: blur(24px) saturate(180%);
		display: flex; gap: 1rem; align-items: center;
		margin-bottom: 1.2rem; position: relative; overflow: hidden;
		transition: border-color 0.3s var(--ease-soft);
	}
	.preview::before {
		content: ''; position: absolute; inset: -50% -20% auto auto;
		width: 60%; height: 100%;
		background: radial-gradient(circle, color-mix(in srgb, var(--preview-c) 22%, transparent), transparent 65%);
		filter: blur(40px); pointer-events: none;
	}
	.preview-icon {
		width: 60px; height: 60px; border-radius: 18px;
		display: grid; place-items: center; font-size: 1.6rem;
		background: color-mix(in srgb, var(--preview-c) 18%, transparent);
		color: var(--preview-c); flex-shrink: 0; position: relative; z-index: 1;
		transition: background 0.3s var(--ease-soft), color 0.3s var(--ease-soft);
	}
	.preview-icon::after {
		content: ''; position: absolute; inset: 0; border-radius: 18px;
		border: 1px solid color-mix(in srgb, var(--preview-c) 30%, transparent);
		pointer-events: none;
	}
	.preview-content { flex: 1; min-width: 0; position: relative; z-index: 1; }
	.preview-eyebrow {
		font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
		letter-spacing: 0.08em; color: var(--bs-secondary-color); margin-bottom: 4px;
	}
	.name-input {
		width: 100%; background: transparent; border: none;
		font-size: 1.2rem; font-weight: 700; letter-spacing: -0.025em;
		color: var(--bs-body-color); padding: 0; outline: none;
	}
	.name-input::placeholder { color: var(--bs-tertiary-color); }

	.card {
		padding: 1.4rem; border-radius: var(--radius-lg);
		background: var(--surface-1); border: 1px solid var(--hairline);
		backdrop-filter: blur(24px) saturate(180%);
		margin-bottom: 1rem;
	}
	.card-head {
		display: flex; justify-content: space-between; align-items: center;
		margin-bottom: 0.9rem; gap: 1rem;
	}
	.card-title {
		font-size: 0.78rem; font-weight: 700; text-transform: uppercase;
		letter-spacing: 0.08em; color: var(--bs-secondary-color);
	}
	.card-title .opt { font-weight: 500; text-transform: none; letter-spacing: 0; color: var(--bs-tertiary-color); }
	.card-sub {
		font-size: 0.82rem; color: var(--bs-secondary-color); margin-top: -0.4rem; margin-bottom: 0.8rem;
	}
	.manage-link {
		font-size: 0.78rem; font-weight: 500; color: var(--bs-tertiary-color);
		text-decoration: none; display: inline-flex; align-items: center; gap: 4px;
	}
	.manage-link:hover { color: var(--brand-2); }

	.cat-grid { display: flex; flex-wrap: wrap; gap: 6px; }
	.cat-chip {
		--cc: var(--brand-2);
		padding: 8px 14px; border-radius: var(--radius-pill);
		font-size: 0.82rem; font-weight: 600;
		background: var(--surface-3); border: 1px solid var(--hairline);
		color: var(--bs-secondary-color); cursor: pointer;
		transition: all 0.2s var(--ease-soft);
	}
	.cat-chip:hover {
		color: var(--cc);
		border-color: color-mix(in srgb, var(--cc) 30%, var(--hairline));
	}
	.cat-chip.active {
		background: color-mix(in srgb, var(--cc) 18%, transparent);
		border-color: color-mix(in srgb, var(--cc) 50%, transparent);
		color: var(--cc);
	}

	.icon-search-wrap { position: relative; margin-bottom: 0.8rem; }
	.icon-search-wrap i {
		position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
		color: var(--bs-tertiary-color);
	}
	.icon-search {
		width: 100%; padding: 10px 14px 10px 38px;
		background: var(--surface-input); border: 1px solid var(--hairline);
		border-radius: var(--radius-md); color: var(--bs-body-color);
		font-size: 1rem; outline: none;
		transition: border-color 0.18s var(--ease-soft);
	}
	.icon-search:focus { border-color: rgba(139, 92, 246, 0.55); }

	.icon-scroll { max-height: 280px; overflow-y: auto; padding-right: 4px; }
	.group-lbl {
		font-size: 0.66rem; font-weight: 700; text-transform: uppercase;
		letter-spacing: 0.08em; color: var(--bs-tertiary-color);
		margin: 1rem 0 0.5rem;
	}
	.group-lbl:first-child { margin-top: 0; }
	.icon-grid {
		display: grid; grid-template-columns: repeat(auto-fill, minmax(44px, 1fr));
		gap: 6px;
	}
	.icon-btn {
		--cc: var(--brand-2);
		aspect-ratio: 1; border-radius: 12px;
		display: grid; place-items: center;
		font-size: 1.15rem; cursor: pointer;
		background: var(--surface-3); border: 1px solid var(--hairline);
		color: var(--bs-body-color);
		transition: all 0.18s var(--ease-soft);
	}
	.icon-btn:hover {
		background: color-mix(in srgb, var(--cc) 12%, var(--surface-3));
		color: var(--cc);
	}
	.icon-btn.active {
		background: color-mix(in srgb, var(--cc) 20%, transparent);
		border-color: color-mix(in srgb, var(--cc) 50%, transparent);
		color: var(--cc);
		transform: scale(1.05);
	}

	/* Goal counter */
	.goal-row {
		display: flex; align-items: stretch; gap: 10px;
		margin-bottom: 0.9rem;
	}
	.goal-btn {
		width: 48px; height: 48px; border-radius: var(--radius-md);
		background: var(--surface-3); border: 1px solid var(--hairline);
		color: var(--bs-body-color); font-size: 1.2rem;
		display: grid; place-items: center; cursor: pointer;
		transition: transform 0.18s var(--ease-spring), background 0.18s var(--ease-soft);
	}
	.goal-btn:hover:not(:disabled) { background: var(--surface-2); }
	.goal-btn:active:not(:disabled) { transform: scale(0.94); }
	.goal-btn:disabled { opacity: 0.35; cursor: not-allowed; }
	.goal-display {
		flex: 1; border-radius: var(--radius-md);
		background: var(--surface-3); border: 1px solid var(--hairline);
		display: flex; align-items: center; justify-content: center;
		font-size: 1.05rem; font-weight: 700;
		gap: 6px; font-variant-numeric: tabular-nums;
		letter-spacing: -0.02em;
	}
	.goal-display .x { font-weight: 500; color: var(--bs-secondary-color); }
	.goal-quick { display: flex; flex-wrap: wrap; gap: 6px; }
	.goal-pill {
		padding: 5px 12px; border-radius: var(--radius-pill);
		background: var(--surface-3); border: 1px solid var(--hairline);
		font-size: 0.78rem; font-weight: 600; cursor: pointer;
		color: var(--bs-secondary-color);
		transition: all 0.18s var(--ease-soft);
	}
	.goal-pill:hover { color: var(--brand-2); border-color: rgba(139, 92, 246, 0.35); }
	.goal-pill.active {
		background: var(--brand-gradient-soft);
		border-color: rgba(139, 92, 246, 0.45);
		color: var(--bs-body-color);
	}

	/* Reminder */
	.reminder-row {
		display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
		margin-bottom: 0.9rem;
	}
	input[type="time"].time-input {
		width: 150px; padding: 10px 14px;
		background: var(--surface-input); border: 1px solid var(--hairline);
		border-radius: var(--radius-md); color: var(--bs-body-color);
		font-size: 1rem; font-family: inherit; outline: none;
		transition: border-color 0.18s var(--ease-soft);
	}
	input[type="time"].time-input:focus { border-color: rgba(139, 92, 246, 0.55); }
	.quick-times { display: flex; flex-wrap: wrap; gap: 6px; }
	.qt-pill {
		padding: 6px 12px; border-radius: var(--radius-pill);
		background: var(--surface-3); border: 1px solid var(--hairline);
		font-size: 0.78rem; font-weight: 600; cursor: pointer;
		color: var(--bs-secondary-color);
		transition: all 0.18s var(--ease-soft);
	}
	.qt-pill:hover { color: var(--brand-2); border-color: rgba(139, 92, 246, 0.35); }
	.qt-pill.active {
		background: var(--brand-gradient-soft);
		border-color: rgba(139, 92, 246, 0.45);
		color: var(--bs-body-color);
	}
	.clear-link {
		font-size: 0.78rem; color: var(--accent-rose); background: none;
		border: none; cursor: pointer; padding: 4px 8px;
		display: inline-flex; gap: 4px; align-items: center;
	}
	.clear-link:hover { text-decoration: underline; }
	.notif-info {
		font-size: 0.78rem; margin-top: 0.5rem; padding: 8px 12px;
		border-radius: var(--radius-sm);
		display: flex; align-items: center; gap: 8px;
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

	.submit-bar { position: sticky; bottom: max(20px, env(safe-area-inset-bottom)); margin: 2rem 0 1rem; }
	.submit-btn {
		width: 100%; padding: 16px 20px; border-radius: var(--radius-md);
		background: var(--brand-gradient); color: #fff; border: none;
		font-weight: 700; font-size: 1rem; letter-spacing: -0.01em;
		box-shadow: var(--shadow-brand); cursor: pointer;
		display: inline-flex; align-items: center; justify-content: center;
		gap: 8px; min-height: 56px;
		transition: transform 0.18s var(--ease-spring), filter 0.18s var(--ease-soft);
	}
	.submit-btn:hover:not(:disabled) { filter: brightness(1.08); }
	.submit-btn:active:not(:disabled) { transform: scale(0.98); }
	.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

	.alert-error {
		display: flex; align-items: center; gap: 8px;
		padding: 12px 14px; border-radius: var(--radius-sm);
		background: rgba(244, 63, 94, 0.1);
		border: 1px solid rgba(244, 63, 94, 0.25);
		color: var(--accent-rose); font-size: 0.85rem;
		margin-bottom: 1rem;
	}
</style>

<div class="app-container page page-pad-bottom">
	<div class="wrap fade-up">
		<div class="head">
			<a href="/dashboard" class="back-btn" aria-label="Zurück">
				<i class="bi bi-arrow-left"></i>
			</a>
			<h1 class="title">Neuer Habit</h1>
		</div>

		{#if form?.error}
			<div class="alert-error">
				<i class="bi bi-exclamation-circle-fill"></i>
				<span>{form.error}</span>
			</div>
		{/if}

		<form
			method="POST"
			use:enhance={() => {
				strongTap();
				loading = true;
				return async ({ update }) => {
					await update();
					loading = false;
				};
			}}
		>
			<input type="hidden" name="category" value={selectedCatId} />
			<input type="hidden" name="icon" value={selectedIcon} />
			<input type="hidden" name="color" value={selectedColor} />
			<input type="hidden" name="reminderTime" value={reminderTime} />
			<input type="hidden" name="dailyGoal" value={dailyGoal} />

			<div class="preview" style="--preview-c: {selectedColor};">
				<div class="preview-icon">
					<i class="bi {selectedIcon}"></i>
				</div>
				<div class="preview-content">
					<div class="preview-eyebrow">Vorschau · {selectedCat.label}{#if dailyGoal > 1} · {dailyGoal}×/Tag{/if}</div>
					<input
						type="text"
						name="name"
						class="name-input"
						placeholder="Habit Name eingeben…"
						maxlength="50"
						required
						bind:value={habitName}
					/>
				</div>
			</div>

			<div class="card">
				<div class="card-head">
					<div class="card-title">Kategorie</div>
					<a href="/categories" class="manage-link">
						<i class="bi bi-gear-fill"></i> Verwalten
					</a>
				</div>
				<div class="cat-grid">
					{#each allCategories as cat}
						{@const catId = cat.id ?? cat._id}
						<button
							type="button"
							class="cat-chip {selectedCatId === catId ? 'active' : ''}"
							style="--cc: {cat.color}"
							onclick={() => pickCategory(cat)}
						>
							{cat.label}
						</button>
					{/each}
				</div>
			</div>

			<div class="card">
				<div class="card-head">
					<div class="card-title">Tagesziel</div>
				</div>
				<p class="card-sub">Wie oft pro Tag soll dieser Habit zählen? z.B. 8 Gläser Wasser, 3 Sätze Sport.</p>
				<div class="goal-row">
					<button
						type="button"
						class="goal-btn"
						onclick={() => bumpGoal(-1)}
						disabled={dailyGoal <= 1}
						aria-label="Tagesziel verringern"
					>
						<i class="bi bi-dash"></i>
					</button>
					<div class="goal-display">{dailyGoal} <span class="x">×/Tag</span></div>
					<button
						type="button"
						class="goal-btn"
						onclick={() => bumpGoal(1)}
						disabled={dailyGoal >= 20}
						aria-label="Tagesziel erhöhen"
					>
						<i class="bi bi-plus"></i>
					</button>
				</div>
				<div class="goal-quick">
					{#each QUICK_GOALS as g}
						<button
							type="button"
							class="goal-pill {dailyGoal === g ? 'active' : ''}"
							onclick={() => pickGoal(g)}
						>
							{g}×
						</button>
					{/each}
				</div>
			</div>

			<div class="card">
				<div class="card-head">
					<div class="card-title">Icon</div>
				</div>
				<div class="icon-search-wrap">
					<i class="bi bi-search"></i>
					<input
						type="text"
						class="icon-search"
						placeholder="Icon suchen (z.B. heart, book, fire)…"
						bind:value={iconSearch}
					/>
				</div>
				<div class="icon-scroll">
					{#each filteredGroups as group}
						<div class="group-lbl">{group.label}</div>
						<div class="icon-grid">
							{#each group.icons as icon}
								<button
									type="button"
									class="icon-btn {selectedIcon === icon ? 'active' : ''}"
									style="--cc: {selectedColor}"
									onclick={() => pickIcon(icon)}
									aria-label={icon.replace('bi-', '')}
								>
									<i class="bi {icon}"></i>
								</button>
							{/each}
						</div>
					{/each}
					{#if filteredGroups.length === 0}
						<p style="font-size:.9rem;color:var(--bs-tertiary-color);text-align:center;padding:1.5rem;">
							Kein Icon gefunden.
						</p>
					{/if}
				</div>
			</div>

			<div class="card">
				<div class="card-head">
					<div class="card-title">Erinnerung <span class="opt">(optional)</span></div>
				</div>
				<p class="card-sub">Tägliche Browser-Benachrichtigung wenn nicht erledigt.</p>

				<div class="quick-times" style="margin-bottom: 0.7rem;">
					{#each QUICK_TIMES as qt}
						<button
							type="button"
							class="qt-pill {reminderTime === qt.value ? 'active' : ''}"
							onclick={() => pickQuickTime(qt.value)}
						>
							{qt.label} · {qt.value}
						</button>
					{/each}
				</div>

				<div class="reminder-row">
					<input
						type="time"
						class="time-input"
						value={reminderTime}
						oninput={onTimeInput}
					/>
					{#if reminderTime}
						<button type="button" class="clear-link" onclick={() => (reminderTime = '')}>
							<i class="bi bi-x-circle"></i> Entfernen
						</button>
					{/if}
				</div>

				{#if reminderTime}
					{#if notifPermission === 'granted'}
						<div class="notif-info granted">
							<i class="bi bi-check-circle-fill"></i>
							Benachrichtigungen sind aktiviert. Du wirst um {reminderTime} erinnert.
						</div>
					{:else if notifPermission === 'denied'}
						<div class="notif-info denied">
							<i class="bi bi-bell-slash-fill"></i>
							Benachrichtigungen sind blockiert. Aktiviere sie in den Browser-Einstellungen.
						</div>
					{:else}
						<div class="notif-info default">
							<i class="bi bi-bell-fill"></i>
							Beim Speichern wird dein Browser nach Berechtigung fragen.
						</div>
					{/if}
				{/if}
			</div>

			<div class="submit-bar">
				<button type="submit" class="submit-btn" disabled={loading || !habitName.trim()}>
					{#if loading}
						<span class="spinner-border spinner-border-sm" style="border-width:2px;"></span>
					{:else}
						<i class="bi bi-stars"></i>
					{/if}
					Habit erstellen
				</button>
			</div>
		</form>
	</div>
</div>
