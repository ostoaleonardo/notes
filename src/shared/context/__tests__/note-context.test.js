import { useContext } from 'react'
import { AppState } from 'react-native'
import { act, renderHook, waitFor } from '@testing-library/react-native'

import { NoteContext, NoteProvider } from '../note-context'
import { getIndexingStatus, setIndexingStatus } from '@/shared/utils/indexing-status'

import { INDEXING_COMPLETE, INDEXING_NOTICE_MIN_FILES, INDEXING_STARTED } from '@/shared/constants/indexing'

const mockLoadRepositoryData = jest.fn()
const mockUpdatePinned = jest.fn()
const mockRemoveRecent = jest.fn()
const mockReadRepositoryIndex = jest.fn()
const mockWriteRepositoryIndex = jest.fn()
const mockIsBodylessVault = jest.fn()
const mockLoadNotesFromIndex = jest.fn()

let mockActiveFolder = null
let mockActiveFolderTree = []
let mockPinned = new Set()
let mockRecent = []

jest.mock('@react-native-async-storage/async-storage', () => ({
    default: {}
}))
jest.mock('@/shared/utils/body-mode', () => ({
    isBodylessVault: (...args) => mockIsBodylessVault(...args)
}))
jest.mock('@/shared/utils/index-notes', () => ({
    loadNotesFromIndex: (...args) => mockLoadNotesFromIndex(...args)
}))
jest.mock('../../hooks/use-repository-data', () => ({
    useRepositoryData: () => mockLoadRepositoryData
}))
jest.mock('../../hooks/use-file-storage', () => ({
    useFileStorage: () => ({
        readRepositoryIndex: mockReadRepositoryIndex,
        writeRepositoryIndex: mockWriteRepositoryIndex
    })
}))
jest.mock('../../hooks/use-folders', () => ({
    useFolders: () => ({
        folders: [],
        activeFolder: mockActiveFolder,
        activeFolderTree: mockActiveFolderTree
    })
}))
jest.mock('../../hooks/use-utils', () => ({
    useUtils: () => ({ pinned: mockPinned, updatePinned: mockUpdatePinned })
}))
jest.mock('../../hooks/use-recent-notes', () => ({
    useRecentNotes: () => ({ recent: mockRecent, removeRecent: mockRemoveRecent })
}))

const renderNoteContext = () => renderHook(() => useContext(NoteContext), { wrapper: NoteProvider })

beforeEach(() => {
    jest.clearAllMocks()
    mockActiveFolder = null
    mockActiveFolderTree = []
    mockPinned = new Set()
    mockRecent = []
    mockReadRepositoryIndex.mockResolvedValue([])
    mockIsBodylessVault.mockResolvedValue(false)
    mockLoadNotesFromIndex.mockResolvedValue([])
    setIndexingStatus(null)
})

describe('loading notes on mount', () => {
    test('does nothing while there is no active repository', async () => {
        const { result } = await renderNoteContext()

        expect(mockLoadRepositoryData).not.toHaveBeenCalled()
        expect(result.current.loading).toBe(true)
    })

    test('loads notes and tags for the active folder tree', async () => {
        const root = { id: 'repo-1', uri: 'content://repo-1' }
        mockActiveFolder = root
        mockActiveFolderTree = [root]
        mockLoadRepositoryData.mockResolvedValue({
            notes: [{ id: 'note-1', title: 'Hello', tags: ['work'], note: 'a #work/todo' }],
            changed: true
        })

        const { result } = await renderNoteContext()

        expect(mockLoadRepositoryData).toHaveBeenCalledWith([root], root, [], expect.any(Function), undefined)
        expect(result.current.notes).toHaveLength(1)
        expect(result.current.tags).toEqual(['work', 'work/todo'])
        expect(result.current.loading).toBe(false)
    })

    test('stops loading and keeps prior state when loadRepositoryData throws', async () => {
        const root = { id: 'repo-1', uri: 'content://repo-1' }
        mockActiveFolder = root
        mockActiveFolderTree = [root]
        mockLoadRepositoryData.mockRejectedValue(new Error('disk error'))

        const { result } = await renderNoteContext()

        expect(result.current.loading).toBe(false)
        expect(result.current.notes).toEqual([])
    })
})

