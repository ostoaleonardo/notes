import { extractWikiLinkTexts } from '@/utils/note-links'
import { findInlineTags } from '@/utils/inline-tags'
import { findHeadings } from '@/utils/headings'
import { findAllBlocks } from '@/utils/block-refs'
import { extractEmbedImageNames, extractEmbedMediaNames } from '@/utils/embeds'
import { findCustomTaskRanges } from '@/utils/tasks'

export const describeNote = (text) => ({
    links: extractWikiLinkTexts(text),
    tags: findInlineTags(text),
    headings: findHeadings(text),
    blocks: findAllBlocks(text),
    embedMedia: extractEmbedMediaNames(text, { pdf: true }),
    embedImages: extractEmbedImageNames(text),
    customTasks: findCustomTaskRanges(text)
})
