<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { onMount } from 'svelte';

	let visible = $state(false);
	let query = $state('');

	onMount(() => {
		const wco = (navigator as any).windowControlsOverlay;
		if (wco) {
			visible = wco.visible;
			wco.addEventListener('geometrychange', () => {
				visible = wco.visible;
			});
		}
	});

	function handleSubmit(e: Event) {
		e.preventDefault();
		if (query.trim()) {
			goto(`${base}/search?q=${encodeURIComponent(query.trim())}`);
		} else {
			goto(`${base}/search`);
		}
	}
</script>

{#if visible}
	<div
		class="titlebar-drag fixed left-56 right-0 z-50 flex items-center gap-3 border-b border-border bg-bg px-4"
		style="top: env(titlebar-area-y, 0); height: env(titlebar-area-height, 2.5rem);"
	>
		<form onsubmit={handleSubmit} class="titlebar-no-drag flex flex-1 items-center">
			<div class="relative flex-1">
				<svg class="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" fill="currentColor" viewBox="0 0 24 24">
					<path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
				</svg>
				<input
					type="search"
					bind:value={query}
					placeholder="Search..."
					class="h-7 w-full rounded-md border border-border bg-surface pl-8 pr-3 text-xs text-text placeholder:text-text-muted/50 focus:border-accent focus:outline-none"
				/>
			</div>
		</form>
	</div>
{/if}
