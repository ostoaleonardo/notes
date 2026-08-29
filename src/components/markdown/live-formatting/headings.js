import { Decoration } from '@codemirror/view'
import { ATX_HEADING_LEVELS, SETEXT_HEADING_LEVELS } from '@/constants/markdown-live-formatting'
import { isRangeSelected } from './utils'

export const headingNodeNames = [...Object.keys(ATX_HEADING_LEVELS), ...Object.keys(SETEXT_HEADING_LEVELS)]

export const decorateHeading = (node, { doc, selection, ranges }) => {
    if (isRangeSelected(selection, node.from, node.to)) return true

    const atxLevel = ATX_HEADING_LEVELS[node.name]
    if (atxLevel) {
        const mark = node.node.firstChild
        if (!mark || mark.name !== 'HeaderMark') return true

        let hideTo = mark.to
        if (doc.sliceString(hideTo, hideTo + 1) === ' ') hideTo += 1

        ranges.push(Decoration.replace({}).range(mark.from, hideTo))
        if (hideTo < node.to) ranges.push(Decoration.mark({ class: `cm-live-h${atxLevel}` }).range(hideTo, node.to))
        return true
    }

    const setextLevel = SETEXT_HEADING_LEVELS[node.name]
    const mark = node.node.getChild('HeaderMark')
    if (!mark) return true

    if (node.from < mark.from) ranges.push(Decoration.mark({ class: `cm-live-h${setextLevel}` }).range(node.from, mark.from))
    ranges.push(Decoration.replace({}).range(mark.from, mark.to))

    return true
}

export const headingsTheme = () => ({
    '.cm-live-h1': { fontWeight: 'bold', fontSize: '1.8em' },
    '.cm-live-h2': { fontWeight: 'bold', fontSize: '1.6em' },
    '.cm-live-h3': { fontWeight: 'bold', fontSize: '1.4em' },
    '.cm-live-h4': { fontWeight: 'bold', fontSize: '1.25em' },
    '.cm-live-h5': { fontWeight: 'bold', fontSize: '1.1em' },
    '.cm-live-h6': { fontWeight: 'bold', fontSize: '1em' }
})
