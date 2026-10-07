import { Facet } from '@codemirror/state'

import { TAG_TYPING_PATTERN, WHITESPACE_PATTERN } from '@/constants/markdown-patterns'

export const knownTagsFacet = Facet.define({
    combine: (values) => values[values.length - 1] || []
})

export const tagCompletionSource = (context) => {
    const match = context.matchBefore(TAG_TYPING_PATTERN)
    if (!match) return null

    const before = match.from > 0 ? context.state.sliceDoc(match.from - 1, match.from) : ''
    if (before && !WHITESPACE_PATTERN.test(before)) return null

    const query = match.text.slice(1).toLowerCase()

    const options = context.state.facet(knownTagsFacet)
        .filter((tag) => tag.toLowerCase().includes(query) && tag.toLowerCase() !== query)
        .map((tag) => ({
            label: tag,
            boost: tag.toLowerCase().startsWith(query) ? 1 : 0
        }))

    if (!options.length) return null

    return { from: match.from + 1, options }
}
