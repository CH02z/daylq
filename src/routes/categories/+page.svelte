<script>
	import { enhance } from '$app/forms';
	import { CATEGORIES, PRESET_COLORS } from '$lib/categories.js';

	let { data, form } = $props();

	let newLabel = $state('');
	let newColor = $state(PRESET_COLORS[9]); // blue default
	let creating = $state(false);

	let confirmId = $state(null); // id of category pending delete confirmation
	let deleting = $state(false);
</script>

<svelte:head>
	<title>Kategorien – daylq</title>
</svelte:head>

<style>
	.page {
		min-height: calc(100vh - 57px);
		padding: 1.5rem 1rem;
		max-width: 680px;
		margin: 0 auto;
	}
	.section-card {
		border-radius: 16px;
		background: var(--bs-card-bg, #1a1f2e);
		border: 1px solid var(--bs-border-color, #2a3148);
		padding: 1.4rem;
		margin-bottom: 1rem;
	}
	.section-label {
		font-size: 0.7rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--bs-secondary-color, #6b7280);
		margin-bottom: 1rem;
	}
	.cat-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.65rem 0;
		border-bottom: 1px solid var(--bs-border-color, #2a3148);
	}
	.cat-row:last-child {
		border-bottom: none;
		padding-bottom: 0;
	}
	.cat-dot {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		flex-shrink: 0;
	}
	.color-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.color-swatch {
		width: 26px;
		height: 26px;
		border-radius: 50%;
		border: 3px solid transparent;
		cursor: pointer;
		transition: transform 0.12s, border-color 0.12s;
		flex-shrink: 0;
	}
	.color-swatch.active {
		border-color: white;
		transform: scale(1.15);
	}
	.color-swatch:hover:not(.active) {
		transform: scale(1.1);
	}
	.badge-builtin {
		font-size: 0.62rem;
		font-weight: 600;
		padding: 2px 6px;
		border-radius: 20px;
		background: rgba(255, 255, 255, 0.08);
		color: var(--bs-secondary-color, #6b7280);
	}
	.delete-confirm {
		background: rgba(239, 68, 68, 0.08);
		border: 1px solid rgba(239, 68, 68, 0.25);
		border-radius: 10px;
		padding: 0.75rem;
		margin-top: 0.5rem;
	}
	.preview-dot {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		flex-shrink: 0;
		transition: background 0.15s;
	}
</style>

<div class="page">
	<div class="d-flex align-items-center gap-3 mb-4">
		<a href="/dashboard" class="btn btn-sm btn-outline-secondary" aria-label="Zurück zum Dashboard">
			<i class="bi bi-arrow-left"></i>
		</a>
		<h4 class="fw-bold mb-0">Kategorien</h4>
	</div>

	<!-- Create new category -->
	<div class="section-card">
		<p class="section-label"><i class="bi bi-plus-circle-fill me-1"></i>Neue Kategorie</p>

		{#if form?.createError}
			<div class="alert alert-danger py-2 px-3 mb-3 small">
				<i class="bi bi-exclamation-circle-fill me-1"></i>{form.createError}
			</div>
		{/if}

		<form
			method="POST"
			action="?/create"
			use:enhance={() => {
				creating = true;
				return async ({ update }) => {
					await update();
					creating = false;
					newLabel = '';
				};
			}}
		>
			<input type="hidden" name="color" value={newColor} />

			<div class="d-flex align-items-center gap-2 mb-3">
				<div class="preview-dot" style="background:{newColor}"></div>
				<input
					type="text"
					name="label"
					class="form-control"
					placeholder="Kategorie Name"
					maxlength="40"
					required
					bind:value={newLabel}
				/>
			</div>

			<div class="color-grid mb-3">
				{#each PRESET_COLORS as c}
					<button
						type="button"
						class="color-swatch {newColor === c ? 'active' : ''}"
						style="background:{c}"
						onclick={() => (newColor = c)}
						aria-label="Farbe {c}"
					></button>
				{/each}
			</div>

			<button
				type="submit"
				class="btn btn-primary btn-sm w-100 fw-semibold"
				disabled={creating || !newLabel.trim()}
			>
				{#if creating}
					<span class="spinner-border spinner-border-sm me-1"></span>
				{/if}
				<i class="bi bi-check2 me-1"></i>Erstellen
			</button>
		</form>
	</div>

	<!-- Built-in categories -->
	<div class="section-card">
		<p class="section-label"><i class="bi bi-lock-fill me-1"></i>Standard-Kategorien</p>
		{#each CATEGORIES as cat}
			<div class="cat-row">
				<div class="cat-dot" style="background:{cat.color}"></div>
				<span class="flex-grow-1" style="font-size:0.88rem;">{cat.label}</span>
				<span class="badge-builtin">Standard</span>
			</div>
		{/each}
	</div>

	<!-- User categories -->
	{#if data.userCategories.length > 0}
		<div class="section-card">
			<p class="section-label"><i class="bi bi-person-fill me-1"></i>Meine Kategorien</p>
			{#each data.userCategories as cat}
				{@const catId = cat._id}
				{@const count = data.countMap[catId] ?? 0}
				<div class="cat-row" style="flex-direction:column;align-items:stretch;">
					<div class="d-flex align-items-center gap-2">
						<div class="cat-dot" style="background:{cat.color}"></div>
						<span class="flex-grow-1" style="font-size:0.88rem;font-weight:500;">{cat.label}</span>
						<span style="font-size:0.75rem;color:var(--bs-secondary-color,#6b7280);">
							{count} {count === 1 ? 'Habit' : 'Habits'}
						</span>
						{#if confirmId !== catId}
							<button
								class="btn btn-outline-danger btn-sm"
								style="font-size:0.75rem;padding:2px 8px;"
								aria-label="Kategorie löschen"
								onclick={() => (confirmId = catId)}
							>
								<i class="bi bi-trash3-fill"></i>
							</button>
						{/if}
					</div>

					{#if confirmId === catId}
						<div class="delete-confirm">
							<p style="font-size:0.8rem;margin-bottom:0.5rem;">
								<strong>{cat.label}</strong> löschen?
								{#if count > 0}
									<span style="color:#ef4444;"> {count} {count === 1 ? 'Habit wird' : 'Habits werden'} mitgelöscht.</span>
								{/if}
							</p>
							<div class="d-flex gap-2">
								<button
									class="btn btn-outline-secondary btn-sm flex-grow-1"
									onclick={() => (confirmId = null)}
									style="font-size:0.78rem;"
								>
									Abbrechen
								</button>
								<form
									method="POST"
									action="?/delete"
									use:enhance={() => {
										deleting = true;
										return async ({ update }) => { await update(); deleting = false; };
									}}
									style="flex:1;"
								>
									<input type="hidden" name="id" value={catId} />
									<button
										type="submit"
										class="btn btn-danger btn-sm w-100 fw-semibold"
										style="font-size:0.78rem;"
										disabled={deleting}
									>
										{#if deleting}
											<span class="spinner-border spinner-border-sm me-1"></span>
										{/if}
										Ja, löschen
									</button>
								</form>
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{:else}
		<div
			style="border-radius:14px;border:2px dashed var(--bs-border-color,#2a3148);padding:2rem;text-align:center;"
		>
			<i class="bi bi-tag fs-2 d-block mb-2" style="color:var(--bs-secondary-color,#6b7280);opacity:0.5;"></i>
			<p style="font-size:0.85rem;color:var(--bs-secondary-color,#6b7280);" class="mb-0">
				Noch keine eigenen Kategorien
			</p>
		</div>
	{/if}
</div>
