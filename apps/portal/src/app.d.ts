// See https://kit.svelte.dev/docs/types#app

// and what to do when importing types
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			refreshToken?: string
			accessToken?: string
			revalidate: boolean
		}
		// interface PageData {}
		// interface Platform {}
	}
}

export { };

