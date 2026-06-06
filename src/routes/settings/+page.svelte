<script>
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';
	import { tap, warn, strongTap } from '$lib/haptic.js';
	import { invalidateAll } from '$app/navigation';

	let { data, form } = $props();

	let notifSupported = $state(false);
	let notifPermission = $state('default');
	let theme = $state('dark');

	onMount(() => {
		notifSupported = 'Notification' in window;
		if (notifSupported) notifPermission = Notification.permission;
		const m = document.cookie.match(/theme=([^;]+)/);
		theme = m ? m[1] : 'dark';
	});

	async function requestPermission() {
		const result = await Notification.requestPermission();
		notifPermission = result;
		if (result === 'granted') {
			new Notification('daylq · Benachrichtigungen aktiviert', {
				body: 'Du erhältst ab jetzt Erinnerungen für deine Habits.',
				icon: '/favicon.svg'
			});
		}
	}

	function setTheme(t) {
		tap();
		theme = t;
		document.documentElement.setAttribute('data-bs-theme', t);
		document.cookie = `theme=${t};path=/;max-age=${60 * 60 * 24 * 365}`;
		window.dispatchEvent(new CustomEvent('daylq:theme-change', { detail: t }));
	}

	const initials = $derived(
		data.user.username
			.split(/[\s_-]/)
			.slice(0, 2)
			.map((w) => w[0]?.toUpperCase() ?? '')
			.join('')
	);

	// ── Wipe-Data UI state ──
	let showWipe = $state(false);
	let wipeConfirm = $state('');
	let wiping = $state(false);

	function openWipe() { warn(); showWipe = true; wipeConfirm = ''; }
	function cancelWipe() { tap(); showWipe = false; wipeConfirm = ''; }

	const memberSince = $derived(
		data.user.createdAt
			? new Date(data.user.createdAt).toLocaleDateString('de-CH', {
					day: 'numeric',
					month: 'long',
					year: 'numeric'
				})
			: '–'
	);
</script>

<svelte:head>
	<title>Profil – daylq</title>
</svelte:head>

