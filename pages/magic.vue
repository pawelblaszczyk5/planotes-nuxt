<script lang="ts" setup>
	const route = useRoute();
</script>

<template>
	{{ route.query['token'] }}
</template>
