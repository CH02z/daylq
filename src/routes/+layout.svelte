<script>
	import favicon from '$lib/assets/favicon.svg';

	let { children, data } = $props();
	const user = $derived(data.user);

	let theme = $state('dark');

	function applyTheme(t) {
		theme = t;
		document.documentElement.setAttribute('data-bs-theme', t);
		document.cookie = `theme=${t};path=/;max-age=${60 * 60 * 24 * 365}`;
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>daylq</title>
</svelte:head>

<style>
	:global(:root) {
		--daylq-primary: #8b5cf6;
		--daylq-primary-dark: #7c3aed;
		--daylq-accent: #34d399;
	}
	:global([data-bs-theme='dark']) {
		--bs-body-bg: #0d0d1a;
		--bs-card-bg: #16162a;
		--bs-border-color: #252540;
		--bs-body-color: #e2e8f0;
		--bs-secondary-color: #8892a4;
	}
	:global(body) {
		font-family: 'Inter', system-ui, -apple-system, sans-serif;
		-webkit-text-size-adjust: 100%;
		-webkit-tap-highlight-color: rgba(139, 92, 246, 0.1);
		padding-bottom: env(safe-area-inset-bottom);
	}
	/* Safe area for iPhone notch */
	:global(.page), :global(.auth-bg), :global(.page-bg) {
		padding-bottom: max(1.5rem, calc(1rem + env(safe-area-inset-bottom)));
	}
	/* Prevent iOS Safari auto-zoom on input focus (requires ≥16px) */
	:global(.form-control),
	:global(.form-control-sm),
	:global(input[type='text']),
	:global(input[type='email']),
	:global(input[type='password']),
	:global(input[type='search']) {
		font-size: max(1rem, 16px) !important;
	}
	/* Minimum touch target size */
	:global(.btn) {
		min-height: 38px;
	}
	:global(.btn-sm) {
		min-height: 34px;
	}
	:global(.btn-primary) {
		background-color: var(--daylq-primary);
		border-color: var(--daylq-primary);
	}
	:global(.btn-primary:hover, .btn-primary:focus) {
		background-color: var(--daylq-primary-dark);
		border-color: var(--daylq-primary-dark);
	}
	:global(.btn-outline-primary) {
		color: var(--daylq-primary);
		border-color: var(--daylq-primary);
	}
	:global(.btn-outline-primary:hover) {
		background-color: var(--daylq-primary);
		border-color: var(--daylq-primary);
		color: white;
	}
	:global(.text-primary) {
		color: var(--daylq-primary) !important;
	}
	:global(.card) {
		border: 1px solid var(--bs-border-color, #2a3148);
	}
	.brand {
		font-size: 1.3rem;
		font-weight: 700;
		letter-spacing: -0.5px;
		color: var(--daylq-primary);
		text-decoration: none;
	}
	.brand span {
		color: var(--daylq-accent);
	}
	.navbar {
		border-bottom: 1px solid var(--bs-border-color, rgba(255, 255, 255, 0.08));
		padding-top: max(0.5rem, env(safe-area-inset-top));
		padding-left: max(0px, env(safe-area-inset-left));
		padding-right: max(0px, env(safe-area-inset-right));
	}
	.nav-actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0 0;
	}
	@media (min-width: 992px) {
		.nav-actions {
			padding: 0;
		}
	}
</style>

{#if user}
	<nav class="navbar navbar-expand-lg sticky-top" style="background: var(--bs-body-bg);">
		<div class="container">
			<a class="brand" href="/dashboard">day<span>lq</span></a>
			<button
				class="navbar-toggler border-0"
				type="button"
				data-bs-toggle="collapse"
				data-bs-target="#navMain"
				aria-label="Navigation öffnen"
			>
				<span class="navbar-toggler-icon"></span>
			</button>
			<div class="collapse navbar-collapse" id="navMain">
				<ul class="navbar-nav me-auto ms-3">
					<li class="nav-item">
						<a class="nav-link" href="/dashboard">
							<i class="bi bi-grid-1x2 me-1"></i>Dashboard
						</a>
					</li>
					<li class="nav-item">
						<a class="nav-link" href="/categories">
							<i class="bi bi-tag-fill me-1"></i>Kategorien
						</a>
					</li>
				</ul>
				<div class="nav-actions">
					<a href="/settings" class="btn btn-sm btn-outline-secondary">
						<i class="bi bi-gear me-1"></i>Einstellungen
					</a>
					<a href="/habits/new" class="btn btn-sm btn-primary text-white">
						<i class="bi bi-plus-lg me-1"></i>Habit
					</a>
					<a href="/auth/logout" class="btn btn-sm btn-outline-secondary" aria-label="Abmelden">
						<i class="bi bi-box-arrow-right"></i>
					</a>
				</div>
			</div>
		</div>
	</nav>
{:else}
	<nav class="navbar" style="background: var(--bs-body-bg); border-bottom: 1px solid var(--bs-border-color, rgba(255,255,255,0.08));">
		<div class="container">
			<a class="brand" href="/">day<span>lq</span></a>
			<div class="d-flex gap-2">
				<a href="/auth/login" class="btn btn-outline-primary btn-sm">Anmelden</a>
				<a href="/auth/register" class="btn btn-primary btn-sm text-white">Registrieren</a>
			</div>
		</div>
	</nav>
{/if}

{@render children()}
