<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { auth } from '$lib/stores/auth.svelte';
	import { theme } from '$lib/stores/theme.svelte';
	import { logout } from '$lib/api/auth';
	import { player } from '$lib/stores/player.svelte';
	import { settings, type StreamQuality, type LyricsSource } from '$lib/stores/settings.svelte';

	const themeOptions: { value: 'light' | 'dark' | 'system'; label: string }[] = [
		{ value: 'system', label: 'System' },
		{ value: 'light', label: 'Light' },
		{ value: 'dark', label: 'Dark' }
	];

	const qualityOptions: { value: StreamQuality; label: string }[] = [
		{ value: 'original', label: 'Original' },
		{ value: '320', label: '320 kbps' },
		{ value: '256', label: '256 kbps' },
		{ value: '128', label: '128 kbps' }
	];

	const lyricsOptions: { value: LyricsSource; label: string }[] = [
		{ value: 'jellyfin', label: 'Jellyfin Only' },
		{ value: 'jellyfin+lrclib', label: 'Jellyfin + LRCLIB' }
	];

	function handleLogout() {
		player.clearQueue();
		logout();
		goto(`${base}/login`);
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
	<h1 class="mb-6 hidden text-2xl font-bold text-text lg:block">Settings</h1>

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

	<!-- Streaming -->
	<section class="mb-8 rounded-xl border border-border bg-surface p-4">
		<h2 class="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">Streaming</h2>
		<div class="space-y-4">
			<div class="flex items-center justify-between">
				<span class="text-sm text-text">Wi-Fi Quality</span>
				<select
					class="rounded-lg border border-border bg-bg px-3 py-1.5 text-sm text-text"
					value={settings.streamQualityWifi}
					onchange={(e) => { settings.streamQualityWifi = (e.target as HTMLSelectElement).value as StreamQuality; }}
				>
					{#each qualityOptions as opt}
						<option value={opt.value} selected={settings.streamQualityWifi === opt.value}>{opt.label}</option>
					{/each}
				</select>
			</div>
			<div class="flex items-center justify-between">
				<span class="text-sm text-text">Cellular Quality</span>
				<select
					class="rounded-lg border border-border bg-bg px-3 py-1.5 text-sm text-text"
					value={settings.streamQualityCellular}
					onchange={(e) => { settings.streamQualityCellular = (e.target as HTMLSelectElement).value as StreamQuality; }}
				>
					{#each qualityOptions as opt}
						<option value={opt.value} selected={settings.streamQualityCellular === opt.value}>{opt.label}</option>
					{/each}
				</select>
			</div>
		</div>
	</section>

	<!-- Playback -->
	<section class="mb-8 rounded-xl border border-border bg-surface p-4">
		<h2 class="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">Playback</h2>
		<div class="space-y-4">
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
			<div class="flex items-center justify-between">
				<span class="text-sm text-text">Volume Normalization</span>
				<button
					onclick={() => { settings.volumeNormalization = !settings.volumeNormalization; }}
					class="relative h-6 w-11 rounded-full transition-colors {settings.volumeNormalization ? 'bg-accent' : 'bg-border'}"
					role="switch"
					aria-checked={settings.volumeNormalization}
				>
					<span
						class="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform {settings.volumeNormalization ? 'translate-x-5' : 'translate-x-0'}"
					></span>
				</button>
			</div>
		</div>
	</section>

	<!-- Lyrics -->
	<section class="mb-8 rounded-xl border border-border bg-surface p-4">
		<h2 class="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">Lyrics</h2>
		<div class="flex items-center justify-between">
			<span class="text-sm text-text">Lyrics Source</span>
			<select
				class="rounded-lg border border-border bg-bg px-3 py-1.5 text-sm text-text"
				value={settings.lyricsSource}
				onchange={(e) => { settings.lyricsSource = (e.target as HTMLSelectElement).value as LyricsSource; }}
			>
				{#each lyricsOptions as opt}
					<option value={opt.value} selected={settings.lyricsSource === opt.value}>{opt.label}</option>
				{/each}
			</select>
		</div>
		<p class="mt-2 text-xs text-text-muted">LRCLIB provides community-sourced synced lyrics as a fallback when Jellyfin has none.</p>
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
