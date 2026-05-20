import { fail, redirect } from '@sveltejs/kit';
import { getHabitsCollection } from '$lib/server/models/Habit.js';
import { getCategoriesCollection } from '$lib/server/models/Category.js';

export async function load({ locals }) {
	if (!locals.user) redirect(302, '/auth/login');

	const cats = await getCategoriesCollection();
	const userCategories = await cats
		.find({ userId: locals.user.userId })
		.sort({ createdAt: 1 })
		.toArray();

	return { userCategories: JSON.parse(JSON.stringify(userCategories)) };
}

export const actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) redirect(302, '/auth/login');

		const data = await request.formData();
		const name = data.get('name')?.toString().trim();
		const category = data.get('category')?.toString();
		const icon = data.get('icon')?.toString();
		const color = data.get('color')?.toString();
		const reminderTime = data.get('reminderTime')?.toString().trim() || null;

		if (!name || !category || !icon || !color) {
			return fail(400, { error: 'Bitte alle Felder ausfüllen.' });
		}
		if (name.length > 50) {
			return fail(400, { error: 'Name darf maximal 50 Zeichen haben.' });
		}

		const habits = await getHabitsCollection();
		await habits.insertOne({
			userId: locals.user.userId,
			name,
			category,
			icon,
			color,
			reminderTime,
			active: true,
			createdAt: new Date()
		});

		redirect(302, '/dashboard');
	}
};
