import { renderHook } from '@testing-library/react-native'

import { useResolvedWikiLinks } from '../use-resolved-wiki-links'

const mockNotes = [{ path: 'repo::Target.md', title: 'Target', note: 'body' }]
const mockNotePaths = new Map([['repo::Target.md', '']])
const mockListMediaUris = jest.fn(() => new Map([
    ['pic.png', 'file:///pic.png'],
    ['song.mp3', 'file:///song.mp3'],
    ['big.mp4', 'file:///big.mp4'],
    ['doc.pdf', 'file:///doc.pdf']
]))

jest.mock('../use-notes', () => ({
    useNotes: () => ({ notes: mockNotes, notePaths: mockNotePaths })
}))
jest.mock('@/utils/media-size', () => ({
    isEmbeddableMedia: (name) => name !== 'big.mp4'
}))
jest.mock('../use-media-uris', () => ({
    useMediaUris: () => mockListMediaUris
}))

const setup = (value, selfPath = 'repo::Self.md', pdf = false) => renderHook(
    ({ text }) => useResolvedWikiLinks(text, selfPath, pdf),
    { initialProps: { text: value } }
)

describe('resolved wiki links', () => {
    beforeEach(() => {
        mockListMediaUris.mockClear()
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

        expect(mockListMediaUris).not.toHaveBeenCalled()
    })

    test('lists images only once for several embeds', async () => {
        await setup('![[pic.png]] and ![[pic.png]]')

        expect(mockListMediaUris).toHaveBeenCalledTimes(1)
    })

    test('turns an audio embed into a player', async () => {
        const { result } = await setup('![[song.mp3]]')

        expect(result.current).toBe('<audio controls preload="metadata" src="file:///song.mp3"></audio>')
    })

    test('falls back to a link for media above the size limit', async () => {
        const { result } = await setup('![[big.mp4]]')

        expect(result.current).not.toContain('<video')
    })

    test('keeps a pdf embed as a file link when the pdf preview is off', async () => {
        const { result } = await setup('![[doc.pdf]]')

        expect(result.current).toContain('class="file-link"')
        expect(result.current).not.toContain('data-pdf')
    })

    test('turns a pdf embed into a preview when the pdf preview is on', async () => {
        const { result } = await setup('![[doc.pdf#page=3]]', 'repo::Self.md', true)

        expect(result.current).toContain('data-pdf="file:///doc.pdf"')
        expect(result.current).toContain('data-page="3"')
    })

    test('keeps the same result for the same input', async () => {
        const { result, rerender } = await setup('see [[Target]]')
        const first = result.current

        await rerender({ text: 'see [[Target]]' })

        expect(result.current).toBe(first)
    })
})
