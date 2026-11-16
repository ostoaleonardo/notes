import { isFileLinkTarget } from '@/shared/utils/file-links'
import { extractLocalUrls } from '@/features/editor/shared/utils/local-images'
import { buildEmbedBlockHtml, buildMediaHtml } from '@/features/editor/shared/utils/embed-html'
import { parseEmbedMedia } from '@/features/editor/shared/utils/embed-media'
import { renderWikiLink } from '@/shared/utils/wiki-links'

import { EMBED_MAX_DEPTH } from '@/shared/constants/embeds'
import { LOCAL_URL_PATTERN } from '@/features/editor/dom/constants/local-urls'
import {
    CHAR,
    CODE_INDENT_WIDTH,
    EMBED_BLOCK_ALT_RULES,
    EMBED_MEDIA_TOKEN,
    HTML_BLOCK_TOKEN,
    HTML_INLINE_TOKEN,
    IMAGE_TOKEN,
    INLINE_TOKEN,
    LOCAL_URLS_RULE,
    NOTE_EMBED_BLOCK_RULE,
    NOTE_EMBED_RULE,
    NOTE_EMBED_TOKEN,
    NOTE_NODES,
    WIKI_LINK_MARK_LENGTH,
    WIKI_LINK_RULE_ANCHOR,
    WIKI_LINK_TOKEN
} from '@/shared/constants/note-syntax'

const readLink = (src, pos, max) => {
    const targetFrom = pos + WIKI_LINK_MARK_LENGTH
    let position = targetFrom
    let aliasFrom = -1

    while (position < max) {
        const code = src.charCodeAt(position)

        if (code === CHAR.NEWLINE) return null
        if (code === CHAR.CLOSE_BRACKET) break
        if (code === CHAR.PIPE && aliasFrom === -1) {
            if (position === targetFrom) return null
            aliasFrom = position + 1
        }

        position++
    }

    const closes = src.charCodeAt(position) === CHAR.CLOSE_BRACKET && src.charCodeAt(position + 1) === CHAR.CLOSE_BRACKET
    const targetTo = aliasFrom === -1 ? position : aliasFrom - 1

    if (!closes || targetTo === targetFrom || aliasFrom === position) return null

    return {
        linkText: src.slice(targetFrom, targetTo),
        alias: aliasFrom === -1 ? undefined : src.slice(aliasFrom, position),
        end: position + WIKI_LINK_MARK_LENGTH
    }
}

const isOpening = (src, pos) => (
    src.charCodeAt(pos) === CHAR.OPEN_BRACKET && src.charCodeAt(pos + 1) === CHAR.OPEN_BRACKET
)

const isEmbedOpening = (src, pos) => src.charCodeAt(pos) === CHAR.BANG && isOpening(src, pos + 1)

const classifyEmbed = (link) => {
    const target = link.linkText.trim()
    const media = parseEmbedMedia(target)

    if (media.kind) return { type: EMBED_MEDIA_TOKEN, meta: { ...link, media } }
    if (isFileLinkTarget(target)) return { type: WIKI_LINK_TOKEN, meta: link }

    return { type: NOTE_EMBED_TOKEN, meta: { ...link, target } }
}

const registerTargets = (env, { type, meta }) => {
    env.wikiTargets.add(meta.linkText)

    if (type === EMBED_MEDIA_TOKEN) env.mediaNames.add(meta.media.name)
    if (type === NOTE_EMBED_TOKEN) env.embedTargets.add(meta.target)
}

const wikiLinkRule = (state, silent) => {
    if (!state.env.wikiTargets || !isOpening(state.src, state.pos)) return false

    const link = readLink(state.src, state.pos, state.posMax)
    if (!link) return false

    if (!silent) {
        const token = state.push(WIKI_LINK_TOKEN, '', 0)
        token.meta = { linkText: link.linkText, alias: link.alias }
        state.env.wikiTargets.add(link.linkText)
    }

    state.pos = link.end
    return true
}

const embedInlineRule = (state, silent) => {
    if (!state.env.wikiTargets || !isEmbedOpening(state.src, state.pos)) return false

    const link = readLink(state.src, state.pos + 1, state.posMax)
    if (!link) return false

    if (!silent) {
        const embed = classifyEmbed(link)
        const token = state.push(embed.type, '', 0)
        token.meta = embed.meta
        registerTargets(state.env, embed)
    }

    state.pos = link.end
    return true
}

