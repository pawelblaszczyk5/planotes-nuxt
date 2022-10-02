import { TRPCError } from '@trpc/server';

import { trpc } from '~~/server/trpc';

export const signedInProcedure = trpc.procedure.use(
	trpc.middleware(({ next, ctx }) => {
		if (!ctx.session) throw new TRPCError({ code: 'UNAUTHORIZED' });

		return next({
			ctx: {
				...ctx,
				session: ctx.session,
			},
		});
	}),
);

export const signedOutProcedure = trpc.procedure.use(
	trpc.middleware(({ next, ctx }) => {
		if (ctx.session) throw new TRPCError({ code: 'BAD_REQUEST' });

		return next({
			ctx: {
				...ctx,
				session: ctx.session,
			},
		});
	}),
);
