<script lang="ts">
	import { player } from '$lib/stores/player.svelte';
	import { getImageUrl } from '$lib/api/images';
	import { toggleFavorite } from '$lib/api/favorites';
	import { onMount } from 'svelte';
	import Lyrics from './Lyrics.svelte';

	let dragY = $state(0);
	let isDragging = $state(false);
	let dragStartY = 0;

	function handleDragStart(e: TouchEvent) {
		isDragging = true;
		dragStartY = e.touches[0].clientY;
		dragY = 0;
	}

	function handleDragMove(e: TouchEvent) {
		if (!isDragging) return;
		const delta = e.touches[0].clientY - dragStartY;
		dragY = Math.max(0, delta);
	}

	function handleDragEnd() {
		if (!isDragging) return;
		isDragging = false;
		if (dragY > 120) {
			player.showNowPlaying = false;
		}
		dragY = 0;
	}

	function formatTime(s: number): string {
		if (!s || !isFinite(s)) return '0:00';
		const m = Math.floor(s / 60);
		const sec = Math.floor(s % 60);
		return `${m}:${sec.toString().padStart(2, '0')}`;
	}

	function handleSeek(e: MouseEvent) {
		const bar = e.currentTarget as HTMLElement;
		const rect = bar.getBoundingClientRect();
		const ratio = (e.clientX - rect.left) / rect.width;
		player.seek(ratio * player.duration);
	}

	let lastTrackId = $state('');

	$effect(() => {
		const id = player.currentTrack?.id;
		if (id && id !== lastTrackId) {
			lastTrackId = id;
			firstLyricTime = -1;
			lastLyricTime = -1;
		}
	});

	function close() {
		player.showNowPlaying = false;
	}

	let firstLyricTime = $state(-1);
	let lastLyricTime = $state(-1);

	function handleTiming(first: number, last: number) {
		firstLyricTime = first;
		lastLyricTime = last;
	}

	const lyricsActive = $derived(
		player.showLyrics &&
		firstLyricTime >= 0 &&
		player.currentTime >= firstLyricTime - 1.5 &&
		player.currentTime <= lastLyricTime + 3
	);

	async function handleFavorite() {
		const track = player.currentTrack;
		if (!track) return;
		const newVal = await toggleFavorite(track.id, track.isFavorite);
		const q = player.queue;
		const idx = player.queueIndex;
		if (q[idx]) {
			q[idx] = { ...q[idx], isFavorite: newVal };
		}
	}

	let showQueue = $state(false);

	// StandBy mode: landscape mobile detection
	let isStandby = $state(false);
	let showControls = $state(false);
	let controlsTimer: ReturnType<typeof setTimeout> | null = null;

	onMount(() => {
		const mql = window.matchMedia('(orientation: landscape) and (max-height: 500px)');
		isStandby = mql.matches;
		const handler = (e: MediaQueryListEvent) => {
			isStandby = e.matches;
			showControls = false;
		};
		mql.addEventListener('change', handler);
		return () => {
			mql.removeEventListener('change', handler);
			if (controlsTimer) clearTimeout(controlsTimer);
		};
	});

	function toggleControls() {
		showControls = !showControls;
		if (controlsTimer) clearTimeout(controlsTimer);
		if (showControls) {
			controlsTimer = setTimeout(() => {
				showControls = false;
			}, 3500);
		}
	}

	// Screen Wake Lock: keep screen on in StandBy mode
	let wakeLock: WakeLockSentinel | null = null;

	async function acquireWakeLock() {
		if (!('wakeLock' in navigator)) return;
		try {
			wakeLock = await navigator.wakeLock.request('screen');
			wakeLock.addEventListener('release', () => {
				wakeLock = null;
			});
		} catch {
			// Wake lock request failed (e.g. low battery)
		}
	}

	function releaseWakeLock() {
		wakeLock?.release();
		wakeLock = null;
	}

	$effect(() => {
		const shouldLock = player.showNowPlaying && isStandby;
		if (shouldLock) {
			acquireWakeLock();
			const onVisibilityChange = () => {
				if (document.visibilityState === 'visible') acquireWakeLock();
			};
			document.addEventListener('visibilitychange', onVisibilityChange);
			return () => {
				document.removeEventListener('visibilitychange', onVisibilityChange);
				releaseWakeLock();
			};
		} else {
			releaseWakeLock();
		}
	});
