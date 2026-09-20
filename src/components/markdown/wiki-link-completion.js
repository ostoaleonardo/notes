import { Facet } from '@codemirror/state'

import { WIKI_LINK_FORMATS } from '@/constants/wiki-links'

export const noteEntriesFacet = Facet.define({
    combine: (values) => values[values.length - 1] || []
})

export const wikiLinkFormatFacet = Facet.define({
    combine: (values) => values[values.length - 1] || WIKI_LINK_FORMATS.WIKILINK
})

export const wikiLinkCompletionSource = (context) => {
    const match = context.matchBefore(/\[\[[^\]]*/)
    if (!match) return null

    const query = match.text.slice(2).toLowerCase()
    const entries = context.state.facet(noteEntriesFacet)
    const format = context.state.facet(wikiLinkFormatFacet)

    const titleCounts = new Map()
    entries.forEach(({ title }) => {
        const key = title.toLowerCase()
        titleCounts.set(key, (titleCounts.get(key) || 0) + 1)
    })

    const seen = new Set()

    const options = entries
        .filter(({ title }) => title.toLowerCase().includes(query))
        .filter(({ title, path }) => {
            const key = `${title.toLowerCase()}|${path.toLowerCase()}`
            if (seen.has(key)) return false
            seen.add(key)
            return true
        })
        .map(({ id, title, path }) => {
            const isAmbiguous = titleCounts.get(title.toLowerCase()) > 1

            return {
                label: title,
                detail: isAmbiguous ? (path || undefined) : undefined,
                boost: title.toLowerCase().startsWith(query) ? 1 : 0,
                apply: (view, _completion, from, to) => {
                    const insertFrom = from - 2

                    const doc = view.state.doc
                    const afterCursor = doc.sliceString(to, Math.min(to + 2, doc.length))
                    const insertTo = afterCursor === ']]' ? to + 2 : to

                    const insertText = format === WIKI_LINK_FORMATS.MARKDOWN
                        ? `[${title}](wikilink://${id})`
                        : isAmbiguous && path
                            ? `[[${path}/${title}|${title}]]`
                            : `[[${title}]]`

                    view.dispatch({
                        changes: { from: insertFrom, to: insertTo, insert: insertText },
                        selection: { anchor: insertFrom + insertText.length }
                    })
                }
            }
        })

    if (!options.length) return null

    return { from: match.from + 2, options }
}
