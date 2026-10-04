import { Decoration } from '@codemirror/view'

import { isRangeSelected, overlapsAny } from './utils'

import {
    COMMENT_LIVE_CLASS,
    COMMENT_LIVE_PATTERN,
    COMMENT_MARKER,
    HIGHLIGHT_LIVE_CLASS,
    HIGHLIGHT_LIVE_PATTERN,
    HIGHLIGHT_MARKER
} from '@/constants/extra-marks'
import { TRANSPARENT } from '@/constants/themes'

const MARKS = [
    { pattern: HIGHLIGHT_LIVE_PATTERN, marker: HIGHLIGHT_MARKER, className: HIGHLIGHT_LIVE_CLASS },
    { pattern: COMMENT_LIVE_PATTERN, marker: COMMENT_MARKER, className: COMMENT_LIVE_CLASS }
]

export const decorateExtraMarks = ({ text, selection, ranges, codeRanges }) => {
    for (const { pattern, marker, className } of MARKS) {
        for (const match of text.matchAll(pattern)) {
            const from = match.index
            const to = from + match[0].length

            if (overlapsAny(from, to, codeRanges)) continue

            if (isRangeSelected(selection, from, to)) {
                ranges.push(Decoration.mark({ class: className }).range(from, to))
                continue
            }

            const innerFrom = from + marker.length
            const innerTo = to - marker.length

            ranges.push(Decoration.replace({}).range(from, innerFrom))
            if (innerFrom < innerTo) ranges.push(Decoration.mark({ class: className }).range(innerFrom, innerTo))
            ranges.push(Decoration.replace({}).range(innerTo, to))
        }
    }
}

export const extraMarksTheme = ({ colors }) => ({
    [`.${HIGHLIGHT_LIVE_CLASS}`]: { backgroundColor: colors.tertiary + TRANSPARENT[30], borderRadius: '2px' },
    [`.${COMMENT_LIVE_CLASS}`]: { opacity: 0.5, fontStyle: 'italic' }
})
