<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models';
	import { getPlaylistItems } from '$lib/api/playlists';
	import { getAlbumDetails } from '$lib/api/library';
	import { getAlbumImageUrl } from '$lib/api/images';
	import { player, itemToTrack } from '$lib/stores/player.svelte';
	import TrackList from '$lib/components/TrackList.svelte';
	import Skeleton from '$lib/components/Skeleton.svelte';

	let playlist = $state<BaseItemDto | null>(null);
	let tracks = $state<BaseItemDto[]>([]);
	let loading = $state(true);

	const playlistId = $derived($page.params.id);

	onMount(async () => {
		try {
			const [pl, items] = await Promise.all([
				getAlbumDetails(playlistId),
				getPlaylistItems(playlistId)
			]);
			playlist = pl;
			tracks = items;
		} catch (err) {
			console.error('Failed to load playlist:', err);
		} finally {
			loading = false;
		}
	});

	function playAll(allTracks: BaseItemDto[], index: number) {
		const mapped = tracks.map(itemToTrack);
		player.playTracks(mapped, index);
	}
</script>

<svelte:head>
	<title>{playlist?.Name ?? 'Playlist'} - Gelatin</title>
</svelte:head>

<div class="pb-24">
	{#if loading}
		<div class="p-4 sm:p-6">
			<div class="mb-8 flex items-center gap-6">
				<Skeleton class="h-40 w-40 rounded-lg" />
				<div class="space-y-2">
					<Skeleton class="h-8 w-48" />
					<Skeleton class="h-4 w-24" />
				</div>
			</div>
		</div>
	{:else if playlist}
		{@const hasImage = !!playlist.ImageTags?.Primary}

		<!-- Blurred hero background -->
		<div class="relative overflow-hidden">
			{#if hasImage}
				<div class="absolute inset-0 -z-10">
					<img
						src={getAlbumImageUrl(playlist.Id!, 800)}
						alt=""
						class="h-full w-full scale-110 object-cover"
					/>
					<div class="absolute inset-0 bg-bg/60 backdrop-blur-[80px]"></div>
					<div class="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bg"></div>
				</div>
			{/if}

			<div class="flex flex-col items-center gap-6 p-6 pt-4 sm:flex-row sm:items-end sm:p-8">
				<div class="h-48 w-48 flex-shrink-0 overflow-hidden rounded-xl bg-surface shadow-2xl sm:h-56 sm:w-56">
					{#if hasImage}
						<img
							src={getAlbumImageUrl(playlist.Id!, 400)}
							alt={playlist.Name ?? ''}
							class="h-full w-full object-cover"
						/>
					{:else}
						<div class="flex h-full w-full items-center justify-center text-text-muted">
							<svg class="h-16 w-16" fill="currentColor" viewBox="0 0 24 24">
								<path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
							</svg>
						</div>
					{/if}
				</div>
				<div class="text-center sm:pb-2 sm:text-left">
					<h1 class="text-2xl font-bold text-text sm:text-3xl">{playlist.Name}</h1>
					<p class="mt-1 text-sm text-text-muted">{tracks.length} track{tracks.length !== 1 ? 's' : ''}</p>
					{#if tracks.length > 0}
						<button
							onclick={() => playAll(tracks, 0)}
							class="mt-4 flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-text shadow-lg shadow-accent/25 transition-all hover:bg-accent-hover hover:shadow-accent/40"
						>
							<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
								<path d="M8 5v14l11-7z" />
							</svg>
							Play
						</button>
					{/if}
				</div>
			</div>
		</div>

		<div class="px-4 pt-2 sm:px-6">
			<TrackList {tracks} onplay={playAll} />
		</div>
	{/if}
</div>
