import { Decoration, WidgetType } from '@codemirror/view'

import { isRangeSelected } from './utils'
import { getCodeLanguageLabel } from '@/components/markdown/syntax-highlighting/code-languages'

import {
    CODE_BLOCK_NODE_NAMES,
    CODE_LABEL_CLASS,
    CODE_LABEL_PLACEHOLDER,
    CODE_FIRST_LINE_CLASS,
    CODE_LAST_LINE_CLASS,
    CODE_FENCED_LAST_LINE_CLASS,
    CODE_HIDDEN_CLASS,
    CODE_OPEN_LINE_CLASS,
    CODE_CLOSE_LINE_CLASS
} from '@/constants/markdown-live-formatting'
import { OPACITY, RADIUS, MONOSPACE_FONT_FAMILY } from '@/constants/theme'
import { LEZER_NODES } from '@/constants/lezer-nodes'

export const codeBlockNodeNames = CODE_BLOCK_NODE_NAMES

class CodeLabelWidget extends WidgetType {
    constructor(label) {
        super()
        this.label = label
    }

    eq(other) {
        return other.label === this.label
    }

    toDOM() {
        const element = document.createElement('span')
        element.className = CODE_LABEL_CLASS
        element.textContent = this.label || CODE_LABEL_PLACEHOLDER
        return element
    }
}

const decorateFocusedFences = (node, ranges) => {
    for (const mark of node.node.getChildren(LEZER_NODES.CODE_MARK)) {
        ranges.push(Decoration.mark({ class: 'cm-live-codeblock-fence' }).range(mark.from, mark.to))
    }

    const info = node.node.getChild(LEZER_NODES.CODE_INFO)
    if (info) ranges.push(Decoration.mark({ class: 'cm-live-codeblock-fence' }).range(info.from, info.to))
}

const decorateCollapsedFences = (node, { doc, ranges }, startLine, endLine, hasClosingFence) => {
    const info = node.node.getChild(LEZER_NODES.CODE_INFO)
    const label = info ? getCodeLanguageLabel(doc.sliceString(info.from, info.to).trim().split(/\s/)[0]) : ''
    const openLine = doc.line(startLine)

    ranges.push(Decoration.line({ class: CODE_OPEN_LINE_CLASS }).range(openLine.from))
    ranges.push(Decoration.widget({ widget: new CodeLabelWidget(label), side: -1 }).range(openLine.from))
    ranges.push(Decoration.mark({ class: CODE_HIDDEN_CLASS }).range(openLine.from, openLine.to))

    const closeLine = doc.line(endLine)

    if (hasClosingFence && closeLine.to > closeLine.from) {
        ranges.push(Decoration.line({ class: CODE_CLOSE_LINE_CLASS }).range(closeLine.from))
        ranges.push(Decoration.mark({ class: CODE_HIDDEN_CLASS }).range(closeLine.from, closeLine.to))
    }
}

export const decorateCodeBlock = (node, context) => {
    const { doc, selection, ranges } = context
    const startLine = doc.lineAt(node.from).number
    const endLine = doc.lineAt(node.to).number
    const focused = isRangeSelected(selection, node.from, node.to)
    const marks = node.node.getChildren(LEZER_NODES.CODE_MARK)
    const hasClosingFence = endLine > startLine && marks.length > 1 && marks[marks.length - 1].from >= doc.line(endLine).from

    for (let lineNumber = startLine; lineNumber <= endLine; lineNumber++) {
        const classes = ['cm-live-codeblock-line']

        if (lineNumber === startLine) classes.push(CODE_FIRST_LINE_CLASS)
        if (lineNumber === endLine) classes.push(CODE_LAST_LINE_CLASS)
        if (lineNumber === endLine && focused && hasClosingFence) classes.push(CODE_FENCED_LAST_LINE_CLASS)

        ranges.push(Decoration.line({ class: classes.join(' ') }).range(doc.line(lineNumber).from))
    }

    if (focused) decorateFocusedFences(node, ranges)
    else decorateCollapsedFences(node, context, startLine, endLine, hasClosingFence)

    return true
}

export const codeBlocksTheme = ({ colors }) => ({
    '.cm-live-codeblock-line': {
        backgroundColor: colors.codeBlockBackground,
        fontFamily: MONOSPACE_FONT_FAMILY,
        paddingLeft: '0.8em',
        paddingRight: '0.8em'
    },
    [`.${CODE_FIRST_LINE_CLASS}`]: {
        paddingTop: '0.8em',
        borderTopLeftRadius: `${RADIUS.md}px`,
        borderTopRightRadius: `${RADIUS.md}px`
    },
    [`.${CODE_LAST_LINE_CLASS}`]: {
        paddingBottom: '0.8em',
        borderBottomLeftRadius: `${RADIUS.md}px`,
        borderBottomRightRadius: `${RADIUS.md}px`
    },
    [`.${CODE_FENCED_LAST_LINE_CLASS}`]: { paddingBottom: '0.3em' },
    '.cm-live-codeblock-fence': { opacity: OPACITY.muted },
    [`.${CODE_HIDDEN_CLASS}`]: { fontSize: 0 },
    [`.${CODE_OPEN_LINE_CLASS}`]: { position: 'relative', lineHeight: 0 },
    [`.${CODE_CLOSE_LINE_CLASS}`]: { lineHeight: 0 },
    [`.${CODE_LABEL_CLASS}`]: {
        position: 'absolute',
        top: '0.5em',
        right: '0.8em',
        fontSize: '0.85em',
        lineHeight: 1.4,
        opacity: OPACITY.muted
    }
})
