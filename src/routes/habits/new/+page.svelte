<script>
	import { enhance } from '$app/forms';
	import { CATEGORIES, ICON_GROUPS, getCategoryById } from '$lib/categories.js';

	let { data, form } = $props();

	const allCategories = $derived([...CATEGORIES, ...data.userCategories]);

	let selectedCatId = $state(CATEGORIES[4].id);
	let selectedIcon = $state(ICON_GROUPS[4].icons[0]);
	let selectedColor = $state(CATEGORIES[4].color);
	let habitName = $state('');
	let reminderTime = $state('');
	let loading = $state(false);

	const selectedCat = $derived(getCategoryById(selectedCatId, data.userCategories));

	function pickCategory(cat) {
		selectedCatId = cat.id ?? cat._id;
		selectedColor = cat.color;
	}

	// Icon search
	let iconSearch = $state('');
	const filteredGroups = $derived.by(() => {
		const q = iconSearch.trim().toLowerCase();
		if (!q) return ICON_GROUPS;
		return ICON_GROUPS.map((g) => ({
			...g,
			icons: g.icons.filter((ic) => ic.replace('bi-', '').includes(q))
		})).filter((g) => g.icons.length > 0);
	});
</script>

<svelte:head>
	<title>Neuer Habit – daylq</title>
</svelte:head>

<style>
	.page-bg {
		min-height: calc(100vh - 57px);
	}
	.form-card {
		border-radius: 18px;
		max-width: 580px;
		margin: 0 auto;
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
		white-space: nowrap;
	}
	.cat-btn.active {
		border-color: var(--cat-color);
		background: color-mix(in srgb, var(--cat-color) 15%, transparent);
		color: var(--cat-color);
	}
	/* Override Bootstrap's .form-control-sm (0.875rem ≈ 14px) to prevent iOS zoom */
	:global(.form-control-sm) {
		font-size: 1rem !important;
	}
	.page-bg {
		padding: 1rem 0.75rem;
	}
	@media (min-width: 576px) {
		.page-bg {
			padding: 1.5rem 1rem;
		}
	}
	.icon-scroll {
		max-height: 220px;
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
		font-size: 0.65rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.07em;
		color: var(--bs-secondary-color, #6b7280);
		padding: 0.5rem 0 0.3rem;
	}
	.icon-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 5px;
		margin-bottom: 0.25rem;
	}
	.icon-btn {
		width: 40px;
		height: 40px;
		border-radius: 10px;
		border: 2px solid transparent;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.1rem;
		cursor: pointer;
		transition: all 0.12s;
		background: rgba(255, 255, 255, 0.05);
		color: var(--bs-body-color);
		flex-shrink: 0;
	}
	.icon-btn.active {
		border-color: var(--cat-color);
		background: color-mix(in srgb, var(--cat-color) 20%, transparent);
		color: var(--cat-color);
	}
	.icon-btn:hover:not(.active) {
		background: rgba(255, 255, 255, 0.1);
	}
	.preview-icon {
		width: 52px;
		height: 52px;
		border-radius: 14px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.4rem;
		flex-shrink: 0;
	}
	.section-label {
		font-size: 0.78rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--bs-secondary-color);
		margin-bottom: 0.6rem;
	}
</style>

