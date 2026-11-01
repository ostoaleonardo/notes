const js = require('@eslint/js')
const globals = require('globals')
const react = require('eslint-plugin-react')
const reactHooks = require('eslint-plugin-react-hooks')

const UI_FORBIDDEN_PACKAGES = [
    'react-i18next',
    'expo-router',
    'expo-file-system',
    'expo-sharing',
    'expo-image-picker'
]

const UI_APP_FOLDERS = [
    '@/components/**',
    '@/screens/**',
    '@/context/**',
    '@/hooks/**',
    '@/utils/**',
    '@/constants/**',
    '@/icons/**',
    '@/i18n/**',
    '@/translations/**'
]

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
        files: ['src/ui/**/*.js'],
        rules: {
            'no-restricted-imports': ['error', {
                paths: UI_FORBIDDEN_PACKAGES.map((name) => ({
                    name,
                    message: 'src/ui must not depend on the app: pass data in through props.'
                })),
                patterns: [{
                    group: UI_APP_FOLDERS,
                    message: 'src/ui must not import app code: pass data in through props or use ui/tokens.'
                }]
            }]
        }
    },
    {
        files: ['**/__tests__/**', '**/*.test.js'],
        languageOptions: { globals: globals.jest }
    }
]
