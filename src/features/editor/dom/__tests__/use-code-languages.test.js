import { renderHook, waitFor } from '@testing-library/react-native'

import { useCodeLanguages } from '../hooks/use-code-languages'

const JS_FENCE = '```js\nx\n```'

jest.mock('../syntax-highlighting/code-languages', () => {
    const { LanguageDescription: Description } = require('@codemirror/language')
    const { javascript: lang } = require('@codemirror/lang-javascript')
    const description = Description.of({
        name: 'JavaScript',
        alias: ['js'],
        load: async () => lang()
    })

    return {
        findCodeLanguage: (info) => (info === 'js' ? description : null)
    }
})

describe('code languages readiness', () => {
    test('is ready right away when the text has no fences', async () => {
        const { result } = await renderHook(() => useCodeLanguages('plain text'))

        expect(result.current).toBe(true)
    })

    test('is ready right away when there is no text', async () => {
        const { result } = await renderHook(() => useCodeLanguages(''))

        expect(result.current).toBe(true)
    })

    test('becomes ready once the fence languages are loaded', async () => {
        const { result } = await renderHook(() => useCodeLanguages(JS_FENCE))

        await waitFor(() => expect(result.current).toBe(true))
    })

    test('is ready right away once the language is loaded', async () => {
        const { result: first } = await renderHook(() => useCodeLanguages(JS_FENCE))
        await waitFor(() => expect(first.current).toBe(true))

        const { result } = await renderHook(() => useCodeLanguages(JS_FENCE))

        expect(result.current).toBe(true)
    })
})
