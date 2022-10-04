import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';

import { type AppRouter } from '~~/server/trpc/modules';

type TrpcClientPluginInjections = {
	trpcClient: ReturnType<typeof createTRPCProxyClient<AppRouter>>;
};

export default defineNuxtPlugin<TrpcClientPluginInjections>(nuxtApp => {
	const headers = useRequestHeaders(['cookie']);

	const client = createTRPCProxyClient<AppRouter>({
		links: [
			httpBatchLink({
				url: '/api/trpc',
				headers: headers,
				fetch: async (input, init) => {
					const response = await $fetch.raw(input as string, init);

					return new Response(JSON.stringify(response._data), {
						status: response.status,
						statusText: response.statusText,
						headers: response.headers,
					});
				},
			}),
		],
	});

	nuxtApp.provide('trpcClient', client);
});
