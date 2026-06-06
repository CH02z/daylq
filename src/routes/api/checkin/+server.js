import { json } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';
import { getCheckinsCollection } from '$lib/server/models/Checkin.js';
import { getHabitsCollection } from '$lib/server/models/Habit.js';

/**
 * POST /api/checkin
 * body: { habitId, action?: 'inc' | 'dec' | 'toggle' }
 *
 * - 'toggle' (default): if count == 0 → count = goal (mark fully done); else reset to 0
 * - 'inc': +1 (capped at goal)
 * - 'dec': -1 (floored at 0; removes doc if reaches 0)
 *
 * Backwards-compat: existing checkin docs without `count` are treated as count = goal (fully done).
 */
export async function POST({ request, locals }) {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const { habitId, action = 'toggle' } = await request.json();
	if (!habitId) return json({ error: 'habitId required' }, { status: 400 });

	const today = new Date().toISOString().split('T')[0];
	const checkins = await getCheckinsCollection();
	const habits = await getHabitsCollection();

	// Get the habit to know dailyGoal
	let habit;
	try {
		habit = await habits.findOne({ _id: new ObjectId(habitId), userId: locals.user.userId });
	} catch {
		return json({ error: 'Invalid habit' }, { status: 400 });
	}
	if (!habit) return json({ error: 'Habit not found' }, { status: 404 });

	const goal = Math.max(1, habit.dailyGoal || 1);

	const existing = await checkins.findOne({
		habitId,
		userId: locals.user.userId,
		date: today
	});

	const currentCount = existing ? (existing.count ?? goal) : 0;

	let nextCount;
	if (action === 'inc') {
		nextCount = Math.min(goal, currentCount + 1);
	} else if (action === 'dec') {
		nextCount = Math.max(0, currentCount - 1);
	} else {
		// toggle: if anything done, reset to 0; else mark fully done
		nextCount = currentCount > 0 ? 0 : goal;
	}

	if (nextCount === 0) {
		if (existing) await checkins.deleteOne({ _id: existing._id });
		return json({ count: 0, goal, done: false, date: today });
	}

	if (existing) {
		await checkins.updateOne(
			{ _id: existing._id },
			{ $set: { count: nextCount, completedAt: new Date() } }
		);
	} else {
		await checkins.insertOne({
			habitId,
			userId: locals.user.userId,
			date: today,
			count: nextCount,
			note: null,
			completedAt: new Date()
		});
	}

	return json({ count: nextCount, goal, done: nextCount >= goal, date: today });
}
