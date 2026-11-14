import { tags } from '@lezer/highlight'

import { TRANSPARENT } from '@/ui/tokens/transparent'

export const SYNTAX_TOKEN_CLASS_PREFIX = 'tok-'
export const CODE_FENCE_LANGUAGE_PATTERN = /^[ \t]{0,3}(?:`{3,}|~{3,})[ \t]*([\w+#.-]+)/gm

export const SYNTAX_TOKENS = {
    keyword: [
        tags.keyword,
        tags.operatorKeyword,
        tags.controlKeyword,
        tags.definitionKeyword,
        tags.modifier,
        tags.deleted
    ],
    string: [tags.string, tags.regexp, tags.special(tags.string), tags.inserted],
    value: [tags.number, tags.bool, tags.null, tags.atom],
    function: [tags.function(tags.variableName), tags.function(tags.propertyName)],
    type: [tags.typeName, tags.className, tags.namespace, tags.tagName],
    property: [tags.propertyName, tags.attributeName, tags.operator, tags.angleBracket],
    comment: [tags.comment, tags.docComment, tags.meta]
}

export const SYNTAX_PALETTES = {
    dark: {
        keyword: '#ff7b72',
        string: '#a5d6ff',
        value: '#79c0ff',
        function: '#d2a8ff',
        type: '#ffa657',
        property: '#79c0ff'
    },
    light: {
        keyword: '#cf222e',
        string: '#0a3069',
        value: '#0550ae',
        function: '#8250df',
        type: '#953800',
        property: '#0550ae'
    }
}

export const SYNTAX_COMMENT_OPACITY = TRANSPARENT[50]
