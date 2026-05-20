<svelte:head>
	<title>daylq – Baue bessere Gewohnheiten</title>
</svelte:head>

<style>
	.hero {
		background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
		min-height: calc(100vh - 57px);
	}
	.feature-icon {
		width: 52px;
		height: 52px;
		background: #ede9fe;
		border-radius: 14px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.5rem;
		color: #8b5cf6;
		flex-shrink: 0;
	}
	.badge-pill {
		background: rgba(255, 255, 255, 0.2);
		color: white;
		border-radius: 50px;
		padding: 4px 14px;
		font-size: 0.8rem;
		font-weight: 500;
		display: inline-block;
		margin-bottom: 1.5rem;
	}
</style>

<!-- Hero -->
<section class="hero d-flex align-items-center py-5">
	<div class="container text-center text-white">
		<div class="row justify-content-center">
			<div class="col-lg-7">
				<div class="badge-pill"><i class="bi bi-stars me-1"></i>Kostenlos & Open Source</div>
				<h1 class="display-3 fw-bold mb-3" style="letter-spacing: -1px;">
					Baue bessere<br />Gewohnheiten.
				</h1>
				<p class="lead mb-5" style="opacity: 0.8;">
					daylq macht Habit Tracking einfach, motivierend und visuell –<br />
					dein persönlicher Account. Geräteübergreifend. Gratis.
				</p>
				<div class="d-flex gap-3 justify-content-center flex-wrap">
					<a
						href="/auth/register"
						class="btn btn-light btn-lg px-4 fw-semibold"
						style="color: #8b5cf6;"
					>
						<i class="bi bi-rocket-takeoff me-2"></i>Kostenlos starten
					</a>
					<a href="/auth/login" class="btn btn-outline-light btn-lg px-4">Anmelden</a>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Features -->
<section class="py-5 bg-white">
	<div class="container">
		<div class="text-center mb-5">
			<h2 class="fw-bold" style="color: #1e1b4b;">Alles was du brauchst</h2>
			<p class="text-muted">Kein Overengineering. Kein Paywall. Einfach machen.</p>
		</div>
		<div class="row g-4">
			<div class="col-md-4">
				<div class="d-flex gap-3 align-items-start">
					<div class="feature-icon"><i class="bi bi-check2-circle"></i></div>
					<div>
						<h6 class="fw-semibold mb-1">Ein-Klick Tracking</h6>
						<p class="text-muted small mb-0">
							Täglich in unter 10 Sekunden deine Habits eintragen – niederschwellig und schnell.
						</p>
					</div>
				</div>
			</div>
			<div class="col-md-4">
				<div class="d-flex gap-3 align-items-start">
					<div class="feature-icon"><i class="bi bi-fire"></i></div>
					<div>
						<h6 class="fw-semibold mb-1">Streaks & Heatmaps</h6>
						<p class="text-muted small mb-0">
							GitHub-Style Heatmaps und Streak-Counter halten dich motiviert. Don't break the chain.
						</p>
					</div>
				</div>
			</div>
			<div class="col-md-4">
				<div class="d-flex gap-3 align-items-start">
					<div class="feature-icon"><i class="bi bi-cloud-check"></i></div>
					<div>
						<h6 class="fw-semibold mb-1">Überall verfügbar</h6>
						<p class="text-muted small mb-0">
							Dein Account synchronisiert alle Daten sicher via MongoDB – auf jedem Gerät.
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- CTA Footer Banner -->
<section class="py-5" style="background: var(--bs-card-bg, #16162a);">
	<div class="container text-center">
		<h3 class="fw-bold mb-2" style="color: #1e1b4b;">Bereit, deine Routine zu verändern?</h3>
		<p class="text-muted mb-4">Erstelle deinen Account in 30 Sekunden.</p>
		<a href="/auth/register" class="btn btn-primary btn-lg px-5 text-white">Jetzt registrieren</a>
	</div>
</section>
