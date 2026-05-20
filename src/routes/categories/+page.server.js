import { fail, redirect } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';
import { getCategoriesCollection } from '$lib/server/models/Category.js';
import { getHabitsCollection } from '$lib/server/models/Habit.js';
import { getCheckinsCollection } from '$lib/server/models/Checkin.js';

export async function load({ locals }) {
	if (!locals.user) redirect(302, '/auth/login');

	const cats = await getCategoriesCollection();
	const habits = await getHabitsCollection();

	const userCats = await cats
		.find({ userId: locals.user.userId })
		.sort({ createdAt: 1 })
		.toArray();

	// Count active habits per custom category
	const counts = await Promise.all(
		userCats.map(async (c) => {
			const n = await habits.countDocuments({
				userId: locals.user.userId,
				category: c._id.toString(),
				active: true
			});
			return { id: c._id.toString(), count: n };
		})
	);

	const countMap = Object.fromEntries(counts.map((c) => [c.id, c.count]));

	return {
		userCategories: JSON.parse(JSON.stringify(userCats)),
		countMap
	};
}

export const actions = {
	create: async ({ request, locals }) => {
		if (!locals.user) redirect(302, '/auth/login');

		const data = await request.formData();
		const label = data.get('label')?.toString().trim();
		const color = data.get('color')?.toString();

		if (!label || !color) return fail(400, { createError: 'Name und Farbe erforderlich.' });
		if (label.length > 40) return fail(400, { createError: 'Name max. 40 Zeichen.' });

		const cats = await getCategoriesCollection();
		await cats.insertOne({
			userId: locals.user.userId,
			label,
			color,
			createdAt: new Date()
		});

		redirect(302, '/categories');
	},

	delete: async ({ request, locals }) => {
		if (!locals.user) redirect(302, '/auth/login');

		const data = await request.formData();
		const id = data.get('id')?.toString();
		if (!id) return fail(400, {});

		const cats = await getCategoriesCollection();
		const habits = await getHabitsCollection();
		const checkins = await getCheckinsCollection();

		// Verify ownership
		const cat = await cats.findOne({ _id: new ObjectId(id), userId: locals.user.userId });
		if (!cat) return fail(404, {});

		// Find habits in this category to delete their checkins
		const affectedHabits = await habits
			.find({ userId: locals.user.userId, category: id })
			.toArray();
		const habitIds = affectedHabits.map((h) => h._id.toString());

		if (habitIds.length > 0) {
			await checkins.deleteMany({ habitId: { $in: habitIds }, userId: locals.user.userId });
			await habits.deleteMany({ userId: locals.user.userId, category: id });
		}

		await cats.deleteOne({ _id: new ObjectId(id), userId: locals.user.userId });

		redirect(302, '/categories');
	}
};
