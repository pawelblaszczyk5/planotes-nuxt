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

const COOKIE_OPTIONS = {
	httpOnly: true,
	sameSite: 'lax',
	path: '/',
	secure: true,
} as const;

const sessionSchema = z.object({
	userId: z.string().cuid(),
	validUntil: z.number(),
});

type CreateSessionOptions = {
	userId: string;
	duration: 'session' | 'persistent';
	event: H3Event;
};

const SESSION_SECRET = env.SESSION_SECRET;
const SESSION_COOKIE_NAME = 'sesid';
const SESSION_ERROR = 'There was a problem with creating/retriving session';

const SESSION_DURATION_IN_DAYS: Record<CreateSessionOptions['duration'], number> = {
	persistent: 30,
	session: 1,
};

const getSessionObject = ({
	userId,
	duration,
}: Pick<CreateSessionOptions, 'userId' | 'duration'>) => {
	const validUntil = getDateWithOffset({
		days: SESSION_DURATION_IN_DAYS[duration],
	}).epochSeconds;

	return {
		userId,
		validUntil,
	};
};

export const createSession = ({ event, userId, duration }: CreateSessionOptions) => {
	const session = getSessionObject({ userId, duration });

	try {
		const cookieValue = signCookie(parseJsonToString(session), SESSION_SECRET);

		setCookie(event, SESSION_COOKIE_NAME, cookieValue, {
			...COOKIE_OPTIONS,
			maxAge: duration === 'session' ? undefined : session.validUntil - getCurrentEpochSeconds(),
		});
	} catch {
		throw new Error(SESSION_ERROR);
	}
};

export const getSession = (event: H3Event) => {
	const cookieValue = getCookie(event, SESSION_COOKIE_NAME);

	if (!cookieValue) {
		throw new Error(SESSION_ERROR);
	}

	const unparsedSession = readSignedCookie(cookieValue, SESSION_SECRET);

	try {
		const session = parseStringToJson(unparsedSession, sessionSchema);

		if (!isDateBeforeNow(parseEpochSecondsToDate(session.validUntil))) {
			removeSession(event);

			throw new Error(SESSION_ERROR);
		}

		return session;
	} catch {
		throw new Error(SESSION_ERROR);
	}
};

export const removeSession = (event: H3Event) =>
	setCookie(event, SESSION_COOKIE_NAME, '', {
		...COOKIE_OPTIONS,
		maxAge: 0,
	});

const MAGIC_IDENTIFIER_SECRET = env.MAGIC_IDENTIFIER_SECRET;
const MAGIC_IDENTIFIER_COOKIE_NAME = 'magid';
const MAGIC_IDENTIFIER_MAX_AGE_IN_SECONDS = 1800; // 30 minutes

export const createMagicIdentifier = (event: H3Event, id: string) => {
	const cookieValue = signCookie(id, MAGIC_IDENTIFIER_SECRET);

	setCookie(event, MAGIC_IDENTIFIER_COOKIE_NAME, cookieValue, {
		...COOKIE_OPTIONS,
		maxAge: MAGIC_IDENTIFIER_MAX_AGE_IN_SECONDS,
	});
};
