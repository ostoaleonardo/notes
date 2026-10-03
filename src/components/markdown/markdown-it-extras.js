import { getCalloutTitle, getCalloutType } from '@/utils/callouts'

import {
    CALLOUT_CLASS,
    CALLOUT_FOLD_OPEN,
    CALLOUT_PATTERN,
    CALLOUT_TITLE_CLASS,
    CALLOUT_TYPE_CLASS_PREFIX
} from '@/constants/callouts'
import {
    COMMENT_MARKER,
    COMMENT_OR_CODE_PATTERN,
    HIGHLIGHT_MARKER,
    HIGHLIGHT_MARKER_CHAR_CODE,
    HIGHLIGHT_OPENING_INVALID_PATTERN
} from '@/constants/extra-marks'

const highlightRule = (state, silent) => {
    const { src, pos } = state
    const length = HIGHLIGHT_MARKER.length

    if (src.charCodeAt(pos) !== HIGHLIGHT_MARKER_CHAR_CODE || src.charCodeAt(pos + 1) !== HIGHLIGHT_MARKER_CHAR_CODE) {
        return false
    }

    const end = src.indexOf(HIGHLIGHT_MARKER, pos + length)
    if (end === -1 || end === pos + length || HIGHLIGHT_OPENING_INVALID_PATTERN.test(src[pos + length])) return false

    if (!silent) {
        const max = state.posMax
        state.push('mark_open', 'mark', 1)
        state.pos = pos + length
        state.posMax = end
        state.md.inline.tokenize(state)
        state.push('mark_close', 'mark', -1)
        state.posMax = max
    }

    state.pos = end + length
    return true
}

const stripComments = (src) => src.replace(
    COMMENT_OR_CODE_PATTERN,
    (match) => (match.startsWith(COMMENT_MARKER) ? '' : match)
)

const findClosing = (tokens, openIndex) => tokens.findIndex((token, index) => (
    index > openIndex && token.type === 'blockquote_close' && token.level === tokens[openIndex].level
))

const convertCallout = (state, openIndex) => {
    const { tokens } = state
    const inline = tokens[openIndex + 2]
    if (tokens[openIndex + 1]?.type !== 'paragraph_open' || inline?.type !== 'inline') return

    const [firstLine, ...rest] = inline.content.split('\n')
    const match = CALLOUT_PATTERN.exec(firstLine)
    if (!match) return

    const [, rawType, fold, title] = match
    const open = tokens[openIndex]
    const close = tokens[findClosing(tokens, openIndex)]
    const tag = fold ? 'details' : 'div'
    const titleTag = fold ? 'summary' : 'div'

    open.tag = tag
    open.attrSet('class', `${CALLOUT_CLASS} ${CALLOUT_TYPE_CLASS_PREFIX}${getCalloutType(rawType)}`)
    if (fold === CALLOUT_FOLD_OPEN) open.attrSet('open', '')
    if (close) close.tag = tag

    const head = new state.Token('html_block', '', 0)
    const label = state.md.utils.escapeHtml(getCalloutTitle(rawType, title))
    head.content = `<${titleTag} class="${CALLOUT_TITLE_CLASS}">${label}</${titleTag}>\n`

    inline.content = rest.join('\n')

    if (inline.content.trim()) tokens.splice(openIndex + 1, 0, head)
    else tokens.splice(openIndex + 1, 3, head)
}

export const markdownItExtras = (md) => {
    md.inline.ruler.before('emphasis', 'highlight', highlightRule)

    md.core.ruler.before('normalize', 'comments', (state) => {
        state.src = stripComments(state.src)
    })

    md.core.ruler.before('inline', 'callouts', (state) => {
        for (let index = 0; index < state.tokens.length; index++) {
            if (state.tokens[index].type === 'blockquote_open') convertCallout(state, index)
        }
    })
}
