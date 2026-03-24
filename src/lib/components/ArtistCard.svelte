<script lang="ts">
	import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models';
	import { getArtistImageUrl } from '$lib/api/images';

	interface Props {
		artist: BaseItemDto;
		onclick?: () => void;
	}

	let { artist, onclick }: Props = $props();
</script>

<button
	class="group w-full text-center"
	{onclick}
>
	<div class="mx-auto aspect-square w-full overflow-hidden rounded-full bg-surface transition-transform group-hover:scale-[1.02]">
		{#if artist.ImageTags?.Primary}
			<img
				src={getArtistImageUrl(artist.Id!, 200)}
				alt={artist.Name ?? ''}
				class="h-full w-full object-cover"
				loading="lazy"
			/>
		{:else}
			<div class="flex h-full w-full items-center justify-center text-text-muted">
				<svg class="h-10 w-10" fill="currentColor" viewBox="0 0 24 24">
					<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
				</svg>
			</div>
		{/if}
	</div>
	<p class="mt-2 truncate text-sm font-medium text-text">{artist.Name}</p>
</button>
