import { Facet } from '@codemirror/state'

export const noteTitlesFacet = Facet.define({
    combine: (values) => values[values.length - 1] || []
})

export const wikiLinkCompletionSource = (context) => {
    const match = context.matchBefore(/\[\[[^\]]*/)
    if (!match) return null

    const query = match.text.slice(2).toLowerCase()
    const titles = [...new Set(context.state.facet(noteTitlesFacet))]

    const options = titles
        .filter((title) => title.toLowerCase().includes(query))
        .map((title) => ({
            label: title,
            apply: `${title}]]`,
            boost: title.toLowerCase().startsWith(query) ? 1 : 0
        }))

    if (!options.length) return null

    return { from: match.from + 2, options }
}
