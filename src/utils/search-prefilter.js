import { getTagValue } from '@/utils/search-parser'

import {
    SEARCH_NODE_TYPES,
    SEARCH_OPERATORS,
    TASK_OPERATORS,
    UNIT_OPERATORS
} from '@/constants/search-query'
import {
    SEARCH_INDEX_ALL_FIELDS,
    SEARCH_INDEX_ASCII_PATTERN,
    SEARCH_INDEX_COLUMN_SEPARATOR,
    SEARCH_INDEX_COLUMNS,
    SEARCH_INDEX_ESCAPED_QUOTE,
    SEARCH_INDEX_FIELDS,
    SEARCH_INDEX_FORBIDDEN_TERM_CHARS,
    SEARCH_INDEX_KINDS,
    SEARCH_INDEX_LIKE_ESCAPE_PATTERN,
    SEARCH_INDEX_LIKE_ESCAPE_REPLACEMENT,
    SEARCH_INDEX_MIN_TERM_LENGTH,
    SEARCH_INDEX_NORMALIZATION_FORM,
    SEARCH_INDEX_QUOTE,
    SEARCH_INDEX_SQL,
    SEARCH_INDEX_TAG_CHILD_SUFFIX
} from '@/constants/search-index'

const CONTENT_ONLY = [SEARCH_INDEX_FIELDS.CONTENT]
const FILENAME_ONLY = [SEARCH_INDEX_FIELDS.FILENAME]

const combine = (kind, parts) => {
    if (parts.length === 0) return null
    if (parts.length === 1) return parts[0]

    return { kind, children: parts }
}

const isStableTerm = (value) => (
    [...value].length >= SEARCH_INDEX_MIN_TERM_LENGTH &&
    !SEARCH_INDEX_FORBIDDEN_TERM_CHARS.some((char) => value.includes(char)) &&
    value.toLowerCase().length === value.length &&
    value === value.normalize(SEARCH_INDEX_NORMALIZATION_FORM)
)

const mayMatchFolder = (value, folders) => {
    const lower = value.toLowerCase()
    return [...folders].some((folder) => folder.includes(lower))
}

const textRequirement = (node, fields, folders) => {
    if (!isStableTerm(node.value)) return null
    if (fields.includes(SEARCH_INDEX_FIELDS.PATH) && mayMatchFolder(node.value, folders)) return null

    const columns = [...new Set(fields.map((field) => SEARCH_INDEX_COLUMNS[field]).filter(Boolean))]
    if (columns.length === 0) return null

    return { kind: SEARCH_INDEX_KINDS.FTS, columns, term: node.value }
}

const tagRequirement = (argument) => {
    if (argument.type !== SEARCH_NODE_TYPES.TEXT) return null

    const name = getTagValue(argument)
    if (!name || !SEARCH_INDEX_ASCII_PATTERN.test(name)) return null

    return { kind: SEARCH_INDEX_KINDS.TAG, name }
}

const requirement = (node, fields, folders) => {
    switch (node.type) {
        case SEARCH_NODE_TYPES.AND:
            return combine(
                SEARCH_INDEX_KINDS.AND,
                node.children.map((child) => requirement(child, fields, folders)).filter(Boolean)
            )
        case SEARCH_NODE_TYPES.OR: {
            const parts = node.children.map((child) => requirement(child, fields, folders))
            return parts.every(Boolean) ? combine(SEARCH_INDEX_KINDS.OR, parts) : null
        }
        case SEARCH_NODE_TYPES.TEXT:
            return textRequirement(node, fields, folders)
        case SEARCH_NODE_TYPES.FILTER:
            return filterRequirement(node, fields, folders)
        default:
            return null
    }
}

const filterRequirement = ({ name, argument }, fields, folders) => {
    if (name === SEARCH_OPERATORS.FILE) return requirement(argument, FILENAME_ONLY, folders)
    if (name === SEARCH_OPERATORS.CONTENT) return requirement(argument, CONTENT_ONLY, folders)
    if (name === SEARCH_OPERATORS.MATCH_CASE || name === SEARCH_OPERATORS.IGNORE_CASE) {
        return requirement(argument, fields, folders)
    }
    if (name === SEARCH_OPERATORS.TAG) return tagRequirement(argument)

    const isUnit = UNIT_OPERATORS.includes(name) || TASK_OPERATORS.includes(name)
    return isUnit && argument ? requirement(argument, CONTENT_ONLY, folders) : null
}

export const buildPrefilter = (ast, folders) => requirement(ast, SEARCH_INDEX_ALL_FIELDS, folders)

const escapeLike = (value) => value.replace(SEARCH_INDEX_LIKE_ESCAPE_PATTERN, SEARCH_INDEX_LIKE_ESCAPE_REPLACEMENT)

const quote = (term) => (
    `${SEARCH_INDEX_QUOTE}${term.replaceAll(SEARCH_INDEX_QUOTE, SEARCH_INDEX_ESCAPED_QUOTE)}${SEARCH_INDEX_QUOTE}`
)

const phrase = ({ columns, term }) => `{${columns.join(SEARCH_INDEX_COLUMN_SEPARATOR)}} : ${quote(term)}`

const toMatch = (node) => {
    if (node.kind === SEARCH_INDEX_KINDS.FTS) return phrase(node)
    if (node.kind === SEARCH_INDEX_KINDS.TAG) return null

    const parts = node.children.map(toMatch)
    if (parts.includes(null)) return null

    const joiner = node.kind === SEARCH_INDEX_KINDS.AND ? SEARCH_INDEX_SQL.MATCH_AND : SEARCH_INDEX_SQL.MATCH_OR

    return `(${parts.join(joiner)})`
}

export const compilePrefilter = (tree) => {
    const params = []

    const build = (node) => {
        const match = toMatch(node)

        if (match) {
            params.push(match)
            return SEARCH_INDEX_SQL.FTS_LEAF
        }

        if (node.kind === SEARCH_INDEX_KINDS.TAG) {
            params.push(node.name, `${escapeLike(node.name)}${SEARCH_INDEX_TAG_CHILD_SUFFIX}`)
            return SEARCH_INDEX_SQL.TAG_LEAF
        }

        const joiner = node.kind === SEARCH_INDEX_KINDS.AND ? SEARCH_INDEX_SQL.INTERSECT : SEARCH_INDEX_SQL.UNION
        return `SELECT id FROM (${node.children.map(build).join(joiner)})`
    }

    const ids = build(tree)

    return { sql: `${SEARCH_INDEX_SQL.NOTES}(${ids}) LIMIT ?`, params }
}
