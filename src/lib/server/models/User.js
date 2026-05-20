import { getDB } from '../db.js';

export async function getUsersCollection() {
	const db = await getDB();
	return db.collection('users');
}
