import { defineNuxtConfig } from 'nuxt';

export default defineNuxtConfig({
	typescript: {
		strict: true,
		shim: false,
	},
	nitro: { compressPublicAssets: true, preset: 'node-server' },
	experimental: {
		reactivityTransform: true,
	},
});
