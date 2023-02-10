import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';
import svg from '@poppanator/sveltekit-svg'

const config: UserConfig = {
	plugins: [sveltekit(), svg()],
	optimizeDeps: {
		exclude: ['@apollo/client', 'ts-invariant'],
	},
	ssr: {
		noExternal: ['@apollo/client', 'ts-invariant'],
	},
};

export default config;
