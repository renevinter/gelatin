<script lang="ts">
	import { onMount } from 'svelte';
	import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models';
	import { getFavorites } from '$lib/api/favorites';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import AlbumCard from '$lib/components/AlbumCard.svelte';
	import ArtistCard from '$lib/components/ArtistCard.svelte';
	import TrackList from '$lib/components/TrackList.svelte';
	import Skeleton from '$lib/components/Skeleton.svelte';

	let songs = $state<BaseItemDto[]>([]);
	let albums = $state<BaseItemDto[]>([]);
	let artists = $state<BaseItemDto[]>([]);
	let loading = $state(true);
	let tab = $state<'songs' | 'albums' | 'artists'>('songs');

	onMount(async () => {
		try {
			const [s, a, ar] = await Promise.all([
				getFavorites('Audio'),
				getFavorites('MusicAlbum'),
				getFavorites('MusicArtist')
			]);
			songs = s;
			albums = a;
			artists = ar;
		} catch (err) {
			console.error('Failed to load favorites:', err);
		} finally {
			loading = false;
		}
	});

	const tabs = [
		{ id: 'songs' as const, label: 'Songs', count: () => songs.length },
		{ id: 'albums' as const, label: 'Albums', count: () => albums.length },
		{ id: 'artists' as const, label: 'Artists', count: () => artists.length }
	];
</script>

<svelte:head>
	<title>Favorites - Gelatin</title>
</svelte:head>

<div class="p-4 pb-24 sm:p-6">
	<h1 class="mb-6 hidden text-2xl font-bold text-text lg:block">Favorites</h1>

	<div class="mb-6 flex gap-1">
		{#each tabs as t}
			<button
				onclick={() => (tab = t.id)}
				class="rounded-full px-4 py-1.5 text-sm font-medium transition-colors {tab === t.id ? 'bg-accent text-accent-text' : 'text-text-muted hover:bg-surface'}"
			>
				{t.label}
				{#if !loading}
					<span class="ml-1 text-xs opacity-70">{t.count()}</span>
				{/if}
			</button>
		{/each}
	</div>

	{#if loading}
		<div class="space-y-2">
			{#each Array(8) as _}
				<div class="flex items-center gap-3 px-3 py-2">
					<Skeleton class="h-10 w-10 rounded" />
					<div class="flex-1">
						<Skeleton class="h-4 w-48" />
						<Skeleton class="mt-1 h-3 w-32" />
					</div>
				</div>
			{/each}
		</div>
	{:else if tab === 'songs'}
		{#if songs.length > 0}
			<TrackList tracks={songs} />
		{:else}
			<p class="py-12 text-center text-text-muted">No favorite songs yet</p>
		{/if}
	{:else if tab === 'albums'}
		{#if albums.length > 0}
			<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
				{#each albums as album}
					<AlbumCard {album} onclick={() => goto(`${base}/albums/${album.Id}`)} />
				{/each}
			</div>
		{:else}
			<p class="py-12 text-center text-text-muted">No favorite albums yet</p>
		{/if}
	{:else if tab === 'artists'}
		{#if artists.length > 0}
			<div class="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
				{#each artists as artist}
					<ArtistCard {artist} onclick={() => goto(`${base}/artists/${artist.Id}`)} />
				{/each}
			</div>
		{:else}
			<p class="py-12 text-center text-text-muted">No favorite artists yet</p>
		{/if}
	{/if}
</div>
