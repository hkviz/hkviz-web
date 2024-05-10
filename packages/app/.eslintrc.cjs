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
    },
};

module.exports = config;
