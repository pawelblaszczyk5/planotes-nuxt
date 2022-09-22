import { type PrismaClient } from '@prisma/client';
import { initTRPC } from '@trpc/server';
import { type H3Event } from 'h3';
import { z } from 'zod';

type TrpcContext = {
	event: H3Event;
	db: PrismaClient;
};

const t = initTRPC.context<TrpcContext>().create();

export const trpcRouter = t.router({
	greeting: t.procedure.input(z.string()).query(({ input }) => `Hello ${input}!`),
});

export type TrpcRouter = typeof trpcRouter;
