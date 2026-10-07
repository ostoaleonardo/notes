import { fuzzyMatch } from './fuzzy-match'
import { getNoteTags } from './note-tags'
import { matchesTag } from './tag-names'
import { toDateKey } from './date-key'
import { hasMatchers } from './search-query'

import {
    MARKDOWN_IMAGE_REGEX,
    SEARCH_OPERATORS,
    TASK_STATUSES_DONE,
    TASK_STATUS_LINE_REGEX,
    TASK_STATUS_TODO
} from '@/constants/search-query'

const hasMatchingTag = (note, queries) => (
    getNoteTags(note).some((tag) => queries.some((query) => matchesTag(tag, query)))
)

const getFullPath = (note, notePaths) => {
    const folder = notePaths?.get(note.path)
    return (folder ? `${folder}/${note.filename}` : note.filename || '').toLowerCase()
}

const inDateRange = (timestamp, range) => {
    if (!range) return true

    const key = toDateKey(timestamp)
    if (!key) return false

    return (!range.from || key >= range.from) && (!range.to || key <= range.to)
}

const lowerContentCache = new WeakMap()

const getLowerContent = (note) => {
    if (!lowerContentCache.has(note)) lowerContentCache.set(note, (note.note || '').toLowerCase())
    return lowerContentCache.get(note)
}

const includesTerm = (note, parsed, term) => (
    (note.title || '').toLowerCase().includes(term)
    || (parsed.inContent && getLowerContent(note).includes(term))
)

const matchesRegex = (note, parsed, regex) => (
    regex.test(note.title || '') || (parsed.inContent && regex.test(note.note || ''))
)

const getPropertyValues = (note, key) => {
    const entry = Object.entries(note.properties || {}).find(([name]) => name.toLowerCase() === key)
    if (!entry) return null

    return (Array.isArray(entry[1]) ? entry[1] : [entry[1]]).map((item) => String(item ?? '').toLowerCase())
}

const matchesProperty = (note, { key, value }) => {
    const values = getPropertyValues(note, key)
    if (!values) return false

    return !value || values.some((item) => item.includes(value))
}

const lineMatches = (line, { kind, terms }) => {
    const task = TASK_STATUS_LINE_REGEX.exec(line)
    const text = (task ? line.slice(task[0].length) : line).toLowerCase()

    if (!terms.every((term) => text.includes(term))) return false
    if (kind === SEARCH_OPERATORS.LINE) return true
    if (!task) return false
    if (kind === SEARCH_OPERATORS.TASK_TODO) return task[1] === TASK_STATUS_TODO
    if (kind === SEARCH_OPERATORS.TASK_DONE) return TASK_STATUSES_DONE.includes(task[1])

    return true
}

const matchesLines = (note, specs) => {
    const lines = (note.note || '').split('\n')
    return specs.every((spec) => lines.some((line) => lineMatches(line, spec)))
}

const NOTE_FILTERS = [
    (note, parsed, { pinned }) => !parsed.pinned || pinned.has(note.path),
    (note, parsed, { pinned }) => !parsed.notPinned || !pinned.has(note.path),
    (note, parsed, { notePaths }) => parsed.paths.every((path) => getFullPath(note, notePaths).includes(path)),
    (note, parsed, { notePaths }) => !parsed.excludedPaths.some((path) => getFullPath(note, notePaths).includes(path)),
    (note, parsed) => parsed.files.every((file) => (note.filename || '').toLowerCase().includes(file)),
    (note, parsed) => !parsed.excludedFiles.some((file) => (note.filename || '').toLowerCase().includes(file)),
    (note, parsed) => parsed.tags.length === 0 || hasMatchingTag(note, parsed.tags),
    (note, parsed) => !hasMatchingTag(note, parsed.excludedTags),
    (note, parsed) => !parsed.hasImage || MARKDOWN_IMAGE_REGEX.test(note.note || ''),
    (note, parsed) => !parsed.noImage || !MARKDOWN_IMAGE_REGEX.test(note.note || ''),
    (note, parsed) => inDateRange(note.updatedAt, parsed.modified),
    (note, parsed) => inDateRange(note.createdAt, parsed.created),
    (note, parsed) => matchesLines(note, parsed.lines),
    (note, parsed) => parsed.properties.every((property) => matchesProperty(note, property) !== property.negate),
    (note, parsed) => !parsed.excludedTerms.some((term) => includesTerm(note, parsed, term)),
    (note, parsed) => !parsed.excludedRegexes.some((regex) => matchesRegex(note, parsed, regex))
]

const scoreGroup = (note, parsed, group) => {
    const phrasesMatch = group.phrases.every((phrase) => includesTerm(note, parsed, phrase))
    const regexesMatch = group.regexes.every((regex) => matchesRegex(note, parsed, regex))

    if (!phrasesMatch || !regexesMatch) return null
    if (!group.text) return 0

    const titleMatch = fuzzyMatch(group.text, note.title)
    const matchesContent = parsed.inContent && getLowerContent(note).includes(group.text)

    return titleMatch.matches || matchesContent ? titleMatch.score : null
}

const scoreNote = (note, parsed) => {
    const groups = [parsed, ...parsed.orGroups].filter(hasMatchers)
    if (groups.length === 0) return { note, score: 0 }

    const scores = groups.map((group) => scoreGroup(note, parsed, group)).filter((score) => score !== null)

    return scores.length > 0 ? { note, score: Math.max(...scores) } : null
}

export const filterNotes = (notes, parsed, context) => (
    notes
        .filter((note) => NOTE_FILTERS.every((filter) => filter(note, parsed, context)))
        .map((note) => scoreNote(note, parsed))
        .filter(Boolean)
        .sort((a, b) => b.score - a.score)
        .map(({ note }) => note)
)
