import { highlightCode } from '@lezer/highlight'

import { findCodeLanguage } from './code-languages'
import { previewHighlighter } from './syntax-highlight-style'

import { fillTemplate } from '@/shared/utils/fill-template'

import { CODE_FENCE_LANGUAGE_PATTERN, SYNTAX_SPAN_TEMPLATE } from '@/features/editor/dom/constants/syntax-highlighting'

export const highlightFence = (code, info, escapeHtml) => {
    const language = findCodeLanguage(info)?.support?.language

    if (!language) return ''
    let html = ''

    highlightCode(
        code,
        language.parser.parse(code),
        previewHighlighter,
        (text, classes) => {
            html += classes ? fillTemplate(SYNTAX_SPAN_TEMPLATE, { classes, text: escapeHtml(text) }) : escapeHtml(text)
        },
        () => {
            html += '\n'
        }
    )

    return html
}

export const findPendingFenceLanguages = (text) => {
    const infos = new Set(Array.from(text.matchAll(CODE_FENCE_LANGUAGE_PATTERN), (match) => match[1]))

    return [...infos].map(findCodeLanguage).filter((language) => language && !language.support)
}

export const loadFenceLanguages = async (text) => {
    const pending = findPendingFenceLanguages(text)

    if (pending.length === 0) return false

    await Promise.all(pending.map((language) => language.load()))
    return true
}
