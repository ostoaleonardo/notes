import { Decoration } from '@codemirror/view'

import { getCalloutType } from '@/utils/callouts'

import { BLOCKQUOTE_NODE_NAMES } from '@/constants/markdown-live-formatting'
import {
    CALLOUT_COLORS,
    CALLOUT_LIVE_CLASS,
    CALLOUT_LIVE_TITLE_CLASS,
    CALLOUT_LIVE_TYPE_CLASS_PREFIX,
    CALLOUT_QUOTE_HEAD_PATTERN
} from '@/constants/callouts'
import { TRANSPARENT } from '@/constants/themes'

export const blockquoteNodeNames = BLOCKQUOTE_NODE_NAMES

const findCallout = (node, doc) => {
    const line = doc.lineAt(node.from)
    const match = CALLOUT_QUOTE_HEAD_PATTERN.exec(line.text.slice(node.from - line.from))
    if (!match) return null

    return { type: getCalloutType(match[2]), titleFrom: line.from + line.text.indexOf(match[1]), titleTo: line.to }
}

export const decorateBlockquote = (node, { doc, ranges }) => {
    if (node.name === 'QuoteMark') {
        ranges.push(Decoration.mark({ class: 'cm-live-accent-mark' }).range(node.from, node.to))
        return true
    }

    const callout = findCallout(node, doc)

    if (callout) {
        const className = `cm-live-quote ${CALLOUT_LIVE_CLASS} ${CALLOUT_LIVE_TYPE_CLASS_PREFIX}${callout.type}`
        ranges.push(Decoration.mark({ class: className }).range(node.from, node.to))
        ranges.push(Decoration.mark({ class: CALLOUT_LIVE_TITLE_CLASS }).range(callout.titleFrom, callout.titleTo))
        return false
    }

    ranges.push(Decoration.mark({ class: 'cm-live-quote' }).range(node.from, node.to))
    return false
}

const calloutTheme = () => Object.fromEntries(Object.entries(CALLOUT_COLORS).map(([type, color]) => [
    `.${CALLOUT_LIVE_TYPE_CLASS_PREFIX}${type}`,
    { fontStyle: 'normal', opacity: 1, borderLeftColor: color, backgroundColor: color + TRANSPARENT[10] }
]))

export const blockquoteTheme = ({ linkColor, quoteBackgroundColor }) => ({
    '.cm-live-quote': {
        fontStyle: 'italic',
        opacity: 0.85,
        backgroundColor: quoteBackgroundColor,
        borderLeft: `4px solid ${linkColor}`,
        paddingLeft: '0.6em'
    },
    '.cm-live-accent-mark': { color: linkColor, fontWeight: 'bold' },
    ...calloutTheme(),
    [`.${CALLOUT_LIVE_TITLE_CLASS}`]: { fontWeight: 'bold' }
})
