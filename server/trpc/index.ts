import { initTRPC } from '@trpc/server';
import { type H3Event } from 'h3';
import { z } from 'zod';
import { db } from '~~/server/utils/db';

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- trpc forces us to use type definition
type TrpcContext = {
	event: H3Event;
};

const t = initTRPC.context<TrpcContext>().create();

export const trpcRouter = t.router({
	greeting: t.procedure.input(z.string()).query(({ input }) => `Hello ${input}!`),
	getUserCount: t.procedure.query(async () => {
		const userCount = await db.user.count();

		return userCount;
	}),
});

export type TrpcRouter = typeof trpcRouter;
