import { getDB } from '../db.js';

export async function getCategoriesCollection() {
	return (await getDB()).collection('categories');
}
