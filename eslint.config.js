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

const REPOSITORY_ENGINE_PATH = {
    name: 'repository-fs',
    message: 'Use repositoryEngine from @/shared/utils/repository-engine: it is the only importer of the native module.'
}

const UI_APP_FOLDERS = [
    '@/shared/**',
    '@/features/**',
    '@/icons/**',
    '@/i18n/**',
    '@/translations/**'
]

const DOM_FORBIDDEN_PACKAGES = [
    'react-native',
    'react-i18next',
    'expo-router',
    'expo-file-system',
    'expo-sharing',
    'expo-image-picker',
    'expo-asset',
    'expo-font'
]

const DOM_FORBIDDEN_PATTERNS = [
    {
        group: [
            '@/features/*/native/**',
            '@/shared/hooks/**',
            '!@/shared/hooks/use-memo-by-deps',
            '@/shared/context/**',
            '@/shared/components/**'
        ],
        message: 'DOM and shared editor code run in the WebView: it cannot import app (React Native) code.'
    },
    {
        group: ['@/ui/*', '!@/ui/tokens'],
        message: 'DOM and shared editor code may only import ui/tokens.'
    }
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
        files: ['src/shared/constants/note-filename.js'],
        rules: { 'no-control-regex': 'off' }
    },
    {
        files: ['src/ui/**/*.js'],
        rules: {
            'no-restricted-imports': ['error', {
                paths: [REPOSITORY_ENGINE_PATH, ...UI_FORBIDDEN_PACKAGES.map((name) => ({
                    name,
                    message: 'src/ui must not depend on the app: pass data in through props.'
                }))],
                patterns: [{
                    group: UI_APP_FOLDERS,
                    message: 'src/ui must not import app code: pass data in through props or use ui/tokens.'
                }]
            }]
        }
    },
    {
        files: ['src/features/*/dom/**/*.js', 'src/features/*/shared/**/*.js', 'src/features/syntax/**/*.js'],
        ignores: ['**/__tests__/**', '**/__fixtures__/**', '**/__perf__/**', '**/dom-tests/**'],
        rules: {
            'no-restricted-imports': ['error', {
                paths: [REPOSITORY_ENGINE_PATH, ...DOM_FORBIDDEN_PACKAGES.map((name) => ({
                    name,
                    message: 'This code runs in the WebView: it cannot depend on React Native or Expo native modules.'
                }))],
                patterns: DOM_FORBIDDEN_PATTERNS
            }]
        }
    },
    {
        files: [
            'src/shared/**/*.js',
            'app/**/*.js',
            'src/features/!(editor)/**/*.js',
            'src/features/editor/native/**/*.js'
        ],
        ignores: ['src/shared/utils/repository-engine.js', '**/__tests__/**'],
        rules: {
            'no-restricted-imports': ['error', {
                paths: [REPOSITORY_ENGINE_PATH],
                patterns: [{
                    group: ['@/features/*/dom/**'],
                    message: 'WebView code is private to its feature: reach it through the feature native entry.'
                }]
            }]
        }
    },
    {
        files: ['widgets/**/*.js'],
        languageOptions: {
            globals: Object.fromEntries(['Spacer'].map((name) => [name, 'readonly']))
        }
    },
    {
        files: ['**/__tests__/**', '**/*.test.js', '**/__perf__/**', 'src/shared/hooks/__fixtures__/**'],
        languageOptions: { globals: globals.jest }
    }
]
