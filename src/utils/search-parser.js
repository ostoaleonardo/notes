import { LEADING_HASH_PATTERN, WHITESPACE_PATTERN } from '@/constants/markdown-patterns'
import {
    COMPARISON_OPERATORS,
    ESCAPE_CHAR,
    GROUP_BRACKETS,
    NEGATION_PREFIX,
    NULL_KEYWORD,
    OPERATOR_PREFIX_REGEX,
    OR_KEYWORD,
    PROPERTY_BRACKETS,
    PROPERTY_SEPARATOR,
    QUOTE_CHAR,
    REGEX_DELIMITER,
    REGEX_FLAGS,
    SEARCH_HAS_VALUES,
    SEARCH_IS_VALUES,
    SEARCH_NODE_TYPES,
    SEARCH_OPERATORS,
    SEARCH_OPERATOR_NAMES,
    TASK_OPERATORS
} from '@/constants/search-query'

const HAS_VALUE_LIST = Object.values(SEARCH_HAS_VALUES)
const IS_VALUE_LIST = Object.values(SEARCH_IS_VALUES)
const ARGUMENT_REQUIRED = SEARCH_OPERATOR_NAMES.filter((name) => !TASK_OPERATORS.includes(name))

const isSpace = (char) => char === undefined || WHITESPACE_PATTERN.test(char)

const compileRegexes = (source) => {
    try {
        return {
            insensitive: new RegExp(source, REGEX_FLAGS.INSENSITIVE),
            sensitive: new RegExp(source, REGEX_FLAGS.SENSITIVE)
        }
    } catch {
        return null
    }
}

const isValidArgument = (name, argument) => {
    if (!argument) return !ARGUMENT_REQUIRED.includes(name)
    if (name === SEARCH_OPERATORS.HAS) return HAS_VALUE_LIST.includes(argument.value)
    if (name === SEARCH_OPERATORS.IS) return IS_VALUE_LIST.includes(argument.value)
    if (name === SEARCH_OPERATORS.TAG) return argument.type === SEARCH_NODE_TYPES.TEXT && !!argument.value

    return true
}

