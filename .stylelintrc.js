module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-recess-order',
    'stylelint-prettier/recommended',
    'stylelint-config-prettier',
  ],
  plugins: ['stylelint-scss'],
  ignoreFiles: ['**/node_modules/**', '**/.next/**'],
  overrides: [
    {
      files: ['**/*.{css,scss}'],
      customSyntax: 'postcss-scss',
    },
  ],
  rules: {
    // stylelint-scss's recommended
    // cf.) https://github.com/stylelint-scss/stylelint-scss
    'at-rule-no-unknown': null,
    'scss/at-rule-no-unknown': true,
  },
}
