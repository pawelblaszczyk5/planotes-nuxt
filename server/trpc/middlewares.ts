import { TRPCError } from '@trpc/server';

import { trpc } from '~~/server/trpc';
import { SESSION_ERRORS } from '~~/shared/errors';

export const signedInProcedure = trpc.procedure.use(
	trpc.middleware(({ next, ctx }) => {
		if (!ctx.session)
			throw new TRPCError({ code: 'UNAUTHORIZED', message: SESSION_ERRORS.SIGNED_IN_ONLY });

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
		if (ctx.session)
			throw new TRPCError({ code: 'BAD_REQUEST', message: SESSION_ERRORS.SIGNED_OUT_ONLY });

		return next({
			ctx: {
				...ctx,
				session: ctx.session,
			},
		});
	}),
);