<div class="page-bg">
	<div class="form-card">
		<!-- Header -->
		<div class="d-flex align-items-center gap-3 mb-4">
			<a href="/dashboard" class="btn btn-sm btn-outline-secondary" aria-label="Zurück zum Dashboard">
				<i class="bi bi-arrow-left"></i>
			</a>
			<h4 class="fw-bold mb-0">Neuer Habit</h4>
		</div>

		{#if form?.error}
			<div class="alert alert-danger py-2 px-3 mb-3 small">
				<i class="bi bi-exclamation-circle-fill me-1"></i>{form.error}
			</div>
		{/if}

		<form
			method="POST"
			use:enhance={() => {
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

			<!-- Preview + Name -->
			<div class="card border-0 p-4 mb-3" style="border-radius:14px;">
				<div class="d-flex align-items-center gap-3 mb-3">
					<div class="preview-icon" style="background:{selectedColor}22;color:{selectedColor}">
						<i class="bi {selectedIcon}"></i>
					</div>
					<div class="flex-grow-1">
						<p class="section-label mb-1">Habit Name</p>
						<input
							type="text"
							name="name"
							class="form-control"
							placeholder="z.B. Täglich lesen"
							maxlength="50"
							required
							bind:value={habitName}
							style="font-size:1rem;font-weight:600;"
						/>
					</div>
				</div>
			</div>

			<!-- Category picker -->
			<div class="card border-0 p-4 mb-3" style="border-radius:14px;">
				<div class="d-flex justify-content-between align-items-center mb-2">
					<p class="section-label mb-0">Kategorie</p>
					<a href="/categories" class="text-decoration-none" style="font-size:0.72rem;color:var(--bs-secondary-color,#6b7280);">
						<i class="bi bi-gear-fill me-1"></i>Verwalten
					</a>
				</div>
				<div class="d-flex flex-wrap gap-2">
					{#each allCategories as cat}
						{@const catId = cat.id ?? cat._id}
						<button
							type="button"
							class="cat-btn {selectedCatId === catId ? 'active' : ''}"
							style="--cat-color:{cat.color}"
							onclick={() => pickCategory(cat)}
						>
							{cat.label}
						</button>
					{/each}
				</div>
			</div>

			<!-- Icon picker with search -->
			<div class="card border-0 p-4 mb-4" style="border-radius:14px;">
				<p class="section-label">Icon wählen</p>
				<input
					type="text"
					class="form-control form-control-sm mb-2"
					placeholder="Suchen… (z.B. heart, book, fire)"
					bind:value={iconSearch}
				/>
				<div class="icon-scroll">
					{#each filteredGroups as group}
						<div class="group-label">{group.label}</div>
						<div class="icon-grid">
							{#each group.icons as icon}
								<button
									type="button"
									class="icon-btn {selectedIcon === icon ? 'active' : ''}"
									style="--cat-color:{selectedColor}"
									onclick={() => (selectedIcon = icon)}
									aria-label={icon.replace('bi-', '')}
								>
									<i class="bi {icon}"></i>
								</button>
							{/each}
						</div>
					{/each}
					{#if filteredGroups.length === 0}
						<p style="font-size:0.8rem;color:var(--bs-secondary-color,#6b7280);" class="mb-0 py-2">
							Kein Icon gefunden.
						</p>
					{/if}
				</div>
			</div>

			<!-- Reminder -->
			<div class="card border-0 p-4 mb-4" style="border-radius:14px;">
				<p class="section-label">Erinnerung <span style="font-weight:400;text-transform:none;letter-spacing:0;font-size:0.75rem;color:var(--bs-secondary-color,#6b7280);">(optional)</span></p>
				<div class="d-flex align-items-center gap-3">
					<input
						type="time"
						class="form-control"
						style="max-width:140px;"
						bind:value={reminderTime}
					/>
					<span style="font-size:0.8rem;color:var(--bs-secondary-color,#6b7280);">
						Tägliche Browser-Benachrichtigung wenn nicht erledigt
					</span>
				</div>
				{#if reminderTime}
					<button
						type="button"
						class="btn btn-sm btn-outline-secondary mt-2"
						style="width:fit-content;"
						onclick={() => (reminderTime = '')}
					>
						<i class="bi bi-x me-1"></i>Erinnerung entfernen
					</button>
				{/if}
			</div>

			<button
				type="submit"
				class="btn btn-primary w-100 fw-semibold py-2"
				disabled={loading || !habitName.trim()}
			>
				{#if loading}
					<span class="spinner-border spinner-border-sm me-2"></span>
				{/if}
				<i class="bi bi-check2 me-1"></i>Habit erstellen
			</button>
		</form>
	</div>
</div>
