import { highlightFence, loadFenceLanguages } from '../preview-code-highlight'
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

const escapeHtml = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;')

describe('preview code highlight', () => {
    test('returns nothing until the language is loaded', () => {
        expect(highlightFence('const a = 1', 'js', escapeHtml)).toBe('')
    })

    test('loads fence languages once', async () => {
        expect(await loadFenceLanguages('```js\nx\n```')).toBe(true)
        expect(await loadFenceLanguages('```js\nx\n```')).toBe(false)
        expect(mockLoad).toHaveBeenCalledTimes(1)
    })

    test('ignores unknown languages', async () => {
        expect(await loadFenceLanguages('```nope\nx\n```')).toBe(false)
        expect(highlightFence('x', 'nope', escapeHtml)).toBe('')
    })

    test('wraps tokens in classed spans and escapes text', async () => {
        await loadFenceLanguages('```js\nx\n```')

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
