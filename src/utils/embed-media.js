import { EMBED_AUDIO_PATTERN, EMBED_IMAGE_PATTERN, EMBED_VIDEO_PATTERN } from '@/constants/embeds'
import { FILE_KINDS } from '@/constants/file-types'

export const getEmbedMediaKind = (target) => {
    if (EMBED_IMAGE_PATTERN.test(target)) return FILE_KINDS.IMAGE
    if (EMBED_AUDIO_PATTERN.test(target)) return FILE_KINDS.AUDIO
    if (EMBED_VIDEO_PATTERN.test(target)) return FILE_KINDS.VIDEO

    return null
}
