const js = require('@eslint/js')
const globals = require('globals')
const react = require('eslint-plugin-react')
const reactHooks = require('eslint-plugin-react-hooks')

module.exports = [
    js.configs.recommended,
    { ignores: ['dist/*', 'android/*', 'ios/*', '.expo/*'] },
    {
        plugins: { react, 'react-hooks': reactHooks },
        rules: {
            'react/jsx-uses-vars': 'error',
            'react-hooks/exhaustive-deps': 'warn',
            'no-unused-vars': ['error', { ignoreRestSiblings: true }]
        },
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            parserOptions: { ecmaFeatures: { jsx: true } },
            globals: { ...globals.browser, ...globals.node, __DEV__: 'readonly' }
        }
    },
    {
        files: ['src/constants/note-filename.js'],
        rules: { 'no-control-regex': 'off' }
    },
    {
        files: ['**/__tests__/**', '**/*.test.js'],
        languageOptions: { globals: globals.jest }
    }
]
