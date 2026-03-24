import { getUserApi } from '@jellyfin/sdk/lib/utils/api/user-api';
import { createUnauthApi, clearApi } from './jellyfin';
import { auth } from '$lib/stores/auth.svelte';

export async function login(serverUrl: string, username: string, password: string) {
	const url = serverUrl.replace(/\/+$/, '');
	const api = createUnauthApi(url);
	const userApi = getUserApi(api);

	const result = await userApi.authenticateUserByName({
		authenticateUserByName: { Username: username, Pw: password }
	});

	const data = result.data;
	if (!data.AccessToken || !data.User?.Id || !data.ServerId) {
		throw new Error('Authentication failed: incomplete response');
	}

	auth.login({
		serverUrl: url,
		token: data.AccessToken,
		userId: data.User.Id,
		username: data.User.Name ?? username,
		serverId: data.ServerId
	});
}

export function logout() {
	auth.logout();
	clearApi();
}
