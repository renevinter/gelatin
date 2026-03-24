<script lang="ts">
	import { player } from '$lib/stores/player.svelte';
	import { getImageUrl } from '$lib/api/images';

	function formatTime(s: number): string {
		if (!s || !isFinite(s)) return '0:00';
		const m = Math.floor(s / 60);
		const sec = Math.floor(s % 60);
		return `${m}:${sec.toString().padStart(2, '0')}`;
	}
</script>

{#if player.showQueue}
	<div class="safe-bottom-queue fixed right-0 z-40 flex h-[50vh] w-full flex-col border-l border-t border-border/50 bg-bg/80 backdrop-blur-2xl lg:left-auto lg:w-96">
		<div class="flex items-center justify-between border-b border-border/50 px-4 py-3">
			<h2 class="text-sm font-semibold text-text">Queue</h2>
			<div class="flex items-center gap-2">
				<button
					onclick={() => player.clearQueue()}
					class="text-xs text-text-muted hover:text-danger"
				>
					Clear
				</button>
				<button
					onclick={() => (player.showQueue = false)}
					class="p-1 text-text-muted hover:text-text"
					aria-label="Close"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
						<path d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
		</div>

		<div class="flex-1 overflow-y-auto">
			{#each player.queue as track, i}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<div
					role="button"
					tabindex="0"
					class="flex w-full cursor-pointer items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-surface-hover {i === player.queueIndex ? 'bg-surface' : ''}"
					onclick={() => player.playIndex(i)}
				>
					<div class="h-9 w-9 flex-shrink-0 overflow-hidden rounded bg-surface">
						<img
							src={getImageUrl(track.imageItemId, 'Primary', { width: 72 })}
							alt=""
							class="h-full w-full object-cover"
						/>
					</div>
					<div class="min-w-0 flex-1">
						<p class="truncate text-sm {i === player.queueIndex ? 'font-medium text-accent' : 'text-text'}">
							{track.name}
						</p>
						<p class="truncate text-xs text-text-muted">{track.artistName}</p>
					</div>
					<span class="flex-shrink-0 text-xs text-text-muted">{formatTime(track.duration)}</span>
					<button
						onclick={(e) => { e.stopPropagation(); player.removeFromQueue(i); }}
						class="flex-shrink-0 p-1 text-text-muted hover:text-danger"
						aria-label="Remove from queue"
					>
						<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
							<path d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
			{/each}

			{#if player.queue.length === 0}
				<div class="flex h-full items-center justify-center">
					<p class="text-sm text-text-muted">Queue is empty</p>
				</div>
			{/if}
		</div>
	</div>
{/if}
