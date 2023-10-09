/** @type {import("eslint").Linter.Config} */
const config = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['no-only-tests', 'unicorn'],
  extends: [
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked',
    'prettier',
  ],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    tsconfigRootDir: __dirname,
    project: ['./example/tsconfig.json', './tsconfig.json'],
  },
  rules: {
    '@typescript-eslint/no-non-null-assertion': 'error',

    '@typescript-eslint/consistent-indexed-object-style': 'off',
    '@typescript-eslint/consistent-type-definitions': 'off',
    '@typescript-eslint/no-empty-interface': 'off',

    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',

    'no-only-tests/no-only-tests': 'error',
    'unicorn/filename-case': 'error',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'typeParameter',
        format: ['PascalCase'],
        leadingUnderscore: 'allow',
        custom: {
          regex: '^(T|\\$)[A-Z][a-zA-Z]+[0-9]*$',
          match: true,
        },
      },
    ],
    'max-params': ['error', 3],
  },
  overrides: [
    {
      files: ['example/**/*'],
      rules: {
        '@typescript-eslint/naming-convention': 'off',
      },
    },
  ],
};

module.exports = config;