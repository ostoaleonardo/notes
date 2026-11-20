import { renderHook } from '@testing-library/react-native'

import { useNavigationReadiness } from '../use-navigation-readiness'

describe('navigation readiness', () => {
    test('renders nothing while folders are still loading', async () => {
        const { result } = await renderHook(() => useNavigationReadiness({
            loading: true,
            activeFolder: null,
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
            activeFolder: null,
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
            activeFolder: { id: 'r1' },
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
                    activeFolder: { id: 'r1' },
                    notesLoading: false
                }
            }
        )

        expect(result.current.showDrawer).toBe(true)

        await rerender({
            loading: false,
            activeFolder: { id: 'r1' },
            notesLoading: true
        })

        expect(result.current).toEqual({
            isReady: false,
            needsGate: false,
            showDrawer: true,
            shouldRenderNothing: false
        })
    })

    test('goes back to the gate while a forgotten folder is replaced and its notes load', async () => {
        const { result, rerender } = await renderHook(
            (props) => useNavigationReadiness(props),
            {
                initialProps: {
                    loading: false,
                    activeFolder: { id: 'r1' },
                    notesLoading: false
                }
            }
        )

        await rerender({
            loading: false,
            activeFolder: null,
            notesLoading: false
        })
        await rerender({
            loading: false,
            activeFolder: { id: 'r2' },
            notesLoading: true
        })

        expect(result.current.showDrawer).toBe(false)
        expect(result.current.needsGate).toBe(false)
    })

    test('keeps showing something while switching away from the active repository', async () => {
        const { result, rerender } = await renderHook(
            (props) => useNavigationReadiness(props),
            {
                initialProps: {
                    loading: false,
                    activeFolder: { id: 'r1' },
                    notesLoading: false
                }
            }
        )

        expect(result.current.isReady).toBe(true)

        await rerender({
            loading: true,
            activeFolder: { id: 'r1' },
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
                    activeFolder: null,
                    notesLoading: false
                }
            }
        )

        expect(result.current.needsGate).toBe(true)

        await rerender({
            loading: false,
            activeFolder: { id: 'r1' },
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
