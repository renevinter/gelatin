<script lang="ts">
	import { player } from '$lib/stores/player.svelte';
	import { getImageUrl } from '$lib/api/images';

	interface Props {
		mobile?: boolean;
	}

	let { mobile = false }: Props = $props();

	function formatTime(s: number): string {
		if (!s || !isFinite(s)) return '0:00';
		const m = Math.floor(s / 60);
		const sec = Math.floor(s % 60);
		return `${m}:${sec.toString().padStart(2, '0')}`;
	}

	function handleProgressClick(e: MouseEvent) {
		const bar = e.currentTarget as HTMLElement;
		const rect = bar.getBoundingClientRect();
		const ratio = (e.clientX - rect.left) / rect.width;
		player.seek(ratio * player.duration);
	}

	function openNowPlaying() {
		player.showNowPlaying = true;
	}
</script>

{#if player.currentTrack}
	{#if mobile}
		<!-- Mobile: floating mini bar above nav pills -->
		<button
			onclick={openNowPlaying}
			class="flex w-full items-center gap-3 rounded-full border border-text/[0.08] bg-bg/30 px-4 py-1.5 shadow-lg shadow-black/5 backdrop-blur-3xl dark:border-white/[0.08] dark:bg-bg/25"
		>
			<div class="h-10 w-10 flex-shrink-0 overflow-hidden rounded-xl bg-surface">
				<img
					src={getImageUrl(player.currentTrack.imageItemId, 'Primary', { width: 80 })}
					alt=""
					class="h-full w-full object-cover"
				/>
			</div>
			<div class="min-w-0 flex-1 text-left">
				<p class="truncate text-sm font-medium text-text">{player.currentTrack.name}</p>
				<p class="truncate text-xs text-text-muted">{player.currentTrack.artistName}</p>
			</div>
			<!-- Progress ring or simple play/pause -->
			<div
				onclick={(e) => { e.stopPropagation(); player.toggle(); }}
				class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
				role="button"
				tabindex="0"
				aria-label={player.isPlaying ? 'Pause' : 'Play'}
			>
				{#if player.isPlaying}
					<svg class="h-5 w-5 text-text" fill="currentColor" viewBox="0 0 24 24">
						<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
					</svg>
				{:else}
					<svg class="h-5 w-5 ml-0.5 text-text" fill="currentColor" viewBox="0 0 24 24">
						<path d="M8 5v14l11-7z" />
					</svg>
				{/if}
			</div>
		</button>
	{:else}
		<!-- Desktop: full player bar -->
		<div class="flex-shrink-0 border-t border-border/50 bg-bg/80 backdrop-blur-2xl">
			<button
				class="group relative block h-1 w-full cursor-pointer bg-border/50"
				onclick={handleProgressClick}
				aria-label="Seek"
			>
				<div
					class="absolute left-0 top-0 h-full bg-accent transition-all"
					style="width: {player.duration ? (player.currentTime / player.duration) * 100 : 0}%"
				></div>
			</button>

			<div class="flex items-center gap-3 px-3 py-2 sm:px-4">
				<button
					class="flex min-w-0 flex-1 items-center gap-3 text-left"
					onclick={openNowPlaying}
				>
					<div class="h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-surface">
						<img
							src={getImageUrl(player.currentTrack.imageItemId, 'Primary', { width: 80 })}
							alt=""
							class="h-full w-full object-cover"
						/>
					</div>
					<div class="min-w-0">
						<p class="truncate text-sm font-medium text-text">{player.currentTrack.name}</p>
						<p class="truncate text-xs text-text-muted">{player.currentTrack.artistName}</p>
					</div>
				</button>

				<div class="flex items-center gap-1 sm:gap-2">
					<button
						onclick={() => player.previous()}
						class="hidden p-2 text-text-muted transition-colors hover:text-text sm:block"
						aria-label="Previous"
					>
						<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
							<path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
						</svg>
					</button>

					<button
						onclick={() => player.toggle()}
						class="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-text transition-transform hover:scale-105"
						aria-label={player.isPlaying ? 'Pause' : 'Play'}
					>
						{#if player.isPlaying}
							<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
								<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
							</svg>
						{:else}
							<svg class="h-5 w-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
								<path d="M8 5v14l11-7z" />
							</svg>
						{/if}
					</button>

					<button
						onclick={() => player.next()}
						class="hidden p-2 text-text-muted transition-colors hover:text-text sm:block"
						aria-label="Next"
					>
						<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
							<path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
						</svg>
					</button>

					<button
						onclick={() => (player.showQueue = !player.showQueue)}
						class="hidden p-2 transition-colors sm:block {player.showQueue ? 'text-accent' : 'text-text-muted hover:text-text'}"
						aria-label="Queue"
					>
						<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
							<path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
						</svg>
					</button>
				</div>

				<div class="hidden min-w-[5rem] text-right text-xs text-text-muted lg:block">
					{formatTime(player.currentTime)} / {formatTime(player.duration)}
				</div>
			</div>
		</div>
	{/if}
{/if}
