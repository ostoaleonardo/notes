import { useCallback, useMemo, useReducer } from 'react'

import { buildPathTree } from '@/utils/connection-tree'
import { buildTreeIndex, getSatellites, paginate } from '@/utils/focus-navigation'
import { FOCUS_ACTIONS, INITIAL_FOCUS_STATE, focusReducer, validTrail } from '@/utils/focus-state'

import { FOCUS } from '@/constants/connections'

export function useFocusNavigation(model) {
    const [state, dispatch] = useReducer(focusReducer, INITIAL_FOCUS_STATE)

    const trail = useMemo(() => validTrail(state.trail, model), [state.trail, model])
    const focus = trail[trail.length - 1]

    const treeIndex = useMemo(() => (
        buildTreeIndex(buildPathTree(model))
    ), [model])

    const all = useMemo(() => getSatellites(focus, model, treeIndex), [focus, model, treeIndex])
    const { items, page, pages } = useMemo(() => (
        paginate(all, state.page, FOCUS.pageSize)
    ), [all, state.page])

    const enter = useCallback((entity) => {
        dispatch({ type: FOCUS_ACTIONS.ENTER, entity })
    }, [])

    const up = useCallback(() => dispatch({ type: FOCUS_ACTIONS.UP }), [])

    const jump = useCallback((index) => dispatch({ type: FOCUS_ACTIONS.JUMP, index }), [])

    const setOrigin = useCallback((entity) => {
        dispatch({ type: FOCUS_ACTIONS.ORIGIN, entity })
    }, [])

    const turnPage = useCallback((delta) => {
        dispatch({ type: FOCUS_ACTIONS.PAGE, page: Math.min(Math.max(page + delta, 0), pages - 1) })
    }, [page, pages])

    return { trail, focus, satellites: items, page, pages, enter, up, jump, setOrigin, turnPage }
}
