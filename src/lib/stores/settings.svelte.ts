const STORAGE_KEY = 'gelatin-settings';

export type StreamQuality = 'original' | '320' | '256' | '128';
export type LyricsSource = 'jellyfin' | 'jellyfin+lrclib';

interface SettingsData {
	streamQualityWifi: StreamQuality;
	streamQualityCellular: StreamQuality;
	volumeNormalization: boolean;
	lyricsSource: LyricsSource;
}

const defaults: SettingsData = {
	streamQualityWifi: '320',
	streamQualityCellular: '320',
	volumeNormalization: true,
	lyricsSource: 'jellyfin+lrclib'
};

function load(): SettingsData {
	if (typeof localStorage === 'undefined') return { ...defaults };
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return { ...defaults };
		return { ...defaults, ...JSON.parse(raw) };
	} catch {
		return { ...defaults };
	}
}

function save(data: SettingsData) {
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
	}
}

let data = $state<SettingsData>(load());

export const settings = {
	get streamQualityWifi() {
		return data.streamQualityWifi;
	},
	set streamQualityWifi(v: StreamQuality) {
		data.streamQualityWifi = v;
		save(data);
	},
	get streamQualityCellular() {
		return data.streamQualityCellular;
	},
	set streamQualityCellular(v: StreamQuality) {
		data.streamQualityCellular = v;
		save(data);
	},
	get volumeNormalization() {
		return data.volumeNormalization;
	},
	set volumeNormalization(v: boolean) {
		data.volumeNormalization = v;
		save(data);
	},
	get lyricsSource() {
		return data.lyricsSource;
	},
	set lyricsSource(v: LyricsSource) {
		data.lyricsSource = v;
		save(data);
	}
};
