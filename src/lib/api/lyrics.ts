import { auth } from '$lib/stores/auth.svelte';

export interface LyricLine {
	start: number;
	text: string;
}

export interface LyricsData {
	lines: LyricLine[];
}

export async function getLyrics(itemId: string): Promise<LyricsData | null> {
	const session = auth.current;
	if (!session) return null;

	try {
		const response = await fetch(`${session.serverUrl}/Audio/${itemId}/Lyrics`, {
			headers: {
				Authorization: `MediaBrowser Token="${session.token}"`
			}
		});

		if (!response.ok) return null;

		const data = await response.json();
		if (!data?.Lyrics?.length) return null;

		return {
			lines: data.Lyrics.map((l: { Start: number; Text: string }) => ({
				start: l.Start / 10_000_000,
				text: l.Text
			}))
		};
	} catch {
		return null;
	}
}
