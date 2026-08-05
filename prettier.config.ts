import { type Config } from 'prettier'

const config: Config = {
  plugins: [
    'prettier-plugin-tailwindcss',
    '@trivago/prettier-plugin-sort-imports',
  ],
  semi: false,
  singleQuote: true,
  trailingComma: 'all',
  tailwindStylesheet: 'app/globals.css',
  tailwindFunctions: ['cn', 'cva'],
  importOrder: [
    'server-only',
    '\.css$',
    '<THIRD_PARTY_MODULES>',
    '^@/(.*)$',
    '^[./]',
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
}

export default config
