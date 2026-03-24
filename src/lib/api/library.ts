import { getItemsApi } from '@jellyfin/sdk/lib/utils/api/items-api';
import { getArtistsApi } from '@jellyfin/sdk/lib/utils/api/artists-api';
import { getUserLibraryApi } from '@jellyfin/sdk/lib/utils/api/user-library-api';
import { getSuggestionsApi } from '@jellyfin/sdk/lib/utils/api/suggestions-api';
import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models';
import { getApi } from './jellyfin';
import { auth } from '$lib/stores/auth.svelte';

function userId() {
	return auth.current!.userId;
}

export async function getLatestAlbums(limit = 20): Promise<BaseItemDto[]> {
	const api = getApi();
	const result = await getUserLibraryApi(api).getLatestMedia({
		userId: userId(),
		includeItemTypes: ['MusicAlbum'],
		limit,
		fields: ['PrimaryImageAspectRatio', 'ParentId'],
		enableImages: true
	});
	return result.data;
}

export async function getSuggestions(limit = 20): Promise<BaseItemDto[]> {
	const api = getApi();
	const result = await getSuggestionsApi(api).getSuggestions({
		userId: userId(),
		mediaType: ['Audio'],
		limit,
		type: ['Audio']
	});
	return result.data.Items ?? [];
}

export async function getAlbumArtists(
	startIndex = 0,
	limit = 50,
	searchTerm?: string
): Promise<{ items: BaseItemDto[]; totalCount: number }> {
	const api = getApi();
	const result = await getArtistsApi(api).getAlbumArtists({
		userId: userId(),
		startIndex,
		limit,
		searchTerm,
		sortBy: ['SortName'],
		sortOrder: ['Ascending'],
		fields: ['PrimaryImageAspectRatio', 'SortName'],
		enableImages: true,
		enableTotalRecordCount: true
	});
	return {
		items: result.data.Items ?? [],
		totalCount: result.data.TotalRecordCount ?? 0
	};
}

export async function getArtistDetails(artistId: string): Promise<BaseItemDto> {
	const api = getApi();
	const result = await getUserLibraryApi(api).getItem({
		userId: userId(),
		itemId: artistId
	});
	return result.data;
}

export async function getArtistAlbums(artistId: string): Promise<BaseItemDto[]> {
	const api = getApi();
	const result = await getItemsApi(api).getItems({
		userId: userId(),
		albumArtistIds: [artistId],
		includeItemTypes: ['MusicAlbum'],
		sortBy: ['ProductionYear', 'SortName'],
		sortOrder: ['Descending', 'Ascending'],
		recursive: true,
		fields: ['PrimaryImageAspectRatio', 'ParentId'],
		enableImages: true
	});
	return result.data.Items ?? [];
}

export async function getAlbums(
	startIndex = 0,
	limit = 50,
	sortBy = 'SortName',
	sortOrder: 'Ascending' | 'Descending' = 'Ascending'
): Promise<{ items: BaseItemDto[]; totalCount: number }> {
	const api = getApi();
	const result = await getItemsApi(api).getItems({
		userId: userId(),
		includeItemTypes: ['MusicAlbum'],
		startIndex,
		limit,
		sortBy: [sortBy],
		sortOrder: [sortOrder],
		recursive: true,
		fields: ['PrimaryImageAspectRatio', 'ParentId'],
		enableImages: true,
		enableTotalRecordCount: true
	});
	return {
		items: result.data.Items ?? [],
		totalCount: result.data.TotalRecordCount ?? 0
	};
}

export async function getAlbumDetails(albumId: string): Promise<BaseItemDto> {
	const api = getApi();
	const result = await getUserLibraryApi(api).getItem({
		userId: userId(),
		itemId: albumId
	});
	return result.data;
}

export async function getAlbumTracks(albumId: string): Promise<BaseItemDto[]> {
	const api = getApi();
	const result = await getItemsApi(api).getItems({
		userId: userId(),
		parentId: albumId,
		sortBy: ['IndexNumber'],
		sortOrder: ['Ascending'],
		fields: ['MediaSources', 'ParentId'],
		enableImages: true
	});
	return result.data.Items ?? [];
}

export async function getAllSongs(
	startIndex = 0,
	limit = 100,
	sortBy = 'SortName'
): Promise<{ items: BaseItemDto[]; totalCount: number }> {
	const api = getApi();
	const result = await getItemsApi(api).getItems({
		userId: userId(),
		includeItemTypes: ['Audio'],
		startIndex,
		limit,
		sortBy: [sortBy],
		sortOrder: ['Ascending'],
		recursive: true,
		fields: ['MediaSources', 'ParentId'],
		enableImages: true,
		enableTotalRecordCount: true
	});
	return {
		items: result.data.Items ?? [],
		totalCount: result.data.TotalRecordCount ?? 0
	};
}
