import { type PrismaClient } from '@prisma/client';
import { initTRPC } from '@trpc/server';
import { type H3Event } from 'h3';
import { z } from 'zod';

import { sendEmail } from '~~/server/utils/mail';

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- trpc forces us to use type definition
type TrpcContext = {
	event: H3Event;
	db: PrismaClient;
};

const t = initTRPC.context<TrpcContext>().create();

export const trpcRouter = t.router({
	greeting: t.procedure.input(z.string()).query(({ input }) => `Hello ${input}!`),
	getUserCount: t.procedure.query(async ({ ctx: { db } }) => {
		const user = await db.user.findFirst();

		if (user) {
			sendEmail({ html: 'test', receiver: user.email, senderName: 'test', subject: 'test' });
		}

		return user?.email;
	}),
});

export type TrpcRouter = typeof trpcRouter;
