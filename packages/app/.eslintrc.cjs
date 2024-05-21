/** @type {import("eslint").Linter.Config} */
const config = {
    extends: ['../../.eslintrc.cjs', 'next/core-web-vitals'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: true,
    },
};

module.exports = config;