describe('loading from the folder index', () => {
    const root = { id: 'repo-1', uri: 'content://repo-1' }
    const cached = [{ path: 'repo-1::A.md', title: 'A' }]

    beforeEach(() => {
        mockActiveFolder = root
        mockActiveFolderTree = [root]
    })

    test('shows the indexed notes before the folder is scanned', async () => {
        mockReadRepositoryIndex.mockResolvedValue(cached)
        mockLoadRepositoryData.mockReturnValue(new Promise(() => {}))

        const { result } = await renderNoteContext()

        expect(mockReadRepositoryIndex).toHaveBeenCalledWith('repo-1')
        expect(result.current.notes).toBe(cached)
        expect(result.current.loading).toBe(false)
        expect(mockLoadRepositoryData).toHaveBeenCalledWith([root], root, cached, expect.any(Function), undefined)
    })

    test('keeps the indexed notes and the index when nothing changed on disk', async () => {
        mockReadRepositoryIndex.mockResolvedValue(cached)
        mockLoadRepositoryData.mockResolvedValue({
            notes: [...cached],
            changed: false
        })

        const { result } = await renderNoteContext()

        expect(result.current.notes).toBe(cached)
        expect(mockWriteRepositoryIndex).not.toHaveBeenCalled()
    })

    test('stores the index again when the folder changed', async () => {
        const loaded = [{ path: 'repo-1::B.md', title: 'B' }]
        mockReadRepositoryIndex.mockResolvedValue(cached)
        mockLoadRepositoryData.mockResolvedValue({
            notes: loaded,
            changed: true
        })

        const { result } = await renderNoteContext()

        expect(result.current.notes).toBe(loaded)
        expect(mockWriteRepositoryIndex).toHaveBeenCalledWith('repo-1', loaded)
    })

    test('keeps a note edited while the folder was being scanned', async () => {
        let finishLoading
        mockReadRepositoryIndex.mockResolvedValue(cached)
        mockLoadRepositoryData.mockReturnValue(new Promise((resolve) => {
            finishLoading = resolve
        }))

        const { result } = await renderNoteContext()
        const edited = { path: 'repo-1::A.md', title: 'A', note: 'edited' }

        await act(async () => {
            result.current.setNotes([edited])
        })
        await act(async () => {
            finishLoading({
                notes: [{ path: 'repo-1::A.md', title: 'A', note: 'stale' }],
                changed: true
            })
        })

        expect(result.current.notes).toEqual([edited])
    })
})

describe('indexing status', () => {
    const root = { id: 'repo-1', uri: 'content://repo-1' }

    const loadReporting = (total) => {
        mockActiveFolder = root
        mockActiveFolderTree = [root]
        mockReadRepositoryIndex.mockResolvedValue([{ path: 'repo-1::A.md' }])

        let finishLoading
        mockLoadRepositoryData.mockImplementation((_tree, _root, _previous, onProgress) => {
            onProgress(total / 2, total)
            return new Promise((resolve) => {
                finishLoading = resolve
            })
        })

        return () => act(async () => {
            finishLoading({
                notes: [],
                changed: true
            })
        })
    }

    test('reports progress while many files are read and completes afterwards', async () => {
        const finish = loadReporting(INDEXING_NOTICE_MIN_FILES)

        await renderNoteContext()
        expect(getIndexingStatus()).toEqual({ progress: 0.5 })

        await finish()
        expect(getIndexingStatus()).toBe(INDEXING_COMPLETE)
    })

    test('stays silent when only a few files changed', async () => {
        const finish = loadReporting(INDEXING_NOTICE_MIN_FILES - 2)

        await renderNoteContext()
        await finish()

        expect(getIndexingStatus()).toBeNull()
    })

    test('announces indexing right away when the folder has no index yet', async () => {
        mockActiveFolder = root
        mockActiveFolderTree = [root]
        mockLoadRepositoryData.mockReturnValue(new Promise(() => {}))

        const { result } = await renderNoteContext()

        expect(getIndexingStatus()).toBe(INDEXING_STARTED)
        expect(result.current.loading).toBe(true)
    })

    test('clears the status when loading fails', async () => {
        mockActiveFolder = root
        mockActiveFolderTree = [root]
        mockLoadRepositoryData.mockRejectedValue(new Error('disk error'))

        await renderNoteContext()

        expect(getIndexingStatus()).toBeNull()
    })
})

describe('reload on app foreground', () => {
    test('refreshes notes without toggling the loading flag', async () => {
        const root = { id: 'repo-1', uri: 'content://repo-1' }
        mockActiveFolder = root
        mockActiveFolderTree = [root]

        const addEventListenerSpy = jest.spyOn(AppState, 'addEventListener')

        mockLoadRepositoryData.mockResolvedValue({ notes: [] })
        const { result } = await renderNoteContext()

        const [, handler] = addEventListenerSpy.mock.calls.find(([event]) => event === 'change')

        mockLoadRepositoryData.mockResolvedValue({
            notes: [{ id: 'note-2', title: 'Fresh' }],
            changed: true
        })

        await act(async () => {
            await handler('active')
        })

        expect(result.current.notes).toEqual([{ id: 'note-2', title: 'Fresh' }])
        expect(result.current.loading).toBe(false)
    })
})

