import { type PrismaClient } from '@prisma/client';
import { initTRPC } from '@trpc/server';
import { type H3Event } from 'h3';

import { type Session } from '~~/server/trpc/modules/session';

type TrpcContext = {
	event: H3Event;
	db: PrismaClient;
	session: Session | null;
};

export const trpc = initTRPC.context<TrpcContext>().create();
