<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models';
	import { getAlbumDetails, getAlbumTracks } from '$lib/api/library';
	import { getAlbumImageUrl } from '$lib/api/images';
	import { player, itemToTrack } from '$lib/stores/player.svelte';
	import { toggleFavorite } from '$lib/api/favorites';
	import TrackList from '$lib/components/TrackList.svelte';
	import Skeleton from '$lib/components/Skeleton.svelte';

	let album = $state<BaseItemDto | null>(null);
	let tracks = $state<BaseItemDto[]>([]);
	let loading = $state(true);

	const albumId = $derived($page.params.id);

	onMount(async () => {
		try {
			const [a, t] = await Promise.all([
				getAlbumDetails(albumId),
				getAlbumTracks(albumId)
			]);
			album = a;
			tracks = t;
		} catch (err) {
			console.error('Failed to load album:', err);
		} finally {
			loading = false;
		}
	});

	function playAll(startIndex = 0) {
		const mapped = tracks.map(itemToTrack);
		player.playTracks(mapped, startIndex);
	}

	function handlePlay(allTracks: BaseItemDto[], index: number) {
		playAll(index);
	}

	async function handleAlbumFavorite() {
		if (!album?.Id) return;
		const wasFav = album.UserData?.IsFavorite ?? false;
		await toggleFavorite(album.Id, wasFav);
		album = { ...album, UserData: { ...album.UserData, IsFavorite: !wasFav } };
	}

	function formatDuration(ticks: number | undefined): string {
		if (!ticks) return '';
		const totalMin = Math.round(ticks / 10_000_000 / 60);
		if (totalMin < 60) return `${totalMin} min`;
		const h = Math.floor(totalMin / 60);
		const m = totalMin % 60;
		return `${h} hr ${m} min`;
	}
</script>

<svelte:head>
	<title>{album?.Name ?? 'Album'} - Gelatin</title>
</svelte:head>

<div class="pb-24">
	{#if loading}
		<div class="p-4 sm:p-6">
			<div class="mb-8 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
				<Skeleton class="h-48 w-48 rounded-lg" />
				<div class="flex-1 space-y-2">
					<Skeleton class="h-8 w-64" />
					<Skeleton class="h-4 w-40" />
					<Skeleton class="h-4 w-32" />
				</div>
			</div>
		</div>
	{:else if album}
		{@const heroUrl = getAlbumImageUrl(album.Id!, 800)}

		<!-- Blurred hero background -->
		<div class="relative overflow-hidden">
			<div class="absolute inset-0 -z-10">
				<img
					src={heroUrl}
					alt=""
					class="h-full w-full scale-110 object-cover"
				/>
				<div class="absolute inset-0 bg-bg/60 backdrop-blur-[80px]"></div>
				<div class="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bg"></div>
			</div>

			<!-- Album Header -->
			<div class="flex flex-col items-center gap-6 p-6 pt-4 sm:flex-row sm:items-end sm:p-8">
				<div class="h-48 w-48 flex-shrink-0 overflow-hidden rounded-xl bg-surface shadow-2xl sm:h-56 sm:w-56">
					<img
						src={getAlbumImageUrl(album.Id!, 400)}
						alt={album.Name ?? ''}
						class="h-full w-full object-cover"
					/>
				</div>
				<div class="text-center sm:pb-2 sm:text-left">
					<h1 class="text-2xl font-bold text-text sm:text-3xl">{album.Name}</h1>
					<p class="mt-1 text-text-muted">
						{album.AlbumArtist ?? album.Artists?.join(', ') ?? ''}
					</p>
					<p class="mt-1 text-sm text-text-muted">
						{#if album.ProductionYear}{album.ProductionYear} &middot; {/if}
						{tracks.length} track{tracks.length !== 1 ? 's' : ''}
						{#if album.RunTimeTicks} &middot; {formatDuration(album.RunTimeTicks)}{/if}
					</p>
					<div class="mt-4 flex items-center justify-center gap-3 sm:justify-start">
						<button
							onclick={() => playAll()}
							class="flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-text shadow-lg shadow-accent/25 transition-all hover:bg-accent-hover hover:shadow-accent/40"
						>
							<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
								<path d="M8 5v14l11-7z" />
							</svg>
							Play
						</button>
						<button
							onclick={handleAlbumFavorite}
							class="rounded-full border border-border/50 bg-bg/30 p-2.5 backdrop-blur-sm transition-colors hover:bg-bg/50 {album.UserData?.IsFavorite ? 'text-accent' : 'text-text-muted'}"
							aria-label="Favorite"
						>
							<svg class="h-5 w-5" fill={album.UserData?.IsFavorite ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
								<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
							</svg>
						</button>
					</div>
				</div>
			</div>
		</div>

		<!-- Track List -->
		<div class="px-4 pt-2 sm:px-6">
			<TrackList {tracks} showIndex showAlbumArt={false} showAlbumName={false} onplay={handlePlay} />
		</div>
	{/if}
</div>
