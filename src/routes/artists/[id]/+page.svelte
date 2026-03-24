<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models';
	import { getArtistDetails, getArtistAlbums } from '$lib/api/library';
	import { getArtistImageUrl } from '$lib/api/images';
	import { goto } from '$app/navigation';
	import AlbumCard from '$lib/components/AlbumCard.svelte';
	import Skeleton from '$lib/components/Skeleton.svelte';

	let artist = $state<BaseItemDto | null>(null);
	let albums = $state<BaseItemDto[]>([]);
	let loading = $state(true);

	const artistId = $derived($page.params.id);

	onMount(async () => {
		try {
			const [a, albs] = await Promise.all([
				getArtistDetails(artistId),
				getArtistAlbums(artistId)
			]);
			artist = a;
			albums = albs;
		} catch (err) {
			console.error('Failed to load artist:', err);
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>{artist?.Name ?? 'Artist'} - Gelatin</title>
</svelte:head>

<div class="p-4 pb-24 sm:p-6">
	{#if loading}
		<div class="mb-8 flex items-center gap-6">
			<Skeleton class="h-32 w-32 rounded-full" />
			<Skeleton class="h-8 w-48" />
		</div>
		<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
			{#each Array(4) as _}
				<div>
					<Skeleton class="aspect-square w-full rounded-lg" />
					<Skeleton class="mt-2 h-4 w-3/4" />
				</div>
			{/each}
		</div>
	{:else if artist}
		<!-- Artist Header -->
		<div class="mb-8 flex items-center gap-6">
			<div class="h-32 w-32 flex-shrink-0 overflow-hidden rounded-full bg-surface">
				{#if artist.ImageTags?.Primary}
					<img
						src={getArtistImageUrl(artist.Id!, 256)}
						alt={artist.Name ?? ''}
						class="h-full w-full object-cover"
					/>
				{:else}
					<div class="flex h-full w-full items-center justify-center text-text-muted">
						<svg class="h-16 w-16" fill="currentColor" viewBox="0 0 24 24">
							<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
						</svg>
					</div>
				{/if}
			</div>
			<div>
				<h1 class="text-3xl font-bold text-text">{artist.Name}</h1>
				<p class="mt-1 text-sm text-text-muted">{albums.length} album{albums.length !== 1 ? 's' : ''}</p>
			</div>
		</div>

		<!-- Albums -->
		{#if albums.length > 0}
			<h2 class="mb-4 text-lg font-semibold text-text">Albums</h2>
			<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
				{#each albums as album}
					<AlbumCard {album} onclick={() => goto(`/albums/${album.Id}`)} />
				{/each}
			</div>
		{/if}
	{/if}
</div>
