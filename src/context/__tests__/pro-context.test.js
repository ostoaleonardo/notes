import { useContext } from 'react'
import { act, renderHook } from '@testing-library/react-native'

import { ProContext, ProProvider } from '../pro-context'

const setup = (isPro) => renderHook(() => useContext(ProContext), {
    wrapper: ({ children }) => <ProProvider isPro={isPro}>{children}</ProProvider>
})

describe('pro context', () => {
    const originalDev = global.__DEV__

    afterEach(() => {
        global.__DEV__ = originalDev
    })

    test('is not pro by default in production builds', async () => {
        global.__DEV__ = false

        const { result } = await setup(false)

        expect(result.current.pro).toBe(false)
    })

    test('is pro when the purchase is active', async () => {
        global.__DEV__ = false

        const { result } = await setup(true)

        expect(result.current.pro).toBe(true)
    })

    test('is always pro in development builds', async () => {
        global.__DEV__ = true

        const { result } = await setup(false)

        expect(result.current.pro).toBe(true)
    })

    test('lets consumers override the pro flag', async () => {
        global.__DEV__ = false
        const { result } = await setup(false)

        await act(async () => result.current.setPro(true))

        expect(result.current.pro).toBe(true)
    })
})
