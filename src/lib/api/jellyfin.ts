import { Jellyfin } from '@jellyfin/sdk';
import { auth } from '$lib/stores/auth.svelte';

const CLIENT_NAME = 'Gelatin';
const CLIENT_VERSION = '0.1.0';

function getDeviceId(): string {
	if (typeof localStorage === 'undefined') return 'ssr';
	let id = localStorage.getItem('gelatin-device-id');
	if (!id) {
		id = crypto.randomUUID();
		localStorage.setItem('gelatin-device-id', id);
	}
	return id;
}

const jellyfin = new Jellyfin({
	clientInfo: { name: CLIENT_NAME, version: CLIENT_VERSION },
	deviceInfo: { name: navigator?.userAgent?.slice(0, 50) ?? 'Browser', id: getDeviceId() }
});

let apiInstance: ReturnType<typeof jellyfin.createApi> | null = null;

export function getApi() {
	const session = auth.current;
	if (!session) throw new Error('Not authenticated');
	if (!apiInstance || apiInstance.basePath !== session.serverUrl) {
		apiInstance = jellyfin.createApi(session.serverUrl, session.token);
	}
	return apiInstance;
}

export function getJellyfin() {
	return jellyfin;
}

export function createUnauthApi(serverUrl: string) {
	return jellyfin.createApi(serverUrl);
}

export function clearApi() {
	apiInstance = null;
}
