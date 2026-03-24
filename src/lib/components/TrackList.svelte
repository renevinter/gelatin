<script lang="ts">
	import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models';
	import { player, itemToTrack } from '$lib/stores/player.svelte';
	import { toggleFavorite } from '$lib/api/favorites';
	import { getImageUrl } from '$lib/api/images';

	interface Props {
		tracks: BaseItemDto[];
		showIndex?: boolean;
		showAlbumArt?: boolean;
		showAlbumName?: boolean;
		onplay?: (tracks: BaseItemDto[], index: number) => void;
	}

	let { tracks, showIndex = false, showAlbumArt = true, showAlbumName = true, onplay }: Props = $props();

	function formatTime(ticks: number | undefined): string {
		if (!ticks) return '';
		const s = ticks / 10_000_000;
		const m = Math.floor(s / 60);
		const sec = Math.floor(s % 60);
		return `${m}:${sec.toString().padStart(2, '0')}`;
	}

	function playTrack(index: number) {
		if (onplay) {
			onplay(tracks, index);
		} else {
			const mapped = tracks.map(itemToTrack);
			player.playTracks(mapped, index);
		}
	}

	async function handleFavorite(e: Event, track: BaseItemDto, index: number) {
		e.stopPropagation();
		if (!track.Id) return;
		const wasFav = track.UserData?.IsFavorite ?? false;
		await toggleFavorite(track.Id, wasFav);
		if (tracks[index]?.UserData) {
			tracks[index] = {
				...tracks[index],
				UserData: { ...tracks[index].UserData, IsFavorite: !wasFav }
			};
		}
	}

	function addToQueue(e: Event, track: BaseItemDto) {
		e.stopPropagation();
		player.addToQueue(itemToTrack(track));
	}
</script>

<div class="w-full">
	{#each tracks as track, i}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div
			role="button"
			tabindex="0"
			class="group flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-surface-hover"
			onclick={() => playTrack(i)}
		>
			{#if showIndex}
				<span class="w-6 flex-shrink-0 text-right text-sm text-text-muted">
					{track.IndexNumber ?? i + 1}
				</span>
			{/if}

			{#if showAlbumArt}
				<div class="h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-surface">
					<img
						src={getImageUrl(track.Id!, 'Primary', { width: 80 })}
						alt=""
						class="h-full w-full object-cover"
						loading="lazy"
					/>
				</div>
			{/if}

			<div class="min-w-0 flex-1">
				<p class="truncate text-sm text-text">{track.Name}</p>
				<p class="truncate text-xs text-text-muted">
					{track.Artists?.join(', ') ?? track.AlbumArtist ?? ''}
					{#if showAlbumName && track.Album}
						<span class="text-text-muted/50"> &middot; {track.Album}</span>
					{/if}
				</p>
			</div>

			<div class="flex flex-shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
				<button
					onclick={(e) => handleFavorite(e, track, i)}
					class="p-1.5 transition-colors {track.UserData?.IsFavorite ? 'text-accent' : 'text-text-muted hover:text-text'}"
					aria-label="Favorite"
				>
					<svg class="h-4 w-4" fill={track.UserData?.IsFavorite ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
						<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
					</svg>
				</button>
				<button
					onclick={(e) => addToQueue(e, track)}
					class="p-1.5 text-text-muted hover:text-text"
					aria-label="Add to queue"
				>
					<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
						<path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
					</svg>
				</button>
			</div>

			<span class="flex-shrink-0 text-xs text-text-muted">
				{formatTime(track.RunTimeTicks)}
			</span>
		</div>
	{/each}
</div>
