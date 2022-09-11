import { createTRPCProxyClient } from '@trpc/client';

import { type TrpcRouter } from '~/server/trpc';

export const trpcClient = createTRPCProxyClient<TrpcRouter>({
	url: process.server
		? `http://localhost:${process.env['NITRO_PORT'] || process.env['PORT'] || 3000}/api/trpc`
		: '/api/trpc',
	headers: () => useRequestHeaders(['cookie']),
	fetch: async (input, init) => {
		const response = await fetch(input, init);

		if (process.server) {
			const event = useRequestEvent();

			event.res.setHeader('set-cookie', response.headers.get('set-cookie') || '');
		}

		return response;
	},
});
