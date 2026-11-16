import { GFM, parser } from '@lezer/markdown'

import { blockId } from './block-id'
import { callout } from './callout'
import { customTask } from './custom-task'
import { frontmatter } from './frontmatter'
import { inlineTag } from './inline-tag'
import { comment, highlight } from './marks'
import { math } from './math'
import { wikiLink } from './wiki-link'

export const extensions = [
    frontmatter,
    wikiLink,
    inlineTag,
    blockId,
    highlight,
    comment,
    math,
    customTask,
    callout
]

export const noteParser = parser.configure([GFM, ...extensions])
