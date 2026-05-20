import { fail, redirect } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getUsersCollection } from '$lib/server/models/User.js';
import { JWT_SECRET } from '$env/static/private';

export const actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const email = data.get('email')?.toString().trim().toLowerCase();
		const password = data.get('password')?.toString();

		if (!email || !password) {
			return fail(400, { error: 'Bitte alle Felder ausfüllen.' });
		}

		const users = await getUsersCollection();
		const user = await users.findOne({ email });

		if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
			return fail(401, { error: 'E-Mail oder Passwort ist falsch.' });
		}

		const token = jwt.sign(
			{ userId: user._id.toString(), email: user.email, username: user.username },
			JWT_SECRET,
			{ expiresIn: '7d' }
		);

		cookies.set('auth_token', token, {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			secure: false,
			maxAge: 60 * 60 * 24 * 7
		});

		redirect(302, '/dashboard');
	}
};
