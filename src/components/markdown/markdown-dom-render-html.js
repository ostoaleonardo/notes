import katex from 'katex'
import DOMPurify from 'dompurify'
import MarkdownIt from 'markdown-it'
import texmath from 'markdown-it-texmath'
import footnote from 'markdown-it-footnote'
import taskLists from 'markdown-it-task-lists'

import { markdownItExtras } from './markdown-it-extras'
import { wikiLinksPlugin } from './markdown-it-wiki-links'
import { wrapCodeBlock } from './markdown-dom-code-copy'
import { highlightFence } from './syntax-highlighting/preview-code-highlight'

import { findInlineTags } from '@/utils/inline-tags'
import { replaceLocalImageUrls } from '@/utils/local-images'

import { TAG_LINK_SCHEME } from '@/constants/tags'
import { WIKI_LINK_SCHEME } from '@/constants/wiki-links'
import { PREVIEW_TABLE_SCROLL_CLASS } from '@/constants/table-widget'
import { MARKDOWN_IT_TOKENS } from '@/constants/markdown-it-tokens'
import { ALLOWED_URI_REGEXP, BLOCKED_LINK_PROTOCOL_PATTERN } from '@/constants/html-sanitize'

const md = new MarkdownIt({
    html: true,
    linkify: true,
    breaks: true,
    highlight: (code, info) => highlightFence(code, info, (text) => md.utils.escapeHtml(text))
})
    .use(taskLists, { enabled: true })
    .use(texmath, { engine: katex, delimiters: 'dollars' })
    .use(footnote)
    .use(markdownItExtras)
    .use(wikiLinksPlugin)

md.validateLink = (url) => !BLOCKED_LINK_PROTOCOL_PATTERN.test(url.trim())

const defaultLinkOpen = md.renderer.rules.link_open
    || ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options))

md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const href = tokens[idx].attrGet('href')
    if (href && href.startsWith(WIKI_LINK_SCHEME)) tokens[idx].attrSet('class', 'wiki-link')

    return defaultLinkOpen(tokens, idx, options, env, self)
}

const defaultFence = md.renderer.rules.fence

md.renderer.rules.fence = (tokens, idx, options, env, self) => (
    wrapCodeBlock(defaultFence(tokens, idx, options, env, self))
)

md.renderer.rules.table_open = (tokens, idx, options, env, self) => (
    `<div class="${PREVIEW_TABLE_SCROLL_CLASS}">${self.renderToken(tokens, idx, options)}`
)

md.renderer.rules.table_close = (tokens, idx, options, env, self) => (
    `${self.renderToken(tokens, idx, options)}</div>`
)

const renderHtmlToken = (tokens, idx, options, env) => {
    const { content } = tokens[idx]
    const resolved = env.localMedia?.size ? replaceLocalImageUrls(content, env.localMedia) : content

    return env.sanitizeHtml ? env.sanitizeHtml(resolved) : resolved
}

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

const EMPTY_READ_CONTEXT = { details: new Map(), media: new Map(), local: new Map(), embeds: new Map() }

const createReadEnv = () => ({
    tags: true,
    wikiTargets: new Set(),
    embedTargets: new Set(),
    mediaNames: new Set(),
    localUrls: new Set()
})

export const parseNoteMarkdown = (text) => {
    const env = createReadEnv()
    const tokens = md.parse(text, env)

    return {
        tokens,
        env,
        targets: [...env.wikiTargets],
        embedTargets: [...env.embedTargets],
        mediaNames: [...env.mediaNames],
        localUrls: [...env.localUrls]
    }
}

let lastParsed = { text: null, parsed: null }

export const parseReadMarkdown = (text) => {
    if (!text) return null
    if (lastParsed.text === text) return lastParsed.parsed

    lastParsed = { text, parsed: parseNoteMarkdown(text) }

    return lastParsed.parsed
}

export const renderReadHtml = (parsed, context = EMPTY_READ_CONTEXT) => {
    if (!parsed) return ''

    Object.assign(parsed.env, {
        wikiResolved: context.details,
        embedMedia: context.media,
        localMedia: context.local,
        embedLoaded: context.embeds,
        embedStack: [],
        embedDepth: 0
    })

    return DOMPurify.sanitize(
        md.renderer.render(parsed.tokens, md.options, parsed.env),
        { ALLOWED_URI_REGEXP }
    )
}
