import {
    CLOSING_BRACKETS,
    CONTENT_QUALIFIER,
    CONTENT_QUALIFIER_REGEX,
    DATE_KEY_LENGTH,
    DATE_VALUE_REGEX,
    DAY_IN_MS,
    IMAGE_QUALIFIER,
    IMAGE_QUALIFIER_REGEX,
    LINE_OPERATORS,
    MARKDOWN_IMAGE_REGEX,
    NEGATION_PREFIX,
    OPENING_BRACKETS,
    OR_KEYWORD,
    PHRASE_TOKEN_REGEX,
    PINNED_QUALIFIER,
    PINNED_QUALIFIER_REGEX,
    PROPERTY_TOKEN_REGEX,
    QUALIFIER_TOKEN_REGEX,
    QUOTE_CHAR,
    REGEX_DELIMITER,
    REGEX_FLAGS,
    REGEX_TOKEN_REGEX,
    SEARCH_OPERATORS,
    TAG_QUALIFIER_REGEX,
    TASK_STATUS_LINE_REGEX,
    TASK_STATUS_TODO,
    TASK_STATUSES_DONE,
    WHITESPACE_REGEX,
    WRAPPED_VALUE_REGEX
} from '@/constants/search-query'
import { fuzzyMatch } from './fuzzy-match'
import { getNoteTags } from './note-tags'
import { matchesTag } from './tag-names'

import { LEADING_HASH_PATTERN } from '@/constants/markdown-patterns'

const isWhitespace = (char) => WHITESPACE_REGEX.test(char)

const splitTokens = (query) => {
    const tokens = []
    let current = ''
    let quoted = false
    let regex = false
    let depth = 0

    for (const char of query) {
        const isDelimiter = char === REGEX_DELIMITER && !quoted
        const startsRegex = isDelimiter && !regex && (current === '' || current === NEGATION_PREFIX)
        const endsRegex = isDelimiter && regex && !current.endsWith('\\')

        if (char === QUOTE_CHAR && !regex) quoted = !quoted
        else if (!quoted && !regex && OPENING_BRACKETS.includes(char)) depth += 1
        else if (!quoted && !regex && CLOSING_BRACKETS.includes(char) && depth > 0) depth -= 1

        if (isWhitespace(char) && !quoted && !regex && depth === 0) {
            if (current) tokens.push(current)
            current = ''
        } else {
            current += char
        }

        if (startsRegex) regex = true
        else if (endsRegex) regex = false
    }

    if (current) tokens.push(current)

    return tokens
}

const unwrap = (value) => {
    const match = WRAPPED_VALUE_REGEX.exec(value)
    return match ? (match[1] ?? match[2]) : value
}

const toDateKey = (timestamp) => (timestamp ? new Date(timestamp).toISOString().slice(0, DATE_KEY_LENGTH) : null)

const shiftDateKey = (key, days) => toDateKey(Date.parse(key) + days * DAY_IN_MS)

const DATE_RANGE_BUILDERS = {
    '>': (date) => ({ from: shiftDateKey(date, 1), to: null }),
    '>=': (date) => ({ from: date, to: null }),
    '<': (date) => ({ from: null, to: shiftDateKey(date, -1) }),
    '<=': (date) => ({ from: null, to: date })
}

const parseDateRange = (value) => {
    const match = DATE_VALUE_REGEX.exec(value)
    if (!match) return null

    const [, from, to, operator, date] = match
    if (from) return { from, to }

    return operator ? DATE_RANGE_BUILDERS[operator](date) : { from: date, to: date }
}

const compileRegex = (source) => {
    try {
        return new RegExp(source, REGEX_FLAGS)
    } catch {
        return null
    }
}

const pushList = (positive, negative, normalize = (entry) => entry) => (parsed, value, negate) => {
    if (!value) return false

    parsed[negate ? negative : positive].push(normalize(unwrap(value).toLowerCase()))
    return true
}

const setDateRange = (field) => (parsed, value) => {
    const range = parseDateRange(value)
    if (!range) return false

    parsed[field] = range
    return true
}

const addLine = (kind) => (parsed, value) => {
    const terms = unwrap(value).toLowerCase().split(WHITESPACE_REGEX).filter(Boolean)
    if (terms.length === 0 && kind === SEARCH_OPERATORS.LINE) return false

    parsed.lines.push({ kind, terms })
    return true
}

