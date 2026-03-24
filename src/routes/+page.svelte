<script lang="ts">
	import { onMount } from 'svelte';
	import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models';
	import { getLatestAlbums, getSuggestions } from '$lib/api/library';
	import { getPlaylists } from '$lib/api/playlists';
	import { player, itemToTrack } from '$lib/stores/player.svelte';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { getImageUrl } from '$lib/api/images';
	import AlbumCard from '$lib/components/AlbumCard.svelte';
	import Skeleton from '$lib/components/Skeleton.svelte';

	let latestAlbums = $state<BaseItemDto[]>([]);
	let suggestions = $state<BaseItemDto[]>([]);
	let playlists = $state<BaseItemDto[]>([]);
	let loading = $state(true);

	onMount(async () => {
		try {
			const [albums, sugg, pls] = await Promise.all([
				getLatestAlbums(20),
				getSuggestions(20),
				getPlaylists()
			]);
			latestAlbums = albums;
			suggestions = sugg;
			playlists = pls;
		} catch (err) {
			console.error('Failed to load home data:', err);
		} finally {
			loading = false;
		}
	});

	function playSuggestion(index: number) {
		const mapped = suggestions.map(itemToTrack);
		player.playTracks(mapped, index);
	}
</script>

<svelte:head>
	<title>Gelatin</title>
</svelte:head>

<div class="space-y-8 p-4 pb-24 sm:p-6">
	<h1 class="hidden text-2xl font-bold text-text lg:block">Home</h1>

	<!-- Latest Albums -->
	<section>
		<h2 class="mb-4 text-lg font-semibold text-text">Recently Added</h2>
		{#if loading}
			<div class="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6">
				{#each Array(8) as _}
					<div class="w-36 flex-shrink-0 sm:w-40">
						<Skeleton class="aspect-square w-full rounded-lg" />
						<Skeleton class="mt-2 h-4 w-3/4" />
						<Skeleton class="mt-1 h-3 w-1/2" />
					</div>
				{/each}
			</div>
		{:else if latestAlbums.length > 0}
			<div class="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 scrollbar-hide">
				{#each latestAlbums as album}
					<div class="w-36 flex-shrink-0 sm:w-40">
						<AlbumCard {album} onclick={() => goto(`${base}/albums/${album.Id}`)} />
					</div>
				{/each}
			</div>
		{:else}
			<p class="text-sm text-text-muted">No albums found</p>
		{/if}
	</section>

	<!-- Suggestions -->
	{#if suggestions.length > 0}
		<section>
			<h2 class="mb-4 text-lg font-semibold text-text">Recommended</h2>
			<div class="space-y-1">
				{#each suggestions.slice(0, 10) as track, i}
					<button
						class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-surface-hover"
						onclick={() => playSuggestion(i)}
					>
						<div class="h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-surface">
							<img
								src={getImageUrl(track.Id!, 'Primary', { width: 80 })}
								alt=""
								class="h-full w-full object-cover"
								loading="lazy"
							/>
						</div>
						<div class="min-w-0 flex-1">
							<p class="truncate text-sm text-text">{track.Name}</p>
							<p class="truncate text-xs text-text-muted">
								{track.Artists?.join(', ') ?? track.AlbumArtist ?? ''}
								{#if track.Album}
									<span class="text-text-muted/50"> &middot; {track.Album}</span>
								{/if}
							</p>
						</div>
					</button>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Playlists -->
	{#if playlists.length > 0}
		<section>
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-lg font-semibold text-text">Your Playlists</h2>
				<a href="{base}/playlists" class="text-sm text-accent hover:underline">See all</a>
			</div>
			<div class="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 scrollbar-hide">
				{#each playlists as playlist}
					<div class="w-36 flex-shrink-0 sm:w-40">
						<AlbumCard album={playlist} onclick={() => goto(`${base}/playlists/${playlist.Id}`)} />
					</div>
				{/each}
			</div>
		</section>
	{/if}
</div>
