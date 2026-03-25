import { auth } from '$lib/stores/auth.svelte';
import { settings, type StreamQuality } from '$lib/stores/settings.svelte';

function getActiveQuality(): StreamQuality {
	const conn = (navigator as any).connection;
	if (conn?.type === 'cellular' || conn?.effectiveType === '2g' || conn?.effectiveType === '3g') {
		return settings.streamQualityCellular;
	}
	return settings.streamQualityWifi;
}

const bitrateMap: Record<string, number> = {
	'320': 320000,
	'256': 256000,
	'128': 128000
};

export function getStreamUrl(itemId: string): string {
	const session = auth.current;
	if (!session) return '';

	const quality = getActiveQuality();

	if (quality === 'original') {
		const params = new URLSearchParams({
			static: 'true',
			api_key: session.token
		});
		return `${session.serverUrl}/Audio/${itemId}/stream?${params}`;
	}

	const params = new URLSearchParams({
		userId: session.userId,
		deviceId: 'gelatin-web',
		api_key: session.token,
		container: 'mp4,opus,mp3|mp3,aac,m4a|aac,m4b|aac,flac,webma|webma,webm|webma,wav,ogg',
		transcodingContainer: 'mp4',
		transcodingProtocol: 'http',
		audioCodec: 'aac',
		maxStreamingBitrate: String(bitrateMap[quality]),
		startTimeTicks: '0',
		enableRedirection: 'true',
		enableRemoteMedia: 'false'
	});

	return `${session.serverUrl}/Audio/${itemId}/universal?${params}`;
}
