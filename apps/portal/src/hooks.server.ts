import type { Handle } from '@sveltejs/kit';
import * as cookie from 'cookie';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.revalidate = !!event.request.headers.get('cache-bust')

	try {
		const rawCookies = event.request.headers.get('cookie') || ''
		const cookies = cookie.parse(rawCookies);

		if (cookies['koa.sess']) {
			const body = Buffer.from(cookies['koa.sess'], 'base64').toString('utf8');
			const json = JSON.parse(body);

			event.locals.accessToken = json.accessToken
			event.locals.refreshToken = json.refreshToken
		}
	} catch (e) {
		console.log(e)
	}

	return await resolve(event);
}
