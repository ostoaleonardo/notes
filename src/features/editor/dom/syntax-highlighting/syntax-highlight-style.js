import { syntaxHighlighting, HighlightStyle } from '@codemirror/language'
import { tagHighlighter } from '@lezer/highlight'

import { buildSyntaxColors } from './syntax-colors'

import { SYNTAX_TOKENS, SYNTAX_TOKEN_CLASS_PREFIX } from '@/features/editor/dom/constants/syntax-highlighting'
import { fillTemplate } from '@/shared/utils/fill-template'
import { SYNTAX_TOKEN_RULE_TEMPLATE } from '@/shared/constants/css-templates'

const tokenNames = Object.keys(SYNTAX_TOKENS)

export const buildEditorHighlighting = (theme) => {
    const palette = buildSyntaxColors(theme)

    return syntaxHighlighting(HighlightStyle.define(
        tokenNames.map((name) => ({ tag: SYNTAX_TOKENS[name], color: palette[name] }))
    ))
}

export const previewHighlighter = tagHighlighter(
    tokenNames.map((name) => ({ tag: SYNTAX_TOKENS[name], class: SYNTAX_TOKEN_CLASS_PREFIX + name }))
)

export const buildPreviewSyntaxCss = (theme) => {
    const palette = buildSyntaxColors(theme)

    return tokenNames
        .map((name) => fillTemplate(SYNTAX_TOKEN_RULE_TEMPLATE, {
            className: SYNTAX_TOKEN_CLASS_PREFIX + name,
            color: palette[name]
        }))
        .join('\n')
}
