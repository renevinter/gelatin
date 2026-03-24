import { auth } from '$lib/stores/auth.svelte';

export function getImageUrl(
	itemId: string,
	imageType: 'Primary' | 'Backdrop' | 'Banner' | 'Logo' = 'Primary',
	options: { width?: number; height?: number; quality?: number } = {}
): string {
	const session = auth.current;
	if (!session) return '';
	const params = new URLSearchParams();
	if (options.width) params.set('maxWidth', String(options.width));
	if (options.height) params.set('maxHeight', String(options.height));
	params.set('quality', String(options.quality ?? 90));
	return `${session.serverUrl}/Items/${itemId}/Images/${imageType}?${params}`;
}

export function getArtistImageUrl(itemId: string, width = 300): string {
	return getImageUrl(itemId, 'Primary', { width });
}

export function getAlbumImageUrl(itemId: string, width = 300): string {
	return getImageUrl(itemId, 'Primary', { width });
}
