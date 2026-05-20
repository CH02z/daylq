import { getDB } from '../db.js';

export async function getCheckinsCollection() {
	return (await getDB()).collection('checkins');
}
