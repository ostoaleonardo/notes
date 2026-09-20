import { useState } from 'react'
import { act, renderHook } from '@testing-library/react-native'

import { useNotes } from '../use-notes'
import { MOCK_REPO_URI } from '../__fixtures__/constants'
import {
    MOCK_DUPLICATE_TITLE_DRAFT,
    MOCK_GHOST_NOTE,
    MOCK_GROCERIES_DRAFT,
    MOCK_GROCERIES_METADATA,
    MOCK_GROCERIES_NOTE,
    MOCK_MINIMAL_NOTE,
    MOCK_OLD_TITLE_METADATA,
    MOCK_OLD_TITLE_NOTE,
    MOCK_ORPHANED_NOTE,
    MOCK_UNSAVED_NOTE
} from '../__fixtures__/notes'
import { NoteContext } from '@/context/note-context'

const mockFileStorage = {
    listMarkdownFiles: jest.fn(),
    writeNoteFile: jest.fn(),
    renameNoteFile: jest.fn(async () => { }),
    deleteNoteFile: jest.fn(),
    readMetadata: jest.fn(),
    writeMetadata: jest.fn()
}

jest.mock('@react-native-async-storage/async-storage', () => ({
    default: {}
}))
jest.mock('../use-file-storage', () => ({
    useFileStorage: () => mockFileStorage
}))
jest.mock('../use-storage', () => ({
    useStorage: () => ({ getItem: jest.fn(async () => null) })
}))
jest.mock('../use-repository-data', () => ({
    useRepositoryData: () => async () => ({ notes: [], tags: [] })
}))
jest.mock('../use-repositories', () => ({
    useRepositories: () => ({
        activeRepository: { id: 'repo-1', uri: MOCK_REPO_URI },
        repositories: [{ id: 'repo-1', uri: MOCK_REPO_URI }]
    })
}))

let files
let metadata

