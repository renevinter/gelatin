<script lang="ts">
	import { goto } from '$app/navigation';
	import { login } from '$lib/api/auth';

	let serverUrl = $state('');
	let username = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';
		loading = true;
		try {
			await login(serverUrl, username, password);
			goto('/');
		} catch (err: any) {
			error = err?.response?.data?.message ?? err?.message ?? 'Failed to connect';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Gelatin - Login</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-bg px-4">
	<div class="w-full max-w-sm">
		<div class="mb-8 text-center">
			<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent">
				<svg class="h-8 w-8 text-accent-text" viewBox="0 0 24 24" fill="currentColor">
					<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 14H7v-2h10v2zm0-4H7v-2h10v2zm0-4H7V7h10v2z" />
				</svg>
			</div>
			<h1 class="text-2xl font-bold text-text">Gelatin</h1>
			<p class="mt-1 text-sm text-text-muted">Connect to your Jellyfin server</p>
		</div>

		<form onsubmit={handleSubmit} class="space-y-4">
			<div>
				<label for="server" class="mb-1 block text-sm font-medium text-text-muted">Server URL</label>
				<input
					id="server"
					type="url"
					bind:value={serverUrl}
					placeholder="https://jellyfin.example.com"
					required
					class="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-text placeholder:text-text-muted/50 focus:border-accent focus:outline-none"
				/>
			</div>

			<div>
				<label for="username" class="mb-1 block text-sm font-medium text-text-muted">Username</label>
				<input
					id="username"
					type="text"
					bind:value={username}
					placeholder="Username"
					required
					autocomplete="username"
					class="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-text placeholder:text-text-muted/50 focus:border-accent focus:outline-none"
				/>
			</div>

			<div>
				<label for="password" class="mb-1 block text-sm font-medium text-text-muted">Password</label>
				<input
					id="password"
					type="password"
					bind:value={password}
					placeholder="Password"
					autocomplete="current-password"
					class="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-text placeholder:text-text-muted/50 focus:border-accent focus:outline-none"
				/>
			</div>

			{#if error}
				<p class="text-sm text-danger">{error}</p>
			{/if}

			<button
				type="submit"
				disabled={loading}
				class="w-full rounded-lg bg-accent px-4 py-2.5 font-medium text-accent-text transition-colors hover:bg-accent-hover disabled:opacity-50"
			>
				{loading ? 'Connecting...' : 'Sign In'}
			</button>
		</form>
	</div>
</div>