<style>
	.page { padding: 1.4rem 1rem 0; }
	@media (min-width: 768px) { .page { padding: 2rem 1rem 0; } }

	.wrap { max-width: 720px; margin: 0 auto; }

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
		font-size: 1.6rem;
		font-weight: 800;
		letter-spacing: -0.03em;
		margin: 0;
		flex: 1;
	}

	/* Profile hero */
	.profile-hero {
		padding: 2rem 1.6rem;
		border-radius: var(--radius-xl);
		background: var(--surface-1);
		border: 1px solid var(--hairline);
		backdrop-filter: blur(24px) saturate(180%);
		display: flex;
		align-items: center;
		gap: 1.2rem;
		margin-bottom: 1rem;
		position: relative;
		overflow: hidden;
	}
	.profile-hero::before {
		content: '';
		position: absolute;
		inset: -40% -10% auto auto;
		width: 60%;
		height: 100%;
		background: radial-gradient(circle, rgba(139, 92, 246, 0.2), transparent 65%);
		filter: blur(40px);
		pointer-events: none;
	}
	.profile-hero-content { display: flex; gap: 1.2rem; align-items: center; position: relative; z-index: 1; flex: 1; min-width: 0; }

	.avatar {
		width: 72px;
		height: 72px;
		border-radius: 22px;
		background: var(--brand-gradient);
		display: grid;
		place-items: center;
		font-size: 1.5rem;
		font-weight: 800;
		letter-spacing: -0.02em;
		color: #fff;
		flex-shrink: 0;
		box-shadow: var(--shadow-brand);
	}
	.profile-name {
		font-size: 1.4rem;
		font-weight: 800;
		letter-spacing: -0.03em;
		line-height: 1.1;
		margin-bottom: 4px;
	}
	.profile-email {
		font-size: 0.88rem;
		color: var(--bs-secondary-color);
		word-break: break-all;
	}

	/* Card */
	.card {
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
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.info-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 0;
		border-bottom: 1px solid var(--hairline);
		font-size: 0.9rem;
	}
	.info-row:last-child { border-bottom: none; padding-bottom: 0; }
	.info-row:first-child { padding-top: 0; }
	.info-label { color: var(--bs-secondary-color); }
	.info-value { font-weight: 600; }

	.stats-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
	}
	.stat-card {
		padding: 1rem;
		border-radius: var(--radius-md);
		background: var(--surface-3);
		border: 1px solid var(--hairline);
		text-align: center;
	}
	.stat-num {
		font-size: 1.8rem;
		font-weight: 800;
		letter-spacing: -0.03em;
		line-height: 1;
	}
	.stat-lbl {
		font-size: 0.74rem;
		color: var(--bs-secondary-color);
		margin-top: 6px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 600;
	}

	/* Theme switcher */
	.theme-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
	}
	.theme-btn {
		padding: 1rem;
		border-radius: var(--radius-md);
		background: var(--surface-3);
		border: 1px solid var(--hairline);
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 10px;
		font-weight: 600;
		font-size: 0.92rem;
		color: var(--bs-body-color);
		transition: all 0.2s var(--ease-soft);
	}
	.theme-btn:hover {
		background: var(--brand-gradient-soft);
		border-color: rgba(139, 92, 246, 0.3);
	}
	.theme-btn.active {
		background: var(--brand-gradient-soft);
		border-color: rgba(139, 92, 246, 0.45);
		color: var(--bs-body-color);
	}
	.theme-btn i { font-size: 1.1rem; color: var(--brand-2); }

	/* Notifications */
	.notif-state {
		display: flex;
		align-items: center;
		gap: 12px;
	}
	.notif-icon {
		width: 40px;
		height: 40px;
		border-radius: 12px;
		display: grid;
		place-items: center;
		font-size: 1.1rem;
		flex-shrink: 0;
	}
	.notif-text {
		flex: 1;
		min-width: 0;
	}
	.notif-title {
		font-weight: 600;
		font-size: 0.92rem;
		margin-bottom: 2px;
	}
	.notif-sub {
		font-size: 0.8rem;
		color: var(--bs-secondary-color);
		line-height: 1.4;
	}
	.notif-btn {
		padding: 12px 18px;
		border-radius: var(--radius-md);
		background: var(--brand-gradient);
		color: #fff;
		border: none;
		font-weight: 600;
		font-size: 0.9rem;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		gap: 8px;
		box-shadow: var(--shadow-brand);
		margin-top: 1rem;
		transition: filter 0.18s var(--ease-soft);
	}
	.notif-btn:hover { filter: brightness(1.08); }

	/* Danger Zone */
	.danger-card {
		padding: 1.4rem;
		border-radius: var(--radius-lg);
		background: rgba(244, 63, 94, 0.04);
		border: 1px solid rgba(244, 63, 94, 0.2);
		backdrop-filter: blur(24px) saturate(180%);
		margin-bottom: 1rem;
	}
	.danger-title {
		color: var(--accent-rose) !important;
	}
	.danger-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}
	.danger-text { flex: 1; min-width: 0; }
	.danger-row-title {
		font-size: 0.95rem;
		font-weight: 700;
		color: var(--bs-body-color);
	}
	.danger-row-sub {
		font-size: 0.8rem;
		color: var(--bs-secondary-color);
		margin-top: 2px;
		line-height: 1.4;
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
		transition: background 0.18s var(--ease-soft), transform 0.18s var(--ease-spring);
		flex-shrink: 0;
	}
	.danger-btn:hover { background: rgba(244, 63, 94, 0.18); }
	.danger-btn:active { transform: scale(0.96); }

	.danger-confirm {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid rgba(244, 63, 94, 0.2);
	}
	.confirm-text {
		font-size: 0.88rem;
		color: var(--bs-body-color);
		margin-bottom: 0.8rem;
	}
	.confirm-input {
		width: 100%;
		padding: 12px 16px;
		background: var(--surface-input);
		border: 1px solid rgba(244, 63, 94, 0.3);
		border-radius: var(--radius-md);
		color: var(--bs-body-color);
		font-size: 1rem;
		font-weight: 700;
		text-align: center;
		letter-spacing: 0.08em;
		font-family: var(--font-sans);
		outline: none;
		margin-bottom: 0.8rem;
		transition: border-color 0.18s var(--ease-soft);
	}
	.confirm-input:focus { border-color: rgba(244, 63, 94, 0.6); }
	.confirm-input::placeholder { color: var(--bs-tertiary-color); letter-spacing: 0.08em; }
	.confirm-actions {
		display: flex;
		gap: 10px;
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
	}
	.danger-btn-solid {
		flex: 1;
		padding: 12px 18px;
		border-radius: var(--radius-md);
		background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%);
		color: #fff;
		border: none;
		font-weight: 700;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		box-shadow: 0 10px 28px rgba(244, 63, 94, 0.35);
	}
	.danger-btn-solid:disabled {
		opacity: 0.45;
		cursor: not-allowed;
		box-shadow: none;
	}
	.success-banner {
		display: flex;
		gap: 12px;
		align-items: flex-start;
		padding: 12px 14px;
		border-radius: var(--radius-md);
		background: rgba(52, 211, 153, 0.1);
		border: 1px solid rgba(52, 211, 153, 0.3);
		color: var(--accent-green);
		font-size: 0.9rem;
		margin-bottom: 1rem;
	}
	.success-banner i { font-size: 1.1rem; margin-top: 1px; }
	.alert-error {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 12px 14px;
		border-radius: var(--radius-sm);
		background: rgba(244, 63, 94, 0.12);
		border: 1px solid rgba(244, 63, 94, 0.3);
		color: var(--accent-rose);
		font-size: 0.85rem;
	}

	/* Logout */
	.logout-btn {
		display: block;
		width: 100%;
		padding: 14px 20px;
		border-radius: var(--radius-md);
		background: rgba(244, 63, 94, 0.08);
		border: 1px solid rgba(244, 63, 94, 0.25);
		color: var(--accent-rose);
		font-weight: 600;
		text-decoration: none;
		text-align: center;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		transition: background 0.18s var(--ease-soft);
	}
	.logout-btn:hover {
		background: rgba(244, 63, 94, 0.16);
		color: var(--accent-rose);
	}
