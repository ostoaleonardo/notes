import { syntaxTree } from '@codemirror/language'
import { Decoration, ViewPlugin } from '@codemirror/view'

const STYLED_NODE_TYPES = {
    StrongEmphasis: 'cm-live-strong',
    Emphasis: 'cm-live-em',
    Strikethrough: 'cm-live-strike',
    InlineCode: 'cm-live-code'
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

const buildDecorations = (view) => {
    const ranges = []
    const selection = view.state.selection.main

    for (const { from, to } of view.visibleRanges) {
        syntaxTree(view.state).iterate({
            from,
            to,
            enter: (node) => {
                const className = STYLED_NODE_TYPES[node.name]
                if (!className) return

                if (selection.from <= node.to && selection.to >= node.from) return false

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
    }

    return Decoration.set(ranges, true)
}

export const liveFormatting = ViewPlugin.fromClass(class {
    constructor(view) {
        this.decorations = buildDecorations(view)
    }

    update(update) {
        if (update.docChanged || update.selectionSet || update.viewportChanged) {
            this.decorations = buildDecorations(update.view)
        }
    }
}, {
    decorations: (instance) => instance.decorations
})

export const liveFormattingTheme = {
    '.cm-live-strong': { fontWeight: 'bold' },
    '.cm-live-em': { fontStyle: 'italic' },
    '.cm-live-strike': { textDecoration: 'line-through' },
    '.cm-live-code': { fontFamily: 'ui-monospace, monospace' }
}
