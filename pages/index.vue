<script setup lang="ts">
	const { data } = await useAsyncData('greeting', () => useTrpcClient().greeting.query('world'));
</script>

<template>
	<h1>{{ data }}</h1>
</template>
