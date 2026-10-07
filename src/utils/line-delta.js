import { diffLineArrays } from './diff-lines'

import { VERSION_DIFF_MAX_CELLS } from '@/constants/default-values'
import { DIFF_TYPES } from '@/constants/diff'

const sharedPrefixLength = (a, b) => {
    let length = 0
    while (length < a.length && length < b.length && a[length] === b[length]) length++
    return length
}

const sharedSuffixLength = (a, b, prefix) => {
    let length = 0
    while (
        length < a.length - prefix &&
        length < b.length - prefix &&
        a[a.length - 1 - length] === b[b.length - 1 - length]
    ) length++
    return length
}

const diffToHunks = (ops, offset) => {
    const hunks = []
    let position = offset
    let current = null

    for (const op of ops) {
        if (op.type === DIFF_TYPES.UNCHANGED) {
            current = null
            position++
            continue
        }

        if (!current) {
            current = { at: position, remove: 0, insert: [] }
            hunks.push(current)
        }

        if (op.type === DIFF_TYPES.REMOVED) {
            current.remove++
            position++
        } else {
            current.insert.push(op.line)
        }
    }

    return hunks
}

export const buildLineDelta = (from, to) => {
    const a = from.split('\n')
    const b = to.split('\n')
    const prefix = sharedPrefixLength(a, b)
    const suffix = sharedSuffixLength(a, b, prefix)
    const middleA = a.slice(prefix, a.length - suffix)
    const middleB = b.slice(prefix, b.length - suffix)

    if (middleA.length === 0 && middleB.length === 0) return []

    if (middleA.length * middleB.length > VERSION_DIFF_MAX_CELLS) {
        return [{ at: prefix, remove: middleA.length, insert: middleB }]
    }

    return diffToHunks(diffLineArrays(middleA, middleB), prefix)
}

export const applyLineDelta = (text, delta) => {
    const lines = text.split('\n')
    let output = []
    let position = 0

    for (const { at, remove, insert } of delta) {
        output = output.concat(lines.slice(position, at), insert)
        position = at + remove
    }

    return output.concat(lines.slice(position)).join('\n')
}
