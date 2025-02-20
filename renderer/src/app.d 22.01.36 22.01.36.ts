// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}

	}
	interface Window {
		services: {
			request: (options: {
				port: number;
				hostname: string;
				path: string;
			}) => Promise<any>;
			listener: {
				on: (key: string, listener: (payload: any) => void) => void;
				off: (key: string, listener: (payload: any) => void) => void;
			};
		};
	}
}

export {};
