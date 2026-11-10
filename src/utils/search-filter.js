import { getNoteTags } from './note-tags'
import { getSearchText } from './search-text'
import { sortNotes } from './note-sort'
import { getTagValue } from './search-parser'
import { matchesTag } from './tag-names'

import {
    BLOCK_SEPARATOR_REGEX,
    FILE_REFERENCE_REGEX,
    HEADING_LINE_REGEX,
    IMAGE_REFERENCE_REGEX,
    SEARCH_HAS_VALUES,
    SEARCH_IS_VALUES,
    SEARCH_NODE_TYPES,
    SEARCH_OPERATORS,
    TASK_STATUSES_DONE,
    TASK_STATUS_LINE_REGEX,
    TASK_STATUS_TODO,
    UNIT_OPERATORS,
    WORD_CHARACTER_PATTERN
} from '@/constants/search-query'

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const getWordRegex = (node, sensitive) => {
    const key = sensitive ? 'wordRegexSensitive' : 'wordRegexInsensitive'

    if (!node[key]) {
        const source = `(?<!${WORD_CHARACTER_PATTERN})${escapeRegex(node.value)}(?!${WORD_CHARACTER_PATTERN})`
        node[key] = new RegExp(source, sensitive ? 'u' : 'iu')
    }

    return node[key]
}

const createField = (raw, wholeWord = false) => {
    let lower = null

    return {
        raw,
        wholeWord,
        get lower() {
            if (lower === null) lower = raw.toLowerCase()
            return lower
        }
    }
}

const createLazy = (build) => {
    let value
    let ready = false

    return () => {
        if (!ready) {
            value = build()
            ready = true
        }

        return value
    }
}

const splitSections = (lines) => {
    const sections = []

    lines.forEach((line) => {
        if (HEADING_LINE_REGEX.test(line) || sections.length === 0) sections.push([])
        sections[sections.length - 1].push(line)
    })

    return sections.map((section) => section.join('\n'))
}

const readTasks = (lines) => lines.flatMap((line) => {
    const match = TASK_STATUS_LINE_REGEX.exec(line)
    return match ? [{ field: createField(line.slice(match[0].length), true), status: match[1] }] : []
})

const infoCache = new WeakMap()

const getNoteInfo = (note) => {
    let info = infoCache.get(note)

    if (!info) {
        const content = getSearchText(note)
        const lines = createLazy(() => content.split('\n'))

        info = {
            title: createField(note.title || ''),
            filename: createField(note.filename || note.title || ''),
            content: createField(content, true),
            lines: createLazy(() => lines().map((line) => createField(line, true))),
            blocks: createLazy(() => content.split(BLOCK_SEPARATOR_REGEX).map((block) => createField(block, true))),
            sections: createLazy(() => splitSections(lines()).map((section) => createField(section, true))),
            tasks: createLazy(() => readTasks(lines())),
            hasImages: createLazy(() => IMAGE_REFERENCE_REGEX.test(content)),
            hasFiles: createLazy(() => FILE_REFERENCE_REGEX.test(content))
        }

        infoCache.set(note, info)
    }

    return info
}

const getFullPath = (note, info, notePaths) => {
    const folder = notePaths?.get(note.path)
    return createField(folder ? `${folder}/${info.filename.raw}` : info.filename.raw)
}

const getPropertyValues = (note, key) => {
    const entry = Object.entries(note.properties || {}).find(([name]) => name.toLowerCase() === key)
    if (!entry) return null

    const values = Array.isArray(entry[1]) ? entry[1] : [entry[1]]
    return values.map((item) => createField(String(item ?? '')))
}

const compareValues = (raw, operator, target) => {
    const left = Number(raw)
    const right = Number(target)
    const numeric = raw.trim() !== '' && target.trim() !== '' && !Number.isNaN(left) && !Number.isNaN(right)
    const a = numeric ? left : raw.toLowerCase()
    const b = numeric ? right : target.toLowerCase()

    if (operator === '>') return a > b
    if (operator === '>=') return a >= b
    if (operator === '<') return a < b

    return a <= b
}

const unitsFor = (name, info) => ({
    [SEARCH_OPERATORS.LINE]: info.lines,
    [SEARCH_OPERATORS.BLOCK]: info.blocks,
    [SEARCH_OPERATORS.SECTION]: info.sections
}[name]())

