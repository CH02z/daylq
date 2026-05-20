import { json } from '@sveltejs/kit';
import { getCheckinsCollection } from '$lib/server/models/Checkin.js';

export async function PATCH({ request, locals }) {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const { habitId, note } = await request.json();
	if (!habitId) return json({ error: 'habitId required' }, { status: 400 });

	const today = new Date().toISOString().split('T')[0];
	const checkins = await getCheckinsCollection();

	await checkins.updateOne(
		{ habitId, userId: locals.user.userId, date: today },
		{ $set: { note: note?.trim() || null } }
	);

	return json({ ok: true });
}
