import { useContext } from 'react'
import { renderHook, waitFor } from '@testing-library/react-native'

import { RepositoryContext, RepositoryProvider } from '../repository-context'
import { STORAGE_KEYS } from '@/constants/storage-keys'

const mockStorage = {
    getItem: jest.fn()
}

jest.mock('@/hooks/use-storage', () => ({
    useStorage: () => mockStorage
}))

const stubStorage = (values) => {
    mockStorage.getItem.mockImplementation(async (key) => values[key] ?? null)
}

const setup = () => renderHook(() => useContext(RepositoryContext), {
    wrapper: RepositoryProvider
})

describe('repository context', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.spyOn(console, 'warn').mockImplementation(() => {})
    })

    afterEach(() => {
        console.warn.mockRestore()
    })

    test('finishes loading with no repositories when storage is empty', async () => {
        stubStorage({})

        const { result } = await setup()

        await waitFor(() => expect(result.current.loading).toBe(false))
        expect(result.current.repositories).toEqual([])
        expect(result.current.activeRepositoryId).toBe('')
    })

    test('loads stored repositories and the active repository', async () => {
        const repositories = [{ id: 'a', alias: 'A' }]
        stubStorage({
            [STORAGE_KEYS.REPOSITORIES]: JSON.stringify(repositories),
            [STORAGE_KEYS.ACTIVE_REPOSITORY]: 'a'
        })

        const { result } = await setup()

        await waitFor(() => expect(result.current.loading).toBe(false))
        expect(result.current.repositories).toEqual(repositories)
        expect(result.current.activeRepositoryId).toBe('a')
    })

    test('stops loading and logs when stored data is corrupt', async () => {
        stubStorage({ [STORAGE_KEYS.REPOSITORIES]: '{not json' })

        const { result } = await setup()

        await waitFor(() => expect(result.current.loading).toBe(false))
        expect(result.current.repositories).toEqual([])
        expect(console.warn).toHaveBeenCalled()
    })

    test('starts unreconciled with no pending welcome note and a free busy flag', async () => {
        stubStorage({})

        const { result } = await setup()

        await waitFor(() => expect(result.current.loading).toBe(false))
        expect(result.current.reconciled).toBe(false)
        expect(result.current.pendingWelcomeNoteId).toBeNull()
        expect(result.current.busyRef.current).toBe(false)
    })
})
