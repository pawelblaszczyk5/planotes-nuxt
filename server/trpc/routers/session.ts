import { randomBytes } from 'node:crypto';

import { SessionDuration } from '@prisma/client';
import { z } from 'zod';

import { trpc } from '~~/server/trpc';
import { sendEmailWithMagicLink } from '~~/server/utils/mail';
import { createMagicIdentifier, createSession, getMagicIdentifier } from '~~/server/utils/session';
import {
	convertEpochSecondsToDate,
	getDateWithOffset,
	isDateBeforeNow,
} from '~~/server/utils/time';

const MAGIC_LINK_VALIDITY_IN_MINUTES = 30;

export const sessionRouter = trpc.router({
	sendMagicLink: trpc.procedure
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
			const magicLinkToken = randomBytes(32).toString('base64url');

			const { id } = await db.magicLink.create({
				data: {
					token: magicLinkToken,
					userId,
					validUntil: getDateWithOffset({ minutes: MAGIC_LINK_VALIDITY_IN_MINUTES }).epochSeconds,
					sessionDuration,
				},
			});

			createMagicIdentifier(event, id);
			await sendEmailWithMagicLink({ receiver: email, magicLinkToken });
		}),
	verifyMagicLink: trpc.procedure
		.input(z.string())
		.mutation(async ({ input, ctx: { db, event } }) => {
			const magicIdentifier = getMagicIdentifier(event);
			const { validUntil, token, userId, sessionDuration } = await db.magicLink.delete({
				where: { id: magicIdentifier },
			});

			const isMagicLinkValid =
				!isDateBeforeNow(convertEpochSecondsToDate(validUntil)) && input === token;

			if (!isMagicLinkValid) {
				return;
			}

			createSession({ event, userId, duration: sessionDuration });
		}),
});
