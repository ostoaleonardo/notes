import { extractBlock } from '../../shared/utils/block-refs'
import { extractSection } from '../../../../shared/utils/headings'

import { BLOCK_ANCHOR_PREFIX } from '@/shared/constants/block-refs'

export const extractEmbedSource = (text, anchor) => {
    if (!anchor) return text
    if (anchor.startsWith(BLOCK_ANCHOR_PREFIX)) return extractBlock(text, anchor.slice(BLOCK_ANCHOR_PREFIX.length))
    return extractSection(text, anchor)
}
