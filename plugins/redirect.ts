const REDIRECT_WORKAROUND_SYMBOL = Symbol('REDIRECT_WORKAROUND');

const redirect = async (...options: Parameters<typeof navigateTo>) => {
	await navigateTo(...options);

	return createError({ data: REDIRECT_WORKAROUND_SYMBOL });
};

export default defineNuxtPlugin(nuxtApp => {
	nuxtApp.vueApp.config.errorHandler = async error => {
		if (typeof error === 'object' && error != null && !Array.isArray(error) && 'data' in error) {
			const assertedError = error as Record<'data', unknown>;

			if (assertedError.data !== REDIRECT_WORKAROUND_SYMBOL) {
				throw error;
			}
		}
	};

	nuxtApp.provide('redirect', redirect);
});
