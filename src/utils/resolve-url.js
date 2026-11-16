import { File } from 'expo-file-system'

import { MIME_TYPES } from '@/constants/mime-types'

export const resolveUrl = async (url) => {
    try {
        const file = new File(url)
        const base64 = await file.base64()
        const mime = file.type || MIME_TYPES.JPEG
        return `data:${mime};base64,${base64}`
    } catch {
        return url
    }
}
