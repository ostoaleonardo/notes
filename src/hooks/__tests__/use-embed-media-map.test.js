import { renderHook, waitFor } from '@testing-library/react-native'

import { useEmbedMediaMap } from '../use-embed-media-map'

const mockListMediaUris = jest.fn()

jest.mock('../use-media-uris', () => ({
    useMediaUris: () => mockListMediaUris
}))

jest.mock('../use-resolved-preview-markdown', () => ({
    resolveUrl: jest.fn(async (uri) => `data:${uri}`)
}))

const mockIsEmbeddable = jest.fn(() => true)

jest.mock('@/utils/media-size', () => ({
    isEmbeddableMedia: (...args) => mockIsEmbeddable(...args)
}))

jest.mock('@/utils/log-error', () => ({
    logError: jest.fn()
}))

const setup = (value, enabled = true, pdf = false) => renderHook(
    (props) => useEmbedMediaMap(props.value, props.enabled, props.pdf),
    { initialProps: { value, enabled, pdf } }
)

describe('embed media map', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockIsEmbeddable.mockReturnValue(true)
        mockListMediaUris.mockReturnValue(new Map([
            ['a.png', 'file:///a.png'],
            ['b.png', 'file:///b.png'],
            ['song.mp3', 'file:///song.mp3'],
            ['doc.pdf', 'file:///doc.pdf']
        ]))
    })

    test('is empty when disabled', async () => {
        const { result } = await setup('![[a.png]]', false)

        expect(result.current.size).toBe(0)
        expect(mockListMediaUris).not.toHaveBeenCalled()
    })

    test('is empty when the note embeds no media', async () => {
        const { result } = await setup('plain text')

        expect(result.current.size).toBe(0)
    })

    test('resolves the embedded images to data urls', async () => {
        const { result } = await setup('![[a.png]] and ![[b.png]]')

        await waitFor(() => expect(result.current.size).toBe(2))
        expect(result.current.get('a.png')).toBe('data:file:///a.png')
        expect(result.current.get('b.png')).toBe('data:file:///b.png')
    })

    test('maps images without a file to null', async () => {
        const { result } = await setup('![[missing.png]]')

        await waitFor(() => expect(result.current.has('missing.png')).toBe(true))
        expect(result.current.get('missing.png')).toBeNull()
    })

    test('resolves embedded audio to a data url', async () => {
        const { result } = await setup('![[song.mp3]]')

        await waitFor(() => expect(result.current.size).toBe(1))
        expect(result.current.get('song.mp3')).toBe('data:file:///song.mp3')
    })

    test('leaves pdf files out unless the pdf preview is on', async () => {
        const { result } = await setup('![[doc.pdf]]')

        expect(result.current.size).toBe(0)
        expect(mockListMediaUris).not.toHaveBeenCalled()
    })

    test('resolves pdf files to data urls when the pdf preview is on', async () => {
        const { result } = await setup('![[doc.pdf#page=2]]', true, true)

        await waitFor(() => expect(result.current.size).toBe(1))
        expect(result.current.get('doc.pdf')).toBe('data:file:///doc.pdf')
    })

    test('maps media that is too large to null', async () => {
        mockIsEmbeddable.mockReturnValue(false)

        const { result } = await setup('![[song.mp3]]')

        await waitFor(() => expect(result.current.has('song.mp3')).toBe(true))
        expect(result.current.get('song.mp3')).toBeNull()
    })

    test('does not list images again for names it already resolved', async () => {
        const { result, rerender } = await setup('![[a.png]]')

        await waitFor(() => expect(result.current.size).toBe(1))
        mockListMediaUris.mockClear()

        await rerender({ value: '![[a.png]] more text', enabled: true })
        await rerender({ value: '![[a.png]] ![[b.png]]', enabled: true })

        await waitFor(() => expect(result.current.size).toBe(2))
        expect(mockListMediaUris).toHaveBeenCalledTimes(1)
    })
})
