import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vite';

const base = process.env.BASE_PATH || '';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		SvelteKitPWA({
			registerType: 'prompt',
			manifest: {
				name: 'Gelatin',
				short_name: 'Gelatin',
				description: 'A Jellyfin music player',
				theme_color: '#0f0f0f',
				background_color: '#0f0f0f',
				display: 'standalone',
				scope: `${base}/`,
				start_url: `${base}/`,
				icons: [
					{
						src: '/icon-192.png',
						sizes: '192x192',
						type: 'image/png'
					},
					{
						src: '/icon-512.png',
						sizes: '512x512',
						type: 'image/png'
					},
					{
						src: '/icon-512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable'
					}
				]
			},
			workbox: {
				globPatterns: ['**/*.{js,css,html,svg,png,woff,woff2}'],
				runtimeCaching: [
					{
						urlPattern: /\/Items\/.*\/Images\//,
						handler: 'CacheFirst',
						options: {
							cacheName: 'jellyfin-images',
							expiration: {
								maxEntries: 500,
								maxAgeSeconds: 60 * 60 * 24 * 30
							}
						}
					},
					{
						urlPattern: /\/Audio\//,
						handler: 'NetworkFirst',
						options: {
							cacheName: 'jellyfin-audio',
							expiration: {
								maxEntries: 50,
								maxAgeSeconds: 60 * 60 * 24 * 7
							}
						}
					}
				]
			}
		})
	]
});