const renderNotesHook = (initialNotes = []) => {
    const Wrapper = ({ children }) => {
        const [notes, setNotes] = useState(initialNotes)
        const [tags, setTags] = useState([])

        return (
            <NoteContext.Provider
                value={{
                    notes,
                    setNotes,
                    tags,
                    setTags,
                    paramId: '',
                    setParamId: () => { },
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
    metadata = {}

    jest.clearAllMocks()
    mockFileStorage.listMarkdownFiles.mockImplementation(() => (
        Array.from(files.entries()).map(([name, content]) => ({
            name, text: async () => content
        }))
    ))
    mockFileStorage.writeNoteFile.mockImplementation((_uri, filename, content) => {
        files.set(filename, content)
    })
    mockFileStorage.deleteNoteFile.mockImplementation((_uri, filename) => {
        files.delete(filename)
    })
    mockFileStorage.readMetadata.mockImplementation(async () => metadata)
    mockFileStorage.writeMetadata.mockImplementation((_uri, value) => {
        metadata = value
    })
    mockFileStorage.renameNoteFile.mockImplementation(async (_uri, oldName, newName) => {
        files.set(newName, files.get(oldName))
        files.delete(oldName)
    })
})

describe('save note', () => {
    test('adds the note to state and writes its file and metadata', async () => {
        const { result } = await renderNotesHook()

        await act(async () => {
            await result.current.saveNote(MOCK_GROCERIES_DRAFT)
        })

        expect(result.current.notes).toHaveLength(1)
        expect(result.current.notes[0].repositoryId).toBe('repo-1')
        expect(files.get('Groceries.md')).toBe('milk, eggs')
        expect(metadata['note-1'].filename).toBe('Groceries.md')
    })

    test('disambiguates the filename when the title is already taken', async () => {
        files.set('Groceries.md', 'existing')
        const { result } = await renderNotesHook()

        await act(async () => {
            await result.current.saveNote(MOCK_DUPLICATE_TITLE_DRAFT)
        })

        expect(files.get('Groceries (2).md')).toBe('new content')
        expect(metadata['note-2'].filename).toBe('Groceries (2).md')
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
        files.set('Groceries.md', 'old content')
        metadata = { ...MOCK_GROCERIES_METADATA }
        const { result } = await renderNotesHook([MOCK_GROCERIES_NOTE])

        await act(async () => {
            await result.current.updateNote({ ...MOCK_GROCERIES_NOTE, note: 'updated content' })
        })

        expect(files.get('Groceries.md')).toBe('updated content')
        expect(mockFileStorage.renameNoteFile).not.toHaveBeenCalled()
        expect(result.current.notes[0].note).toBe('updated content')
    })

    test('renames the file when the title changes', async () => {
        files.set('Old title.md', 'content')
        metadata = { ...MOCK_OLD_TITLE_METADATA }
        const { result } = await renderNotesHook([MOCK_OLD_TITLE_NOTE])

        await act(async () => {
            await result.current.updateNote({ ...MOCK_OLD_TITLE_NOTE, title: 'New title' })
        })

        expect(mockFileStorage.renameNoteFile).toHaveBeenCalledWith(
            MOCK_REPO_URI,
            'Old title.md',
            'New title.md'
        )
        expect(metadata['note-1'].filename).toBe('New title.md')
    })

    test('never touches wiki-links in other notes on its own, even when the title changes', async () => {
        const linkingNote = {
            id: 'note-2',
            title: 'Linker',
            note: 'See [[Old title]] for details',
            tags: [],
            repositoryId: 'repo-1',
            createdAt: 1
        }

        files.set('Old title.md', 'content')
        files.set('Linker.md', linkingNote.note)
        metadata = {
            ...MOCK_OLD_TITLE_METADATA,
            'note-2': { filename: 'Linker.md', tags: [], createdAt: 1, updatedAt: '' }
        }

        const { result } = await renderNotesHook([MOCK_OLD_TITLE_NOTE, linkingNote])

        await act(async () => {
            await result.current.updateNote({ ...MOCK_OLD_TITLE_NOTE, title: 'New title' })
        })

        expect(files.get('Linker.md')).toBe('See [[Old title]] for details')
        expect(result.current.notes.find((n) => n.id === 'note-2').note).toBe('See [[Old title]] for details')
        expect(metadata['note-1'].filename).toBe('New title.md')
    })

    test('updates other notes independently of updateNote', async () => {
        const linkingNote = {
            id: 'note-2',
            title: 'Linker',
            note: 'See [[Old title]] for details',
            tags: [],
            repositoryId: 'repo-1',
            createdAt: 1
        }

        files.set('Old title.md', 'content')
        files.set('Linker.md', linkingNote.note)
        metadata = {
            ...MOCK_OLD_TITLE_METADATA,
            'note-2': { filename: 'Linker.md', tags: [], createdAt: 1, updatedAt: '' }
        }

        const { result } = await renderNotesHook([MOCK_OLD_TITLE_NOTE, linkingNote])

        await act(async () => {
            await result.current.updateNote({ ...MOCK_OLD_TITLE_NOTE, title: 'New title' })
        })

        await act(async () => {
            await result.current.propagateWikiLinkRename(
                'note-1',
                'New title',
                [MOCK_OLD_TITLE_NOTE, linkingNote],
                new Map()
            )
        })

        expect(files.get('Linker.md')).toBe('See [[New title]] for details')
        expect(result.current.notes.find((n) => n.id === 'note-2').note).toBe('See [[New title]] for details')
    })

    test('does nothing when the note has no metadata entry', async () => {
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

        expect(mockFileStorage.readMetadata).not.toHaveBeenCalled()
        expect(mockFileStorage.writeNoteFile).not.toHaveBeenCalled()
    })

    test('creates the note instead of silently discarding the edit when it is not in state yet', async () => {
        const { result } = await renderNotesHook([])

        await act(async () => {
            await result.current.updateNote(MOCK_UNSAVED_NOTE)
        })

        expect(result.current.notes).toHaveLength(1)
        expect(result.current.notes[0].id).toBe('note-unsaved')
        expect(files.get('Untitled.md')).toBe('quick note content')
        expect(metadata['note-unsaved'].filename).toBe('Untitled.md')
    })
})

describe('delete note', () => {
    test('removes the note from state, deletes its file and metadata entry', async () => {
        files.set('Groceries.md', 'content')
        metadata = { ...MOCK_GROCERIES_METADATA }
        const { result } = await renderNotesHook([MOCK_GROCERIES_NOTE])

        await act(async () => {
            await result.current.deleteNote('note-1')
        })

        expect(result.current.notes).toEqual([])
        expect(files.has('Groceries.md')).toBe(false)
        expect(metadata['note-1']).toBeUndefined()
    })

    test('is a no-op when the note id does not exist', async () => {
        const { result } = await renderNotesHook([])

        await act(async () => {
            await result.current.deleteNote('missing')
        })

        expect(mockFileStorage.deleteNoteFile).not.toHaveBeenCalled()
    })

    test('removes the note from state but does not touch the filesystem when the repository cannot be resolved', async () => {
        const { result } = await renderNotesHook([MOCK_ORPHANED_NOTE])

        await act(async () => {
            await result.current.deleteNote('note-1')
        })

        expect(result.current.notes).toEqual([])
        expect(mockFileStorage.readMetadata).not.toHaveBeenCalled()
        expect(mockFileStorage.deleteNoteFile).not.toHaveBeenCalled()
    })
})

describe('get note', () => {
    test('returns the matching note', async () => {
        const { result } = await renderNotesHook([MOCK_MINIMAL_NOTE])

        expect(result.current.getNote('note-1')).toBe(MOCK_MINIMAL_NOTE)
    })

    test('returns an empty object when no note matches', async () => {
        const { result } = await renderNotesHook([])

        expect(result.current.getNote('missing')).toEqual({})
    })
})
