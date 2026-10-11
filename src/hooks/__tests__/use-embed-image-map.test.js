import { renderHook, waitFor } from '@testing-library/react-native'

import { useEmbedImageMap } from '../use-embed-image-map'

const mockListImageUris = jest.fn()

jest.mock('../use-image-uris', () => ({
    useImageUris: () => mockListImageUris
}))

jest.mock('../use-resolved-preview-markdown', () => ({
    resolveUrl: jest.fn(async (uri) => `data:${uri}`)
}))

jest.mock('@/utils/log-error', () => ({
    logError: jest.fn()
}))

const setup = (value, enabled = true) => renderHook(
    (props) => useEmbedImageMap(props.value, props.enabled),
    { initialProps: { value, enabled } }
)

describe('embed image map', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockListImageUris.mockReturnValue(new Map([
            ['a.png', 'file:///a.png'],
            ['b.png', 'file:///b.png']
        ]))
    })

    test('is empty when disabled', async () => {
        const { result } = await setup('![[a.png]]', false)

        expect(result.current.size).toBe(0)
        expect(mockListImageUris).not.toHaveBeenCalled()
    })

    test('is empty when the note embeds no images', async () => {
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

    test('does not list images again for names it already resolved', async () => {
        const { result, rerender } = await setup('![[a.png]]')

        await waitFor(() => expect(result.current.size).toBe(1))
        mockListImageUris.mockClear()

        await rerender({ value: '![[a.png]] more text', enabled: true })
        await rerender({ value: '![[a.png]] ![[b.png]]', enabled: true })

        await waitFor(() => expect(result.current.size).toBe(2))
        expect(mockListImageUris).toHaveBeenCalledTimes(1)
    })
})
