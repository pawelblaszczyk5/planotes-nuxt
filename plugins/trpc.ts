import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import { appendHeader } from 'h3';

import { type AppRouter } from '~~/server/trpc/modules';

type TrpcClientPluginInjections = {
	trpcClient: ReturnType<typeof createTRPCProxyClient<AppRouter>>;
};

export default defineNuxtPlugin<TrpcClientPluginInjections>(nuxtApp => {
	const headers = useRequestHeaders(['cookie']);
	const event = useRequestEvent();

	const client = createTRPCProxyClient<AppRouter>({
		links: [
			httpBatchLink({
				url: process.server
					? `http://localhost:${
							(process.env['NITRO_PORT'] || process.env['PORT']) ?? 3000
					  }/api/trpc`
					: '/api/trpc',
				headers: headers,
				fetch: async (input, init) => {
					const response = await fetch(input, init);

					if (process.server) {
						const cookies = (response.headers.get('set-cookie') ?? '').split(', ');

						cookies.forEach(cookie => appendHeader(event, 'set-cookie', cookie));
					}

					return response;
				},
			}),
		],
	});

	nuxtApp.provide('trpcClient', client);
});
