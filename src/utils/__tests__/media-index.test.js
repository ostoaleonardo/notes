import { getMediaIndex, invalidateMediaIndex } from '../media-index'

const entries = {
    root: [{ name: 'photo.png', uri: 'root/photo.png', isDirectory: false }]
}

const buildListEntries = () => jest.fn((uri) => entries[uri] ?? [])

describe('media index', () => {
    beforeEach(() => invalidateMediaIndex())

    test('scans the vault only once while it is cached', () => {
        const listEntries = buildListEntries()

        getMediaIndex('root', listEntries)
        const index = getMediaIndex('root', listEntries)

        expect(listEntries).toHaveBeenCalledTimes(1)
        expect(index.get('photo.png')).toBe('root/photo.png')
    })

    test('scans again after the index is invalidated', () => {
        const listEntries = buildListEntries()

        getMediaIndex('root', listEntries)
        invalidateMediaIndex()
        getMediaIndex('root', listEntries)

        expect(listEntries).toHaveBeenCalledTimes(2)
    })

    test('scans again when the vault root changes', () => {
        const listEntries = buildListEntries()

        getMediaIndex('root', listEntries)
        getMediaIndex('other', listEntries)

        expect(listEntries).toHaveBeenCalledTimes(2)
    })
})
