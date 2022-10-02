<script lang="ts" setup>
	const trpc = useTrpcClient();

	const handleSubmit = (event: Event) => {
		const form = event.currentTarget as HTMLFormElement;
		const formData = new FormData(form);
		const email = formData.get('email') as string;
		const sessionDuration = formData.get('sessionDuration') as 'EPHEMERAL' | 'PERSISTENT';

		trpc.session.sendMagicLink.mutate({ email, sessionDuration });
	};
</script>

<template>
	<form class="flex items-center gap-2 p-2" @submit.prevent="handleSubmit">
		<label for="emailField">Login with email</label>
		<input id="emailField" name="email" required class="b-2 b-slate-700" type="email" />
		<label for="sessionDurationEphemeral">Ephemeral session</label>
		<input id="sessionDurationEphemeral" type="radio" value="EPHEMERAL" name="sessionDuration" />
		<label for="sessionDurationPersistent">Persistent session</label>
		<input id="sessionDurationPersistent" type="radio" value="PERSISTENT" name="sessionDuration" />
		<button class="b-2 b-slate-700 py-1 px-4">Login</button>
	</form>
</template>
