import { useContext } from 'react'
import { act, renderHook } from '@testing-library/react-native'

import { ImportContext, ImportProvider } from '../import-context'

const mockSaveNote = jest.fn(async () => ({ path: 'repo::Note.md', filename: 'Note.md' }))
const mockPush = jest.fn()

jest.mock('@react-native-async-storage/async-storage', () => ({
    default: {}
}))
jest.mock('expo-linking', () => ({
    getInitialURL: jest.fn(async () => null),
    addEventListener: jest.fn(() => ({ remove: jest.fn() }))
}))
jest.mock('expo-file-system', () => ({
    File: jest.fn().mockImplementation((url) => ({
        name: url.split('/').pop(),
        text: async () => global.__mockFileText
    }))
}))
jest.mock('expo-router', () => ({
    useRouter: () => ({ push: mockPush })
}))
jest.mock('../../hooks/use-notes', () => ({
    useNotes: () => ({ saveNote: mockSaveNote, loading: false })
}))
jest.mock('../../hooks/use-pro', () => ({
    usePro: () => ({ pro: true })
}))

const renderImportContext = () => renderHook(() => useContext(ImportContext), { wrapper: ImportProvider })

beforeEach(() => {
    jest.clearAllMocks()
})

describe('import file', () => {
    test('saves the file body as the note, with no tags, when it has no frontmatter', async () => {
        global.__mockFileText = 'Just a plain note'
        const { result } = await renderImportContext()

        await act(async () => {
            await result.current.importFile('content://picked/Note.md')
        })

        expect(mockSaveNote).toHaveBeenCalledWith(expect.objectContaining({
            note: 'Just a plain note',
            tags: []
        }))
    })

    test('strips frontmatter from the body and collects its tags', async () => {
        global.__mockFileText = '---\ntags:\n  - personal\n  - work\n---\n\nActual content'
        const { result } = await renderImportContext()

        await act(async () => {
            await result.current.importFile('content://picked/Note.md')
        })

        expect(mockSaveNote).toHaveBeenCalledWith(expect.objectContaining({
            note: 'Actual content',
            tags: ['personal', 'work']
        }))
    })

    test('derives the title from the file name when none is provided', async () => {
        global.__mockFileText = 'content'
        const { result } = await renderImportContext()

        await act(async () => {
            await result.current.importFile('content://picked/My Note.md')
        })

        expect(mockSaveNote).toHaveBeenCalledWith(expect.objectContaining({ title: 'My Note' }))
    })
})
