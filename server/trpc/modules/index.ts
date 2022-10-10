import { trpc } from '~~/server/trpc';
import { miscRouter } from '~~/server/trpc/modules/misc';
import { sessionRouter } from '~~/server/trpc/modules/session';

export const appRouter = trpc.router({
	session: sessionRouter,
	misc: miscRouter,
});

export type AppRouter = typeof appRouter;
