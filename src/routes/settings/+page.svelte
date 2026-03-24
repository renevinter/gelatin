<script lang="ts">
	import { goto } from '$app/navigation';
	import { auth } from '$lib/stores/auth.svelte';
	import { theme } from '$lib/stores/theme.svelte';
	import { logout } from '$lib/api/auth';
	import { player } from '$lib/stores/player.svelte';

	const themeOptions: { value: 'light' | 'dark' | 'system'; label: string }[] = [
		{ value: 'system', label: 'System' },
		{ value: 'light', label: 'Light' },
		{ value: 'dark', label: 'Dark' }
	];

	function handleLogout() {
		player.clearQueue();
		logout();
		goto('/login');
	}

	function handleClearCache() {
		if ('caches' in window) {
			caches.keys().then((names) => {
				names.forEach((name) => caches.delete(name));
			});
		}
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.getRegistrations().then((registrations) => {
				registrations.forEach((r) => r.unregister());
			});
		}
		alert('Cache cleared. Reload to take effect.');
	}
</script>

<svelte:head>
	<title>Settings - Gelatin</title>
</svelte:head>

<div class="mx-auto max-w-xl p-4 pb-24 sm:p-6">
	<h1 class="mb-6 text-2xl font-bold text-text">Settings</h1>

	<!-- Server Info -->
	{#if auth.current}
		<section class="mb-8 rounded-xl border border-border bg-surface p-4">
			<h2 class="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">Server</h2>
			<div class="space-y-2 text-sm">
				<div class="flex justify-between">
					<span class="text-text-muted">URL</span>
					<span class="text-text">{auth.current.serverUrl}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-text-muted">User</span>
					<span class="text-text">{auth.current.username}</span>
				</div>
			</div>
		</section>
	{/if}

	<!-- Appearance -->
	<section class="mb-8 rounded-xl border border-border bg-surface p-4">
		<h2 class="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">Appearance</h2>
		<div class="flex items-center justify-between">
			<span class="text-sm text-text">Theme</span>
			<div class="flex gap-1 rounded-lg bg-bg p-1">
				{#each themeOptions as opt}
					<button
						onclick={() => theme.set(opt.value)}
						class="rounded-md px-3 py-1 text-sm transition-colors {theme.mode === opt.value ? 'bg-surface font-medium text-text shadow-sm' : 'text-text-muted hover:text-text'}"
					>
						{opt.label}
					</button>
				{/each}
			</div>
		</div>
	</section>

	<!-- Playback -->
	<section class="mb-8 rounded-xl border border-border bg-surface p-4">
		<h2 class="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">Playback</h2>
		<div class="flex items-center justify-between">
			<span class="text-sm text-text">Volume</span>
			<div class="flex items-center gap-2">
				<input
					type="range"
					min="0"
					max="1"
					step="0.05"
					value={player.volume}
					oninput={(e) => player.setVolume(Number((e.target as HTMLInputElement).value))}
					class="w-32 accent-accent"
				/>
				<span class="w-8 text-right text-xs text-text-muted">{Math.round(player.volume * 100)}%</span>
			</div>
		</div>
	</section>

	<!-- Cache -->
	<section class="mb-8 rounded-xl border border-border bg-surface p-4">
		<h2 class="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">Storage</h2>
		<button
			onclick={handleClearCache}
			class="text-sm text-danger hover:underline"
		>
			Clear all cached data
		</button>
	</section>

	<!-- About -->
	<section class="mb-8 rounded-xl border border-border bg-surface p-4">
		<h2 class="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">About</h2>
		<div class="space-y-2 text-sm">
			<div class="flex justify-between">
				<span class="text-text-muted">App</span>
				<span class="text-text">Gelatin v0.1.0</span>
			</div>
			<div class="flex justify-between">
				<span class="text-text-muted">Built with</span>
				<span class="text-text">SvelteKit + Jellyfin</span>
			</div>
		</div>
	</section>

	<!-- Logout -->
	<button
		onclick={handleLogout}
		class="w-full rounded-xl border border-danger/30 px-4 py-3 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
	>
		Sign Out
	</button>
</div>
