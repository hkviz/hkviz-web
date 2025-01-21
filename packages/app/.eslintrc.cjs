/** @type {import("eslint").Linter.Config} */
const config = {
    extends: ['../../.eslintrc.cjs', 'next/core-web-vitals'],
    rules: {
        'react-hooks/exhaustive-deps': [
            'warn',
            {
                additionalHooks: 'useDependableEffect',
            },
        ],
        '@typescript-eslint/require-await': 'off',
    },
};

module.exports = config;
