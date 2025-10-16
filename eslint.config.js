import typescriptParser from '@typescript-eslint/parser';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import importPlugin from 'eslint-plugin-import';

export default [
  {
    ignores: ['dist/**/*', 'node_modules/**/*']
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: ['./tsconfig.base.json', './packages/**/tsconfig.json'],
        createDefaultProgram: true
      },
      globals: {
        console: 'readonly',
        process: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': typescriptPlugin,
      'import': importPlugin
    },
    rules: {
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            // Core library should not depend on UI libraries
            {
              target: './packages/ag-ui-workspace/projects/ag-ui/core/src',
              from: [
                './packages/ag-ui-workspace/projects/ag-ui/ng-zorro/src',
                './packages/ag-ui-workspace/projects/ag-ui/theming/src'
              ]
            },
            // Theming library should be independent
            {
              target: './packages/ag-ui-workspace/projects/ag-ui/theming/src', 
              from: [
                './packages/ag-ui-workspace/projects/ag-ui/core/src',
                './packages/ag-ui-workspace/projects/ag-ui/ng-zorro/src'
              ]
            },
            // Schematics should only depend on external libraries
            {
              target: './packages/ag-ui-workspace/projects/ag-ui/schematics/src',
              from: [
                './packages/ag-ui-workspace/projects/ag-ui/core/src',
                './packages/ag-ui-workspace/projects/ag-ui/ng-zorro/src',
                './packages/ag-ui-workspace/projects/ag-ui/theming/src'
              ]
            }
          ]
        }
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'error',
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external', 
            'internal',
            'parent',
            'sibling',
            'index'
          ],
          'newlines-between': 'always'
        }
      ]
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: [
            './tsconfig.base.json',
            './packages/**/tsconfig.json'
          ]
        }
      }
    }
  }
];