import { fail, redirect } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';
import { getUsersCollection } from '$lib/server/models/User.js';
import { getHabitsCollection } from '$lib/server/models/Habit.js';
import { getCheckinsCollection } from '$lib/server/models/Checkin.js';
import { getCategoriesCollection } from '$lib/server/models/Category.js';

export async function load({ locals }) {
	if (!locals.user) redirect(302, '/auth/login');

	const users = await getUsersCollection();
	const habits = await getHabitsCollection();
	const checkins = await getCheckinsCollection();

	const [user, habitCount, totalAgg] = await Promise.all([
		users.findOne({ _id: new ObjectId(locals.user.userId) }),
		habits.countDocuments({ userId: locals.user.userId, active: true }),
		checkins
			.aggregate([
				{ $match: { userId: locals.user.userId } },
				{ $group: { _id: null, total: { $sum: { $ifNull: ['$count', 1] } } } }
			])
			.toArray()
	]);
	const checkinCount = totalAgg[0]?.total ?? 0;

	return {
		user: {
			...locals.user,
			createdAt: user?.createdAt?.toISOString() ?? null
		},
		habitCount,
		checkinCount
	};
}

export const actions = {
	wipe: async ({ request, locals }) => {
		if (!locals.user) redirect(302, '/auth/login');

		const data = await request.formData();
		const confirm = data.get('confirm')?.toString().trim();
		if (confirm !== 'LÖSCHEN') {
			return fail(400, { wipeError: 'Bestätigung "LÖSCHEN" fehlt oder ist falsch.' });
		}

		const habits = await getHabitsCollection();
		const checkins = await getCheckinsCollection();
		const cats = await getCategoriesCollection();

		const [h, c, ca] = await Promise.all([
			habits.deleteMany({ userId: locals.user.userId }),
			checkins.deleteMany({ userId: locals.user.userId }),
			cats.deleteMany({ userId: locals.user.userId })
		]);

		return {
			wipeSuccess: true,
			deletedHabits: h.deletedCount,
			deletedCheckins: c.deletedCount,
			deletedCategories: ca.deletedCount
		};
	}
};

