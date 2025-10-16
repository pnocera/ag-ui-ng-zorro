module.exports = {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  bracketSpacing: true,
  arrowParens: 'avoid',
  endOfLine: 'lf',
  quoteProps: 'as-needed',
  bracketSameLine: false,
  overrides: [
    {
      files: '*.{json,md}',
      options: {
        printWidth: 80,
        tabWidth: 2,
      },
    },
    {
      files: '*.scss',
      options: {
        printWidth: 100,
        singleQuote: false,
        tabWidth: 2,
      },
    },
    {
      files: '*.html',
      options: {
        printWidth: 120,
        tabWidth: 2,
        singleQuote: false,
      },
    },
  ],
};