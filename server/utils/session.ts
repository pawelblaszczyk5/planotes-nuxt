import { type H3Event } from 'h3';
import { z } from 'zod';

import { readSignedCookie, signCookie } from '~~/server/utils/cookies';
import { env } from '~~/server/utils/env';
import { parseJsonToString, parseStringToJson } from '~~/server/utils/parse';
import {
	getCurrentEpochSeconds,
	getDateWithOffset,
	isDateBeforeNow,
	parseEpochSecondsToDate,
} from '~~/server/utils/time';

const sessionSchema = z.object({
	userId: z.string().cuid(),
	validUntil: z.number(),
});

type Session = z.infer<typeof sessionSchema>;

type CreateSessionOptions = {
	userId: string;
	duration: 'session' | 'persistent';
	event: H3Event;
};

const SESSION_SECRET = env.SESSION_SECRET;
const SESSION_COOKIE_NAME = 'sesid';
const PERSISTENT_DURATION_IN_DAYS = 30;
const SESSION_DURATION_IN_DAYS = 1;
const SESSION_ERROR = 'There was a problem with creating/retriving session';

const STATIC_COOKIE_OPTIONS = {
	httpOnly: true,
	sameSite: 'lax',
	path: '/',
	secure: true,
} as const;

const getSessionObject = ({
	userId,
	duration,
}: Pick<CreateSessionOptions, 'userId' | 'duration'>): Session => {
	const validUntil = getDateWithOffset({
		days: duration === 'persistent' ? PERSISTENT_DURATION_IN_DAYS : SESSION_DURATION_IN_DAYS,
	}).epochSeconds;

	return {
		userId,
		validUntil,
	};
};

export const createSession = ({ event, userId, duration }: CreateSessionOptions) => {
	const session = getSessionObject({ userId, duration });

	try {
		const sessionCookieValue = signCookie(parseJsonToString(session), SESSION_SECRET);

		setCookie(event, SESSION_COOKIE_NAME, sessionCookieValue, {
			...STATIC_COOKIE_OPTIONS,
			maxAge: duration === 'session' ? undefined : session.validUntil - getCurrentEpochSeconds(),
		});
	} catch {
		throw new Error(SESSION_ERROR);
	}
};

export const getSession = (event: H3Event): Session => {
	const sessionCookieValue = getCookie(event, SESSION_COOKIE_NAME);

	if (!sessionCookieValue) {
		throw new Error(SESSION_ERROR);
	}

	const sessionValue = readSignedCookie(sessionCookieValue, SESSION_SECRET);

	try {
		const session = parseStringToJson(sessionValue, sessionSchema);

		if (!isDateBeforeNow(parseEpochSecondsToDate(session.validUntil))) {
			setCookie(event, SESSION_COOKIE_NAME, '', {
				...STATIC_COOKIE_OPTIONS,
				maxAge: 0,
			});

			throw new Error(SESSION_ERROR);
		}

		return session;
	} catch {
		throw new Error(SESSION_ERROR);
	}
};
