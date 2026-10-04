import { renderHook } from '@testing-library/react-native'
import { Directory, Paths } from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import * as Print from 'expo-print'

import { useFiles } from '../use-files'
import { showSnackbar } from '@/components/snackbar/snackbar-host'
import { EXPORT_FORMATS } from '@/constants/export'

const mockNote = {
    path: 'repo::Note.md',
    title: 'Note',
    note: 'Body',
    tags: ['a'],
    properties: {}
}

const mockWritten = []
const mockExisting = []

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key })
}))
jest.mock('expo-sharing', () => ({
    shareAsync: jest.fn()
}))
jest.mock('expo-print', () => ({
    printToFileAsync: jest.fn()
}))
jest.mock('expo-file-system', () => {
    class MockFile {
        constructor(uri) {
            this.uri = uri
            this.name = uri.split('/').pop()
        }

        async bytes() {
            return new Uint8Array([1, 2, 3])
        }
    }

    const createDirectory = (uri) => ({
        uri,
        list: () => mockExisting.map((name) => new MockFile(`${uri}/${name}`)),
        createFile: (name, type) => {
            const file = new MockFile(`${uri}/${name}`)
            file.write = (data) => mockWritten.push({ name, type, data })
            return file
        }
    })

    return {
        File: MockFile,
        Directory: { pickDirectoryAsync: jest.fn() },
        Paths: { cache: createDirectory('file:///cache') },
        __createDirectory: createDirectory
    }
})
jest.mock('@/components/snackbar/snackbar-host', () => ({
    showSnackbar: jest.fn()
}))
jest.mock('@/utils/log-error', () => ({
    logError: jest.fn()
}))
jest.mock('@/utils/export-html', () => ({
    getExportMarkdown: jest.fn(() => ''),
    getNoteAsHtml: jest.fn(() => '<html>note</html>')
}))
jest.mock('../use-notes', () => ({
    useNotes: () => ({
        getNote: () => mockNote,
        notes: [mockNote],
        notePaths: new Map()
    })
}))
jest.mock('../use-image-uris', () => ({
    useImageUris: () => () => new Map()
}))
jest.mock('../use-resolved-preview-markdown', () => ({
    resolveUrl: jest.fn()
}))

const setup = async () => {
    const { result } = await renderHook(() => useFiles())
    return result.current
}

beforeEach(() => {
    jest.clearAllMocks()
    mockWritten.length = 0
    mockExisting.length = 0
    Directory.pickDirectoryAsync.mockResolvedValue(
        require('expo-file-system').__createDirectory('file:///picked')
    )
})

describe('export file', () => {
    test('writes the markdown with frontmatter into the picked directory', async () => {
        const { exportFile } = await setup()

        await exportFile(mockNote.path)

        expect(mockWritten).toEqual([{
            name: 'Note.md',
            type: 'text/markdown',
            data: '---\ntags:\n  - a\n---\n\nBody'
        }])
        expect(showSnackbar).toHaveBeenCalledWith('message.notes.exported')
    })

    test('exports the note as html', async () => {
        const { exportFile } = await setup()

        await exportFile(mockNote.path, EXPORT_FORMATS.HTML)

        expect(mockWritten).toEqual([{
            name: 'Note.html',
            type: 'text/html',
            data: '<html>note</html>'
        }])
    })

    test('exports the note as a pdf printed from its html', async () => {
        Print.printToFileAsync.mockResolvedValue({ uri: 'file:///cache/print.pdf' })
        const { exportFile } = await setup()

        await exportFile(mockNote.path, EXPORT_FORMATS.PDF)

        expect(Print.printToFileAsync).toHaveBeenCalledWith({ html: '<html>note</html>' })
        expect(mockWritten[0]).toMatchObject({
            name: 'Note.pdf',
            type: 'application/pdf',
            data: new Uint8Array([1, 2, 3])
        })
    })

    test('picks a unique filename when the directory already has one', async () => {
        mockExisting.push('Note.md')
        const { exportFile } = await setup()

        await exportFile(mockNote.path)

        expect(mockWritten[0].name).not.toBe('Note.md')
    })

    test('stays silent when the directory picker is cancelled', async () => {
        Directory.pickDirectoryAsync.mockRejectedValue({ code: 'ERR_PICKER_CANCELLED' })
        const { exportFile } = await setup()

        await exportFile(mockNote.path)

        expect(showSnackbar).not.toHaveBeenCalled()
        expect(mockWritten).toEqual([])
    })

    test('reports a failed export', async () => {
        Directory.pickDirectoryAsync.mockRejectedValue(new Error('denied'))
        const { exportFile } = await setup()

        await exportFile(mockNote.path)

        expect(showSnackbar).toHaveBeenCalledWith('message.notes.export_failed')
    })
})

describe('share file', () => {
    test('writes the file to the cache and opens the share sheet', async () => {
        const { shareFile } = await setup()

        await shareFile(mockNote.path)

        expect(mockWritten[0].name).toBe('Note.md')
        expect(Sharing.shareAsync).toHaveBeenCalledWith(
            'file:///cache/Note.md',
            { mimeType: 'text/markdown' }
        )
        expect(Paths.cache).toBeDefined()
    })

    test('reports a failed share', async () => {
        Sharing.shareAsync.mockRejectedValue(new Error('no app'))
        const { shareFile } = await setup()

        await shareFile(mockNote.path)

        expect(showSnackbar).toHaveBeenCalledWith('message.notes.share_failed')
    })
})
