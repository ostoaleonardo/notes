import { pushOnce } from '@/utils/navigation'

import { ROUTES } from '@/constants/routes'

let session = null

export const openVersionHistory = (next) => {
    session = next
    pushOnce(ROUTES.VERSION_HISTORY)
}

export const getVersionHistorySession = () => session

export const clearVersionHistorySession = () => {
    session = null
}
