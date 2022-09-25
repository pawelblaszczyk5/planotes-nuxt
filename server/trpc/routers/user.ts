import { z } from 'zod';

import { trpc } from '~~/server/trpc';

export const userRouter = trpc.router({
	sendMagicLink: trpc.procedure
		.input(z.string().email())
		.mutation(async ({ input, ctx: { db } }) => {
			const user = await db.user.upsert({
				where: {
					email: input,
				},
				update: {},
				create: {
					email: input,
				},
			});

			console.log(user);
		}),
});
