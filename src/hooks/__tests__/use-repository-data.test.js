import { renderHook } from '@testing-library/react-native'

import { useRepositoryData } from '../use-repository-data'
import { loadRepositoryData } from '../../utils/load-repository-data'
import { showSnackbar } from '@/components/snackbar/snackbar-host'

const mockFileStorage = { id: 'file-storage' }

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key, options) => `${key}:${options?.renamed}:${options?.images}`
    })
}))
jest.mock('@/components/snackbar/snackbar-host', () => ({
    showSnackbar: jest.fn()
}))
jest.mock('@/utils/storage', () => ({
    storage: { id: 'storage' }
}))
jest.mock('../use-file-storage', () => ({
    useFileStorage: () => mockFileStorage
}))
jest.mock('../../utils/load-repository-data', () => ({
    loadRepositoryData: jest.fn()
}))

const tree = [{ id: 'repo-1', uri: 'file:///repo' }]
const root = tree[0]

const load = async () => {
    const { result } = await renderHook(() => useRepositoryData())
    return result.current(tree, root)
}

beforeEach(() => {
    jest.clearAllMocks()
})

describe('load repository data', () => {
    test('passes the tree, root, storage and file storage to the loader', async () => {
        loadRepositoryData.mockResolvedValue({ notes: [], migration: {} })

        await load()

        expect(loadRepositoryData).toHaveBeenCalledWith(
            tree,
            root,
            { id: 'storage' },
            mockFileStorage
        )
    })

    test('returns the data without the migration report', async () => {
        loadRepositoryData.mockResolvedValue({ notes: ['a'], migration: {} })

        expect(await load()).toEqual({ notes: ['a'] })
    })

    test('stays silent when nothing was migrated', async () => {
        loadRepositoryData.mockResolvedValue({
            notes: [],
            migration: { renamedNotes: 0, failedImages: 0 }
        })

        await load()

        expect(showSnackbar).not.toHaveBeenCalled()
    })

    test('reports renamed notes and failed images', async () => {
        loadRepositoryData.mockResolvedValue({
            notes: [],
            migration: { renamedNotes: 2, failedImages: 1 }
        })

        await load()

        expect(showSnackbar).toHaveBeenCalledWith('notes.migration_notice:2:1')
    })
})
