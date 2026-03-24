<script lang="ts">
	import { search, type SearchResults } from '$lib/api/search';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import AlbumCard from '$lib/components/AlbumCard.svelte';
	import ArtistCard from '$lib/components/ArtistCard.svelte';
	import TrackList from '$lib/components/TrackList.svelte';

	let query = $state('');
	let results = $state<SearchResults | null>(null);
	let loading = $state(false);
	let tab = $state<'all' | 'artists' | 'albums' | 'songs'>('all');

	let searchTimeout: ReturnType<typeof setTimeout>;

	onMount(() => {
		const q = $page.url.searchParams.get('q');
		if (q) {
			query = q;
			doSearch(q);
		}
	});

	async function doSearch(q: string) {
		loading = true;
		try {
			results = await search(q);
		} catch (err) {
			console.error('Search failed:', err);
		} finally {
			loading = false;
		}
	}

	function handleInput() {
		clearTimeout(searchTimeout);
		if (!query.trim()) {
			results = null;
			return;
		}
		searchTimeout = setTimeout(() => doSearch(query), 300);
	}

	const hasResults = $derived(
		results && (results.artists.length > 0 || results.albums.length > 0 || results.songs.length > 0)
	);

	const tabs = [
		{ id: 'all' as const, label: 'All' },
		{ id: 'artists' as const, label: 'Artists' },
		{ id: 'albums' as const, label: 'Albums' },
		{ id: 'songs' as const, label: 'Songs' }
	];
</script>

<svelte:head>
	<title>Search - Gelatin</title>
</svelte:head>

<div class="p-4 pb-24 sm:p-6">
	<div class="mb-6">
		<input
			type="search"
			bind:value={query}
			oninput={handleInput}
			placeholder="Search artists, albums, songs..."
			class="w-full rounded-xl border border-border bg-surface px-4 py-3 text-text placeholder:text-text-muted/50 focus:border-accent focus:outline-none"
			
		/>
	</div>

	{#if results}
		<!-- Tabs -->
		<div class="mb-6 flex gap-1 overflow-x-auto">
			{#each tabs as t}
				<button
					onclick={() => (tab = t.id)}
					class="rounded-full px-4 py-1.5 text-sm font-medium transition-colors {tab === t.id ? 'bg-accent text-accent-text' : 'text-text-muted hover:bg-surface'}"
				>
					{t.label}
				</button>
			{/each}
		</div>

		{#if loading}
			<p class="text-sm text-text-muted">Searching...</p>
		{:else if !hasResults}
			<p class="py-12 text-center text-text-muted">No results for "{query}"</p>
		{:else}
			<!-- Artists -->
			{#if (tab === 'all' || tab === 'artists') && results.artists.length > 0}
				<section class="mb-8">
					<h2 class="mb-4 text-lg font-semibold text-text">Artists</h2>
					<div class="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
						{#each results.artists.slice(0, tab === 'all' ? 6 : undefined) as artist}
							<ArtistCard {artist} onclick={() => goto(`${base}/artists/${artist.Id}`)} />
						{/each}
					</div>
				</section>
			{/if}

			<!-- Albums -->
			{#if (tab === 'all' || tab === 'albums') && results.albums.length > 0}
				<section class="mb-8">
					<h2 class="mb-4 text-lg font-semibold text-text">Albums</h2>
					<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
						{#each results.albums.slice(0, tab === 'all' ? 6 : undefined) as album}
							<AlbumCard {album} onclick={() => goto(`${base}/albums/${album.Id}`)} />
						{/each}
					</div>
				</section>
			{/if}

			<!-- Songs -->
			{#if (tab === 'all' || tab === 'songs') && results.songs.length > 0}
				<section>
					<h2 class="mb-4 text-lg font-semibold text-text">Songs</h2>
					<TrackList tracks={results.songs} />
				</section>
			{/if}
		{/if}
	{:else if !query}
		<div class="flex flex-col items-center justify-center py-20">
			<svg class="mb-4 h-16 w-16 text-text-muted/30" fill="currentColor" viewBox="0 0 24 24">
				<path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
			</svg>
			<p class="text-text-muted">Search your music library</p>
		</div>
	{/if}
</div>
