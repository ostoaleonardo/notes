import { StateField } from '@codemirror/state'
import { syntaxTree } from '@codemirror/language'
import { Decoration, EditorView, WidgetType } from '@codemirror/view'
import { renderMarkdownHtml } from './markdown-dom-render-html'

const STYLED_NODE_TYPES = {
    StrongEmphasis: 'cm-live-strong',
    Emphasis: 'cm-live-em',
    Strikethrough: 'cm-live-strike',
    InlineCode: 'cm-live-code'
}

const HEADING_LEVELS = {
    ATXHeading1: 1,
    ATXHeading2: 2,
    ATXHeading3: 3,
    ATXHeading4: 4,
    ATXHeading5: 5,
    ATXHeading6: 6
}

const BLOCK_WIDGET_TYPES = new Set(['Table', 'HTMLBlock'])

class HtmlWidget extends WidgetType {
    constructor(html, className) {
        super()
        this.html = html
        this.className = className
    }

    eq(other) {
        return other.html === this.html && other.className === this.className
    }

    toDOM() {
        const container = document.createElement('div')
        container.className = this.className
        container.innerHTML = this.html
        return container
    }
}

class ImageWidget extends WidgetType {
    constructor(src, alt) {
        super()
        this.src = src
        this.alt = alt
    }

    eq(other) {
        return other.src === this.src && other.alt === this.alt
    }

    toDOM() {
        const img = document.createElement('img')
        img.className = 'cm-live-image'
        img.src = this.src
        img.alt = this.alt
        return img
    }
}

const collectMarks = (node) => {
    const marks = []
    let child = node.firstChild

    while (child) {
        if (child.name.endsWith('Mark')) marks.push({ from: child.from, to: child.to })
        child = child.nextSibling
    }

    return marks
}

const buildDecorations = (state) => {
    const ranges = []
    const selection = state.selection.main
    const doc = state.doc
    const isSelected = (from, to) => selection.from <= to && selection.to >= from

    syntaxTree(state).iterate({
        enter: (node) => {
            if (BLOCK_WIDGET_TYPES.has(node.name)) {
                if (isSelected(node.from, node.to)) return false

                const html = renderMarkdownHtml(doc.sliceString(node.from, node.to))
                ranges.push(Decoration.replace({ widget: new HtmlWidget(html, 'cm-live-block'), block: true }).range(node.from, node.to))
                return false
            }

            if (node.name === 'FencedCode') {
                ranges.push(Decoration.mark({ class: 'cm-live-codeblock' }).range(node.from, node.to))
                return false
            }

            if (node.name === 'Blockquote') {
                ranges.push(Decoration.mark({ class: 'cm-live-quote' }).range(node.from, node.to))
                return
            }

            if (node.name === 'QuoteMark' || node.name === 'ListMark' || node.name === 'TaskMarker') {
                ranges.push(Decoration.mark({ class: 'cm-live-accent-mark' }).range(node.from, node.to))
                return false
            }

            if (node.name === 'Image' || node.name === 'Link') {
                if (isSelected(node.from, node.to)) return false

                const marks = collectMarks(node.node)
                if (marks.length < 4) return false

                if (node.name === 'Image') {
                    const urlNode = node.node.getChild('URL')
                    const url = urlNode ? doc.sliceString(urlNode.from, urlNode.to) : ''
                    const alt = doc.sliceString(marks[0].to, marks[1].from)
                    ranges.push(Decoration.replace({ widget: new ImageWidget(url, alt) }).range(node.from, node.to))
                    return false
                }

                ranges.push(Decoration.replace({}).range(marks[0].from, marks[0].to))
                if (marks[0].to < marks[1].from) {
                    ranges.push(Decoration.mark({ class: 'cm-live-link' }).range(marks[0].to, marks[1].from))
                }
                ranges.push(Decoration.replace({}).range(marks[1].from, node.to))
                return false
            }

            const headingLevel = HEADING_LEVELS[node.name]
            if (headingLevel) {
                if (isSelected(node.from, node.to)) return false

                const mark = node.node.firstChild
                if (!mark || mark.name !== 'HeaderMark') return false

                let hideTo = mark.to
                if (doc.sliceString(hideTo, hideTo + 1) === ' ') hideTo += 1

                ranges.push(Decoration.replace({}).range(mark.from, hideTo))
                if (hideTo < node.to) {
                    ranges.push(Decoration.mark({ class: `cm-live-h${headingLevel}` }).range(hideTo, node.to))
                }

                return false
            }

            const className = STYLED_NODE_TYPES[node.name]
            if (!className) return

            if (isSelected(node.from, node.to)) return false

            const marks = collectMarks(node.node)
            if (marks.length < 2) return false

            const innerFrom = marks[0].to
            const innerTo = marks[marks.length - 1].from

            ranges.push(Decoration.replace({}).range(marks[0].from, marks[0].to))
            if (innerFrom < innerTo) ranges.push(Decoration.mark({ class: className }).range(innerFrom, innerTo))
            ranges.push(Decoration.replace({}).range(marks[marks.length - 1].from, marks[marks.length - 1].to))

            return false
        }
    })

    return Decoration.set(ranges, true)
}

export const liveFormatting = StateField.define({
    create: (state) => buildDecorations(state),
    update: (decorations, tr) => (tr.docChanged || tr.selection ? buildDecorations(tr.state) : decorations.map(tr.changes)),
    provide: (field) => EditorView.decorations.from(field)
})

export const buildLiveFormattingTheme = ({ linkColor, codeBackgroundColor }) => ({
    '.cm-live-strong': { fontWeight: 'bold' },
    '.cm-live-em': { fontStyle: 'italic' },
    '.cm-live-strike': { textDecoration: 'line-through' },
    '.cm-live-code': {
        fontFamily: 'ui-monospace, monospace',
        backgroundColor: codeBackgroundColor,
        borderRadius: '4px',
        padding: '0.1em 0.3em'
    },
    '.cm-live-h1': { fontWeight: 'bold', fontSize: '1.8em' },
    '.cm-live-h2': { fontWeight: 'bold', fontSize: '1.6em' },
    '.cm-live-h3': { fontWeight: 'bold', fontSize: '1.4em' },
    '.cm-live-h4': { fontWeight: 'bold', fontSize: '1.25em' },
    '.cm-live-h5': { fontWeight: 'bold', fontSize: '1.1em' },
    '.cm-live-h6': { fontWeight: 'bold', fontSize: '1em' },
    '.cm-live-link': { color: linkColor, textDecoration: 'underline' },
    '.cm-live-image': { maxWidth: '100%', borderRadius: '8px', display: 'block', margin: '0.4em 0' },
    '.cm-live-quote': { fontStyle: 'italic', opacity: 0.85 },
    '.cm-live-accent-mark': { color: linkColor, fontWeight: 'bold' },
    '.cm-live-codeblock': { fontFamily: 'ui-monospace, monospace', backgroundColor: codeBackgroundColor },
    '.cm-live-block': { display: 'block', margin: '0.4em 0', overflowX: 'auto' },
    '.cm-live-block table': { borderCollapse: 'collapse', width: '100%' },
    '.cm-live-block th, .cm-live-block td': { border: `1px solid ${codeBackgroundColor}`, padding: '4px 8px' },
    '.cm-live-block img': { maxWidth: '100%', borderRadius: '8px' },
    '.cm-live-block a': { color: linkColor }
})
