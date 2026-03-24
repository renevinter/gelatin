<script lang="ts">
	import { getLyrics, type LyricLine } from '$lib/api/lyrics';
	import { onMount, tick, untrack } from 'svelte';

	interface Props {
		trackId: string;
		currentTime: number;
		onseek?: (time: number) => void;
		ontiming?: (firstStart: number, lastStart: number) => void;
	}

	let { trackId, currentTime, onseek, ontiming }: Props = $props();

	let lines = $state<LyricLine[]>([]);
	let loading = $state(true);
	let error = $state(false);
	let outer: HTMLDivElement | undefined = $state();
	let inner: HTMLDivElement | undefined = $state();
	let lastTrackId = $state('');
	let halfHeight = $state(0);
	let needsInstantScroll = $state(true);

	onMount(() => {
		if (outer) {
			halfHeight = outer.clientHeight / 2;
		}
	});

	$effect(() => {
		if (trackId !== lastTrackId) {
			lastTrackId = trackId;
			loading = true;
			error = false;
			getLyrics(trackId).then(async (data) => {
				lines = data?.lines ?? [];
				loading = false;
				error = false;
				if (ontiming && lines.length > 0) {
					ontiming(lines[0].start, lines[lines.length - 1].start);
				}
				await tick();
				if (outer && halfHeight === 0) {
					halfHeight = outer.clientHeight / 2;
				}
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
		if (activeLine >= 0 && outer && inner) {
			const children = inner.children;
			const el = children[activeLine] as HTMLElement | undefined;
			if (el) {
				const scrollTarget = el.offsetTop - outer.clientHeight / 2 + el.clientHeight / 2;
				const behavior = untrack(() => {
					if (needsInstantScroll) {
						needsInstantScroll = false;
						return 'instant' as const;
					}
					return 'smooth' as const;
				});
				outer.scrollTo({ top: scrollTarget, behavior });
			}
		}
	});

	function handleLineClick(line: LyricLine) {
		if (onseek && line.start >= 0) {
			onseek(line.start);
		}
	}
</script>

<div
	bind:this={outer}
	class="lyrics-fade relative h-full w-full overflow-y-auto scrollbar-hide"
>
	{#if loading}
		<div class="flex h-full items-center justify-center">
			<p class="text-sm text-white/50">Loading lyrics...</p>
		</div>
	{:else if lines.length === 0}
		<div class="flex h-full items-center justify-center">
			<p class="text-sm text-white/50">{error ? 'Failed to load lyrics' : 'No lyrics available'}</p>
		</div>
	{:else}
		<div
			bind:this={inner}
			class="flex flex-col items-center"
			style="padding-top: {halfHeight}px; padding-bottom: {halfHeight}px;"
		>
			{#each lines as line, i}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<p
					role={onseek ? 'button' : undefined}
					tabindex={onseek ? 0 : undefined}
					class="px-4 py-2 text-center text-2xl landscape:text-3xl lg:py-3 lg:text-3xl {i === activeLine ? 'font-bold text-white scale-105' : 'text-white/50'} {onseek ? 'cursor-pointer hover:text-white/70' : ''}"
					style="transition: font-weight 0.5s, transform 0.5s, color 0.5s;"
					onclick={() => handleLineClick(line)}
				>
					{line.text}
				</p>
			{/each}
		</div>
	{/if}
</div>

<style>
	.lyrics-fade {
		mask-image: linear-gradient(
			to bottom,
			transparent 0%,
			transparent 5%,
			black 30%,
			black 70%,
			transparent 95%,
			transparent 100%
		);
		-webkit-mask-image: linear-gradient(
			to bottom,
			transparent 0%,
			transparent 5%,
			black 30%,
			black 70%,
			transparent 95%,
			transparent 100%
		);
	}
</style>
