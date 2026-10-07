import {
    AUTO_PAIR_ACTIONS,
    AUTO_PAIR_CLOSER_PATTERN,
    AUTO_PAIR_EXPAND_CHARS,
    AUTO_PAIR_WORD_PATTERN
} from '@/constants/markdown-patterns'

export const getPairAction = ({ char, before, after, selected }) => {
    if (selected) return AUTO_PAIR_ACTIONS.WRAP

    const prev = before.slice(-1)
    const next = after.slice(0, 1)

    if (prev === char && next === char) {
        const lead = before.slice(-2, -1)
        const canExpand = AUTO_PAIR_EXPAND_CHARS.includes(char) && lead !== char && !AUTO_PAIR_WORD_PATTERN.test(lead)
        return canExpand ? AUTO_PAIR_ACTIONS.EXPAND : AUTO_PAIR_ACTIONS.SKIP
    }

    if (next === char) return AUTO_PAIR_ACTIONS.SKIP
    if (prev === char || AUTO_PAIR_WORD_PATTERN.test(prev)) return null
    if (!next || AUTO_PAIR_CLOSER_PATTERN.test(next)) return AUTO_PAIR_ACTIONS.PAIR

    return null
}

export const isEmptyPair = ({ char, before, after }) => (
    before.slice(-1) === char && after.slice(0, 1) === char
)
