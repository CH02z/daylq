<script>
	import { onMount } from 'svelte';

	let { data } = $props();

	let notifSupported = $state(false);
	let notifPermission = $state('default');

	onMount(() => {
		notifSupported = 'Notification' in window;
		if (notifSupported) notifPermission = Notification.permission;
	});

	async function requestPermission() {
		const result = await Notification.requestPermission();
		notifPermission = result;
		if (result === 'granted') {
			new Notification('daylq – Benachrichtigungen aktiviert! 🎉', {
				body: 'Du erhältst ab jetzt Erinnerungen für deine Habits.',
				icon: '/favicon.svg'
			});
		}
	}

	const initials = $derived(
		data.user.username
			.split(/[\s_-]/)
			.slice(0, 2)
			.map((w) => w[0]?.toUpperCase() ?? '')
			.join('')
	);

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
	<title>Einstellungen – daylq</title>
</svelte:head>

<style>
	.page {
		min-height: calc(100vh - 57px);
		padding: 1.5rem 1rem;
		max-width: 680px;
		margin: 0 auto;
	}
	.settings-card {
		border-radius: 16px;
		background: var(--bs-card-bg, #1a1f2e);
		border: 1px solid var(--bs-border-color, #2a3148);
		padding: 1.4rem;
		margin-bottom: 1rem;
	}
	.card-label {
		font-size: 0.7rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--bs-secondary-color, #6b7280);
		margin-bottom: 1rem;
	}
	.avatar {
		width: 56px;
		height: 56px;
		border-radius: 16px;
		background: linear-gradient(135deg, #8b5cf6, #7c3aed);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.2rem;
		font-weight: 700;
		color: white;
		flex-shrink: 0;
	}
	.info-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.55rem 0;
		border-bottom: 1px solid var(--bs-border-color, #2a3148);
		font-size: 0.875rem;
	}
	.info-row:last-child {
		border-bottom: none;
		padding-bottom: 0;
	}
	.info-label {
		color: var(--bs-secondary-color, #6b7280);
	}
	.stat-box {
		flex: 1;
		text-align: center;
		padding: 0.8rem;
		border-radius: 10px;
		background: rgba(255, 255, 255, 0.04);
	}
	.stat-num {
		font-size: 1.6rem;
		font-weight: 700;
		line-height: 1;
	}
	.stat-lbl {
		font-size: 0.7rem;
		color: var(--bs-secondary-color, #6b7280);
		margin-top: 2px;
	}
</style>

<div class="page">
	<div class="d-flex align-items-center gap-3 mb-4">
		<a href="/dashboard" class="btn btn-sm btn-outline-secondary" aria-label="Zurück zum Dashboard">
			<i class="bi bi-arrow-left"></i>
		</a>
		<h4 class="fw-bold mb-0">Einstellungen</h4>
	</div>

	<!-- Account -->
	<div class="settings-card">
		<p class="card-label"><i class="bi bi-person-fill me-1"></i>Account</p>
		<div class="d-flex align-items-center gap-3 mb-3">
			<div class="avatar">{initials}</div>
			<div>
				<div class="fw-semibold">{data.user.username}</div>
				<div style="font-size:0.82rem;color:var(--bs-secondary-color,#6b7280);">
					{data.user.email}
				</div>
			</div>
		</div>
		<div class="info-row">
			<span class="info-label">Benutzername</span>
			<span class="fw-medium">@{data.user.username}</span>
		</div>
		<div class="info-row">
			<span class="info-label">E-Mail</span>
			<span class="fw-medium">{data.user.email}</span>
		</div>
		<div class="info-row">
			<span class="info-label">Mitglied seit</span>
			<span class="fw-medium">{memberSince}</span>
		</div>
	</div>

	<!-- Stats -->
	<div class="settings-card">
		<p class="card-label"><i class="bi bi-graph-up me-1"></i>Deine Statistiken</p>
		<div class="d-flex gap-2">
			<div class="stat-box">
				<div class="stat-num" style="color:#8b5cf6;">{data.habitCount}</div>
				<div class="stat-lbl">Aktive Habits</div>
			</div>
			<div class="stat-box">
				<div class="stat-num" style="color:#10b981;">{data.checkinCount}</div>
				<div class="stat-lbl">Completions gesamt</div>
			</div>
		</div>
	</div>

	<!-- Notifications -->
	{#if notifSupported}
		<div class="settings-card">
			<p class="card-label"><i class="bi bi-bell-fill me-1"></i>Erinnerungen</p>
			{#if notifPermission === 'granted'}
				<div class="d-flex align-items-center gap-2">
					<i class="bi bi-check-circle-fill" style="color:#10b981;font-size:1.1rem;"></i>
					<div>
						<div class="fw-medium" style="font-size:0.88rem;">Benachrichtigungen aktiviert</div>
						<div style="font-size:0.78rem;color:var(--bs-secondary-color,#6b7280);">
							Erinnerungszeiten kannst du pro Habit in den Habit-Einstellungen festlegen.
						</div>
					</div>
				</div>
			{:else if notifPermission === 'denied'}
				<div class="d-flex align-items-center gap-2">
					<i class="bi bi-bell-slash-fill" style="color:#ef4444;font-size:1.1rem;"></i>
					<div>
						<div class="fw-medium" style="font-size:0.88rem;">Benachrichtigungen blockiert</div>
						<div style="font-size:0.78rem;color:var(--bs-secondary-color,#6b7280);">
							Bitte erlaube Benachrichtigungen in deinen Browser-Einstellungen.
						</div>
					</div>
				</div>
			{:else}
				<p style="font-size:0.83rem;color:var(--bs-secondary-color,#6b7280);" class="mb-3">
					Aktiviere Browser-Benachrichtigungen, um tägliche Erinnerungen für deine Habits zu erhalten.
					Die Erinnerungszeit kannst du pro Habit festlegen.
				</p>
				<button class="btn btn-primary btn-sm" onclick={requestPermission}>
					<i class="bi bi-bell-fill me-1"></i>Benachrichtigungen aktivieren
				</button>
			{/if}
		</div>
	{/if}

	<!-- Account actions -->
	<div class="settings-card">
		<p class="card-label"><i class="bi bi-shield-fill me-1"></i>Sitzung</p>
		<a href="/auth/logout" class="btn btn-outline-danger btn-sm w-100">
			<i class="bi bi-box-arrow-right me-1"></i>Abmelden
		</a>
	</div>
</div>
