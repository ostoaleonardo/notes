import katex from 'katex'
import DOMPurify from 'dompurify'
import MarkdownIt from 'markdown-it'
import texmath from 'markdown-it-texmath'
import footnote from 'markdown-it-footnote'
import taskLists from 'markdown-it-task-lists'

import { markdownItExtras } from './markdown-it-extras'

import { findInlineTags } from '@/utils/inline-tags'

import { TAG_LINK_SCHEME } from '@/constants/tags'
import { WIKI_LINK_SCHEME } from '@/constants/wiki-links'
import { FILE_LINK_SCHEME } from '@/constants/file-links'
import { PREVIEW_TABLE_SCROLL_CLASS } from '@/constants/table-widget'
import { MARKDOWN_IT_TOKENS } from '@/constants/markdown-it-tokens'

const md = new MarkdownIt({ html: true, linkify: true, breaks: true })
    .use(taskLists, { enabled: true })
    .use(texmath, { engine: katex, delimiters: 'dollars' })
    .use(footnote)
    .use(markdownItExtras)

const wikiLinkProtocol = WIKI_LINK_SCHEME.split(':')[0]
const tagLinkProtocol = TAG_LINK_SCHEME.split(':')[0]
const fileLinkProtocol = FILE_LINK_SCHEME.split(':')[0]
const ALLOWED_URI_REGEXP = new RegExp(
    `^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|${wikiLinkProtocol}|${tagLinkProtocol}|${fileLinkProtocol}):|[^a-z]|[a-z+.\\-]+(?:[^a-z+.\\-:]|$))`,
    'i'
)

const defaultLinkOpen = md.renderer.rules.link_open
    || ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options))

md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const href = tokens[idx].attrGet('href')
    if (href && href.startsWith(WIKI_LINK_SCHEME)) tokens[idx].attrSet('class', 'wiki-link')

    return defaultLinkOpen(tokens, idx, options, env, self)
}

md.renderer.rules.table_open = (tokens, idx, options, env, self) => (
    `<div class="${PREVIEW_TABLE_SCROLL_CLASS}">${self.renderToken(tokens, idx, options)}`
)

md.renderer.rules.table_close = (tokens, idx, options, env, self) => (
    `${self.renderToken(tokens, idx, options)}</div>`
)

const renderHtmlToken = (tokens, idx, options, env) => (
    env.sanitizeHtml ? env.sanitizeHtml(tokens[idx].content) : tokens[idx].content
)

md.renderer.rules.html_block = renderHtmlToken
md.renderer.rules.html_inline = renderHtmlToken

const buildTextToken = (Token, content) => {
    const token = new Token(MARKDOWN_IT_TOKENS.TEXT, '', 0)
    token.content = content
    return token
}

const splitTagTokens = (token, Token) => {
    const found = findInlineTags(token.content)
    if (found.length === 0) return [token]

    const tokens = []
    let cursor = 0

    for (const { name, from, to } of found) {
        if (from > cursor) tokens.push(buildTextToken(Token, token.content.slice(cursor, from)))

        const open = new Token(MARKDOWN_IT_TOKENS.LINK_OPEN, 'a', 1)
        open.attrs = [['href', TAG_LINK_SCHEME + encodeURIComponent(name)], ['class', 'tag']]

        const close = new Token(MARKDOWN_IT_TOKENS.LINK_CLOSE, 'a', -1)
        tokens.push(open, buildTextToken(Token, token.content.slice(from, to)), close)
        cursor = to
    }

    if (cursor < token.content.length) tokens.push(buildTextToken(Token, token.content.slice(cursor)))

    return tokens
}

md.core.ruler.push('inline_tags', (state) => {
    if (!state.env.tags) return

    state.tokens.filter((block) => block.type === MARKDOWN_IT_TOKENS.INLINE).forEach((block) => {
        let linkDepth = 0

        block.children = block.children.flatMap((token) => {
            if (token.type === MARKDOWN_IT_TOKENS.LINK_OPEN) linkDepth++
            if (token.type === MARKDOWN_IT_TOKENS.LINK_CLOSE) linkDepth--

            const isPlainText = token.type === MARKDOWN_IT_TOKENS.TEXT && linkDepth === 0
            return isPlainText ? splitTagTokens(token, state.Token) : [token]
        })
    })
})

export const renderMarkdownRaw = (text, env = {}) => md.render(text || '', env)

export const renderMarkdownHtml = (text) => (
    DOMPurify.sanitize(renderMarkdownRaw(text, { tags: true }), { ALLOWED_URI_REGEXP })
)

export const renderInlineHtml = (text) => (
    DOMPurify.sanitize(md.renderInline(text || '', { tags: true }), { ALLOWED_URI_REGEXP })
)