</style>

<div class="app-container page page-pad-bottom">
	<div class="wrap fade-up">
		<div class="head">
			<a href="/dashboard" class="back-btn" aria-label="Zurück">
				<i class="bi bi-arrow-left"></i>
			</a>
			<h1 class="title">Profil</h1>
		</div>

		<!-- Profile hero -->
		<div class="profile-hero">
			<div class="profile-hero-content">
				<div class="avatar">{initials}</div>
				<div style="flex:1;min-width:0;">
					<div class="profile-name">{data.user.username}</div>
					<div class="profile-email">{data.user.email}</div>
				</div>
			</div>
		</div>

		<!-- Stats -->
		<div class="card">
			<div class="card-title"><i class="bi bi-graph-up"></i>Deine Statistiken</div>
			<div class="stats-grid">
				<div class="stat-card">
					<div class="stat-num gradient-text">{data.habitCount}</div>
					<div class="stat-lbl">Aktive Habits</div>
				</div>
				<div class="stat-card">
					<div class="stat-num" style="color:var(--accent-green);">{data.checkinCount}</div>
					<div class="stat-lbl">Completions</div>
				</div>
			</div>
		</div>

		<!-- Account info -->
		<div class="card">
			<div class="card-title"><i class="bi bi-person-fill"></i>Account</div>
			<div class="info-row">
				<span class="info-label">Benutzername</span>
				<span class="info-value">@{data.user.username}</span>
			</div>
			<div class="info-row">
				<span class="info-label">E-Mail</span>
				<span class="info-value" style="font-size:.85rem;">{data.user.email}</span>
			</div>
			<div class="info-row">
				<span class="info-label">Mitglied seit</span>
				<span class="info-value">{memberSince}</span>
			</div>
		</div>

		<!-- Theme -->
		<div class="card">
			<div class="card-title"><i class="bi bi-palette-fill"></i>Erscheinungsbild</div>
			<div class="theme-grid">
				<button class="theme-btn {theme === 'light' ? 'active' : ''}" onclick={() => setTheme('light')}>
					<i class="bi bi-sun-fill"></i> Hell
				</button>
				<button class="theme-btn {theme === 'dark' ? 'active' : ''}" onclick={() => setTheme('dark')}>
					<i class="bi bi-moon-stars-fill"></i> Dunkel
				</button>
			</div>
		</div>

		<!-- Notifications -->
		{#if notifSupported}
			<div class="card">
				<div class="card-title"><i class="bi bi-bell-fill"></i>Erinnerungen</div>
				{#if notifPermission === 'granted'}
					<div class="notif-state">
						<div class="notif-icon" style="background:rgba(52,211,153,.16);color:var(--accent-green);">
							<i class="bi bi-check-circle-fill"></i>
						</div>
						<div class="notif-text">
							<div class="notif-title">Benachrichtigungen aktiviert</div>
							<div class="notif-sub">Erinnerungszeit pro Habit in den Habit-Einstellungen festlegen.</div>
						</div>
					</div>
				{:else if notifPermission === 'denied'}
					<div class="notif-state">
						<div class="notif-icon" style="background:rgba(244,63,94,.12);color:var(--accent-rose);">
							<i class="bi bi-bell-slash-fill"></i>
						</div>
						<div class="notif-text">
							<div class="notif-title">Benachrichtigungen blockiert</div>
							<div class="notif-sub">Erlaube Benachrichtigungen in deinen Browser-Einstellungen.</div>
						</div>
					</div>
				{:else}
					<div class="notif-state">
						<div class="notif-icon" style="background:var(--brand-gradient-soft);color:var(--brand-2);">
							<i class="bi bi-bell-fill"></i>
						</div>
						<div class="notif-text">
							<div class="notif-title">Erinnerungen aktivieren</div>
							<div class="notif-sub">Browser-Benachrichtigungen für tägliche Habits.</div>
						</div>
					</div>
					<button class="notif-btn" onclick={requestPermission}>
						<i class="bi bi-bell-fill"></i> Benachrichtigungen erlauben
					</button>
				{/if}
			</div>
		{/if}

		<!-- Session -->
		<div class="card">
			<div class="card-title"><i class="bi bi-shield-fill"></i>Sitzung</div>
			<a href="/auth/logout" class="logout-btn">
				<i class="bi bi-box-arrow-right"></i> Abmelden
			</a>
		</div>

		<!-- Danger zone -->
		<div class="danger-card">
			<div class="card-title danger-title">
				<i class="bi bi-exclamation-triangle-fill"></i>Danger Zone
			</div>

			{#if form?.wipeSuccess}
				<div class="success-banner">
					<i class="bi bi-check-circle-fill"></i>
					<div>
						<div style="font-weight:700;">Alle Daten gelöscht.</div>
						<div style="font-size:.8rem;opacity:.8;">
							{form.deletedHabits} Habits, {form.deletedCheckins} Check-Ins,
							{form.deletedCategories} eigene Kategorien entfernt.
						</div>
					</div>
				</div>
			{/if}

			<div class="danger-row">
				<div class="danger-text">
					<div class="danger-row-title">Alle Habits & Daten löschen</div>
					<div class="danger-row-sub">
						Entfernt alle Habits, Check-Ins, Notizen und eigene Kategorien.
						Dein Account bleibt bestehen. Unwiderruflich.
					</div>
				</div>
				{#if !showWipe}
					<button class="danger-btn" onclick={openWipe}>
						<i class="bi bi-trash3-fill"></i> Löschen
					</button>
				{/if}
			</div>

			{#if showWipe}
				<div class="danger-confirm">
					{#if form?.wipeError}
						<div class="alert-error" style="margin-bottom: 0.7rem;">
							<i class="bi bi-exclamation-circle-fill"></i>
							<span>{form.wipeError}</span>
						</div>
					{/if}
					<p class="confirm-text">
						Tippe <strong>LÖSCHEN</strong> zur Bestätigung. Alle deine Daten gehen verloren.
					</p>
					<form
						method="POST"
						action="?/wipe"
						use:enhance={() => {
							strongTap();
							wiping = true;
							return async ({ update, result }) => {
								await update();
								wiping = false;
								if (result.type === 'success' && result.data?.wipeSuccess) {
									showWipe = false;
									wipeConfirm = '';
									await invalidateAll();
								}
							};
						}}
					>
						<input
							type="text"
							name="confirm"
							class="confirm-input"
							placeholder="LÖSCHEN"
							autocapitalize="characters"
							autocomplete="off"
							spellcheck="false"
							bind:value={wipeConfirm}
						/>
						<div class="confirm-actions">
							<button type="button" class="cancel-btn" onclick={cancelWipe}>
								Abbrechen
							</button>
							<button
								type="submit"
								class="danger-btn-solid"
								disabled={wiping || wipeConfirm !== 'LÖSCHEN'}
							>
								{#if wiping}
									<span class="spinner-border spinner-border-sm" style="border-width:2px;"></span>
								{:else}
									<i class="bi bi-trash3-fill"></i>
								{/if}
								Alles löschen
							</button>
						</div>
					</form>
				</div>
			{/if}
		</div>
	</div>
</div>
