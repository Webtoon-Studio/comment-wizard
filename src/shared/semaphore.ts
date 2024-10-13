export class Semaphore {
	private permits: number;
	private queue: (() => void)[] = [];

	constructor(permits: number) {
		this.permits = permits;
	}

	async acquire() {
		if (this.permits > 0) {
			this.permits--;
			return;
		}
		await new Promise<void>((resolve) => this.queue.push(resolve));
	}

	release() {
		this.permits++;
		const next = this.queue.shift();
		if (next) {
			next();
		}
	}
}
