import eslint from '@eslint/js';
import * as tsParser from '@typescript-eslint/parser';
import solid from 'eslint-plugin-solid/configs/typescript';
import tseslint from 'typescript-eslint';

const filesPattern = 'src/**/*.{ts,tsx}';

const localRules = {
	'lucide-import-suffix': {
		meta: {
			type: 'problem',
			docs: {
				description: 'Require lucide-solid import names to end with Icon',
			},
			schema: [],
			messages: {
				invalidImportName:
					'Import "{{name}}" from "lucide-solid" must end with "Icon" (for example "GlobeIcon").',
			},
		},
		create(context) {
			return {
				ImportDeclaration(node) {
					if (node.source.value !== 'lucide-solid') return;

					for (const specifier of node.specifiers) {
						if (specifier.type !== 'ImportSpecifier') {
							context.report({
								node: specifier,
								messageId: 'invalidImportName',
								data: { name: specifier.local.name },
							});
							continue;
						}

						const importedName = specifier.imported.name;
						if (!importedName.endsWith('Icon')) {
							context.report({
								node: specifier.imported,
								messageId: 'invalidImportName',
								data: { name: importedName },
							});
						}
					}
				},
			};
		},
	},
};

export default tseslint.config(
	eslint.configs.recommended,
	tseslint.configs.recommended,
	{
		files: [filesPattern],
		...solid,
		plugins: {
			...solid.plugins,
			local: {
				rules: localRules,
			},
		},
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				project: 'tsconfig.json',
			},
		},
		rules: {
			...solid.rules,
			'local/lucide-import-suffix': 'error',
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
			'@typescript-eslint/no-deprecated': 'warn',
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
			'generate-favicons.mjs',
		],
	},
);
