import { Facet } from '@codemirror/state'

import { generateBlockId } from '@/features/editor/shared/utils/block-refs'
import { filterBlockSuggestions } from '@/features/editor/shared/utils/note-entries'

import { WIKI_LINK_FORMATS, WIKI_LINK_CLOSING, WIKI_LINK_TYPING_PATTERN } from '@/shared/constants/wiki-links'
import { BLOCK_COMPLETION_PATTERN } from '@/shared/constants/block-refs'
import { WIKI_LINK_OPEN, WIKI_LINK_CLOSE } from '@/shared/constants/markdown-syntax'

export const noteSearchFacet = Facet.define({
    combine: (values) => values[values.length - 1]
})

export const blockIdCreatorFacet = Facet.define({
    combine: (values) => values[values.length - 1]
})

export const blockLoaderFacet = Facet.define({
    combine: (values) => values[values.length - 1]
})

export const wikiLinkFormatFacet = Facet.define({
    combine: (values) => values[values.length - 1] || WIKI_LINK_FORMATS.WIKILINK
})

export const wikiLinkCompletionSource = async (context) => {
    const match = context.matchBefore(WIKI_LINK_TYPING_PATTERN)
    if (!match) return null

    const query = match.text.slice(WIKI_LINK_OPEN.length).toLowerCase()
    const searchNotes = context.state.facet(noteSearchFacet)?.current
    if (!searchNotes) return null

    const format = context.state.facet(wikiLinkFormatFacet)
    const matches = await searchNotes(query)
    if (context.aborted || !matches.length) return null

    const options = matches.map(({ id, title, path, ambiguous }) => ({
        label: title,
        detail: ambiguous ? (path || undefined) : undefined,
        boost: title.toLowerCase().startsWith(query) ? 1 : 0,
        apply: (view, _completion, from, to) => {
            const insertFrom = from - WIKI_LINK_OPEN.length

            const doc = view.state.doc
            const afterCursor = doc.sliceString(to, Math.min(to + WIKI_LINK_CLOSE.length, doc.length))
            const insertTo = afterCursor === WIKI_LINK_CLOSE ? to + WIKI_LINK_CLOSE.length : to

            const insertText = format === WIKI_LINK_FORMATS.MARKDOWN
                ? `[${title}](wikilink://${id})`
                : ambiguous && path
                    ? `${WIKI_LINK_OPEN}${path}/${title}|${title}${WIKI_LINK_CLOSE}`
                    : `${WIKI_LINK_OPEN}${title}${WIKI_LINK_CLOSE}`

            view.dispatch({
                changes: { from: insertFrom, to: insertTo, insert: insertText },
                selection: { anchor: insertFrom + insertText.length }
            })
        }
    }))

    return { from: match.from + WIKI_LINK_OPEN.length, options, filter: false }
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

export const blockCompletionSource = async (context) => {
    const match = context.matchBefore(BLOCK_COMPLETION_PATTERN)
    if (!match) return null

    const [, target, query] = BLOCK_COMPLETION_PATTERN.exec(match.text)
    const loadBlocks = context.state.facet(blockLoaderFacet)?.current
    if (!loadBlocks) return null

    const blocks = await loadBlocks(target)
    if (!blocks) return null

    const { path } = blocks
    const suggestions = filterBlockSuggestions(path, blocks, query)
    if (!suggestions.length) return null

    const taken = blocks.labeled.map(({ id }) => id)

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
                    const id = generateBlockId(taken)

                    applyBlockId(view, from, to, id)
                    view.state.facet(blockIdCreatorFacet)?.current?.({ path, index, preview, id })
                }
            }
        })
    }
}
