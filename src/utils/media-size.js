import { File } from 'expo-file-system'

import { parseEmbedMedia } from './embed-media'

import { EMBED_MEDIA_MAX_BYTES } from '@/constants/embeds'
import { FILE_KINDS } from '@/constants/file-types'

export const isEmbeddableMedia = (name, uri) => {
    if (parseEmbedMedia(name).kind === FILE_KINDS.IMAGE) return true

    try {
        return new File(uri).size <= EMBED_MEDIA_MAX_BYTES
    } catch {
        return false
    }
}
