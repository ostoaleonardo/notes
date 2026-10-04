import { useMemo, useState } from 'react'
import { act, renderHook } from '@testing-library/react-native'

import { useNotes } from '../use-notes'
import { MOCK_REPO_URI } from '../__fixtures__/constants'
import {
    MOCK_DUPLICATE_TITLE_DRAFT,
    MOCK_GHOST_NOTE,
    MOCK_GROCERIES_DRAFT,
    MOCK_GROCERIES_NOTE,
    MOCK_MINIMAL_NOTE,
    MOCK_OLD_TITLE_NOTE,
    MOCK_ORPHANED_NOTE,
    MOCK_UNSAVED_NOTE
} from '../__fixtures__/notes'
import { NoteContext } from '@/context/note-context'
import { parseFrontmatter } from '@/utils/frontmatter'

const mockFileStorage = {
    listMarkdownFiles: jest.fn(),
    writeNoteFile: jest.fn(),
    deleteNoteFile: jest.fn(),
    findFile: jest.fn(),
    renameVersions: jest.fn(async () => { }),
    deleteVersions: jest.fn(),
    moveNoteFiles: jest.fn(async () => { }),
    getOrCreateVaultTrashFolder: jest.fn(() => ({ uri: 'file:///repo/.trash' }))
}

let mockDeleteBehavior = null

jest.mock('@react-native-async-storage/async-storage', () => ({
    default: {}
}))
jest.mock('../use-file-storage', () => ({
    useFileStorage: () => mockFileStorage
}))
jest.mock('../use-storage', () => ({
    useStorage: () => ({ getItem: jest.fn(async () => mockDeleteBehavior) })
}))
jest.mock('../use-repository-data', () => ({
    useRepositoryData: () => async () => ({ notes: [], tags: [] })
}))
jest.mock('../use-repositories', () => ({
    useRepositories: () => ({
        activeRepository: { id: 'repo-1', uri: MOCK_REPO_URI },
        repositories: [{ id: 'repo-1', uri: MOCK_REPO_URI }],
        getRootRepository: (repository) => repository
    })
}))

let files

const readFrontmatter = (filename) => parseFrontmatter(files.get(filename)).frontmatter
const readBody = (filename) => parseFrontmatter(files.get(filename)).body

const renderNotesHook = (initialNotes = []) => {
    const Wrapper = ({ children }) => {
        const [notes, setNotes] = useState(initialNotes)
        const [tags, setTags] = useState([])
        const notesByPath = useMemo(() => new Map(notes.map((note) => [note.path, note])), [notes])

        return (
            <NoteContext.Provider
                value={{
                    notes,
                    notesByPath,
                    setNotes,
                    tags,
                    setTags,
                    loading: false,
                    clear: () => { }
                }}
            >
                {children}
            </NoteContext.Provider>
        )
    }

    return renderHook(() => useNotes(), { wrapper: Wrapper })
}

beforeEach(() => {
    files = new Map()
    mockDeleteBehavior = null

    jest.clearAllMocks()
    mockFileStorage.listMarkdownFiles.mockImplementation(() => (
        Array.from(files.entries()).map(([name, content]) => ({
            name,
            text: async () => content,
            delete: () => files.delete(name)
        }))
    ))
    mockFileStorage.writeNoteFile.mockImplementation((_uri, filename, content) => {
        files.set(filename, content)
        return { name: filename, creationTime: 1000, lastModified: 2000 }
    })
    mockFileStorage.deleteNoteFile.mockImplementation((_uri, filename) => {
        files.delete(filename)
    })
    mockFileStorage.findFile.mockImplementation((_uri, filename) => (
        files.has(filename) ? { name: filename } : undefined
    ))
})

describe('save note', () => {
    test('adds the note to state and writes its file and frontmatter', async () => {
        const { result } = await renderNotesHook()
        let saved

        await act(async () => {
            saved = await result.current.saveNote(MOCK_GROCERIES_DRAFT)
        })

        expect(saved).toEqual({ path: 'repo-1::Groceries.md', filename: 'Groceries.md', createdAt: 1000, updatedAt: 2000 })
        expect(result.current.notes).toHaveLength(1)
        expect(result.current.notes[0].repositoryId).toBe('repo-1')
        expect(result.current.notes[0].path).toBe('repo-1::Groceries.md')
        expect(readBody('Groceries.md')).toBe('milk, eggs')
        expect(readFrontmatter('Groceries.md')).toEqual({})
    })

    test('disambiguates the filename when the title is already taken', async () => {
        files.set('Groceries.md', 'existing')
        const { result } = await renderNotesHook()

        await act(async () => {
            await result.current.saveNote(MOCK_DUPLICATE_TITLE_DRAFT)
        })

        expect(readBody('Groceries (2).md')).toBe('new content')
        expect(readFrontmatter('Groceries (2).md')).toEqual({})
    })

    test('adds the note to state but does not touch the filesystem when the repository cannot be resolved', async () => {
        const { result } = await renderNotesHook()

        await act(async () => {
            await result.current.saveNote(MOCK_GROCERIES_DRAFT, 'missing-repo')
        })

        expect(result.current.notes).toHaveLength(1)
        expect(mockFileStorage.listMarkdownFiles).not.toHaveBeenCalled()
        expect(mockFileStorage.writeNoteFile).not.toHaveBeenCalled()
    })
})

