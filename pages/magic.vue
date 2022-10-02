<script lang="ts" setup>
	const token = useRoute().query['token'];
	const redirect = useRedirect();
	const trpcClient = useTrpcClient();

	if (typeof token !== 'string') {
		throw await redirect('/login', { replace: true });
	}

	onMounted(() => {
		const timeout = setTimeout(async () => {
			await trpcClient.session.verifyMagicLink.mutate(token);
		}, 1000);

		return () => clearTimeout(timeout);
	});
</script>

<template>
	{{ token }}
</template>
