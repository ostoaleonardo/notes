import { useContext } from 'react'
import { renderHook, waitFor } from '@testing-library/react-native'

import { RepositoryStateContext, RepositoryStateProvider } from '../repository-state-context'
import { STORAGE_KEYS } from '@/shared/constants/storage-keys'

const mockStorage = {
    getItem: jest.fn()
}

jest.mock('@/shared/hooks/use-storage', () => ({
    useStorage: () => mockStorage
}))

const stubStorage = (values) => {
    mockStorage.getItem.mockImplementation(async (key) => values[key] ?? null)
}

const setup = () => renderHook(() => useContext(RepositoryStateContext), {
    wrapper: RepositoryStateProvider
})

describe('repository state context', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.spyOn(console, 'warn').mockImplementation(() => {})
    })

    afterEach(() => {
        console.warn.mockRestore()
    })

    test('finishes loading with no folders when storage is empty', async () => {
        stubStorage({})

        const { result } = await setup()

        await waitFor(() => expect(result.current.loading).toBe(false))
        expect(result.current.folders).toEqual([])
        expect(result.current.activeFolderId).toBe('')
    })

    test('loads stored folders and the active repository', async () => {
        const folders = [{ id: 'a', alias: 'A' }]
        stubStorage({
            [STORAGE_KEYS.REPOSITORIES]: JSON.stringify(folders),
            [STORAGE_KEYS.ACTIVE_REPOSITORY]: 'a'
        })

        const { result } = await setup()

        await waitFor(() => expect(result.current.loading).toBe(false))
        expect(result.current.folders).toEqual(folders)
        expect(result.current.activeFolderId).toBe('a')
    })

    test('stops loading and logs when stored data is corrupt', async () => {
        stubStorage({ [STORAGE_KEYS.REPOSITORIES]: '{not json' })

        const { result } = await setup()

        await waitFor(() => expect(result.current.loading).toBe(false))
        expect(result.current.folders).toEqual([])
        expect(console.warn).toHaveBeenCalled()
    })

    test('starts with no pending welcome note and a free busy flag', async () => {
        stubStorage({})

        const { result } = await setup()

        await waitFor(() => expect(result.current.loading).toBe(false))
        expect(result.current.pendingWelcomeNoteId).toBeNull()
        expect(result.current.busyRef.current).toBe(false)
    })
})
