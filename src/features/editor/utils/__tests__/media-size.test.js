import { isEmbeddableMedia } from '../media-size'

import { EMBED_MEDIA_MAX_BYTES } from '@/constants/embeds'

const mockSizes = new Map()

jest.mock('expo-file-system', () => ({
    File: class {
        constructor(uri) {
            this.uri = uri
        }

        get size() {
            const size = mockSizes.get(this.uri)
            if (size === undefined) throw new Error('missing')
            return size
        }
    }
}))

describe('embeddable media', () => {
    beforeEach(() => mockSizes.clear())

    test('always accepts images', () => {
        expect(isEmbeddableMedia('a.png', 'file:///a.png')).toBe(true)
    })

    test('accepts audio and video within the size limit', () => {
        mockSizes.set('file:///a.mp3', EMBED_MEDIA_MAX_BYTES)

        expect(isEmbeddableMedia('a.mp3', 'file:///a.mp3')).toBe(true)
    })

    test('rejects audio and video above the size limit', () => {
        mockSizes.set('file:///a.mp4', EMBED_MEDIA_MAX_BYTES + 1)

        expect(isEmbeddableMedia('a.mp4', 'file:///a.mp4')).toBe(false)
    })

    test('rejects media whose size cannot be read', () => {
        expect(isEmbeddableMedia('a.mp4', 'file:///gone.mp4')).toBe(false)
    })
})
