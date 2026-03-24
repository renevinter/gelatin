import { getItemsApi } from '@jellyfin/sdk/lib/utils/api/items-api';
import { getArtistsApi } from '@jellyfin/sdk/lib/utils/api/artists-api';
import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models';
import { getApi } from './jellyfin';
import { auth } from '$lib/stores/auth.svelte';

export interface SearchResults {
	artists: BaseItemDto[];
	albums: BaseItemDto[];
	songs: BaseItemDto[];
}

export async function search(query: string, limit = 20): Promise<SearchResults> {
	if (!query.trim()) return { artists: [], albums: [], songs: [] };

	const api = getApi();
	const uid = auth.current!.userId;

	const [artists, albums, songs] = await Promise.all([
		getArtistsApi(api)
			.getAlbumArtists({
				userId: uid,
				searchTerm: query,
				limit,
				fields: ['PrimaryImageAspectRatio'],
				enableImages: true
			})
			.then((r) => r.data.Items ?? []),
		getItemsApi(api)
			.getItems({
				userId: uid,
				searchTerm: query,
				includeItemTypes: ['MusicAlbum'],
				limit,
				recursive: true,
				fields: ['PrimaryImageAspectRatio', 'ParentId'],
				enableImages: true
			})
			.then((r) => r.data.Items ?? []),
		getItemsApi(api)
			.getItems({
				userId: uid,
				searchTerm: query,
				includeItemTypes: ['Audio'],
				limit,
				recursive: true,
				fields: ['MediaSources', 'ParentId'],
				enableImages: true
			})
			.then((r) => r.data.Items ?? [])
	]);

	return { artists, albums, songs };
}
