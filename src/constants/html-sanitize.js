import { TAG_LINK_SCHEME } from './tags'
import { WIKI_LINK_SCHEME } from './wiki-links'
import { FILE_LINK_SCHEME } from './file-links'

const schemeProtocol = (scheme) => scheme.split(':')[0]

export const HTML_TAG_PATTERN = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:\s+[^\s"'<>/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'<>=`]+))?)*)\s*(\/?)>/g
export const HTML_ATTRIBUTE_PATTERN = /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'<>=`]+)))?/g
export const HTML_ESCAPE_PATTERN = /[&<>"]/g
export const HTML_LESS_THAN_PATTERN = /</g

export const HTML_ESCAPES = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;'
}

export const ALLOWED_URI_REGEXP = new RegExp(
    `^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|${schemeProtocol(WIKI_LINK_SCHEME)}|${schemeProtocol(TAG_LINK_SCHEME)}|${schemeProtocol(FILE_LINK_SCHEME)}):|[^a-z]|[a-z+.\\-]+(?:[^a-z+.\\-:]|$))`,
    'i'
)
