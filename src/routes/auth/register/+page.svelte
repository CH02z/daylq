<script>
	import { enhance } from '$app/forms';
	import { strongTap, error as hapticError } from '$lib/haptic.js';

	let { form } = $props();
	let loading = $state(false);

	$effect(() => { if (form?.error) hapticError(); });
</script>

<svelte:head>
	<title>Registrieren – daylq</title>
</svelte:head>

<style>
	.auth-shell {
		min-height: calc(100vh - 70px);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem 1rem 4rem;
		position: relative;
		overflow: hidden;
	}
	.auth-shell::before {
		content: '';
		position: absolute;
		inset: -20% -10% auto -10%;
		height: 70%;
		background:
			radial-gradient(500px 250px at 30% 0%, rgba(99, 102, 241, 0.18), transparent 70%),
			radial-gradient(500px 250px at 70% 20%, rgba(236, 72, 153, 0.16), transparent 70%);
		filter: blur(50px);
		pointer-events: none;
		z-index: 0;
	}
	.auth-card {
		position: relative;
		z-index: 1;
		width: 100%;
		max-width: 460px;
		padding: 2.4rem 2rem;
		border-radius: var(--radius-xl);
		background: var(--surface-1);
		border: 1px solid var(--hairline);
		backdrop-filter: blur(28px) saturate(180%);
		-webkit-backdrop-filter: blur(28px) saturate(180%);
		box-shadow: var(--shadow-lg);
	}
	@media (min-width: 640px) {
		.auth-card { padding: 3rem 2.5rem; }
	}

	.auth-brand {
		font-size: 2rem;
		font-weight: 800;
		letter-spacing: -0.04em;
		display: inline-flex;
		gap: 1px;
		align-items: baseline;
		text-decoration: none;
		color: var(--bs-body-color);
		line-height: 1;
	}
	.auth-brand .mark {
		background: var(--brand-gradient);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
	}
	.auth-brand .dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--accent-green);
		margin-left: 4px;
		align-self: center;
		box-shadow: 0 0 12px rgba(52, 211, 153, 0.6);
	}

	h1 {
		font-size: 1.85rem;
		font-weight: 800;
		letter-spacing: -0.035em;
		margin: 1.1rem 0 0.4rem;
	}
	.sub {
		font-size: 0.95rem;
		color: var(--bs-secondary-color);
		margin-bottom: 2rem;
	}

	.field { margin-bottom: 0.9rem; }
	.field label {
		display: block;
		font-size: 0.78rem;
		font-weight: 600;
		color: var(--bs-secondary-color);
		margin-bottom: 6px;
		padding-left: 4px;
	}
	.field input {
		width: 100%;
		padding: 14px 16px;
		background: var(--surface-input);
		border: 1px solid var(--hairline);
		border-radius: var(--radius-md);
		color: var(--bs-body-color);
		font-size: 1rem;
		transition:
			border-color 0.18s var(--ease-soft),
			background 0.18s var(--ease-soft),
			box-shadow 0.18s var(--ease-soft);
	}
	.field input:focus {
		outline: none;
		background: var(--surface-input-focus);
		border-color: rgba(139, 92, 246, 0.55);
		box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.18);
	}
	.field input::placeholder { color: var(--bs-tertiary-color); }

	.hint {
		font-size: 0.74rem;
		color: var(--bs-tertiary-color);
		margin-top: 4px;
		padding-left: 4px;
	}

	.row-2 {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
	}
	@media (max-width: 480px) {
		.row-2 { grid-template-columns: 1fr; }
	}

	.submit-btn {
		width: 100%;
		padding: 14px 20px;
		border-radius: var(--radius-md);
		background: var(--brand-gradient);
		color: #fff;
		border: none;
		font-weight: 700;
		font-size: 1rem;
		letter-spacing: -0.01em;
		box-shadow: var(--shadow-brand);
		cursor: pointer;
		margin-top: 1rem;
		transition: transform 0.18s var(--ease-spring), filter 0.18s var(--ease-soft);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		min-height: 52px;
	}
	.submit-btn:hover { filter: brightness(1.08); }
	.submit-btn:active { transform: scale(0.98); }
	.submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

	.terms {
		text-align: center;
		font-size: 0.75rem;
		color: var(--bs-tertiary-color);
		margin-top: 0.9rem;
	}

	.divider {
		display: flex;
		align-items: center;
		gap: 12px;
		margin: 1.6rem 0 1.2rem;
		color: var(--bs-tertiary-color);
		font-size: 0.78rem;
	}
	.divider::before, .divider::after {
		content: '';
		flex: 1;
		height: 1px;
		background: var(--hairline);
	}

	.bottom-text {
		text-align: center;
		font-size: 0.9rem;
		color: var(--bs-secondary-color);
	}
	.bottom-text a {
		color: var(--brand-2);
		font-weight: 600;
		text-decoration: none;
	}
	.bottom-text a:hover { text-decoration: underline; }

	.alert-error {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 12px 14px;
		border-radius: var(--radius-sm);
		background: rgba(244, 63, 94, 0.1);
		border: 1px solid rgba(244, 63, 94, 0.25);
		color: var(--accent-rose);
		font-size: 0.85rem;
		margin-bottom: 1rem;
	}
</style>

<div class="auth-shell">
	<div class="auth-card fade-up">
		<a href="/" class="auth-brand">
			<span class="mark">daylq</span>
			<span class="dot"></span>
		</a>

		<h1>Erstelle deinen Account.</h1>
		<p class="sub">In 30 Sekunden bereit zum Tracken.</p>

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
			<div class="field">
				<label for="username">Benutzername</label>
				<input
					type="text"
					id="username"
					name="username"
					placeholder="dein_name"
					minlength="3"
					maxlength="30"
					autocomplete="username"
					required
				/>
				<div class="hint">Buchstaben, Zahlen und _</div>
			</div>

			<div class="field">
				<label for="email">E-Mail</label>
				<input
					type="email"
					id="email"
					name="email"
					placeholder="du@beispiel.com"
					autocomplete="email"
					required
				/>
			</div>

			<div class="row-2">
				<div class="field">
					<label for="password">Passwort</label>
					<input
						type="password"
						id="password"
						name="password"
						placeholder="Min. 8 Zeichen"
						minlength="8"
						autocomplete="new-password"
						required
					/>
				</div>

				<div class="field">
					<label for="confirmPassword">Bestätigen</label>
					<input
						type="password"
						id="confirmPassword"
						name="confirmPassword"
						placeholder="••••••••"
						autocomplete="new-password"
						required
					/>
				</div>
			</div>

			<button type="submit" class="submit-btn" disabled={loading}>
				{#if loading}
					<span class="spinner-border spinner-border-sm" style="border-width:2px;"></span>
				{:else}
					<i class="bi bi-stars"></i>
				{/if}
				Account erstellen
			</button>

			<p class="terms">
				Mit der Registrierung stimmst du den Nutzungsbedingungen zu.
			</p>
		</form>

		<div class="divider"><span>oder</span></div>

		<p class="bottom-text">
			Bereits ein Konto? <a href="/auth/login">Anmelden →</a>
		</p>
	</div>
</div>
