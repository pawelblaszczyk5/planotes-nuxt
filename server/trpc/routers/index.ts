import { trpc } from '~~/server/trpc';
import { userRouter } from '~~/server/trpc/routers/user';

export const appRouter = trpc.router({
	user: userRouter,
});

export type AppRouter = typeof appRouter;
