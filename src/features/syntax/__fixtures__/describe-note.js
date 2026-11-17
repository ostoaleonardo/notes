import { extractWikiLinkTexts } from '@/shared/utils/note-links'
import { findInlineTags } from '@/shared/utils/inline-tags'
import { findHeadings } from '@/shared/utils/headings'
import { findAllBlocks } from '@/features/editor/shared/utils/block-refs'
import { extractEmbedImageNames } from '@/features/editor/native/utils/embeds'

export const describeNote = (text) => ({
    links: extractWikiLinkTexts(text),
    tags: findInlineTags(text),
    headings: findHeadings(text),
    blocks: findAllBlocks(text),
    embedImages: extractEmbedImageNames(text)
})
