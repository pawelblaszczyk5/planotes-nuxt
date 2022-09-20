import { PrismaClient } from '@prisma/client';

export const getPrismaInstance = (() => {
	let db: PrismaClient;

	return async () => {
		if (db) return db;
		db = new PrismaClient();

		await db.$connect();
		return db;
	};
})();
