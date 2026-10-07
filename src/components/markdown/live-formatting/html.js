import { Decoration } from '@codemirror/view'

import { isRangeSelected } from './utils'
import { HtmlWidget } from './widgets'
import { renderMarkdownHtml } from '@/components/markdown/markdown-dom-render-html'

import { HTML_BLOCK_NODE_NAMES, HTML_NODE_NAMES, HTML_RENDER_CACHE_LIMIT } from '@/constants/markdown-live-formatting'
import { OPACITY, INLINE_CODE_STYLE, MONOSPACE_FONT_FAMILY } from '@/constants/theme'

const BLOCK_NODE_NAMES = new Set(HTML_BLOCK_NODE_NAMES)
const htmlCache = new Map()

const renderMarkdownHtmlCached = (source) => {
    if (htmlCache.has(source)) return htmlCache.get(source)

    const html = renderMarkdownHtml(source)

    if (htmlCache.size >= HTML_RENDER_CACHE_LIMIT) htmlCache.delete(htmlCache.keys().next().value)
    htmlCache.set(source, html)

    return html
}

export const htmlNodeNames = HTML_NODE_NAMES

export const decorateHtml = (node, { doc, selection, ranges }) => {
    if (isRangeSelected(selection, node.from, node.to)) return true

    if (BLOCK_NODE_NAMES.has(node.name)) {
        const html = renderMarkdownHtmlCached(doc.sliceString(node.from, node.to))
        const widget = new HtmlWidget(html, 'cm-live-block')
        ranges.push(Decoration.replace({ widget, block: true }).range(node.from, node.to))
        return true
    }

    ranges.push(Decoration.mark({ class: 'cm-live-inline-html' }).range(node.from, node.to))
    return true
}

export const htmlTheme = ({ colors, typography }) => ({
    '.cm-live-block': { display: 'block', overflowX: 'auto' },
    '.cm-live-block table': { borderCollapse: 'collapse' },
    '.cm-live-block th, .cm-live-block td': { border: `1px solid ${colors.codeBackground}`, padding: '4px 8px' },
    '.cm-live-block code': { backgroundColor: colors.codeBackground, ...INLINE_CODE_STYLE, fontFamily: 'monospace' },
    '.cm-live-block img': { maxWidth: '100%', borderRadius: '8px' },
    '.cm-live-block a': { color: colors.tertiary },
    '.cm-live-block h1, .cm-live-block h2, .cm-live-block h3, .cm-live-block h4, .cm-live-block h5, .cm-live-block h6': {
        fontWeight: 'bold', fontFamily: typography.headingFontFamily
    },
    '.cm-live-inline-html': { fontFamily: MONOSPACE_FONT_FAMILY, opacity: OPACITY.secondary }
})
