import { pushOnce } from '@/shared/utils/navigation'

import { ROUTES } from '@/shared/constants/routes'

let session = null

export const openVersionHistory = (next) => {
    session = next
    pushOnce(ROUTES.VERSION_HISTORY)
}

export const getVersionHistorySession = () => session

export const clearVersionHistorySession = () => {
    session = null
}
