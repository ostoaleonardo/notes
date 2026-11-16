import { parseEmbedMedia } from '../embed-media'

import { FILE_KINDS } from '@/constants/file-types'

describe('parse embed media', () => {
    test('recognizes images including avif', () => {
        expect(parseEmbedMedia('a.PNG').kind).toBe(FILE_KINDS.IMAGE)
        expect(parseEmbedMedia('a.avif').kind).toBe(FILE_KINDS.IMAGE)
    })

    test('recognizes audio files', () => {
        expect(parseEmbedMedia('a.mp3').kind).toBe(FILE_KINDS.AUDIO)
        expect(parseEmbedMedia('a.flac').kind).toBe(FILE_KINDS.AUDIO)
    })

    test('recognizes video files including webm', () => {
        expect(parseEmbedMedia('a.mp4').kind).toBe(FILE_KINDS.VIDEO)
        expect(parseEmbedMedia('a.webm').kind).toBe(FILE_KINDS.VIDEO)
    })

    test('recognizes pdf files', () => {
        expect(parseEmbedMedia('a.pdf').kind).toBe(FILE_KINDS.PDF)
    })

    test('ignores notes and plain text files', () => {
        expect(parseEmbedMedia('Note').kind).toBeNull()
        expect(parseEmbedMedia('a.txt').kind).toBeNull()
    })

    test('keeps the file name without the anchor', () => {
        expect(parseEmbedMedia('doc.pdf#page=3').name).toBe('doc.pdf')
    })

    test('reads the page of a pdf anchor', () => {
        expect(parseEmbedMedia('doc.pdf#page=3').page).toBe(3)
    })

    test('defaults to the first page', () => {
        expect(parseEmbedMedia('doc.pdf').page).toBe(1)
        expect(parseEmbedMedia('doc.pdf#page=0').page).toBe(1)
        expect(parseEmbedMedia('doc.pdf#height=300').page).toBe(1)
    })

    test('has no page for other media', () => {
        expect(parseEmbedMedia('a.png').page).toBeNull()
    })
})
