export const WIKI_LINK_SCHEME = 'wikilink://'
export const WIKI_LINK_MISSING_PREFIX = 'missing/'
export const WIKI_LINK_PATTERN = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g
export const WIKI_LINK_ANCHOR_SEPARATOR = '#'
export const WIKI_LINK_ANCHOR_LABEL_SEPARATOR = ' > '
export const NOTE_ALIASES_PROPERTY = 'aliases'
export const MARKDOWN_WIKI_LINK_PATTERN = /\[([^\]]*)\]\(wikilink:\/\/([^)]+)\)/g

export const WIKI_LINK_FORMATS = {
    WIKILINK: 'wikilink',
    MARKDOWN: 'markdown'
}
export const WIKI_LINK_CLOSING = ']]'
export const WIKI_LINK_TYPING_PATTERN = /\[\[[^\]]*/
