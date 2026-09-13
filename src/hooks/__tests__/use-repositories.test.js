import { useState } from 'react'
import { act, renderHook } from '@testing-library/react-native'

import { useRepositories } from '../use-repositories'
import { RepositoryContext } from '@/context/repository-context'

let mockPro = false
let mockUuidCounter = 0

const mockFileStorage = {
    listMarkdownFiles: jest.fn(() => []),
    listSubdirectories: jest.fn(() => []),
    writeNoteFile: jest.fn(),
    createSubdirectory: jest.fn(),
    deleteDirectory: jest.fn(),
    directoryExists: jest.fn(() => true),
    renameDirectory: jest.fn(),
    getOrCreateTemplatesFolder: jest.fn(() => ({ uri: 'content://fake/templates' })),
    getOrCreateImagesFolder: jest.fn(() => ({ uri: 'content://fake/images' }))
}

const mockSetItem = jest.fn()

jest.mock('@react-native-async-storage/async-storage', () => ({
    default: {}
}))
jest.mock('expo-crypto', () => ({
    randomUUID: () => `uuid-${++mockUuidCounter}`
}))
jest.mock('../use-file-storage', () => ({
    useFileStorage: () => mockFileStorage
}))
jest.mock('../use-storage', () => ({
    useStorage: () => ({ setItem: mockSetItem })
}))
jest.mock('../use-pro', () => ({
    usePro: () => ({ pro: mockPro })
}))

const renderRepositoriesHook = (initialRepositories = [], activeRepositoryId = '') => {
    const Wrapper = ({ children }) => {
        const [repositories, setRepositories] = useState(initialRepositories)
        const [activeId, setActiveId] = useState(activeRepositoryId)

        return (
            <RepositoryContext.Provider
                value={{
                    repositories,
                    setRepositories,
                    activeRepositoryId: activeId,
                    setActiveRepositoryId: setActiveId,
                    loading: false,
                    reconciled: false,
                    setReconciled: () => {},
                    busyRef: { current: false }
                }}
            >
                {children}
            </RepositoryContext.Provider>
        )
    }

    return renderHook(() => useRepositories(), { wrapper: Wrapper })
}

beforeEach(() => {
    jest.clearAllMocks()
    mockPro = false
    mockUuidCounter = 0
})

describe('canAddSubfolder', () => {
    test('allows a first subfolder on a free-tier root repository', async () => {
        const root = { id: 'root-1', uri: 'content://root-1', parentId: null }
        mockFileStorage.createSubdirectory.mockReturnValue({ uri: 'content://new', name: 'new' })

        const { result } = await renderRepositoriesHook([root])

        let outcome
        await act(async () => {
            outcome = await result.current.addSubfolder('root-1', 'first')
        })

        expect(outcome).not.toBe('pro_required')
        expect(mockFileStorage.createSubdirectory).toHaveBeenCalled()
    })

    test('blocks a second subfolder on a free-tier root repository', async () => {
        const root = { id: 'root-1', uri: 'content://root-1', parentId: null }
        const existingChild = { id: 'child-1', uri: 'content://child-1', parentId: 'root-1' }
        const { result } = await renderRepositoriesHook([root, existingChild])

        let outcome
        await act(async () => {
            outcome = await result.current.addSubfolder('root-1', 'second')
        })

        expect(outcome).toBe('pro_required')
        expect(mockFileStorage.createSubdirectory).not.toHaveBeenCalled()
    })

    test('blocks any subfolder nested deeper than one level on free tier', async () => {
        const root = { id: 'root-1', uri: 'content://root-1', parentId: null }
        const child = { id: 'child-1', uri: 'content://child-1', parentId: 'root-1' }
        const { result } = await renderRepositoriesHook([root, child])

        let outcome
        await act(async () => {
            outcome = await result.current.addSubfolder('child-1', 'grandchild')
        })

        expect(outcome).toBe('pro_required')
    })

    test('allows nested and repeated subfolders when pro', async () => {
        mockPro = true

        const root = { id: 'root-1', uri: 'content://root-1', parentId: null }
        const child = { id: 'child-1', uri: 'content://child-1', parentId: 'root-1' }
        mockFileStorage.createSubdirectory.mockReturnValue({ uri: 'content://new', name: 'new' })

        const { result } = await renderRepositoriesHook([root, child])

        let outcome
        await act(async () => {
            outcome = await result.current.addSubfolder('child-1', 'grandchild')
        })

        expect(outcome).not.toBe('pro_required')
        expect(mockFileStorage.createSubdirectory).toHaveBeenCalled()
    })
})

