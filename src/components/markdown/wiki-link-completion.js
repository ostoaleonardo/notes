import { Facet } from '@codemirror/state'

import { generateBlockId } from '@/utils/block-refs'
import { getBlockSuggestions } from '@/utils/note-entries'

import { WIKI_LINK_FORMATS, WIKI_LINK_CLOSING, WIKI_LINK_TYPING_PATTERN } from '@/constants/wiki-links'
import { BLOCK_COMPLETION_PATTERN } from '@/constants/block-refs'
import { WIKI_LINK_OPEN, WIKI_LINK_CLOSE } from '@/constants/markdown-syntax'

export const noteEntriesFacet = Facet.define({
    combine: (values) => values[values.length - 1] || []
})

export const blockIdCreatorFacet = Facet.define({
    combine: (values) => values[values.length - 1]
})

export const wikiLinkFormatFacet = Facet.define({
    combine: (values) => values[values.length - 1] || WIKI_LINK_FORMATS.WIKILINK
})

export const wikiLinkCompletionSource = (context) => {
    const match = context.matchBefore(WIKI_LINK_TYPING_PATTERN)
    if (!match) return null

    const query = match.text.slice(WIKI_LINK_OPEN.length).toLowerCase()
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
                    const insertFrom = from - WIKI_LINK_OPEN.length

                    const doc = view.state.doc
                    const afterCursor = doc.sliceString(to, Math.min(to + WIKI_LINK_CLOSE.length, doc.length))
                    const insertTo = afterCursor === WIKI_LINK_CLOSE ? to + WIKI_LINK_CLOSE.length : to

                    const insertText = format === WIKI_LINK_FORMATS.MARKDOWN
                        ? `[${title}](wikilink://${id})`
                        : isAmbiguous && path
                            ? `${WIKI_LINK_OPEN}${path}/${title}|${title}${WIKI_LINK_CLOSE}`
                            : `${WIKI_LINK_OPEN}${title}${WIKI_LINK_CLOSE}`

                    view.dispatch({
                        changes: { from: insertFrom, to: insertTo, insert: insertText },
                        selection: { anchor: insertFrom + insertText.length }
                    })
                }
            }
        })

    if (!options.length) return null

    return { from: match.from + WIKI_LINK_OPEN.length, options }
}

const applyBlockId = (view, from, to, id) => {
    const doc = view.state.doc
    const hasClosing = doc.sliceString(to, to + WIKI_LINK_CLOSING.length) === WIKI_LINK_CLOSING
    const insert = hasClosing ? id : id + WIKI_LINK_CLOSING

    view.dispatch({
        changes: { from, to, insert },
        selection: { anchor: from + id.length + WIKI_LINK_CLOSING.length }
    })
}

export const blockCompletionSource = (context) => {
    const match = context.matchBefore(BLOCK_COMPLETION_PATTERN)
    if (!match) return null

    const [, target, query] = BLOCK_COMPLETION_PATTERN.exec(match.text)
    const entries = context.state.facet(noteEntriesFacet)
    const suggestions = getBlockSuggestions(entries, target, query)
    if (!suggestions.length) return null

    return {
        from: match.to - query.length,
        filter: false,
        options: suggestions.map((suggestion) => {
            if (suggestion.id) {
                return {
                    label: suggestion.id,
                    detail: suggestion.preview,
                    apply: (view, _completion, from, to) => applyBlockId(view, from, to, suggestion.id)
                }
            }

            const { path, index, preview } = suggestion

            return {
                label: preview,
                apply: (view, _completion, from, to) => {
                    const taken = entries.find((entry) => entry.id === path)?.blocks.map(({ id }) => id)
                    const id = generateBlockId(taken)

                    applyBlockId(view, from, to, id)
                    view.state.facet(blockIdCreatorFacet)?.current?.({ path, index, preview, id })
                }
            }
        })
    }
}