const createParser = (source, { property = false } = {}) => {
    let pos = 0

    const createNode = (type, start, fields = {}) => ({
        type,
        start,
        end: pos,
        raw: source.slice(start, pos),
        ...fields
    })

    const createText = (value, start, phrase = false) => createNode(SEARCH_NODE_TYPES.TEXT, start, {
        value,
        phrase,
        lower: value.toLowerCase()
    })

    const skipSpace = () => {
        while (pos < source.length && isSpace(source[pos])) pos += 1
    }

    const atKeyword = () => {
        if (!source.startsWith(OR_KEYWORD, pos)) return false

        const next = source[pos + OR_KEYWORD.length]
        return isSpace(next) || next === GROUP_BRACKETS.OPEN
    }

    const readWord = () => {
        const start = pos

        while (
            pos < source.length
            && !isSpace(source[pos])
            && source[pos] !== GROUP_BRACKETS.OPEN
            && source[pos] !== GROUP_BRACKETS.CLOSE
        ) {
            pos += 1
        }

        return source.slice(start, pos)
    }

    const readQuoted = () => {
        let value = ''
        pos += 1

        while (pos < source.length && source[pos] !== QUOTE_CHAR) {
            const escaped = source[pos] === ESCAPE_CHAR && pos + 1 < source.length

            if (escaped) pos += 1

            value += source[pos]
            pos += 1
        }

        if (source[pos] === QUOTE_CHAR) pos += 1

        return value
    }

    const readRegex = () => {
        let index = pos + 1

        while (index < source.length && source[index] !== REGEX_DELIMITER) {
            index += source[index] === ESCAPE_CHAR ? 2 : 1
        }

        if (source[index] !== REGEX_DELIMITER) return null

        const regexes = compileRegexes(source.slice(pos + 1, index))
        const boundary = source[index + 1]

        if (!regexes || index === pos + 1) return null
        if (!isSpace(boundary) && boundary !== GROUP_BRACKETS.CLOSE) return null

        return { regexes, end: index + 1 }
    }

    const parseRegex = () => {
        const start = pos
        const found = readRegex()
        if (!found) return null

        pos = found.end
        return createNode(SEARCH_NODE_TYPES.REGEX, start, { regexes: found.regexes })
    }

    const parseWord = () => {
        const start = pos
        const word = readWord()

        if (property) {
            const operator = COMPARISON_OPERATORS.find((entry) => word.startsWith(entry))

            if (operator) {
                return createNode(SEARCH_NODE_TYPES.COMPARE, start, {
                    operator,
                    value: word.slice(operator.length)
                })
            }

            if (word.toLowerCase() === NULL_KEYWORD) return createNode(SEARCH_NODE_TYPES.NULL, start)
        }

        return createText(word, start)
    }

    const parseValue = () => {
        const start = pos

        if (source[pos] === QUOTE_CHAR) return createText(readQuoted(), start, true)

        return (source[pos] === REGEX_DELIMITER && parseRegex()) || parseWord()
    }

    const parseOperator = (name, start) => {
        let argument = null
        const char = source[pos]

        if (char === GROUP_BRACKETS.OPEN) {
            pos += 1
            argument = parseOr()
            if (source[pos] === GROUP_BRACKETS.CLOSE) pos += 1
        } else if (!isSpace(char) && char !== GROUP_BRACKETS.CLOSE) {
            argument = parseValue()
        }

        if (!isValidArgument(name, argument)) {
            pos = start
            return createText(readWord(), start)
        }

        return createNode(SEARCH_NODE_TYPES.FILTER, start, { name, argument })
    }

    const findPropertyEnd = () => {
        let depth = 0
        let quoted = false

        for (let index = pos; index < source.length; index += 1) {
            const char = source[index]

            if (char === QUOTE_CHAR) quoted = !quoted
            else if (!quoted && char === PROPERTY_BRACKETS.OPEN) depth += 1
            else if (!quoted && char === PROPERTY_BRACKETS.CLOSE) depth -= 1

            if (depth === 0) return index
        }

        return source.length
    }

    const splitProperty = (inner) => {
        let quoted = false

        for (let index = 0; index < inner.length; index += 1) {
            if (inner[index] === QUOTE_CHAR) quoted = !quoted
            if (!quoted && inner[index] === PROPERTY_SEPARATOR) {
                return [inner.slice(0, index), inner.slice(index + 1)]
            }
        }

        return [inner, null]
    }

    const parseProperty = () => {
        const start = pos
        const end = findPropertyEnd()
        const [key, valueSource] = splitProperty(source.slice(pos + 1, end))
        pos = Math.min(end + 1, source.length)

        const name = key.trim().toLowerCase()
        if (!name) return createText(source.slice(start, pos), start)

        const expression = valueSource === null ? null : createParser(valueSource, { property: true }).parse()
        const isEmpty = !expression || expression.children.length === 0

        return createNode(SEARCH_NODE_TYPES.PROPERTY, start, {
            key: name,
            expression: isEmpty ? null : expression
        })
    }

    const parsePrimary = () => {
        const start = pos
        const char = source[pos]

        if (char === GROUP_BRACKETS.OPEN) {
            pos += 1
            const group = parseOr()
            if (source[pos] === GROUP_BRACKETS.CLOSE) pos += 1
            return { ...group, start, end: pos, raw: source.slice(start, pos) }
        }

        if (char === PROPERTY_BRACKETS.OPEN) return parseProperty()
        if (char === QUOTE_CHAR) return createText(readQuoted(), start, true)
        if (char === REGEX_DELIMITER) return parseRegex() || parseWord()

        const prefix = OPERATOR_PREFIX_REGEX.exec(source.slice(pos))
        const name = prefix && prefix[1].toLowerCase()

        if (name && SEARCH_OPERATOR_NAMES.includes(name)) {
            pos += prefix[0].length
            return parseOperator(name, start)
        }

        return parseWord()
    }

    const parseUnary = () => {
        const start = pos
        const next = source[pos + 1]

        if (source[pos] === NEGATION_PREFIX && !isSpace(next) && next !== GROUP_BRACKETS.CLOSE) {
            pos += 1
            const child = parseUnary()
            return createNode(SEARCH_NODE_TYPES.NOT, start, { child })
        }

        return parsePrimary()
    }

    const parseAnd = () => {
        const start = pos
        const children = []

        for (;;) {
            skipSpace()

            if (pos >= source.length || source[pos] === GROUP_BRACKETS.CLOSE || atKeyword()) break

            children.push(parseUnary())
        }

        if (children.length === 1) return children[0]

        return createNode(SEARCH_NODE_TYPES.AND, start, { children })
    }

    const isEmptyAnd = (node) => node.type === SEARCH_NODE_TYPES.AND && node.children.length === 0

    function parseOr() {
        const start = pos
        const branches = [parseAnd()]

        skipSpace()

        while (atKeyword()) {
            pos += OR_KEYWORD.length
            branches.push(parseAnd())
            skipSpace()
        }

        const filled = branches.filter((branch) => !isEmptyAnd(branch))

        if (branches.length === 1) return branches[0]
        if (filled.length === 0) return createNode(SEARCH_NODE_TYPES.AND, start, { children: [] })
        if (filled.length === 1) return filled[0]

        return createNode(SEARCH_NODE_TYPES.OR, start, { children: filled })
    }

    const parse = () => {
        const children = []

        while (pos < source.length) {
            const node = parseOr()
            const nodes = node.type === SEARCH_NODE_TYPES.AND ? node.children : [node]
            children.push(...nodes)
            if (source[pos] === GROUP_BRACKETS.CLOSE) pos += 1
        }

        return {
            type: SEARCH_NODE_TYPES.AND,
            start: 0,
            end: source.length,
            raw: source,
            children
        }
    }

    return { parse }
}

export const parseSearchQuery = (query) => createParser(query).parse()

export const isEmptySearch = (ast) => ast.children.length === 0

export const getTagValue = (node) => node.value.toLowerCase().replace(LEADING_HASH_PATTERN, '')
