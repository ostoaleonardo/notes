import { renderHook } from '@testing-library/react-native'

import { useNavigationReadiness } from '../use-navigation-readiness'

describe('navigation readiness', () => {
    test('renders nothing while repositories are still loading', async () => {
        const { result } = await renderHook(() => useNavigationReadiness({
            loading: true,
            reconciled: false,
            activeRepository: null,
            notesLoading: true
        }))

        expect(result.current).toEqual({
            isReady: false,
            needsGate: false,
            showDrawer: false,
            shouldRenderNothing: true
        })
    })

    test('needs the gate once settled with no active repository', async () => {
        const { result } = await renderHook(() => useNavigationReadiness({
            loading: false,
            reconciled: true,
            activeRepository: null,
            notesLoading: false
        }))

        expect(result.current).toEqual({
            isReady: false,
            needsGate: true,
            showDrawer: false,
            shouldRenderNothing: false
        })
    })

    test('is ready and shows the drawer once settled with notes loaded', async () => {
        const { result } = await renderHook(() => useNavigationReadiness({
            loading: false,
            reconciled: true,
            activeRepository: { id: 'r1' },
            notesLoading: false
        }))

        expect(result.current).toEqual({
            isReady: true,
            needsGate: false,
            showDrawer: true,
            shouldRenderNothing: false
        })
    })

    test('keeps showing the drawer while notes reload after being ready', async () => {
        const { result, rerender } = await renderHook(
            (props) => useNavigationReadiness(props),
            {
                initialProps: {
                    loading: false,
                    reconciled: true,
                    activeRepository: { id: 'r1' },
                    notesLoading: false
                }
            }
        )

        expect(result.current.showDrawer).toBe(true)

        await rerender({
            loading: false,
            reconciled: true,
            activeRepository: { id: 'r1' },
            notesLoading: true
        })

        expect(result.current).toEqual({
            isReady: false,
            needsGate: false,
            showDrawer: true,
            shouldRenderNothing: false
        })
    })

    test('keeps showing something while switching repositories away from the active one', async () => {
        const { result, rerender } = await renderHook(
            (props) => useNavigationReadiness(props),
            {
                initialProps: {
                    loading: false,
                    reconciled: true,
                    activeRepository: { id: 'r1' },
                    notesLoading: false
                }
            }
        )

        expect(result.current.isReady).toBe(true)

        await rerender({
            loading: true,
            reconciled: true,
            activeRepository: { id: 'r1' },
            notesLoading: false
        })

        expect(result.current).toEqual({
            isReady: false,
            needsGate: false,
            showDrawer: true,
            shouldRenderNothing: true
        })
    })

    test('avoids a blank screen when transitioning from the gate towards ready', async () => {
        const { result, rerender } = await renderHook(
            (props) => useNavigationReadiness(props),
            {
                initialProps: {
                    loading: false,
                    reconciled: true,
                    activeRepository: null,
                    notesLoading: false
                }
            }
        )

        expect(result.current.needsGate).toBe(true)

        await rerender({
            loading: false,
            reconciled: true,
            activeRepository: { id: 'r1' },
            notesLoading: true
        })

        expect(result.current).toEqual({
            isReady: false,
            needsGate: false,
            showDrawer: false,
            shouldRenderNothing: false
        })
    })
})
