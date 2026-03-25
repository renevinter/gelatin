<script lang="ts">
	import { page } from '$app/stores';
	import { base } from '$app/paths';
	import { auth } from '$lib/stores/auth.svelte';

	interface Props {
		desktop?: boolean;
		mobile?: boolean;
	}

	let { desktop = false, mobile = false }: Props = $props();

	const navItems = [
		{ path: '/', label: 'Home', icon: 'home' },
		{ path: '/search', label: 'Search', icon: 'search' },
		{ path: '/artists', label: 'Artists', icon: 'artists' },
		{ path: '/albums', label: 'Albums', icon: 'albums' },
		{ path: '/songs', label: 'Songs', icon: 'songs' },
		{ path: '/playlists', label: 'Playlists', icon: 'playlists' },
		{ path: '/favorites', label: 'Favorites', icon: 'favorites' }
	];

	const links = $derived(navItems.map((item) => ({ ...item, href: `${base}${item.path}` })));

	const mobileMainLinks = $derived(
		links.filter((l) =>
			['/', '/albums', '/favorites'].includes(l.path)
		)
	);

	const mobileSearchLink = $derived(
		links.find((l) => l.path === '/search')!
	);

	function isActive(href: string, pathname: string): boolean {
		if (href === `${base}/`) return pathname === `${base}/` || pathname === base;
		return pathname.startsWith(href);
	}

	function getDisplayDomain(url: string): string {
		try {
			const hostname = new URL(url).hostname;
			const parts = hostname.split('.');
			return parts.length > 2 ? parts.slice(-2).join('.') : hostname;
		} catch {
			return url;
		}
	}

	const settingsActive = $derived($page.url.pathname.startsWith(`${base}/settings`));
</script>

{#if desktop}
	<!-- Desktop sidebar: positioned in flex layout, not fixed -->
	<nav class="hidden h-full w-56 flex-shrink-0 flex-col border-r border-border/50 bg-bg/80 backdrop-blur-2xl lg:flex" style="padding-top: env(titlebar-area-height, 0px);">
		<div class="flex items-center gap-2 px-5 py-5">
			<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
				<svg class="h-4 w-4 text-accent-text" viewBox="0 0 64 64" fill="currentColor">
					<path d="M44 20v18a8 8 0 1 1-4-6.93V24H28v16a8 8 0 1 1-4-6.93V20h20z" />
				</svg>
			</div>
			<span class="text-lg font-bold text-text">Gelatin</span>
		</div>

		<div class="flex-1 overflow-y-auto px-3 py-2">
			{#each links as link}
				{@const active = isActive(link.href, $page.url.pathname)}
				<a
					href={link.href}
					class="mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors {active ? 'bg-surface font-medium text-text' : 'text-text-muted hover:bg-surface-hover hover:text-text'}"
				>
					{#if link.icon === 'home'}
						<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
					{:else if link.icon === 'search'}
						<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
					{:else if link.icon === 'artists'}
						<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
					{:else if link.icon === 'albums'}
						<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/></svg>
					{:else if link.icon === 'songs'}
						<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
					{:else if link.icon === 'playlists'}
						<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/></svg>
					{:else if link.icon === 'favorites'}
						<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
					{/if}
					{link.label}
				</a>
			{/each}
		</div>

		{#if auth.current}
			<a
				href="{base}/settings"
				class="flex items-center gap-3 border-t border-border/50 px-4 py-3 transition-colors {settingsActive ? 'bg-surface/50' : 'hover:bg-surface-hover/50'}"
			>
				<div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
					<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
				</div>
				<div class="min-w-0">
					<p class="truncate text-sm font-medium text-text">{auth.current.username}</p>
					<p class="truncate text-xs text-text-muted">{getDisplayDomain(auth.current.serverUrl)}</p>
				</div>
			</a>
		{/if}
	</nav>
{/if}

{#if mobile}
	{@const searchActive = isActive(mobileSearchLink.href, $page.url.pathname)}
	<!-- Mobile bottom nav: two-pill layout (main + search) -->
	<div class="mobile-nav mx-4 mb-3 lg:hidden">
		<!-- Main pill: Home, Albums, Favorites -->
		<nav class="mobile-nav-main flex h-16 items-center rounded-full border border-text/[0.08] bg-bg/30 p-1.5 shadow-lg shadow-black/5 backdrop-blur-3xl dark:border-white/[0.08] dark:bg-bg/25">
			{#each mobileMainLinks as link}
				{@const active = isActive(link.href, $page.url.pathname)}
				<a
					href={link.href}
					class="flex flex-1 flex-col items-center gap-0.5 rounded-full py-2 text-[10px] font-medium transition-all {active ? 'bg-accent/15 text-accent' : 'text-text-muted/60'}"
				>
					{#if link.icon === 'home'}
						{#if active}
							<svg class="h-[22px] w-[22px]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3l9 8h-3v9h-5v-6h-2v6H6v-9H3l9-8z"/></svg>
						{:else}
							<svg class="h-[22px] w-[22px]" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M3 12l9-8 9 8"/><path d="M5 11v8a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-8"/></svg>
						{/if}
					{:else if link.icon === 'albums'}
						{#if active}
							<svg class="h-[22px] w-[22px]" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15"/><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>
						{:else}
							<svg class="h-[22px] w-[22px]" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
						{/if}
					{:else if link.icon === 'favorites'}
						{#if active}
							<svg class="h-[22px] w-[22px]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
						{:else}
							<svg class="h-[22px] w-[22px]" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
						{/if}
					{/if}
					<span>{link.label}</span>
				</a>
			{/each}
		</nav>

		<!-- Search pill: circle, same height as main pill -->
		<a
			href={mobileSearchLink.href}
			class="flex h-16 w-16 items-center justify-center rounded-full border border-text/[0.08] bg-bg/30 shadow-lg shadow-black/5 backdrop-blur-3xl transition-all dark:border-white/[0.08] dark:bg-bg/25 {searchActive ? 'bg-accent/15 text-accent' : 'text-text-muted/60'}"
		>
			{#if searchActive}
				<svg class="h-[22px] w-[22px]" viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6" fill="currentColor" opacity="0.15"/><circle cx="10.5" cy="10.5" r="6" fill="none" stroke="currentColor" stroke-width="2.2"/><line x1="15.5" y1="15.5" x2="21" y2="21" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>
			{:else}
				<svg class="h-[22px] w-[22px]" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6"/><line x1="15.5" y1="15.5" x2="21" y2="21" stroke-linecap="round"/></svg>
			{/if}
		</a>
	</div>
{/if}
