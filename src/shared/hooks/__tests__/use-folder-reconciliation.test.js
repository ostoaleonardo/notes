import { renderHook } from '@testing-library/react-native'

import { useFolderReconciliation } from '../use-folder-reconciliation'

const mockReconcile = jest.fn()
let mockLoading = false
let mockForegroundCallback

jest.mock('../use-folders', () => ({
    useFolders: () => ({
        loading: mockLoading,
        reconcileFolders: mockReconcile
    })
}))
jest.mock('../use-on-foreground', () => ({
    useOnForeground: (callback) => { mockForegroundCallback = callback }
}))

beforeEach(() => {
    jest.clearAllMocks()
    mockLoading = false
    mockReconcile.mockResolvedValue(undefined)
})

describe('repository reconciliation', () => {
    test('reconciles once loading finishes', async () => {
        await renderHook(() => useFolderReconciliation())

        expect(mockReconcile).toHaveBeenCalledTimes(1)
    })

    test('waits while folders are still loading', async () => {
        mockLoading = true

        await renderHook(() => useFolderReconciliation())

        expect(mockReconcile).not.toHaveBeenCalled()
    })

    test('reconciles again when the app returns to the foreground', async () => {
        await renderHook(() => useFolderReconciliation())
        mockReconcile.mockClear()

        mockForegroundCallback()

        expect(mockReconcile).toHaveBeenCalledTimes(1)
    })

    test('skips the foreground reconcile while loading', async () => {
        mockLoading = true
        await renderHook(() => useFolderReconciliation())

        mockForegroundCallback()

        expect(mockReconcile).not.toHaveBeenCalled()
    })
})
