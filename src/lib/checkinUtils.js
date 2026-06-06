/**
 * Returns the effective count of a checkin doc.
 * Legacy docs without `count` are treated as count = goal (= fully done).
 */
export function checkinCount(checkin, goal) {
	if (!checkin) return 0;
	if (typeof checkin.count === 'number') return checkin.count;
	return goal; // legacy
}

/**
 * True if the day is "fully done" (count >= goal).
 */
export function isDayDone(checkin, goal) {
	return checkinCount(checkin, goal) >= goal;
}

/**
 * Build a Map<date, count> for a habit from its checkins, considering goal for legacy docs.
 */
export function buildCountMap(checkins, goal) {
	const m = new Map();
	for (const c of checkins) {
		m.set(c.date, checkinCount(c, goal));
	}
	return m;
}

/**
 * Current streak based on consecutive fully-done days back from today.
 * countMap: Map<dateStr, count>; goal: integer.
 */
export function currentStreak(countMap, goal, today, addDays) {
	let count = 0;
	let d = today;
	if ((countMap.get(d) ?? 0) < goal) d = addDays(d, -1);
	for (let i = 0; i < 365; i++) {
		if ((countMap.get(d) ?? 0) >= goal) {
			count++;
			d = addDays(d, -1);
		} else break;
	}
	return count;
}
