import { Decoration } from '@codemirror/view'

import { isRangeSelected, overlapsAny } from './utils'

import { WIKI_LINK_PATTERN } from '@/constants/wiki-links'

export const findWikiLinkRanges = (text) => {
    const ranges = []

    for (const match of text.matchAll(WIKI_LINK_PATTERN)) {
        const from = match.index
        const to = from + match[0].length
        const linkText = match[1]
        const alias = match[2]

        const separatorIndex = linkText.lastIndexOf('/')
        const path = separatorIndex === -1 ? '' : linkText.slice(0, separatorIndex)
        const title = separatorIndex === -1 ? linkText : linkText.slice(separatorIndex + 1)

        const labelFrom = alias !== undefined
            ? from + 2 + linkText.length + 1
            : from + 2 + (separatorIndex === -1 ? 0 : separatorIndex + 1)

        ranges.push({ from, to, path, title, labelFrom, labelTo: to - 2 })
    }

    return ranges
}

export const decorateWikiLinks = ({ ranges, codeRanges, wikiLinkRanges, noteEntries, selection }) => {
    for (const { from, to, title, path, labelFrom, labelTo } of wikiLinkRanges) {
        if (overlapsAny(from, to, codeRanges)) continue

        const normalizedTitle = title.trim().toLowerCase()
        const normalizedPath = path.trim().toLowerCase()

        const resolved = noteEntries.some((entry) => (
            entry.title.trim().toLowerCase() === normalizedTitle
            && (!normalizedPath || (entry.path || '').trim().toLowerCase() === normalizedPath)
        ))
        const className = resolved ? 'cm-live-wikilink' : 'cm-live-wikilink-broken'

        if (isRangeSelected(selection, from, to)) {
            ranges.push(Decoration.mark({ class: className }).range(from, to))
            continue
        }

        if (from < labelFrom) ranges.push(Decoration.replace({}).range(from, labelFrom))
        if (labelFrom < labelTo) ranges.push(Decoration.mark({ class: className }).range(labelFrom, labelTo))
        if (labelTo < to) ranges.push(Decoration.replace({}).range(labelTo, to))
    }
}

export const wikiLinksTheme = ({ linkColor, onBackgroundColor }) => ({
    '.cm-live-wikilink': { color: linkColor, fontWeight: 'bold' },
    '.cm-live-wikilink-broken': { color: onBackgroundColor, opacity: 0.5, textDecoration: 'underline dashed' }
})
