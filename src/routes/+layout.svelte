<script>
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/stores';
	import { tap } from '$lib/haptic.js';

	let { children, data } = $props();
	const user = $derived(data.user);

	let theme = $state('dark');
	let mounted = $state(false);

	function readTheme() {
		const m = document.cookie.match(/theme=([^;]+)/);
		return m ? m[1] : 'dark';
	}

	function applyTheme(t) {
		theme = t;
		document.documentElement.setAttribute('data-bs-theme', t);
		document.cookie = `theme=${t};path=/;max-age=${60 * 60 * 24 * 365}`;
		// Notify any other component listening (e.g. settings page) that theme changed
		window.dispatchEvent(new CustomEvent('daylq:theme-change', { detail: t }));
	}

	function toggleTheme() {
		tap();
		applyTheme(theme === 'dark' ? 'light' : 'dark');
	}

	function onExternalThemeChange(e) {
		theme = e.detail;
	}

	$effect(() => {
		theme = readTheme();
		mounted = true;
		window.addEventListener('daylq:theme-change', onExternalThemeChange);
		return () => window.removeEventListener('daylq:theme-change', onExternalThemeChange);
	});

	const path = $derived($page.url.pathname);
	const isHome = $derived(path === '/');
	const isDashboard = $derived(path === '/dashboard' || path.startsWith('/habits'));
	const isCats = $derived(path.startsWith('/categories'));
	const isSettings = $derived(path.startsWith('/settings'));
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>daylq</title>
</svelte:head>

