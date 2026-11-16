import { syntaxTree } from '@codemirror/language'

import { CODE_RANGE_NODE_NAMES } from '@/features/editor/constants/markdown-live-formatting'

const codeRangeNodeNames = new Set(CODE_RANGE_NODE_NAMES)

export const collectMarks = (node) => {
    const marks = []
    let child = node.firstChild

    while (child) {
        if (child.name.endsWith('Mark')) marks.push({ from: child.from, to: child.to })
        child = child.nextSibling
    }

    return marks
}

export const isRangeSelected = (selection, from, to) => selection.from <= to && selection.to >= from

export const overlapsAny = (from, to, ranges) => ranges.some((range) => from < range.to && to > range.from)

export const collectCodeRanges = (state, offset = 0, from = 0, to = state.doc.length) => {
    const ranges = []

    syntaxTree(state).iterate({
        from,
        to,
        enter: (node) => {
            if (codeRangeNodeNames.has(node.name)) {
                ranges.push({ from: node.from + offset, to: node.to + offset })
            }
        }
    })

    return ranges
}
