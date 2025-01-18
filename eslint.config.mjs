import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import solid from 'eslint-plugin-solid/configs/typescript';
import * as tsParser from '@typescript-eslint/parser';

const filesPattern = 'src/**/*.{ts,tsx}';

export default tseslint.config(
	eslint.configs.recommended,
	tseslint.configs.recommended,
	{
		files: [filesPattern],
		...solid,
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				project: 'tsconfig.json',
			},
		},
	},
	{
		files: [filesPattern],
		rules: {
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					args: 'all',
					argsIgnorePattern: '^_',
					caughtErrors: 'all',
					caughtErrorsIgnorePattern: '^_',
					destructuredArrayIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					ignoreRestSiblings: true,
				},
			],
			'@typescript-eslint/no-explicit-any': 'off',
		},
	},
	{
		ignores: [
			'node_modules',
			'.output',
			'.vinxi',
			'tailwind.config.cjs',
			'vitest.config.ts',
			'app.config.ts',
			'app.config.*.js',
			'postcss.config.cjs',
		],
	},
);
