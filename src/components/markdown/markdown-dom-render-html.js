import katex from 'katex'
import DOMPurify from 'dompurify'
import MarkdownIt from 'markdown-it'
import texmath from 'markdown-it-texmath'
import footnote from 'markdown-it-footnote'
import taskLists from 'markdown-it-task-lists'

import { WIKI_LINK_SCHEME } from '@/constants/wiki-links'

const md = new MarkdownIt({ html: true, linkify: true })
    .use(taskLists, { enabled: true })
    .use(texmath, { engine: katex, delimiters: 'dollars' })
    .use(footnote)

const wikiLinkProtocol = WIKI_LINK_SCHEME.split(':')[0]
const ALLOWED_URI_REGEXP = new RegExp(
    `^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|${wikiLinkProtocol}):|[^a-z]|[a-z+.\\-]+(?:[^a-z+.\\-:]|$))`,
    'i'
)

const defaultLinkOpen = md.renderer.rules.link_open
    || ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options))

md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const href = tokens[idx].attrGet('href')
    if (href && href.startsWith(WIKI_LINK_SCHEME)) tokens[idx].attrSet('class', 'wiki-link')

    return defaultLinkOpen(tokens, idx, options, env, self)
}

export const renderMarkdownRaw = (text) => md.render(text || '')

export const renderMarkdownHtml = (text) => DOMPurify.sanitize(renderMarkdownRaw(text), { ALLOWED_URI_REGEXP })
