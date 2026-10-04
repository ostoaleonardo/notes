import { CODE_SEGMENT_PATTERN } from '@/constants/code-segments'
import { HEADING_PATTERN } from '@/constants/headings'
import { WIKI_LINK_ANCHOR_SEPARATOR, WIKI_LINK_PATTERN } from '@/constants/wiki-links'
import { BLOCK_ANCHOR_PREFIX } from '@/constants/block-refs'

import { mapOutsideCode } from '@/utils/outside-code'
import { resolveWikiLink } from '@/utils/wiki-links'

export const normalizeHeading = (text) => text.normalize('NFC').replace(/\s+/g, ' ').trim().toLowerCase()

export const findHeadings = (text) => {
    const codeRanges = [...text.matchAll(CODE_SEGMENT_PATTERN)].map((match) => [
        match.index,
        match.index + match[0].length
    ])

    const headings = []
    let from = 0

    for (const line of text.split('\n')) {
        const inCode = codeRanges.some(([start, end]) => from >= start && from < end)
        const match = inCode ? null : HEADING_PATTERN.exec(line)
        if (match) headings.push({ level: match[1].length, text: match[2].trim(), from })

        from += line.length + 1
    }

    return headings
}

export const buildOutline = (headings) => {
    const stack = []

    const items = headings.map((heading, index) => {
        while (stack.length && stack[stack.length - 1] >= heading.level) stack.pop()

        const item = { ...heading, index, depth: stack.length }
        stack.push(heading.level)
        return item
    })

    return items.map((item, position) => ({
        ...item,
        hasChildren: items[position + 1]?.depth > item.depth
    }))
}

export const getVisibleOutline = (items, collapsed) => {
    const visible = []
    let hiddenFrom = null

    for (const item of items) {
        if (hiddenFrom !== null && item.depth > hiddenFrom) continue

        hiddenFrom = collapsed.has(item.index) ? item.depth : null
        visible.push(item)
    }

    return visible
}

export const findHeadingRenames = (previous, next) => {
    const before = findHeadings(previous)
    const after = findHeadings(next)

    if (before.length !== after.length) return []

    return before.flatMap((heading, index) => {
        const current = after[index]
        const renamed = current.level === heading.level && current.text !== heading.text
        return renamed ? [{ from: heading.text, to: current.text }] : []
    })
}

export const renameHeadingLinks = (content, targetPath, renames, notes, notePaths = new Map()) => {
    if (!content || !renames.length) return content

    const targets = new Map(renames.map(({ from, to }) => [normalizeHeading(from), to]))

    return mapOutsideCode(content, (segment) => segment.replace(WIKI_LINK_PATTERN, (match, linkText, alias) => {
        const { note, target, anchor } = resolveWikiLink(linkText, notes, notePaths)
        if (note?.path !== targetPath || !anchor || anchor.startsWith(BLOCK_ANCHOR_PREFIX)) return match

        const renamed = targets.get(normalizeHeading(anchor))
        if (renamed === undefined) return match

        const link = `${target}${WIKI_LINK_ANCHOR_SEPARATOR}${renamed}`
        return alias === undefined ? `[[${link}]]` : `[[${link}|${alias}]]`
    }))
}
