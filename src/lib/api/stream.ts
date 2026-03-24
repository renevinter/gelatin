import { auth } from '$lib/stores/auth.svelte';

export function getStreamUrl(itemId: string): string {
	const session = auth.current;
	if (!session) return '';
	const params = new URLSearchParams({
		static: 'true',
		api_key: session.token
	});
	return `${session.serverUrl}/Audio/${itemId}/stream?${params}`;
}
