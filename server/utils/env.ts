import { type TypeOf, z } from 'zod';

const isDevEnv = process.env['NODE_ENV'] !== 'production';

const withDevDefault = <ZodType extends z.ZodTypeAny>(
	schema: ZodType,
	defaultValue: TypeOf<ZodType>,
) => (isDevEnv ? schema.default(defaultValue) : schema);

const envSchema = z.object({
	NODE_ENV: withDevDefault(z.enum(['development', 'test', 'production']), 'development'),
	DATABASE_URL: withDevDefault(
		z.string().url(),
		'postgresql://postgres:postgres@localhost:5432/planotes',
	),
	DKIM_PRIVATE_KEY: withDevDefault(z.string(), 'dkim_key'),
	DKIM_SELECTOR: withDevDefault(z.string(), 'dkim_selector'),
	SMTP_HOST: withDevDefault(z.string(), 'localhost'),
	SMTP_USER: withDevDefault(z.string().email(), 'magic@planotes.xyz'),
	SMTP_PASSWORD: withDevDefault(z.string(), 'hard_password_123'),
	SESSION_SECRET: withDevDefault(z.string(), 'SESSION_SECRET_XXX'),
	MAGIC_IDENTIFIER_SECRET: withDevDefault(z.string(), 'MAGIC_IDENTIFIER_SECRET_XXX'),
	APP_URL: withDevDefault(z.string().url(), 'http://localhost:3000'),
	COOKIE_DOMAIN: withDevDefault(z.string(), 'localhost'),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
	throw '❌ Invalid or missing env variables';
}

export const env = result.data;
