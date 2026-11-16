import { AppState } from 'react-native'

import { APP_STATES } from '@/shared/constants/app-state'

let cached = null

export const invalidateMediaIndex = () => {
    cached = null
}

export const getAttachmentEntries = (rootUri, scanAttachments) => {
    if (cached?.rootUri !== rootUri) cached = { rootUri, entries: scanAttachments(rootUri) }

    return cached.entries
}

AppState.addEventListener('change', (state) => {
    if (state === APP_STATES.ACTIVE) invalidateMediaIndex()
})