describe('removeRepository', () => {
    test('refuses to remove a repository that is an ancestor of the active one', async () => {
        const root = { id: 'root-1', uri: 'content://root-1', parentId: null }
        const child = { id: 'child-1', uri: 'content://child-1', parentId: 'root-1' }
        const { result } = await renderRepositoriesHook([root, child], 'child-1')

        let outcome
        await act(async () => {
            outcome = await result.current.removeRepository('root-1')
        })

        expect(outcome).toBe('active')
        expect(mockFileStorage.deleteDirectory).not.toHaveBeenCalled()
    })

    test('removes a repository and its descendants when it is not an ancestor of the active one', async () => {
        const root = { id: 'root-1', uri: 'content://root-1', parentId: null }
        const other = { id: 'other-1', uri: 'content://other-1', parentId: null }
        const child = { id: 'child-1', uri: 'content://child-1', parentId: 'root-1' }
        const { result } = await renderRepositoriesHook([root, other, child], 'other-1')

        let outcome
        await act(async () => {
            outcome = await result.current.removeRepository('root-1')
        })

        expect(outcome).toEqual(root)
        expect(mockFileStorage.deleteDirectory).toHaveBeenCalledWith('content://root-1')
    })
})

describe('reconcileRepositories', () => {
    test('drops tracked repositories whose folder no longer exists on disk', async () => {
        const root = { id: 'root-1', uri: 'content://root-1', parentId: null }
        mockFileStorage.directoryExists.mockReturnValue(false)

        const { result } = await renderRepositoriesHook([root], 'root-1')

        await act(async () => {
            await result.current.reconcileRepositories()
        })

        expect(mockSetItem).toHaveBeenCalledWith('folders', JSON.stringify([]))
        expect(mockSetItem).toHaveBeenCalledWith('active-folder', '')
    })

    test('discovers a new subfolder created on disk outside the app', async () => {
        const root = { id: 'root-1', uri: 'content://root-1', parentId: null }
        mockFileStorage.directoryExists.mockReturnValue(true)
        mockFileStorage.listSubdirectories.mockImplementation((uri) => (
            uri === 'content://root-1' ? [{ uri: 'content://new-folder', name: 'new-folder' }] : []
        ))

        const { result } = await renderRepositoriesHook([root], 'root-1')

        await act(async () => {
            await result.current.reconcileRepositories()
        })

        const [, persisted] = mockSetItem.mock.calls.find(([key]) => key === 'folders')
        const persistedRepositories = JSON.parse(persisted)

        expect(persistedRepositories).toHaveLength(2)
        expect(persistedRepositories[1]).toMatchObject({ uri: 'content://new-folder', parentId: 'root-1' })
    })
})

describe('renameRepository', () => {
    test('relinks descendant uris after renaming a nested repository folder', async () => {
        const root = { id: 'root-1', uri: 'content://root-1', parentId: null }
        const child = { id: 'child-1', uri: 'content://root-1/child', alias: 'child', parentId: 'root-1' }
        const grandchild = { id: 'grand-1', uri: 'content://root-1/child/grand', alias: 'grand', parentId: 'child-1' }

        mockFileStorage.renameDirectory.mockReturnValue('content://root-1/renamed')
        mockFileStorage.listSubdirectories.mockImplementation((uri) => {
            if (uri === 'content://root-1/renamed') return [{ uri: 'content://root-1/renamed/grand', name: 'grand' }]
            return []
        })

        const { result } = await renderRepositoriesHook([root, child, grandchild])

        await act(async () => {
            await result.current.renameRepository('child-1', 'renamed')
        })

        const [, persisted] = mockSetItem.mock.calls.find(([key]) => key === 'folders')
        const persistedRepositories = JSON.parse(persisted)
        const persistedGrandchild = persistedRepositories.find((r) => r.id === 'grand-1')

        expect(persistedGrandchild.uri).toBe('content://root-1/renamed/grand')
    })
})
