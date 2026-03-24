export interface Toast {
	id: string;
	message: string;
	type: 'info' | 'error' | 'success';
}

let items = $state<Toast[]>([]);
let counter = 0;

export const toasts = {
	get items() {
		return items;
	},
	add(message: string, type: Toast['type'] = 'info', duration = 4000) {
		const id = String(++counter);
		items = [...items, { id, message, type }];
		setTimeout(() => {
			items = items.filter((t) => t.id !== id);
		}, duration);
	},
	info(message: string) {
		this.add(message, 'info');
	},
	error(message: string) {
		this.add(message, 'error', 6000);
	},
	success(message: string) {
		this.add(message, 'success');
	},
	dismiss(id: string) {
		items = items.filter((t) => t.id !== id);
	}
};
