import { redirect } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';
import { getUsersCollection } from '$lib/server/models/User.js';
import { getHabitsCollection } from '$lib/server/models/Habit.js';
import { getCheckinsCollection } from '$lib/server/models/Checkin.js';

export async function load({ locals }) {
	if (!locals.user) redirect(302, '/auth/login');

	const users = await getUsersCollection();
	const habits = await getHabitsCollection();
	const checkins = await getCheckinsCollection();

	const user = await users.findOne({ _id: new ObjectId(locals.user.userId) });
	const habitCount = await habits.countDocuments({ userId: locals.user.userId, active: true });
	const checkinCount = await checkins.countDocuments({ userId: locals.user.userId });

	return {
		user: {
			...locals.user,
			createdAt: user?.createdAt?.toISOString() ?? null
		},
		habitCount,
		checkinCount
	};
}
