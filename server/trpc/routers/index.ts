import { trpc } from '~~/server/trpc';
import { sessionRouter } from '~~/server/trpc/routers/session';

export const appRouter = trpc.router({
	session: sessionRouter,
});

export type AppRouter = typeof appRouter;