const QUALIFIER_HANDLERS = {
    [SEARCH_OPERATORS.TAG]: pushList('tags', 'excludedTags', (tag) => tag.replace(LEADING_HASH_PATTERN, '')),
    [SEARCH_OPERATORS.PATH]: pushList('paths', 'excludedPaths'),
    [SEARCH_OPERATORS.FILE]: pushList('files', 'excludedFiles'),
    [SEARCH_OPERATORS.MODIFIED]: setDateRange('modified'),
    [SEARCH_OPERATORS.CREATED]: setDateRange('created'),
    [SEARCH_OPERATORS.IS]: (parsed, value, negate) => {
        if (value.toLowerCase() !== 'pinned') return false

        parsed[negate ? 'notPinned' : 'pinned'] = true
        return true
    },
    [SEARCH_OPERATORS.HAS]: (parsed, value, negate) => {
        if (value.toLowerCase() !== 'image') return false

        parsed[negate ? 'noImage' : 'hasImage'] = true
        return true
    },
    [SEARCH_OPERATORS.IN]: (parsed, value) => {
        if (value.toLowerCase() !== 'content') return false

        parsed.inContent = true
        return true
    },
    ...Object.fromEntries(LINE_OPERATORS.map((operator) => [operator, addLine(operator)]))
}

const applyQualifier = (parsed, body, negate) => {
    const match = QUALIFIER_TOKEN_REGEX.exec(body)
    const handler = match && QUALIFIER_HANDLERS[match[1].toLowerCase()]

    return handler ? handler(parsed, match[2], negate) : false
}

const applyProperty = (parsed, body, negate) => {
    const match = PROPERTY_TOKEN_REGEX.exec(body)
    if (!match) return false

    parsed.properties.push({
        key: match[1].trim().toLowerCase(),
        value: match[2] === undefined ? null : match[2].trim().toLowerCase(),
        negate
    })
    return true
}

const createGroup = () => ({ words: [], phrases: [], regexes: [] })

const addTextToken = (parsed, group, body, negate) => {
    const regexMatch = REGEX_TOKEN_REGEX.exec(body)
    const regex = regexMatch && compileRegex(regexMatch[1])

    if (regex) {
        (negate ? parsed.excludedRegexes : group.regexes).push(regex)
        return
    }

    const phraseMatch = PHRASE_TOKEN_REGEX.exec(body)

    if (phraseMatch) {
        (negate ? parsed.excludedTerms : group.phrases).push(phraseMatch[1].toLowerCase())
        return
    }

    if (negate) parsed.excludedTerms.push(body.toLowerCase())
    else group.words.push(body)
}

const toMatcher = ({ words, phrases, regexes }) => ({
    text: words.join(' ').trim().toLowerCase(),
    phrases,
    regexes
})

const hasMatchers = ({ text, phrases, regexes }) => !!text || phrases.length > 0 || regexes.length > 0

export const parseSearchQuery = (query) => {
    const parsed = {
        tags: [],
        excludedTags: [],
        paths: [],
        excludedPaths: [],
        files: [],
        excludedFiles: [],
        pinned: false,
        notPinned: false,
        hasImage: false,
        noImage: false,
        inContent: false,
        modified: null,
        created: null,
        lines: [],
        properties: [],
        excludedTerms: [],
        excludedRegexes: []
    }
    const groups = [createGroup()]

    splitTokens(query).forEach((token) => {
        if (token === OR_KEYWORD) {
            groups.push(createGroup())
            return
        }

        const negate = token.length > 1 && token.startsWith(NEGATION_PREFIX)
        const body = negate ? token.slice(1) : token

        if (applyProperty(parsed, body, negate) || applyQualifier(parsed, body, negate)) return

        addTextToken(parsed, groups[groups.length - 1], body, negate)
    })

    const [primary, ...others] = groups.map(toMatcher)

    return { ...primary, ...parsed, orGroups: others.filter(hasMatchers) }
}

export const toggleTagQualifier = (query, tagName) => {
    const target = tagName.toLowerCase()
    const existingTags = []

    const withoutTags = query.replace(TAG_QUALIFIER_REGEX, (match, quoted, bare) => {
        existingTags.push(quoted || bare)
        return ''
    }).trim()

    const isActive = existingTags.some((name) => name.toLowerCase() === target)

    const nextTags = isActive
        ? existingTags.filter((name) => name.toLowerCase() !== target)
        : [...existingTags, tagName]

    const qualifiers = nextTags
        .map((name) => (/\s/.test(name) ? `tag:"${name}"` : `tag:${name}`))
        .join(' ')

    if (!withoutTags) return qualifiers
    if (!qualifiers) return withoutTags
    return `${withoutTags} ${qualifiers}`
}

const toggleQualifier = (query, regex, qualifier) => {
    if (regex.test(query)) return query.replace(regex, '').trim()
    return query ? `${query} ${qualifier}` : qualifier
}

export const togglePinnedQualifier = (query) => toggleQualifier(query, PINNED_QUALIFIER_REGEX, PINNED_QUALIFIER)

export const toggleImageQualifier = (query) => toggleQualifier(query, IMAGE_QUALIFIER_REGEX, IMAGE_QUALIFIER)

export const toggleContentQualifier = (query) => toggleQualifier(query, CONTENT_QUALIFIER_REGEX, CONTENT_QUALIFIER)

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
