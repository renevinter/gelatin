<script lang="ts">
	import { onMount } from 'svelte';
	import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models';
	import { getAllSongs } from '$lib/api/library';
	import TrackList from '$lib/components/TrackList.svelte';
	import Skeleton from '$lib/components/Skeleton.svelte';

	let songs = $state<BaseItemDto[]>([]);
	let totalCount = $state(0);
	let loading = $state(true);
	let page = $state(0);
	let sortBy = $state('SortName');
	const PAGE_SIZE = 100;

	const sortOptions = [
		{ value: 'SortName', label: 'Name' },
		{ value: 'DateCreated', label: 'Date Added' },
		{ value: 'Album', label: 'Album' },
		{ value: 'Artist', label: 'Artist' },
		{ value: 'Random', label: 'Random' }
	];

	async function loadSongs() {
		loading = true;
		try {
			const result = await getAllSongs(page * PAGE_SIZE, PAGE_SIZE, sortBy);
			songs = result.items;
			totalCount = result.totalCount;
		} catch (err) {
			console.error('Failed to load songs:', err);
		} finally {
			loading = false;
		}
	}

	onMount(loadSongs);
</script>

<svelte:head>
	<title>Songs - Gelatin</title>
</svelte:head>

<div class="p-4 pb-24 sm:p-6">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-2xl font-bold text-text">Songs</h1>
		<div class="flex items-center gap-3">
			<span class="text-sm text-text-muted">{totalCount} songs</span>
			<select
				bind:value={sortBy}
				onchange={() => { page = 0; loadSongs(); }}
				class="rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-text focus:border-accent focus:outline-none"
			>
				{#each sortOptions as opt}
					<option value={opt.value}>{opt.label}</option>
				{/each}
			</select>
		</div>
	</div>

	{#if loading}
		<div class="space-y-2">
			{#each Array(10) as _}
				<div class="flex items-center gap-3 px-3 py-2">
					<Skeleton class="h-10 w-10 rounded" />
					<div class="flex-1">
						<Skeleton class="h-4 w-48" />
						<Skeleton class="mt-1 h-3 w-32" />
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<TrackList tracks={songs} />

		{#if totalCount > PAGE_SIZE}
			<div class="mt-6 flex items-center justify-center gap-4">
				<button
					onclick={() => { page = Math.max(0, page - 1); loadSongs(); }}
					disabled={page === 0}
					class="rounded-lg border border-border px-4 py-2 text-sm text-text transition-colors hover:bg-surface disabled:opacity-50"
				>
					Previous
				</button>
				<span class="text-sm text-text-muted">
					Page {page + 1} of {Math.ceil(totalCount / PAGE_SIZE)}
				</span>
				<button
					onclick={() => { page++; loadSongs(); }}
					disabled={(page + 1) * PAGE_SIZE >= totalCount}
					class="rounded-lg border border-border px-4 py-2 text-sm text-text transition-colors hover:bg-surface disabled:opacity-50"
				>
					Next
				</button>
			</div>
		{/if}
	{/if}
</div>
