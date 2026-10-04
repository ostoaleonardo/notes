import { escapeHtml } from './wiki-links'

import {
    EXPORT_ALLOWED_ATTRIBUTES,
    EXPORT_ALLOWED_TAGS,
    EXPORT_SAFE_URL_PATTERN,
    EXPORT_URL_ATTRIBUTES
} from '@/constants/export'

const TAG_PATTERN = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:\s+[^\s"'<>/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'<>=`]+))?)*)\s*(\/?)>/g
const ATTRIBUTE_PATTERN = /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'<>=`]+)))?/g

const escapeText = (text) => text.replace(/</g, '&lt;')

const buildAttributes = (source) => {
    const attributes = []

    for (const match of source.matchAll(ATTRIBUTE_PATTERN)) {
        const name = match[1].toLowerCase()
        if (!EXPORT_ALLOWED_ATTRIBUTES.includes(name)) continue

        const value = match[2] ?? match[3] ?? match[4]
        if (value === undefined) {
            attributes.push(name)
            continue
        }

        if (EXPORT_URL_ATTRIBUTES.includes(name) && !EXPORT_SAFE_URL_PATTERN.test(value.trim())) continue

        attributes.push(`${name}="${escapeHtml(value)}"`)
    }

    return attributes.length ? ` ${attributes.join(' ')}` : ''
}

export const sanitizeHtml = (html) => {
    let result = ''
    let cursor = 0

    for (const match of html.matchAll(TAG_PATTERN)) {
        const [tag, closing, rawName, attributes, selfClosing] = match
        const name = rawName.toLowerCase()

        result += escapeText(html.slice(cursor, match.index))
        cursor = match.index + tag.length

        if (!EXPORT_ALLOWED_TAGS.includes(name)) {
            result += escapeText(tag)
            continue
        }

        result += closing
            ? `</${name}>`
            : `<${name}${buildAttributes(attributes)}${selfClosing ? ' /' : ''}>`
    }

    return result + escapeText(html.slice(cursor))
}
