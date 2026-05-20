import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '$env/static/private';

export async function handle({ event, resolve }) {
	const token = event.cookies.get('auth_token');

	if (token) {
		try {
			const payload = jwt.verify(token, JWT_SECRET);
			event.locals.user = {
				userId: payload.userId,
				email: payload.email,
				username: payload.username
			};
		} catch {
			event.cookies.delete('auth_token', { path: '/' });
		}
	}

	return resolve(event);
}
