export const NOTE_NODES = {
    WIKI_LINK: 'WikiLink',
    WIKI_EMBED: 'WikiEmbed',
    WIKI_LINK_MARK: 'WikiLinkMark',
    WIKI_LINK_TARGET: 'WikiLinkTarget',
    WIKI_LINK_ALIAS: 'WikiLinkAlias',
    TAG: 'Tag',
    BLOCK_ID: 'BlockId',
    HIGHLIGHT: 'Highlight',
    HIGHLIGHT_MARK: 'HighlightMark',
    COMMENT: 'Comment',
    COMMENT_MARK: 'CommentMark',
    CUSTOM_TASK: 'CustomTask',
    CUSTOM_TASK_MARKER: 'CustomTaskMarker',
    INLINE_MATH: 'InlineMath',
    BLOCK_MATH: 'BlockMath',
    CALLOUT: 'Callout',
    CALLOUT_MARKER: 'CalloutMarker',
    FRONTMATTER: 'Frontmatter',
    FRONTMATTER_MARK: 'FrontmatterMark'
}

export const CHAR = {
    NEWLINE: 10,
    TAB: 9,
    SPACE: 32,
    BANG: 33,
    HASH: 35,
    PERCENT: 37,
    EQUALS: 61,
    OPEN_BRACKET: 91,
    CLOSE_BRACKET: 93,
    DOLLAR: 36,
    CARET: 94,
    PIPE: 124
}

export const WIKI_LINK_MARK_LENGTH = 2
export const COMMENT_MARK_LENGTH = 2
export const HIGHLIGHT_MARK_LENGTH = 2
export const BLOCK_ID_CHAR_PATTERN = /[A-Za-z0-9-]/
export const TAG_STOP_PATTERN = /[\s!-,.:-@[-^`{-~]/
export const TRAILING_SLASH = '/'
export const LIST_ITEM_NODE = 'ListItem'
export const CUSTOM_TASK_START_PATTERN = /^\[[^\sxX\]]\][ \t]/
export const SETEXT_HEADING_NODE = 'SetextHeading'
export const LINK_PARSER_NAME = 'Link'
export const CALLOUT_START_PATTERN = /^\[![\w-]+\][+-]?/
export const BLOCKQUOTE_NODE = 'Blockquote'
export const WORD_CHAR_PATTERN = /[\w$]/
export const FRONTMATTER_FENCE = '---'
export const FRONTMATTER_MARK_LENGTH = 3
export const HORIZONTAL_RULE_PARSER_NAME = 'HorizontalRule'
export const MATH_DELIMITER_LENGTH = 2
export const ATX_HEADING_PATTERN = /^ATXHeading(\d)$/
export const HEADER_MARK_NODE = 'HeaderMark'
export const LINK_NODE = 'Link'
export const URL_NODE = 'URL'
export const ESCAPED_PIPE_SUFFIX = '\\'
export const CUSTOM_TASK_STATUS_OFFSET = 1
export const WIKI_LINK_TOKEN = 'wiki_link'
export const WIKI_LINK_RULE_ANCHOR = 'link'
export const NOTE_EMBED_TOKEN = 'note_embed'
export const EMBED_MEDIA_TOKEN = 'embed_media'
export const NOTE_EMBED_BLOCK_RULE = 'note_embed_block'
export const NOTE_EMBED_RULE = 'note_embed_inline'
export const EMBED_BLOCK_ALT_RULES = ['paragraph', 'reference', 'blockquote', 'list']
export const CODE_INDENT_WIDTH = 4
