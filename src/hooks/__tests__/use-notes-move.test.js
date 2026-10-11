import { useMemo, useState } from 'react'
import { act, renderHook } from '@testing-library/react-native'

import { useNotes } from '../use-notes'
import { NoteContext } from '@/context/note-context'
import { parseFrontmatter } from '@/utils/frontmatter'

const REPOSITORIES = [
    { id: 'root', uri: 'file:///root', alias: 'Root' },
    { id: 'child', uri: 'file:///root/Child', alias: 'Child', parentId: 'root' }
]

const mockFileStorage = {
    listMarkdownFiles: jest.fn(),
    writeNoteFile: jest.fn(),
    findFile: jest.fn(),
    getExistingFile: jest.fn(),
    moveNoteFiles: jest.fn(),
    renameVersions: jest.fn(async () => {})
}

jest.mock('@react-native-async-storage/async-storage', () => ({
    default: {}
}))
jest.mock('../use-file-storage', () => ({
    useFileStorage: () => mockFileStorage
}))
jest.mock('../use-storage', () => ({
    useStorage: () => ({ getItem: jest.fn() })
}))
jest.mock('../use-repository-data', () => ({
    useRepositoryData: () => async () => ({ notes: [], tags: [] })
}))
jest.mock('../use-repositories', () => ({
    useRepositories: () => ({
        activeRepository: REPOSITORIES[0],
        repositories: REPOSITORIES,
        getRootRepository: (repository) => repository
    })
}))

const IDEA = {
    path: 'root::Idea.md',
    filename: 'Idea.md',
    title: 'Idea',
    note: 'body',
    tags: [],
    repositoryId: 'root',
    createdAt: 1,
    updatedAt: 2
}
const TWIN = { ...IDEA, path: 'child::Idea.md', repositoryId: 'child', note: '' }
const INDEX = {
    path: 'root::Index.md',
    filename: 'Index.md',
    title: 'Index',
    note: 'See [[Idea]]',
    tags: [],
    repositoryId: 'root',
    fileUri: 'file:///root/Index.md',
    updatedAt: 5
}

const renderNotesHook = (initialNotes, notePaths) => {
    const Wrapper = ({ children }) => {
        const [notes, setNotes] = useState(initialNotes)
        const notesByPath = useMemo(() => new Map(notes.map((note) => [note.path, note])), [notes])

        return (
            <NoteContext.Provider
                value={{
                    notes,
                    notesByPath,
                    notePaths,
                    setNotes,
                    tags: [],
                    setTags: () => {},
                    loading: false,
                    clear: () => {}
                }}
            >
                {children}
            </NoteContext.Provider>
        )
    }

    return renderHook(() => useNotes(), { wrapper: Wrapper })
}

describe('move note', () => {
    let written

    beforeEach(() => {
        jest.clearAllMocks()
        written = new Map()
        mockFileStorage.listMarkdownFiles.mockReturnValue([])
        mockFileStorage.moveNoteFiles.mockResolvedValue('Idea.md')
        mockFileStorage.findFile.mockReturnValue({ uri: 'file:///root/Child/Idea.md', lastModified: 99 })
        mockFileStorage.getExistingFile.mockReturnValue({ lastModified: 5 })
        mockFileStorage.writeNoteFile.mockImplementation((_uri, filename, content) => {
            written.set(filename, content)
            return { uri: 'file:///x', lastModified: 6, creationTime: 1 }
        })
    })

    test('updates the note location in state and keeps its content', async () => {
        const { result } = await renderNotesHook([IDEA], new Map([[IDEA.path, '']]))

        await act(async () => {
            await result.current.moveNote(IDEA.path, 'child')
        })

        expect(result.current.notes).toEqual([
            expect.objectContaining({
                path: 'child::Idea.md',
                repositoryId: 'child',
                note: 'body',
                createdAt: 1,
                updatedAt: 99,
                fileUri: 'file:///root/Child/Idea.md'
            })
        ])
    })

    test('returns the moved location', async () => {
        const { result } = await renderNotesHook([IDEA], new Map([[IDEA.path, '']]))

        let moved
        await act(async () => {
            moved = await result.current.moveNote(IDEA.path, 'child')
        })

        expect(moved).toMatchObject({ path: 'child::Idea.md', repositoryId: 'child' })
    })

    test('does nothing when the destination is the current folder', async () => {
        const { result } = await renderNotesHook([IDEA], new Map([[IDEA.path, '']]))

        let moved
        await act(async () => {
            moved = await result.current.moveNote(IDEA.path, 'root')
        })

        expect(moved).toBeNull()
        expect(mockFileStorage.moveNoteFiles).not.toHaveBeenCalled()
    })

    test('does nothing when the note does not exist', async () => {
        const { result } = await renderNotesHook([], new Map())

        await act(async () => {
            await result.current.moveNote('root::ghost.md', 'child')
        })

        expect(mockFileStorage.moveNoteFiles).not.toHaveBeenCalled()
    })

    test('keeps the note untouched when the file move fails', async () => {
        mockFileStorage.moveNoteFiles.mockRejectedValueOnce(new Error('move failed'))
        const { result } = await renderNotesHook([IDEA], new Map([[IDEA.path, '']]))

        await act(async () => {
            await expect(result.current.moveNote(IDEA.path, 'child')).rejects.toThrow('move failed')
        })

        expect(result.current.notes).toEqual([IDEA])
    })

    test('qualifies links in other notes when the title exists in another folder', async () => {
        const notePaths = new Map([[IDEA.path, ''], [TWIN.path, 'Child'], [INDEX.path, '']])
        const { result } = await renderNotesHook([IDEA, TWIN, INDEX], notePaths)

        await act(async () => {
            await result.current.moveNote(IDEA.path, 'child')
        })

        expect(parseFrontmatter(written.get('Index.md')).body).toBe('See [[Child/Idea|Idea]]')
    })

    test('leaves other notes alone when the title is unique', async () => {
        const notePaths = new Map([[IDEA.path, ''], [INDEX.path, '']])
        const { result } = await renderNotesHook([IDEA, INDEX], notePaths)

        await act(async () => {
            await result.current.moveNote(IDEA.path, 'child')
        })

        expect(mockFileStorage.writeNoteFile).not.toHaveBeenCalled()
    })
})
