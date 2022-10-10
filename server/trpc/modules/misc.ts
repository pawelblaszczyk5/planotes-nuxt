import { z } from 'zod';

import { trpc } from '~~/server/trpc';
import { env } from '~~/server/utils/env';

export const miscRouter = trpc.router({
	getPreferedColorMode: trpc.procedure.query(({ ctx: { event } }) => {
		const cookieValue = getCookie(event, COLOR_MODE_COOKIE_NAME);

		try {
			const colorScheme = colorModeSchema.default('SYSTEM').parse(cookieValue);

			return colorScheme;
		} catch {
			setCookie(event, COLOR_MODE_COOKIE_NAME, '', { ...COLOR_MODE_COOKIE_OPTIONS, maxAge: 0 });

			return 'SYSTEM';
		}
	}),
});

const COLOR_MODE_COOKIE_NAME = 'COL_TH';
const COOKIE_DOMAIN = env.COOKIE_DOMAIN;

const COLOR_MODE_COOKIE_OPTIONS: Parameters<typeof setCookie>[3] = {
	httpOnly: true,
	sameSite: 'strict',
	path: '/',
	secure: true,
	domain: COOKIE_DOMAIN,
} as const;

const colorModeSchema = z.enum(['DARK', 'LIGHT', 'SYSTEM']);
