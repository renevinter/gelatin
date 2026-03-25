import type { Track, RepeatMode } from '$lib/types';
import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models';
import { getStreamUrl } from '$lib/api/stream';
import { getImageUrl } from '$lib/api/images';
import { settings } from '$lib/stores/settings.svelte';

let audio: HTMLAudioElement | null = null;
let audioContext: AudioContext | null = null;
let gainNode: GainNode | null = null;
let sourceNode: MediaElementAudioSourceNode | null = null;

function dBToLinear(db: number): number {
	return Math.pow(10, db / 20);
}

function getAudio(): HTMLAudioElement {
	if (!audio && typeof window !== 'undefined') {
		audio = new Audio();
		audio.addEventListener('timeupdate', () => {
			currentTime = audio!.currentTime;
		});
		audio.addEventListener('durationchange', () => {
			duration = audio!.duration || 0;
		});
		audio.addEventListener('ended', () => {
			handleTrackEnd();
		});
		audio.addEventListener('play', () => {
			isPlaying = true;
		});
		audio.addEventListener('pause', () => {
			isPlaying = false;
		});
		audio.addEventListener('loadedmetadata', () => {
			duration = audio!.duration || 0;
		});
	}
	return audio!;
}

function ensureAudioPipeline() {
	if (audioContext || !audio) return;
	try {
		audio.crossOrigin = 'anonymous';
		const ctx = new AudioContext();
		const src = ctx.createMediaElementSource(audio);
		const gain = ctx.createGain();
		src.connect(gain);
		gain.connect(ctx.destination);
		audioContext = ctx;
		sourceNode = src;
		gainNode = gain;
		if (ctx.state === 'suspended') ctx.resume();
	} catch {
		audioContext = null;
		sourceNode = null;
		gainNode = null;
	}
}

function teardownAudioPipeline() {
	if (sourceNode) {
		try { sourceNode.disconnect(); } catch { /* already disconnected */ }
	}
	if (gainNode) {
		try { gainNode.disconnect(); } catch { /* already disconnected */ }
	}
	if (audioContext) {
		audioContext.close();
	}
	audioContext = null;
	sourceNode = null;
	gainNode = null;
	if (audio) audio.crossOrigin = null;
}

function resumeAudioContext() {
	if (audioContext?.state === 'suspended') {
		audioContext.resume();
	}
}

function applyNormalizationGain(track: Track) {
	const needsPipeline = settings.volumeNormalization && track.normalizationGain != null;

	if (needsPipeline) {
		ensureAudioPipeline();
		if (gainNode) {
			gainNode.gain.value = dBToLinear(track.normalizationGain!);
		}
	} else {
		if (audioContext) teardownAudioPipeline();
	}
}

let queue = $state<Track[]>([]);
let queueIndex = $state(-1);
let isPlaying = $state(false);
let currentTime = $state(0);
let duration = $state(0);
let volume = $state(1);
let shuffle = $state(false);
let repeat = $state<RepeatMode>('off');
let showQueue = $state(false);
let showNowPlaying = $state(false);
let showLyrics = $state(typeof localStorage !== 'undefined' && localStorage.getItem('gelatin-show-lyrics') === 'true');

function handleTrackEnd() {
	if (repeat === 'one') {
		const a = getAudio();
		a.currentTime = 0;
		a.play();
		return;
	}
	if (queueIndex < queue.length - 1) {
		player.next();
	} else if (repeat === 'all' && queue.length > 0) {
		player.playIndex(0);
	} else {
		isPlaying = false;
	}
}

function loadTrack(track: Track) {
	const a = getAudio();
	applyNormalizationGain(track);
	a.src = getStreamUrl(track.id);
	a.volume = volume;
	currentTime = 0;
	duration = 0;
	updateMediaSession(track);
}

function updateMediaSession(track: Track) {
	if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
	navigator.mediaSession.metadata = new MediaMetadata({
		title: track.name,
		artist: track.artistName,
		album: track.albumName,
		artwork: [
			{ src: getImageUrl(track.imageItemId, 'Primary', { width: 96 }), sizes: '96x96' },
			{ src: getImageUrl(track.imageItemId, 'Primary', { width: 256 }), sizes: '256x256' },
			{ src: getImageUrl(track.imageItemId, 'Primary', { width: 512 }), sizes: '512x512' }
		]
	});
	navigator.mediaSession.setActionHandler('play', () => player.play());
	navigator.mediaSession.setActionHandler('pause', () => player.pause());
	navigator.mediaSession.setActionHandler('previoustrack', () => player.previous());
	navigator.mediaSession.setActionHandler('nexttrack', () => player.next());
	navigator.mediaSession.setActionHandler('seekto', (d) => {
		if (d.seekTime !== undefined) player.seek(d.seekTime);
	});
}

