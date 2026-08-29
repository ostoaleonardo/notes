import katex from 'katex'
import DOMPurify from 'dompurify'
import { Decoration } from '@codemirror/view'
import { BLOCK_MATH_PATTERN, INLINE_MATH_PATTERN } from '@/constants/markdown-live-formatting'
import { isRangeSelected, overlapsAny } from './utils'
import { HtmlWidget } from './widgets'

const renderKatex = (tex, displayMode) => {
    try {
        return DOMPurify.sanitize(katex.renderToString(tex, { throwOnError: false, displayMode }))
    } catch {
        return null
    }
}

export const decorateMath = ({ text, selection, ranges, codeRanges }) => {
    const consumed = []

    for (const match of text.matchAll(BLOCK_MATH_PATTERN)) {
        const from = match.index
        const to = from + match[0].length
        consumed.push({ from, to })

        if (overlapsAny(from, to, codeRanges) || isRangeSelected(selection, from, to)) continue

        const html = renderKatex(match[1].trim(), true)
        if (!html) continue

        ranges.push(Decoration.replace({ widget: new HtmlWidget(html, 'cm-live-math-block'), block: true }).range(from, to))
    }

    for (const match of text.matchAll(INLINE_MATH_PATTERN)) {
        const from = match.index
        const to = from + match[0].length

        if (overlapsAny(from, to, codeRanges) || overlapsAny(from, to, consumed)) continue
        if (isRangeSelected(selection, from, to)) continue

        const html = renderKatex(match[1].trim(), false)
        if (!html) continue

        ranges.push(Decoration.replace({ widget: new HtmlWidget(html, 'cm-live-math-inline') }).range(from, to))
    }
}

export const mathTheme = () => ({
    '.cm-live-math-block': { display: 'block', margin: '0.6em 0', textAlign: 'center', overflowX: 'auto' },
    '.cm-live-math-inline': { display: 'inline-block' }
})
