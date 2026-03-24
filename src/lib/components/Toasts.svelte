<script lang="ts">
	import { toasts } from '$lib/stores/toast.svelte';
</script>

{#if toasts.items.length > 0}
	<div class="fixed right-4 top-4 z-[100] flex flex-col gap-2">
		{#each toasts.items as toast (toast.id)}
			<div
				class="flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg transition-all {
					toast.type === 'error'
						? 'bg-danger text-white'
						: toast.type === 'success'
							? 'bg-green-600 text-white'
							: 'bg-surface text-text border border-border'
				}"
			>
				<span class="text-sm">{toast.message}</span>
				<button
					onclick={() => toasts.dismiss(toast.id)}
					class="ml-2 opacity-70 hover:opacity-100"
					aria-label="Dismiss"
				>
					<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
						<path d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
		{/each}
	</div>
{/if}
