import { renderHook } from '@testing-library/react-native'

import { useWelcomeNote } from '../use-welcome-note'
import { parseFrontmatter } from '@/utils/frontmatter'
import { buildNotePath } from '@/utils/note-path'
import { STORAGE_KEYS } from '@/constants/storage-keys'
import { STORAGE_BOOLEAN } from '@/constants/storage-values'

const mockStorage = {
    getItem: jest.fn(),
    setItem: jest.fn()
}
const mockFileStorage = {
    listMarkdownFiles: jest.fn(),
    writeNoteFile: jest.fn()
}

jest.mock('../use-storage', () => ({
    useStorage: () => mockStorage
}))

jest.mock('../use-file-storage', () => ({
    useFileStorage: () => mockFileStorage
}))

jest.mock('@/utils/welcome-note', () => ({
    getWelcomeNote: () => ({ title: 'Welcome', content: 'Hello there' })
}))

const setup = () => renderHook(() => useWelcomeNote())

describe('seed welcome note', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockStorage.getItem.mockResolvedValue(null)
        mockFileStorage.listMarkdownFiles.mockReturnValue([])
    })

    test('writes the welcome note and returns its path', async () => {
        const { result } = await setup()

        const path = await result.current.seedWelcomeNote('file:///repo', 'r1')

        expect(path).toBe(buildNotePath('r1', 'Welcome.md'))

        const [uri, filename, content] = mockFileStorage.writeNoteFile.mock.calls[0]
        expect(uri).toBe('file:///repo')
        expect(filename).toBe('Welcome.md')
        expect(parseFrontmatter(content).body.trim()).toBe('Hello there')
    })

    test('marks the welcome note as created', async () => {
        const { result } = await setup()

        await result.current.seedWelcomeNote('file:///repo', 'r1')

        expect(mockStorage.setItem).toHaveBeenCalledWith(
            STORAGE_KEYS.WELCOME_NOTE_CREATED,
            STORAGE_BOOLEAN.TRUE
        )
    })

    test('does nothing when it was already created', async () => {
        mockStorage.getItem.mockResolvedValue(STORAGE_BOOLEAN.TRUE)
        const { result } = await setup()

        const path = await result.current.seedWelcomeNote('file:///repo', 'r1')

        expect(path).toBeNull()
        expect(mockFileStorage.writeNoteFile).not.toHaveBeenCalled()
    })

    test('picks a unique filename when the title is taken', async () => {
        mockFileStorage.listMarkdownFiles.mockReturnValue([{ name: 'Welcome.md' }])
        const { result } = await setup()

        const path = await result.current.seedWelcomeNote('file:///repo', 'r1')

        const filename = mockFileStorage.writeNoteFile.mock.calls[0][1]
        expect(filename).not.toBe('Welcome.md')
        expect(path).toBe(buildNotePath('r1', filename))
    })
})
