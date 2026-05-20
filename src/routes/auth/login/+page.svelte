<script>
	import { enhance } from '$app/forms';

	let { form } = $props();
	let loading = $state(false);
</script>

<svelte:head>
	<title>Anmelden – daylq</title>
</svelte:head>

<style>
	.auth-bg {
		min-height: calc(100vh - 57px);
		background: radial-gradient(ellipse at 50% 40%, rgba(139, 92, 246, 0.06) 0%, var(--bs-body-bg, #0d0d1a) 65%);
	}
	.auth-card {
		border-radius: 16px !important;
		background-color: #1d1d38 !important;
		border: 1px solid rgba(139, 92, 246, 0.3) !important;
		box-shadow: 0 24px 64px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(139, 92, 246, 0.08) !important;
	}
	.form-control {
		background-color: rgba(255, 255, 255, 0.05) !important;
		border-color: rgba(139, 92, 246, 0.2) !important;
		color: var(--bs-body-color) !important;
	}
	.form-control:focus {
		border-color: #8b5cf6 !important;
		box-shadow: 0 0 0 0.2rem rgba(139, 92, 246, 0.2) !important;
		background-color: rgba(139, 92, 246, 0.05) !important;
	}
	.form-control::placeholder {
		color: rgba(136, 146, 164, 0.6);
	}
</style>

<div class="auth-bg d-flex align-items-center justify-content-center py-5">
	<div class="container">
		<div class="row justify-content-center">
			<div class="col-sm-9 col-md-6 col-lg-4">
				<div class="card auth-card">
					<div class="card-body p-4 p-md-5">
						<div class="text-center mb-4">
							<a
								href="/"
								class="text-decoration-none d-inline-block mb-3"
								style="font-size: 1.8rem; font-weight: 700; letter-spacing: -1px; color: #8b5cf6;"
							>
								day<span style="color: #f59e0b;">lq</span>
							</a>
							<p class="text-muted small mb-0">Willkommen zurück!</p>
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
							<div class="mb-3">
								<label for="email" class="form-label fw-medium small">E-Mail</label>
								<input
									type="email"
									id="email"
									name="email"
									class="form-control"
									placeholder="name@beispiel.de"
									autocomplete="email"
									required
								/>
							</div>

							<div class="mb-4">
								<label for="password" class="form-label fw-medium small">Passwort</label>
								<input
									type="password"
									id="password"
									name="password"
									class="form-control"
									placeholder="••••••••"
									autocomplete="current-password"
									required
								/>
							</div>

							<button type="submit" class="btn btn-primary w-100 fw-semibold" disabled={loading}>
								{#if loading}
									<span class="spinner-border spinner-border-sm me-2"></span>
								{/if}
								<i class="bi bi-box-arrow-in-right me-1"></i>Anmelden
							</button>
						</form>

						<hr class="my-4" />
						<p class="text-center text-muted small mb-0">
							Noch kein Konto?
							<a href="/auth/register" class="fw-semibold text-decoration-none" style="color: #8b5cf6;">
								Jetzt registrieren
							</a>
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
