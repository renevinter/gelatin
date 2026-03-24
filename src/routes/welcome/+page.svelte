<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
</script>

<svelte:head>
	<title>Gelatin</title>
</svelte:head>

<div class="welcome-bg fixed inset-0 flex flex-col items-center justify-between px-6 py-12" style="padding-top: max(3rem, env(safe-area-inset-top, 3rem)); padding-bottom: max(3rem, env(safe-area-inset-bottom, 3rem));">
	<div></div>

	<div class="flex flex-col items-center">
		<div class="welcome-glass mb-8 flex h-28 w-28 items-center justify-center rounded-[2rem] shadow-lg backdrop-blur-xl">
			<div class="flex h-20 w-20 items-center justify-center rounded-[1.4rem] bg-accent shadow-md">
				<svg class="h-10 w-10 text-accent-text" viewBox="0 0 64 64" fill="currentColor">
					<path d="M44 20v18a8 8 0 1 1-4-6.93V24H28v16a8 8 0 1 1-4-6.93V20h20z" />
				</svg>
			</div>
		</div>

		<h1 class="text-3xl font-bold text-text">Welcome to Gelatin</h1>
		<p class="mt-2 text-center text-base text-text-muted">Enjoy your self-hosted music on Jellyfin.</p>
	</div>

	<div class="flex w-full max-w-sm flex-col items-center gap-4">
		<a
			href="https://jellyfin.org"
			target="_blank"
			rel="noopener noreferrer"
			class="text-sm font-medium text-text-muted underline underline-offset-2"
		>
			What is Jellyfin?
		</a>
		<button
			onclick={() => goto(`${base}/login`)}
			class="welcome-btn w-full rounded-xl px-4 py-3.5 text-base font-semibold transition-colors"
		>
			Continue
		</button>
	</div>
</div>

<style>
	.welcome-bg {
		background:
			radial-gradient(ellipse at 50% 30%, rgba(245, 158, 11, 0.2) 0%, transparent 55%),
			linear-gradient(to bottom, #fef3c7 0%, #fde6b3 25%, #f5ead8 50%, #ffffff 100%);
	}

	:global(.dark) .welcome-bg {
		background:
			radial-gradient(ellipse at 50% 30%, rgba(245, 158, 11, 0.1) 0%, transparent 50%),
			linear-gradient(to bottom, #1c1200 0%, #140e02 35%, #0f0f0f 100%);
	}

	.welcome-glass {
		background: rgba(255, 255, 255, 0.3);
	}

	:global(.dark) .welcome-glass {
		background: rgba(255, 255, 255, 0.08);
	}

	.welcome-btn {
		background-color: #111111;
		color: #ffffff;
	}

	.welcome-btn:hover {
		background-color: #222222;
	}

	:global(.dark) .welcome-btn {
		background-color: #ffffff;
		color: #111111;
	}

	:global(.dark) .welcome-btn:hover {
		background-color: #e5e5e5;
	}
</style>
