<script lang="ts">
	import { onMount } from 'svelte';
	import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models';
	import { getAlbumArtists } from '$lib/api/library';
	import { goto } from '$app/navigation';
	import ArtistCard from '$lib/components/ArtistCard.svelte';
	import Skeleton from '$lib/components/Skeleton.svelte';

	let artists = $state<BaseItemDto[]>([]);
	let totalCount = $state(0);
	let loading = $state(true);
	let searchTerm = $state('');
	let page = $state(0);
	const PAGE_SIZE = 60;

	async function loadArtists() {
		loading = true;
		try {
			const result = await getAlbumArtists(page * PAGE_SIZE, PAGE_SIZE, searchTerm || undefined);
			artists = result.items;
			totalCount = result.totalCount;
		} catch (err) {
			console.error('Failed to load artists:', err);
		} finally {
			loading = false;
		}
	}

	onMount(loadArtists);

	let searchTimeout: ReturnType<typeof setTimeout>;
	function handleSearch(e: Event) {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			page = 0;
			loadArtists();
		}, 300);
	}
</script>

<svelte:head>
	<title>Artists - Gelatin</title>
</svelte:head>

<div class="p-4 pb-24 sm:p-6">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-2xl font-bold text-text">Artists</h1>
		<span class="text-sm text-text-muted">{totalCount} artists</span>
	</div>

	<input
		type="search"
		bind:value={searchTerm}
		oninput={handleSearch}
		placeholder="Filter artists..."
		class="mb-6 w-full max-w-sm rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted/50 focus:border-accent focus:outline-none"
	/>

	{#if loading}
		<div class="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
			{#each Array(12) as _}
				<div class="text-center">
					<Skeleton class="mx-auto aspect-square w-full rounded-full" />
					<Skeleton class="mx-auto mt-2 h-4 w-3/4" />
				</div>
			{/each}
		</div>
	{:else}
		<div class="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
			{#each artists as artist}
				<ArtistCard {artist} onclick={() => goto(`/artists/${artist.Id}`)} />
			{/each}
		</div>

		{#if totalCount > PAGE_SIZE}
			<div class="mt-6 flex items-center justify-center gap-4">
				<button
					onclick={() => { page = Math.max(0, page - 1); loadArtists(); }}
					disabled={page === 0}
					class="rounded-lg border border-border px-4 py-2 text-sm text-text transition-colors hover:bg-surface disabled:opacity-50"
				>
					Previous
				</button>
				<span class="text-sm text-text-muted">
					Page {page + 1} of {Math.ceil(totalCount / PAGE_SIZE)}
				</span>
				<button
					onclick={() => { page++; loadArtists(); }}
					disabled={(page + 1) * PAGE_SIZE >= totalCount}
					class="rounded-lg border border-border px-4 py-2 text-sm text-text transition-colors hover:bg-surface disabled:opacity-50"
				>
					Next
				</button>
			</div>
		{/if}
	{/if}
</div>
