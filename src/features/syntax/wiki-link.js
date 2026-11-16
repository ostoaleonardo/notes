import { CHAR, NOTE_NODES, WIKI_LINK_MARK_LENGTH, LINK_PARSER_NAME } from '@/shared/constants/note-syntax'

const readLink = (cx, from) => {
    const targetFrom = from + WIKI_LINK_MARK_LENGTH
    let position = targetFrom
    let aliasFrom = -1

    while (position < cx.end) {
        const code = cx.char(position)

        if (code === CHAR.NEWLINE) return null
        if (code === CHAR.CLOSE_BRACKET) break
        if (code === CHAR.PIPE && aliasFrom === -1) {
            if (position === targetFrom) return null
            aliasFrom = position + 1
        }

        position++
    }

    if (cx.char(position) !== CHAR.CLOSE_BRACKET || cx.char(position + 1) !== CHAR.CLOSE_BRACKET) return null

    const targetTo = aliasFrom === -1 ? position : aliasFrom - 1
    if (targetTo === targetFrom || (aliasFrom !== -1 && aliasFrom === position)) return null

    return { targetFrom, targetTo, aliasFrom, closeFrom: position }
}

const buildLink = (cx, name, from, link) => {
    const children = [
        cx.elt(NOTE_NODES.WIKI_LINK_MARK, from, link.targetFrom),
        cx.elt(NOTE_NODES.WIKI_LINK_TARGET, link.targetFrom, link.targetTo)
    ]

    if (link.aliasFrom !== -1) children.push(cx.elt(NOTE_NODES.WIKI_LINK_ALIAS, link.aliasFrom, link.closeFrom))

    const end = link.closeFrom + WIKI_LINK_MARK_LENGTH
    children.push(cx.elt(NOTE_NODES.WIKI_LINK_MARK, link.closeFrom, end))

    return cx.append(cx.elt(name, from, end, children))
}

const parseWikiLink = (cx, next, pos) => {
    if (next !== CHAR.OPEN_BRACKET || cx.char(pos + 1) !== CHAR.OPEN_BRACKET) return -1

    const link = readLink(cx, pos)

    return link ? buildLink(cx, NOTE_NODES.WIKI_LINK, pos, link) : -1
}

const parseWikiEmbed = (cx, next, pos) => {
    if (next !== CHAR.BANG || cx.char(pos + 1) !== CHAR.OPEN_BRACKET || cx.char(pos + 2) !== CHAR.OPEN_BRACKET) {
        return -1
    }

    const link = readLink(cx, pos + 1)

    return link ? buildLink(cx, NOTE_NODES.WIKI_EMBED, pos, link) : -1
}

export const wikiLink = {
    defineNodes: [
        NOTE_NODES.WIKI_LINK,
        NOTE_NODES.WIKI_EMBED,
        NOTE_NODES.WIKI_LINK_MARK,
        NOTE_NODES.WIKI_LINK_TARGET,
        NOTE_NODES.WIKI_LINK_ALIAS
    ],
    parseInline: [
        { name: NOTE_NODES.WIKI_EMBED, parse: parseWikiEmbed, before: LINK_PARSER_NAME },
        { name: NOTE_NODES.WIKI_LINK, parse: parseWikiLink, before: LINK_PARSER_NAME }
    ]
}
