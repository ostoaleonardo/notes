import { resolveEmbedMedia } from '../embed-media-resolver'

const URIS = new Map([
    ['pic.png', 'file:///pic.png'],
    ['song.mp3', 'file:///song.mp3'],
    ['big.mp4', 'file:///big.mp4'],
    ['doc.pdf', 'file:///doc.pdf']
])

jest.mock('../media-size', () => ({
    isEmbeddableMedia: (name) => name !== 'big.mp4'
}))

const setup = () => {
    const listMediaUris = jest.fn(async () => URIS)
    const resolveUrl = jest.fn(async (uri) => `data:${uri}`)
    const cache = new Map()

    return { listMediaUris, resolveUrl, cache }
}

describe('resolve embed media', () => {
    test('maps each name to its resolved url', async () => {
        const deps = setup()

        const result = await resolveEmbedMedia({ names: ['pic.png', 'song.mp3'], pdf: false, ...deps })

        expect(result).toEqual({
            'pic.png': 'data:file:///pic.png',
            'song.mp3': 'data:file:///song.mp3'
        })
    })

    test('answers null for unknown files and media above the size limit', async () => {
        const deps = setup()

        const result = await resolveEmbedMedia({ names: ['nope.png', 'big.mp4'], pdf: false, ...deps })

        expect(result).toEqual({ 'nope.png': null, 'big.mp4': null })
    })

    test('answers null for pdfs unless the pdf preview is on', async () => {
        const deps = setup()

        const off = await resolveEmbedMedia({ names: ['doc.pdf'], pdf: false, ...deps })
        const on = await resolveEmbedMedia({ names: ['doc.pdf'], pdf: true, ...deps })

        expect(off).toEqual({ 'doc.pdf': null })
        expect(on).toEqual({ 'doc.pdf': 'data:file:///doc.pdf' })
    })

    test('lists and converts each file only once', async () => {
        const deps = setup()

        await resolveEmbedMedia({ names: ['pic.png'], pdf: false, ...deps })
        await resolveEmbedMedia({ names: ['pic.png'], pdf: false, ...deps })

        expect(deps.listMediaUris).toHaveBeenCalledTimes(1)
        expect(deps.resolveUrl).toHaveBeenCalledTimes(1)
    })
})
