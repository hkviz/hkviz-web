/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').options} */
const config = {
	trailingComma: 'all',
	tabWidth: 4,
	printWidth: 120,
	semi: true,
	singleQuote: true,
	plugins: ['prettier-plugin-tailwindcss'],
}

export default config
