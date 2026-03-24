const STORAGE_KEY = 'gelatin-auth';

export interface AuthData {
	serverUrl: string;
	token: string;
	userId: string;
	username: string;
	serverId: string;
}

function loadAuth(): AuthData | null {
	if (typeof localStorage === 'undefined') return null;
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
}

let current = $state<AuthData | null>(loadAuth());

export const auth = {
	get current() {
		return current;
	},
	get isLoggedIn() {
		return current !== null;
	},
	login(data: AuthData) {
		current = data;
		localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
	},
	logout() {
		current = null;
		localStorage.removeItem(STORAGE_KEY);
	}
};
