<script setup lang="ts">
	const { data } = $(await useAsyncData('greeting', () => useTrpcClient().greeting.query('world')));
</script>

<template>
	<h1 class="p-12 text-4xl">{{ data }}<i class="i-mdi-abugida-thai" /></h1>
</template>
