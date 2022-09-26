import { randomBytes } from 'node:crypto';

import { z } from 'zod';

import { trpc } from '~~/server/trpc';
import { sendEmailWithMagicLink } from '~~/server/utils/mail';
import { getDateWithOffset } from '~~/server/utils/time';

const MAGIC_LINK_VALIDITY_IN_MINUTES = 30;

export const sessionRouter = trpc.router({
	sendMagicLink: trpc.procedure
		.input(z.string().email())
		.mutation(async ({ input, ctx: { db } }) => {
			const { email, id: userId } = await db.user.upsert({
				where: {
					email: input,
				},
				update: {},
				create: {
					email: input,
				},
			});
			const magicLinkToken = randomBytes(32).toString('base64url');

			await db.magicLink.create({
				data: {
					token: magicLinkToken,
					userId,
					validUntil: getDateWithOffset({ minutes: MAGIC_LINK_VALIDITY_IN_MINUTES }).epochSeconds,
				},
			});

			sendEmailWithMagicLink({ receiver: email, magicLinkToken });
		}),
});
