import { openDB, type IDBPDatabase } from 'idb';
import { auth } from '$lib/stores/auth.svelte';

const DB_NAME = 'gelatin-offline';
const STORE_NAME = 'audio';
const META_STORE = 'meta';
const DB_VERSION = 1;

interface OfflineMeta {
	id: string;
	name: string;
	artistName: string;
	albumName: string;
	albumId: string;
	duration: number;
	cachedAt: number;
	size: number;
}

let db: IDBPDatabase | null = null;

async function getDb(): Promise<IDBPDatabase> {
	if (db) return db;
	db = await openDB(DB_NAME, DB_VERSION, {
		upgrade(database) {
			if (!database.objectStoreNames.contains(STORE_NAME)) {
				database.createObjectStore(STORE_NAME);
			}
			if (!database.objectStoreNames.contains(META_STORE)) {
				database.createObjectStore(META_STORE);
			}
		}
	});
	return db;
}

let cachedIds = $state<Set<string>>(new Set());
let downloading = $state<Set<string>>(new Set());

export const offline = {
	get cachedIds() {
		return cachedIds;
	},
	get downloading() {
		return downloading;
	},
	isCached(id: string): boolean {
		return cachedIds.has(id);
	},
	isDownloading(id: string): boolean {
		return downloading.has(id);
	},

	async init() {
		try {
			const database = await getDb();
			const keys = await database.getAllKeys(META_STORE);
			cachedIds = new Set(keys.map(String));
		} catch {
			// IndexedDB not available
		}
	},

	async download(id: string, name: string, artistName: string, albumName: string, albumId: string, duration: number) {
		const session = auth.current;
		if (!session || downloading.has(id)) return;

		downloading = new Set([...downloading, id]);
		try {
			const url = `${session.serverUrl}/Audio/${id}/stream?static=true&api_key=${session.token}`;
			const response = await fetch(url);
			if (!response.ok) throw new Error('Download failed');

			const blob = await response.blob();
			const database = await getDb();

			await database.put(STORE_NAME, blob, id);
			await database.put(META_STORE, {
				id,
				name,
				artistName,
				albumName,
				albumId,
				duration,
				cachedAt: Date.now(),
				size: blob.size
			} satisfies OfflineMeta, id);

			cachedIds = new Set([...cachedIds, id]);
		} catch (err) {
			console.error('Failed to cache audio:', err);
		} finally {
			const next = new Set(downloading);
			next.delete(id);
			downloading = next;
		}
	},

	async remove(id: string) {
		try {
			const database = await getDb();
			await database.delete(STORE_NAME, id);
			await database.delete(META_STORE, id);
			const next = new Set(cachedIds);
			next.delete(id);
			cachedIds = next;
		} catch (err) {
			console.error('Failed to remove cached audio:', err);
		}
	},

	async getBlob(id: string): Promise<Blob | undefined> {
		const database = await getDb();
		return database.get(STORE_NAME, id);
	},

	async getMeta(id: string): Promise<OfflineMeta | undefined> {
		const database = await getDb();
		return database.get(META_STORE, id);
	},

	async getAllMeta(): Promise<OfflineMeta[]> {
		const database = await getDb();
		return database.getAll(META_STORE);
	},

	async clearAll() {
		const database = await getDb();
		await database.clear(STORE_NAME);
		await database.clear(META_STORE);
		cachedIds = new Set();
	}
};
