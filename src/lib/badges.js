export const STREAK_BADGES = [
	{ id: 's3',   days: 3,   label: '3 Tage',   icon: 'bi-fire',        color: '#fb923c' },
	{ id: 's7',   days: 7,   label: '7 Tage',   icon: 'bi-fire',        color: '#f59e0b' },
	{ id: 's14',  days: 14,  label: '2 Wochen', icon: 'bi-award-fill',  color: '#10b981' },
	{ id: 's21',  days: 21,  label: '21 Tage',  icon: 'bi-award-fill',  color: '#06b6d4' },
	{ id: 's30',  days: 30,  label: '1 Monat',  icon: 'bi-trophy-fill', color: '#8b5cf6' },
	{ id: 's100', days: 100, label: '100 Tage', icon: 'bi-gem',         color: '#f59e0b' },
	{ id: 's365', days: 365, label: '1 Jahr',   icon: 'bi-gem',         color: '#ef4444' },
];

export const TOTAL_BADGES = [
	{ id: 'c10',  count: 10,  label: '10×',   icon: 'bi-check-circle-fill', color: '#10b981' },
	{ id: 'c50',  count: 50,  label: '50×',   icon: 'bi-star-fill',         color: '#06b6d4' },
	{ id: 'c100', count: 100, label: '100×',  icon: 'bi-star-fill',         color: '#8b5cf6' },
	{ id: 'c365', count: 365, label: '365×',  icon: 'bi-trophy-fill',       color: '#f59e0b' },
];

export function getEarnedBadges(currentStreak, totalCompletions) {
	const streakEarned = STREAK_BADGES.filter((b) => currentStreak >= b.days);
	const totalEarned = TOTAL_BADGES.filter((b) => totalCompletions >= b.count);
	return [...streakEarned, ...totalEarned];
}

export function getNextBadge(currentStreak, totalCompletions) {
	const nextStreak = STREAK_BADGES.find((b) => b.days > currentStreak);
	const nextTotal = TOTAL_BADGES.find((b) => b.count > totalCompletions);
	return { nextStreak, nextTotal };
}
