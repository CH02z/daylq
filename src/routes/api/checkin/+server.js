import { json } from '@sveltejs/kit';
import { getCheckinsCollection } from '$lib/server/models/Checkin.js';

export async function POST({ request, locals }) {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const { habitId, note } = await request.json();
	if (!habitId) return json({ error: 'habitId required' }, { status: 400 });

	const today = new Date().toISOString().split('T')[0];
	const checkins = await getCheckinsCollection();

	const existing = await checkins.findOne({
		habitId,
		userId: locals.user.userId,
		date: today
	});

	if (existing) {
		await checkins.deleteOne({ _id: existing._id });
		return json({ checked: false, date: today });
	} else {
		await checkins.insertOne({
			habitId,
			userId: locals.user.userId,
			date: today,
			note: note?.trim() || null,
			completedAt: new Date()
		});
		return json({ checked: true, date: today });
	}
}
