export const INLINE_MARK_NODE_TYPES = {
    StrongEmphasis: 'cm-live-strong',
    Emphasis: 'cm-live-em',
    Strikethrough: 'cm-live-strike',
    InlineCode: 'cm-live-code'
}

export const ATX_HEADING_LEVELS = {
    ATXHeading1: 1,
    ATXHeading2: 2,
    ATXHeading3: 3,
    ATXHeading4: 4,
    ATXHeading5: 5,
    ATXHeading6: 6
}

export const SETEXT_HEADING_LEVELS = {
    SetextHeading1: 1,
    SetextHeading2: 2
}

export const LINK_NODE_NAMES = ['Link', 'Autolink']
export const IMAGE_NODE_NAMES = ['Image']
export const LIST_NODE_NAMES = ['ListMark', 'TaskMarker']
export const BLOCKQUOTE_NODE_NAMES = ['Blockquote', 'QuoteMark']
export const CODE_BLOCK_NODE_NAMES = ['FencedCode']
export const HORIZONTAL_RULE_NODE_NAMES = ['HorizontalRule']
export const HTML_BLOCK_NODE_NAMES = ['Table', 'HTMLBlock']
export const HTML_NODE_NAMES = ['Table', 'HTMLBlock', 'HTMLTag']
export const CODE_RANGE_NODE_NAMES = ['FencedCode', 'InlineCode']

export const BLOCK_MATH_PATTERN = /\$\$([^$]+?)\$\$/g
export const INLINE_MATH_PATTERN = /(?<![\w$])\$(?!\s)([^$\n]+?)(?<!\s)\$(?!\w)/g

export const FOOTNOTE_DEFINITION_PATTERN = /^ {0,3}\[\^([^\]\n]+)\]:/gm
export const FOOTNOTE_REFERENCE_PATTERN = /\[\^([^\]\n]+)\]/g
