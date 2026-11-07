import { AppState } from 'react-native'

import { collectMediaUris } from '@/utils/attachments'

let cached = null

export const invalidateMediaIndex = () => {
    cached = null
}

export const getMediaIndex = (rootUri, listEntries) => {
    if (cached?.rootUri !== rootUri) cached = { rootUri, uris: collectMediaUris(rootUri, listEntries) }

    return cached.uris
}

AppState.addEventListener('change', (state) => {
    if (state === 'active') invalidateMediaIndex()
})
