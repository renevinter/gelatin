<script lang="ts">
	import { page } from '$app/stores';
	import { base } from '$app/paths';
	import { auth } from '$lib/stores/auth.svelte';

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

	const mobileLinks = $derived(
		links.filter((l) =>
			['/', '/search', '/albums', '/favorites'].includes(l.path)
		)
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

<!-- Desktop sidebar -->
<nav class="fixed left-0 top-0 z-30 hidden h-full w-56 flex-col border-r border-border bg-bg lg:flex" style="padding-top: env(titlebar-area-height, 0px);">
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
			class="flex items-center gap-3 border-t border-border px-4 py-3 transition-colors {settingsActive ? 'bg-surface' : 'hover:bg-surface-hover'}"
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

<!-- Mobile bottom nav -->
<nav class="fixed bottom-0 left-0 right-0 z-30 flex border-t border-border bg-bg lg:hidden" style="padding-bottom: env(safe-area-inset-bottom);">
	{#each mobileLinks as link}
		{@const active = isActive(link.href, $page.url.pathname)}
		<a
			href={link.href}
			class="flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] transition-colors {active ? 'text-accent' : 'text-text-muted'}"
		>
			{#if link.icon === 'home'}
				<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
			{:else if link.icon === 'search'}
				<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
			{:else if link.icon === 'albums'}
				<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/></svg>
			{:else if link.icon === 'favorites'}
				<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
			{/if}
			<span>{link.label}</span>
		</a>
	{/each}
</nav>
