import { act, renderHook } from '@testing-library/react-native'

import {
    resolveUrl,
    useResolvedPreviewMarkdown
} from '../use-resolved-preview-markdown'
import { MAX_PREVIEW_IMAGE_CACHE } from '@/constants/image'

const mockBytes = jest.fn()

jest.mock('expo-file-system', () => ({
    File: class {
        constructor(uri) {
            this.uri = uri
            this.type = uri.endsWith('.png') ? 'image/png' : ''
        }

        bytes() {
            return mockBytes(this.uri)
        }
    }
}))

const flush = () => act(async () => {})

describe('resolve url', () => {
    beforeEach(() => {
        mockBytes.mockReset()
    })

    test('returns a data url using the file mime type', async () => {
        mockBytes.mockResolvedValue(new Uint8Array([77, 97, 110]))

        expect(await resolveUrl('file:///a.png')).toBe('data:image/png;base64,TWFu')
    })

    test('falls back to jpeg when the mime type is unknown', async () => {
        mockBytes.mockResolvedValue(new Uint8Array([77, 97, 110]))

        expect(await resolveUrl('file:///a.bin')).toBe('data:image/jpeg;base64,TWFu')
    })

    test('returns the original url when the file cannot be read', async () => {
        mockBytes.mockRejectedValue(new Error('gone'))

        expect(await resolveUrl('file:///a.png')).toBe('file:///a.png')
    })
})

describe('resolved preview markdown', () => {
    beforeEach(() => {
        mockBytes.mockReset()
        mockBytes.mockResolvedValue(new Uint8Array([77, 97, 110]))
    })

    test('keeps the value untouched when there are no local images', async () => {
        const { result } = await renderHook(() => useResolvedPreviewMarkdown('plain text'))

        expect(result.current.value).toBe('plain text')
        expect(result.current.mediaMap.size).toBe(0)
        expect(mockBytes).not.toHaveBeenCalled()
    })

    test('replaces local image urls with data urls', async () => {
        const { result } = await renderHook(() => (
            useResolvedPreviewMarkdown('![a](file:///a.png)')
        ))
        await flush()

        expect(result.current.value).toBe('![a](data:image/png;base64,TWFu)')
        expect(result.current.mediaMap.get('file:///a.png')).toBe('data:image/png;base64,TWFu')
    })

    test('reuses cached images when the value changes', async () => {
        const { rerender } = await renderHook(
            ({ value }) => useResolvedPreviewMarkdown(value),
            { initialProps: { value: '![a](file:///a.png)' } }
        )
        await flush()

        await rerender({ value: '![a](file:///a.png) more' })
        await flush()

        expect(mockBytes).toHaveBeenCalledTimes(1)
    })

    test('evicts the oldest cached images beyond the cache limit', async () => {
        const urls = Array.from(
            { length: MAX_PREVIEW_IMAGE_CACHE + 1 },
            (_, index) => `file:///${index}.png`
        )
        const markdown = urls.map((url) => `![x](${url})`).join('\n')
        const { rerender } = await renderHook(
            ({ value }) => useResolvedPreviewMarkdown(value),
            { initialProps: { value: markdown } }
        )
        await flush()
        mockBytes.mockClear()

        await rerender({ value: `${markdown}\n` })
        await flush()

        expect(mockBytes).toHaveBeenCalledTimes(1)
        expect(mockBytes).toHaveBeenCalledWith(urls[0])
    })
})
