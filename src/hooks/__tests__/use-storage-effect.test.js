import { act, renderHook } from '@testing-library/react-native'

import { useStorageEffect } from '../use-storage-effect'

let resolveGetItem
const mockGetItem = jest.fn(() => new Promise((resolve) => { resolveGetItem = resolve }))

jest.mock('../use-storage', () => ({
    useStorage: () => ({ getItem: mockGetItem })
}))

beforeEach(() => {
    jest.clearAllMocks()
})

test('calls onValue with the resolved storage value', async () => {
    const onValue = jest.fn()

    await renderHook(() => useStorageEffect('some-key', onValue))

    await act(async () => {
        resolveGetItem('stored-value')
    })

    expect(onValue).toHaveBeenCalledWith('stored-value')
})

test('does nothing when the key is falsy', async () => {
    const onValue = jest.fn()

    await renderHook(() => useStorageEffect(null, onValue))

    expect(mockGetItem).not.toHaveBeenCalled()
})

test('does not call onValue after the hook unmounts', async () => {
    const onValue = jest.fn()

    const { unmount } = await renderHook(() => useStorageEffect('some-key', onValue))

    await act(async () => {
        unmount()
    })

    await act(async () => {
        resolveGetItem('stored-value')
    })

    expect(onValue).not.toHaveBeenCalled()
})

test('re-fetches when the key changes', async () => {
    const onValue = jest.fn()

    const { rerender } = await renderHook(
        ({ key }) => useStorageEffect(key, onValue),
        { initialProps: { key: 'key-a' } }
    )

    await act(async () => {
        resolveGetItem('value-a')
    })

    await rerender({ key: 'key-b' })

    await act(async () => {
        resolveGetItem('value-b')
    })

    expect(mockGetItem).toHaveBeenNthCalledWith(1, 'key-a')
    expect(mockGetItem).toHaveBeenNthCalledWith(2, 'key-b')
    expect(onValue).toHaveBeenCalledWith('value-a')
    expect(onValue).toHaveBeenCalledWith('value-b')
})
