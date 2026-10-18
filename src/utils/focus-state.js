import { ROOT_ENTITY, entityKey, entityExists } from '@/utils/connection-model'

import { CONNECTION_TYPES, HISTORY_LIMIT } from '@/constants/connections'

export const FOCUS_ACTIONS = {
    ENTER: 'enter',
    UP: 'up',
    JUMP: 'jump',
    PAGE: 'page',
    ORIGIN: 'origin'
}

export const INITIAL_FOCUS_STATE = { trail: [ROOT_ENTITY], page: 0 }

export const focusReducer = (state, action) => {
    switch (action.type) {
        case FOCUS_ACTIONS.ENTER: {
            const key = entityKey(action.entity)
            const existing = state.trail.findIndex((entity) => entityKey(entity) === key)

            if (existing === state.trail.length - 1) return state
            if (existing >= 0) return { trail: state.trail.slice(0, existing + 1), page: 0 }

            return { trail: [...state.trail, action.entity].slice(-HISTORY_LIMIT), page: 0 }
        }
        case FOCUS_ACTIONS.UP:
            return state.trail.length > 1 ? { trail: state.trail.slice(0, -1), page: 0 } : state
        case FOCUS_ACTIONS.JUMP:
            return { trail: state.trail.slice(0, action.index + 1), page: 0 }
        case FOCUS_ACTIONS.PAGE:
            return { ...state, page: action.page }
        case FOCUS_ACTIONS.ORIGIN:
            return {
                trail: action.entity.type === CONNECTION_TYPES.ROOT
                    ? [ROOT_ENTITY]
                    : [ROOT_ENTITY, action.entity],
                page: 0
            }
        default:
            return state
    }
}

export const validTrail = (trail, model) => {
    const end = trail.findIndex((entity) => !entityExists(entity, model))

    return end < 0 ? trail : trail.slice(0, Math.max(end, 1))
}
