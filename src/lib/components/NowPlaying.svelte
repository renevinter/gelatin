<script lang="ts">
	import { player } from '$lib/stores/player.svelte';
	import { getImageUrl } from '$lib/api/images';
	import { toggleFavorite } from '$lib/api/favorites';
	import Lyrics from './Lyrics.svelte';

	function formatTime(s: number): string {
		if (!s || !isFinite(s)) return '0:00';
		const m = Math.floor(s / 60);
		const sec = Math.floor(s % 60);
		return `${m}:${sec.toString().padStart(2, '0')}`;
	}

	function handleSeek(e: MouseEvent) {
		const bar = e.currentTarget as HTMLElement;
		const rect = bar.getBoundingClientRect();
		const ratio = (e.clientX - rect.left) / rect.width;
		player.seek(ratio * player.duration);
	}

	function close() {
		player.showNowPlaying = false;
		player.showLyrics = false;
	}

	async function handleFavorite() {
		const track = player.currentTrack;
		if (!track) return;
		const newVal = await toggleFavorite(track.id, track.isFavorite);
		const q = player.queue;
		const idx = player.queueIndex;
		if (q[idx]) {
			q[idx] = { ...q[idx], isFavorite: newVal };
		}
	}

	function repeatLabel(mode: string) {
		if (mode === 'one') return '1';
		return '';
	}
</script>

{#if player.showNowPlaying && player.currentTrack}
	{@const track = player.currentTrack}
	<div class="fixed inset-0 z-50 flex flex-col bg-bg">
		<!-- Header -->
		<div class="flex items-center justify-between px-4 py-3">
			<button onclick={close} class="p-2 text-text-muted hover:text-text" aria-label="Close">
				<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
					<path d="M19 9l-7 7-7-7" />
				</svg>
			</button>
			<span class="text-xs font-medium uppercase tracking-wider text-text-muted">Now Playing</span>
			<button
				onclick={() => (player.showLyrics = !player.showLyrics)}
				class="p-2 transition-colors {player.showLyrics ? 'text-accent' : 'text-text-muted hover:text-text'}"
				aria-label="Lyrics"
			>
				<svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
					<path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
				</svg>
			</button>
		</div>

		<!-- Content -->
		<div class="flex flex-1 flex-col items-center justify-center overflow-hidden px-8">
			{#if player.showLyrics}
				<Lyrics trackId={track.id} currentTime={player.currentTime} onseek={(t) => player.seek(t)} />
			{:else}
				<div class="w-full max-w-xs">
					<div class="aspect-square w-full overflow-hidden rounded-xl bg-surface shadow-lg">
					<img
						src={getImageUrl(track.imageItemId, 'Primary', { width: 600 })}
						alt={track.albumName}
						class="h-full w-full object-cover"
					/>
					</div>
				</div>
			{/if}
		</div>

		<!-- Track info + controls -->
		<div class="px-8 pb-8 pt-4">
			<div class="mb-4 flex items-center justify-between">
				<div class="min-w-0 flex-1">
					<h2 class="truncate text-lg font-bold text-text">{track.name}</h2>
					<p class="truncate text-sm text-text-muted">{track.artistName}</p>
				</div>
				<button
					onclick={handleFavorite}
					class="ml-3 p-2 transition-colors {track.isFavorite ? 'text-accent' : 'text-text-muted hover:text-text'}"
					aria-label="Favorite"
				>
					<svg class="h-6 w-6" fill={track.isFavorite ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
						<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
					</svg>
				</button>
			</div>

			<!-- Progress -->
			<div class="mb-4">
				<button
					class="group relative block h-1.5 w-full cursor-pointer rounded-full bg-border"
					onclick={handleSeek}
					aria-label="Seek"
				>
					<div
						class="absolute left-0 top-0 h-full rounded-full bg-accent"
						style="width: {player.duration ? (player.currentTime / player.duration) * 100 : 0}%"
					></div>
				</button>
				<div class="mt-1 flex justify-between text-xs text-text-muted">
					<span>{formatTime(player.currentTime)}</span>
					<span>{formatTime(player.duration)}</span>
				</div>
			</div>

			<!-- Controls -->
			<div class="flex items-center justify-center gap-6">
				<button
					onclick={() => player.toggleShuffle()}
					class="p-2 transition-colors {player.shuffle ? 'text-accent' : 'text-text-muted hover:text-text'}"
					aria-label="Shuffle"
				>
					<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
						<path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
					</svg>
				</button>

				<button
					onclick={() => player.previous()}
					class="p-2 text-text transition-colors hover:text-text-muted"
					aria-label="Previous"
				>
					<svg class="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
						<path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
					</svg>
				</button>

				<button
					onclick={() => player.toggle()}
					class="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-text transition-transform hover:scale-105"
					aria-label={player.isPlaying ? 'Pause' : 'Play'}
				>
					{#if player.isPlaying}
						<svg class="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
							<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
						</svg>
					{:else}
						<svg class="h-7 w-7 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
							<path d="M8 5v14l11-7z" />
						</svg>
					{/if}
				</button>

				<button
					onclick={() => player.next()}
					class="p-2 text-text transition-colors hover:text-text-muted"
					aria-label="Next"
				>
					<svg class="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
						<path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
					</svg>
				</button>

				<button
					onclick={() => player.cycleRepeat()}
					class="relative p-2 transition-colors {player.repeat !== 'off' ? 'text-accent' : 'text-text-muted hover:text-text'}"
					aria-label="Repeat"
				>
					<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
						<path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
					</svg>
					{#if player.repeat === 'one'}
						<span class="absolute -right-0.5 -top-0.5 text-[10px] font-bold text-accent">1</span>
					{/if}
				</button>
			</div>
		</div>
	</div>
{/if}
