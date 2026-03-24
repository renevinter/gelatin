type ThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'gelatin-theme';

function getStoredTheme(): ThemeMode {
	if (typeof localStorage === 'undefined') return 'system';
	return (localStorage.getItem(STORAGE_KEY) as ThemeMode) ?? 'system';
}

function getSystemPrefersDark(): boolean {
	if (typeof window === 'undefined') return true;
	return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyTheme(mode: ThemeMode) {
	if (typeof document === 'undefined') return;
	const isDark = mode === 'dark' || (mode === 'system' && getSystemPrefersDark());
	document.documentElement.classList.toggle('dark', isDark);
	const meta = document.querySelector('meta[name="theme-color"]');
	if (meta) meta.setAttribute('content', isDark ? '#0f0f0f' : '#ffffff');
}

let mode = $state<ThemeMode>(getStoredTheme());

export const theme = {
	get mode() {
		return mode;
	},
	get isDark() {
		return mode === 'dark' || (mode === 'system' && getSystemPrefersDark());
	},
	set(newMode: ThemeMode) {
		mode = newMode;
		localStorage.setItem(STORAGE_KEY, newMode);
		applyTheme(newMode);
	},
	init() {
		applyTheme(mode);
		if (typeof window !== 'undefined') {
			window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
				if (mode === 'system') applyTheme('system');
			});
		}
	}
};
