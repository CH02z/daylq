import { MongoClient } from 'mongodb';
import { DB_URI } from '$env/static/private';

let client;

export async function getDB() {
	if (!client) {
		client = new MongoClient(DB_URI);
		await client.connect();
		const db = client.db('daylq');
		await db.collection('users').createIndex({ email: 1 }, { unique: true });
		await db.collection('users').createIndex({ username: 1 }, { unique: true });
		await db.collection('habits').createIndex({ userId: 1 });
		await db.collection('checkins').createIndex({ userId: 1, date: 1 });
		await db
			.collection('checkins')
			.createIndex({ habitId: 1, userId: 1, date: 1 }, { unique: true });
		await db.collection('categories').createIndex({ userId: 1 });
	}
	return client.db('daylq');
}