describe('update note', () => {
    test('rewrites the file content without renaming when the title is unchanged', async () => {
        files.set('Groceries.md', '---\ntags: []\n---\n\nold content')
        const { result } = await renderNotesHook([MOCK_GROCERIES_NOTE])

        await act(async () => {
            await result.current.updateNote({ ...MOCK_GROCERIES_NOTE, note: 'updated content' })
        })

        expect(readBody('Groceries.md')).toBe('updated content')
        expect(mockFileStorage.renameVersions).not.toHaveBeenCalled()
        expect(result.current.notes[0].note).toBe('updated content')
    })

    test('lists the repository directory only once per update', async () => {
        files.set('Old title.md', '---\ntags: []\n---\n\ncontent')
        const { result } = await renderNotesHook([MOCK_OLD_TITLE_NOTE])

        await act(async () => {
            await result.current.updateNote({ ...MOCK_OLD_TITLE_NOTE, title: 'New title' })
        })

        expect(mockFileStorage.listMarkdownFiles).toHaveBeenCalledTimes(1)
        expect(mockFileStorage.findFile).not.toHaveBeenCalled()
    })

    test('throws a duplicate-title error and does not touch the filesystem when another note already has that title', async () => {
        files.set('Old title.md', '---\ntags: []\n---\n\ncontent')
        files.set('Groceries.md', '---\ntags: []\n---\n\nmilk, eggs')
        const { result } = await renderNotesHook([MOCK_OLD_TITLE_NOTE, MOCK_GROCERIES_NOTE])

        await expect(act(async () => {
            await result.current.updateNote({ ...MOCK_OLD_TITLE_NOTE, title: 'Groceries' })
        })).rejects.toMatchObject({ code: 'DUPLICATE_TITLE' })

        expect(mockFileStorage.writeNoteFile).not.toHaveBeenCalled()
        expect(files.has('Old title.md')).toBe(true)
    })

    test('renames the file and its version history when the title changes', async () => {
        files.set('Old title.md', '---\ntags: []\n---\n\ncontent')
        const { result } = await renderNotesHook([MOCK_OLD_TITLE_NOTE])
        let updated

        await act(async () => {
            updated = await result.current.updateNote({ ...MOCK_OLD_TITLE_NOTE, title: 'New title' })
        })

        expect(updated).toEqual({ path: 'repo-1::New title.md', filename: 'New title.md', createdAt: 1000, updatedAt: 2000 })
        expect(mockFileStorage.renameVersions).toHaveBeenCalledWith(
            MOCK_REPO_URI,
            'Old title.md',
            'New title.md'
        )
        expect(files.has('Old title.md')).toBe(false)
        expect(readFrontmatter('New title.md')).toEqual({})
        expect(result.current.notes[0].path).toBe('repo-1::New title.md')
    })

    test('never touches wiki-links in other notes on its own, even when the title changes', async () => {
        const linkingNote = {
            path: 'repo-1::Linker.md',
            filename: 'Linker.md',
            title: 'Linker',
            note: 'See [[Old title]] for details',
            tags: [],
            repositoryId: 'repo-1',
            createdAt: 1
        }

        files.set('Old title.md', '---\ntags: []\n---\n\ncontent')
        files.set('Linker.md', linkingNote.note)

        const { result } = await renderNotesHook([MOCK_OLD_TITLE_NOTE, linkingNote])

        await act(async () => {
            await result.current.updateNote({ ...MOCK_OLD_TITLE_NOTE, title: 'New title' })
        })

        expect(files.get('Linker.md')).toBe('See [[Old title]] for details')
        expect(result.current.notes.find((n) => n.path === 'repo-1::Linker.md').note).toBe('See [[Old title]] for details')
        expect(readFrontmatter('New title.md')).toEqual({})
    })

    test('updates other notes independently of updateNote', async () => {
        const linkingNote = {
            path: 'repo-1::Linker.md',
            filename: 'Linker.md',
            title: 'Linker',
            note: 'See [[Old title]] for details',
            tags: [],
            repositoryId: 'repo-1',
            createdAt: 1
        }

        files.set('Old title.md', '---\ntags: []\n---\n\ncontent')
        files.set('Linker.md', linkingNote.note)

        const { result } = await renderNotesHook([MOCK_OLD_TITLE_NOTE, linkingNote])

        await act(async () => {
            await result.current.updateNote({ ...MOCK_OLD_TITLE_NOTE, title: 'New title' })
        })

        await act(async () => {
            await result.current.propagateWikiLinkRename(
                'repo-1::Old title.md',
                'New title',
                [MOCK_OLD_TITLE_NOTE, linkingNote],
                new Map()
            )
        })

        expect(readBody('Linker.md')).toBe('See [[New title]] for details')
        expect(result.current.notes.find((n) => n.path === 'repo-1::Linker.md').note).toBe('See [[New title]] for details')
    })

    test('does nothing when the note file no longer exists on disk', async () => {
        const { result } = await renderNotesHook([MOCK_GHOST_NOTE])

        await act(async () => {
            await result.current.updateNote({ ...MOCK_GHOST_NOTE, note: 'y' })
        })

        expect(mockFileStorage.writeNoteFile).not.toHaveBeenCalled()
    })

    test('does nothing when the note repository cannot be resolved', async () => {
        const { result } = await renderNotesHook([MOCK_ORPHANED_NOTE])

        await act(async () => {
            await result.current.updateNote({ ...MOCK_ORPHANED_NOTE, note: 'y' })
        })

        expect(mockFileStorage.findFile).not.toHaveBeenCalled()
        expect(mockFileStorage.writeNoteFile).not.toHaveBeenCalled()
    })

    test('creates the note instead of silently discarding the edit when it is not in state yet', async () => {
        const { result } = await renderNotesHook([])
        let saved

        await act(async () => {
            saved = await result.current.updateNote(MOCK_UNSAVED_NOTE)
        })

        expect(saved).toEqual({ path: 'repo-1::Untitled.md', filename: 'Untitled.md', createdAt: 1000, updatedAt: 2000 })
        expect(result.current.notes).toHaveLength(1)
        expect(result.current.notes[0].path).toBe('repo-1::Untitled.md')
        expect(readBody('Untitled.md')).toBe('quick note content')
        expect(readFrontmatter('Untitled.md')).toEqual({})
    })
})

