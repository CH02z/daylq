<svelte:head>
	<title>daylq – Baue bessere Gewohnheiten.</title>
</svelte:head>

<style>
	.hero {
		position: relative;
		padding-top: 4rem;
		padding-bottom: 6rem;
		overflow: hidden;
	}
	.hero::before {
		content: '';
		position: absolute;
		inset: -10% -10% 50% -10%;
		background:
			radial-gradient(600px 320px at 70% 20%, rgba(236, 72, 153, 0.28), transparent 60%),
			radial-gradient(600px 320px at 20% 30%, rgba(99, 102, 241, 0.25), transparent 60%),
			radial-gradient(800px 400px at 50% 0%, rgba(139, 92, 246, 0.2), transparent 60%);
		filter: blur(50px);
		pointer-events: none;
		z-index: 0;
	}
	.hero-inner { position: relative; z-index: 1; }

	.eyebrow-pill {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 6px 14px;
		border-radius: var(--radius-pill);
		background: var(--surface-3);
		border: 1px solid var(--hairline);
		font-size: 0.78rem;
		font-weight: 600;
		color: var(--bs-secondary-color);
		backdrop-filter: blur(12px);
	}
	.eyebrow-pill .dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--accent-green);
		box-shadow: 0 0 10px rgba(52, 211, 153, 0.7);
	}

	h1.headline {
		font-size: clamp(2.6rem, 7vw, 5.4rem);
		font-weight: 800;
		letter-spacing: -0.045em;
		line-height: 1.02;
		margin: 1.4rem 0 1.2rem;
	}
	.sub {
		font-size: clamp(1rem, 1.6vw, 1.18rem);
		color: var(--bs-secondary-color);
		max-width: 540px;
		line-height: 1.5;
	}

	.hero-ctas {
		display: flex;
		gap: 10px;
		margin-top: 2.2rem;
		flex-wrap: wrap;
	}
	.btn-hero {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 14px 26px;
		border-radius: var(--radius-pill);
		font-size: 0.95rem;
		font-weight: 600;
		text-decoration: none;
		transition: transform 0.2s var(--ease-spring), filter 0.2s var(--ease-soft);
	}
	.btn-hero:active { transform: scale(0.97); }
	.btn-hero.primary {
		background: var(--brand-gradient);
		color: #fff;
		box-shadow: var(--shadow-brand);
	}
	.btn-hero.primary:hover { filter: brightness(1.08); color: #fff; }
	.btn-hero.ghost {
		background: var(--surface-3);
		color: var(--bs-body-color);
		border: 1px solid var(--hairline);
	}
	.btn-hero.ghost:hover { background: var(--surface-2); }

	.trust {
		margin-top: 2rem;
		display: flex;
		gap: 18px;
		align-items: center;
		color: var(--bs-secondary-color);
		font-size: 0.82rem;
		flex-wrap: wrap;
	}
	.trust-item {
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}
	.trust-item i { color: var(--accent-green); }

	/* ─── Hero mockup ─── */
	.mockup-stage {
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 540px;
		margin-top: 3rem;
	}
	@media (min-width: 992px) {
		.mockup-stage { margin-top: 0; }
	}

	.card-mockup {
		position: relative;
		width: min(420px, 100%);
		padding: 1.5rem;
		border-radius: 28px;
		background: var(--surface-1);
		border: 1px solid var(--hairline);
		backdrop-filter: blur(28px) saturate(180%);
		-webkit-backdrop-filter: blur(28px) saturate(180%);
		box-shadow: var(--shadow-lg), 0 0 0 1px var(--hairline);
		transform: perspective(1200px) rotateY(-8deg) rotateX(4deg);
		transform-style: preserve-3d;
		animation: floaty 8s ease-in-out infinite;
	}
	@keyframes floaty {
		0%, 100% { transform: perspective(1200px) rotateY(-8deg) rotateX(4deg) translateY(0); }
		50% { transform: perspective(1200px) rotateY(-8deg) rotateX(4deg) translateY(-10px); }
	}

	.mock-row {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 14px;
		background: var(--surface-3);
		border-radius: 18px;
		margin-bottom: 10px;
	}
	.mock-row:last-child { margin-bottom: 0; }
	.mock-icon {
		width: 42px;
		height: 42px;
		border-radius: 12px;
		display: grid;
		place-items: center;
		font-size: 1.2rem;
		flex-shrink: 0;
	}
	.mock-name {
		font-weight: 600;
		font-size: 0.9rem;
		color: var(--bs-body-color);
	}
	.mock-streak {
		font-size: 0.72rem;
		color: var(--bs-secondary-color);
	}
	.mock-check {
		width: 30px;
		height: 30px;
		border-radius: 50%;
		display: grid;
		place-items: center;
		color: #fff;
		font-size: 0.85rem;
		flex-shrink: 0;
	}

	.mock-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.2rem;
	}
	.mock-greeting {
		font-size: 0.7rem;
		color: var(--bs-secondary-color);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-weight: 600;
	}
	.mock-name-big {
		font-size: 1.3rem;
		font-weight: 700;
		letter-spacing: -0.025em;
	}
	.mock-progress {
		text-align: right;
	}
	.mock-progress-num {
		font-size: 1.6rem;
		font-weight: 700;
		background: var(--brand-gradient);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		line-height: 1;
	}
	.mock-progress-lbl {
		font-size: 0.62rem;
		color: var(--bs-secondary-color);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		margin-top: 4px;
	}

	/* Floating side decorations */
	.float-card {
		position: absolute;
		padding: 14px 18px;
		border-radius: 18px;
		background: var(--surface-1);
		border: 1px solid var(--hairline);
		backdrop-filter: blur(20px) saturate(180%);
		box-shadow: var(--shadow-md);
		display: flex;
		gap: 10px;
		align-items: center;
		font-size: 0.85rem;
		font-weight: 600;
		animation: floaty-alt 6s ease-in-out infinite;
	}
	@keyframes floaty-alt {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-8px); }
	}
	.float-card.top {
		top: 8%;
		right: 0;
		animation-delay: -3s;
	}
	.float-card.bottom {
		bottom: 8%;
		left: 0;
		animation-delay: -1.5s;
	}
	@media (max-width: 768px) {
		.float-card { display: none; }
	}

	.float-icon {
		width: 30px;
		height: 30px;
		border-radius: 9px;
		display: grid;
		place-items: center;
		color: #fff;
		font-size: 0.85rem;
	}

	/* ─── Features ─── */
	.features {
		padding: 5rem 0;
	}
	.section-eyebrow {
		font-size: 0.78rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--brand-2);
	}
	.section-title {
		font-size: clamp(2rem, 4.5vw, 3rem);
		font-weight: 800;
		letter-spacing: -0.035em;
		margin: 0.8rem 0 0.6rem;
		max-width: 720px;
	}
	.section-sub {
		font-size: 1.05rem;
		color: var(--bs-secondary-color);
		max-width: 540px;
	}

	.feature-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 16px;
		margin-top: 3rem;
	}
	@media (min-width: 768px) {
		.feature-grid { grid-template-columns: repeat(2, 1fr); }
	}
	@media (min-width: 1024px) {
		.feature-grid { grid-template-columns: repeat(3, 1fr); }
	}

	.feature-card {
		padding: 1.75rem;
		border-radius: var(--radius-lg);
		background: var(--surface-1);
		border: 1px solid var(--hairline);
		backdrop-filter: blur(24px) saturate(180%);
		-webkit-backdrop-filter: blur(24px) saturate(180%);
		transition: transform 0.3s var(--ease-spring), border-color 0.3s var(--ease-soft);
	}
	.feature-card:hover {
		transform: translateY(-3px);
		border-color: rgba(139, 92, 246, 0.3);
	}
	.feature-icon {
		width: 50px;
		height: 50px;
		border-radius: 14px;
		display: grid;
		place-items: center;
		font-size: 1.4rem;
		margin-bottom: 1.1rem;
		color: #fff;
	}
	.feature-card h3 {
		font-size: 1.15rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		margin: 0 0 0.4rem;
	}
	.feature-card p {
		font-size: 0.92rem;
		color: var(--bs-secondary-color);
		line-height: 1.55;
		margin: 0;
	}

	/* ─── CTA strip ─── */
	.cta-strip {
		padding: 5rem 0 6rem;
	}
	.cta-card {
		padding: 3rem 2rem;
		border-radius: var(--radius-xl);
		background: var(--brand-gradient);
		text-align: center;
		color: #fff;
		position: relative;
		overflow: hidden;
		box-shadow: var(--shadow-lg);
	}
	.cta-card::before {
		content: '';
		position: absolute;
		inset: 0;
		background: radial-gradient(600px 200px at 50% 0%, rgba(255, 255, 255, 0.18), transparent 70%);
		pointer-events: none;
	}
	.cta-card h2 {
		font-size: clamp(1.6rem, 4vw, 2.4rem);
		font-weight: 800;
		letter-spacing: -0.03em;
		margin: 0 0 0.6rem;
	}
	.cta-card p {
		font-size: 1rem;
		opacity: 0.86;
		margin: 0 0 1.5rem;
	}
	.cta-card .btn-hero {
		background: #fff;
		color: #6d28d9;
	}
	.cta-card .btn-hero:hover { background: #fff; filter: brightness(0.97); color: #6d28d9; }

	footer {
		padding: 2rem 0 calc(2rem + env(safe-area-inset-bottom));
		text-align: center;
		font-size: 0.8rem;
		color: var(--bs-secondary-color);
		border-top: 1px solid var(--hairline);
	}
</style>

<!-- Hero -->
<section class="hero">
	<div class="app-container hero-inner">
		<div class="row align-items-center g-4">
			<div class="col-lg-6 fade-up">
				<span class="eyebrow-pill">
					<span class="dot"></span>
					Schulprojekt · ZHAW Prototyping
				</span>
				<h1 class="headline">
					Kleine <span class="gradient-text">Habits</span>.<br />
					Große Veränderung.
				</h1>
				<p class="sub">
					daylq macht Habit-Tracking ruhig, schön und motivierend. Ein Tap pro Habit, Streaks die
					süchtig machen und eine Heatmap, die dich stolz macht.
				</p>
				<div class="hero-ctas">
					<a href="/auth/register" class="btn-hero primary">
						Kostenlos starten <i class="bi bi-arrow-right"></i>
					</a>
					<a href="/auth/login" class="btn-hero ghost">
						Schon dabei? Anmelden
					</a>
				</div>
				<div class="trust">
					<span class="trust-item"><i class="bi bi-check-circle-fill"></i> Kein Tracking</span>
					<span class="trust-item"><i class="bi bi-check-circle-fill"></i> Keine Werbung</span>
					<span class="trust-item"><i class="bi bi-check-circle-fill"></i> Open Source</span>
				</div>
			</div>

			<div class="col-lg-6">
				<div class="mockup-stage">
					<div class="card-mockup">
						<div class="mock-header">
							<div>
								<div class="mock-greeting">Guten Morgen</div>
								<div class="mock-name-big">Chris</div>
							</div>
							<div class="mock-progress">
								<div class="mock-progress-num">4/5</div>
								<div class="mock-progress-lbl">heute</div>
							</div>
						</div>

						<div class="mock-row">
							<div class="mock-icon" style="background:rgba(239,68,68,0.16);color:#ef4444;">
								<i class="bi bi-droplet-fill"></i>
							</div>
							<div style="flex:1">
								<div class="mock-name">2 Liter Wasser</div>
								<div class="mock-streak">🔥 12 Tage Streak</div>
							</div>
							<div class="mock-check" style="background:#ef4444;">
								<i class="bi bi-check-lg"></i>
							</div>
						</div>

						<div class="mock-row">
							<div class="mock-icon" style="background:rgba(59,130,246,0.16);color:#3b82f6;">
								<i class="bi bi-book-fill"></i>
							</div>
							<div style="flex:1">
								<div class="mock-name">30 Minuten lesen</div>
								<div class="mock-streak">🔥 7 Tage Streak</div>
							</div>
							<div class="mock-check" style="background:#3b82f6;">
								<i class="bi bi-check-lg"></i>
							</div>
						</div>

						<div class="mock-row">
							<div class="mock-icon" style="background:rgba(16,185,129,0.16);color:#10b981;">
								<i class="bi bi-peace"></i>
							</div>
							<div style="flex:1">
								<div class="mock-name">Meditation</div>
								<div class="mock-streak">🔥 23 Tage Streak</div>
							</div>
							<div class="mock-check" style="background:rgba(255,255,255,0.06);color:var(--bs-tertiary-color);">
								<i class="bi bi-circle"></i>
							</div>
						</div>
					</div>

					<div class="float-card top">
						<div class="float-icon" style="background:linear-gradient(135deg,#fb923c,#f59e0b);">
							<i class="bi bi-fire"></i>
						</div>
						<div>
							<div style="font-size:.72rem;color:var(--bs-secondary-color);font-weight:500;">Beste Streak</div>
							<div>23 Tage</div>
						</div>
					</div>
					<div class="float-card bottom">
						<div class="float-icon" style="background:linear-gradient(135deg,#34d399,#10b981);">
							<i class="bi bi-trophy-fill"></i>
						</div>
						<div>
							<div style="font-size:.72rem;color:var(--bs-secondary-color);font-weight:500;">Achievement</div>
							<div>100 Completions</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Features -->
<section class="features">
	<div class="app-container">
		<span class="section-eyebrow">Designed für Konsistenz</span>
		<h2 class="section-title">Alles was du brauchst. Nichts was du nicht willst.</h2>
		<p class="section-sub">
			Kein endloses Konfigurieren. Kein Schnickschnack. Ein Tap, eine Routine, ein besseres Du.
		</p>

		<div class="feature-grid">
			<div class="feature-card">
				<div class="feature-icon" style="background:linear-gradient(135deg,#6366f1,#8b5cf6);">
					<i class="bi bi-check2-circle"></i>
				</div>
				<h3>1-Tap Tracking</h3>
				<p>
					Tägliche Habits in unter 10 Sekunden eintragen. Mit optionaler Notiz für die Reflexion.
				</p>
			</div>

			<div class="feature-card">
				<div class="feature-icon" style="background:linear-gradient(135deg,#f59e0b,#ef4444);">
					<i class="bi bi-fire"></i>
				</div>
				<h3>Streaks & Heatmaps</h3>
				<p>
					GitHub-Style Heatmaps und Streak-Counter halten dich motiviert. Don't break the chain.
				</p>
			</div>

			<div class="feature-card">
				<div class="feature-icon" style="background:linear-gradient(135deg,#10b981,#34d399);">
					<i class="bi bi-graph-up-arrow"></i>
				</div>
				<h3>Smarte Analytics</h3>
				<p>
					Sieh deine besten Wochentage, Kategorie-Aufteilung und Top-Streaks auf einen Blick.
				</p>
			</div>

			<div class="feature-card">
				<div class="feature-icon" style="background:linear-gradient(135deg,#ec4899,#f43f5e);">
					<i class="bi bi-bell-fill"></i>
				</div>
				<h3>Erinnerungen</h3>
				<p>
					Browser-Benachrichtigungen zur richtigen Zeit. Nie wieder einen Habit vergessen.
				</p>
			</div>

			<div class="feature-card">
				<div class="feature-icon" style="background:linear-gradient(135deg,#3b82f6,#06b6d4);">
					<i class="bi bi-trophy-fill"></i>
				</div>
				<h3>Achievements</h3>
				<p>
					Verdiene Badges für 3, 7, 30, 100 und 365 Tage Streak. Belohnung für deine Konsistenz.
				</p>
			</div>

			<div class="feature-card">
				<div class="feature-icon" style="background:linear-gradient(135deg,#8b5cf6,#ec4899);">
					<i class="bi bi-cloud-check-fill"></i>
				</div>
				<h3>Überall verfügbar</h3>
				<p>
					Dein Account synchronisiert alle Daten sicher in der Cloud. Auf jedem Gerät.
				</p>
			</div>
		</div>
	</div>
</section>

<!-- CTA -->
<section class="cta-strip">
	<div class="app-container">
		<div class="cta-card">
			<h2>Bereit deine Routine zu verändern?</h2>
			<p>Erstelle deinen Account in 30 Sekunden.</p>
			<a href="/auth/register" class="btn-hero">
				Jetzt kostenlos starten <i class="bi bi-arrow-right"></i>
			</a>
		</div>
	</div>
</section>

<footer>
	<div class="app-container">
		<span style="font-weight:700;letter-spacing:-.02em;">daylq</span> · ZHAW Prototyping
		FS 2026 · <span style="opacity:.7;">by Chris Zimmermann</span>
	</div>
</footer>
