export interface Track {
	id: string;
	name: string;
	artistName: string;
	albumName: string;
	albumId: string;
	imageItemId: string;
	duration: number;
	index?: number;
	isFavorite: boolean;
}

export type RepeatMode = 'off' | 'all' | 'one';