describe('pruning stale pinned and recent entries', () => {
    test('removes pinned and recent notes that no longer resolve after loading', async () => {
        const root = { id: 'repo-1', uri: 'content://repo-1' }
        mockActiveFolder = root
        mockActiveFolderTree = [root]
        mockPinned = new Set(['repo-1::Gone.md', 'repo-1::Kept.md'])
        mockRecent = ['repo-1::Gone.md', 'repo-1::AlsoGone.md']
        mockLoadRepositoryData.mockResolvedValue({
            notes: [{ path: 'repo-1::Kept.md', title: 'Kept' }],
            changed: true
        })

        await renderNoteContext()

        expect(mockUpdatePinned).toHaveBeenCalledWith(new Set(['repo-1::Kept.md']))
        expect(mockRemoveRecent).toHaveBeenCalledWith('repo-1::Gone.md')
        expect(mockRemoveRecent).toHaveBeenCalledWith('repo-1::AlsoGone.md')
    })

    test('never prunes pinned template entries', async () => {
        const root = { id: 'repo-1', uri: 'content://repo-1' }
        mockActiveFolder = root
        mockActiveFolderTree = [root]
        mockPinned = new Set(['template:Weekly.md'])
        mockLoadRepositoryData.mockResolvedValue({ notes: [] })

        await renderNoteContext()

        expect(mockUpdatePinned).not.toHaveBeenCalled()
    })

    test('does nothing when every pinned and recent entry still resolves', async () => {
        const root = { id: 'repo-1', uri: 'content://repo-1' }
        mockActiveFolder = root
        mockActiveFolderTree = [root]
        mockPinned = new Set(['repo-1::Kept.md'])
        mockRecent = ['repo-1::Kept.md']
        mockLoadRepositoryData.mockResolvedValue({
            notes: [{ path: 'repo-1::Kept.md', title: 'Kept' }],
            changed: true
        })

        await renderNoteContext()

        expect(mockUpdatePinned).not.toHaveBeenCalled()
        expect(mockRemoveRecent).not.toHaveBeenCalled()
    })
})

describe('clear', () => {
    test('empties notes and the tags derived from them', async () => {
        const root = { id: 'repo-1', uri: 'content://repo-1' }
        mockActiveFolder = root
        mockActiveFolderTree = [root]
        mockLoadRepositoryData.mockResolvedValue({
            notes: [{ id: 'note-1', title: 'Hello', tags: ['work'] }],
            changed: true
        })

        const { result } = await renderNoteContext()
        await waitFor(() => expect(result.current.notes).toHaveLength(1))

        await act(async () => {
            result.current.clear()
        })

        expect(result.current.notes).toEqual([])
        expect(result.current.tags).toEqual([])
    })
})

describe('loading a large vault without note bodies', () => {
    const root = { id: 'repo-1', uri: 'content://repo-1' }
    const listed = [{ path: 'repo-1::A.md', title: 'A' }]

    beforeEach(() => {
        mockActiveFolder = root
        mockActiveFolderTree = [root]
        mockIsBodylessVault.mockResolvedValue(true)
        mockLoadNotesFromIndex.mockResolvedValue(listed)
    })

    test('shows the notes listed from the index instead of the stored snapshot', async () => {
        mockLoadRepositoryData.mockReturnValue(new Promise(() => {}))

        const { result } = await renderNoteContext()

        expect(mockIsBodylessVault).toHaveBeenCalledWith(['repo-1'])
        expect(mockLoadNotesFromIndex).toHaveBeenCalledWith(['repo-1'])
        expect(mockReadRepositoryIndex).not.toHaveBeenCalled()
        expect(result.current.notes).toBe(listed)
        expect(result.current.loading).toBe(false)
    })

    test('hands the loader the index source to synchronize and list from', async () => {
        mockLoadRepositoryData.mockReturnValue(new Promise(() => {}))

        await renderNoteContext()

        const indexed = mockLoadRepositoryData.mock.calls[0][4]

        await indexed.list(['repo-1'])

        expect(indexed).toEqual({ sync: expect.any(Function), list: expect.any(Function) })
        expect(mockLoadNotesFromIndex).toHaveBeenLastCalledWith(['repo-1'])
    })

    test('does not store the snapshot when notes changed', async () => {
        mockLoadRepositoryData.mockResolvedValue({ notes: [{ path: 'repo-1::B.md' }], changed: true })

        await renderNoteContext()

        expect(mockWriteRepositoryIndex).not.toHaveBeenCalled()
    })

    test('falls back to the stored snapshot when the index cannot be listed', async () => {
        mockLoadNotesFromIndex.mockRejectedValue(new Error('index unavailable'))
        mockReadRepositoryIndex.mockResolvedValue([{ path: 'repo-1::C.md' }])
        mockLoadRepositoryData.mockReturnValue(new Promise(() => {}))

        const { result } = await renderNoteContext()

        expect(mockReadRepositoryIndex).toHaveBeenCalledWith('repo-1')
        expect(result.current.notes).toEqual([{ path: 'repo-1::C.md' }])
        expect(mockLoadRepositoryData.mock.calls[0][4]).toBeUndefined()
    })
})
