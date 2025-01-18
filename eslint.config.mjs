import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import solid from 'eslint-plugin-solid/configs/typescript';
import * as tsParser from '@typescript-eslint/parser';

export default tseslint.config(
	eslint.configs.recommended, // Base ESLint recommended rules
	tseslint.configs.recommended, // TypeScript recommended rules
	{
		files: ['**/*.{ts,tsx}'],
		...solid, // Solid.js rules (with TypeScript support)
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				project: 'tsconfig.json', // Ensure this matches your TypeScript project config
			},
		},
	},
);