<style>
	.brand {
		font-size: 1.5rem;
		font-weight: 800;
		letter-spacing: -0.04em;
		text-decoration: none;
		color: var(--bs-body-color);
		display: inline-flex;
		align-items: baseline;
		gap: 1px;
		line-height: 1;
	}
	.brand-mark {
		background: var(--brand-gradient);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		-webkit-text-fill-color: transparent;
	}
	.brand-dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--accent-green);
		margin-left: 4px;
		align-self: center;
		box-shadow: 0 0 12px rgba(52, 211, 153, 0.6);
		animation: pulse-dot 2.4s ease-in-out infinite;
	}
	@keyframes pulse-dot {
		0%, 100% { opacity: 1; transform: scale(1); }
		50% { opacity: 0.6; transform: scale(0.9); }
	}

	/* ─── Top navbar (glass) ─── */
	.topnav {
		position: sticky;
		top: 0;
		z-index: 50;
		padding-top: max(0.5rem, env(safe-area-inset-top));
		padding-bottom: 0.6rem;
		background: color-mix(in srgb, var(--bs-body-bg) 70%, transparent);
		backdrop-filter: blur(28px) saturate(180%);
		-webkit-backdrop-filter: blur(28px) saturate(180%);
		border-bottom: 1px solid var(--hairline);
	}
	.nav-inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding-top: 0.5rem;
	}

	.nav-pill-row {
		display: none;
	}
	@media (min-width: 768px) {
		.nav-pill-row {
			display: flex;
			align-items: center;
			gap: 4px;
			background: var(--surface-3);
			border: 1px solid var(--hairline);
			border-radius: var(--radius-pill);
			padding: 4px;
		}
	}
	.nav-pill {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 7px 16px;
		font-size: 0.85rem;
		font-weight: 600;
		border-radius: var(--radius-pill);
		color: var(--bs-secondary-color);
		text-decoration: none;
		transition:
			color 0.2s var(--ease-soft),
			background 0.2s var(--ease-soft);
	}
	.nav-pill:hover { color: var(--bs-body-color); }
	.nav-pill.active {
		background: var(--bs-body-bg);
		color: var(--bs-body-color);
		box-shadow: var(--shadow-md);
	}

	.icon-btn {
		width: 40px;
		height: 40px;
		border-radius: var(--radius-pill);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 1rem;
		color: var(--bs-body-color);
		background: var(--surface-3);
		border: 1px solid var(--hairline);
		transition:
			transform 0.18s var(--ease-spring),
			background 0.18s var(--ease-soft);
		text-decoration: none;
	}
	.icon-btn:hover { background: var(--surface-2); color: var(--bs-body-color); }
	.icon-btn:active { transform: scale(0.94); }

	.cta-btn {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 9px 18px;
		font-size: 0.88rem;
		font-weight: 600;
		border-radius: var(--radius-pill);
		background: var(--brand-gradient);
		color: #fff !important;
		text-decoration: none;
		box-shadow: var(--shadow-brand);
		transition: transform 0.18s var(--ease-spring), filter 0.18s var(--ease-soft);
	}
	.cta-btn:hover { filter: brightness(1.08); color: #fff; }
	.cta-btn:active { transform: scale(0.97); }

	.right-actions {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	/* ─── Bottom navigation (mobile, iOS-Style) ─── */
	.bottomnav {
		position: fixed;
		bottom: max(14px, calc(env(safe-area-inset-bottom) + 6px));
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		align-items: center;
		gap: 3px;
		padding: 7px;
		background: color-mix(in srgb, var(--bs-body-bg) 72%, transparent);
		backdrop-filter: blur(32px) saturate(180%);
		-webkit-backdrop-filter: blur(32px) saturate(180%);
		border: 1px solid var(--hairline);
		border-radius: var(--radius-pill);
		box-shadow: var(--shadow-lg);
		z-index: 60;
		max-width: calc(100vw - 24px);
	}
	@media (min-width: 768px) {
		.bottomnav { display: none; }
	}
	.bn-item {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		gap: 2px;
		min-width: 60px;
		min-height: 52px;
		padding: 8px 14px;
		border-radius: var(--radius-pill);
		font-size: 0.66rem;
		font-weight: 600;
		color: var(--bs-secondary-color);
		text-decoration: none;
		transition:
			color 0.22s var(--ease-soft),
			transform 0.18s var(--ease-spring);
	}
	.bn-item:active { transform: scale(0.92); }
	.bn-item i {
		font-size: 1.25rem;
		transition: color 0.22s var(--ease-soft);
	}
	/* Active tab — distinct from CTA: brand-coloured icon + subtle dot indicator, no fill */
	.bn-item.active {
		color: var(--bs-body-color);
	}
	.bn-item.active i {
		background: var(--brand-gradient);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		-webkit-text-fill-color: transparent;
	}
	.bn-item.active::before {
		content: '';
		position: absolute;
		bottom: -3px;
		left: 50%;
		transform: translateX(-50%);
		width: 4px;
		height: 4px;
		border-radius: 50%;
		background: var(--brand-gradient);
		box-shadow: 0 0 8px rgba(139, 92, 246, 0.6);
	}

	/* CTA "Habit" — pill on the right edge, gradient + label, elevated */
	.bn-cta {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		min-height: 48px;
		padding: 0 16px 0 14px;
		border-radius: var(--radius-pill);
		font-size: 0.84rem;
		font-weight: 700;
		letter-spacing: -0.01em;
		color: #fff !important;
		text-decoration: none;
		background: var(--brand-gradient);
		box-shadow: var(--shadow-brand), 0 0 0 3px color-mix(in srgb, var(--bs-body-bg) 55%, transparent);
		margin-left: 6px;
		transform: translateY(-2px);
		transition: transform 0.18s var(--ease-spring), filter 0.18s var(--ease-soft);
	}
	.bn-cta i {
		font-size: 1.15rem;
		color: #fff !important;
		background: none !important;
		-webkit-text-fill-color: #fff !important;
	}
	.bn-cta:hover { filter: brightness(1.08); color: #fff !important; }
	.bn-cta:active { transform: translateY(-2px) scale(0.94); }
	.bn-cta::before { display: none !important; }

	/* Very narrow viewports — shrink things a bit */
	@media (max-width: 400px) {
		.bn-item { min-width: 50px; padding: 8px 8px; gap: 1px; }
		.bn-item span { font-size: 0.62rem; }
		.bn-cta { padding: 0 12px; font-size: 0.78rem; min-height: 44px; }
		.bn-cta i { font-size: 1rem; }
		.bottomnav { gap: 2px; padding: 6px; }
	}

	/* ─── Public navbar (when logged out) ─── */
	.public-actions { display: flex; gap: 8px; align-items: center; }

	.theme-toggle {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border-radius: var(--radius-pill);
		background: var(--surface-3);
		border: 1px solid var(--hairline);
		color: var(--bs-body-color);
		cursor: pointer;
		transition: transform 0.18s var(--ease-spring), background 0.18s var(--ease-soft);
	}
	.theme-toggle:hover { background: var(--surface-2); }
	.theme-toggle:active { transform: scale(0.94); }

	.brand-label {
		display: none;
	}
	@media (min-width: 480px) {
		.brand-label { display: inline; }
	}
</style>

{#if user}
	<nav class="topnav">
		<div class="app-container nav-inner">
			<a class="brand" href="/dashboard" aria-label="daylq Dashboard">
				<span class="brand-mark">daylq</span>
				<span class="brand-dot" aria-hidden="true"></span>
			</a>

			<div class="nav-pill-row" aria-label="Primary">
				<a href="/dashboard" class="nav-pill" class:active={isDashboard}>
					<i class="bi bi-grid-1x2-fill"></i>
					<span>Dashboard</span>
				</a>
				<a href="/categories" class="nav-pill" class:active={isCats}>
					<i class="bi bi-tag-fill"></i>
					<span>Kategorien</span>
				</a>
				<a href="/settings" class="nav-pill" class:active={isSettings}>
					<i class="bi bi-person-fill"></i>
					<span>Profil</span>
				</a>
			</div>

			<div class="right-actions">
				<button
					class="theme-toggle"
					onclick={toggleTheme}
					aria-label="Theme wechseln"
					title="Theme wechseln"
				>
					{#if mounted}
						<i class="bi {theme === 'dark' ? 'bi-sun-fill' : 'bi-moon-stars-fill'}"></i>
					{:else}
						<i class="bi bi-moon-stars-fill"></i>
					{/if}
				</button>
				<a href="/habits/new" class="cta-btn" aria-label="Neuer Habit">
					<i class="bi bi-plus-lg"></i>
					<span class="brand-label">Habit</span>
				</a>
				<a href="/auth/logout" class="icon-btn" aria-label="Abmelden" title="Abmelden">
					<i class="bi bi-box-arrow-right"></i>
				</a>
			</div>
		</div>
	</nav>

	{@render children()}

	<!-- Bottom nav (mobile) -->
	<nav class="bottomnav" aria-label="Mobile Navigation">
		<a href="/dashboard" class="bn-item" class:active={isDashboard} aria-label="Dashboard" onclick={tap}>
			<i class="bi bi-grid-1x2-fill"></i>
			<span>Dashboard</span>
		</a>
		<a href="/categories" class="bn-item" class:active={isCats} aria-label="Kategorien" onclick={tap}>
			<i class="bi bi-tag-fill"></i>
			<span>Kategorien</span>
		</a>
		<a href="/settings" class="bn-item" class:active={isSettings} aria-label="Profil" onclick={tap}>
			<i class="bi bi-person-fill"></i>
			<span>Profil</span>
		</a>
		<a href="/habits/new" class="bn-cta" aria-label="Neuer Habit" onclick={tap}>
			<i class="bi bi-plus-lg"></i>
			<span>Habit</span>
		</a>
	</nav>
{:else}
	<nav class="topnav">
		<div class="app-container nav-inner">
			<a class="brand" href="/" aria-label="daylq Startseite">
				<span class="brand-mark">daylq</span>
				<span class="brand-dot" aria-hidden="true"></span>
			</a>

			<div class="public-actions">
				<button
					class="theme-toggle"
					onclick={toggleTheme}
					aria-label="Theme wechseln"
					title="Theme wechseln"
				>
					{#if mounted}
						<i class="bi {theme === 'dark' ? 'bi-sun-fill' : 'bi-moon-stars-fill'}"></i>
					{:else}
						<i class="bi bi-moon-stars-fill"></i>
					{/if}
				</button>
				<a href="/auth/login" class="icon-btn" style="width:auto;padding:0 16px;font-size:.85rem;font-weight:600;">
					Anmelden
				</a>
				<a href="/auth/register" class="cta-btn">
					Registrieren
				</a>
			</div>
		</div>
	</nav>

	{@render children()}
{/if}
