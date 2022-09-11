<script setup lang="ts">
	const { data } = $(useAsyncData(() => trpcClient.greeting.query('world')));
</script>

<template>
	<h1>{{ data }}</h1>
</template>
