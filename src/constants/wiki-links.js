export const WIKI_LINK_SCHEME = 'wikilink://'
export const WIKI_LINK_MISSING_PREFIX = 'missing/'
export const WIKI_LINK_PATTERN = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g
export const MARKDOWN_WIKI_LINK_PATTERN = /\[([^\]]*)\]\(wikilink:\/\/([^)]+)\)/g

export const WIKI_LINK_FORMATS = {
    WIKILINK: 'wikilink',
    MARKDOWN: 'markdown'
}
