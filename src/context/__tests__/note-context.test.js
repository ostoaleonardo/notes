import { useContext } from 'react'
import { AppState } from 'react-native'
import { act, renderHook, waitFor } from '@testing-library/react-native'

import { NoteContext, NoteProvider } from '../note-context'

import { DEFAULT_TAGS } from '@/constants/default-values'

const mockLoadRepositoryData = jest.fn()

let mockActiveRepository = null
let mockActiveRepositoryTree = []

jest.mock('@react-native-async-storage/async-storage', () => ({
    default: {}
}))
jest.mock('../../hooks/use-repository-data', () => ({
    useRepositoryData: () => mockLoadRepositoryData
}))
jest.mock('../../hooks/use-repositories', () => ({
    useRepositories: () => ({
        activeRepository: mockActiveRepository,
        activeRepositoryTree: mockActiveRepositoryTree
    })
}))

const renderNoteContext = () => renderHook(() => useContext(NoteContext), { wrapper: NoteProvider })

beforeEach(() => {
    jest.clearAllMocks()
    mockActiveRepository = null
    mockActiveRepositoryTree = []
})

describe('loading notes on mount', () => {
    test('does nothing while there is no active repository', async () => {
        const { result } = await renderNoteContext()

        expect(mockLoadRepositoryData).not.toHaveBeenCalled()
        expect(result.current.loading).toBe(true)
    })

    test('loads notes and tags for the active repository tree', async () => {
        const root = { id: 'repo-1', uri: 'content://repo-1' }
        mockActiveRepository = root
        mockActiveRepositoryTree = [root]
        mockLoadRepositoryData.mockResolvedValue({
            notes: [{ id: 'note-1', title: 'Hello' }],
            tags: [{ id: 'tag-1', name: 'work' }]
        })

        const { result } = await renderNoteContext()

        expect(mockLoadRepositoryData).toHaveBeenCalledWith([root], root)
        expect(result.current.notes).toEqual([{ id: 'note-1', title: 'Hello' }])
        expect(result.current.tags).toEqual([{ id: 'tag-1', name: 'work' }])
        expect(result.current.loading).toBe(false)
    })

    test('stops loading and keeps prior state when loadRepositoryData throws', async () => {
        const root = { id: 'repo-1', uri: 'content://repo-1' }
        mockActiveRepository = root
        mockActiveRepositoryTree = [root]
        mockLoadRepositoryData.mockRejectedValue(new Error('disk error'))

        const { result } = await renderNoteContext()

        expect(result.current.loading).toBe(false)
        expect(result.current.notes).toEqual([])
    })
})

describe('reload on app foreground', () => {
    test('refreshes notes without toggling the loading flag', async () => {
        const root = { id: 'repo-1', uri: 'content://repo-1' }
        mockActiveRepository = root
        mockActiveRepositoryTree = [root]

        const addEventListenerSpy = jest.spyOn(AppState, 'addEventListener')

        mockLoadRepositoryData.mockResolvedValue({ notes: [], tags: [] })
        const { result } = await renderNoteContext()

        const [, handler] = addEventListenerSpy.mock.calls.find(([event]) => event === 'change')

        mockLoadRepositoryData.mockResolvedValue({
            notes: [{ id: 'note-2', title: 'Fresh' }],
            tags: []
        })

        await act(async () => {
            await handler('active')
        })

        expect(result.current.notes).toEqual([{ id: 'note-2', title: 'Fresh' }])
        expect(result.current.loading).toBe(false)
    })
})

describe('clear', () => {
    test('resets notes and tags to their defaults', async () => {
        const root = { id: 'repo-1', uri: 'content://repo-1' }
        mockActiveRepository = root
        mockActiveRepositoryTree = [root]
        mockLoadRepositoryData.mockResolvedValue({
            notes: [{ id: 'note-1', title: 'Hello' }],
            tags: [{ id: 'tag-1', name: 'work' }]
        })

        const { result } = await renderNoteContext()
        await waitFor(() => expect(result.current.notes).toHaveLength(1))

        await act(async () => {
            result.current.clear()
        })

        expect(result.current.notes).toEqual([])
        expect(result.current.tags).toEqual(DEFAULT_TAGS)
    })
})
