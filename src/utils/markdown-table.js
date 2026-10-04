import {
    TABLE_ACTIONS,
    TABLE_ALIGNS,
    TABLE_AXES,
    TABLE_BODY_START_LINE,
    TABLE_PIPE
} from '../constants/table'

const splitRow = (line) => {
    const text = line.trim().replace(/^\|/, '').replace(/(?<!\\)\|$/, '')
    const cells = []
    let current = ''

    for (let i = 0; i < text.length; i++) {
        if (text[i] === '\\' && text[i + 1] === '|') {
            current += '\\|'
            i++
        } else if (text[i] === '|') {
            cells.push(current.trim())
            current = ''
        } else {
            current += text[i]
        }
    }

    cells.push(current.trim())
    return cells
}

const parseAlign = (cell) => {
    const left = cell.startsWith(':')
    const right = cell.endsWith(':')

    if (left && right) return TABLE_ALIGNS.CENTER
    if (right) return TABLE_ALIGNS.RIGHT
    if (left) return TABLE_ALIGNS.LEFT
    return TABLE_ALIGNS.NONE
}

const buildDelimiter = (align) => {
    switch (align) {
        case TABLE_ALIGNS.CENTER: return ':---:'
        case TABLE_ALIGNS.RIGHT: return '---:'
        case TABLE_ALIGNS.LEFT: return ':---'
        default: return '---'
    }
}

const getTableLines = (source) => {
    const lines = source.split('\n').filter((line) => line.trim())
    const end = lines.findIndex((line, index) => index >= TABLE_BODY_START_LINE && !line.includes(TABLE_PIPE))
    return end === -1 ? lines : lines.slice(0, end)
}

export const getTableLength = (source) => getTableLines(source).join('\n').length

export const parseTable = (source) => {
    const lines = getTableLines(source)
    if (lines.length < 2) return null

    const header = splitRow(lines[0])
    const delimiter = splitRow(lines[1])
    const body = lines.slice(2).map(splitRow)
    const rows = [header, ...body]
    const cols = Math.max(...rows.map((row) => row.length), delimiter.length)

    return {
        rows: rows.map((row) => Array.from({ length: cols }, (_, i) => row[i] ?? '')),
        aligns: Array.from({ length: cols }, (_, i) => parseAlign(delimiter[i] ?? ''))
    }
}

const escapeCell = (cell) => cell.replace(/\n/g, ' ').replace(/(?<!\\)\|/g, '\\|')

export const serializeTable = ({ rows, aligns }) => {
    const toLine = (cells) => `| ${cells.map(escapeCell).join(' | ')} |`
    const delimiter = `| ${aligns.map(buildDelimiter).join(' | ')} |`

    return [toLine(rows[0]), delimiter, ...rows.slice(1).map(toLine)].join('\n')
}

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

const swap = (list, from, to) => {
    const next = [...list]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    return next
}

export const insertRow = (table, index) => {
    const at = Math.max(1, clamp(index, 0, table.rows.length))
    const blank = table.aligns.map(() => '')
    return { ...table, rows: [...table.rows.slice(0, at), blank, ...table.rows.slice(at)] }
}

export const deleteRow = (table, index) => {
    if (index === 0 || table.rows.length <= 2) return table
    return { ...table, rows: table.rows.filter((_, i) => i !== index) }
}

export const moveRow = (table, index, offset) => {
    const target = index + offset
    if (target < 0 || target >= table.rows.length) return table
    return { ...table, rows: swap(table.rows, index, target) }
}

export const duplicateRow = (table, index) => {
    if (index === 0) return table
    const rows = [...table.rows]
    rows.splice(index + 1, 0, [...rows[index]])
    return { ...table, rows }
}

export const insertCol = (table, index) => {
    const at = clamp(index, 0, table.aligns.length)
    const add = (list, value) => [...list.slice(0, at), value, ...list.slice(at)]

    return {
        rows: table.rows.map((row) => add(row, '')),
        aligns: add(table.aligns, TABLE_ALIGNS.NONE)
    }
}

export const deleteCol = (table, index) => {
    if (table.aligns.length <= 1) return table
    const drop = (list) => list.filter((_, i) => i !== index)
    return { rows: table.rows.map(drop), aligns: drop(table.aligns) }
}

export const moveCol = (table, index, offset) => {
    const target = index + offset
    if (target < 0 || target >= table.aligns.length) return table
    return {
        rows: table.rows.map((row) => swap(row, index, target)),
        aligns: swap(table.aligns, index, target)
    }
}

export const duplicateCol = (table, index) => {
    const copy = (list) => [...list.slice(0, index + 1), list[index], ...list.slice(index + 1)]
    return { rows: table.rows.map(copy), aligns: copy(table.aligns) }
}

export const setAlign = (table, index, align) => ({
    ...table,
    aligns: table.aligns.map((current, i) => (i === index ? align : current))
})

export const setCell = (table, row, col, value) => ({
    ...table,
    rows: table.rows.map((cells, r) => (
        r === row ? cells.map((cell, c) => (c === col ? value : cell)) : cells
    ))
})

const AXIS_OPS = {
    [TABLE_AXES.ROW]: {
        insert: insertRow,
        move: moveRow,
        duplicate: duplicateRow,
        remove: deleteRow
    },
    [TABLE_AXES.COL]: {
        insert: insertCol,
        move: moveCol,
        duplicate: duplicateCol,
        remove: deleteCol
    }
}

export const moveTableItem = (table, axis, from, to) => AXIS_OPS[axis].move(table, from, to - from)

const ALIGN_BY_ACTION = {
    [TABLE_ACTIONS.ALIGN_LEFT]: TABLE_ALIGNS.LEFT,
    [TABLE_ACTIONS.ALIGN_CENTER]: TABLE_ALIGNS.CENTER,
    [TABLE_ACTIONS.ALIGN_RIGHT]: TABLE_ALIGNS.RIGHT
}

export const applyTableAction = (table, axis, index, action) => {
    const ops = AXIS_OPS[axis]

    switch (action) {
        case TABLE_ACTIONS.INSERT_BEFORE:
            return axis === TABLE_AXES.ROW && index === 0 ? table : ops.insert(table, index)
        case TABLE_ACTIONS.INSERT_AFTER:
            return ops.insert(table, index + 1)
        case TABLE_ACTIONS.MOVE_BEFORE:
            return ops.move(table, index, -1)
        case TABLE_ACTIONS.MOVE_AFTER:
            return ops.move(table, index, 1)
        case TABLE_ACTIONS.DUPLICATE:
            return ops.duplicate(table, index)
        case TABLE_ACTIONS.DELETE:
            return ops.remove(table, index)
        default:
            return axis === TABLE_AXES.COL && ALIGN_BY_ACTION[action]
                ? setAlign(table, index, ALIGN_BY_ACTION[action])
                : table
    }
}
