import { logError } from '@/utils/log-error'

import { LOG_MESSAGES } from '@/constants/log-messages'

export const copyText = async (text) => {
    try {
        await navigator.clipboard.writeText(text)
        return true
    } catch (error) {
        logError(LOG_MESSAGES.ERROR_COPYING_CODE, error)
        return false
    }
}
