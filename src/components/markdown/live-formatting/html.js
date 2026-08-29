import { Decoration } from '@codemirror/view'
import { HTML_BLOCK_NODE_NAMES, HTML_NODE_NAMES } from '@/constants/markdown-live-formatting'
import { isRangeSelected } from './utils'
import { HtmlWidget } from './widgets'
import { renderMarkdownHtml } from '../markdown-dom-render-html'

const BLOCK_NODE_NAMES = new Set(HTML_BLOCK_NODE_NAMES)

export const htmlNodeNames = HTML_NODE_NAMES

export const decorateHtml = (node, { doc, selection, ranges }) => {
    if (isRangeSelected(selection, node.from, node.to)) return true

    if (BLOCK_NODE_NAMES.has(node.name)) {
        const html = renderMarkdownHtml(doc.sliceString(node.from, node.to))
        ranges.push(Decoration.replace({ widget: new HtmlWidget(html, 'cm-live-block'), block: true }).range(node.from, node.to))
        return true
    }

    ranges.push(Decoration.mark({ class: 'cm-live-inline-html' }).range(node.from, node.to))
    return true
}

export const htmlTheme = ({ linkColor, codeBackgroundColor }) => ({
    '.cm-live-block': { display: 'block', margin: '0.4em 0', overflowX: 'auto' },
    '.cm-live-block table': { borderCollapse: 'collapse', width: '100%' },
    '.cm-live-block th, .cm-live-block td': { border: `1px solid ${codeBackgroundColor}`, padding: '4px 8px' },
    '.cm-live-block img': { maxWidth: '100%', borderRadius: '8px' },
    '.cm-live-block a': { color: linkColor },
    '.cm-live-inline-html': { fontFamily: 'ui-monospace, monospace', opacity: 0.6 }
})
