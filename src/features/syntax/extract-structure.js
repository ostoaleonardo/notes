import { noteParser } from './note-parser'

import {
    ATX_HEADING_PATTERN,
    CUSTOM_TASK_STATUS_OFFSET,
    ESCAPED_PIPE_SUFFIX,
    HEADER_MARK_NODE,
    LINK_NODE,
    NOTE_NODES,
    URL_NODE
} from '@/shared/constants/note-syntax'
import { CUSTOM_TASK_MARKER_LENGTH } from '@/shared/constants/tasks'
import { WIKI_LINK_SCHEME } from '@/shared/constants/wiki-links'

const readTarget = (text, node) => {
    const target = text.slice(node.from, node.to)

    return target.endsWith(ESCAPED_PIPE_SUFFIX) ? target.slice(0, -ESCAPED_PIPE_SUFFIX.length) : target
}

const readHeading = (text, node, level) => {
    let contentFrom = node.from
    let contentTo = node.to
    let isOpening = true

    node.node.cursor().iterate((child) => {
        if (child.name !== HEADER_MARK_NODE) return

        if (isOpening) contentFrom = child.to
        else contentTo = child.from

        isOpening = false
    })

    return { level, text: text.slice(contentFrom, contentTo).trim(), from: node.from }
}

const readLinkTarget = (text, node) => {
    const url = node.node.getChild(URL_NODE)
    if (!url) return null

    const value = text.slice(url.from, url.to)

    return value.startsWith(WIKI_LINK_SCHEME)
        ? { target: value.slice(WIKI_LINK_SCHEME.length), from: node.from, to: node.to }
        : null
}

export const extractNoteStructure = (text, tree = noteParser.parse(text)) => {
    const structure = { links: [], markdownLinks: [], tags: [], headings: [], customTasks: [] }
    let frontmatterEnd = -1

    tree.iterate({
        enter: (node) => {
            const { name } = node

            if (name === NOTE_NODES.FRONTMATTER) frontmatterEnd = node.to

            if (name === NOTE_NODES.WIKI_LINK || name === NOTE_NODES.WIKI_EMBED) {
                const target = node.node.getChild(NOTE_NODES.WIKI_LINK_TARGET)

                structure.links.push({
                    target: readTarget(text, target),
                    from: node.from,
                    to: node.to,
                    isEmbed: name === NOTE_NODES.WIKI_EMBED
                })
            } else if (name === NOTE_NODES.TAG && node.from >= frontmatterEnd) {
                structure.tags.push({ name: text.slice(node.from + 1, node.to), from: node.from, to: node.to })
            } else if (name === NOTE_NODES.CUSTOM_TASK_MARKER) {
                structure.customTasks.push({
                    from: node.from,
                    to: node.from + CUSTOM_TASK_MARKER_LENGTH,
                    status: text[node.from + CUSTOM_TASK_STATUS_OFFSET]
                })
            } else if (name === LINK_NODE) {
                const link = readLinkTarget(text, node)
                if (link) structure.markdownLinks.push(link)
            } else {
                const heading = ATX_HEADING_PATTERN.exec(name)
                if (heading) structure.headings.push(readHeading(text, node, Number(heading[1])))
            }
        }
    })

    return structure
}
