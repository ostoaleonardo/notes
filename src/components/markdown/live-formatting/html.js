import { Decoration } from '@codemirror/view'

import { isRangeSelected } from './utils'
import { HtmlWidget } from './widgets'
import { renderMarkdownHtml } from '../markdown-dom-render-html'

import { HTML_BLOCK_NODE_NAMES, HTML_NODE_NAMES, HTML_RENDER_CACHE_LIMIT } from '@/constants/markdown-live-formatting'

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
        ranges.push(Decoration.replace({ widget: new HtmlWidget(html, 'cm-live-block'), block: true }).range(node.from, node.to))
        return true
    }

    ranges.push(Decoration.mark({ class: 'cm-live-inline-html' }).range(node.from, node.to))
    return true
}

export const htmlTheme = ({
    linkColor,
    codeBackgroundColor,
    headingFontFamily
}) => ({
    '.cm-live-block': { display: 'block', overflowX: 'auto' },
    '.cm-live-block table': { borderCollapse: 'collapse' },
    '.cm-live-block th, .cm-live-block td': { border: `1px solid ${codeBackgroundColor}`, padding: '4px 8px' },
    '.cm-live-block code': { backgroundColor: codeBackgroundColor, borderRadius: '4px', padding: '0.1em 0.3em', fontFamily: 'monospace' },
    '.cm-live-block img': { maxWidth: '100%', borderRadius: '8px' },
    '.cm-live-block a': { color: linkColor },
    '.cm-live-block h1, .cm-live-block h2, .cm-live-block h3, .cm-live-block h4, .cm-live-block h5, .cm-live-block h6': {
        fontWeight: 'bold', fontFamily: headingFontFamily
    },
    '.cm-live-inline-html': { fontFamily: 'ui-monospace, monospace', opacity: 0.6 }
})
