/**
 * Seed realistic 3-month test data for user chris.zimmermann@hotmail.ch.
 * Run with: node scripts/seed-chris.js
 *
 * Wipes existing habits/checkins/custom-categories for the user before seeding.
 */
import { MongoClient, ObjectId } from 'mongodb';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env');
const envFile = readFileSync(envPath, 'utf8');
const env = Object.fromEntries(
	envFile
		.split('\n')
		.filter((l) => l.trim() && !l.startsWith('#'))
		.map((l) => {
			const i = l.indexOf('=');
			return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
		})
);

const TARGET_EMAIL = 'chris.zimmermann@hotmail.ch';

// Reproducible-but-realistic randomness
let seed = 42;
function rand() {
	seed = (seed * 1664525 + 1013904223) % 4294967296;
	return seed / 4294967296;
}
function chance(p) {
	return rand() < p;
}
function pick(arr) {
	return arr[Math.floor(rand() * arr.length)];
}

function addDays(dateStr, n) {
	const d = new Date(dateStr + 'T12:00:00Z');
	d.setUTCDate(d.getUTCDate() + n);
	return d.toISOString().split('T')[0];
}

// Build dates for last 90 days (today included)
function buildDates() {
	const today = new Date().toISOString().split('T')[0];
	const dates = [];
	for (let i = 89; i >= 0; i--) dates.push(addDays(today, -i));
	return dates;
}

// 7 maximally distinct hues across the color wheel for visual diversity:
// cyan → indigo → violet → rose → orange → lime → emerald
const HABITS = [
	{
		name: '2 Liter Wasser',
		category: 'health',
		icon: 'bi-droplet-fill',
		color: '#06b6d4', // cyan
		dailyGoal: 8,
		reminderTime: '08:00',
		consistency: 0.85,
		notes: ['extra im Gym', 'Wetter heiss, gut geklappt', 'mit Saft gemixt', 'fast verpasst', 'easy', null]
	},
	{
		name: 'Lesen (30 Min)',
		category: 'learning',
		icon: 'bi-book-fill',
		color: '#6366f1', // indigo
		dailyGoal: 1,
		reminderTime: '21:00',
		consistency: 0.72,
		notes: ['Atomic Habits', 'Deep Work, Kapitel 4', 'Sapiens', 'kurz im Tram', null, null, 'Newsletter statt Buch']
	},
	{
		name: 'Meditation',
		category: 'mindfulness',
		icon: 'bi-peace',
		color: '#10b981', // emerald
		dailyGoal: 1,
		reminderTime: '07:00',
		consistency: 0.65,
		notes: ['Calm App', 'Headspace 10 Min', 'eigene Atemübung', null, null, null]
	},
	{
		name: 'Workout',
		category: 'fitness',
		icon: 'bi-trophy-fill',
		color: '#f97316', // orange
		dailyGoal: 1,
		reminderTime: '18:00',
		consistency: 0.58,
		notes: ['Push-Day', 'Pull-Day', 'Leg-Day', '5 km Lauf', 'Yoga', 'Klettern', null, null]
	},
	{
		name: 'Code lernen',
		category: 'productivity',
		icon: 'bi-code-slash',
		color: '#8b5cf6', // violet
		dailyGoal: 1,
		reminderTime: null,
		consistency: 0.75,
		notes: ['SvelteKit Tutorial', 'MongoDB Aggregations', 'TypeScript Übung', 'Side-Projekt daylq', null, null]
	},
	{
		name: 'Tagebuch',
		category: 'mindfulness',
		icon: 'bi-journal-text',
		color: '#f43f5e', // rose
		dailyGoal: 1,
		reminderTime: '22:00',
		consistency: 0.6,
		notes: ['guter Tag', 'müde aber dankbar', 'viele Ideen', 'morgen früh los', null, null]
	},
	{
		name: 'Spaziergang',
		category: 'fitness',
		icon: 'bi-person-walking',
		color: '#84cc16', // lime
		dailyGoal: 2,
		reminderTime: '12:00',
		consistency: 0.7,
		notes: ['Mittagspause', 'Abendrunde am See', 'kurz zur Coop', null]
	}
];

