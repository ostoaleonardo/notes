import { act, renderHook } from '@testing-library/react-native'

import { useNoteSharing } from '../use-note-sharing'

const mockFiles = {
    exportFile: jest.fn(),
    shareFile: jest.fn()
}

jest.mock('../use-files', () => ({
    useFiles: () => mockFiles
}))

const setup = async () => {
    const flush = jest.fn(async () => { })
    const rendered = await renderHook(() => useNoteSharing({ id: 'repo::note.md', flush }))

    return { flush, ...rendered }
}

beforeEach(() => {
    jest.clearAllMocks()
})

describe('note sharing', () => {
    test('flushes pending edits before exporting', async () => {
        const { result, flush } = await setup()

        await act(async () => result.current.onConfirmExport('pdf'))

        expect(flush).toHaveBeenCalledTimes(1)
        expect(mockFiles.exportFile).toHaveBeenCalledWith('repo::note.md', 'pdf')
        expect(flush.mock.invocationCallOrder[0]).toBeLessThan(
            mockFiles.exportFile.mock.invocationCallOrder[0]
        )
    })

    test('flushes pending edits before sharing', async () => {
        const { result, flush } = await setup()

        await act(async () => result.current.onConfirmShare('md'))

        expect(flush).toHaveBeenCalledTimes(1)
        expect(mockFiles.shareFile).toHaveBeenCalledWith('repo::note.md', 'md')
        expect(flush.mock.invocationCallOrder[0]).toBeLessThan(
            mockFiles.shareFile.mock.invocationCallOrder[0]
        )
    })

    test('keeps the share and export dialogs independent', async () => {
        const { result } = await setup()

        await act(async () => result.current.exportDialog.onOpen())

        expect(result.current.exportDialog.visible).toBe(true)
        expect(result.current.shareDialog.visible).toBe(false)
    })
})
