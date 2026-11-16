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
    CUSTOM_TASK_MARKER: 'CustomTaskMarker'
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
    CARET: 94,
    PIPE: 124
}

export const WIKI_LINK_MARK_LENGTH = 2
export const COMMENT_MARK_LENGTH = 2
export const HIGHLIGHT_MARK_LENGTH = 2
export const CUSTOM_TASK_MARKER_LENGTH = 3
export const BLOCK_ID_CHAR_PATTERN = /[A-Za-z0-9-]/
export const TAG_STOP_PATTERN = /[\s!-,.:-@[-^`{-~]/
export const TRAILING_SLASH = '/'
export const LIST_ITEM_NODE = 'ListItem'
export const CUSTOM_TASK_START_PATTERN = /^\[[^\sxX\]]\][ \t]/
export const SETEXT_HEADING_NODE = 'SetextHeading'
export const LINK_PARSER_NAME = 'Link'