const taskMatches = (name, status) => {
    if (name === SEARCH_OPERATORS.TASK_TODO) return status === TASK_STATUS_TODO
    if (name === SEARCH_OPERATORS.TASK_DONE) return TASK_STATUSES_DONE.includes(status)

    return true
}

const matchesText = (node, field, sensitive) => {
    if (node.phrase && field.wholeWord) return getWordRegex(node, sensitive).test(field.raw)

    return sensitive ? field.raw.includes(node.value) : field.lower.includes(node.lower)
}

const evaluate = (node, state) => {
    switch (node.type) {
        case SEARCH_NODE_TYPES.AND:
            return node.children.every((child) => evaluate(child, state))
        case SEARCH_NODE_TYPES.OR:
            return node.children.some((child) => evaluate(child, state))
        case SEARCH_NODE_TYPES.NOT:
            return !evaluate(node.child, state)
        case SEARCH_NODE_TYPES.TEXT:
            return state.fields.some((field) => matchesText(node, field, state.sensitive))
        case SEARCH_NODE_TYPES.REGEX: {
            const regex = state.sensitive ? node.regexes.sensitive : node.regexes.insensitive
            return state.fields.some((field) => regex.test(field.raw))
        }
        case SEARCH_NODE_TYPES.COMPARE:
            return state.fields.some((field) => compareValues(field.raw, node.operator, node.value))
        case SEARCH_NODE_TYPES.NULL:
            return state.fields.every((field) => field.raw.trim() === '')
        case SEARCH_NODE_TYPES.PROPERTY:
            return evaluateProperty(node, state)
        default:
            return evaluateFilter(node, state)
    }
}

const evaluateProperty = (node, state) => {
    const values = getPropertyValues(state.note, node.key)
    if (!values) return false
    if (!node.expression) return true

    const [first] = node.expression.children
    const isNull = node.expression.children.length === 1 && first.type === SEARCH_NODE_TYPES.NULL

    if (isNull) return values.length === 0 || values.every((field) => field.raw.trim() === '')

    return values.some((field) => evaluate(node.expression, { ...state, fields: [field] }))
}

const evaluateFilter = (node, state) => {
    const { name, argument } = node
    const { info, note, context } = state

    if (name === SEARCH_OPERATORS.FILE) return evaluate(argument, { ...state, fields: [info.filename] })
    if (name === SEARCH_OPERATORS.PATH) {
        return evaluate(argument, { ...state, fields: [getFullPath(note, info, context.notePaths)] })
    }
    if (name === SEARCH_OPERATORS.CONTENT) return evaluate(argument, { ...state, fields: [info.content] })
    if (name === SEARCH_OPERATORS.MATCH_CASE) return evaluate(argument, { ...state, sensitive: true })
    if (name === SEARCH_OPERATORS.IGNORE_CASE) return evaluate(argument, { ...state, sensitive: false })
    if (name === SEARCH_OPERATORS.TAG) {
        const target = getTagValue(argument)
        return getNoteTags(note).some((tag) => matchesTag(tag, target))
    }
    if (name === SEARCH_OPERATORS.IS) return argument.value === SEARCH_IS_VALUES.PINNED && context.pinned.has(note.path)
    if (name === SEARCH_OPERATORS.HAS) {
        return argument.value === SEARCH_HAS_VALUES.IMAGES ? info.hasImages() : info.hasFiles()
    }
    if (UNIT_OPERATORS.includes(name)) {
        return unitsFor(name, info).some((unit) => evaluate(argument, { ...state, fields: [unit] }))
    }

    return info.tasks().some(({ field, status }) => (
        taskMatches(name, status) && (!argument || evaluate(argument, { ...state, fields: [field] }))
    ))
}

const matchesNote = (note, ast, context) => {
    const info = getNoteInfo(note)

    return evaluate(ast, {
        note,
        info,
        context,
        sensitive: !!context.matchCase,
        fields: [info.title, info.filename, getFullPath(note, info, context.notePaths), info.content]
    })
}

export const filterNotes = (notes, ast, context) => (
    notes.filter((note) => matchesNote(note, ast, context))
)

export const searchNotes = (notes, ast, context, sort) => (
    sortNotes(filterNotes(notes, ast, context), sort)
)
