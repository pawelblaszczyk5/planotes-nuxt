import { defineNuxtConfig } from 'nuxt';

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
	typescript: {
		strict: true,
		shim: false,
	},
	nitro: { compressPublicAssets: true },
	experimental: {
		reactivityTransform: true,
	},
});
