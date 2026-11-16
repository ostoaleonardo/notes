import { findPendingFenceLanguages, highlightFence } from '../preview-code-highlight'
import { buildSyntaxColors } from '../syntax-colors'

const mockLoad = jest.fn()

jest.mock('../code-languages', () => {
    const { LanguageDescription: Description } = require('@codemirror/language')
    const { javascript: lang } = require('@codemirror/lang-javascript')
    const description = Description.of({
        name: 'JavaScript',
        alias: ['js'],
        load: async () => {
            mockLoad()
            return lang()
        }
    })

    return {
        findCodeLanguage: (info) => (info === 'js' ? description : null)
    }
})

const loadLanguages = (text) => Promise.all(findPendingFenceLanguages(text).map((language) => language.load()))

const escapeHtml = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;')

describe('preview code highlight', () => {
    test('returns nothing until the language is loaded', () => {
        expect(highlightFence('const a = 1', 'js', escapeHtml)).toBe('')
    })

    test('lists only the languages that need loading', async () => {
        expect(findPendingFenceLanguages('```js\nx\n```')).toHaveLength(1)
        expect(findPendingFenceLanguages('```nope\nx\n```')).toHaveLength(0)
    })

    test('stops listing a language once it is loaded', async () => {
        await loadLanguages('```js\nx\n```')

        expect(findPendingFenceLanguages('```js\nx\n```')).toHaveLength(0)
        expect(mockLoad).toHaveBeenCalledTimes(1)
    })

    test('ignores unknown languages', async () => {
        expect(findPendingFenceLanguages('```nope\nx\n```')).toHaveLength(0)
        expect(highlightFence('x', 'nope', escapeHtml)).toBe('')
    })

    test('wraps tokens in classed spans and escapes text', async () => {
        await loadLanguages('```js\nx\n```')

        const html = highlightFence('const a = "<b>"', 'js', escapeHtml)

        expect(html).toContain('<span class="tok-keyword">const</span>')
        expect(html).toContain('&lt;b>')
    })
})

describe('syntax colors', () => {
    test('picks the palette by theme and mutes comments', () => {
        const dark = buildSyntaxColors({ colors: { onBackground: '#ffffff' }, dark: true })
        const light = buildSyntaxColors({ colors: { onBackground: '#000000' }, dark: false })

        expect(dark.keyword).not.toBe(light.keyword)
        expect(dark.comment.startsWith('#ffffff')).toBe(true)
    })
})
