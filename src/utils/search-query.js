import { getTagValue, parseSearchQuery } from './search-parser'

import { LEADING_HASH_PATTERN, WHITESPACE_PATTERN } from '@/constants/markdown-patterns'
import {
    NEGATION_PREFIX,
    SEARCH_HAS_VALUES,
    SEARCH_IS_VALUES,
    SEARCH_NODE_TYPES,
    SEARCH_OPERATORS
} from '@/constants/search-query'

const FILTER_TYPES = [SEARCH_NODE_TYPES.FILTER, SEARCH_NODE_TYPES.PROPERTY]

const quoteIfNeeded = (value) => (WHITESPACE_PATTERN.test(value) ? `"${value}"` : value)

export const buildQualifier = (name, value) => `${name}:${quoteIfNeeded(value)}`

const splice = (query, start, end, insert = '') => (
    `${query.slice(0, start).trimEnd()} ${insert}${insert ? ' ' : ''}${query.slice(end).trimStart()}`.trim()
)

const appendToken = (query, token) => (query.trim() ? `${query.trim()} ${token}` : token)

const filterValue = (node) => {
    if (node.name === SEARCH_OPERATORS.TAG) return getTagValue(node.argument)

    return node.argument?.value?.toLowerCase() ?? null
}

const findFilter = (ast, name, value) => ast.children.find((node) => (
    node.type === SEARCH_NODE_TYPES.FILTER
    && node.name === name
    && (filterValue(node) ?? '') === value.toLowerCase().replace(LEADING_HASH_PATTERN, '')
))

export const toggleQualifier = (query, name, value) => {
    const existing = findFilter(parseSearchQuery(query), name, value)

    return existing
        ? splice(query, existing.start, existing.end)
        : appendToken(query, buildQualifier(name, value))
}

export const toggleTagQualifier = (query, tagName) => toggleQualifier(query, SEARCH_OPERATORS.TAG, tagName)

export const togglePinnedQualifier = (query) => (
    toggleQualifier(query, SEARCH_OPERATORS.IS, SEARCH_IS_VALUES.PINNED)
)

export const toggleImagesQualifier = (query) => (
    toggleQualifier(query, SEARCH_OPERATORS.HAS, SEARCH_HAS_VALUES.IMAGES)
)

export const toggleFilesQualifier = (query) => (
    toggleQualifier(query, SEARCH_OPERATORS.HAS, SEARCH_HAS_VALUES.FILES)
)

export const hasQualifier = (ast, name, value) => !!findFilter(ast, name, value)

export const getActiveTags = (ast) => ast.children
    .filter((node) => node.type === SEARCH_NODE_TYPES.FILTER && node.name === SEARCH_OPERATORS.TAG)
    .map(filterValue)

const getChipValue = (target) => {
    if (target.type === SEARCH_NODE_TYPES.PROPERTY) return target.raw.slice(1, -1)
    if (!target.argument) return null
    if (target.name === SEARCH_OPERATORS.TAG) return getTagValue(target.argument)

    return target.argument.value ?? target.argument.raw
}

const toChip = (node) => {
    const negate = node.type === SEARCH_NODE_TYPES.NOT
    const target = negate ? node.child : node

    if (!FILTER_TYPES.includes(target.type)) return null

    return {
        key: `${node.start}:${node.raw}`,
        group: target.type === SEARCH_NODE_TYPES.PROPERTY ? target.type : target.name,
        value: getChipValue(target),
        label: target.raw,
        negate,
        start: node.start,
        end: node.end
    }
}

export const getQueryChips = (ast) => ast.children.map(toChip).filter(Boolean)

export const groupChips = (chips) => {
    const groups = new Map()

    chips.forEach((chip) => groups.set(chip.group, [...(groups.get(chip.group) ?? []), chip]))

    return [...groups.values()]
}

export const removeChip = (query, chip) => splice(query, chip.start, chip.end)

export const toggleChipNegation = (query, chip) => {
    const token = chip.negate ? chip.label : `${NEGATION_PREFIX}${chip.label}`
    return splice(query, chip.start, chip.end, token)
}

export const addQualifier = (query, qualifier) => appendToken(query, qualifier)
