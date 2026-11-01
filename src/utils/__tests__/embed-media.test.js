import { getEmbedMediaKind } from '../embed-media'

import { FILE_KINDS } from '@/constants/file-types'

describe('embed media kind', () => {
    test('recognizes images including avif', () => {
        expect(getEmbedMediaKind('a.PNG')).toBe(FILE_KINDS.IMAGE)
        expect(getEmbedMediaKind('a.avif')).toBe(FILE_KINDS.IMAGE)
    })

    test('recognizes audio files', () => {
        expect(getEmbedMediaKind('a.mp3')).toBe(FILE_KINDS.AUDIO)
        expect(getEmbedMediaKind('a.flac')).toBe(FILE_KINDS.AUDIO)
    })

    test('recognizes video files including webm', () => {
        expect(getEmbedMediaKind('a.mp4')).toBe(FILE_KINDS.VIDEO)
        expect(getEmbedMediaKind('a.webm')).toBe(FILE_KINDS.VIDEO)
    })

    test('ignores documents and notes', () => {
        expect(getEmbedMediaKind('a.pdf')).toBeNull()
        expect(getEmbedMediaKind('Note')).toBeNull()
    })
})
