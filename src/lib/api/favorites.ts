import { getUserLibraryApi } from '@jellyfin/sdk/lib/utils/api/user-library-api';
import { getItemsApi } from '@jellyfin/sdk/lib/utils/api/items-api';
import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models';
import { getApi } from './jellyfin';
import { auth } from '$lib/stores/auth.svelte';

export async function markFavorite(itemId: string) {
	const api = getApi();
	return getUserLibraryApi(api).markFavoriteItem({
		userId: auth.current!.userId,
		itemId
	});
}

export async function unmarkFavorite(itemId: string) {
	const api = getApi();
	return getUserLibraryApi(api).unmarkFavoriteItem({
		userId: auth.current!.userId,
		itemId
	});
}

export async function toggleFavorite(itemId: string, isFavorite: boolean) {
	if (isFavorite) {
		await unmarkFavorite(itemId);
	} else {
		await markFavorite(itemId);
	}
	return !isFavorite;
}

export async function getFavorites(
	type: 'Audio' | 'MusicAlbum' | 'MusicArtist' = 'Audio'
): Promise<BaseItemDto[]> {
	const api = getApi();
	const result = await getItemsApi(api).getItems({
		userId: auth.current!.userId,
		includeItemTypes: [type],
		filters: ['IsFavorite'],
		sortBy: ['SortName'],
		sortOrder: ['Ascending'],
		recursive: true,
		fields: ['MediaSources', 'ParentId', 'PrimaryImageAspectRatio'],
		enableImages: true
	});
	return result.data.Items ?? [];
}
