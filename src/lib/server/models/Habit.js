import { getDB } from '../db.js';

export async function getHabitsCollection() {
	return (await getDB()).collection('habits');
}
