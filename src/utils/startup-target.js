import { getEditorPath } from './editor-path'

import { ROUTES } from '@/constants/routes'
import { STARTUP_BEHAVIORS } from '@/constants/startup-behavior'

export const getStartupTarget = (behavior, currentId) => {
    if (behavior === STARTUP_BEHAVIORS.HOME) return null
    if (behavior === STARTUP_BEHAVIORS.NEW_NOTE) return ROUTES.ADD_NOTE
    if (behavior === STARTUP_BEHAVIORS.DAILY_NOTE) return ROUTES.DAILY_NOTE

    return currentId ? getEditorPath(currentId) : null
}
