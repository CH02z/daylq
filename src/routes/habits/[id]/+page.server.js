import { fail, redirect } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';
import { getHabitsCollection } from '$lib/server/models/Habit.js';
import { getCheckinsCollection } from '$lib/server/models/Checkin.js';
import { getCategoriesCollection } from '$lib/server/models/Category.js';

export async function load({ params, locals }) {
	if (!locals.user) redirect(302, '/auth/login');

	const habits = await getHabitsCollection();
	const checkins = await getCheckinsCollection();
	const cats = await getCategoriesCollection();

	let habit;
	try {
		habit = await habits.findOne({ _id: new ObjectId(params.id), userId: locals.user.userId });
	} catch {
		redirect(302, '/dashboard');
	}
	if (!habit) redirect(302, '/dashboard');

	const allCheckins = await checkins
		.find({ habitId: params.id, userId: locals.user.userId })
		.sort({ date: -1 })
		.toArray();

	const today = new Date().toISOString().split('T')[0];

	const userCategories = await cats
		.find({ userId: locals.user.userId })
		.sort({ createdAt: 1 })
		.toArray();

	return {
		habit: JSON.parse(JSON.stringify(habit)),
		checkins: JSON.parse(JSON.stringify(allCheckins)),
		userCategories: JSON.parse(JSON.stringify(userCategories)),
		today
	};
}

export const actions = {
	edit: async ({ params, request, locals }) => {
		if (!locals.user) redirect(302, '/auth/login');

		const data = await request.formData();
		const name = data.get('name')?.toString().trim();
		const category = data.get('category')?.toString();
		const icon = data.get('icon')?.toString();
		const color = data.get('color')?.toString();
		const reminderTime = data.get('reminderTime')?.toString().trim() || null;
		const dailyGoalRaw = parseInt(data.get('dailyGoal')?.toString() ?? '1', 10);
		const dailyGoal = Number.isFinite(dailyGoalRaw)
			? Math.min(20, Math.max(1, dailyGoalRaw))
			: 1;

		if (!name || !category || !icon || !color) {
			return fail(400, { editError: 'Bitte alle Felder ausfüllen.' });
		}
		if (name.length > 50) {
			return fail(400, { editError: 'Name darf maximal 50 Zeichen haben.' });
		}

		const habits = await getHabitsCollection();
		await habits.updateOne(
			{ _id: new ObjectId(params.id), userId: locals.user.userId },
			{ $set: { name, category, icon, color, reminderTime, dailyGoal } }
		);

		redirect(302, `/habits/${params.id}`);
	},

	delete: async ({ params, locals }) => {
		if (!locals.user) redirect(302, '/auth/login');

		const habits = await getHabitsCollection();
		const checkins = await getCheckinsCollection();

		await habits.deleteOne({ _id: new ObjectId(params.id), userId: locals.user.userId });
		await checkins.deleteMany({ habitId: params.id, userId: locals.user.userId });

		redirect(302, '/dashboard');
	}
};
