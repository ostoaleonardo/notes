import { Decoration, EditorView } from '@codemirror/view'

import { isRangeSelected, overlapsAny } from './utils'
import { fullSyntaxTree } from '@/components/markdown/full-syntax-tree'
import { ImageWidget, MediaWidget, PdfWidget } from './widgets'

import { isSameNoteTarget } from '@/utils/wiki-links'
import { parseEmbedMedia } from '@/utils/embed-media'
import { buildFileLinkUrl, isFileLinkTarget } from '@/utils/file-links'
import { buildIconMaskUrl } from '@/utils/icon-mask'

import { TRANSPARENT } from '@/constants/themes'
import { RADIUS, OPACITY } from '@/constants/theme'
import { FILE_LINK_LIVE_CLASS } from '@/constants/file-links'
import { ATTACH_FILE_ICON_PATH } from '@/constants/icon-paths'

import { WIKI_LINK_ANCHOR_SEPARATOR } from '@/constants/wiki-links'
import { NOTE_NODES, WIKI_LINK_MARK_LENGTH } from '@/constants/note-syntax'
import { EMBED_LIVE_CLASS, EMBED_MARKER } from '@/constants/embeds'
import { FILE_KINDS } from '@/constants/file-types'

const toRange = (node, text, offset) => {
    const isEmbed = node.name === NOTE_NODES.WIKI_EMBED
    const linkStart = node.from + offset + (isEmbed ? EMBED_MARKER.length : 0)
    const target = node.node.getChild(NOTE_NODES.WIKI_LINK_TARGET)
    const linkText = text.slice(target.from + offset, target.to + offset)
    const to = node.to + offset

    const anchorIndex = linkText.indexOf(WIKI_LINK_ANCHOR_SEPARATOR)
    const head = anchorIndex === -1 ? linkText : linkText.slice(0, anchorIndex)
    const separatorIndex = head.lastIndexOf('/')

    const labelFrom = node.node.getChild(NOTE_NODES.WIKI_LINK_ALIAS)
        ? linkStart + WIKI_LINK_MARK_LENGTH + linkText.length + 1
        : linkStart + WIKI_LINK_MARK_LENGTH + (separatorIndex === -1 ? 0 : separatorIndex + 1)

    return {
        from: isEmbed ? linkStart - EMBED_MARKER.length : linkStart,
        to,
        linkText,
        labelFrom,
        labelTo: to - WIKI_LINK_MARK_LENGTH,
        isEmbed
    }
}

export const findWikiLinkRanges = (tree, text, from = 0, to = text.length) => {
    const ranges = []

    tree.iterate({
        from,
        to,
        enter: (node) => {
            if (node.name !== NOTE_NODES.WIKI_LINK && node.name !== NOTE_NODES.WIKI_EMBED) return
            if (node.from < from || node.to > to) return false

            ranges.push(toRange(node, text, -from))
            return false
        }
    })

    return ranges
}

const buildMediaWidget = ({ name, kind, page }, url, linkText) => {
    if (kind === FILE_KINDS.IMAGE) return new ImageWidget(url, linkText)
    if (kind === FILE_KINDS.PDF) return new PdfWidget(url, name, page)

    return new MediaWidget(kind, url)
}

export const decorateWikiLinks = ({ ranges, codeRanges, wikiLinkRanges, resolvedLinks, selection, mediaMap }) => {
    for (const { from, to, linkText, labelFrom, labelTo, isEmbed } of wikiLinkRanges) {
        if (overlapsAny(from, to, codeRanges)) continue

        const resolved = isSameNoteTarget(linkText) || resolvedLinks.get(linkText) !== false
        const media = isEmbed ? parseEmbedMedia(linkText.trim()) : null
        const mediaKind = media?.kind ?? null
        const isPendingKind = mediaKind && mediaKind !== FILE_KINDS.PDF
        const isEmbedTarget = isEmbed && (resolved || !!isPendingKind || !!mediaMap?.get(media?.name))
        const isFileTarget = !resolved && !isEmbedTarget && isFileLinkTarget(linkText)
        const className = isFileTarget
            ? FILE_LINK_LIVE_CLASS
            : isEmbedTarget ? EMBED_LIVE_CLASS : resolved ? 'cm-live-wikilink' : 'cm-live-wikilink-broken'

        if (isRangeSelected(selection, from, to)) {
            ranges.push(Decoration.mark({ class: className }).range(from, to))
            continue
        }

        const mediaUrl = media && mediaMap?.get(media.name)

        if (mediaUrl) {
            ranges.push(Decoration.replace({ widget: buildMediaWidget(media, mediaUrl, linkText) }).range(from, to))
            continue
        }

        const mediaPending = isEmbedTarget && !resolved && !mediaMap?.has(media?.name)

        if (mediaPending) {
            ranges.push(Decoration.replace({}).range(from, to))
            continue
        }

        if (from < labelFrom) ranges.push(Decoration.replace({}).range(from, labelFrom))
        if (labelFrom < labelTo) ranges.push(Decoration.mark({ class: className }).range(labelFrom, labelTo))
        if (labelTo < to) ranges.push(Decoration.replace({}).range(labelTo, to))
    }
}

const ATTACH_FILE_MASK = buildIconMaskUrl(ATTACH_FILE_ICON_PATH)

export const wikiLinksTheme = ({ colors }) => ({
    '.cm-live-wikilink': { color: colors.accentText, fontWeight: 'bold' },
    [`.${EMBED_LIVE_CLASS}`]: { color: colors.accentText, fontWeight: 'bold', fontStyle: 'italic' },
    [`.${FILE_LINK_LIVE_CLASS}`]: {
        color: colors.onBackground,
        padding: '1px 6px',
        cursor: 'pointer',
        backgroundColor: colors.surface,
        borderRadius: `${RADIUS.sm}px`,
        border: `1px solid ${colors.onBackground + TRANSPARENT[5]}`
    },
    [`.${FILE_LINK_LIVE_CLASS}::before`]: {
        content: '""',
        display: 'inline-block',
        width: '1em',
        height: '1em',
        marginRight: '2px',
        verticalAlign: '-0.2em',
        backgroundColor: 'currentColor',
        opacity: OPACITY.secondary,
        mask: `${ATTACH_FILE_MASK} center / contain no-repeat`,
        WebkitMask: `${ATTACH_FILE_MASK} center / contain no-repeat`
    },
    '.cm-live-wikilink-broken': {
        color: colors.onBackground,
        opacity: OPACITY.secondary,
        textDecoration: 'underline dashed'
    }
})

export const fileLinkPress = (onPressRef) => EditorView.domEventHandlers({
    mousedown: (event, view) => {
        if (view.hasFocus || !event.target.closest?.(`.${FILE_LINK_LIVE_CLASS}`)) return false

        const position = view.posAtCoords({ x: event.clientX, y: event.clientY })
        if (position === null) return false

        const range = findWikiLinkRanges(fullSyntaxTree(view.state), view.state.doc.toString())
            .find(({ from, to, linkText }) => position >= from && position <= to && isFileLinkTarget(linkText))
        if (!range) return false

        event.preventDefault()
        onPressRef.current?.(buildFileLinkUrl(range.linkText))
        return true
    }
})
