import { RangeSetBuilder } from '@codemirror/state'
import { Decoration, ViewPlugin } from '@codemirror/view'

import { parseFrontmatter } from '../../utils/frontmatter'

const buildDecorations = (view, backgroundColor) => {
    const builder = new RangeSetBuilder()
    const { error, hasBlock, rawFrontmatter } = parseFrontmatter(view.state.doc.toString())

    if (error && hasBlock) {
        const from = view.state.doc.toString().indexOf(rawFrontmatter)

        if (from !== -1) {
            const startLine = view.state.doc.lineAt(from).number
            const endLine = view.state.doc.lineAt(from + rawFrontmatter.length).number

            for (let lineNumber = startLine; lineNumber <= endLine; lineNumber++) {
                const line = view.state.doc.line(lineNumber)
                builder.add(line.from, line.from, Decoration.line({
                    attributes: { style: `background-color: ${backgroundColor}` }
                }))
            }
        }
    }

    return builder.finish()
}

export const buildInvalidFrontmatterHighlight = (backgroundColor) => ViewPlugin.fromClass(class {
    constructor(view) {
        this.decorations = buildDecorations(view, backgroundColor)
    }

    update(update) {
        if (update.docChanged) this.decorations = buildDecorations(update.view, backgroundColor)
    }
}, {
    decorations: (instance) => instance.decorations
})
