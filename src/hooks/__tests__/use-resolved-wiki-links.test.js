import { renderHook } from '@testing-library/react-native'

import { useResolvedWikiLinks } from '../use-resolved-wiki-links'

const mockNotes = [{ path: 'repo::Target.md', title: 'Target', note: 'body' }]
const mockNotePaths = new Map([['repo::Target.md', '']])
const mockListImageUris = jest.fn(() => new Map([['pic.png', 'file:///pic.png']]))

jest.mock('../use-notes', () => ({
    useNotes: () => ({ notes: mockNotes, notePaths: mockNotePaths })
}))
jest.mock('../use-image-uris', () => ({
    useImageUris: () => mockListImageUris
}))

const setup = (value, selfPath = 'repo::Self.md') => renderHook(
    ({ text }) => useResolvedWikiLinks(text, selfPath),
    { initialProps: { text: value } }
)

describe('resolved wiki links', () => {
    beforeEach(() => {
        mockListImageUris.mockClear()
    })

    test('returns text without links unchanged', async () => {
        const { result } = await setup('plain text')

        expect(result.current).toBe('plain text')
    })

    test('treats a missing value as empty text', async () => {
        const { result } = await setup(undefined)

        expect(result.current).toBe('')
    })

    test('turns a wiki link to an existing note into a markdown link', async () => {
        const { result } = await setup('see [[Target]]')

        expect(result.current).not.toContain('[[Target]]')
        expect(result.current).toContain('Target')
    })

    test('does not list images when the text has no embeds', async () => {
        await setup('see [[Target]]')

        expect(mockListImageUris).not.toHaveBeenCalled()
    })

    test('lists images only once for several embeds', async () => {
        await setup('![[pic.png]] and ![[pic.png]]')

        expect(mockListImageUris).toHaveBeenCalledTimes(1)
    })

    test('keeps the same result for the same input', async () => {
        const { result, rerender } = await setup('see [[Target]]')
        const first = result.current

        await rerender({ text: 'see [[Target]]' })

        expect(result.current).toBe(first)
    })
})