const embedBlockRule = (state, startLine, endLine, silent) => {
    if (!state.env.wikiTargets || state.sCount[startLine] - state.blkIndent >= CODE_INDENT_WIDTH) return false

    const start = state.bMarks[startLine] + state.tShift[startLine]
    const max = state.eMarks[startLine]
    if (!isEmbedOpening(state.src, start)) return false

    const link = readLink(state.src, start + 1, max)
    if (!link || state.src.slice(link.end, max).trim()) return false

    const embed = classifyEmbed(link)
    if (embed.type !== NOTE_EMBED_TOKEN) return false
    if (silent) return true

    const token = state.push(embed.type, '', 0)
    token.block = true
    token.meta = embed.meta
    token.map = [startLine, startLine + 1]
    registerTargets(state.env, embed)
    state.line = startLine + 1

    return true
}

const missingDetails = (linkText) => ({ path: null, anchor: '', target: linkText })

const renderLinkFallback = (env, { linkText, alias }) => (
    renderWikiLink(alias, env.wikiResolved?.get(linkText) ?? missingDetails(linkText))
)

const renderWikiLinkToken = (tokens, idx, options, env) => renderLinkFallback(env, tokens[idx].meta)

const renderMediaToken = (tokens, idx, options, env) => {
    const { media, alias } = tokens[idx].meta
    const url = env.embedMedia?.get(media.name)

    return url ? buildMediaHtml(media, alias, url) : renderLinkFallback(env, tokens[idx].meta)
}

const collectLocalUrls = (state) => {
    const { localUrls } = state.env

    if (!localUrls) return

    for (const block of state.tokens) {
        if (block.type === HTML_BLOCK_TOKEN) extractLocalUrls(block.content).forEach((url) => localUrls.add(url))
        if (block.type !== INLINE_TOKEN) continue

        for (const child of block.children) {
            const src = child.type === IMAGE_TOKEN ? child.attrGet('src') : null

            if (src && LOCAL_URL_PATTERN.test(src)) localUrls.add(src)
            else if (child.type === HTML_INLINE_TOKEN) extractLocalUrls(child.content).forEach((url) => localUrls.add(url))
        }
    }
}

const createImageRule = (defaultRule) => (state, silent) => {
    const { validateLink } = state.md

    state.md.validateLink = (url) => LOCAL_URL_PATTERN.test(url.trim()) || validateLink(url)

    try {
        return defaultRule(state, silent)
    } finally {
        state.md.validateLink = validateLink
    }
}

const createImageRenderer = (defaultImage) => (tokens, idx, options, env, self) => {
    const src = tokens[idx].attrGet('src')
    const resolved = env.localMedia?.get(src)

    if (resolved) tokens[idx].attrSet('src', resolved)

    return defaultImage(tokens, idx, options, env, self)
}

const inheritContext = (child, parent, path) => {
    child.wikiResolved = parent.wikiResolved
    child.localMedia = parent.localMedia
    child.embedMedia = parent.embedMedia
    child.embedLoaded = parent.embedLoaded
    child.embedStack = [...parent.embedStack, path]
    child.embedDepth = parent.embedDepth + 1
}

const createEmbedRenderer = (md) => (tokens, idx, options, env) => {
    const meta = tokens[idx].meta
    const loaded = env.embedLoaded?.get(meta.target)
    const stack = env.embedStack ?? []
    const depth = env.embedDepth ?? 0
    const isBlocked = !loaded || depth >= EMBED_MAX_DEPTH || stack.includes(loaded.path)

    if (isBlocked) return renderLinkFallback(env, meta)

    inheritContext(loaded.parsed.env, { ...env, embedStack: stack, embedDepth: depth }, loaded.path)

    return buildEmbedBlockHtml({
        title: loaded.title,
        body: md.renderer.render(loaded.parsed.tokens, options, loaded.parsed.env),
        path: loaded.path,
        anchor: loaded.anchor,
        withOpenLink: true
    })
}

export const wikiLinksPlugin = (md) => {
    md.inline.ruler.before(WIKI_LINK_RULE_ANCHOR, NOTE_NODES.WIKI_LINK, wikiLinkRule)
    md.inline.ruler.before(WIKI_LINK_RULE_ANCHOR, NOTE_EMBED_RULE, embedInlineRule)
    md.block.ruler.before('paragraph', NOTE_EMBED_BLOCK_RULE, embedBlockRule, { alt: EMBED_BLOCK_ALT_RULES })
    const imageRule = md.inline.ruler.__rules__.find((rule) => rule.name === IMAGE_TOKEN)

    md.inline.ruler.at(IMAGE_TOKEN, createImageRule(imageRule.fn))
    md.core.ruler.push(LOCAL_URLS_RULE, collectLocalUrls)
    md.renderer.rules[IMAGE_TOKEN] = createImageRenderer(md.renderer.rules[IMAGE_TOKEN])
    md.renderer.rules[WIKI_LINK_TOKEN] = renderWikiLinkToken
    md.renderer.rules[EMBED_MEDIA_TOKEN] = renderMediaToken
    md.renderer.rules[NOTE_EMBED_TOKEN] = createEmbedRenderer(md)
}
