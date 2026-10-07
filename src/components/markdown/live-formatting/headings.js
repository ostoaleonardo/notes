import { Decoration } from '@codemirror/view'

import { isRangeSelected } from './utils'

import { ATX_HEADING_LEVELS, SETEXT_HEADING_LEVELS } from '@/constants/markdown-live-formatting'
import { HEADING_SCALE } from '@/constants/headings'
import { LEZER_NODES } from '@/constants/lezer-nodes'

export const headingNodeNames = [
    ...Object.keys(ATX_HEADING_LEVELS),
    ...Object.keys(SETEXT_HEADING_LEVELS)
]

export const decorateHeading = (node, { doc, selection, ranges }) => {
    if (isRangeSelected(selection, node.from, node.to)) return true

    const atxLevel = ATX_HEADING_LEVELS[node.name]
    if (atxLevel) {
        const mark = node.node.firstChild
        if (!mark || mark.name !== LEZER_NODES.HEADER_MARK) return true

        let hideTo = mark.to
        if (doc.sliceString(hideTo, hideTo + 1) === ' ') hideTo += 1

        ranges.push(Decoration.replace({}).range(mark.from, hideTo))
        if (hideTo < node.to) ranges.push(Decoration.mark({ class: `cm-live-h${atxLevel}` }).range(hideTo, node.to))
        return true
    }

    const setextLevel = SETEXT_HEADING_LEVELS[node.name]
    const mark = node.node.getChild(LEZER_NODES.HEADER_MARK)
    if (!mark) return true

    if (node.from < mark.from) {
        ranges.push(Decoration.mark({ class: `cm-live-h${setextLevel}` }).range(node.from, mark.from))
    }
    ranges.push(Decoration.replace({}).range(mark.from, mark.to))

    return true
}

export const headingsTheme = ({ typography }) => Object.fromEntries(
    HEADING_SCALE.map((scale, index) => [
        `.cm-live-h${index + 1}`,
        { fontWeight: 'bold', fontSize: `${scale}em`, fontFamily: typography.headingFontFamily }
    ])
)
