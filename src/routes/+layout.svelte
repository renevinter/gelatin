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
	import TitleBarSearch from '$lib/components/TitleBarSearch.svelte';

	let { children } = $props();

	const isPublicPage = $derived(
		$page.url.pathname === `${base}/login` || $page.url.pathname === `${base}/welcome`
	);

	const pageTitles: Record<string, string> = {
		'/': 'Home',
		'/search': 'Search',
		'/artists': 'Artists',
		'/albums': 'Albums',
		'/songs': 'Songs',
		'/playlists': 'Playlists',
		'/favorites': 'Favorites',
		'/settings': 'Settings'
	};

	const mobileTitle = $derived(() => {
		const path = $page.url.pathname.replace(base, '') || '/';
		return pageTitles[path] ?? '';
	});

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
	<div class="fixed inset-0 flex flex-col overflow-hidden">
		<TitleBarSearch />

		<div class="flex flex-1 overflow-hidden">
			<!-- Desktop sidebar -->
			<Nav desktop />

			<!-- Right column: content + player bar -->
			<div class="flex flex-1 flex-col overflow-hidden">
				<!-- View stack -->
				<div class="relative flex-1 overflow-hidden">
					<!-- Page content layer -->
					<main
						class="absolute inset-0 overflow-y-auto"
						style="padding-top: max(env(safe-area-inset-top, 0px), env(titlebar-area-height, 0px));"
					>
						{#if mobileTitle()}
							<div class="flex items-center justify-between px-4 pb-2 pt-3 sm:px-6 lg:hidden">
								<h1 class="text-2xl font-bold text-text">{mobileTitle()}</h1>
								<a
									href="{base}/settings"
									class="flex h-9 w-9 items-center justify-center rounded-full bg-accent/15 text-accent transition-colors hover:bg-accent/25"
									aria-label="Settings"
								>
									<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
								</a>
							</div>
						{/if}
						<div class="pb-24 lg:pb-4">
							{@render children()}
						</div>
					</main>

					<!-- Queue overlay -->
					<Queue />
				</div>

				<!-- Player bar: desktop only, at bottom of content area next to sidebar -->
				<div class="hidden lg:block">
					<PlayerBar />
				</div>
			</div>
		</div>

		<!-- Mobile bottom: player bar + floating nav pill -->
		<div class="pointer-events-none absolute inset-x-0 bottom-0 z-30 lg:hidden" style="padding-bottom: env(safe-area-inset-bottom, 0px);">
			<div class="pointer-events-auto px-4 pb-1">
				<PlayerBar mobile />
			</div>
			<div class="pointer-events-auto">
				<Nav mobile />
			</div>
		</div>

		<!-- Now Playing: covers the entire app shell -->
		<NowPlaying />
	</div>
{/if}
<Toasts />
