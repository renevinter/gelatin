<script lang="ts">
	import { onMount } from 'svelte';
	import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models';
	import { getPlaylists, createPlaylist } from '$lib/api/playlists';
	import { goto } from '$app/navigation';
	import AlbumCard from '$lib/components/AlbumCard.svelte';
	import Skeleton from '$lib/components/Skeleton.svelte';

	let playlists = $state<BaseItemDto[]>([]);
	let loading = $state(true);
	let showCreate = $state(false);
	let newName = $state('');
	let creating = $state(false);

	onMount(async () => {
		try {
			playlists = await getPlaylists();
		} catch (err) {
			console.error('Failed to load playlists:', err);
		} finally {
			loading = false;
		}
	});

	async function handleCreate(e: Event) {
		e.preventDefault();
		if (!newName.trim()) return;
		creating = true;
		try {
			await createPlaylist(newName.trim());
			playlists = await getPlaylists();
			newName = '';
			showCreate = false;
		} catch (err) {
			console.error('Failed to create playlist:', err);
		} finally {
			creating = false;
		}
	}
</script>

<svelte:head>
	<title>Playlists - Gelatin</title>
</svelte:head>

<div class="p-4 pb-24 sm:p-6">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-2xl font-bold text-text">Playlists</h1>
		<button
			onclick={() => (showCreate = !showCreate)}
			class="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-accent-text transition-colors hover:bg-accent-hover"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
				<path d="M12 5v14m-7-7h14" />
			</svg>
			New
		</button>
	</div>

	{#if showCreate}
		<form onsubmit={handleCreate} class="mb-6 flex items-center gap-3">
			<input
				type="text"
				bind:value={newName}
				placeholder="Playlist name"
				class="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted/50 focus:border-accent focus:outline-none"
			/>
			<button
				type="submit"
				disabled={creating || !newName.trim()}
				class="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-text transition-colors hover:bg-accent-hover disabled:opacity-50"
			>
				{creating ? 'Creating...' : 'Create'}
			</button>
		</form>
	{/if}

	{#if loading}
		<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
			{#each Array(6) as _}
				<div>
					<Skeleton class="aspect-square w-full rounded-lg" />
					<Skeleton class="mt-2 h-4 w-3/4" />
				</div>
			{/each}
		</div>
	{:else if playlists.length > 0}
		<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
			{#each playlists as playlist}
				<AlbumCard album={playlist} onclick={() => goto(`/playlists/${playlist.Id}`)} />
			{/each}
		</div>
	{:else}
		<div class="flex flex-col items-center justify-center py-20">
			<svg class="mb-4 h-16 w-16 text-text-muted/30" fill="currentColor" viewBox="0 0 24 24">
				<path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
			</svg>
			<p class="text-text-muted">No playlists yet</p>
		</div>
	{/if}
</div>
