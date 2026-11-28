import { buildBacklinkLink, escapeHtml, getAliases } from '@/shared/utils/wiki-links'
import { fillTemplate } from '@/shared/utils/fill-template'
import { mapOutsideCode } from '@/shared/utils/outside-code'
import { bodyOf } from '@/shared/utils/note-body-of'

import { BACKLINKS_TEMPLATE, MENTION_ITEM_TEMPLATE } from '@/shared/constants/backlinks-html'
import { REGEXP_SPECIAL_CHARS_PATTERN } from '@/shared/constants/markdown-patterns'
import {
    BACKLINKS_CLASS,
    BACKLINKS_TITLE_CLASS,
    MENTIONS_CLASS,
    MENTION_ROW_CLASS,
    MENTION_ACTION_CLASS
} from '@/shared/constants/backlinks'
import {
    LINK_MENTION_SCHEME,
    MENTION_WORD_CHARS,
    MENTION_EXCLUDED_PREFIX,
    MENTION_EXISTING_LINKS_SOURCE
} from '@/features/editor/native/constants/unlinked-mentions'

const escapeRegExp = (text) => text.replace(REGEXP_SPECIAL_CHARS_PATTERN, '\\$&')

export const getMentionNames = (target) => (
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

export const findUnlinkedMentions = (target, notes, { linked = new Set(), pool = null, bodies } = {}) => {
    const names = getMentionNames(target)
    if (!names.length) return []

    const candidates = pool ? notes.filter((note) => pool.has(note.path)) : notes
    const probe = new RegExp(names.map(escapeRegExp).join('|'), 'i')
    const pattern = buildMentionPattern(names)

    return candidates.filter((note) => {
        if (note.path === target.path || linked.has(note.path)) return false

        const body = bodyOf(note, bodies)

        return probe.test(body) && hasMention(body, pattern)
    })
}

export const buildUnlinkedMentionsHtml = (
    mentions,
    label,
    actionLabel,
    folderPathByNote = new Map()
) => {
    if (!mentions.length) return ''

    const items = mentions.map((note) => fillTemplate(MENTION_ITEM_TEMPLATE, {
        rowClass: MENTION_ROW_CLASS,
        link: buildBacklinkLink(note, folderPathByNote),
        actionHref: `${LINK_MENTION_SCHEME}${encodeURIComponent(note.path)}`,
        actionClass: MENTION_ACTION_CLASS,
        action: escapeHtml(actionLabel)
    })).join('')

    return fillTemplate(BACKLINKS_TEMPLATE, {
        className: `${BACKLINKS_CLASS} ${MENTIONS_CLASS}`,
        titleClass: BACKLINKS_TITLE_CLASS,
        label: escapeHtml(label),
        items
    })
}
