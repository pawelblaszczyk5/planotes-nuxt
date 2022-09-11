import { createTRPCProxyClient } from '@trpc/client';

import { type TrpcRouter } from '~/server/trpc';

export default defineNuxtPlugin(nuxtApp => {
	const headers = useRequestHeaders(['cookie']);
	const event = useRequestEvent();

	const client = createTRPCProxyClient<TrpcRouter>({
		url: process.server
			? `http://localhost:${process.env['NITRO_PORT'] || process.env['PORT'] || 3000}/api/trpc`
			: '/api/trpc',
		headers: headers,
		fetch: async (input, init) => {
			const response = await fetch(input, init);

			if (process.server) {
				event.res.setHeader('set-cookie', response.headers.get('set-cookie') || '');
			}

			return response;
		},
	});

	nuxtApp.provide('trpcClient', client);
});

declare module '#app' {
	interface NuxtApp {
		$trpcClient: ReturnType<typeof createTRPCProxyClient<TrpcRouter>>;
	}
}
