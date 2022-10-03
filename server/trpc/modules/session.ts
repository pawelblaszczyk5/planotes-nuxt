import { randomBytes } from 'node:crypto';

import { SessionDuration } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { type H3Event } from 'h3';
import { z } from 'zod';

import { trpc } from '~~/server/trpc';
import { signedOutProcedure } from '~~/server/trpc/middlewares';
import { readSignedCookie, signCookie } from '~~/server/utils/cookies';
import { env } from '~~/server/utils/env';
import { sendEmailWithMagicLink } from '~~/server/utils/mail';
import { parseJsonToString, parseStringToJson } from '~~/server/utils/parse';
import {
	convertEpochSecondsToDate,
	getCurrentEpochSeconds,
	getDateWithOffset,
	isDateInPast,
} from '~~/server/utils/time';

export const sessionRouter = trpc.router({
	sendMagicLink: signedOutProcedure
		.input(
			z.object({
				email: z.string().email(),
				sessionDuration: z.enum([SessionDuration.EPHEMERAL, SessionDuration.PERSISTENT]),
			}),
		)
		.mutation(async ({ input: { email, sessionDuration }, ctx: { db, event } }) => {
			const { id: userId } = await db.user.upsert({
				where: {
					email,
				},
				update: {},
				create: {
					email,
				},
			});
			const previousMagicLink = await db.magicLink.findFirst({
				where: {
					validUntil: {
						gte: getDateWithOffset({
							minutes:
								MAGIC_LINK_VALIDITY_IN_MINUTES - MAGIC_LINK_REQUIRED_GENERATION_DELAY_IN_MINUTES,
						}).epochSeconds,
					},
					userId: {
						equals: userId,
					},
				},
			});

			if (previousMagicLink) {
				throw new TRPCError({ code: 'TOO_MANY_REQUESTS' });
			}

			const token = generateMagicLinkToken();
			const { id: magicLinkId } = await db.magicLink.create({
				data: {
					token: token,
					userId,
					validUntil: getDateWithOffset({ minutes: MAGIC_LINK_VALIDITY_IN_MINUTES }).epochSeconds,
					sessionDuration,
				},
			});
			const signedCookieValue = signCookie(magicLinkId, MAGIC_IDENTIFIER_SECRET);

			setCookie(event, MAGIC_IDENTIFIER_COOKIE_NAME, signedCookieValue, {
				...COOKIE_OPTIONS,
				maxAge: MAGIC_IDENTIFIER_MAX_AGE_IN_SECONDS,
			});

			await sendEmailWithMagicLink(token, email);
		}),
	verifyMagicLink: signedOutProcedure
		.input(z.string())
		.mutation(async ({ input, ctx: { db, event } }) => {
			const magicIdentifierCookieValue = getCookie(event, MAGIC_IDENTIFIER_COOKIE_NAME);

			if (!magicIdentifierCookieValue) {
				throw new TRPCError({ code: 'BAD_REQUEST' });
			}

			const magicIdentifier = readSignedCookie(magicIdentifierCookieValue, MAGIC_IDENTIFIER_SECRET);

			setCookie(event, MAGIC_IDENTIFIER_COOKIE_NAME, '', {
				...COOKIE_OPTIONS,
				maxAge: 0,
			});

			const { validUntil, token, userId, sessionDuration } = await db.magicLink.delete({
				where: { id: magicIdentifier },
			});

			if (isDateInPast(convertEpochSecondsToDate(validUntil)) || input !== token) {
				throw new TRPCError({ code: 'BAD_REQUEST' });
			}

			const session = {
				userId,
				validUntil: getDateWithOffset({
					days: SESSION_DURATION_IN_DAYS[sessionDuration],
				}).epochSeconds,
			};
			const sessionCookieValue = signCookie(parseJsonToString(session), SESSION_SECRET);

			setCookie(event, SESSION_COOKIE_NAME, sessionCookieValue, {
				...COOKIE_OPTIONS,
				maxAge: getSessionCookieMaxAge(sessionDuration, session.validUntil),
			});
		}),
	isLoggedIn: trpc.procedure.query(({ ctx: { session } }) => Boolean(session)),
});

export type Session = z.infer<typeof sessionSchema>;

export const getSession = (event: H3Event) => {
	const cookieValue = getCookie(event, SESSION_COOKIE_NAME);

	if (!cookieValue) return null;

	const session = parseSessionCookie(cookieValue);

	if (!session || isDateInPast(convertEpochSecondsToDate(session.validUntil))) {
		setCookie(event, SESSION_COOKIE_NAME, '', {
			...COOKIE_OPTIONS,
			maxAge: 0,
		});

		return null;
	}

	return session;
};

const generateMagicLinkToken = () => randomBytes(32).toString('base64url');

const getSessionCookieMaxAge = (sessionDuration: SessionDuration, validUntil: number) =>
	sessionDuration === SessionDuration.EPHEMERAL ? undefined : validUntil - getCurrentEpochSeconds();

const sessionSchema = z.object({
	userId: z.string().cuid(),
	validUntil: z.number(),
});

const parseSessionCookie = (cookieValue: string) => {
	try {
		return parseStringToJson(readSignedCookie(cookieValue, SESSION_SECRET), sessionSchema);
	} catch {
		return null;
	}
};

const COOKIE_DOMAIN = env.COOKIE_DOMAIN;

const MAGIC_LINK_VALIDITY_IN_MINUTES = 15;
const MAGIC_LINK_REQUIRED_GENERATION_DELAY_IN_MINUTES = 2;
const MAGIC_IDENTIFIER_SECRET = env.MAGIC_IDENTIFIER_SECRET;
const MAGIC_IDENTIFIER_COOKIE_NAME = 'magid';
const MAGIC_IDENTIFIER_MAX_AGE_IN_SECONDS = MAGIC_LINK_VALIDITY_IN_MINUTES * 60;

const SESSION_SECRET = env.SESSION_SECRET;
const SESSION_COOKIE_NAME = 'sesid';

const COOKIE_OPTIONS: Parameters<typeof setCookie>[3] = {
	httpOnly: true,
	sameSite: 'lax',
	path: '/',
	secure: true,
	domain: COOKIE_DOMAIN,
} as const;

const SESSION_DURATION_IN_DAYS: Record<SessionDuration, number> = {
	[SessionDuration.PERSISTENT]: 30,
	[SessionDuration.EPHEMERAL]: 1,
} as const;
