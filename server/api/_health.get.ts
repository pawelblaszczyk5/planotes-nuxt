import { getPrismaInstance } from '~~/server/utils/db';
import { transporter } from '~~/server/utils/mail';

const verifySMTP = async () => {
	try {
		await transporter.verify();
	} catch {
		throw '❌ SMTP connection not working';
	}
};

const verifyDB = async () => {
	try {
		const db = await getPrismaInstance();

		await db.user.count();
	} catch {
		throw '❌ Database connection not working';
	}
};

export default defineEventHandler(async () => {
	const results = await Promise.allSettled([verifyDB(), verifySMTP()]);
	const errors = results
		.map(result => result.status === 'rejected' && result.reason)
		.filter(error => error !== false);

	if (errors.length) {
		throw createError({ statusCode: 500, data: errors });
	}

	return {
		data: 'OK',
	};
});