</script>

{#if player.currentTrack}
	{@const track = player.currentTrack}
	{@const artUrl = getImageUrl(track.imageItemId, 'Primary', { width: 600 })}
	{@const artUrlLarge = getImageUrl(track.imageItemId, 'Primary', { width: 1200 })}
	{@const trackMeta = { artistName: track.artistName, name: track.name, albumName: track.albumName, duration: track.duration }}

	<div
		class="fixed inset-0 z-40 flex flex-col overflow-hidden text-white {isDragging ? '' : 'transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]'} {player.showNowPlaying ? '' : 'translate-y-full pointer-events-none'}"
		style="{player.showNowPlaying && dragY > 0 ? `transform: translateY(${dragY}px);` : ''}"
	>
		{#if isStandby}
			<!-- StandBy mode: AMOLED black, art left, lyrics right -->
			<div class="absolute inset-0 -z-10 bg-black"></div>

			<button
				onclick={close}
				class="absolute right-3 top-2 z-10 p-2 text-white/20 transition-colors hover:text-white/50"
				aria-label="Close"
			>
				<svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
					<path d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>

			<div class="flex h-full flex-row">
				<!-- Left: Album art + track info -->
				<div class="flex w-[42%] flex-col items-center justify-center p-4">
					<!-- Album art with tap-to-reveal controls -->
					<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
					<div
						class="relative aspect-square w-full max-w-[17rem] cursor-pointer overflow-hidden rounded-xl shadow-2xl"
						onclick={toggleControls}
					>
						<img src={artUrl} alt={track.albumName} class="h-full w-full object-cover" />
						<div
							class="absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity duration-300 {showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}"
						>
							<div class="flex items-center gap-5">
								<button
									onclick={(e) => { e.stopPropagation(); player.previous(); }}
									class="text-white/80 transition-colors hover:text-white"
									aria-label="Previous"
								>
									<svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
								</button>
								<button
									onclick={(e) => { e.stopPropagation(); player.toggle(); }}
									class="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
									aria-label={player.isPlaying ? 'Pause' : 'Play'}
								>
									{#if player.isPlaying}
										<svg class="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
									{:else}
										<svg class="ml-0.5 h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
									{/if}
								</button>
								<button
									onclick={(e) => { e.stopPropagation(); player.next(); }}
									class="text-white/80 transition-colors hover:text-white"
									aria-label="Next"
								>
									<svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
								</button>
							</div>
						</div>
					</div>

					<!-- Progress bar -->
					<div class="mt-3 w-full max-w-[17rem]">
						<button
							class="relative block h-2 w-full cursor-pointer rounded-full bg-white/10"
							onclick={handleSeek}
							aria-label="Seek"
						>
							<div
								class="absolute left-0 top-0 h-full rounded-full bg-white/40 transition-all"
								style="width: {player.duration ? (player.currentTime / player.duration) * 100 : 0}%"
							></div>
						</button>
					</div>

					<div class="mt-2 w-full max-w-[17rem] text-center">
						<p class="truncate text-lg font-semibold text-white">{track.name}</p>
						<p class="truncate text-base text-white/40">{track.artistName}</p>
					</div>
				</div>

				<!-- Right: Lyrics -->
				<div class="flex flex-1 flex-col overflow-hidden py-2">
					<Lyrics
						trackId={track.id}
						currentTime={player.currentTime}
						{trackMeta}
						onseek={(t) => player.seek(t)}
						ontiming={handleTiming}
					/>
				</div>
			</div>
		{:else}
			<!-- Normal mode -->
			<!-- Blurred album art background -->
			<div class="absolute inset-0 -z-10">
				<img
					src={artUrlLarge}
					alt=""
					class="h-full w-full object-cover"
				/>
				<div class="absolute inset-0 bg-black/50 backdrop-blur-[80px]"></div>
			</div>

			<!-- Mobile drag handle -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="flex items-center justify-center py-3 lg:hidden"
				ontouchstart={handleDragStart}
				ontouchmove={handleDragMove}
				ontouchend={handleDragEnd}
			>
				<div class="h-1 w-10 rounded-full bg-white/30"></div>
			</div>

			<!-- Desktop header -->
			<div class="hidden items-center justify-between px-4 py-3 lg:flex">
				<button onclick={close} class="p-2 text-white/70 hover:text-white" aria-label="Close">
					<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
						<path d="M19 9l-7 7-7-7" />
					</svg>
				</button>
				<span class="text-xs font-medium uppercase tracking-wider text-white/60">Now Playing</span>
				<div class="flex items-center gap-1">
					<button
						onclick={handleFavorite}
						class="rounded-lg p-2 transition-all {track.isFavorite ? 'bg-white/20 text-accent backdrop-blur-xl' : 'text-white/70 hover:text-white'}"
						aria-label="Favorite"
					>
						<svg class="h-5 w-5" fill={track.isFavorite ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
							<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
						</svg>
					</button>
					<button
						onclick={() => (player.showLyrics = !player.showLyrics)}
						class="rounded-lg p-2 transition-all {player.showLyrics ? 'bg-white/20 text-accent backdrop-blur-xl' : 'text-white/70 hover:text-white'}"
						aria-label="Lyrics"
					>
						<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
							<path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
						</svg>
					</button>
					<button
						onclick={() => { showQueue = !showQueue; }}
						class="rounded-lg p-2 transition-all {showQueue ? 'bg-white/20 text-accent backdrop-blur-xl' : 'text-white/70 hover:text-white'}"
						aria-label="Queue"
					>
						<svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
							<path d="M4 6h16M4 10h16M4 14h10" />
							<path d="M18 14v6m-3-3h6" />
						</svg>
					</button>
					<button
						class="rounded-lg p-2 text-white/70 transition-all hover:text-white"
						aria-label="Cast"
					>
						<svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
							<path d="M2 16.1A5 5 0 0 1 5.9 20M2 12.05A9 9 0 0 1 9.95 20M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6" />
							<line x1="2" y1="20" x2="2.01" y2="20" />
						</svg>
					</button>
					{#if player.pipSupported}
						<button
							onclick={() => player.openPip()}
							class="rounded-lg p-2 text-white/70 transition-all hover:text-white"
							aria-label="Mini Player"
						>
							<svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
								<rect x="2" y="3" width="20" height="14" rx="2" />
								<rect x="11" y="10" width="10" height="6" rx="1" fill="currentColor" />
							</svg>
						</button>
					{/if}
				</div>
			</div>

			<!-- Content: overlapping on mobile, split view on desktop -->
			{@const rightPanelActive = lyricsActive || showQueue}
			<div class="relative flex-1 overflow-hidden lg:flex lg:flex-row lg:items-stretch lg:px-12 lg:transition-all lg:duration-700 {rightPanelActive ? 'lg:gap-4' : 'lg:gap-0'}">
				<!-- Album art -->
				<div
					class="absolute inset-0 flex items-center justify-center px-8 transition-opacity duration-700 ease-in-out lg:static lg:flex-1 lg:opacity-100 {rightPanelActive ? 'opacity-0 pointer-events-none lg:opacity-100 lg:pointer-events-auto' : 'opacity-100'}"
				>
					<div class="w-full max-w-[20rem] transition-all duration-700 lg:max-w-sm {rightPanelActive ? '' : 'lg:max-w-md'}">
						<div class="aspect-square w-full overflow-hidden rounded-xl shadow-2xl">
							<img
								src={artUrl}
								alt={track.albumName}
								class="h-full w-full object-cover"
							/>
						</div>
					</div>
				</div>

				<!-- Right panel: lyrics / queue crossfade in the same space -->
				<div
					class="absolute inset-0 flex flex-col overflow-hidden px-4 transition-all duration-700 ease-in-out lg:static lg:px-0 {rightPanelActive ? 'opacity-100 lg:flex-1' : 'opacity-0 pointer-events-none lg:flex-none lg:basis-0'}"
				>
					<div class="relative h-full w-full">
						<!-- Lyrics layer -->
						<div class="absolute inset-0 transition-opacity duration-500 {showQueue ? 'opacity-0 pointer-events-none' : 'opacity-100'}">
							<Lyrics
								trackId={track.id}
								currentTime={player.currentTime}
								{trackMeta}
								onseek={(t) => player.seek(t)}
								ontiming={handleTiming}
							/>
						</div>

						<!-- Queue layer -->
						<div class="absolute inset-0 flex flex-col transition-opacity duration-500 {showQueue ? 'opacity-100' : 'opacity-0 pointer-events-none'}">
							<div class="flex items-center justify-between px-2 py-2">
								<h3 class="text-sm font-semibold text-white/80">Up Next</h3>
								<button
									onclick={() => player.clearQueue()}
									class="text-xs text-white/40 hover:text-white/70"
								>
									Clear
								</button>
							</div>
							<div class="flex-1 overflow-y-auto scrollbar-hide">
								{#each player.queue as qTrack, i}
									{#if i > player.queueIndex}
										<!-- svelte-ignore a11y_click_events_have_key_events -->
										<div
											role="button"
											tabindex="0"
											class="flex w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-white/10"
											onclick={() => player.playIndex(i)}
										>
											<div class="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md">
												<img
													src={getImageUrl(qTrack.imageItemId, 'Primary', { width: 80 })}
													alt=""
													class="h-full w-full object-cover"
												/>
											</div>
											<div class="min-w-0 flex-1">
												<p class="truncate text-sm font-medium text-white">{qTrack.name}</p>
												<p class="truncate text-xs text-white/50">{qTrack.artistName}</p>
											</div>
											<span class="flex-shrink-0 text-xs text-white/40">{formatTime(qTrack.duration)}</span>
											<button
												onclick={(e) => { e.stopPropagation(); player.removeFromQueue(i); }}
												class="flex-shrink-0 p-1 text-white/30 hover:text-white/70"
												aria-label="Remove"
											>
												<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
													<path d="M6 18L18 6M6 6l12 12" />
												</svg>
											</button>
										</div>
									{/if}
								{/each}
								{#if player.queue.length <= player.queueIndex + 1}
									<div class="flex h-full items-center justify-center">
										<p class="text-sm text-white/30">No upcoming tracks</p>
									</div>
								{/if}
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Track info + controls -->
			<div class="px-8 pb-6 pt-4 lg:pb-8">
				<div class="mx-auto flex max-w-lg flex-col gap-8 lg:block">
					<!-- Track info + progress -->
					<div>
						<div class="text-center">
							<h2 class="truncate text-lg font-bold text-white">{track.name}</h2>
							<p class="truncate text-sm text-white/60">{track.artistName}</p>
						</div>

						<!-- Progress -->
						<div class="mt-4">
							<button
								class="group relative block h-1.5 w-full cursor-pointer rounded-full bg-white/20"
								onclick={handleSeek}
								aria-label="Seek"
							>
								<div
									class="absolute left-0 top-0 h-full rounded-full bg-white"
									style="width: {player.duration ? (player.currentTime / player.duration) * 100 : 0}%"
								></div>
							</button>
							<div class="mt-1 flex justify-between text-xs text-white/50">
								<span>{formatTime(player.currentTime)}</span>
								<span>{formatTime(player.duration)}</span>
							</div>
						</div>
					</div>

					<!-- Controls -->
					<div class="flex items-center justify-center gap-6">
						<button
							onclick={() => player.toggleShuffle()}
							class="rounded-lg p-2 transition-all {player.shuffle ? 'bg-white/20 text-accent backdrop-blur-xl' : 'text-white/60 hover:text-white'}"
							aria-label="Shuffle"
						>
							<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
								<path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
							</svg>
						</button>

						<button
							onclick={() => player.previous()}
							class="p-2 text-white transition-colors hover:text-white/70"
							aria-label="Previous"
						>
							<svg class="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
								<path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
							</svg>
						</button>

						<button
							onclick={() => player.toggle()}
							class="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-xl transition-transform hover:scale-105"
							aria-label={player.isPlaying ? 'Pause' : 'Play'}
						>
							{#if player.isPlaying}
								<svg class="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 24 24">
									<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
								</svg>
							{:else}
								<svg class="h-7 w-7 ml-0.5 text-white" fill="currentColor" viewBox="0 0 24 24">
									<path d="M8 5v14l11-7z" />
								</svg>
							{/if}
						</button>

						<button
							onclick={() => player.next()}
							class="p-2 text-white transition-colors hover:text-white/70"
							aria-label="Next"
						>
							<svg class="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
								<path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
							</svg>
						</button>

						<button
							onclick={() => player.cycleRepeat()}
							class="relative rounded-lg p-2 transition-all {player.repeat !== 'off' ? 'bg-white/20 text-accent backdrop-blur-xl' : 'text-white/60 hover:text-white'}"
							aria-label="Repeat"
						>
							<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
								<path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
							</svg>
							{#if player.repeat === 'one'}
								<span class="absolute -right-0.5 -top-0.5 text-[10px] font-bold text-accent">1</span>
							{/if}
						</button>
					</div>

					<!-- Mobile action bar -->
					<div class="flex items-center justify-evenly lg:hidden">
						<button
							onclick={handleFavorite}
							class="rounded-lg p-2.5 transition-all {track.isFavorite ? 'bg-white/20 text-accent backdrop-blur-xl' : 'text-white/60 hover:text-white'}"
							aria-label="Favorite"
						>
							<svg class="h-5 w-5" fill={track.isFavorite ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
								<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
							</svg>
						</button>
						<button
							onclick={() => (player.showLyrics = !player.showLyrics)}
							class="rounded-lg p-2.5 transition-all {player.showLyrics ? 'bg-white/20 text-accent backdrop-blur-xl' : 'text-white/60 hover:text-white'}"
							aria-label="Lyrics"
						>
							<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
								<path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
							</svg>
						</button>
						<button
							onclick={() => { showQueue = !showQueue; }}
							class="rounded-lg p-2.5 transition-all {showQueue ? 'bg-white/20 text-accent backdrop-blur-xl' : 'text-white/60 hover:text-white'}"
							aria-label="Queue"
						>
							<svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
								<path d="M4 6h16M4 10h16M4 14h10" />
								<path d="M18 14v6m-3-3h6" />
							</svg>
						</button>
						<button
							class="rounded-lg p-2.5 text-white/60 transition-all hover:text-white"
							aria-label="Cast"
						>
							<svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
								<path d="M2 16.1A5 5 0 0 1 5.9 20M2 12.05A9 9 0 0 1 9.95 20M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6" />
								<line x1="2" y1="20" x2="2.01" y2="20" />
							</svg>
						</button>
						{#if player.pipSupported}
							<button
								onclick={() => player.openPip()}
								class="rounded-lg p-2.5 text-white/60 transition-all hover:text-white"
								aria-label="Mini Player"
							>
								<svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
									<rect x="2" y="3" width="20" height="14" rx="2" />
									<rect x="11" y="10" width="10" height="6" rx="1" fill="currentColor" />
								</svg>
							</button>
						{/if}
					</div>
				</div>
			</div>
		{/if}
	</div>
{/if}
