import { escapeHtml, findBacklinks, getAliases } from '@/utils/wiki-links'
import { mapOutsideCode } from '@/utils/outside-code'

import { WIKI_LINK_SCHEME } from '@/constants/wiki-links'
import { EMPTY_NOTE_PATHS } from '@/constants/note-paths'
import { REGEXP_SPECIAL_CHARS_PATTERN } from '@/constants/markdown-patterns'
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

const escapeRegExp = (text) => text.replace(REGEXP_SPECIAL_CHARS_PATTERN, '\\$&')

const getMentionNames = (target) => (
    [...new Set([target.title, ...getAliases(target)].map((name) => (name || '').trim()).filter(Boolean))]
        .sort((a, b) => b.length - a.length)
)

const buildMentionPattern = (names) => {
    const alternatives = names.map(escapeRegExp).join('|')

    return new RegExp(
        `${MENTION_EXISTING_LINKS_SOURCE}|(?<![${MENTION_WORD_CHARS}${MENTION_EXCLUDED_PREFIX}])(?:${alternatives})(?![${MENTION_WORD_CHARS}])`,
        'gi'
    )
}

const mapMentions = (text, pattern, onMention) => mapOutsideCode(text, (segment) => segment.replace(
    pattern,
    (match) => (match.startsWith('[') ? match : onMention(match))
))

const hasMention = (text, pattern) => {
    let found = false
    mapMentions(text, pattern, (match) => {
        found = true
        return match
    })
    return found
}

export const linkMentions = (text, target) => {
    const names = getMentionNames(target)
    if (!names.length) return text

    return mapMentions(text, buildMentionPattern(names), (match) => (
        match === target.title ? `[[${match}]]` : `[[${target.title}|${match}]]`
    ))
}

export const findUnlinkedMentions = (target, notes, notePaths = EMPTY_NOTE_PATHS) => {
    const names = getMentionNames(target)
    if (!names.length) return []

    const linked = new Set(findBacklinks(target.path, notes, notePaths).map((note) => note.path))
    const probe = new RegExp(names.map(escapeRegExp).join('|'), 'i')
    const pattern = buildMentionPattern(names)

    return notes.filter((note) => {
        if (note.path === target.path || linked.has(note.path)) return false

        const body = note.note || ''

        return probe.test(body) && hasMention(body, pattern)
    })
}

export const buildUnlinkedMentionsHtml = (mentions, label, actionLabel, notePaths = EMPTY_NOTE_PATHS) => {
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
