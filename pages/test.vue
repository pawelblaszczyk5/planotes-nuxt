<script lang="ts" setup>
	const trpc = useTrpcClient();
	const { data } = $(await useAsyncData(() => trpc.getUserCount.query()));
</script>

<template>
	<h1>{{ data }}</h1>
</template>
