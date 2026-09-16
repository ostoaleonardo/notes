import { Decoration } from '@codemirror/view'

import { overlapsAny } from './utils'

import {
    FOOTNOTE_DEFINITION_PATTERN,
    FOOTNOTE_REFERENCE_PATTERN
} from '@/constants/markdown-live-formatting'

let lastText = null
let lastRanges = []

export const decorateFootnotes = ({ text, ranges, codeRanges }) => {
    if (text === lastText) {
        ranges.push(...lastRanges)
        return
    }

    const localRanges = []
    const definitionRanges = []

    for (const match of text.matchAll(FOOTNOTE_DEFINITION_PATTERN)) {
        const from = match.index
        const to = from + match[0].length
        definitionRanges.push({ from, to })

        if (overlapsAny(from, to, codeRanges)) continue
        localRanges.push(Decoration.mark({ class: 'cm-live-footnote-marker' }).range(from, to))
    }

    for (const match of text.matchAll(FOOTNOTE_REFERENCE_PATTERN)) {
        const from = match.index
        const to = from + match[0].length

        if (overlapsAny(from, to, codeRanges) || overlapsAny(from, to, definitionRanges)) continue
        localRanges.push(Decoration.mark({ class: 'cm-live-footnote-ref' }).range(from, to))
    }

    lastText = text
    lastRanges = localRanges
    ranges.push(...localRanges)
}

export const footnotesTheme = ({ linkColor }) => ({
    '.cm-live-footnote-marker': { color: linkColor, fontWeight: 'bold' },
    '.cm-live-footnote-ref': { color: linkColor, fontWeight: 'bold', fontSize: '0.75em', verticalAlign: 'super' }
})
