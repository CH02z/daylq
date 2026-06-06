import { fail, redirect } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dev } from '$app/environment';
import { getUsersCollection } from '$lib/server/models/User.js';
import { JWT_SECRET } from '$env/static/private';

export function load({ locals }) {
	if (locals.user) redirect(302, '/dashboard');
	return {};
}

export const actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const username = data.get('username')?.toString().trim();
		const email = data.get('email')?.toString().trim().toLowerCase();
		const password = data.get('password')?.toString();
		const confirmPassword = data.get('confirmPassword')?.toString();

		if (!username || !email || !password || !confirmPassword) {
			return fail(400, { error: 'Bitte alle Felder ausfüllen.' });
		}
		if (username.length < 3) {
			return fail(400, { error: 'Benutzername muss mindestens 3 Zeichen haben.' });
		}
		if (!/^[a-zA-Z0-9_]+$/.test(username)) {
			return fail(400, { error: 'Benutzername darf nur Buchstaben, Zahlen und _ enthalten.' });
		}
		if (password.length < 8) {
			return fail(400, { error: 'Passwort muss mindestens 8 Zeichen haben.' });
		}
		if (password !== confirmPassword) {
			return fail(400, { error: 'Passwörter stimmen nicht überein.' });
		}

		const users = await getUsersCollection();

		const existing = await users.findOne({ $or: [{ email }, { username }] });
		if (existing) {
			if (existing.email === email) {
				return fail(409, { error: 'Diese E-Mail ist bereits registriert.' });
			}
			return fail(409, { error: 'Dieser Benutzername ist bereits vergeben.' });
		}

		const passwordHash = await bcrypt.hash(password, 10);
		const result = await users.insertOne({
			username,
			email,
			passwordHash,
			createdAt: new Date()
		});

		const token = jwt.sign(
			{ userId: result.insertedId.toString(), email, username },
			JWT_SECRET,
			{ expiresIn: '7d' }
		);

		cookies.set('auth_token', token, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: !dev,
			maxAge: 60 * 60 * 24 * 7
		});

		redirect(302, '/dashboard');
	}
};
