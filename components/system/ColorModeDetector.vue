<script lang="ts" setup>
	// @ts-expect-error URL import not recognized
	import colorModeScriptUrl from '~/assets/scripts/colorMode.js?url';

	const trpcClient = useTrpcClient();
	const { data: colorMode } = $(
		await useAsyncData(() => trpcClient.misc.getPreferedColorMode.query()),
	);
</script>

<template>
	<Head>
		<Script :data-theme="colorMode" :src="colorModeScriptUrl" />
	</Head>
</template>
