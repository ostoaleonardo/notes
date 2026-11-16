import { extractWikiLinkTexts } from '@/utils/note-links'
import { findInlineTags } from '@/utils/inline-tags'
import { findHeadings } from '@/utils/headings'
import { findAllBlocks } from '@/features/editor/utils/block-refs'
import { extractEmbedImageNames, extractEmbedMediaNames } from '@/features/editor/utils/embeds'
import { findCustomTaskRanges } from '@/features/editor/utils/tasks'

export const describeNote = (text) => ({
    links: extractWikiLinkTexts(text),
    tags: findInlineTags(text),
    headings: findHeadings(text),
    blocks: findAllBlocks(text),
    embedMedia: extractEmbedMediaNames(text, { pdf: true }),
    embedImages: extractEmbedImageNames(text),
    customTasks: findCustomTaskRanges(text)
})
