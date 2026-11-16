import { GFM, parser } from '@lezer/markdown'

import { blockId } from './block-id'
import { customTask } from './custom-task'
import { inlineTag } from './inline-tag'
import { comment, highlight } from './marks'
import { wikiLink } from './wiki-link'

const noteExtensions = [wikiLink, inlineTag, blockId, highlight, comment, customTask]

export const noteParser = parser.configure([GFM, ...noteExtensions])
