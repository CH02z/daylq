import { redirect } from '@sveltejs/kit';
import { getHabitsCollection } from '$lib/server/models/Habit.js';
import { getCheckinsCollection } from '$lib/server/models/Checkin.js';
import { getCategoriesCollection } from '$lib/server/models/Category.js';

export async function load({ locals }) {
	if (!locals.user) redirect(302, '/auth/login');

	const habits = await getHabitsCollection();
	const checkins = await getCheckinsCollection();
	const cats = await getCategoriesCollection();

	const userHabits = await habits
		.find({ userId: locals.user.userId, active: true })
		.sort({ createdAt: -1 })
		.toArray();

	// Last 90 days of checkins for heatmaps + streaks
	const since = new Date();
	since.setDate(since.getDate() - 90);
	const sinceStr = since.toISOString().split('T')[0];

	const today = new Date().toISOString().split('T')[0];

	const [recentCheckins, todayCheckins, totalAgg, userCategories] = await Promise.all([
		checkins.find({ userId: locals.user.userId, date: { $gte: sinceStr } }).toArray(),
		checkins.find({ userId: locals.user.userId, date: today }).toArray(),
		checkins
			.aggregate([
				{ $match: { userId: locals.user.userId } },
				{ $group: { _id: null, total: { $sum: { $ifNull: ['$count', 1] } } } }
			])
			.toArray(),
		cats.find({ userId: locals.user.userId }).sort({ createdAt: 1 }).toArray()
	]);
	const totalCheckinCount = totalAgg[0]?.total ?? 0;

	return {
		user: locals.user,
		habits: JSON.parse(JSON.stringify(userHabits)),
		checkins: JSON.parse(JSON.stringify(recentCheckins)),
		todayCheckins: JSON.parse(JSON.stringify(todayCheckins)),
		totalCheckinCount,
		userCategories: JSON.parse(JSON.stringify(userCategories)),
		today
	};
}
