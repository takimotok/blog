module.exports = {
  extends: ['stylelint-config-standard-scss', 'stylelint-config-recess-order', 'stylelint-config-prettier'],
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
    // 'scss/dollar-variable-pattern': null,
    // 'scss/dollar-variable-empty-line-before': "never",
    'no-descending-specificity': null,
    'unit-no-unknown': [
      true,
      {
        ignoreFunctions: ['/^map\\..+/'],
      },
    ],
  },
}
