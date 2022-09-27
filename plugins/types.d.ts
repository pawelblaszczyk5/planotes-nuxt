import { type createTRPCProxyClient } from '@trpc/client';

import { type AppRouter } from '~~/server/trpc/routers';

declare module '#app' {
	// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
	interface NuxtApp {
		$redirect: (...parameters: Parameters<typeof navigateTo>) => Promise<void>;
		$trpcClient: ReturnType<typeof createTRPCProxyClient<AppRouter>>;
	}
}
