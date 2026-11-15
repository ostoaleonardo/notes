import { act, renderHook } from '@testing-library/react-native'

import { useDrawerMounted } from '../use-drawer-mounted'

let mockReady = false

jest.mock('../use-deferred-ready', () => ({
    useDeferredReady: () => mockReady
}))

beforeEach(() => {
    mockReady = false
})

describe('drawer mounted', () => {
    test('waits until the app is idle while the drawer is closed', async () => {
        const { result } = await renderHook(() => useDrawerMounted(false))

        expect(result.current).toBe(false)
    })

    test('mounts once the app is idle', async () => {
        mockReady = true

        const { result } = await renderHook(() => useDrawerMounted(false))

        expect(result.current).toBe(true)
    })

    test('mounts right away when the drawer is opened early', async () => {
        const { result, rerender } = await renderHook(
            (open) => useDrawerMounted(open),
            { initialProps: false }
        )

        await act(async () => rerender(true))

        expect(result.current).toBe(true)
    })
})
