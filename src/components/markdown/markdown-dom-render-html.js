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

const md = new MarkdownIt({ html: true, linkify: true })
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

const buildTextToken = (Token, content) => {
    const token = new Token('text', '', 0)
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

        const open = new Token('link_open', 'a', 1)
        open.attrs = [['href', TAG_LINK_SCHEME + encodeURIComponent(name)], ['class', 'tag']]

        tokens.push(open, buildTextToken(Token, token.content.slice(from, to)), new Token('link_close', 'a', -1))
        cursor = to
    }

    if (cursor < token.content.length) tokens.push(buildTextToken(Token, token.content.slice(cursor)))

    return tokens
}

md.core.ruler.push('inline_tags', (state) => {
    if (!state.env.tags) return

    state.tokens.filter((block) => block.type === 'inline').forEach((block) => {
        let linkDepth = 0

        block.children = block.children.flatMap((token) => {
            if (token.type === 'link_open') linkDepth++
            if (token.type === 'link_close') linkDepth--

            return token.type === 'text' && linkDepth === 0 ? splitTagTokens(token, state.Token) : [token]
        })
    })
})

export const renderMarkdownRaw = (text, env = {}) => md.render(text || '', env)

export const renderMarkdownHtml = (text) => (
    DOMPurify.sanitize(renderMarkdownRaw(text, { tags: true }), { ALLOWED_URI_REGEXP })
)
