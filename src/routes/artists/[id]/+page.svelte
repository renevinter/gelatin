<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models';
	import { getArtistDetails, getArtistAlbums } from '$lib/api/library';
	import { getArtistImageUrl } from '$lib/api/images';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
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

<div class="pb-24">
	{#if loading}
		<div class="p-4 sm:p-6">
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
		</div>
	{:else if artist}
		{@const hasImage = !!artist.ImageTags?.Primary}

		<!-- Blurred hero background -->
		<div class="relative overflow-hidden">
			{#if hasImage}
				<div class="absolute inset-0 -z-10">
					<img
						src={getArtistImageUrl(artist.Id!, 800)}
						alt=""
						class="h-full w-full scale-110 object-cover"
					/>
					<div class="absolute inset-0 bg-bg/60 backdrop-blur-[80px]"></div>
					<div class="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bg"></div>
				</div>
			{/if}

			<!-- Artist Header -->
			<div class="flex flex-col items-center gap-6 p-6 pt-4 sm:flex-row sm:items-end sm:p-8">
				<div class="h-40 w-40 flex-shrink-0 overflow-hidden rounded-full bg-surface shadow-2xl sm:h-48 sm:w-48">
					{#if hasImage}
						<img
							src={getArtistImageUrl(artist.Id!, 400)}
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
				<div class="text-center sm:pb-2 sm:text-left">
					<h1 class="text-3xl font-bold text-text sm:text-4xl">{artist.Name}</h1>
					<p class="mt-1 text-sm text-text-muted">{albums.length} album{albums.length !== 1 ? 's' : ''}</p>
				</div>
			</div>
		</div>

		<!-- Albums -->
		{#if albums.length > 0}
			<div class="px-4 pt-2 sm:px-6">
				<h2 class="mb-4 text-lg font-semibold text-text">Albums</h2>
				<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
					{#each albums as album}
						<AlbumCard {album} onclick={() => goto(`${base}/albums/${album.Id}`)} />
					{/each}
				</div>
			</div>
		{/if}
	{/if}
</div>
