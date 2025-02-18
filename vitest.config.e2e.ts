import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		include: ['**/*.e2e-test.ts'],
		globals: true,
	},
	resolve: {
		alias: {
			'#app/mongoose': './src/lib/mongo/',
			'#app/mongoose/*': './src/lib/mongo/*',
			'#zod': './src/lib/zod/',
		},
	},
	plugins: [swc.vite()],
});
