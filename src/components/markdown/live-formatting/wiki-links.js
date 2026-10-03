import { Decoration } from '@codemirror/view'

import { isRangeSelected, overlapsAny } from './utils'

import { resolveWikiLinkTarget } from '@/utils/wiki-links'

import { WIKI_LINK_PATTERN, WIKI_LINK_ANCHOR_SEPARATOR } from '@/constants/wiki-links'

export const findWikiLinkRanges = (text) => {
    const ranges = []

    for (const match of text.matchAll(WIKI_LINK_PATTERN)) {
        const from = match.index
        const to = from + match[0].length
        const linkText = match[1]
        const alias = match[2]

        const anchorIndex = linkText.indexOf(WIKI_LINK_ANCHOR_SEPARATOR)
        const head = anchorIndex === -1 ? linkText : linkText.slice(0, anchorIndex)
        const separatorIndex = head.lastIndexOf('/')

        const labelFrom = alias !== undefined
            ? from + 2 + linkText.length + 1
            : from + 2 + (separatorIndex === -1 ? 0 : separatorIndex + 1)

        ranges.push({ from, to, linkText, labelFrom, labelTo: to - 2 })
    }

    return ranges
}

const resolverInputsByEntries = new WeakMap()

const getResolverInputs = (noteEntries) => {
    if (!resolverInputsByEntries.has(noteEntries)) {
        resolverInputsByEntries.set(noteEntries, {
            notes: noteEntries.map(({ id, title, aliases }) => ({ path: id, title, properties: { aliases } })),
            notePaths: new Map(noteEntries.map(({ id, path }) => [id, path]))
        })
    }

    return resolverInputsByEntries.get(noteEntries)
}

export const decorateWikiLinks = ({ ranges, codeRanges, wikiLinkRanges, noteEntries, selection }) => {
    const { notes, notePaths } = getResolverInputs(noteEntries)

    for (const { from, to, linkText, labelFrom, labelTo } of wikiLinkRanges) {
        if (overlapsAny(from, to, codeRanges)) continue

        const resolved = !!resolveWikiLinkTarget(linkText, notes, notePaths)
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