// Streak-aware checkin generator: builds runs of done/skip days based on consistency
function generateCheckinsFor(habit, dates) {
	const checkins = [];
	let momentum = habit.consistency; // probability of completing today
	let lastDone = false;

	for (const date of dates) {
		// Momentum sway: streaks boost, breaks dip
		const p = lastDone
			? Math.min(0.95, momentum + 0.08)
			: Math.max(0.25, momentum - 0.05);

		if (chance(p)) {
			let count;
			if (habit.dailyGoal === 1) {
				count = 1;
			} else {
				// Multi-goal: distribute weighted toward full goal but with realistic partial days
				const fullChance = 0.6;
				if (chance(fullChance)) count = habit.dailyGoal;
				else count = Math.max(1, Math.floor(rand() * habit.dailyGoal) + 1);
			}
			const note = chance(0.18) ? pick(habit.notes) : null;
			checkins.push({
				habitId: habit._id.toString(),
				userId: habit.userId,
				date,
				count,
				note,
				completedAt: new Date(date + 'T20:00:00Z')
			});
			lastDone = true;
		} else {
			lastDone = false;
		}
	}
	return checkins;
}

async function main() {
	const client = new MongoClient(env.DB_URI);
	await client.connect();
	console.log('Connected to MongoDB');

	const db = client.db('daylq');
	const user = await db.collection('users').findOne({ email: TARGET_EMAIL });
	if (!user) {
		console.error('User not found:', TARGET_EMAIL);
		process.exit(1);
	}
	const userId = user._id.toString();
	console.log('User:', user.username, '(' + userId + ')');

	// Wipe
	const habitsCol = db.collection('habits');
	const checkinsCol = db.collection('checkins');
	const catsCol = db.collection('categories');

	const wipedHabits = await habitsCol.deleteMany({ userId });
	const wipedCheckins = await checkinsCol.deleteMany({ userId });
	const wipedCats = await catsCol.deleteMany({ userId });
	console.log(
		`Wiped: ${wipedHabits.deletedCount} habits, ${wipedCheckins.deletedCount} checkins, ${wipedCats.deletedCount} custom categories`
	);

	// Insert habits with createdAt 100 days ago
	const createdAt = new Date();
	createdAt.setDate(createdAt.getDate() - 100);

	const habitsToInsert = HABITS.map((h) => ({
		userId,
		name: h.name,
		category: h.category,
		icon: h.icon,
		color: h.color,
		reminderTime: h.reminderTime,
		dailyGoal: h.dailyGoal,
		active: true,
		createdAt
	}));

	const habitsResult = await habitsCol.insertMany(habitsToInsert);
	console.log(`Inserted ${habitsResult.insertedCount} habits`);

	// Generate checkins
	const dates = buildDates();
	console.log(`Generating checkins for ${dates.length} days`);

	const allCheckins = [];
	for (let i = 0; i < HABITS.length; i++) {
		const habit = {
			...HABITS[i],
			_id: Object.values(habitsResult.insertedIds)[i],
			userId
		};
		const checkins = generateCheckinsFor(habit, dates);
		allCheckins.push(...checkins);
		console.log(`  ${habit.name}: ${checkins.length} checkins (consistency target ${habit.consistency})`);
	}

	if (allCheckins.length > 0) {
		const res = await checkinsCol.insertMany(allCheckins);
		console.log(`Inserted ${res.insertedCount} checkins total`);
	}

	// Quick stats
	const totalCompletions = allCheckins.reduce((s, c) => s + (c.count || 1), 0);
	console.log(`Total completions sum: ${totalCompletions}`);

	await client.close();
	console.log('Done.');
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
