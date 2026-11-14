import { highlightCode } from '@lezer/highlight'

import { findCodeLanguage } from './code-languages'
import { previewHighlighter } from './syntax-highlight-style'

import { CODE_FENCE_LANGUAGE_PATTERN } from '@/constants/syntax-highlighting'

export const highlightFence = (code, info, escapeHtml) => {
    const language = findCodeLanguage(info)?.support?.language

    if (!language) return ''
    let html = ''

    highlightCode(
        code,
        language.parser.parse(code),
        previewHighlighter,
        (text, classes) => {
            html += classes ? `<span class="${classes}">${escapeHtml(text)}</span>` : escapeHtml(text)
        },
        () => {
            html += '\n'
        }
    )

    return html
}

export const loadFenceLanguages = async (text) => {
    const infos = new Set(Array.from(text.matchAll(CODE_FENCE_LANGUAGE_PATTERN), (match) => match[1]))
    const pending = [...infos].map(findCodeLanguage).filter((language) => language && !language.support)

    if (pending.length === 0) return false

    await Promise.all(pending.map((language) => language.load()))
    return true
}
