// Always use noon UTC to avoid timezone-induced date shifts.
// new Date('2026-04-29T00:00:00') at UTC+2 = 2026-04-28T22:00:00Z → toISOString gives wrong day.
// new Date('2026-04-29T12:00:00Z') is always 2026-04-29 in toISOString.

export function addDays(dateStr, n) {
	const d = new Date(dateStr + 'T12:00:00Z');
	d.setUTCDate(d.getUTCDate() + n);
	return d.toISOString().split('T')[0];
}

// Mon=0 … Sun=6, UTC-based
export function utcDow(dateStr) {
	return (new Date(dateStr + 'T12:00:00Z').getUTCDay() + 6) % 7;
}
