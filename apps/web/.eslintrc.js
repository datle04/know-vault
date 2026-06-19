/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: [
    '@knowvault/eslint-config',
    'next/core-web-vitals',
  ],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
};
