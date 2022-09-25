import { type PrismaClient } from '@prisma/client';
import { initTRPC } from '@trpc/server';
import { type H3Event } from 'h3';

type TrpcContext = {
	event: H3Event;
	db: PrismaClient;
};

export const trpc = initTRPC.context<TrpcContext>().create();
