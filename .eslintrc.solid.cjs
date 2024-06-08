/** @type {import("eslint").Linter.Config} */
const config = {
    plugins: ['solid'],
    extends: ['./.eslintrc.cjs', 'plugin:solid/typescript'],
    rules: {},
};

module.exports = config;
