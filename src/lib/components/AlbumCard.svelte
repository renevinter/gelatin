<script lang="ts">
	import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models';
	import { getAlbumImageUrl } from '$lib/api/images';

	interface Props {
		album: BaseItemDto;
		onclick?: () => void;
	}

	let { album, onclick }: Props = $props();
</script>

<button
	class="group w-full text-left"
	{onclick}
>
	<div class="aspect-square w-full overflow-hidden rounded-lg bg-surface transition-transform group-hover:scale-[1.02]">
		{#if album.ImageTags?.Primary || album.Id}
			<img
				src={getAlbumImageUrl(album.Id!, 300)}
				alt={album.Name ?? ''}
				class="h-full w-full object-cover"
				loading="lazy"
			/>
		{:else}
			<div class="flex h-full w-full items-center justify-center text-text-muted">
				<svg class="h-12 w-12" fill="currentColor" viewBox="0 0 24 24">
					<path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
				</svg>
			</div>
		{/if}
	</div>
	<p class="mt-2 truncate text-sm font-medium text-text">{album.Name}</p>
	<p class="truncate text-xs text-text-muted">{album.AlbumArtist ?? album.Artists?.join(', ') ?? ''}</p>
</button>
