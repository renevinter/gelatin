import { auth } from '$lib/stores/auth.svelte';
import { settings } from '$lib/stores/settings.svelte';

export interface LyricLine {
	start: number;
	text: string;
}

export type LyricsSource = 'jellyfin' | 'lrclib';

export interface LyricsData {
	lines: LyricLine[];
	source: LyricsSource;
}

export interface TrackMeta {
	artistName: string;
	name: string;
	albumName: string;
	duration: number;
}

async function getLyricsFromJellyfin(itemId: string): Promise<LyricsData | null> {
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
			})),
			source: 'jellyfin'
		};
	} catch {
		return null;
	}
}

function parseLrc(lrc: string): LyricLine[] {
	const lines: LyricLine[] = [];
	const regex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]\s*(.*)/;

	for (const raw of lrc.split('\n')) {
		const match = raw.match(regex);
		if (!match) continue;
		const minutes = parseInt(match[1], 10);
		const seconds = parseInt(match[2], 10);
		const ms = match[3].length === 2 ? parseInt(match[3], 10) * 10 : parseInt(match[3], 10);
		const text = match[4].trim();
		if (!text) continue;
		lines.push({ start: minutes * 60 + seconds + ms / 1000, text });
	}

	lines.sort((a, b) => a.start - b.start);
	return lines;
}

function extractSyncedLyrics(data: any): LyricsData | null {
	if (data?.syncedLyrics) {
		const lines = parseLrc(data.syncedLyrics);
		if (lines.length > 0) return { lines, source: 'lrclib' };
	}
	return null;
}

async function getLyricsFromLrclib(meta: TrackMeta): Promise<LyricsData | null> {
	try {
		// Try exact match first
		const exactParams = new URLSearchParams({
			artist_name: meta.artistName,
			track_name: meta.name,
			duration: String(Math.round(meta.duration))
		});
		if (meta.albumName && meta.albumName !== 'Unknown Album') {
			exactParams.set('album_name', meta.albumName);
		}

		const exactRes = await fetch(`https://lrclib.net/api/get?${exactParams}`);
		if (exactRes.ok) {
			const result = extractSyncedLyrics(await exactRes.json());
			if (result) return result;
		}

		// Fall back to fuzzy search
		const searchParams = new URLSearchParams({
			artist_name: meta.artistName,
			track_name: meta.name
		});

		const searchRes = await fetch(`https://lrclib.net/api/search?${searchParams}`);
		if (!searchRes.ok) return null;

		const results: any[] = await searchRes.json();
		const durSec = Math.round(meta.duration);

		for (const entry of results) {
			if (!entry.syncedLyrics) continue;
			// Accept results within 3 seconds of expected duration
			if (Math.abs(entry.duration - durSec) <= 3) {
				const parsed = extractSyncedLyrics(entry);
				if (parsed) return parsed;
			}
		}

		return null;
	} catch {
		return null;
	}
}

export async function getLyrics(itemId: string, meta?: TrackMeta): Promise<LyricsData | null> {
	const jellyfinResult = await getLyricsFromJellyfin(itemId);
	if (jellyfinResult) return jellyfinResult;

	if (settings.lyricsSource === 'jellyfin+lrclib' && meta) {
		return getLyricsFromLrclib(meta);
	}

	return null;
}
