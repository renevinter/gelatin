<script lang="ts">
	import { onMount } from 'svelte';
	import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models';
	import { getAlbums } from '$lib/api/library';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import AlbumCard from '$lib/components/AlbumCard.svelte';
	import Skeleton from '$lib/components/Skeleton.svelte';

	let albums = $state<BaseItemDto[]>([]);
	let totalCount = $state(0);
	let loading = $state(true);
	let page = $state(0);
	let sortBy = $state('SortName');
	const PAGE_SIZE = 60;

	const sortOptions = [
		{ value: 'SortName', label: 'Name' },
		{ value: 'DateCreated', label: 'Date Added' },
		{ value: 'ProductionYear', label: 'Year' },
		{ value: 'Random', label: 'Random' }
	];

	async function loadAlbums() {
		loading = true;
		try {
			const order = sortBy === 'DateCreated' ? 'Descending' : 'Ascending';
			const result = await getAlbums(page * PAGE_SIZE, PAGE_SIZE, sortBy, order as any);
			albums = result.items;
			totalCount = result.totalCount;
		} catch (err) {
			console.error('Failed to load albums:', err);
		} finally {
			loading = false;
		}
	}

	onMount(loadAlbums);
</script>

<svelte:head>
	<title>Albums - Gelatin</title>
</svelte:head>

<div class="p-4 pb-24 sm:p-6">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-2xl font-bold text-text">Albums</h1>
		<div class="flex items-center gap-3">
			<span class="text-sm text-text-muted">{totalCount} albums</span>
			<select
				bind:value={sortBy}
				onchange={() => { page = 0; loadAlbums(); }}
				class="rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-text focus:border-accent focus:outline-none"
			>
				{#each sortOptions as opt}
					<option value={opt.value}>{opt.label}</option>
				{/each}
			</select>
		</div>
	</div>

	{#if loading}
		<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
			{#each Array(12) as _}
				<div>
					<Skeleton class="aspect-square w-full rounded-lg" />
					<Skeleton class="mt-2 h-4 w-3/4" />
					<Skeleton class="mt-1 h-3 w-1/2" />
				</div>
			{/each}
		</div>
	{:else}
		<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
			{#each albums as album}
				<AlbumCard {album} onclick={() => goto(`${base}/albums/${album.Id}`)} />
			{/each}
		</div>

		{#if totalCount > PAGE_SIZE}
			<div class="mt-6 flex items-center justify-center gap-4">
				<button
					onclick={() => { page = Math.max(0, page - 1); loadAlbums(); }}
					disabled={page === 0}
					class="rounded-lg border border-border px-4 py-2 text-sm text-text transition-colors hover:bg-surface disabled:opacity-50"
				>
					Previous
				</button>
				<span class="text-sm text-text-muted">
					Page {page + 1} of {Math.ceil(totalCount / PAGE_SIZE)}
				</span>
				<button
					onclick={() => { page++; loadAlbums(); }}
					disabled={(page + 1) * PAGE_SIZE >= totalCount}
					class="rounded-lg border border-border px-4 py-2 text-sm text-text transition-colors hover:bg-surface disabled:opacity-50"
				>
					Next
				</button>
			</div>
		{/if}
	{/if}
</div>
