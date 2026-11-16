import { RangeSetBuilder } from '@codemirror/state'
import { Decoration } from '@codemirror/view'

import { buildDocDecorationsPlugin } from './markdown-dom-doc-decorations'
import { parseFrontmatter } from '@/shared/utils/frontmatter'
import { fillTemplate } from '@/shared/utils/fill-template'
import { BACKGROUND_COLOR_STYLE_TEMPLATE } from '@/shared/constants/css-templates'

const buildInvalidFrontmatterDecorations = (view, backgroundColor) => {
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
                    attributes: { style: fillTemplate(BACKGROUND_COLOR_STYLE_TEMPLATE, { color: backgroundColor }) }
                }))
            }
        }
    }

    return builder.finish()
}

export const buildInvalidFrontmatterHighlight = (backgroundColor) => buildDocDecorationsPlugin(
    (view) => buildInvalidFrontmatterDecorations(view, backgroundColor)
)
