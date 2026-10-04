import { escapeHtml, findBacklinks, getAliases } from '@/utils/wiki-links'
import { mapOutsideCode } from '@/utils/outside-code'

import { WIKI_LINK_SCHEME } from '@/constants/wiki-links'
import {
    BACKLINKS_CLASS,
    BACKLINKS_TITLE_CLASS,
    BACKLINK_TITLE_CLASS,
    BACKLINK_PATH_CLASS,
    MENTIONS_CLASS,
    MENTION_ROW_CLASS,
    MENTION_ACTION_CLASS
} from '@/constants/backlinks'
import {
    LINK_MENTION_SCHEME,
    MENTION_WORD_CHARS,
    MENTION_EXCLUDED_PREFIX,
    MENTION_EXISTING_LINKS_SOURCE
} from '@/constants/unlinked-mentions'

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const getMentionNames = (target) => (
    [...new Set([target.title, ...getAliases(target)].map((name) => (name || '').trim()).filter(Boolean))]
        .sort((a, b) => b.length - a.length)
)

const mapMentions = (text, names, onMention) => {
    if (!names.length) return text

    const alternatives = names.map(escapeRegExp).join('|')
    const pattern = new RegExp(
        `${MENTION_EXISTING_LINKS_SOURCE}|(?<![${MENTION_WORD_CHARS}${MENTION_EXCLUDED_PREFIX}])(?:${alternatives})(?![${MENTION_WORD_CHARS}])`,
        'gi'
    )

    return mapOutsideCode(text, (segment) => segment.replace(
        pattern,
        (match) => (match.startsWith('[') ? match : onMention(match))
    ))
}

const hasMention = (text, names) => {
    let found = false
    mapMentions(text, names, (match) => {
        found = true
        return match
    })
    return found
}

export const linkMentions = (text, target) => mapMentions(text, getMentionNames(target), (match) => (
    match === target.title ? `[[${match}]]` : `[[${target.title}|${match}]]`
))

export const findUnlinkedMentions = (target, notes, notePaths = new Map()) => {
    const names = getMentionNames(target)
    if (!names.length) return []

    const linked = new Set(findBacklinks(target.path, notes, notePaths).map((note) => note.path))

    return notes.filter((note) => (
        note.path !== target.path && !linked.has(note.path) && hasMention(note.note || '', names)
    ))
}

export const buildUnlinkedMentionsHtml = (mentions, label, actionLabel, notePaths = new Map()) => {
    if (!mentions.length) return ''

    const items = mentions.map((note) => {
        const path = notePaths.get(note.path) || ''
        const pathHtml = path ? `<span class="${BACKLINK_PATH_CLASS}">${escapeHtml(path)}</span>` : ''

        return (
            `<li class="${MENTION_ROW_CLASS}">`
            + `<a href="${WIKI_LINK_SCHEME}${encodeURIComponent(note.path)}" class="wiki-link">`
            + `<span class="${BACKLINK_TITLE_CLASS}">${escapeHtml(note.title || '')}</span>${pathHtml}`
            + `</a>`
            + `<a href="${LINK_MENTION_SCHEME}${encodeURIComponent(note.path)}" class="${MENTION_ACTION_CLASS}">`
            + `${escapeHtml(actionLabel)}</a>`
            + `</li>`
        )
    }).join('')

    return (
        `<div class="${BACKLINKS_CLASS} ${MENTIONS_CLASS}">`
        + `<div class="${BACKLINKS_TITLE_CLASS}">${escapeHtml(label)}</div><ul>${items}</ul></div>`
    )
}
