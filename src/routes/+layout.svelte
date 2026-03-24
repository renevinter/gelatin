<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import { auth } from '$lib/stores/auth.svelte';
	import { theme } from '$lib/stores/theme.svelte';
	import { player } from '$lib/stores/player.svelte';
	import Nav from '$lib/components/Nav.svelte';
	import PlayerBar from '$lib/components/PlayerBar.svelte';
	import NowPlaying from '$lib/components/NowPlaying.svelte';
	import Queue from '$lib/components/Queue.svelte';
	import Toasts from '$lib/components/Toasts.svelte';

	let { children } = $props();

	const isPublicPage = $derived(
		$page.url.pathname === `${base}/login` || $page.url.pathname === `${base}/welcome`
	);

	onMount(() => {
		theme.init();
	});

	$effect(() => {
		if (!auth.isLoggedIn && !isPublicPage) {
			goto(`${base}/welcome`);
		}
	});

	function handleKeydown(e: KeyboardEvent) {
		if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

		switch (e.code) {
			case 'Space':
				e.preventDefault();
				player.toggle();
				break;
			case 'ArrowRight':
				if (e.shiftKey) player.next();
				else player.seek(player.currentTime + 10);
				break;
			case 'ArrowLeft':
				if (e.shiftKey) player.previous();
				else player.seek(player.currentTime - 10);
				break;
			case 'ArrowUp':
				if (e.shiftKey) player.setVolume(player.volume + 0.1);
				break;
			case 'ArrowDown':
				if (e.shiftKey) player.setVolume(player.volume - 0.1);
				break;
			case 'KeyM':
				player.setVolume(player.volume > 0 ? 0 : 1);
				break;
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isPublicPage}
	{@render children()}
{:else if auth.isLoggedIn}
	<Nav />
	<!-- Main content area: offset for sidebar on desktop, bottom nav + player on mobile -->
	<main class="min-h-screen pb-36 lg:pl-56 lg:pb-20" style="padding-top: env(safe-area-inset-top, 0px);">
		{@render children()}
	</main>
	<PlayerBar />
	<NowPlaying />
	<Queue />
{/if}
<Toasts />
