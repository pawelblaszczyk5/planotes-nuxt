export default defineNuxtConfig({
	modules: ['@unocss/nuxt'],
	typescript: {
		strict: true,
		shim: false,
	},
	nitro: { compressPublicAssets: true, preset: 'node-server' },
	experimental: {
		reactivityTransform: true,
	},
	runtimeConfig: {
		DATABASE_URL:
			'postgresql://postgres:postgres@localhost:5432/planotes' ?? process.env['DATABASE_URL'],
		DKIM_PRIVATE_KEY: 'dkim_key' ?? process.env['DATABASE_URL'],
		DKIM_SELECTOR: 'default' ?? process.env['DKIM_SELECTOR'],
		SMTP_HOST: 'localhost' ?? process.env['SMTP_HOST'],
		SMTP_USER: 'magic@planotes.xyz' ?? process.env['SMTP_USER'],
		SMTP_PASSWORD: 'pwd' ?? process.env['SMTP_PASSWORD'],
	},
	vite: { devBundler: 'legacy' },
	unocss: {
		preflight: true,
		wind: true,
		icons: {
			extraProperties: {
				display: 'inline-block',
				'vertical-align': 'middle',
			},
		},
	},
});
