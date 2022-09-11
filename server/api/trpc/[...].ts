import { trpcEventHandler } from '~~/server/trpc/eventHandler';

export default defineEventHandler(event => trpcEventHandler(event));