describe('delete note', () => {
    test('removes the note from state and permanently deletes its file and versions', async () => {
        mockDeleteBehavior = 'permanent'
        files.set('Groceries.md', '---\ntags: []\n---\n\ncontent')
        const { result } = await renderNotesHook([MOCK_GROCERIES_NOTE])

        await act(async () => {
            await result.current.deleteNote('repo-1::Groceries.md')
        })

        expect(result.current.notes).toEqual([])
        expect(files.has('Groceries.md')).toBe(false)
        expect(mockFileStorage.deleteVersions).toHaveBeenCalledWith(MOCK_REPO_URI, 'Groceries.md')
    })

    test('moves the note to the vault trash folder by default', async () => {
        files.set('Groceries.md', '---\ntags: []\n---\n\ncontent')
        const { result } = await renderNotesHook([MOCK_GROCERIES_NOTE])

        await act(async () => {
            await result.current.deleteNote('repo-1::Groceries.md')
        })

        expect(mockFileStorage.getOrCreateVaultTrashFolder).toHaveBeenCalledWith(MOCK_REPO_URI)
        expect(mockFileStorage.moveNoteFiles).toHaveBeenCalledWith(
            MOCK_REPO_URI,
            'Groceries.md',
            'file:///repo/.trash'
        )
    })

    test('restores the note in state when moving it fails', async () => {
        mockFileStorage.moveNoteFiles.mockRejectedValueOnce(new Error('move failed'))
        files.set('Groceries.md', '---\ntags: []\n---\n\ncontent')
        const { result } = await renderNotesHook([MOCK_GROCERIES_NOTE])

        await act(async () => {
            await expect(result.current.deleteNote('repo-1::Groceries.md')).rejects.toThrow('move failed')
        })

        expect(result.current.notes).toEqual([MOCK_GROCERIES_NOTE])
    })

    test('is a no-op when the note path does not exist', async () => {
        const { result } = await renderNotesHook([])

        await act(async () => {
            await result.current.deleteNote('repo-1::missing.md')
        })

        expect(mockFileStorage.deleteNoteFile).not.toHaveBeenCalled()
    })

    test('removes the note from state but does not touch the filesystem when the repository cannot be resolved', async () => {
        const { result } = await renderNotesHook([MOCK_ORPHANED_NOTE])

        await act(async () => {
            await result.current.deleteNote('missing-repo::Orphaned.md')
        })

        expect(result.current.notes).toEqual([])
        expect(mockFileStorage.findFile).not.toHaveBeenCalled()
        expect(mockFileStorage.deleteNoteFile).not.toHaveBeenCalled()
    })
})

describe('get note', () => {
    test('returns the matching note', async () => {
        const { result } = await renderNotesHook([MOCK_MINIMAL_NOTE])

        expect(result.current.getNote('repo-1::Groceries.md')).toBe(MOCK_MINIMAL_NOTE)
    })

    test('returns an empty object when no note matches', async () => {
        const { result } = await renderNotesHook([])

        expect(result.current.getNote('repo-1::missing.md')).toEqual({})
    })
})
