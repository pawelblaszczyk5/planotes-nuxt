import { defineNuxtConfig } from 'nuxt';

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
