import { resolveHTTPResponse } from '@trpc/server';
import { type H3Event } from 'h3';
import { createURL } from 'ufo';

import { appRouter } from '~~/server/trpc/routers';
import { getPrismaInstance } from '~~/server/utils/db';

const TRPC_ENDPOINT_LENGTH = '/api/trpc'.length + 1;

export const trpcEventHandler = async (event: H3Event): Promise<string | undefined> => {
	const { req, res } = event;

	if (!req.url || !req.method) {
		res.statusCode = 500;
		return;
	}

	const url = createURL(req.url);
	const requestBody = isMethod(event, 'GET') ? null : await useBody(event);

	const httpResponse = await resolveHTTPResponse({
		router: appRouter,
		req: {
			method: req.method,
			headers: req.headers,
			body: requestBody,
			query: url.searchParams,
		},
		path: url.pathname.slice(TRPC_ENDPOINT_LENGTH),
		createContext: async () => ({
			event,
			db: await getPrismaInstance(),
		}),
	});

	const { status, headers, body } = httpResponse;

	res.statusCode = status;

	if (headers) {
		Object.keys(headers).forEach(key => {
			const value = headers[key];

			if (typeof value !== 'undefined') res.setHeader(key, value);
		});
	}

	return body;
};
