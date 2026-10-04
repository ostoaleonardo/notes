import { Facet } from '@codemirror/state'

import { getBlockSuggestions } from '@/utils/note-entries'

import { WIKI_LINK_FORMATS, WIKI_LINK_CLOSING } from '@/constants/wiki-links'
import { BLOCK_COMPLETION_PATTERN } from '@/constants/block-refs'

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

export const blockCompletionSource = (context) => {
    const match = context.matchBefore(BLOCK_COMPLETION_PATTERN)
    if (!match) return null

    const [, target, query] = BLOCK_COMPLETION_PATTERN.exec(match.text)
    const suggestions = getBlockSuggestions(context.state.facet(noteEntriesFacet), target, query)
    if (!suggestions.length) return null

    return {
        from: match.to - query.length,
        options: suggestions.map(({ id, preview }) => ({
            label: id,
            detail: preview,
            apply: (view, _completion, from, to) => {
                const doc = view.state.doc
                const hasClosing = doc.sliceString(to, to + WIKI_LINK_CLOSING.length) === WIKI_LINK_CLOSING
                const insert = hasClosing ? id : id + WIKI_LINK_CLOSING

                view.dispatch({
                    changes: { from, to, insert },
                    selection: { anchor: from + id.length + WIKI_LINK_CLOSING.length }
                })
            }
        }))
    }
}
