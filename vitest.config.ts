import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		coverage: {
			reporter: ['text', 'lcov', 'clover'],
			provider: 'v8',
		},
		root: './src',
		exclude: ['node_modules', 'lib/mongo/zod/*.test.ts'],
	},
	plugins: [
		swc.vite({
			module: { type: 'es6' },
		}),
	],
});
