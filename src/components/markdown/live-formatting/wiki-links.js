import { Decoration, EditorView } from '@codemirror/view'

import { isRangeSelected, overlapsAny } from './utils'
import { ImageWidget } from './widgets'

import { resolveWikiLinkTarget } from '@/utils/wiki-links'
import { buildFileLinkUrl, isFileLinkTarget } from '@/utils/file-links'
import { buildIconMaskUrl } from '@/utils/icon-mask'

import { TRANSPARENT } from '@/constants/themes'
import { RADIUS } from '@/constants/radius'
import { FILE_LINK_LIVE_CLASS } from '@/constants/file-links'
import { ATTACH_FILE_ICON_PATH } from '@/constants/icon-paths'

import { WIKI_LINK_PATTERN, WIKI_LINK_ANCHOR_SEPARATOR } from '@/constants/wiki-links'
import { EMBED_IMAGE_PATTERN, EMBED_LIVE_CLASS, EMBED_MARKER } from '@/constants/embeds'

export const findWikiLinkRanges = (text) => {
    const ranges = []

    for (const match of text.matchAll(WIKI_LINK_PATTERN)) {
        const linkStart = match.index
        const isEmbed = text[linkStart - 1] === EMBED_MARKER
        const from = isEmbed ? linkStart - 1 : linkStart
        const to = linkStart + match[0].length
        const linkText = match[1]
        const alias = match[2]

        const anchorIndex = linkText.indexOf(WIKI_LINK_ANCHOR_SEPARATOR)
        const head = anchorIndex === -1 ? linkText : linkText.slice(0, anchorIndex)
        const separatorIndex = head.lastIndexOf('/')

        const labelFrom = alias !== undefined
            ? linkStart + 2 + linkText.length + 1
            : linkStart + 2 + (separatorIndex === -1 ? 0 : separatorIndex + 1)

        ranges.push({ from, to, linkText, labelFrom, labelTo: to - 2, isEmbed })
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

export const decorateWikiLinks = ({ ranges, codeRanges, wikiLinkRanges, noteEntries, selection, mediaMap }) => {
    const { notes, notePaths } = getResolverInputs(noteEntries)

    for (const { from, to, linkText, labelFrom, labelTo, isEmbed } of wikiLinkRanges) {
        if (overlapsAny(from, to, codeRanges)) continue

        const resolved = !!resolveWikiLinkTarget(linkText, notes, notePaths)
        const isEmbedTarget = isEmbed && (resolved || EMBED_IMAGE_PATTERN.test(linkText.trim()))
        const isFileTarget = !resolved && !isEmbedTarget && isFileLinkTarget(linkText)
        const className = isFileTarget
            ? FILE_LINK_LIVE_CLASS
            : isEmbedTarget ? EMBED_LIVE_CLASS : resolved ? 'cm-live-wikilink' : 'cm-live-wikilink-broken'

        if (isRangeSelected(selection, from, to)) {
            ranges.push(Decoration.mark({ class: className }).range(from, to))
            continue
        }

        const imageUrl = isEmbed && mediaMap?.get(linkText.trim())

        if (imageUrl) {
            ranges.push(Decoration.replace({ widget: new ImageWidget(imageUrl, linkText) }).range(from, to))
            continue
        }

        const imagePending = isEmbedTarget && !resolved && !mediaMap?.has(linkText.trim())

        if (imagePending) {
            ranges.push(Decoration.replace({}).range(from, to))
            continue
        }

        if (from < labelFrom) ranges.push(Decoration.replace({}).range(from, labelFrom))
        if (labelFrom < labelTo) ranges.push(Decoration.mark({ class: className }).range(labelFrom, labelTo))
        if (labelTo < to) ranges.push(Decoration.replace({}).range(labelTo, to))
    }
}

const ATTACH_FILE_MASK = buildIconMaskUrl(ATTACH_FILE_ICON_PATH)

export const wikiLinksTheme = ({ linkColor, onBackgroundColor, surfaceColor }) => ({
    '.cm-live-wikilink': { color: linkColor, fontWeight: 'bold' },
    [`.${EMBED_LIVE_CLASS}`]: { color: linkColor, fontWeight: 'bold', fontStyle: 'italic' },
    [`.${FILE_LINK_LIVE_CLASS}`]: {
        color: onBackgroundColor,
        padding: '1px 6px',
        cursor: 'pointer',
        backgroundColor: surfaceColor,
        borderRadius: `${RADIUS.segment}px`,
        border: `1px solid ${onBackgroundColor + TRANSPARENT[5]}`
    },
    [`.${FILE_LINK_LIVE_CLASS}::before`]: {
        content: '""',
        display: 'inline-block',
        width: '1em',
        height: '1em',
        marginRight: '2px',
        verticalAlign: '-0.2em',
        backgroundColor: 'currentColor',
        opacity: 0.6,
        mask: `${ATTACH_FILE_MASK} center / contain no-repeat`,
        WebkitMask: `${ATTACH_FILE_MASK} center / contain no-repeat`
    },
    '.cm-live-wikilink-broken': { color: onBackgroundColor, opacity: 0.5, textDecoration: 'underline dashed' }
})

export const fileLinkPress = (onPressRef) => EditorView.domEventHandlers({
    mousedown: (event, view) => {
        if (view.hasFocus || !event.target.closest?.(`.${FILE_LINK_LIVE_CLASS}`)) return false

        const position = view.posAtCoords({ x: event.clientX, y: event.clientY })
        if (position === null) return false

        const range = findWikiLinkRanges(view.state.doc.toString())
            .find(({ from, to, linkText }) => position >= from && position <= to && isFileLinkTarget(linkText))
        if (!range) return false

        event.preventDefault()
        onPressRef.current?.(buildFileLinkUrl(range.linkText))
        return true
    }
})
