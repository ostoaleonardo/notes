import { getAttachmentEntries, invalidateMediaIndex } from '../media-index'

const buildScan = () => jest.fn(async (uri) => [{ filename: 'photo.png', uri: `${uri}/photo.png`, folder: '' }])

describe('media index', () => {
    beforeEach(() => invalidateMediaIndex())

    test('scans the folder only once while it is cached', async () => {
        const scan = buildScan()

        await getAttachmentEntries('root', scan)
        const entries = await getAttachmentEntries('root', scan)

        expect(scan).toHaveBeenCalledTimes(1)
        expect(entries[0].uri).toBe('root/photo.png')
    })

    test('shares one scan between calls made while it is running', async () => {
        const scan = buildScan()

        await Promise.all([getAttachmentEntries('root', scan), getAttachmentEntries('root', scan)])

        expect(scan).toHaveBeenCalledTimes(1)
    })

    test('scans again after the index is invalidated', async () => {
        const scan = buildScan()

        await getAttachmentEntries('root', scan)
        invalidateMediaIndex()
        await getAttachmentEntries('root', scan)

        expect(scan).toHaveBeenCalledTimes(2)
    })

    test('scans again when the folder root changes', async () => {
        const scan = buildScan()

        await getAttachmentEntries('root', scan)
        await getAttachmentEntries('other', scan)

        expect(scan).toHaveBeenCalledTimes(2)
    })
})
