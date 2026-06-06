import { json } from '@sveltejs/kit';
import { getCheckinsCollection } from '$lib/server/models/Checkin.js';

export async function PATCH({ request, locals }) {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const { habitId, note } = await request.json();
	if (!habitId) return json({ error: 'habitId required' }, { status: 400 });

	const today = new Date().toISOString().split('T')[0];
	const checkins = await getCheckinsCollection();

	// Limit note length (mirrors UI: textarea has no maxlength but server enforces sanity)
	const cleaned = note?.toString().trim().slice(0, 500) || null;

	const result = await checkins.updateOne(
		{ habitId, userId: locals.user.userId, date: today },
		{ $set: { note: cleaned } }
	);

	if (result.matchedCount === 0) {
		return json({ ok: false, reason: 'no_checkin' }, { status: 404 });
	}

	return json({ ok: true });
}
