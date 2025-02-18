import eslintNestJs from '@darraghor/eslint-plugin-nestjs-typed';
import common from 'eslint-config-mahir/common';
import node from 'eslint-config-mahir/node';
import typescript from 'eslint-config-mahir/typescript';

/**
 * @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray}
 */
export default [
	...common,
	...node,
	...typescript,
	{
		plugins: {
			'@darraghor/nestjs-typed': eslintNestJs.plugin,
		},
		languageOptions: {
			parserOptions: {
				project: false,
				projectService: true,
				sourceType: 'module',
				emitDecoratorMetadata: true,
			},
		},
		rules: {
			'no-console': [
				'error',
				{
					allow: ['error', 'info', 'warn'],
				},
			],
			'@typescript-eslint/explicit-member-accessibility': 'off',
			'@darraghor/nestjs-typed/sort-module-metadata-arrays': 'error',
			'@typescript-eslint/member-ordering': 'off',
			'require-atomic-updates': 'off',
		},
	},
	{
		ignores: ['node_modules/', '.github', '.yarn', '**/dist'],
	},
];
