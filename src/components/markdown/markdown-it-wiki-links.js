import { renderWikiLink } from '@/utils/wiki-links'

import { CHAR, NOTE_NODES, WIKI_LINK_MARK_LENGTH, WIKI_LINK_RULE_ANCHOR, WIKI_LINK_TOKEN } from '@/constants/note-syntax'

const MISSING_RESOLUTION = { path: null, anchor: '' }

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

const wikiLinkRule = (state, silent) => {
    if (!state.env.wikiTargets || state.src.charCodeAt(state.pos) !== CHAR.OPEN_BRACKET) return false
    if (state.src.charCodeAt(state.pos + 1) !== CHAR.OPEN_BRACKET) return false

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

const renderWikiLinkToken = (tokens, idx, options, env) => {
    const { linkText, alias } = tokens[idx].meta
    const resolution = env.wikiResolved?.get(linkText) ?? { ...MISSING_RESOLUTION, target: linkText }

    return renderWikiLink(alias, resolution)
}

export const wikiLinksPlugin = (md) => {
    md.inline.ruler.before(WIKI_LINK_RULE_ANCHOR, NOTE_NODES.WIKI_LINK, wikiLinkRule)
    md.renderer.rules[WIKI_LINK_TOKEN] = renderWikiLinkToken
}
