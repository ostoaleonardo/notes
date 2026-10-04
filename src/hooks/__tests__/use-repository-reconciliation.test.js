import { renderHook } from '@testing-library/react-native'

import { useRepositoryReconciliation } from '../use-repository-reconciliation'

const mockReconcile = jest.fn()
const mockSetReconciled = jest.fn()
let mockLoading = false
let mockForegroundCallback

jest.mock('../use-repositories', () => ({
    useRepositories: () => ({
        loading: mockLoading,
        reconcileRepositories: mockReconcile,
        setReconciled: mockSetReconciled
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
    test('reconciles once loading finishes and marks it as reconciled', async () => {
        await renderHook(() => useRepositoryReconciliation())

        expect(mockReconcile).toHaveBeenCalledTimes(1)
        expect(mockSetReconciled).toHaveBeenCalledWith(true)
    })

    test('waits while repositories are still loading', async () => {
        mockLoading = true

        await renderHook(() => useRepositoryReconciliation())

        expect(mockReconcile).not.toHaveBeenCalled()
        expect(mockSetReconciled).not.toHaveBeenCalled()
    })

    test('reconciles again when the app returns to the foreground', async () => {
        await renderHook(() => useRepositoryReconciliation())
        mockReconcile.mockClear()

        mockForegroundCallback()

        expect(mockReconcile).toHaveBeenCalledTimes(1)
    })

    test('skips the foreground reconcile while loading', async () => {
        mockLoading = true
        await renderHook(() => useRepositoryReconciliation())

        mockForegroundCallback()

        expect(mockReconcile).not.toHaveBeenCalled()
    })
})
