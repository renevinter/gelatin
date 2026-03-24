<script lang="ts">
	import { getLyrics, type LyricLine } from '$lib/api/lyrics';

	interface Props {
		trackId: string;
		currentTime: number;
		onseek?: (time: number) => void;
	}

	let { trackId, currentTime, onseek }: Props = $props();

	let lines = $state<LyricLine[]>([]);
	let loading = $state(true);
	let error = $state(false);
	let container: HTMLDivElement | undefined = $state();
	let lastTrackId = $state('');

	$effect(() => {
		if (trackId !== lastTrackId) {
			lastTrackId = trackId;
			loading = true;
			error = false;
			getLyrics(trackId).then((data) => {
				lines = data?.lines ?? [];
				loading = false;
				error = false;
			}).catch(() => {
				lines = [];
				loading = false;
				error = true;
			});
		}
	});

	let activeLine = $derived.by(() => {
		if (lines.length === 0) return -1;
		let idx = -1;
		for (let i = 0; i < lines.length; i++) {
			if (lines[i].start <= currentTime) idx = i;
			else break;
		}
		return idx;
	});

	$effect(() => {
		if (activeLine >= 0 && container) {
			const el = container.children[activeLine] as HTMLElement;
			if (el) {
				el.scrollIntoView({ behavior: 'smooth', block: 'center' });
			}
		}
	});

	function handleLineClick(line: LyricLine) {
		if (onseek && line.start >= 0) {
			onseek(line.start);
		}
	}
</script>

<div bind:this={container} class="flex h-full w-full flex-col items-center overflow-y-auto py-8 scrollbar-hide">
	{#if loading}
		<p class="text-sm text-text-muted">Loading lyrics...</p>
	{:else if lines.length === 0}
		<p class="text-sm text-text-muted">{error ? 'Failed to load lyrics' : 'No lyrics available'}</p>
	{:else}
		{#each lines as line, i}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<p
				role={onseek ? 'button' : undefined}
				tabindex={onseek ? 0 : undefined}
				class="px-4 py-1.5 text-center text-lg transition-all duration-300 {i === activeLine ? 'font-bold text-text scale-105' : 'text-text-muted/60'} {onseek ? 'cursor-pointer hover:text-text/80' : ''}"
				onclick={() => handleLineClick(line)}
			>
				{line.text}
			</p>
		{/each}
	{/if}
</div>
