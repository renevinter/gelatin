import { getItemsApi } from '@jellyfin/sdk/lib/utils/api/items-api';
import { getPlaylistsApi } from '@jellyfin/sdk/lib/utils/api/playlists-api';
import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models';
import { getApi } from './jellyfin';
import { auth } from '$lib/stores/auth.svelte';

export async function getPlaylists(): Promise<BaseItemDto[]> {
	const api = getApi();
	const result = await getItemsApi(api).getItems({
		userId: auth.current!.userId,
		includeItemTypes: ['Playlist'],
		sortBy: ['SortName'],
		sortOrder: ['Ascending'],
		recursive: true,
		fields: ['PrimaryImageAspectRatio', 'ChildCount'],
		enableImages: true
	});
	return result.data.Items ?? [];
}

export async function getPlaylistItems(playlistId: string): Promise<BaseItemDto[]> {
	const api = getApi();
	const result = await getPlaylistsApi(api).getPlaylistItems({
		playlistId,
		userId: auth.current!.userId,
		fields: ['MediaSources', 'ParentId'],
		enableImages: true
	});
	return result.data.Items ?? [];
}

export async function createPlaylist(name: string, songIds: string[] = []) {
	const api = getApi();
	return getPlaylistsApi(api).createPlaylist({
		createPlaylistDto: {
			Name: name,
			Ids: songIds,
			UserId: auth.current!.userId,
			MediaType: 'Audio'
		}
	});
}

export async function addToPlaylist(playlistId: string, itemIds: string[]) {
	const api = getApi();
	return getPlaylistsApi(api).addItemToPlaylist({
		playlistId,
		ids: itemIds,
		userId: auth.current!.userId
	});
}

export async function removeFromPlaylist(playlistId: string, entryIds: string[]) {
	const api = getApi();
	return getPlaylistsApi(api).removeItemFromPlaylist({
		playlistId,
		entryIds
	});
}