export function itemToTrack(item: BaseItemDto): Track {
	let normGain: number | undefined;
	const gain = (item as any).NormalizationGain;
	if (typeof gain === 'number') {
		normGain = gain;
	}

	return {
		id: item.Id!,
		name: item.Name ?? 'Unknown',
		artistName: item.Artists?.join(', ') ?? item.AlbumArtist ?? 'Unknown Artist',
		albumName: item.Album ?? 'Unknown Album',
		albumId: item.AlbumId ?? item.ParentId ?? item.Id!,
		imageItemId: item.Id!,
		duration: (item.RunTimeTicks ?? 0) / 10_000_000,
		index: item.IndexNumber ?? undefined,
		isFavorite: item.UserData?.IsFavorite ?? false,
		normalizationGain: normGain
	};
}

export const player = {
	get queue() {
		return queue;
	},
	get queueIndex() {
		return queueIndex;
	},
	get currentTrack(): Track | null {
		return queueIndex >= 0 && queueIndex < queue.length ? queue[queueIndex] : null;
	},
	get isPlaying() {
		return isPlaying;
	},
	get currentTime() {
		return currentTime;
	},
	get duration() {
		return duration;
	},
	get volume() {
		return volume;
	},
	get shuffle() {
		return shuffle;
	},
	get repeat() {
		return repeat;
	},
	get showQueue() {
		return showQueue;
	},
	set showQueue(v: boolean) {
		showQueue = v;
	},
	get showNowPlaying() {
		return showNowPlaying;
	},
	set showNowPlaying(v: boolean) {
		showNowPlaying = v;
	},
	get showLyrics() {
		return showLyrics;
	},
	set showLyrics(v: boolean) {
		showLyrics = v;
		localStorage.setItem('gelatin-show-lyrics', String(v));
	},

	play() {
		resumeAudioContext();
		getAudio().play();
	},
	pause() {
		getAudio().pause();
	},
	toggle() {
		if (isPlaying) this.pause();
		else this.play();
	},
	seek(time: number) {
		const a = getAudio();
		a.currentTime = Math.max(0, Math.min(time, a.duration || 0));
	},
	setVolume(v: number) {
		volume = Math.max(0, Math.min(1, v));
		const a = getAudio();
		a.volume = volume;
	},

	playIndex(index: number) {
		if (index < 0 || index >= queue.length) return;
		queueIndex = index;
		loadTrack(queue[index]);
		resumeAudioContext();
		getAudio().play();
	},
	next() {
		if (queue.length === 0) return;
		if (shuffle) {
			const next = Math.floor(Math.random() * queue.length);
			this.playIndex(next);
		} else if (queueIndex < queue.length - 1) {
			this.playIndex(queueIndex + 1);
		} else if (repeat === 'all') {
			this.playIndex(0);
		}
	},
	previous() {
		if (currentTime > 3) {
			this.seek(0);
			return;
		}
		if (queueIndex > 0) {
			this.playIndex(queueIndex - 1);
		} else if (repeat === 'all') {
			this.playIndex(queue.length - 1);
		}
	},

	playTracks(tracks: Track[], startIndex = 0) {
		queue = [...tracks];
		this.playIndex(startIndex);
	},
	addToQueue(track: Track) {
		queue = [...queue, track];
		if (queue.length === 1) this.playIndex(0);
	},
	addNext(track: Track) {
		const insertAt = queueIndex + 1;
		queue = [...queue.slice(0, insertAt), track, ...queue.slice(insertAt)];
	},
	removeFromQueue(index: number) {
		if (index < 0 || index >= queue.length) return;
		queue = queue.filter((_, i) => i !== index);
		if (index < queueIndex) {
			queueIndex--;
		} else if (index === queueIndex) {
			if (queue.length === 0) {
				queueIndex = -1;
				getAudio().src = '';
			} else {
				const newIndex = Math.min(queueIndex, queue.length - 1);
				this.playIndex(newIndex);
			}
		}
	},
	clearQueue() {
		queue = [];
		queueIndex = -1;
		getAudio().pause();
		getAudio().src = '';
		currentTime = 0;
		duration = 0;
	},

	toggleShuffle() {
		shuffle = !shuffle;
	},
	cycleRepeat() {
		const modes: RepeatMode[] = ['off', 'all', 'one'];
		const i = modes.indexOf(repeat);
		repeat = modes[(i + 1) % modes.length];
	}
};
