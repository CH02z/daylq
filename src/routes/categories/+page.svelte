<script>
	import { enhance } from '$app/forms';
	import { CATEGORIES, PRESET_COLORS } from '$lib/categories.js';
	import { tap, strongTap, warn } from '$lib/haptic.js';

	let { data, form } = $props();

	let newLabel = $state('');
	let newColor = $state(PRESET_COLORS[9]);
	let creating = $state(false);

	let confirmId = $state(null);
	let deleting = $state(false);

	let editId = $state(null);
	let editLabel = $state('');
	let editColor = $state(PRESET_COLORS[9]);
	let savingEdit = $state(false);

	function startEdit(cat) {
		tap();
		editId = cat._id;
		editLabel = cat.label;
		editColor = cat.color;
		confirmId = null;
	}

	function cancelEdit() {
		tap();
		editId = null;
	}

	function pickSwatch(c, target) {
		tap();
		if (target === 'new') newColor = c;
		else editColor = c;
	}

	function startDelete(catId) {
		warn();
		confirmId = catId;
		editId = null;
	}

	function cancelDelete() {
		tap();
		confirmId = null;
	}
</script>

<svelte:head>
	<title>Kategorien – daylq</title>
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
	h1.title { font-size: 1.6rem; font-weight: 800; letter-spacing: -0.03em; margin: 0; flex: 1; }

	.card {
		padding: 1.5rem; border-radius: var(--radius-lg);
		background: var(--surface-1); border: 1px solid var(--hairline);
		backdrop-filter: blur(24px) saturate(180%);
		margin-bottom: 1rem; position: relative; overflow: hidden;
	}
	.card-create {
		padding: 1.8rem 1.5rem; position: relative; overflow: hidden;
	}
	.card-create::before {
		content: ''; position: absolute; inset: -40% -10% auto auto;
		width: 60%; height: 100%;
		background: radial-gradient(circle, color-mix(in srgb, var(--new-c) 18%, transparent), transparent 65%);
		filter: blur(40px); pointer-events: none;
	}
	.card-content { position: relative; z-index: 1; }

	.card-title {
		font-size: 0.78rem; font-weight: 700; text-transform: uppercase;
		letter-spacing: 0.08em; color: var(--bs-secondary-color); margin-bottom: 1rem;
	}

	.preview-row {
		display: flex; align-items: center; gap: 14px; margin-bottom: 1.1rem;
	}
	.preview-dot {
		width: 34px; height: 34px; border-radius: 12px; flex-shrink: 0;
		background: var(--new-c);
		box-shadow: 0 6px 20px color-mix(in srgb, var(--new-c) 40%, transparent);
		transition: background 0.3s var(--ease-soft);
	}
	.label-input {
		flex: 1; padding: 12px 16px;
		background: var(--surface-input); border: 1px solid var(--hairline);
		border-radius: var(--radius-md); color: var(--bs-body-color);
		font-size: 1rem; font-weight: 600; outline: none;
		transition: border-color 0.18s var(--ease-soft);
	}
	.label-input:focus { border-color: rgba(139, 92, 246, 0.55); }

	.color-row-label {
		font-size: 0.72rem; font-weight: 600;
		color: var(--bs-secondary-color); margin-bottom: 0.6rem;
	}
	.color-grid {
		display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 1.2rem;
	}
	.swatch {
		width: 32px; height: 32px; border-radius: 50%;
		border: 3px solid transparent; cursor: pointer;
		transition: transform 0.15s var(--ease-spring), border-color 0.15s var(--ease-soft);
		flex-shrink: 0;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
	}
	.swatch.active {
		border-color: var(--bs-body-color);
		transform: scale(1.1);
	}
	.swatch:hover:not(.active) { transform: scale(1.08); }

	.create-btn {
		width: 100%; padding: 14px 20px; border-radius: var(--radius-md);
		background: var(--brand-gradient); color: #fff; border: none;
		font-weight: 700; font-size: 0.95rem;
		box-shadow: var(--shadow-brand); cursor: pointer;
		display: inline-flex; align-items: center; justify-content: center;
		gap: 8px;
		transition: transform 0.18s var(--ease-spring), filter 0.18s var(--ease-soft);
	}
	.create-btn:hover:not(:disabled) { filter: brightness(1.08); }
	.create-btn:active:not(:disabled) { transform: scale(0.98); }
	.create-btn:disabled { opacity: 0.5; cursor: not-allowed; }

	.cat-row {
		display: flex; align-items: center; gap: 12px;
		padding: 0.9rem 0; border-bottom: 1px solid var(--hairline);
	}
	.cat-row:last-child { border-bottom: none; padding-bottom: 0; }
	.cat-row:first-child { padding-top: 0; }
	.row-dot {
		width: 14px; height: 14px; border-radius: 50%; flex-shrink: 0;
	}
	.row-name { flex: 1; font-size: 0.92rem; font-weight: 600; }
	.tag-builtin {
		font-size: 0.7rem; font-weight: 600;
		padding: 3px 10px; border-radius: var(--radius-pill);
		background: var(--surface-3); color: var(--bs-tertiary-color);
		border: 1px solid var(--hairline);
	}
	.tag-count { font-size: 0.78rem; color: var(--bs-secondary-color); font-variant-numeric: tabular-nums; }

	.icon-btn-row {
		display: flex; gap: 6px; flex-shrink: 0;
	}
	.icon-btn {
		width: 32px; height: 32px; border-radius: 50%;
		background: var(--surface-3); border: 1px solid var(--hairline);
		color: var(--bs-body-color);
		display: grid; place-items: center; cursor: pointer;
		transition: background 0.18s var(--ease-soft), transform 0.18s var(--ease-spring);
	}
	.icon-btn:hover { background: var(--surface-2); }
	.icon-btn:active { transform: scale(0.94); }
	.icon-btn.danger {
		background: rgba(244, 63, 94, 0.08);
		border-color: rgba(244, 63, 94, 0.2);
		color: var(--accent-rose);
	}
	.icon-btn.danger:hover { background: rgba(244, 63, 94, 0.18); }
	.icon-btn.primary {
		background: rgba(139, 92, 246, 0.08);
		border-color: rgba(139, 92, 246, 0.2);
		color: var(--brand-2);
	}
	.icon-btn.primary:hover { background: rgba(139, 92, 246, 0.18); }

	.inline-form {
		background: var(--surface-3);
		border: 1px solid var(--hairline);
		border-radius: var(--radius-md);
		padding: 1rem;
		margin-top: 0.7rem;
	}
	.inline-form-row {
		display: flex; align-items: center; gap: 10px; margin-bottom: 0.8rem;
	}
	.mini-dot {
		width: 26px; height: 26px; border-radius: 10px; flex-shrink: 0;
		background: var(--edit-c);
		box-shadow: 0 4px 14px color-mix(in srgb, var(--edit-c) 35%, transparent);
		transition: background 0.25s var(--ease-soft);
	}

	.delete-confirm {
		background: rgba(244, 63, 94, 0.06);
		border: 1px solid rgba(244, 63, 94, 0.25);
		border-radius: var(--radius-md);
		padding: 1rem; margin-top: 0.7rem;
	}
	.actions-row {
		display: flex; gap: 10px; margin-top: 0.7rem;
	}
	.cancel-btn, .confirm-del-btn, .save-btn {
		flex: 1; padding: 10px 16px; border-radius: var(--radius-md);
		font-size: 0.85rem; font-weight: 600; cursor: pointer;
	}
	.cancel-btn {
		background: var(--surface-1); border: 1px solid var(--hairline);
		color: var(--bs-body-color);
	}
	.cancel-btn:hover { background: var(--surface-2); }
	.confirm-del-btn {
		background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%);
		color: #fff; border: none;
		box-shadow: 0 6px 18px rgba(244, 63, 94, 0.3);
		display: inline-flex; align-items: center; justify-content: center; gap: 6px;
	}
	.save-btn {
		background: var(--brand-gradient); color: #fff; border: none;
		box-shadow: var(--shadow-brand);
		display: inline-flex; align-items: center; justify-content: center; gap: 6px;
	}
	.save-btn:hover { filter: brightness(1.08); }

	.empty {
		padding: 2.5rem 1.5rem; border-radius: var(--radius-lg); text-align: center;
		background: var(--surface-1); border: 1px dashed var(--hairline);
	}
	.empty-icon {
		width: 56px; height: 56px; border-radius: 16px;
		display: grid; place-items: center; margin: 0 auto 1rem;
		background: var(--brand-gradient-soft); color: var(--brand-2); font-size: 1.4rem;
	}

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
			<h1 class="title">Kategorien</h1>
		</div>

		<!-- Create -->
		<div class="card card-create" style="--new-c: {newColor};">
			<div class="card-content">
				<div class="card-title">Neue Kategorie</div>

				{#if form?.createError}
					<div class="alert-error">
						<i class="bi bi-exclamation-circle-fill"></i>
						<span>{form.createError}</span>
					</div>
				{/if}

				<form
					method="POST"
					action="?/create"
					use:enhance={() => {
						strongTap();
						creating = true;
						return async ({ update }) => {
							await update();
							creating = false;
							newLabel = '';
						};
					}}
				>
					<input type="hidden" name="color" value={newColor} />

					<div class="preview-row">
						<div class="preview-dot"></div>
						<input
							type="text"
							name="label"
							class="label-input"
							placeholder="Name (z.B. Hobby)"
							maxlength="40"
							required
							bind:value={newLabel}
						/>
					</div>

					<div class="color-row-label">Farbe wählen</div>
					<div class="color-grid">
						{#each PRESET_COLORS as c}
							<button
								type="button"
								class="swatch {newColor === c ? 'active' : ''}"
								style="background:{c}"
								onclick={() => pickSwatch(c, 'new')}
								aria-label="Farbe {c}"
							></button>
						{/each}
					</div>

					<button
						type="submit"
						class="create-btn"
						disabled={creating || !newLabel.trim()}
					>
						{#if creating}
							<span class="spinner-border spinner-border-sm" style="border-width:2px;"></span>
						{:else}
							<i class="bi bi-plus-circle-fill"></i>
						{/if}
						Kategorie erstellen
					</button>
				</form>
			</div>
		</div>

		<!-- Built-in -->
		<div class="card">
			<div class="card-title"><i class="bi bi-lock-fill me-1"></i> Standard-Kategorien</div>
			{#each CATEGORIES as cat}
				<div class="cat-row">
					<div class="row-dot" style="background:{cat.color}"></div>
					<span class="row-name">{cat.label}</span>
					<span class="tag-builtin">Standard</span>
				</div>
			{/each}
		</div>

		<!-- User -->
		{#if data.userCategories.length > 0}
			<div class="card">
				<div class="card-title"><i class="bi bi-person-fill me-1"></i> Meine Kategorien</div>
				{#each data.userCategories as cat}
					{@const catId = cat._id}
					{@const count = data.countMap[catId] ?? 0}
					<div class="cat-row" style="flex-direction:column;align-items:stretch;">
						<div style="display:flex;align-items:center;gap:12px;">
							<div class="row-dot" style="background:{cat.color}"></div>
							<span class="row-name">{cat.label}</span>
							<span class="tag-count">{count} {count === 1 ? 'Habit' : 'Habits'}</span>
							{#if editId !== catId && confirmId !== catId}
								<div class="icon-btn-row">
									<button
										class="icon-btn primary"
										aria-label="Bearbeiten"
										onclick={() => startEdit(cat)}
									>
										<i class="bi bi-pencil-fill" style="font-size:.85rem;"></i>
									</button>
									<button
										class="icon-btn danger"
										aria-label="Löschen"
										onclick={() => startDelete(catId)}
									>
										<i class="bi bi-trash3-fill" style="font-size:.85rem;"></i>
									</button>
								</div>
							{/if}
						</div>

						{#if editId === catId}
							<div class="inline-form" style="--edit-c: {editColor};">
								{#if form?.editError && form?.editId === catId}
									<div class="alert-error" style="margin-bottom:0.7rem;">
										<i class="bi bi-exclamation-circle-fill"></i>
										<span>{form.editError}</span>
									</div>
								{/if}
								<form
									method="POST"
									action="?/edit"
									use:enhance={() => {
										strongTap();
										savingEdit = true;
										return async ({ update, result }) => {
											await update();
											savingEdit = false;
											if (result.type === 'redirect' || result.type === 'success') {
												editId = null;
											}
										};
									}}
								>
									<input type="hidden" name="id" value={catId} />
									<input type="hidden" name="color" value={editColor} />

									<div class="inline-form-row">
										<div class="mini-dot"></div>
										<input
											type="text"
											name="label"
											class="label-input"
											maxlength="40"
											required
											bind:value={editLabel}
										/>
									</div>

									<div class="color-row-label">Farbe</div>
									<div class="color-grid" style="margin-bottom:0.8rem;">
										{#each PRESET_COLORS as c}
											<button
												type="button"
												class="swatch {editColor === c ? 'active' : ''}"
												style="background:{c}; width:26px; height:26px;"
												onclick={() => pickSwatch(c, 'edit')}
												aria-label="Farbe {c}"
											></button>
										{/each}
									</div>

									<div class="actions-row" style="margin-top:0;">
										<button type="button" class="cancel-btn" onclick={cancelEdit}>
											Abbrechen
										</button>
										<button
											type="submit"
											class="save-btn"
											disabled={savingEdit || !editLabel.trim()}
										>
											{#if savingEdit}
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

						{#if confirmId === catId}
							<div class="delete-confirm">
								<p style="font-size:.85rem;margin-bottom:.6rem;">
									<strong>{cat.label}</strong> löschen?
									{#if count > 0}
										<span style="color:var(--accent-rose);">
											{count} {count === 1 ? 'Habit wird' : 'Habits werden'} mitgelöscht.
										</span>
									{/if}
								</p>
								<div class="actions-row" style="margin-top:0;">
									<button class="cancel-btn" onclick={cancelDelete}>
										Abbrechen
									</button>
									<form
										method="POST"
										action="?/delete"
										use:enhance={() => {
											strongTap();
											deleting = true;
											return async ({ update }) => { await update(); deleting = false; };
										}}
										style="flex:1;"
									>
										<input type="hidden" name="id" value={catId} />
										<button type="submit" class="confirm-del-btn" disabled={deleting} style="width:100%;">
											{#if deleting}
												<span class="spinner-border spinner-border-sm" style="border-width:2px;"></span>
											{:else}
												<i class="bi bi-trash3-fill"></i>
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
			<div class="empty">
				<div class="empty-icon"><i class="bi bi-tag"></i></div>
				<p style="font-size:.92rem;color:var(--bs-secondary-color);margin:0;">
					Noch keine eigenen Kategorien.
				</p>
			</div>
		{/if}
	</div>
</div>
